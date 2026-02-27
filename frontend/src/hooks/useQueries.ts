import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import { Profile, Assignment, Round, Time } from '../backend';
import { Principal } from '@icp-sdk/core/principal';

// Enhanced error handling wrapper
const withErrorHandling = async <T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    console.error(`${operationName} failed:`, error);
    throw new Error(`${operationName} failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Profile queries
export function useUserProfile() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  
  return useQuery<Profile | null>({
    queryKey: ['userProfile', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return null;
      
      return withErrorHandling(async () => {
        return actor.getProfile(identity.getPrincipal());
      }, 'Get user profile');
    },
    enabled: !!actor && !!identity && !isFetching,
    retry: (failureCount, error) => {
      // Retry on connection errors, but not on business logic errors
      if (error.message.includes('Backend not available') || error.message.includes('unhealthy')) {
        return failureCount < 3;
      }
      return false;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
}

export function useSaveUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();
  
  return useMutation({
    mutationFn: async (profile: { name: string; wishList: string }) => {
      if (!actor) throw new Error('Backend not available - please wait for connection');
      
      return withErrorHandling(async () => {
        return actor.createOrUpdateProfile(profile.name, profile.wishList);
      }, 'Save user profile');
    },
    onSuccess: async () => {
      const userPrincipal = identity?.getPrincipal().toString();
      
      // Invalidate all related queries to ensure UI updates immediately
      // This includes the admin check since participant list changes may affect who is last
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['userProfile'] }),
        queryClient.invalidateQueries({ queryKey: ['participantNames'] }),
        queryClient.invalidateQueries({ queryKey: ['currentStage'] }),
        queryClient.invalidateQueries({ queryKey: ['myAssignment'] }),
        queryClient.invalidateQueries({ queryKey: ['isAdmin'] }),
      ]);
      
      // Ensure user profile and admin status are refetched with fresh data
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['userProfile', userPrincipal] }),
        queryClient.refetchQueries({ queryKey: ['isAdmin', userPrincipal] }),
      ]);
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
}

// Participants queries
export function useListParticipantNames() {
  const { actor, isFetching } = useActor();
  
  return useQuery<string[]>({
    queryKey: ['participantNames'],
    queryFn: async () => {
      if (!actor) throw new Error('Backend not available');
      
      return withErrorHandling(async () => {
        return actor.listParticipantNames();
      }, 'List participant names');
    },
    enabled: !!actor && !isFetching,
    retry: (failureCount, error) => {
      if (error.message.includes('Backend not available') || error.message.includes('unhealthy')) {
        return failureCount < 3;
      }
      return false;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
}

// Admin check - determines if current user is the last participant based on registrationTime
export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  
  return useQuery<boolean>({
    queryKey: ['isAdmin', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return false;
      
      return withErrorHandling(async () => {
        // Call backend to check if current user is admin
        return actor.isCallerAdmin();
      }, 'Check admin status');
    },
    enabled: !!actor && !!identity && !isFetching,
    staleTime: 0, // Always consider stale to ensure fresh checks after profile updates
    retry: (failureCount, error) => {
      if (error.message.includes('Backend not available') || error.message.includes('unhealthy')) {
        return failureCount < 3;
      }
      return false;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
}

// Stage detection - we'll infer the stage based on whether assignments exist
export function useCurrentStage() {
  const { actor, isFetching } = useActor();
  
  return useQuery<'submission' | 'resolution'>({
    queryKey: ['currentStage'],
    queryFn: async () => {
      if (!actor) throw new Error('Backend not available');
      
      return withErrorHandling(async () => {
        const stage = await actor.getStage();
        return stage === 'resolution' ? 'resolution' : 'submission';
      }, 'Get current stage');
    },
    enabled: !!actor && !isFetching,
    staleTime: 0, // Always consider data stale to ensure fresh checks
    retry: (failureCount, error) => {
      if (error.message.includes('Backend not available') || error.message.includes('unhealthy')) {
        return failureCount < 3;
      }
      return false;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
}

// Deadline queries
export function useGetDeadline() {
  const { actor, isFetching } = useActor();
  
  return useQuery<Time>({
    queryKey: ['deadline'],
    queryFn: async () => {
      if (!actor) throw new Error('Backend not available');
      
      return withErrorHandling(async () => {
        const deadline = await actor.getDeadline();
        // If no deadline is set (0), return default December 20 deadline
        if (deadline === 0n) {
          const currentYear = new Date().getFullYear();
          const defaultDate = new Date(currentYear, 11, 20, 23, 59, 59); // December 20, 11:59:59 PM
          return BigInt(defaultDate.getTime() * 1000000); // Convert to nanoseconds
        }
        return deadline;
      }, 'Get deadline');
    },
    enabled: !!actor && !isFetching,
    retry: (failureCount, error) => {
      if (error.message.includes('Backend not available') || error.message.includes('unhealthy')) {
        return failureCount < 3;
      }
      return false;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
}

// Assignment queries
export function useGetMyAssignment() {
  const { actor, isFetching } = useActor();
  
  return useQuery<Profile | null>({
    queryKey: ['myAssignment'],
    queryFn: async () => {
      if (!actor) throw new Error('Backend not available');
      
      return withErrorHandling(async () => {
        return actor.getMyAssignment();
      }, 'Get my assignment');
    },
    enabled: !!actor && !isFetching,
    retry: (failureCount, error) => {
      if (error.message.includes('Backend not available') || error.message.includes('unhealthy')) {
        return failureCount < 3;
      }
      return false;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
}

export function useGetAllAssignments() {
  const { actor, isFetching } = useActor();
  
  return useQuery<Assignment[]>({
    queryKey: ['allAssignments'],
    queryFn: async () => {
      if (!actor) throw new Error('Backend not available');
      
      return withErrorHandling(async () => {
        return actor.getAllAssignments();
      }, 'Get all assignments');
    },
    enabled: !!actor && !isFetching,
    retry: (failureCount, error) => {
      if (error.message.includes('Backend not available') || error.message.includes('unhealthy')) {
        return failureCount < 3;
      }
      return false;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
}

export function useGetAssignmentNames() {
  const { actor, isFetching } = useActor();
  
  return useQuery<[string, string][]>({
    queryKey: ['assignmentNames'],
    queryFn: async () => {
      if (!actor) throw new Error('Backend not available');
      
      return withErrorHandling(async () => {
        return actor.getAssignmentNames();
      }, 'Get assignment names');
    },
    enabled: !!actor && !isFetching,
    retry: (failureCount, error) => {
      if (error.message.includes('Backend not available') || error.message.includes('unhealthy')) {
        return failureCount < 3;
      }
      return false;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
}

export function useGetPastRounds() {
  const { actor, isFetching } = useActor();
  
  return useQuery<[Time, Round][]>({
    queryKey: ['pastRounds'],
    queryFn: async () => {
      if (!actor) throw new Error('Backend not available');
      
      return withErrorHandling(async () => {
        return actor.getPastRounds();
      }, 'Get past rounds');
    },
    enabled: !!actor && !isFetching,
    retry: (failureCount, error) => {
      if (error.message.includes('Backend not available') || error.message.includes('unhealthy')) {
        return failureCount < 3;
      }
      return false;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
}

// Deadline mutation - now available only to admin (last participant)
export function useSetDeadline() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();
  
  return useMutation({
    mutationFn: async (deadline: Time) => {
      if (!actor) throw new Error('Backend not available');
      
      return withErrorHandling(async () => {
        return await actor.setDeadline(deadline);
      }, 'Set deadline');
    },
    onSuccess: async () => {
      const userPrincipal = identity?.getPrincipal().toString();
      
      // Invalidate and refetch deadline and admin status
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['deadline'] }),
        queryClient.invalidateQueries({ queryKey: ['isAdmin'] }),
      ]);
      
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['deadline'] }),
        queryClient.refetchQueries({ queryKey: ['isAdmin', userPrincipal] }),
      ]);
    },
    retry: (failureCount, error) => {
      // Retry on connection errors
      if (error.message.includes('Backend not available') || error.message.includes('unhealthy')) {
        return failureCount < 3;
      }
      return false;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
}

export function useTriggerResolution() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();
  
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Backend not available');
      
      return withErrorHandling(async () => {
        try {
          await actor.triggerResolution();
          
          // Add a small delay to ensure backend state is fully committed
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          // Provide user-friendly error messages
          if (error instanceof Error) {
            if (error.message.includes('At least 2 profiles')) {
              throw new Error('At least 2 participants are required to trigger resolution.');
            }
          }
          throw error;
        }
      }, 'Trigger resolution');
    },
    onSuccess: async () => {
      const userPrincipal = identity?.getPrincipal().toString();
      
      // First, invalidate all relevant queries including admin status
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['currentStage'] }),
        queryClient.invalidateQueries({ queryKey: ['myAssignment'] }),
        queryClient.invalidateQueries({ queryKey: ['allAssignments'] }),
        queryClient.invalidateQueries({ queryKey: ['assignmentNames'] }),
        queryClient.invalidateQueries({ queryKey: ['participantNames'] }),
        queryClient.invalidateQueries({ queryKey: ['userProfile'] }),
        queryClient.invalidateQueries({ queryKey: ['isAdmin'] }),
      ]);
      
      // Then force immediate refetch of critical queries to ensure UI updates
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['currentStage'] }),
        queryClient.refetchQueries({ queryKey: ['myAssignment'] }),
        queryClient.refetchQueries({ queryKey: ['allAssignments'] }),
        queryClient.refetchQueries({ queryKey: ['assignmentNames'] }),
        queryClient.refetchQueries({ queryKey: ['isAdmin', userPrincipal] }),
      ]);
    },
    retry: (failureCount, error) => {
      // Don't retry business logic errors
      if (error.message.includes('participants')) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
}

export function useResetRound() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();
  
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Backend not available');
      
      return withErrorHandling(async () => {
        return await actor.resetRound();
      }, 'Reset round');
    },
    onSuccess: async () => {
      const userPrincipal = identity?.getPrincipal().toString();
      
      // Clear all cached data first
      queryClient.clear();
      
      // Then refetch critical queries to get fresh data, including admin status
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['currentStage'] }),
        queryClient.refetchQueries({ queryKey: ['participantNames'] }),
        queryClient.refetchQueries({ queryKey: ['userProfile', userPrincipal] }),
        queryClient.refetchQueries({ queryKey: ['deadline'] }),
        queryClient.refetchQueries({ queryKey: ['isAdmin', userPrincipal] }),
      ]);
    },
    retry: (failureCount, error) => {
      // Retry on connection errors
      if (error.message.includes('Backend not available') || error.message.includes('unhealthy')) {
        return failureCount < 3;
      }
      return false;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
}

export function useRollbackToSubmission() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();
  
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Backend not available');
      
      return withErrorHandling(async () => {
        return await actor.rollbackToSubmissionStage();
      }, 'Rollback to submission stage');
    },
    onSuccess: async () => {
      const userPrincipal = identity?.getPrincipal().toString();
      
      // Invalidate all relevant queries to ensure UI updates immediately, including admin status
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['currentStage'] }),
        queryClient.invalidateQueries({ queryKey: ['myAssignment'] }),
        queryClient.invalidateQueries({ queryKey: ['allAssignments'] }),
        queryClient.invalidateQueries({ queryKey: ['assignmentNames'] }),
        queryClient.invalidateQueries({ queryKey: ['participantNames'] }),
        queryClient.invalidateQueries({ queryKey: ['userProfile'] }),
        queryClient.invalidateQueries({ queryKey: ['isAdmin'] }),
      ]);
      
      // Force refetch of critical queries to ensure immediate UI update
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['currentStage'] }),
        queryClient.refetchQueries({ queryKey: ['myAssignment'] }),
        queryClient.refetchQueries({ queryKey: ['assignmentNames'] }),
        queryClient.refetchQueries({ queryKey: ['isAdmin', userPrincipal] }),
      ]);
    },
    retry: (failureCount, error) => {
      // Retry on connection errors
      if (error.message.includes('Backend not available') || error.message.includes('unhealthy')) {
        return failureCount < 3;
      }
      return false;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
}

export function useDeletePastRound() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (timestamp: Time) => {
      if (!actor) throw new Error('Backend not available');
      
      return withErrorHandling(async () => {
        try {
          return await actor.deletePastRound(timestamp);
        } catch (error) {
          // If backend admin check fails, provide user-friendly message
          if (error instanceof Error && error.message.includes('Only admin')) {
            throw new Error('Admin privileges required. Only the last participant can delete past rounds.');
          }
          throw error;
        }
      }, 'Delete past round');
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['pastRounds'] });
      await queryClient.refetchQueries({ queryKey: ['pastRounds'] });
    },
    retry: (failureCount, error) => {
      // Don't retry admin permission errors
      if (error.message.includes('Admin') || error.message.includes('privileges')) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
}

// Delete participant mutation - now uses backend's deleteParticipantByName function
export function useDeleteParticipant() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();
  
  return useMutation({
    mutationFn: async (participantName: string) => {
      if (!actor) throw new Error('Backend not available');
      
      return withErrorHandling(async () => {
        // Use the backend's deleteParticipantByName function
        return await actor.deleteParticipantByName(participantName);
      }, 'Delete participant');
    },
    onSuccess: async () => {
      const userPrincipal = identity?.getPrincipal().toString();
      
      // Invalidate all relevant queries to ensure UI updates immediately
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['participantNames'] }),
        queryClient.invalidateQueries({ queryKey: ['userProfile'] }),
        queryClient.invalidateQueries({ queryKey: ['isAdmin'] }),
        queryClient.invalidateQueries({ queryKey: ['currentStage'] }),
        queryClient.invalidateQueries({ queryKey: ['allAssignments'] }),
        queryClient.invalidateQueries({ queryKey: ['assignmentNames'] }),
      ]);
      
      // Force refetch of critical queries
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['participantNames'] }),
        queryClient.refetchQueries({ queryKey: ['isAdmin', userPrincipal] }),
      ]);
    },
    retry: (failureCount, error) => {
      // Don't retry admin permission errors
      if (error.message.includes('Unauthorized') || error.message.includes('cannot delete')) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
}
