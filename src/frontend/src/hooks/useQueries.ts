import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { VitalsRecord } from '../backend';

// Vitals Queries
export function useListVitalsEntries() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<VitalsRecord[]>({
    queryKey: ['vitalsEntries'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.listVitalsEntries();
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

export function useCreateVitalsEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (record: VitalsRecord) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createVitalsEntry(record);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vitalsEntries'] });
    },
  });
}

export function useDeleteVitalsEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (timestamp: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteVitalsEntry(timestamp);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vitalsEntries'] });
    },
  });
}
