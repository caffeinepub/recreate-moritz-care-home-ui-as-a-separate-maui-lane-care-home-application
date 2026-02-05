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
import { useCreateAdlRecord } from '@/hooks/useQueries';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { toast } from 'sonner';
import type { AdlRecord, ResidentId } from '@/backend';

interface AddAdlRecordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  residentId: ResidentId;
}

const ACTIVITY_OPTIONS = [
  'Bathing',
  'Dressing',
  'Toileting',
  'Transferring',
  'Continence',
  'Feeding',
  'Grooming',
  'Walking',
  'Medication Management',
];

const ASSISTANCE_LEVEL_OPTIONS = [
  'Independent',
  'Supervision',
  'Limited Assistance',
  'Extensive Assistance',
  'Total Dependence',
];

export function AddAdlRecordDialog({ open, onOpenChange, residentId }: AddAdlRecordDialogProps) {
  const createAdlRecord = useCreateAdlRecord();
  const { identity } = useInternetIdentity();

  const [date, setDate] = useState('');
  const [activityType, setActivityType] = useState('');
  const [assistanceLevel, setAssistanceLevel] = useState('');
  const [notes, setNotes] = useState('');

  const resetForm = () => {
    setDate('');
    setActivityType('');
    setAssistanceLevel('');
    setNotes('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!date || !activityType || !assistanceLevel) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!identity) {
      toast.error('You must be logged in to add ADL records');
      return;
    }

    // Parse the date input
    const timestamp = BigInt(new Date(date).getTime());

    const record: AdlRecord = {
      timestamp,
      activityType,
      assistanceLevel,
      notes,
      supervisorId: identity.getPrincipal(),
    };

    try {
      await createAdlRecord.mutateAsync({ residentId, record });
      toast.success('ADL record added successfully');
      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating ADL record:', error);
      toast.error('Failed to add ADL record. Please try again.');
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
              <DialogTitle>Add ADL Record</DialogTitle>
              <DialogDescription className="mt-1">
                Record activities of daily living
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
          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">
              Date <span className="text-destructive">*</span>
            </Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          {/* Activity */}
          <div className="space-y-2">
            <Label htmlFor="activity">
              Activity <span className="text-destructive">*</span>
            </Label>
            <Select value={activityType} onValueChange={setActivityType}>
              <SelectTrigger id="activity">
                <SelectValue placeholder="Select activity" />
              </SelectTrigger>
              <SelectContent>
                {ACTIVITY_OPTIONS.map((activity) => (
                  <SelectItem key={activity} value={activity}>
                    {activity}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Assistance Level */}
          <div className="space-y-2">
            <Label htmlFor="assistanceLevel">
              Assistance Level <span className="text-destructive">*</span>
            </Label>
            <Select value={assistanceLevel} onValueChange={setAssistanceLevel}>
              <SelectTrigger id="assistanceLevel">
                <SelectValue placeholder="Select assistance level" />
              </SelectTrigger>
              <SelectContent>
                {ASSISTANCE_LEVEL_OPTIONS.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Staff Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Staff Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any additional observations..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={createAdlRecord.isPending}>
              {createAdlRecord.isPending ? 'Adding...' : 'Add Record'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
