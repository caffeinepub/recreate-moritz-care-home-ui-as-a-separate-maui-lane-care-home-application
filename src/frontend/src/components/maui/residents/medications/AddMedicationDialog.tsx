import { useState } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface Physician {
  name: string;
  specialty: string;
  contactNumber: string;
}

interface AddMedicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignedPhysicians: Physician[];
  onAddMedication: (medication: {
    name: string;
    dosage?: string;
    route?: string;
    times?: string[];
    prescriber?: string;
    notes?: string;
  }) => void;
}

export function AddMedicationDialog({
  open,
  onOpenChange,
  assignedPhysicians,
  onAddMedication,
}: AddMedicationDialogProps) {
  const [medicationName, setMedicationName] = useState('');
  const [dosage, setDosage] = useState('');
  const [administrationRoute, setAdministrationRoute] = useState('Oral');
  const [administrationTimes, setAdministrationTimes] = useState<string[]>(['']);
  const [prescribingPhysician, setPrescribingPhysician] = useState('');
  const [notes, setNotes] = useState('');
  const [medicationNameError, setMedicationNameError] = useState('');

  const resetForm = () => {
    setMedicationName('');
    setDosage('');
    setAdministrationRoute('Oral');
    setAdministrationTimes(['']);
    setPrescribingPhysician('');
    setNotes('');
    setMedicationNameError('');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!medicationName.trim()) {
      setMedicationNameError('Medication name is required');
      toast.error('Please fill in all required fields');
      return;
    }

    setMedicationNameError('');

    // Filter out empty times
    const validTimes = administrationTimes.filter((time) => time.trim() !== '');

    onAddMedication({
      name: medicationName.trim(),
      dosage: dosage.trim() || undefined,
      route: administrationRoute,
      times: validTimes.length > 0 ? validTimes : undefined,
      prescriber: prescribingPhysician || undefined,
      notes: notes.trim() || undefined,
    });

    toast.success('Medication added successfully');
    resetForm();
    onOpenChange(false);
  };

  const handleCancel = () => {
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Add Medication</DialogTitle>
              <DialogDescription className="mt-1">
                Add a new medication for this resident.
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
              placeholder="e.g., Aspirin"
              value={medicationName}
              onChange={(e) => {
                setMedicationName(e.target.value);
                if (medicationNameError) setMedicationNameError('');
              }}
              className={medicationNameError ? 'border-destructive' : ''}
            />
            {medicationNameError && (
              <p className="text-sm text-destructive">{medicationNameError}</p>
            )}
          </div>

          {/* Dosage */}
          <div className="space-y-2">
            <Label htmlFor="dosage">Dosage</Label>
            <Input
              id="dosage"
              type="text"
              placeholder="e.g., 100mg"
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
            />
          </div>

          {/* Administration Route */}
          <div className="space-y-2">
            <Label htmlFor="administrationRoute">Administration Route</Label>
            <Select value={administrationRoute} onValueChange={setAdministrationRoute}>
              <SelectTrigger id="administrationRoute">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Oral">Oral</SelectItem>
                <SelectItem value="Sublingual">Sublingual</SelectItem>
                <SelectItem value="Topical">Topical</SelectItem>
                <SelectItem value="Intravenous">Intravenous</SelectItem>
                <SelectItem value="Intramuscular">Intramuscular</SelectItem>
                <SelectItem value="Subcutaneous">Subcutaneous</SelectItem>
                <SelectItem value="Inhalation">Inhalation</SelectItem>
                <SelectItem value="Rectal">Rectal</SelectItem>
                <SelectItem value="Transdermal">Transdermal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Administration Times */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Administration Times</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddTime}
                className="gap-1"
              >
                <Plus className="h-3 w-3" />
                Add Time
              </Button>
            </div>
            <div className="space-y-2">
              {administrationTimes.map((time, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="e.g., 8:00 AM"
                    value={time}
                    onChange={(e) => handleTimeChange(index, e.target.value)}
                    className="flex-1"
                  />
                  {administrationTimes.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveTime(index)}
                      className="h-10 w-10 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Prescribing Physician */}
          <div className="space-y-2">
            <Label htmlFor="prescribingPhysician">Prescribing Physician</Label>
            <Select value={prescribingPhysician} onValueChange={setPrescribingPhysician}>
              <SelectTrigger id="prescribingPhysician">
                <SelectValue placeholder="Select a physician (optional)" />
              </SelectTrigger>
              <SelectContent>
                {assignedPhysicians.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground">No assigned physicians</div>
                ) : (
                  assignedPhysicians.map((physician, index) => (
                    <SelectItem key={index} value={physician.name}>
                      {physician.name} - {physician.specialty}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional instructions or notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit">Add Medication</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
