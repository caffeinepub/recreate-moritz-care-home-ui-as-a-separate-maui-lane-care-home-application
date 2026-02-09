import { useState, useMemo, useEffect } from 'react';
import { ResidentDashboardHeader } from '@/components/maui/residents/ResidentDashboardHeader';
import { ResidentKpiRow } from '@/components/maui/residents/ResidentKpiRow';
import { ResidentFilterSortBar } from '@/components/maui/residents/ResidentFilterSortBar';
import { ResidentStatusTabs } from '@/components/maui/residents/ResidentStatusTabs';
import { ResidentGrid } from '@/components/maui/residents/ResidentGrid';
import { AddNewResidentDialog } from '@/components/maui/residents/AddNewResidentDialog';
import { Principal } from '@dfinity/principal';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, RefreshCw, Activity } from 'lucide-react';
import {
  useGetResidentsDirectory,
  useDeleteResident,
  useToggleResidentStatus,
} from '@/hooks/useQueries';
import { useActor } from '@/hooks/useActor';
import { useHealthCheck } from '@/hooks/useHealthCheck';
import { toResidentViewModelsFromDirectory } from './residents/residentDirectoryViewModel';
import {
  filterByStatus,
  filterByRoom,
  sortResidents,
  computeKPIs,
  getUniqueRooms,
  StatusFilter,
  SortOption,
} from './residents/residentListUtils';

export function Dashboard() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [roomFilter, setRoomFilter] = useState<string>('All Rooms');
  const [sortBy, setSortBy] = useState<SortOption>('room');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [shouldCheckHealth, setShouldCheckHealth] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Check actor availability
  const { actor, isFetching: actorFetching } = useActor();

  // Health check (only when needed)
  const healthCheck = useHealthCheck(shouldCheckHealth);

  // Fetch residents directory from backend (lightweight endpoint)
  const directoryQuery = useGetResidentsDirectory();
  const deleteResidentMutation = useDeleteResident();
  const toggleStatusMutation = useToggleResidentStatus();

  // Detect actor or directory errors
  const hasActorError = !actor && !actorFetching;
  const hasDirectoryError = !!directoryQuery.error;

  // Trigger health check when actor fails or directory query fails
  useEffect(() => {
    if (hasActorError || hasDirectoryError) {
      setShouldCheckHealth(true);
    }
  }, [hasActorError, hasDirectoryError]);

  // Convert backend directory entries to view models
  const residents = useMemo(() => {
    if (!directoryQuery.data) return [];
    return toResidentViewModelsFromDirectory(directoryQuery.data.residents);
  }, [directoryQuery.data]);

  const rooms = useMemo(() => getUniqueRooms(residents), [residents]);

  const filteredAndSortedResidents = useMemo(() => {
    let result = residents;
    result = filterByStatus(result, statusFilter);
    result = filterByRoom(result, roomFilter);
    result = sortResidents(result, sortBy);
    return result;
  }, [residents, statusFilter, roomFilter, sortBy]);

  const kpis = useMemo(() => computeKPIs(residents), [residents]);

  const handleDeleteResident = async (residentId: string) => {
    try {
      const principal = Principal.fromText(residentId);
      await deleteResidentMutation.mutateAsync(principal);
      toast.success('Resident deleted successfully');
    } catch (error: any) {
      console.error('Failed to delete resident:', error);
      const errorMessage = error?.message || 'Failed to delete resident';
      toast.error(errorMessage);
    }
  };

  const handleToggleResidentStatus = async (residentId: string) => {
    try {
      const principal = Principal.fromText(residentId);
      await toggleStatusMutation.mutateAsync(principal);
      toast.success('Resident status updated');
    } catch (error: any) {
      console.error('Failed to toggle resident status:', error);
      const errorMessage = error?.message || 'Failed to update resident status';
      toast.error(errorMessage);
    }
  };

  const handleRetry = () => {
    // Reset health check state
    setShouldCheckHealth(false);
    
    // Increment retry count to force re-render and re-initialization
    setRetryCount(prev => prev + 1);
    
    // Retry directory query
    directoryQuery.refetch();
  };

  const handleRefreshPage = () => {
    window.location.reload();
  };

  // Show loading during initial directory load or actor initialization
  if ((directoryQuery.isLoading || actorFetching) && !hasActorError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading residents...</p>
          </div>
        </div>
      </div>
    );
  }

  // Handle actor initialization errors
  if (hasActorError) {
    const errorMessage = 'Backend connection is not available. This may be due to initialization failure or network issues.';

    // Determine if backend is reachable
    const isBackendReachable = healthCheck.status === 'reachable';
    const isCheckingHealth = healthCheck.status === 'checking';

    let diagnosticMessage = '';
    if (isCheckingHealth) {
      diagnosticMessage = 'Checking backend connectivity...';
    } else if (isBackendReachable) {
      diagnosticMessage = 'Backend is reachable, but your account may not be initialized or authorized yet. Please try logging out and logging in again.';
    } else if (healthCheck.status === 'unreachable') {
      diagnosticMessage = 'Backend appears unreachable or timed out. Please check your internet connection and try again.';
    }

    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Connection Error</AlertTitle>
          <AlertDescription className="mt-2 space-y-2">
            <p>{errorMessage}</p>
            {diagnosticMessage && (
              <p className="flex items-center gap-2 text-sm">
                {isCheckingHealth && <Activity className="h-3 w-3 animate-pulse" />}
                {diagnosticMessage}
              </p>
            )}
          </AlertDescription>
        </Alert>
        <div className="flex flex-col items-center justify-center gap-4 py-12">
          <div className="flex gap-3">
            <Button 
              onClick={handleRetry} 
              variant="outline" 
              disabled={actorFetching || isCheckingHealth}
            >
              {actorFetching || isCheckingHealth ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retry
                </>
              )}
            </Button>
            <Button onClick={handleRefreshPage} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Page
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Handle directory query errors
  if (directoryQuery.error) {
    const errorMessage = directoryQuery.error instanceof Error 
      ? directoryQuery.error.message 
      : 'Failed to load residents. Please try again.';

    // Determine if backend is reachable
    const isBackendReachable = healthCheck.status === 'reachable';
    const isCheckingHealth = healthCheck.status === 'checking';

    let diagnosticMessage = '';
    if (isCheckingHealth) {
      diagnosticMessage = 'Checking backend connectivity...';
    } else if (isBackendReachable) {
      diagnosticMessage = 'Backend is reachable, but the query failed. This may be an authorization issue. Please try logging out and logging in again.';
    } else if (healthCheck.status === 'unreachable') {
      diagnosticMessage = 'Backend appears unreachable or timed out. Please check your internet connection and try again.';
    }

    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Data Loading Error</AlertTitle>
          <AlertDescription className="mt-2 space-y-2">
            <p>{errorMessage}</p>
            {diagnosticMessage && (
              <p className="flex items-center gap-2 text-sm">
                {isCheckingHealth && <Activity className="h-3 w-3 animate-pulse" />}
                {diagnosticMessage}
              </p>
            )}
          </AlertDescription>
        </Alert>
        <div className="flex flex-col items-center justify-center gap-4 py-12">
          <div className="flex gap-3">
            <Button 
              onClick={handleRetry} 
              variant="outline" 
              disabled={directoryQuery.isFetching || isCheckingHealth}
            >
              {directoryQuery.isFetching || isCheckingHealth ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retry
                </>
              )}
            </Button>
            <Button onClick={handleRefreshPage} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Page
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ResidentDashboardHeader onAddResident={() => setIsAddDialogOpen(true)} />
      <ResidentKpiRow total={kpis.total} active={kpis.active} discharged={kpis.discharged} />
      <ResidentFilterSortBar
        rooms={rooms}
        selectedRoom={roomFilter}
        onRoomChange={setRoomFilter}
        sortBy={sortBy}
        onSortChange={(value) => setSortBy(value as SortOption)}
      />
      <ResidentStatusTabs value={statusFilter} onValueChange={setStatusFilter} />
      <ResidentGrid
        residents={filteredAndSortedResidents}
        onDeleteResident={handleDeleteResident}
        onToggleResidentStatus={handleToggleResidentStatus}
      />
      {directoryQuery.isFetching && !directoryQuery.isLoading && (
        <div className="fixed bottom-4 right-4 rounded-md bg-muted px-4 py-2 text-sm text-muted-foreground shadow-md">
          Refreshing...
        </div>
      )}
      <AddNewResidentDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />
    </div>
  );
}
