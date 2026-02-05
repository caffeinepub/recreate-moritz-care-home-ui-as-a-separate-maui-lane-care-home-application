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
import { useCreateVitalsEntry } from '@/hooks/useQueries';
import { toast } from 'sonner';
import type { VitalsRecord, ResidentId } from '@/backend';

interface RecordDailyVitalsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  residentId: ResidentId;
}

export function RecordDailyVitalsDialog({ open, onOpenChange, residentId }: RecordDailyVitalsDialogProps) {
  const createVitals = useCreateVitalsEntry();

  const [temperature, setTemperature] = useState('98.6');
  const [temperatureUnit, setTemperatureUnit] = useState('F');
  const [systolic, setSystolic] = useState('120');
  const [diastolic, setDiastolic] = useState('80');
  const [pulseRate, setPulseRate] = useState('72');
  const [respiratoryRate, setRespiratoryRate] = useState('16');
  const [oxygenSaturation, setOxygenSaturation] = useState('98');
  const [bloodGlucose, setBloodGlucose] = useState('');
  const [measurementDate, setMeasurementDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [measurementTime, setMeasurementTime] = useState(
    new Date().toTimeString().slice(0, 5)
  );
  const [notes, setNotes] = useState('');

  const resetForm = () => {
    setTemperature('98.6');
    setTemperatureUnit('F');
    setSystolic('120');
    setDiastolic('80');
    setPulseRate('72');
    setRespiratoryRate('16');
    setOxygenSaturation('98');
    setBloodGlucose('');
    setMeasurementDate(new Date().toISOString().split('T')[0]);
    setMeasurementTime(new Date().toTimeString().slice(0, 5));
    setNotes('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields (Respiratory Rate is now optional)
    if (
      !temperature ||
      !systolic ||
      !diastolic ||
      !pulseRate ||
      !oxygenSaturation ||
      !measurementDate ||
      !measurementTime
    ) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Combine date and time into timestamp
    const dateTimeString = `${measurementDate}T${measurementTime}:00`;
    const timestamp = BigInt(new Date(dateTimeString).getTime());

    // Convert temperature to Fahrenheit if needed
    let tempF = parseFloat(temperature);
    if (temperatureUnit === 'C') {
      tempF = (tempF * 9) / 5 + 32;
    }

    const record: VitalsRecord = {
      timestamp,
      temperature: tempF,
      bloodPressure: `${systolic}/${diastolic}`,
      pulse: BigInt(pulseRate),
      bloodOxygen: BigInt(oxygenSaturation),
    };

    try {
      await createVitals.mutateAsync({ residentId, record });
      toast.success('Vitals recorded successfully');
      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error('Error recording vitals:', error);
      toast.error('Failed to record vitals. Please try again.');
    }
  };

  const handleCancel = () => {
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Record Daily Vitals</DialogTitle>
              <DialogDescription className="mt-1">
                Enter the resident's vital signs measurements. Blood Glucose and Respiratory Rate are optional.
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

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Temperature */}
            <div className="space-y-2">
              <Label htmlFor="temperature">
                Temperature <span className="text-destructive">*</span>
              </Label>
              <div className="flex gap-2">
                <Input
                  id="temperature"
                  type="number"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  required
                  className="flex-1"
                />
                <Select value={temperatureUnit} onValueChange={setTemperatureUnit}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="F">°F</SelectItem>
                    <SelectItem value="C">°C</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Blood Pressure */}
            <div className="space-y-2">
              <Label>
                Blood Pressure <span className="text-destructive">*</span>
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="120"
                  value={systolic}
                  onChange={(e) => setSystolic(e.target.value)}
                  required
                />
                <span className="text-muted-foreground">/</span>
                <Input
                  type="number"
                  placeholder="80"
                  value={diastolic}
                  onChange={(e) => setDiastolic(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Pulse Rate */}
            <div className="space-y-2">
              <Label htmlFor="pulse">
                Pulse Rate (bpm) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="pulse"
                type="number"
                value={pulseRate}
                onChange={(e) => setPulseRate(e.target.value)}
                required
              />
            </div>

            {/* Respiratory Rate */}
            <div className="space-y-2">
              <Label htmlFor="respiratory">
                Respiratory Rate (breaths/min) (Optional)
              </Label>
              <Input
                id="respiratory"
                type="number"
                value={respiratoryRate}
                onChange={(e) => setRespiratoryRate(e.target.value)}
              />
            </div>

            {/* Oxygen Saturation */}
            <div className="space-y-2">
              <Label htmlFor="oxygen">
                Oxygen Saturation (%) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="oxygen"
                type="number"
                value={oxygenSaturation}
                onChange={(e) => setOxygenSaturation(e.target.value)}
                required
              />
            </div>

            {/* Blood Glucose */}
            <div className="space-y-2">
              <Label htmlFor="glucose">Blood Glucose (mg/dL) (Optional)</Label>
              <Input
                id="glucose"
                type="number"
                value={bloodGlucose}
                onChange={(e) => setBloodGlucose(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">For residents requiring diabetes monitoring</p>
            </div>

            {/* Measurement Date */}
            <div className="space-y-2">
              <Label htmlFor="date">
                Measurement Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="date"
                type="date"
                value={measurementDate}
                onChange={(e) => setMeasurementDate(e.target.value)}
                required
              />
            </div>

            {/* Measurement Time */}
            <div className="space-y-2">
              <Label htmlFor="time">
                Measurement Time <span className="text-destructive">*</span>
              </Label>
              <Input
                id="time"
                type="time"
                value={measurementTime}
                onChange={(e) => setMeasurementTime(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any additional observations or notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={createVitals.isPending}>
              {createVitals.isPending ? 'Recording...' : 'Record Vitals'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
