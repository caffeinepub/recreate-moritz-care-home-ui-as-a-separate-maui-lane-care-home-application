/**
 * Translates backend error messages into clear, user-friendly English messages.
 * Handles authorization failures, permission errors, and other backend traps.
 */
export function translateBackendError(error: unknown): string {
  if (!error) {
    return 'An unknown error occurred';
  }

  const errorMessage = error instanceof Error ? error.message : String(error);

  // Authorization/Permission errors
  if (
    errorMessage.includes('Unauthorized') ||
    errorMessage.includes('Cannot update this resident') ||
    errorMessage.includes('Cannot delete this resident') ||
    errorMessage.includes('Cannot modify this resident') ||
    errorMessage.includes('Cannot add vitals for this resident') ||
    errorMessage.includes('Cannot delete vitals for this resident') ||
    errorMessage.includes('Cannot add MAR records for this resident') ||
    errorMessage.includes('Cannot delete MAR records for this resident') ||
    errorMessage.includes('Cannot add ADL records for this resident') ||
    errorMessage.includes('Cannot delete ADL records for this resident') ||
    errorMessage.includes('Cannot update medications for this resident') ||
    errorMessage.includes('Cannot add medications for this resident') ||
    errorMessage.includes('Cannot access this resident')
  ) {
    return 'You do not have permission to perform this action on this resident. Only the resident owner or administrators can make changes.';
  }

  // Not found errors
  if (errorMessage.includes('not found') || errorMessage.includes('does not exist')) {
    return 'The requested resident or record was not found.';
  }

  // Inactive resident errors
  if (errorMessage.includes('inactive resident')) {
    return 'Cannot add records to an inactive resident.';
  }

  // Already exists errors
  if (errorMessage.includes('already exists')) {
    return 'A record with this identifier already exists.';
  }

  // Network/timeout errors
  if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
    return 'The request timed out. Please check your connection and try again.';
  }

  // Actor not available
  if (errorMessage.includes('Actor not available')) {
    return 'Backend connection is not available. Please try again.';
  }

  // Default: return the original message if it's already clear
  return errorMessage;
}
