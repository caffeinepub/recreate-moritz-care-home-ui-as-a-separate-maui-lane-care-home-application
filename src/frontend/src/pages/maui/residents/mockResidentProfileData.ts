import { mockResidents } from './mockResidents';

export interface ResidentProfileData {
  id: number;
  name: string;
  age: number;
  dateOfBirth: string;
  roomNumber: string;
  bed: string;
  status: 'Active' | 'Discharged';
  admissionDate: string;
  assignedPhysicians: Array<{
    name: string;
    specialty: string;
    phone: string;
  }>;
  pharmacyInfo: {
    name: string;
    address: string;
    phone: string;
  };
  responsibleContacts: Array<{
    name: string;
    relationship: string;
    phone: string;
    email?: string;
  }>;
  insuranceInfo?: {
    medicaidNumber?: string;
    medicareNumber?: string;
  };
}

export function getResidentProfileData(residentId: number): ResidentProfileData | null {
  const resident = mockResidents.find((r) => r.id === residentId);
  if (!resident) return null;

  // Parse room and bed from room string
  const roomMatch = resident.room.match(/Room (\d+)/);
  const bedMatch = resident.room.match(/Bed ([A-Z])/);
  const roomNumber = roomMatch ? roomMatch[1] : '001';
  const bed = bedMatch ? bedMatch[1] : 'A';

  // Mock profile data based on resident
  const profileData: ResidentProfileData = {
    id: resident.id,
    name: resident.name,
    age: resident.age,
    dateOfBirth: getDateOfBirth(resident.age),
    roomNumber,
    bed,
    status: resident.status,
    admissionDate: 'October 14, 2021',
    assignedPhysicians: [
      {
        name: 'Sharis Arakelian',
        specialty: 'RN',
        phone: '623-624-7428',
      },
    ],
    pharmacyInfo: {
      name: 'OnePoint Patient Care',
      address: '1273 W WASHINGTON ST #105 TEMPE AZ',
      phone: '844-848-6800',
    },
    responsibleContacts: [
      {
        name: 'Richard Studwell',
        relationship: 'Brother',
        phone: '(602) 697-4802',
        email: 'Not specified',
      },
    ],
    insuranceInfo: {
      medicaidNumber: 'N/A',
      medicareNumber: '0343606-01',
    },
  };

  return profileData;
}

function getDateOfBirth(age: number): string {
  const currentYear = 2026;
  const birthYear = currentYear - age;
  return `July 14, ${birthYear - 1}`;
}
