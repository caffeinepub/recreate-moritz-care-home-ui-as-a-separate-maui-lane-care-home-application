import { useQuery } from '@tanstack/react-query';
import { createActorWithConfig } from '../config';
import type { HealthCheckResponse } from '../backend';

const HEALTH_CHECK_TIMEOUT_MS = 5000; // 5 seconds

export type HealthCheckStatus = 'reachable' | 'unreachable' | 'checking' | 'idle';

export function useHealthCheck(enabled: boolean = false) {
  const query = useQuery<HealthCheckResponse>({
    queryKey: ['healthCheck'],
    queryFn: async () => {
      // Create anonymous actor for unauthenticated health check
      const anonymousActor = await createActorWithConfig();

      const healthCheckPromise = anonymousActor.healthCheck();

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error('Health check timed out'));
        }, HEALTH_CHECK_TIMEOUT_MS);
      });

      try {
        const response = await Promise.race([healthCheckPromise, timeoutPromise]);
        return response;
      } catch (error: any) {
        throw new Error(`Health check failed: ${error?.message || 'Unknown error'}`);
      }
    },
    enabled,
    retry: false,
    staleTime: 60_000, // Cache successful health checks for 60 seconds
    gcTime: 300_000, // Keep in cache for 5 minutes
    // Disable automatic refetching to prevent re-triggering gates
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });

  const getStatus = (): HealthCheckStatus => {
    if (query.isFetching) return 'checking';
    if (query.isSuccess) return 'reachable';
    if (query.isError) return 'unreachable';
    return 'idle';
  };

  return {
    ...query,
    status: getStatus(),
  };
}
