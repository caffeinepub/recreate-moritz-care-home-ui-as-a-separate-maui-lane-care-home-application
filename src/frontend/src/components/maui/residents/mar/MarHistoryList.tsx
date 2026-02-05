import { Pill, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
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
import { useListMarRecords, useDeleteMarRecord } from '@/hooks/useQueries';
import { toast } from 'sonner';
import type { ResidentId } from '@/backend';

interface MarHistoryListProps {
  residentId: ResidentId;
}

export function MarHistoryList({ residentId }: MarHistoryListProps) {
  const { data: marRecords = [], isLoading } = useListMarRecords(residentId);
  const deleteMarRecord = useDeleteMarRecord();

  const handleDelete = async (timestamp: bigint) => {
    try {
      await deleteMarRecord.mutateAsync({ residentId, timestamp });
      toast.success('MAR record deleted successfully');
    } catch (error) {
      console.error('Error deleting MAR record:', error);
      toast.error('Failed to delete MAR record. Please try again.');
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

  if (marRecords.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Pill className="mb-4 h-12 w-12 text-muted-foreground/40" />
          <h3 className="mb-2 text-lg font-semibold">No MAR records yet</h3>
          <p className="text-sm text-muted-foreground">
            Click "Add MAR Record" to record medication administration
          </p>
        </CardContent>
      </Card>
    );
  }

  // Sort MAR records by timestamp (newest first)
  const sortedRecords = [...marRecords].sort((a, b) => Number(b.timestamp - a.timestamp));

  return (
    <div className="space-y-4">
      {sortedRecords.map((record) => {
        const { date, time } = formatDateTime(record.timestamp);

        return (
          <Card key={Number(record.timestamp)} className="transition-shadow hover:shadow-md">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-4 flex items-center gap-3">
                    <Pill className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-semibold">{date}</p>
                      <p className="text-sm text-muted-foreground">{time}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Medication</p>
                      <p className="text-lg font-semibold">{record.medicationName}</p>
                    </div>
                    <Separator />
                    <div className="grid gap-3 md:grid-cols-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Dosage</p>
                        <p className="font-medium">{record.dosage}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Administered By</p>
                        <p className="font-medium">{record.nurseId.toString().slice(0, 10)}...</p>
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
                      <AlertDialogTitle>Delete MAR Record</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this MAR record for {record.medicationName} from{' '}
                        {date} at {time}? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(record.timestamp)}
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
