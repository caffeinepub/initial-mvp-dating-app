import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { DatingProfile, PaymentMethod, PaymentMethodInput, Message } from '@/backend';
import type { Principal } from '@icp-sdk/core/principal';
import { toast } from 'sonner';

// Profile queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<DatingProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched
  };
}

export function useGetUserProfile(userId: Principal) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<DatingProfile | null>({
    queryKey: ['userProfile', userId.toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getUserProfile(userId);
    },
    enabled: !!actor && !actorFetching
  });
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: DatingProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    }
  });
}

// Discovery queries
export function useGetDiscoveryFeed() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<DatingProfile[]>({
    queryKey: ['discoveryFeed'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getDiscoveryFeed(BigInt(0), BigInt(50));
    },
    enabled: !!actor && !actorFetching
  });
}

export function useLikeProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (targetId: Principal) => {
      if (!actor) throw new Error('Actor not available');
      const isMatch = await actor.likeProfile(targetId);
      if (isMatch) {
        toast.success("It's a match! 🎉", {
          description: 'You can now start chatting!'
        });
      }
      return isMatch;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discoveryFeed'] });
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    }
  });
}

// Matches queries
export function useGetMatches() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Principal[]>({
    queryKey: ['matches'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const profile = await actor.getCallerUserProfile();
      if (!profile) return [];
      
      const allProfiles = await actor.getDiscoveryFeed(BigInt(0), BigInt(1000));
      return [];
    },
    enabled: !!actor && !actorFetching
  });
}

// Messages queries
export function useGetMessages(matchUser: Principal | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Message[]>({
    queryKey: ['messages', matchUser?.toString()],
    queryFn: async () => {
      if (!actor || !matchUser) throw new Error('Actor or match user not available');
      return actor.getMessages(matchUser);
    },
    enabled: !!actor && !actorFetching && !!matchUser,
    refetchInterval: 3000
  });
}

export function useSendMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ to, content }: { to: Principal; content: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.sendMessage(to, content);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.to.toString()] });
    }
  });
}

// Block queries
export function useBlockUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (targetId: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.blockUser(targetId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discoveryFeed'] });
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    }
  });
}

export function useUnblockUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (targetId: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.unblockUser(targetId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discoveryFeed'] });
    }
  });
}

export function useIsBlocked(targetId: Principal | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isBlocked', targetId?.toString()],
    queryFn: async () => {
      if (!actor || !targetId) throw new Error('Actor or target not available');
      return actor.isBlocked(targetId);
    },
    enabled: !!actor && !actorFetching && !!targetId
  });
}

// Payment Methods queries
export function useGetSavedPaymentMethods() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<PaymentMethod[]>({
    queryKey: ['paymentMethods'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getSavedPaymentMethods();
    },
    enabled: !!actor && !actorFetching
  });
}

export function useGetDefaultPaymentMethod() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<string | null>({
    queryKey: ['defaultPaymentMethod'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getDefaultPaymentMethod();
    },
    enabled: !!actor && !actorFetching
  });
}

export function useAddPaymentMethod() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: PaymentMethodInput) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addPaymentMethod(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentMethods'] });
      queryClient.invalidateQueries({ queryKey: ['defaultPaymentMethod'] });
    }
  });
}

export function useUpdatePaymentMethod() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: PaymentMethodInput }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updatePaymentMethod(id, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentMethods'] });
      queryClient.invalidateQueries({ queryKey: ['defaultPaymentMethod'] });
    }
  });
}

export function useRemovePaymentMethod() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.removePaymentMethod(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentMethods'] });
      queryClient.invalidateQueries({ queryKey: ['defaultPaymentMethod'] });
    }
  });
}

export function useSetDefaultPaymentMethod() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setDefaultPaymentMethod(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['defaultPaymentMethod'] });
    }
  });
}

// Admin queries
export function useIsCallerAdmin() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.isCallerAdmin();
      } catch (error) {
        return false;
      }
    },
    enabled: !!actor && !actorFetching,
    retry: false
  });
}
