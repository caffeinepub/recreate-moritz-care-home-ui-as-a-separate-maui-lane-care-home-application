export interface Medication {
  id: string;
  name: string;
  dosage: string;
  quantity: string;
  route: string;
  times: string;
  notes?: string;
  prescribedBy: string;
  status: 'Active' | 'Discontinued';
}

export function getResidentMedications(residentId: number): Medication[] {
  // Mock medications for Janet Studwell (ID 3)
  if (residentId === 3) {
    return [
      {
        id: 'med-1',
        name: 'Aspirin',
        dosage: '325mg',
        quantity: '1 tablet',
        route: 'oral',
        times: '8:00 AM',
        notes: '7 &8 PO DAILY FOR HEART DISEASE',
        prescribedBy: 'Sharis Arakelian',
        status: 'Active',
      },
      {
        id: 'med-2',
        name: 'Duloxetin',
        dosage: '60mg',
        quantity: '1 capsule',
        route: 'oral',
        times: '8:00 AM',
        notes: '',
        prescribedBy: 'Sharis Arakelian',
        status: 'Active',
      },
    ];
  }

  // Default mock medications for other residents
  return [
    {
      id: 'med-default',
      name: 'Sample Medication',
      dosage: '100mg',
      quantity: '1 tablet',
      route: 'oral',
      times: '8:00 AM',
      notes: '',
      prescribedBy: 'Dr. Smith',
      status: 'Active',
    },
  ];
}
