import type { ResidentViewModel } from '@/pages/maui/residents/residentDirectoryViewModel';
import { ResidentCard } from './ResidentCard';

interface ResidentGridProps {
  residents: ResidentViewModel[];
  onDeleteResident: (residentId: string) => void;
  onToggleResidentStatus: (residentId: string) => void;
}

export function ResidentGrid({ residents, onDeleteResident, onToggleResidentStatus }: ResidentGridProps) {
  if (residents.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <p className="text-muted-foreground">No residents found matching the current filters.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {residents.map((resident) => (
        <ResidentCard
          key={resident.id}
          resident={resident}
          onDeleteResident={onDeleteResident}
          onToggleResidentStatus={onToggleResidentStatus}
        />
      ))}
    </div>
  );
}
