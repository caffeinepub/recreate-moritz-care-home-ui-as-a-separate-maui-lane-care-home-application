import { useState, useEffect } from 'react';
import { X, Plus, Trash2, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MedicationRouteSelect } from './MedicationRouteSelect';
import { MedicationPhysicianSelect, PHYSICIAN_UNASSIGNED } from './MedicationPhysicianSelect';
import { routeToSelectValue, selectValueToRoute, ROUTE_UNSET } from '@/lib/medicationRoutes';
import type { Medication, Physician } from '@/backend';

interface EditMedicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medication: Medication | null;
  physicians: Physician[];
  onSave: (medication: Medication) => void;
}

export function EditMedicationDialog({
  open,
  onOpenChange,
  medication,
  physicians,
  onSave,
}: EditMedicationDialogProps) {
  const [medicationName, setMedicationName] = useState('');
  const [dosage, setDosage] = useState('');
  const [route, setRoute] = useState<string>(ROUTE_UNSET);
  const [times, setTimes] = useState<string[]>(['']);
  const [prescriber, setPrescriber] = useState<string>(PHYSICIAN_UNASSIGNED);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Initialize form when medication changes or dialog opens
  useEffect(() => {
    if (open && medication) {
      setMedicationName(medication.medicationName);
      setDosage(medication.dosage);
      // Reset to placeholder (required fields)
      setRoute(ROUTE_UNSET);
      setPrescriber(PHYSICIAN_UNASSIGNED);
      setTimes(
        medication.administrationTimes.length > 0
          ? medication.administrationTimes
          : ['']
      );
      setValidationErrors([]);
    }
  }, [open, medication]);

  const handleAddTime = () => {
    setTimes([...times, '']);
  };

  const handleRemoveTime = (index: number) => {
    if (times.length > 1) {
      setTimes(times.filter((_, i) => i !== index));
    }
  };

  const handleTimeChange = (index: number, value: string) => {
    const newTimes = [...times];
    newTimes[index] = value;
    setTimes(newTimes);
  };

  const validateForm = (): boolean => {
    const errors: string[] = [];

    if (!medicationName.trim()) {
      errors.push('Medication name is required');
    }

    if (!dosage.trim()) {
      errors.push('Dosage is required');
    }

    if (route === ROUTE_UNSET) {
      errors.push('Route is required');
    }

    if (prescriber === PHYSICIAN_UNASSIGNED || !prescriber.trim()) {
      errors.push('Prescribing physician is required');
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!medication) return;

    // Validate form
    if (!validateForm()) {
      return;
    }

    // Filter out empty times
    const filteredTimes = times.filter((time) => time.trim() !== '');

    // Convert route to backend format
    const backendRoute = selectValueToRoute(route);

    const updatedMedication: Medication = {
      ...medication,
      medicationName: medicationName.trim(),
      dosage: dosage.trim(),
      route: backendRoute,
      administrationTimes: filteredTimes,
      prescribingPhysician: prescriber.trim(),
    };

    onSave(updatedMedication);
  };

  const handleCancel = () => {
    setValidationErrors([]);
    onOpenChange(false);
  };

  if (!medication) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Edit Medication</DialogTitle>
              <DialogDescription className="mt-1">
                Update medication details for this resident
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCancel}
              className="h-6 w-6 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {validationErrors.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <ul className="list-disc list-inside space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Medication Name */}
          <div className="space-y-2">
            <Label htmlFor="medicationName">
              Medication Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="medicationName"
              type="text"
              placeholder="e.g., Lisinopril"
              value={medicationName}
              onChange={(e) => setMedicationName(e.target.value)}
              required
            />
          </div>

          {/* Dosage */}
          <div className="space-y-2">
            <Label htmlFor="dosage">
              Dosage <span className="text-destructive">*</span>
            </Label>
            <Input
              id="dosage"
              type="text"
              placeholder="e.g., 10mg"
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              required
            />
          </div>

          {/* Administration Route */}
          <MedicationRouteSelect
            value={route}
            onValueChange={setRoute}
            required
          />

          {/* Administration Times */}
          <div className="space-y-2">
            <Label>Administration Times</Label>
            <div className="space-y-2">
              {times.map((time, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    type="time"
                    value={time}
                    onChange={(e) => handleTimeChange(index, e.target.value)}
                    placeholder="HH:MM"
                    className="flex-1"
                  />
                  {times.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => handleRemoveTime(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddTime}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Time
              </Button>
            </div>
          </div>

          {/* Prescribing Physician */}
          <MedicationPhysicianSelect
            value={prescriber}
            onValueChange={setPrescriber}
            physicians={physicians}
            required
          />

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
