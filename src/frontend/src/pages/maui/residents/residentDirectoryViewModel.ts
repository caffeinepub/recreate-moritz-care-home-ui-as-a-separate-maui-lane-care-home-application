import type { Resident } from '@/backend';

/**
 * View model adapter for Residents Directory backend records.
 * Maps backend Resident type to UI display format.
 */
export interface ResidentViewModel {
  id: string;
  name: string;
  age: number;
  room: string;
  status: 'Active' | 'Discharged';
  physicians: number;
  medications: number;
}

/**
 * Calculate age from birth date string (YYYY-MM-DD format)
 */
function calculateAge(birthDate: string): number {
  try {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  } catch {
    return 0;
  }
}

/**
 * Format room display string from room number and type
 */
function formatRoom(roomNumber: string, roomType: string): string {
  if (!roomNumber && !roomType) {
    return 'Room TBD';
  }
  if (roomNumber && roomType) {
    return `Room ${roomNumber} (${roomType})`;
  }
  if (roomNumber) {
    return `Room ${roomNumber}`;
  }
  return roomType;
}

/**
 * Convert backend Resident to UI view model
 */
export function toResidentViewModel(resident: Resident): ResidentViewModel {
  return {
    id: resident.id.toString(),
    name: resident.name,
    age: calculateAge(resident.birthDate),
    room: formatRoom(resident.roomNumber, resident.roomType),
    status: resident.active ? 'Active' : 'Discharged',
    physicians: resident.physicians?.length || 0,
    medications: resident.medications?.length || 0,
  };
}

/**
 * Convert array of backend Residents to view models
 */
export function toResidentViewModels(residents: Resident[]): ResidentViewModel[] {
  return residents.map(toResidentViewModel);
}
