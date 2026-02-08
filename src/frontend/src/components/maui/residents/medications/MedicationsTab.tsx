import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import type { Medication } from '@/backend';
import { MedicationCard } from './MedicationCard';

interface MedicationsTabProps {
  medications: Medication[];
  onAddMedication: () => void;
  onEditMedication: (medication: Medication) => void;
  onDiscontinueMedication: (medicationId: bigint) => void;
  onResumeMedication: (medicationId: bigint) => void;
  onDeleteMedication: (medicationId: bigint) => void;
}

export function MedicationsTab({
  medications,
  onAddMedication,
  onEditMedication,
  onDiscontinueMedication,
  onResumeMedication,
  onDeleteMedication,
}: MedicationsTabProps) {
  return (
    <div className="space-y-4">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Active Medications</h2>
        <Button onClick={onAddMedication} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Medication
        </Button>
      </div>

      {/* Medications List */}
      {medications.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No medications recorded yet.</p>
          <p className="text-sm mt-1">Click "Add Medication" to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {medications.map((medication) => (
            <MedicationCard
              key={medication.id.toString()}
              medication={medication}
              onEdit={onEditMedication}
              onDiscontinue={onDiscontinueMedication}
              onResume={onResumeMedication}
              onDelete={onDeleteMedication}
            />
          ))}
        </div>
      )}
    </div>
  );
}
