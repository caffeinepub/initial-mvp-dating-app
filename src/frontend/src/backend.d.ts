import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface PaymentMethodInput {
    nickname: string;
    last4: string;
    brand: string;
    expiry: string;
}
export interface Message {
    to: Principal;
    content: string;
    from: Principal;
    timestamp: bigint;
}
export interface DatingProfile {
    id: Principal;
    age: bigint;
    bio: string;
    displayName: string;
    interestedIn: Gender;
    gender: Gender;
    locationText: string;
    photos: Array<string>;
}
export interface PaymentMethod {
    id: string;
    nickname: string;
    createdAt: bigint;
    last4: string;
    brand: string;
    expiry: string;
}
export enum Gender {
    other = "other",
    female = "female",
    male = "male"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addPaymentMethod(input: PaymentMethodInput): Promise<string>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    blockUser(target: Principal): Promise<void>;
    getCallerUserProfile(): Promise<DatingProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDefaultPaymentMethod(): Promise<string | null>;
    getDiscoveryFeed(page: bigint, pageSize: bigint): Promise<Array<DatingProfile>>;
    getMessages(matchUser: Principal): Promise<Array<Message>>;
    getSavedPaymentMethods(): Promise<Array<PaymentMethod>>;
    getUserProfile(user: Principal): Promise<DatingProfile | null>;
    isBlocked(target: Principal): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    likeProfile(target: Principal): Promise<boolean>;
    removePaymentMethod(id: string): Promise<void>;
    saveCallerUserProfile(profile: DatingProfile): Promise<DatingProfile>;
    sendMessage(to: Principal, content: string): Promise<void>;
    setDefaultPaymentMethod(id: string): Promise<void>;
    unblockUser(target: Principal): Promise<void>;
    updatePaymentMethod(id: string, input: PaymentMethodInput): Promise<void>;
}
