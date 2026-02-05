import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, UserCheck, UserX } from 'lucide-react';
import { StatusFilter } from '@/pages/maui/residents/residentListUtils';

interface ResidentStatusTabsProps {
  value: StatusFilter;
  onValueChange: (value: StatusFilter) => void;
}

export function ResidentStatusTabs({ value, onValueChange }: ResidentStatusTabsProps) {
  return (
    <Tabs value={value} onValueChange={(v) => onValueChange(v as StatusFilter)} className="mb-6">
      <TabsList className="grid w-full max-w-md grid-cols-3">
        <TabsTrigger value="All" className="gap-2">
          <Users className="h-4 w-4" />
          All
        </TabsTrigger>
        <TabsTrigger value="Active" className="gap-2">
          <UserCheck className="h-4 w-4" />
          Active
        </TabsTrigger>
        <TabsTrigger value="Discharged" className="gap-2">
          <UserX className="h-4 w-4" />
          Discharged
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
