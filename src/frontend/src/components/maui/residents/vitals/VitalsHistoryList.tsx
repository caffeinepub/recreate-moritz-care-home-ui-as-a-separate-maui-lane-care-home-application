import { Activity, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useListVitalsEntries, useDeleteVitalsEntry } from '@/hooks/useQueries';
import { toast } from 'sonner';
import type { ResidentId } from '@/backend';

interface VitalsHistoryListProps {
  residentId: ResidentId;
}

export function VitalsHistoryList({ residentId }: VitalsHistoryListProps) {
  const { data: vitals = [], isLoading } = useListVitalsEntries(residentId);
  const deleteVitals = useDeleteVitalsEntry();

  const handleDelete = async (timestamp: bigint) => {
    try {
      await deleteVitals.mutateAsync({ residentId, timestamp });
      toast.success('Vitals entry deleted successfully');
    } catch (error) {
      console.error('Error deleting vitals:', error);
      toast.error('Failed to delete vitals entry. Please try again.');
    }
  };

  const formatDateTime = (timestamp: bigint) => {
    const date = new Date(Number(timestamp));
    return {
      date: date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
  };

  const getOxygenStatus = (level: bigint): { variant: 'default' | 'destructive' | 'secondary'; label: string } => {
    const value = Number(level);
    if (value >= 95) return { variant: 'default', label: 'Normal' };
    if (value >= 90) return { variant: 'secondary', label: 'Low' };
    return { variant: 'destructive', label: 'Critical' };
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-24 rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (vitals.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Activity className="mb-4 h-12 w-12 text-muted-foreground/40" />
          <h3 className="mb-2 text-lg font-semibold">No vitals recorded yet</h3>
          <p className="text-sm text-muted-foreground">
            Click "Record Daily Vitals" to add the first entry
          </p>
        </CardContent>
      </Card>
    );
  }

  // Sort vitals by timestamp (newest first)
  const sortedVitals = [...vitals].sort((a, b) => Number(b.timestamp - a.timestamp));

  return (
    <div className="space-y-4">
      {sortedVitals.map((vital) => {
        const { date, time } = formatDateTime(vital.timestamp);
        const oxygenStatus = getOxygenStatus(vital.bloodOxygen);

        return (
          <Card key={Number(vital.timestamp)} className="transition-shadow hover:shadow-md">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-4 flex items-center gap-3">
                    <Activity className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-semibold">{date}</p>
                      <p className="text-sm text-muted-foreground">{time}</p>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Temperature</p>
                      <p className="text-lg font-semibold">{vital.temperature.toFixed(1)}°F</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Blood Pressure</p>
                      <p className="text-lg font-semibold">{vital.bloodPressure}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Pulse Rate</p>
                      <p className="text-lg font-semibold">{vital.pulse.toString()} bpm</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Oxygen Saturation</p>
                      <div className="flex items-center gap-2">
                        <p className="text-lg font-semibold">{vital.bloodOxygen.toString()}%</p>
                        <Badge variant={oxygenStatus.variant} className="text-xs">
                          {oxygenStatus.label}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="ml-4 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Vitals Entry</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this vitals entry from {date} at {time}? This
                        action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(vital.timestamp)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
