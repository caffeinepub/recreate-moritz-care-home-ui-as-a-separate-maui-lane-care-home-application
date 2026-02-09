import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActorReady } from './useActorReady';
import { useInternetIdentity } from './useInternetIdentity';
import { Principal } from '@dfinity/principal';
import { residentQueryKeys } from './residentQueryKeys';
import { translateBackendError } from '@/lib/backendErrorMessage';
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
  ResidentDirectoryEntry,
  Medication,
  MedicationUpdate
} from '../backend';

const DIRECTORY_QUERY_TIMEOUT_MS = 15000; // 15 seconds

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actorReady, actor } = useActorReady();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.getCallerUserProfile();
      } catch (error: any) {
        // Ensure errors are thrown as Error instances with clear messages
        const errorMessage = translateBackendError(error);
        throw new Error(errorMessage);
      }
    },
    enabled: actorReady,
    retry: false,
  });

  return {
    ...query,
    isLoading: !actorReady || query.isLoading,
    isFetched: actorReady && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActorReady();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.saveCallerUserProfile(profile);
      } catch (error: any) {
        const errorMessage = translateBackendError(error);
        throw new Error(errorMessage);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Residents Directory Queries

/**
 * Lightweight residents directory query for Dashboard listing.
 * Uses optimized backend endpoint with reduced payload and refetch-on-mount to ensure cross-user residents appear.
 */
export function useGetResidentsDirectory() {
  const { actorReady, actor, identity } = useActorReady();

  const principalId = identity?.getPrincipal().toString();

  const query = useQuery<ResidentsDirectoryResponse>({
    queryKey: residentQueryKeys.directory(principalId || 'anonymous'),
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      
      // Development-only timing
      const fetchStartTime = performance.now();
      
      // Wrap the query with a timeout
      const queryPromise = (async () => {
        try {
          // Try the optimized directory endpoint first
          const response = await actor.getResidentsDirectory();
          
          if (import.meta.env.DEV) {
            console.log('[Residents Directory] Using getResidentsDirectory endpoint');
          }
          
          return response;
        } catch (error: any) {
          // Check if this is a "method not found" error
          const errorMessage = error?.message || String(error);
          const isMethodNotFound = 
            errorMessage.includes('has no update method') ||
            errorMessage.includes('has no query method') ||
            errorMessage.includes('getResidentsDirectory');
          
          if (isMethodNotFound) {
            if (import.meta.env.DEV) {
              console.log('[Residents Directory] Falling back to listActiveResidents');
            }
            
            // Fallback: use listActiveResidents and adapt to directory format
            const residents = await actor.listActiveResidents();
            
            const directoryEntries: ResidentDirectoryEntry[] = residents.map((resident) => ({
              id: resident.id,
              name: resident.name,
              birthDate: resident.birthDate,
              createdAt: resident.createdAt,
              active: resident.active,
              admissionDate: resident.admissionDate,
              roomNumber: resident.roomNumber,
              roomType: resident.roomType,
              bed: resident.bed,
            }));
            
            const response: ResidentsDirectoryResponse = {
              residents: directoryEntries,
              directoryLoadPerformance: {
                backendQueryTimeNanos: BigInt(0),
                totalRequestTimeNanos: BigInt(0),
                residentCount: BigInt(residents.length),
              },
            };
            
            return response;
          }
          
          // Re-throw if it's not a method-not-found error
          throw error;
        }
      })();
      
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error('Request timed out after 15 seconds. Please check your connection and try again.'));
        }, DIRECTORY_QUERY_TIMEOUT_MS);
      });
      
      try {
        const response = await Promise.race([queryPromise, timeoutPromise]);
        
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
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('[Residents Directory] Query failed:', error);
        }
        throw error;
      }
    },
    enabled: actorReady,
    retry: false,
    // Reduce stale time to ensure fresh data on mount
    staleTime: 10_000, // 10 seconds
    // Force refetch on mount to ensure cross-user residents appear
    refetchOnMount: 'always',
    // Disable automatic refetching on window focus/reconnect
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  return {
    ...query,
    isLoading: !actorReady || query.isLoading,
    isFetched: actorReady && query.isFetched,
  };
}

export function useListActiveResidents() {
  const { actorReady, actor, identity } = useActorReady();

  const principalId = identity?.getPrincipal().toString();

  const query = useQuery<Resident[]>({
    queryKey: residentQueryKeys.list(principalId || 'anonymous'),
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.listActiveResidents();
    },
    enabled: actorReady,
    retry: false,
  });

  return {
    ...query,
    isLoading: !actorReady || query.isLoading,
    isFetched: actorReady && query.isFetched,
  };
}

export function useGetResident(residentId: ResidentId | null) {
  const { actorReady, actor, identity } = useActorReady();

  const principalId = identity?.getPrincipal().toString();

  const query = useQuery<Resident | null>({
    queryKey: residentQueryKeys.detail(principalId || 'anonymous', residentId?.toString() || ''),
    queryFn: async () => {
      if (!actor || !residentId) throw new Error('Actor or residentId not available');
      try {
        return await actor.getResident(residentId);
      } catch (error: any) {
        const errorMessage = translateBackendError(error);
        throw new Error(errorMessage);
      }
    },
    enabled: actorReady && !!residentId,
    retry: false,
  });

  return {
    ...query,
    isLoading: !actorReady || query.isLoading,
    isFetched: actorReady && query.isFetched,
  };
}

export function useCreateResident() {
  const { actor, identity } = useActorReady();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: ResidentCreateRequest) => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.createResident(request);
      } catch (error: any) {
        const errorMessage = translateBackendError(error);
        throw new Error(errorMessage);
      }
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
  const { actor, identity } = useActorReady();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updateRequest }: { id: ResidentId; updateRequest: ResidentUpdateRequest }) => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.updateResident(id, updateRequest);
      } catch (error: any) {
        const errorMessage = translateBackendError(error);
        throw new Error(errorMessage);
      }
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
  const { actor, identity } = useActorReady();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: ResidentId) => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.toggleResidentStatus(id);
      } catch (error: any) {
        const errorMessage = translateBackendError(error);
        throw new Error(errorMessage);
      }
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
  const { actor, identity } = useActorReady();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: ResidentId) => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.deleteResident(id);
      } catch (error: any) {
        const errorMessage = translateBackendError(error);
        throw new Error(errorMessage);
      }
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

// Medication Queries
export function useUpdateMedication() {
  const { actor, identity } = useActorReady();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ residentId, medicationUpdate }: { residentId: ResidentId; medicationUpdate: MedicationUpdate }) => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.updateMedication(residentId, medicationUpdate);
      } catch (error: any) {
        const errorMessage = translateBackendError(error);
        throw new Error(errorMessage);
      }
    },
    onSuccess: (_, variables) => {
      const principalId = identity?.getPrincipal().toString();
      if (principalId) {
        queryClient.invalidateQueries({ queryKey: residentQueryKeys.detail(principalId, variables.residentId.toString()) });
      }
    },
  });
}

export function useAddMedication() {
  const { actor, identity } = useActorReady();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ residentId, medication }: { residentId: ResidentId; medication: Medication }) => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.addMedication(residentId, medication);
      } catch (error: any) {
        const errorMessage = translateBackendError(error);
        throw new Error(errorMessage);
      }
    },
    onSuccess: (_, variables) => {
      const principalId = identity?.getPrincipal().toString();
      if (principalId) {
        queryClient.invalidateQueries({ queryKey: residentQueryKeys.detail(principalId, variables.residentId.toString()) });
      }
    },
  });
}

export function useDiscontinueMedication() {
  const { actor, identity } = useActorReady();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ residentId, medicationId }: { residentId: ResidentId; medicationId: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.discontinueMedication(residentId, medicationId);
      } catch (error: any) {
        const errorMessage = translateBackendError(error);
        throw new Error(errorMessage);
      }
    },
    onSuccess: (_, variables) => {
      const principalId = identity?.getPrincipal().toString();
      if (principalId) {
        queryClient.invalidateQueries({ queryKey: residentQueryKeys.detail(principalId, variables.residentId.toString()) });
      }
    },
  });
}

export function useDeleteMedication() {
  const { actor, identity } = useActorReady();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ residentId, medicationId }: { residentId: ResidentId; medicationId: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.deleteMedication(residentId, medicationId);
      } catch (error: any) {
        const errorMessage = translateBackendError(error);
        throw new Error(errorMessage);
      }
    },
    onSuccess: (_, variables) => {
      const principalId = identity?.getPrincipal().toString();
      if (principalId) {
        queryClient.invalidateQueries({ queryKey: residentQueryKeys.detail(principalId, variables.residentId.toString()) });
      }
    },
  });
}

// Vitals Queries
export function useCreateVitalsEntry() {
  const { actor, identity } = useActorReady();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ residentId, record }: { residentId: ResidentId; record: VitalsRecord }) => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.createVitalsEntry(residentId, record);
      } catch (error: any) {
        const errorMessage = translateBackendError(error);
        throw new Error(errorMessage);
      }
    },
    onSuccess: (_, variables) => {
      const principalId = identity?.getPrincipal().toString();
      if (principalId) {
        queryClient.invalidateQueries({ queryKey: ['vitals', principalId, variables.residentId.toString()] });
      }
    },
  });
}

export function useListVitalsEntries(residentId: ResidentId | null) {
  const { actorReady, actor, identity } = useActorReady();

  const principalId = identity?.getPrincipal().toString();

  const query = useQuery<VitalsRecord[]>({
    queryKey: ['vitals', principalId || 'anonymous', residentId?.toString() || ''],
    queryFn: async () => {
      if (!actor || !residentId) throw new Error('Actor or residentId not available');
      try {
        return await actor.listVitalsEntries(residentId);
      } catch (error: any) {
        const errorMessage = translateBackendError(error);
        throw new Error(errorMessage);
      }
    },
    enabled: actorReady && !!residentId,
    retry: false,
  });

  return {
    ...query,
    isLoading: !actorReady || query.isLoading,
  };
}

export function useDeleteVitalsEntry() {
  const { actor, identity } = useActorReady();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ residentId, timestamp }: { residentId: ResidentId; timestamp: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.deleteVitalsEntry(residentId, timestamp);
      } catch (error: any) {
        const errorMessage = translateBackendError(error);
        throw new Error(errorMessage);
      }
    },
    onSuccess: (_, variables) => {
      const principalId = identity?.getPrincipal().toString();
      if (principalId) {
        queryClient.invalidateQueries({ queryKey: ['vitals', principalId, variables.residentId.toString()] });
      }
    },
  });
}

// MAR Queries
export function useCreateMarRecord() {
  const { actor, identity } = useActorReady();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ residentId, record }: { residentId: ResidentId; record: MarRecord }) => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.createMarRecord(residentId, record);
      } catch (error: any) {
        const errorMessage = translateBackendError(error);
        throw new Error(errorMessage);
      }
    },
    onSuccess: (_, variables) => {
      const principalId = identity?.getPrincipal().toString();
      if (principalId) {
        queryClient.invalidateQueries({ queryKey: ['mar', principalId, variables.residentId.toString()] });
      }
    },
  });
}

export function useListMarRecords(residentId: ResidentId | null) {
  const { actorReady, actor, identity } = useActorReady();

  const principalId = identity?.getPrincipal().toString();

  const query = useQuery<MarRecord[]>({
    queryKey: ['mar', principalId || 'anonymous', residentId?.toString() || ''],
    queryFn: async () => {
      if (!actor || !residentId) throw new Error('Actor or residentId not available');
      try {
        return await actor.listMarRecords(residentId);
      } catch (error: any) {
        const errorMessage = translateBackendError(error);
        throw new Error(errorMessage);
      }
    },
    enabled: actorReady && !!residentId,
    retry: false,
  });

  return {
    ...query,
    isLoading: !actorReady || query.isLoading,
  };
}

export function useDeleteMarRecord() {
  const { actor, identity } = useActorReady();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ residentId, timestamp }: { residentId: ResidentId; timestamp: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.deleteMarRecord(residentId, timestamp);
      } catch (error: any) {
        const errorMessage = translateBackendError(error);
        throw new Error(errorMessage);
      }
    },
    onSuccess: (_, variables) => {
      const principalId = identity?.getPrincipal().toString();
      if (principalId) {
        queryClient.invalidateQueries({ queryKey: ['mar', principalId, variables.residentId.toString()] });
      }
    },
  });
}

// ADL Queries
export function useCreateAdlRecord() {
  const { actor, identity } = useActorReady();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ residentId, record }: { residentId: ResidentId; record: AdlRecord }) => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.createAdlRecord(residentId, record);
      } catch (error: any) {
        const errorMessage = translateBackendError(error);
        throw new Error(errorMessage);
      }
    },
    onSuccess: (_, variables) => {
      const principalId = identity?.getPrincipal().toString();
      if (principalId) {
        queryClient.invalidateQueries({ queryKey: ['adl', principalId, variables.residentId.toString()] });
      }
    },
  });
}

export function useListAdlRecords(residentId: ResidentId | null) {
  const { actorReady, actor, identity } = useActorReady();

  const principalId = identity?.getPrincipal().toString();

  const query = useQuery<AdlRecord[]>({
    queryKey: ['adl', principalId || 'anonymous', residentId?.toString() || ''],
    queryFn: async () => {
      if (!actor || !residentId) throw new Error('Actor or residentId not available');
      try {
        return await actor.listAdlRecords(residentId);
      } catch (error: any) {
        const errorMessage = translateBackendError(error);
        throw new Error(errorMessage);
      }
    },
    enabled: actorReady && !!residentId,
    retry: false,
  });

  return {
    ...query,
    isLoading: !actorReady || query.isLoading,
  };
}

export function useDeleteAdlRecord() {
  const { actor, identity } = useActorReady();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ residentId, timestamp }: { residentId: ResidentId; timestamp: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.deleteAdlRecord(residentId, timestamp);
      } catch (error: any) {
        const errorMessage = translateBackendError(error);
        throw new Error(errorMessage);
      }
    },
    onSuccess: (_, variables) => {
      const principalId = identity?.getPrincipal().toString();
      if (principalId) {
        queryClient.invalidateQueries({ queryKey: ['adl', principalId, variables.residentId.toString()] });
      }
    },
  });
}

// Seed Residents
export function useEnsureResidentsSeeded() {
  const { actor } = useActorReady();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.ensureResidentsSeeded();
      } catch (error: any) {
        const errorMessage = translateBackendError(error);
        throw new Error(errorMessage);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['residents'] });
    },
  });
}
