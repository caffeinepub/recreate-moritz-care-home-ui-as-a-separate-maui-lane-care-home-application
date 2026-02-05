import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface ResidentDashboardHeaderProps {
  onAddResident: () => void;
}

export function ResidentDashboardHeader({ onAddResident }: ResidentDashboardHeaderProps) {
  return (
    <div className="mb-6 flex items-start justify-between">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Resident Management</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage and monitor all residents</p>
      </div>
      <Button onClick={onAddResident} className="gap-2">
        <Plus className="h-4 w-4" />
        Add New Resident
      </Button>
    </div>
  );
}
