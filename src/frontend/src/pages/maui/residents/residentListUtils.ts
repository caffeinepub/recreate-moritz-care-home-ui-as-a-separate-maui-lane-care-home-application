import { Resident } from './mockResidents';

export type StatusFilter = 'All' | 'Active' | 'Discharged';
export type SortOption = 'room' | 'name' | 'age';

export function filterByStatus(residents: Resident[], status: StatusFilter): Resident[] {
  if (status === 'All') return residents;
  return residents.filter((r) => r.status === status);
}

export function filterByRoom(residents: Resident[], room: string): Resident[] {
  if (room === 'All Rooms') return residents;
  return residents.filter((r) => r.room.includes(room));
}

export function sortResidents(residents: Resident[], sortBy: SortOption): Resident[] {
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

export function computeKPIs(residents: Resident[]) {
  const total = residents.length;
  const active = residents.filter((r) => r.status === 'Active').length;
  const discharged = residents.filter((r) => r.status === 'Discharged').length;
  return { total, active, discharged };
}

export function getUniqueRooms(residents: Resident[]): string[] {
  const rooms = residents.map((r) => {
    const match = r.room.match(/Room \d+/);
    return match ? match[0] : r.room;
  });
  return ['All Rooms', ...Array.from(new Set(rooms)).sort()];
}
