import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
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
import { MedicationRouteSelect } from './MedicationRouteSelect';
import { MedicationPhysicianSelect, PHYSICIAN_UNASSIGNED } from './MedicationPhysicianSelect';
import { routeToSelectValue, selectValueToRoute } from '@/lib/medicationRoutes';
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
  const [administrationTimes, setAdministrationTimes] = useState<string[]>(['']);
  const [route, setRoute] = useState<string>('');
  const [prescribingPhysician, setPrescribingPhysician] = useState<string>(PHYSICIAN_UNASSIGNED);

  // Reset form when medication changes
  useEffect(() => {
    if (medication) {
      setMedicationName(medication.medicationName);
      setDosage(medication.dosage);
      setAdministrationTimes(
        medication.administrationTimes.length > 0 ? medication.administrationTimes : ['']
      );
      setRoute(routeToSelectValue(medication.route));
      setPrescribingPhysician(
        medication.prescribingPhysician ? medication.prescribingPhysician : PHYSICIAN_UNASSIGNED
      );
    }
  }, [medication]);

  const resetForm = () => {
    setMedicationName('');
    setDosage('');
    setAdministrationTimes(['']);
    setRoute('');
    setPrescribingPhysician(PHYSICIAN_UNASSIGNED);
  };

  const handleAddTime = () => {
    setAdministrationTimes([...administrationTimes, '']);
  };

  const handleRemoveTime = (index: number) => {
    if (administrationTimes.length > 1) {
      setAdministrationTimes(administrationTimes.filter((_, i) => i !== index));
    }
  };

  const handleTimeChange = (index: number, value: string) => {
    const newTimes = [...administrationTimes];
    newTimes[index] = value;
    setAdministrationTimes(newTimes);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!medication) return;

    // Filter out empty times
    const filteredTimes = administrationTimes.filter((time) => time.trim() !== '');

    const updatedMedication: Medication = {
      ...medication,
      medicationName: medicationName.trim(),
      dosage: dosage.trim(),
      administrationTimes: filteredTimes,
      route: selectValueToRoute(route),
      prescribingPhysician:
        prescribingPhysician === PHYSICIAN_UNASSIGNED ? '' : prescribingPhysician.trim(),
    };

    onSave(updatedMedication);
    resetForm();
    onOpenChange(false);
  };

  const handleCancel = () => {
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Edit Medication</DialogTitle>
              <DialogDescription className="mt-1">
                Update medication details
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
          <MedicationRouteSelect value={route} onValueChange={setRoute} />

          {/* Administration Times */}
          <div className="space-y-2">
            <Label>Administration Times</Label>
            <div className="space-y-2">
              {administrationTimes.map((time, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    type="time"
                    value={time}
                    onChange={(e) => handleTimeChange(index, e.target.value)}
                    placeholder="HH:MM"
                    className="flex-1"
                  />
                  {administrationTimes.length > 1 && (
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
            value={prescribingPhysician}
            onValueChange={setPrescribingPhysician}
            physicians={physicians}
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
