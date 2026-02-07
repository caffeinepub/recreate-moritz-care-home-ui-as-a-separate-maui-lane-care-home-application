import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import type { Physician } from '@/backend';

// Sentinel value for "None/Unassigned" physician
export const PHYSICIAN_UNASSIGNED = '__UNASSIGNED__';

interface MedicationPhysicianSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  physicians: Physician[];
  label?: string;
  required?: boolean;
}

export function MedicationPhysicianSelect({
  value,
  onValueChange,
  physicians,
  label = 'Prescribing Physician',
  required = false,
}: MedicationPhysicianSelectProps) {
  if (physicians.length === 0) {
    // Fallback to text input when no physicians are available
    return (
      <div className="space-y-2">
        <Label htmlFor="prescribingPhysician">
          {label}
          {required && <span className="text-destructive"> *</span>}
        </Label>
        <Input
          id="prescribingPhysician"
          type="text"
          placeholder="Physician name (optional)"
          value={value === PHYSICIAN_UNASSIGNED ? '' : value}
          onChange={(e) => onValueChange(e.target.value)}
          disabled={physicians.length === 0}
        />
        <p className="text-sm text-muted-foreground">
          No physicians on file. Add physicians in resident information to use the dropdown.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="prescribingPhysician">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      <Select value={value || PHYSICIAN_UNASSIGNED} onValueChange={onValueChange}>
        <SelectTrigger id="prescribingPhysician">
          <SelectValue placeholder="Select physician (optional)" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={PHYSICIAN_UNASSIGNED}>None / Unassigned</SelectItem>
          {physicians.map((physician, index) => (
            <SelectItem key={index} value={physician.name}>
              {physician.name} - {physician.specialty}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
