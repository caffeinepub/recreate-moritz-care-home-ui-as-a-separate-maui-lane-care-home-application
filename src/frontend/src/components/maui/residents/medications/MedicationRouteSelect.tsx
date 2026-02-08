import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { MEDICATION_ROUTES, ROUTE_UNSET } from '@/lib/medicationRoutes';

interface MedicationRouteSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  required?: boolean;
}

export function MedicationRouteSelect({
  value,
  onValueChange,
  required = false,
}: MedicationRouteSelectProps) {
  const [otherText, setOtherText] = useState('');
  const [showOtherInput, setShowOtherInput] = useState(false);

  // Sync state when value prop changes
  useEffect(() => {
    if (value.startsWith('other:')) {
      const text = value.substring(6);
      setOtherText(text);
      setShowOtherInput(true);
    } else {
      setShowOtherInput(false);
      setOtherText('');
    }
  }, [value]);

  const handleSelectChange = (newValue: string) => {
    if (newValue === 'other') {
      setShowOtherInput(true);
      onValueChange('other:');
    } else {
      setShowOtherInput(false);
      setOtherText('');
      onValueChange(newValue);
    }
  };

  const handleOtherTextChange = (text: string) => {
    setOtherText(text);
    onValueChange(`other:${text}`);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="route">
        Administration Route
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Select value={showOtherInput ? 'other' : value} onValueChange={handleSelectChange}>
        <SelectTrigger id="route">
          <SelectValue placeholder={required ? "Select route" : "Select route (optional)"} />
        </SelectTrigger>
        <SelectContent>
          {value === ROUTE_UNSET && (
            <SelectItem value={ROUTE_UNSET} disabled className="text-muted-foreground">
              {required ? "Select route" : "None / Unspecified"}
            </SelectItem>
          )}
          {MEDICATION_ROUTES.map((route) => (
            <SelectItem key={route.value} value={route.value}>
              {route.label}
            </SelectItem>
          ))}
          <SelectItem value="other">Other (specify)</SelectItem>
        </SelectContent>
      </Select>

      {showOtherInput && (
        <Input
          type="text"
          placeholder="Specify other route"
          value={otherText}
          onChange={(e) => handleOtherTextChange(e.target.value)}
          className="mt-2"
        />
      )}
    </div>
  );
}
