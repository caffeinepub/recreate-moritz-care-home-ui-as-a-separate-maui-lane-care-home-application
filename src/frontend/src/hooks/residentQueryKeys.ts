/**
 * Centralized query key factory for Residents Directory queries.
 * Ensures principal-scoped cache isolation to prevent cross-login data leakage.
 */
export const residentQueryKeys = {
  all: (principalId: string) => ['residents', principalId] as const,
  list: (principalId: string) => [...residentQueryKeys.all(principalId), 'list'] as const,
  directory: (principalId: string) => [...residentQueryKeys.all(principalId), 'directory'] as const,
  detail: (principalId: string, residentId: string) => [...residentQueryKeys.all(principalId), 'detail', residentId] as const,
};
