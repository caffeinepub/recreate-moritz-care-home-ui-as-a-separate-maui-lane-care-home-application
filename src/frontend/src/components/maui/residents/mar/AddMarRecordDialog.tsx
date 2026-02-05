import { useState } from 'react';
import { X } from 'lucide-react';
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
import { useCreateMarRecord } from '@/hooks/useQueries';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { toast } from 'sonner';
import type { MarRecord, ResidentId } from '@/backend';
import type { Medication } from '@/pages/maui/residents/mockResidentMedications';

interface AddMarRecordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  residentId: ResidentId;
  activeMedications: Medication[];
}

export function AddMarRecordDialog({
  open,
  onOpenChange,
  residentId,
  activeMedications,
}: AddMarRecordDialogProps) {
  const createMarRecord = useCreateMarRecord();
  const { identity } = useInternetIdentity();

  const [selectedMedication, setSelectedMedication] = useState('');
  const [administrationTime, setAdministrationTime] = useState('');
  const [administeredBy, setAdministeredBy] = useState('');
  const [notes, setNotes] = useState('');

  const resetForm = () => {
    setSelectedMedication('');
    setAdministrationTime('');
    setAdministeredBy('');
    setNotes('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!selectedMedication || !administrationTime || !administeredBy) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!identity) {
      toast.error('You must be logged in to add MAR records');
      return;
    }

    // Find the selected medication to get dosage
    const medication = activeMedications.find((med) => med.id === selectedMedication);
    if (!medication) {
      toast.error('Selected medication not found');
      return;
    }

    // Parse the datetime-local input
    const timestamp = BigInt(new Date(administrationTime).getTime());

    const record: MarRecord = {
      timestamp,
      medicationName: medication.name,
      dosage: medication.dosage,
      administrationTime,
      nurseId: identity.getPrincipal(),
    };

    try {
      await createMarRecord.mutateAsync({ residentId, record });
      toast.success('MAR record added successfully');
      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating MAR record:', error);
      toast.error('Failed to add MAR record. Please try again.');
    }
  };

  const handleCancel = () => {
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Add MAR Record</DialogTitle>
              <DialogDescription className="mt-1">
                Record medication administration for active medications
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
          {/* Active Medication */}
          <div className="space-y-2">
            <Label htmlFor="medication">
              Active Medication <span className="text-destructive">*</span>
            </Label>
            <Select value={selectedMedication} onValueChange={setSelectedMedication}>
              <SelectTrigger id="medication">
                <SelectValue placeholder="Select active medication" />
              </SelectTrigger>
              <SelectContent>
                {activeMedications.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground">No active medications</div>
                ) : (
                  activeMedications.map((med) => (
                    <SelectItem key={med.id} value={med.id}>
                      {med.name} - {med.dosage}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Administration Time */}
          <div className="space-y-2">
            <Label htmlFor="administrationTime">
              Administration Time <span className="text-destructive">*</span>
            </Label>
            <Input
              id="administrationTime"
              type="datetime-local"
              value={administrationTime}
              onChange={(e) => setAdministrationTime(e.target.value)}
              required
            />
          </div>

          {/* Administered By */}
          <div className="space-y-2">
            <Label htmlFor="administeredBy">
              Administered By <span className="text-destructive">*</span>
            </Label>
            <Input
              id="administeredBy"
              type="text"
              placeholder="Staff name"
              value={administeredBy}
              onChange={(e) => setAdministeredBy(e.target.value)}
              required
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any additional notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMarRecord.isPending}>
              {createMarRecord.isPending ? 'Adding...' : 'Add Record'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
