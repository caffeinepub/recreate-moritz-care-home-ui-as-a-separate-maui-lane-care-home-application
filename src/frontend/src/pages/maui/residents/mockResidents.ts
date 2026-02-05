export interface Resident {
  id: number;
  name: string;
  age: number;
  room: string;
  status: 'Active' | 'Discharged';
  physicians: number;
  medications: number;
}

export const mockResidents: Resident[] = [
  {
    id: 3,
    name: 'Janet Studwell',
    age: 81,
    room: 'Room 001 - Shared (Bed A)',
    status: 'Active',
    physicians: 1,
    medications: 17,
  },
  {
    id: 4,
    name: 'Robert Adams',
    age: 64,
    room: 'Room 002 - Solo',
    status: 'Active',
    physicians: 1,
    medications: 12,
  },
  {
    id: 5,
    name: 'Verna Nichols',
    age: 90,
    room: 'Room 003 - Solo',
    status: 'Active',
    physicians: 1,
    medications: 11,
  },
  {
    id: 11,
    name: 'Cheryl Stout',
    age: 83,
    room: 'Room 004 - Solo',
    status: 'Active',
    physicians: 0,
    medications: 9,
  },
  {
    id: 6,
    name: 'Timothy Buchanan',
    age: 48,
    room: 'Room 005 - Shared (Bed A)',
    status: 'Active',
    physicians: 2,
    medications: 13,
  },
  {
    id: 7,
    name: 'Jeffery Falcon',
    age: 69,
    room: 'Room 005 - Shared (Bed B)',
    status: 'Active',
    physicians: 1,
    medications: 19,
  },
  {
    id: 8,
    name: 'Margaret Wilson',
    age: 75,
    room: 'Room 006 - Solo',
    status: 'Active',
    physicians: 2,
    medications: 8,
  },
  {
    id: 9,
    name: 'Harold Thompson',
    age: 82,
    room: 'Room 007 - Shared (Bed A)',
    status: 'Active',
    physicians: 1,
    medications: 14,
  },
  {
    id: 10,
    name: 'Dorothy Martinez',
    age: 77,
    room: 'Room 008 - Solo',
    status: 'Active',
    physicians: 3,
    medications: 10,
  },
];
