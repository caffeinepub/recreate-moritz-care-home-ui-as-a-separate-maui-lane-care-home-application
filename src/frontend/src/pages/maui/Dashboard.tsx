import { useState, useMemo } from 'react';
import { ResidentDashboardHeader } from '@/components/maui/residents/ResidentDashboardHeader';
import { ResidentKpiRow } from '@/components/maui/residents/ResidentKpiRow';
import { ResidentFilterSortBar } from '@/components/maui/residents/ResidentFilterSortBar';
import { ResidentStatusTabs } from '@/components/maui/residents/ResidentStatusTabs';
import { ResidentGrid } from '@/components/maui/residents/ResidentGrid';
import { AddNewResidentDialog } from '@/components/maui/residents/AddNewResidentDialog';
import { Principal } from '@dfinity/principal';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  useGetResidentsDirectory,
  useDeleteResident,
  useToggleResidentStatus,
  useEnsureResidentsSeeded,
} from '@/hooks/useQueries';
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

  // Ensure sample residents are seeded before loading directory
  const seedQuery = useEnsureResidentsSeeded();

  // Fetch residents directory from backend (lightweight endpoint)
  const directoryQuery = useGetResidentsDirectory({
    enabled: !seedQuery.isLoading,
  });
  const deleteResidentMutation = useDeleteResident();
  const toggleStatusMutation = useToggleResidentStatus();

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
      toast.error(error.message || 'Failed to delete resident');
    }
  };

  const handleToggleResidentStatus = async (residentId: string) => {
    try {
      const principal = Principal.fromText(residentId);
      await toggleStatusMutation.mutateAsync(principal);
      toast.success('Resident status updated');
    } catch (error: any) {
      console.error('Failed to toggle resident status:', error);
      toast.error(error.message || 'Failed to update resident status');
    }
  };

  const handleRetry = () => {
    seedQuery.refetch();
    directoryQuery.refetch();
  };

  // Show loading during seeding or initial directory load
  if (seedQuery.isLoading || directoryQuery.isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">
            {seedQuery.isLoading ? 'Preparing your dashboard...' : 'Loading residents...'}
          </p>
        </div>
      </div>
    );
  }

  if (seedQuery.error || directoryQuery.error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center gap-4 py-12">
          <p className="text-destructive">Failed to load residents. Please try again.</p>
          <Button onClick={handleRetry} variant="outline">
            Retry
          </Button>
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
