import type { ResidentViewModel } from './residentDirectoryViewModel';

export type StatusFilter = 'All' | 'Active' | 'Discharged';
export type SortOption = 'room' | 'name' | 'age';

export function filterByStatus(residents: ResidentViewModel[], status: StatusFilter): ResidentViewModel[] {
  if (status === 'All') return residents;
  return residents.filter((r) => r.status === status);
}

export function filterByRoom(residents: ResidentViewModel[], room: string): ResidentViewModel[] {
  if (room === 'All Rooms') return residents;
  return residents.filter((r) => r.room.includes(room));
}

export function sortResidents(residents: ResidentViewModel[], sortBy: SortOption): ResidentViewModel[] {
  const sorted = [...residents];
  switch (sortBy) {
    case 'room':
      return sorted.sort((a, b) => a.room.localeCompare(b.room));
    case 'name':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'age':
      return sorted.sort((a, b) => a.age - b.age);
    default:
      return sorted;
  }
}

export function computeKPIs(residents: ResidentViewModel[]) {
  const total = residents.length;
  const active = residents.filter((r) => r.status === 'Active').length;
  const discharged = residents.filter((r) => r.status === 'Discharged').length;
  return { total, active, discharged };
}

export function getUniqueRooms(residents: ResidentViewModel[]): string[] {
  const rooms = residents.map((r) => {
    const match = r.room.match(/Room \d+/);
    return match ? match[0] : r.room;
  });
  return ['All Rooms', ...Array.from(new Set(rooms)).sort()];
}
