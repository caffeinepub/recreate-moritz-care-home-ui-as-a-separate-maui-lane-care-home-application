import type { Medication } from '@/backend';
import { MedicationStatus } from '@/backend';

/**
 * Update a medication in an array by its ID
 */
export function updateMedicationById(
  medications: Medication[],
  medicationId: bigint,
  updates: Partial<Omit<Medication, 'id'>>
): Medication[] {
  return medications.map((med) =>
    med.id === medicationId ? { ...med, ...updates } : med
  );
}

/**
 * Remove a medication from an array by its ID (sets status to deleted)
 */
export function deleteMedicationById(
  medications: Medication[],
  medicationId: bigint
): Medication[] {
  return medications.map((med) =>
    med.id === medicationId ? { ...med, status: MedicationStatus.deleted } : med
  );
}

/**
 * Toggle medication status between active and discontinued
 */
export function toggleMedicationStatus(
  medications: Medication[],
  medicationId: bigint
): Medication[] {
  return medications.map((med) => {
    if (med.id === medicationId) {
      const newStatus =
        med.status === MedicationStatus.active ? MedicationStatus.discontinued : MedicationStatus.active;
      return { ...med, status: newStatus };
    }
    return med;
  });
}

/**
 * Filter medications to only active ones
 */
export function getActiveMedications(medications: Medication[]): Medication[] {
  return medications.filter((med) => med.status === MedicationStatus.active);
}

/**
 * Filter medications to exclude deleted ones
 */
export function getVisibleMedications(medications: Medication[]): Medication[] {
  return medications.filter((med) => med.status !== MedicationStatus.deleted);
}

/**
 * Generate a unique medication ID based on existing medications
 */
export function generateMedicationId(medications: Medication[]): bigint {
  if (medications.length === 0) return BigInt(1);
  const maxId = medications.reduce(
    (max, med) => (med.id > max ? med.id : max),
    BigInt(0)
  );
  return maxId + BigInt(1);
}
