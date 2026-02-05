export interface ResidentProfileData {
  id: string;
  name: string;
  dateOfBirth: string;
  admissionDate: string;
  room: string;
  roomType: string;
  status: string;
  medicaidNumber: string;
  medicareNumber: string;
  physicians: Array<{ name: string; contactNumber: string; specialty: string }>;
  pharmacy: { name: string; address: string; contactNumber: string };
  insurance: { company: string; policyNumber: string; address: string; contactNumber: string };
  responsiblePersons: Array<{ name: string; relationship: string; contactNumber: string; address: string }>;
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
    status: 'Active',
    medicaidNumber: '-',
    medicareNumber: '-',
    physicians: [],
    pharmacy: { name: '-', address: '-', contactNumber: '-' },
    insurance: { company: '-', policyNumber: '-', address: '-', contactNumber: '-' },
    responsiblePersons: [],
  };
}
