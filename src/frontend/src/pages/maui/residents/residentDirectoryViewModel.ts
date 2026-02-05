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
 * Convert backend Resident to UI view model
 */
export function toResidentViewModel(resident: Resident): ResidentViewModel {
  return {
    id: resident.id.toString(),
    name: resident.name,
    age: calculateAge(resident.birthDate),
    room: 'Room TBD', // Backend doesn't store room yet, placeholder for now
    status: resident.active ? 'Active' : 'Discharged',
    physicians: 0, // Backend doesn't track this yet
    medications: 0, // Backend doesn't track this yet
  };
}

/**
 * Convert array of backend Residents to view models
 */
export function toResidentViewModels(residents: Resident[]): ResidentViewModel[] {
  return residents.map(toResidentViewModel);
}
