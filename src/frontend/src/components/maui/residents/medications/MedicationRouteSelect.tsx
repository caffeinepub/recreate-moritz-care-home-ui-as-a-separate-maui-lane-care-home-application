import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { MEDICATION_ROUTES, ROUTE_UNSET } from '@/lib/medicationRoutes';

interface MedicationRouteSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  label?: string;
  required?: boolean;
}

export function MedicationRouteSelect({
  value,
  onValueChange,
  label = 'Administration Route',
  required = false,
}: MedicationRouteSelectProps) {
  const [showOtherInput, setShowOtherInput] = useState(value.startsWith('other:'));
  const [otherText, setOtherText] = useState(
    value.startsWith('other:') ? value.substring(6) : ''
  );

  const handleSelectChange = (newValue: string) => {
    if (newValue === 'other') {
      setShowOtherInput(true);
      setOtherText('');
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
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      <Select
        value={showOtherInput ? 'other' : value}
        onValueChange={handleSelectChange}
      >
        <SelectTrigger id="route">
          <SelectValue placeholder="Select route (optional)" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ROUTE_UNSET}>None / Unspecified</SelectItem>
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
