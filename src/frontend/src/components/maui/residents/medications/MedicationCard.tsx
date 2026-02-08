import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { Medication } from '@/backend';
import { MedicationStatus } from '@/backend';
import { formatRouteForDisplay } from '@/lib/medicationRoutes';
import { MedicationRowActions } from './MedicationRowActions';

interface MedicationCardProps {
  medication: Medication;
  onEdit: (medication: Medication) => void;
  onDiscontinue: (medicationId: bigint) => void;
  onResume: (medicationId: bigint) => void;
  onDelete: (medicationId: bigint) => void;
}

export function MedicationCard({
  medication,
  onEdit,
  onDiscontinue,
  onResume,
  onDelete,
}: MedicationCardProps) {
  const isActive = medication.status === MedicationStatus.active;
  const routeDisplay = formatRouteForDisplay(medication.route);
  const timesDisplay = medication.administrationTimes.join(', ');

  return (
    <Card className="relative">
      <CardContent className="pt-6">
        {/* Header Row: Name + Status + Actions */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-foreground truncate">
              {medication.medicationName}
            </h3>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge variant={isActive ? 'default' : 'secondary'}>
              {isActive ? 'Active' : 'Discontinued'}
            </Badge>
            <MedicationRowActions
              medication={medication}
              onEdit={onEdit}
              onDiscontinue={onDiscontinue}
              onResume={onResume}
              onDelete={onDelete}
            />
          </div>
        </div>

        {/* Labeled Fields */}
        <div className="space-y-3">
          <div>
            <p className="text-sm text-muted-foreground">Dosage:</p>
            <p className="text-sm font-medium">{medication.dosage}</p>
          </div>

          {routeDisplay && (
            <div>
              <p className="text-sm text-muted-foreground">Route:</p>
              <p className="text-sm font-medium">{routeDisplay}</p>
            </div>
          )}

          {timesDisplay && (
            <div>
              <p className="text-sm text-muted-foreground">Times:</p>
              <p className="text-sm font-medium">{timesDisplay}</p>
            </div>
          )}

          {medication.prescribingPhysician && (
            <div>
              <p className="text-sm text-muted-foreground">Prescribing Physician:</p>
              <p className="text-sm font-medium">{medication.prescribingPhysician}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
