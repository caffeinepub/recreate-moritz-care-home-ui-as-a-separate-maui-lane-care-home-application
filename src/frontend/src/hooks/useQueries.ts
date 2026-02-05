import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import { Principal } from '@dfinity/principal';
import { residentQueryKeys } from './residentQueryKeys';
import type { 
  VitalsRecord, 
  MarRecord, 
  AdlRecord, 
  ResidentId, 
  Resident, 
  ResidentCreateRequest,
  ResidentUpdateRequest,
  UserProfile,
  ResidentsDirectoryResponse,
  ResidentDirectoryEntry
} from '../backend';

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Residents Seeding Hook
/**
 * Ensures sample residents are seeded for the authenticated user.
 * This hook is idempotent - it only seeds once per user.
 */
export function useEnsureResidentsSeeded() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  const principalId = identity?.getPrincipal().toString();

  const query = useQuery({
    queryKey: ['residentsSeedStatus', principalId || 'anonymous'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      await actor.ensureResidentsSeeded();
      return { seeded: true };
    },
    enabled: !!actor && !actorFetching && !!identity,
    retry: false,
    staleTime: Infinity, // Never refetch - seeding is idempotent
  });

  return query;
}

// Residents Directory Queries

/**
 * Lightweight residents directory query for Dashboard listing.
 * Uses optimized backend endpoint with reduced payload and aggressive caching.
 */
export function useGetResidentsDirectory(options?: { enabled?: boolean }) {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  const principalId = identity?.getPrincipal().toString();

  const query = useQuery<ResidentsDirectoryResponse>({
    queryKey: residentQueryKeys.directory(principalId || 'anonymous'),
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      
      // Development-only timing
      const fetchStartTime = performance.now();
      
      const response = await actor.getResidentsDirectory();
      
      const fetchDuration = performance.now() - fetchStartTime;
      
      // Development-only diagnostics
      if (import.meta.env.DEV) {
        console.log('[Residents Directory Performance]', {
          frontendFetchMs: fetchDuration.toFixed(2),
          backendQueryMs: (Number(response.directoryLoadPerformance.backendQueryTimeNanos) / 1_000_000).toFixed(2),
          totalRequestMs: (Number(response.directoryLoadPerformance.totalRequestTimeNanos) / 1_000_000).toFixed(2),
          residentCount: Number(response.directoryLoadPerformance.residentCount),
        });
      }
      
      return response;
    },
    enabled: (options?.enabled ?? true) && !!actor && !actorFetching && !!identity,
    retry: false,
    // Cache for 30 seconds to avoid refetching when navigating back to Dashboard
    staleTime: 30_000,
    // Disable automatic refetching on window focus/reconnect
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useListActiveResidents() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  const principalId = identity?.getPrincipal().toString();

  const query = useQuery<Resident[]>({
    queryKey: residentQueryKeys.list(principalId || 'anonymous'),
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.listActiveResidents();
    },
    enabled: !!actor && !actorFetching && !!identity,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useGetResident(residentId: ResidentId | null) {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  const principalId = identity?.getPrincipal().toString();

  const query = useQuery<Resident | null>({
    queryKey: residentQueryKeys.detail(principalId || 'anonymous', residentId?.toString() || ''),
    queryFn: async () => {
      if (!actor || !residentId) throw new Error('Actor or residentId not available');
      return actor.getResident(residentId);
    },
    enabled: !!actor && !actorFetching && !!identity && !!residentId,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useCreateResident() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: ResidentCreateRequest) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createResident(request);
    },
    onSuccess: () => {
      const principalId = identity?.getPrincipal().toString();
      if (principalId) {
        queryClient.invalidateQueries({ queryKey: residentQueryKeys.list(principalId) });
        queryClient.invalidateQueries({ queryKey: residentQueryKeys.directory(principalId) });
      }
    },
  });
}

export function useUpdateResident() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updateRequest }: { id: ResidentId; updateRequest: ResidentUpdateRequest }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateResident(id, updateRequest);
    },
    onSuccess: (_, variables) => {
      const principalId = identity?.getPrincipal().toString();
      if (principalId) {
        queryClient.invalidateQueries({ queryKey: residentQueryKeys.list(principalId) });
        queryClient.invalidateQueries({ queryKey: residentQueryKeys.directory(principalId) });
        queryClient.invalidateQueries({ queryKey: residentQueryKeys.detail(principalId, variables.id.toString()) });
      }
    },
  });
}

export function useToggleResidentStatus() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: ResidentId) => {
      if (!actor) throw new Error('Actor not available');
      return actor.toggleResidentStatus(id);
    },
    onMutate: async (residentId) => {
      const principalId = identity?.getPrincipal().toString();
      if (!principalId) return;

      const directoryQueryKey = residentQueryKeys.directory(principalId);

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: directoryQueryKey });

      // Snapshot the previous value
      const previousDirectory = queryClient.getQueryData<ResidentsDirectoryResponse>(directoryQueryKey);

      // Optimistically update the directory cache
      if (previousDirectory) {
        queryClient.setQueryData<ResidentsDirectoryResponse>(directoryQueryKey, {
          ...previousDirectory,
          residents: previousDirectory.residents.map((resident) =>
            resident.id.toString() === residentId.toString()
              ? { ...resident, active: !resident.active }
              : resident
          ),
        });
      }

      // Return context with the previous value
      return { previousDirectory, principalId };
    },
    onError: (err, residentId, context) => {
      // Rollback on error
      if (context?.previousDirectory && context?.principalId) {
        queryClient.setQueryData(
          residentQueryKeys.directory(context.principalId),
          context.previousDirectory
        );
      }
    },
    onSettled: (_, __, residentId, context) => {
      // Always refetch after error or success to sync with backend
      if (context?.principalId) {
        queryClient.invalidateQueries({ queryKey: residentQueryKeys.list(context.principalId) });
        queryClient.invalidateQueries({ queryKey: residentQueryKeys.directory(context.principalId) });
        queryClient.invalidateQueries({ queryKey: residentQueryKeys.detail(context.principalId, residentId.toString()) });
      }
    },
  });
}

export function useDeleteResident() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: ResidentId) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteResident(id);
    },
    onSuccess: (_, residentId) => {
      const principalId = identity?.getPrincipal().toString();
      if (principalId) {
        queryClient.invalidateQueries({ queryKey: residentQueryKeys.list(principalId) });
        queryClient.invalidateQueries({ queryKey: residentQueryKeys.directory(principalId) });
        queryClient.invalidateQueries({ queryKey: residentQueryKeys.detail(principalId, residentId.toString()) });
      }
    },
  });
}

// Vitals Queries
export function useListVitalsEntries(residentId: ResidentId) {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<VitalsRecord[]>({
    queryKey: ['vitalsEntries', residentId.toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.listVitalsEntries(residentId);
    },
    enabled: !!actor && !actorFetching && !!residentId,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useCreateVitalsEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ residentId, record }: { residentId: ResidentId; record: VitalsRecord }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createVitalsEntry(residentId, record);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vitalsEntries', variables.residentId.toString()] });
    },
  });
}

export function useDeleteVitalsEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ residentId, timestamp }: { residentId: ResidentId; timestamp: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteVitalsEntry(residentId, timestamp);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vitalsEntries', variables.residentId.toString()] });
    },
  });
}

// MAR Queries
export function useListMarRecords(residentId: ResidentId) {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<MarRecord[]>({
    queryKey: ['marRecords', residentId.toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.listMarRecords(residentId);
    },
    enabled: !!actor && !actorFetching && !!residentId,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useCreateMarRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ residentId, record }: { residentId: ResidentId; record: MarRecord }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createMarRecord(residentId, record);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['marRecords', variables.residentId.toString()] });
    },
  });
}

export function useDeleteMarRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ residentId, timestamp }: { residentId: ResidentId; timestamp: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteMarRecord(residentId, timestamp);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['marRecords', variables.residentId.toString()] });
    },
  });
}

// ADL Queries
export function useListAdlRecords(residentId: ResidentId) {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<AdlRecord[]>({
    queryKey: ['adlRecords', residentId.toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.listAdlRecords(residentId);
    },
    enabled: !!actor && !actorFetching && !!residentId,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useCreateAdlRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ residentId, record }: { residentId: ResidentId; record: AdlRecord }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createAdlRecord(residentId, record);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['adlRecords', variables.residentId.toString()] });
    },
  });
}

export function useDeleteAdlRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ residentId, timestamp }: { residentId: ResidentId; timestamp: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteAdlRecord(residentId, timestamp);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['adlRecords', variables.residentId.toString()] });
    },
  });
}
