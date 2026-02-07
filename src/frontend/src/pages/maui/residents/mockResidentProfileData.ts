import type { Medication, Physician, PharmacyInfo, InsuranceInfo, ResponsiblePerson } from '@/backend';

export interface ResidentProfileData {
  id: string;
  name: string;
  dateOfBirth: string;
  admissionDate: string;
  room: string;
  roomType: string;
  bed?: string;
  status: string;
  medicaidNumber: string;
  medicareNumber: string;
  physicians: Physician[];
  pharmacy: PharmacyInfo;
  insurance: InsuranceInfo;
  responsiblePersons: ResponsiblePerson[];
  medications: Medication[];
}

export interface ResidentMedication {
  name: string;
  dosage?: string;
  route?: string;
  times?: string[];
  prescriber?: string;
  notes?: string;
}

/**
 * Fallback mock data for resident profiles when backend data is unavailable
 */
export function getResidentProfileData(residentId: string): ResidentProfileData {
  return {
    id: residentId,
    name: 'Unknown Resident',
    dateOfBirth: '1940-01-01',
    admissionDate: '2024-01-01',
    room: 'Room TBD',
    roomType: 'TBD',
    bed: undefined,
    status: 'Active',
    medicaidNumber: '-',
    medicareNumber: '-',
    physicians: [],
    pharmacy: { name: '-', address: '-', contactNumber: '-' },
    insurance: { company: '-', policyNumber: '-', address: '-', contactNumber: '-' },
    responsiblePersons: [],
    medications: [],
  };
}
