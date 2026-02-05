import type { Resident, ResidentDirectoryEntry } from '@/backend';

/**
 * View model adapter for Residents Directory backend records.
 * Maps backend Resident or ResidentDirectoryEntry types to UI display format.
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
function formatRoom(roomNumber: string, roomType: string, bed?: string): string {
  if (!roomNumber && !roomType) {
    return 'Room TBD';
  }
  
  let roomDisplay = '';
  if (roomNumber && roomType) {
    roomDisplay = `Room ${roomNumber} (${roomType})`;
  } else if (roomNumber) {
    roomDisplay = `Room ${roomNumber}`;
  } else {
    roomDisplay = roomType;
  }
  
  // Append bed designation if present
  if (bed) {
    roomDisplay += ` - Bed ${bed}`;
  }
  
  return roomDisplay;
}

/**
 * Convert backend ResidentDirectoryEntry (lightweight) to UI view model
 */
export function toResidentViewModelFromDirectory(entry: ResidentDirectoryEntry): ResidentViewModel {
  return {
    id: entry.id.toString(),
    name: entry.name,
    age: calculateAge(entry.birthDate),
    room: formatRoom(entry.roomNumber, entry.roomType, entry.bed),
    status: entry.active ? 'Active' : 'Discharged',
    // Directory entries don't include nested arrays, so we can't show counts
    physicians: 0,
    medications: 0,
  };
}

/**
 * Convert backend Resident (full) to UI view model
 */
export function toResidentViewModel(resident: Resident): ResidentViewModel {
  return {
    id: resident.id.toString(),
    name: resident.name,
    age: calculateAge(resident.birthDate),
    room: formatRoom(resident.roomNumber, resident.roomType, resident.bed),
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

/**
 * Convert array of backend ResidentDirectoryEntry to view models
 */
export function toResidentViewModelsFromDirectory(entries: ResidentDirectoryEntry[]): ResidentViewModel[] {
  return entries.map(toResidentViewModelFromDirectory);
}
