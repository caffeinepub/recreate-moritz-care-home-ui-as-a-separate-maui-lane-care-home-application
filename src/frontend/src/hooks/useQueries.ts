// This file is reserved for React Query hooks that interact with the backend
// Currently, the backend has no methods, so no queries are needed yet
// Example structure:
// export function useGetData() {
//   const { actor, isFetching } = useActor();
//   return useQuery({
//     queryKey: ['data'],
//     queryFn: async () => {
//       if (!actor) return [];
//       return actor.getData();
//     },
//     enabled: !!actor && !isFetching,
//   });
// }
