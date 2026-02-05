import { useState, useMemo } from 'react';
import { ResidentDashboardHeader } from '@/components/maui/residents/ResidentDashboardHeader';
import { ResidentKpiRow } from '@/components/maui/residents/ResidentKpiRow';
import { ResidentFilterSortBar } from '@/components/maui/residents/ResidentFilterSortBar';
import { ResidentStatusTabs } from '@/components/maui/residents/ResidentStatusTabs';
import { ResidentGrid } from '@/components/maui/residents/ResidentGrid';
import { AddNewResidentDialog } from '@/components/maui/residents/AddNewResidentDialog';
import { Principal } from '@dfinity/principal';
import { toast } from 'sonner';
import {
  useListActiveResidents,
  useDeleteResident,
  useToggleResidentStatus,
} from '@/hooks/useQueries';
import { toResidentViewModels } from './residents/residentDirectoryViewModel';
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

  // Fetch residents from backend
  const { data: backendResidents = [], isLoading, error } = useListActiveResidents();
  const deleteResidentMutation = useDeleteResident();
  const toggleStatusMutation = useToggleResidentStatus();

  // Convert backend residents to view models
  const residents = useMemo(() => toResidentViewModels(backendResidents), [backendResidents]);

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

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading residents...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <p className="text-destructive">Failed to load residents. Please try again.</p>
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
      <AddNewResidentDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />
    </div>
  );
}
