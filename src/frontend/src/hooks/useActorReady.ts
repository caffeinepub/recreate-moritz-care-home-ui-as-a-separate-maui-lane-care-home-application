import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';

/**
 * Stable hook that returns true only when the actor is fully initialized
 * and ready to accept queries. Use this as the single source of truth for
 * gating React Query hooks that depend on the backend actor.
 */
export function useActorReady() {
  const { actor, isFetching } = useActor();
  const { identity, isInitializing } = useInternetIdentity();

  // Actor is ready when:
  // 1. Identity system has finished initializing
  // 2. We have an identity (authenticated)
  // 3. Actor exists
  // 4. Actor is not currently being fetched/created
  const actorReady = !isInitializing && !!identity && !!actor && !isFetching;

  return {
    actorReady,
    actor,
    identity,
  };
}
