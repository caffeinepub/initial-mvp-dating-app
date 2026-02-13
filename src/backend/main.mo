import Map "mo:core/Map";
import Set "mo:core/Set";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Types
  public type Gender = { #male; #female; #other };
  public type DatingProfile = {
    id : Principal;
    displayName : Text;
    age : Nat;
    bio : Text;
    gender : Gender;
    interestedIn : Gender;
    locationText : Text;
    photos : [Text];
  };

  module DatingProfile {
    public func compare(a : DatingProfile, b : DatingProfile) : Order.Order {
      Text.compare(a.displayName, b.displayName);
    };
  };

  public type Like = {
    timestamp : Int;
    from : Principal;
    to : Principal;
  };

  public type Match = {
    user1 : Principal;
    user2 : Principal;
    timestamp : Int;
  };

  public type Message = {
    from : Principal;
    to : Principal;
    content : Text;
    timestamp : Int;
  };

  public type PaymentMethod = {
    id : Text;
    nickname : Text;
    brand : Text;
    last4 : Text;
    expiry : Text;
    createdAt : Int;
  };

  public type PaymentMethodInput = {
    nickname : Text;
    brand : Text;
    last4 : Text;
    expiry : Text;
  };

  // Auth and state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Storage
  let profiles = Map.empty<Principal, DatingProfile>();
  let likes = Map.empty<Principal, Set.Set<Principal>>();
  let matches = Map.empty<Principal, Set.Set<Principal>>();
  let matchTimestamps = Map.empty<Principal, Map.Map<Principal, Int>>();
  let blocks = Map.empty<Principal, Set.Set<Principal>>();
  let messages = Map.empty<Text, [Message]>();
  var messageId = 0;

  // Payment data
  let savedPaymentMethods = Map.empty<Principal, Map.Map<Text, PaymentMethod>>();
  let defaultPaymentMethods = Map.empty<Principal, Text>();

  // Profile Management
  public shared ({ caller }) func saveCallerUserProfile(profile : DatingProfile) : async DatingProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };

    let updatedProfile : DatingProfile = { profile with id = caller };
    profiles.add(caller, updatedProfile);
    updatedProfile;
  };

  public query ({ caller }) func getCallerUserProfile() : async ?DatingProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    profiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?DatingProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    profiles.get(user);
  };

  // Feed APIs
  public query ({ caller }) func getDiscoveryFeed(page : Nat, pageSize : Nat) : async [DatingProfile] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view discovery feed");
    };

    let allProfiles = profiles.entries().toArray();

    let filtered = allProfiles.filter(
      func(entry) {
        let (_, profile) = entry;
        profile.id != caller and
        not hasBlockedOrBeenBlocked(caller, profile.id) and
        not hasAlreadyLikedOrPassed(caller, profile.id)
      }
    ).map(func(entry) { entry.1 });

    let sorted = filtered.sort();
    let start = Nat.min(page * pageSize, sorted.size());
    let end = Nat.min(start + pageSize, sorted.size());

    Array.tabulate<DatingProfile>(
      end - start,
      func(i) { sorted[start + i] }
    );
  };

  func hasAlreadyLikedOrPassed(caller : Principal, other : Principal) : Bool {
    switch (likes.get(caller)) {
      case (?set) { set.contains(other) };
      case (null) { false };
    };
  };

  func hasBlockedOrBeenBlocked(caller : Principal, other : Principal) : Bool {
    switch (blocks.get(caller), blocks.get(other)) {
      case (?set1, ?set2) { set1.contains(other) or set2.contains(caller) };
      case (?set, null) { set.contains(other) };
      case (null, ?set) { set.contains(caller) };
      case (null, null) { false };
    };
  };

  // Like/Pass & Matching
  public shared ({ caller }) func likeProfile(target : Principal) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can like other profiles");
    };

    if (caller == target) {
      Runtime.trap("Cannot like your own profile");
    };

    if (hasBlockedOrBeenBlocked(caller, target)) {
      Runtime.trap("Cannot like blocked users");
    };

    let now = 0;

    switch (likes.get(target)) {
      case (?targetLikes) {
        if (targetLikes.contains(caller)) {
          createMatch(caller, target, now);
          return true;
        };
      };
      case (null) {};
    };

    let callerLikes = switch (likes.get(caller)) {
      case (?existing) { existing };
      case (null) { Set.empty<Principal>() };
    };
    callerLikes.add(target);
    likes.add(caller, callerLikes);

    false;
  };

  func createMatch(user1 : Principal, user2 : Principal, timestamp : Int) {
    let user1Matches = switch (matches.get(user1)) {
      case (?existing) { existing };
      case (null) { Set.empty<Principal>() };
    };
    user1Matches.add(user2);
    matches.add(user1, user1Matches);

    let user2Matches = switch (matches.get(user2)) {
      case (?existing) { existing };
      case (null) { Set.empty<Principal>() };
    };
    user2Matches.add(user1);
    matches.add(user2, user2Matches);

    let user1Map = switch (matchTimestamps.get(user1)) {
      case (?existing) { existing };
      case (null) { Map.empty<Principal, Int>() };
    };
    user1Map.add(user2, timestamp);
    matchTimestamps.add(user1, user1Map);

    let user2Map = switch (matchTimestamps.get(user2)) {
      case (?existing) { existing };
      case (null) { Map.empty<Principal, Int>() };
    };
    user2Map.add(user1, timestamp);
    matchTimestamps.add(user2, user2Map);
  };

  // Messaging
  public shared ({ caller }) func sendMessage(to : Principal, content : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send messages");
    };

    if (hasBlockedOrBeenBlocked(caller, to)) {
      Runtime.trap("Cannot send messages to blocked users");
    };

    if (not isMatch(caller, to)) {
      Runtime.trap("Can only message matched users");
    };

    let msg : Message = {
      from = caller;
      to;
      content;
      timestamp = 0;
    };

    let threadKey = getThreadKey(caller, to);
    let threadMessages = switch (messages.get(threadKey)) {
      case (?existing) { existing };
      case (null) { [] };
    };

    messages.add(threadKey, threadMessages.concat([msg]));
  };

  func isMatch(user1 : Principal, user2 : Principal) : Bool {
    switch (matches.get(user1)) {
      case (?set) { set.contains(user2) };
      case (null) { false };
    };
  };

  func getThreadKey(user1 : Principal, user2 : Principal) : Text {
    let p1 = user1.toText();
    let p2 = user2.toText();
    if (Text.compare(p1, p2) == #less) {
      p1 # "|" # p2;
    } else {
      p2 # "|" # p1;
    };
  };

  public query ({ caller }) func getMessages(matchUser : Principal) : async [Message] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can fetch messages");
    };

    if (not isMatch(caller, matchUser)) {
      Runtime.trap("Can only view messages with matched users");
    };

    let threadKey = getThreadKey(caller, matchUser);
    switch (messages.get(threadKey)) {
      case (?msgs) { msgs };
      case (null) { [] };
    };
  };

  // Block Management
  public shared ({ caller }) func blockUser(target : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can block other users");
    };

    let existingBlocks = switch (blocks.get(caller)) {
      case (?b) { b };
      case (null) { Set.empty<Principal>() };
    };
    existingBlocks.add(target);
    blocks.add(caller, existingBlocks);
  };

  public shared ({ caller }) func unblockUser(target : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can unblock other users");
    };

    let existingBlocks = switch (blocks.get(caller)) {
      case (?b) { b };
      case (null) { Set.empty<Principal>() };
    };
    existingBlocks.remove(target);
    blocks.add(caller, existingBlocks);
  };

  public query ({ caller }) func isBlocked(target : Principal) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can fetch block status");
    };
    switch (blocks.get(caller)) {
      case (?set) { set.contains(target) };
      case (null) { false };
    };
  };

  // Payment Methods CRUD
  public shared ({ caller }) func addPaymentMethod(input : PaymentMethodInput) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can manage payment methods");
    };

    // Check for unique last4
    let userMethods = switch (savedPaymentMethods.get(caller)) {
      case (?methods) { methods };
      case (null) { Map.empty<Text, PaymentMethod>() };
    };
    let duplicate = userMethods.values().any(func(pm) { pm.last4 == input.last4 });
    if (duplicate) {
      Runtime.trap("Card with last 4 digits already exists");
    };

    let id = input.nickname # "_" # input.last4;
    let newMethod : PaymentMethod = {
      id;
      nickname = input.nickname;
      brand = input.brand;
      last4 = input.last4;
      expiry = input.expiry;
      createdAt = 0;
    };

    userMethods.add(id, newMethod);
    savedPaymentMethods.add(caller, userMethods);

    if (userMethods.size() == 1) {
      defaultPaymentMethods.add(caller, id);
    };
    id;
  };

  public shared ({ caller }) func updatePaymentMethod(id : Text, input : PaymentMethodInput) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can manage payment methods");
    };
    let userMethods = switch (savedPaymentMethods.get(caller)) {
      case (?methods) { methods };
      case (null) { Map.empty<Text, PaymentMethod>() };
    };

    switch (userMethods.get(id)) {
      case (?existing) {
        let updatedMethod = {
          id;
          nickname = input.nickname;
          brand = input.brand;
          last4 = input.last4;
          expiry = input.expiry;
          createdAt = existing.createdAt;
        };
        userMethods.add(id, updatedMethod);
        savedPaymentMethods.add(caller, userMethods);
      };
      case (null) { Runtime.trap("Payment method not found") };
    };
  };

  public shared ({ caller }) func removePaymentMethod(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can manage payment methods");
    };

    let userMethods = switch (savedPaymentMethods.get(caller)) {
      case (?methods) { methods };
      case (null) { Map.empty<Text, PaymentMethod>() };
    };
    if (not userMethods.containsKey(id)) {
      Runtime.trap("Payment method not found");
    };
    userMethods.remove(id);
    savedPaymentMethods.add(caller, userMethods);

    switch (defaultPaymentMethods.get(caller)) {
      case (?defaultId) {
        if (defaultId == id) {
          defaultPaymentMethods.remove(caller);
        };
      };
      case (null) {};
    };
  };

  public shared ({ caller }) func setDefaultPaymentMethod(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can manage payment methods");
    };

    switch (savedPaymentMethods.get(caller)) {
      case (?methods) {
        if (methods.containsKey(id)) {
          defaultPaymentMethods.add(caller, id);
        } else {
          Runtime.trap("Payment method not found");
        };
      };
      case (null) { Runtime.trap("No payment methods found") };
    };
  };

  public query ({ caller }) func getSavedPaymentMethods() : async [PaymentMethod] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view payment methods");
    };

    let userMethods = switch (savedPaymentMethods.get(caller)) {
      case (?methods) { methods };
      case (null) { Map.empty<Text, PaymentMethod>() };
    };
    userMethods.values().toArray();
  };

  public query ({ caller }) func getDefaultPaymentMethod() : async ?Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view payment methods");
    };

    defaultPaymentMethods.get(caller);
  };
};
