import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { VitalsRecord, MarRecord, AdlRecord, ResidentId } from '../backend';

// Vitals Queries
export function useListVitalsEntries() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  const residentId = identity?.getPrincipal();

  const query = useQuery<VitalsRecord[]>({
    queryKey: ['vitalsEntries', residentId?.toString()],
    queryFn: async () => {
      if (!actor || !residentId) throw new Error('Actor or identity not available');
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
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (record: VitalsRecord) => {
      if (!actor) throw new Error('Actor not available');
      const residentId = identity?.getPrincipal();
      if (!residentId) throw new Error('Identity not available');
      return actor.createVitalsEntry(residentId, record);
    },
    onSuccess: () => {
      const residentId = identity?.getPrincipal();
      if (residentId) {
        queryClient.invalidateQueries({ queryKey: ['vitalsEntries', residentId.toString()] });
      }
    },
  });
}

export function useDeleteVitalsEntry() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (timestamp: bigint) => {
      if (!actor) throw new Error('Actor not available');
      const residentId = identity?.getPrincipal();
      if (!residentId) throw new Error('Identity not available');
      return actor.deleteVitalsEntry(residentId, timestamp);
    },
    onSuccess: () => {
      const residentId = identity?.getPrincipal();
      if (residentId) {
        queryClient.invalidateQueries({ queryKey: ['vitalsEntries', residentId.toString()] });
      }
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
