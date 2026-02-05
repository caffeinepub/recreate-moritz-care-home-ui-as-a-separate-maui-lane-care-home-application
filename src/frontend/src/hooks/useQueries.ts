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
  UserProfile
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

// Residents Directory Queries
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
    onSuccess: (_, residentId) => {
      const principalId = identity?.getPrincipal().toString();
      if (principalId) {
        queryClient.invalidateQueries({ queryKey: residentQueryKeys.list(principalId) });
        queryClient.invalidateQueries({ queryKey: residentQueryKeys.detail(principalId, residentId.toString()) });
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
