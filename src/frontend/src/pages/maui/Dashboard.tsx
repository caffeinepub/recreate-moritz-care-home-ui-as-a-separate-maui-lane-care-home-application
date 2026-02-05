import { useState, useMemo } from 'react';
import { ResidentDashboardHeader } from '@/components/maui/residents/ResidentDashboardHeader';
import { ResidentKpiRow } from '@/components/maui/residents/ResidentKpiRow';
import { ResidentFilterSortBar } from '@/components/maui/residents/ResidentFilterSortBar';
import { ResidentStatusTabs } from '@/components/maui/residents/ResidentStatusTabs';
import { ResidentGrid } from '@/components/maui/residents/ResidentGrid';
import { AddNewResidentDialog } from '@/components/maui/residents/AddNewResidentDialog';
import { mockResidents, Resident } from './residents/mockResidents';
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
  const [residents, setResidents] = useState<Resident[]>(mockResidents);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [roomFilter, setRoomFilter] = useState<string>('All Rooms');
  const [sortBy, setSortBy] = useState<SortOption>('room');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const rooms = useMemo(() => getUniqueRooms(residents), [residents]);

  const filteredAndSortedResidents = useMemo(() => {
    let result = residents;
    result = filterByStatus(result, statusFilter);
    result = filterByRoom(result, roomFilter);
    result = sortResidents(result, sortBy);
    return result;
  }, [residents, statusFilter, roomFilter, sortBy]);

  const kpis = useMemo(() => computeKPIs(residents), [residents]);

  const handleAddResident = (newResident: Resident) => {
    setResidents((prev) => [...prev, newResident]);
  };

  const handleDeleteResident = (residentId: number) => {
    setResidents((prev) => prev.filter((r) => r.id !== residentId));
  };

  const handleToggleResidentStatus = (residentId: number) => {
    setResidents((prev) =>
      prev.map((r) =>
        r.id === residentId
          ? { ...r, status: r.status === 'Active' ? 'Discharged' : 'Active' }
          : r
      )
    );
  };

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
        onAddResident={handleAddResident}
      />
    </div>
  );
}
