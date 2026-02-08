import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import type { Physician } from '@/backend';

export const PHYSICIAN_UNASSIGNED = '__UNASSIGNED__';

interface MedicationPhysicianSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  physicians: Physician[];
  required?: boolean;
}

export function MedicationPhysicianSelect({
  value,
  onValueChange,
  physicians,
  required = false,
}: MedicationPhysicianSelectProps) {
  const hasPhysicians = physicians.length > 0;

  if (!hasPhysicians) {
    return (
      <div className="space-y-2">
        <Label htmlFor="prescriber">
          Prescribing Physician
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
        <Input
          id="prescriber"
          type="text"
          placeholder="Enter physician name"
          value={value === PHYSICIAN_UNASSIGNED ? '' : value}
          onChange={(e) => onValueChange(e.target.value)}
          disabled
          className="bg-muted"
        />
        <p className="text-sm text-muted-foreground">
          No physicians registered. Please add physicians in the resident information first.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="prescriber">
        Prescribing Physician
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger id="prescriber">
          <SelectValue placeholder={required ? "Select physician" : "Select physician (optional)"} />
        </SelectTrigger>
        <SelectContent>
          {value === PHYSICIAN_UNASSIGNED && (
            <SelectItem value={PHYSICIAN_UNASSIGNED} disabled className="text-muted-foreground">
              {required ? "Select physician" : "None / Unassigned"}
            </SelectItem>
          )}
          {physicians.map((physician, index) => (
            <SelectItem key={index} value={physician.name}>
              {physician.name}
              {physician.specialty && ` - ${physician.specialty}`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
