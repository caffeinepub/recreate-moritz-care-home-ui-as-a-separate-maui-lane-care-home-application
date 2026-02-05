import { Activity, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
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
import { useDeleteAdlRecord } from '@/hooks/useQueries';
import { toast } from 'sonner';
import type { AdlRecord, ResidentId } from '@/backend';

interface AdlHistoryListProps {
  adlRecords: AdlRecord[];
  isLoading: boolean;
  residentId: ResidentId;
}

export function AdlHistoryList({ adlRecords, isLoading, residentId }: AdlHistoryListProps) {
  const deleteAdlRecord = useDeleteAdlRecord();

  const handleDelete = async (timestamp: bigint) => {
    try {
      await deleteAdlRecord.mutateAsync({ residentId, timestamp });
      toast.success('ADL record deleted successfully');
    } catch (error) {
      console.error('Error deleting ADL record:', error);
      toast.error('Failed to delete ADL record. Please try again.');
    }
  };

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp));
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getAssistanceLevelVariant = (level: string): 'default' | 'secondary' | 'outline' => {
    if (level === 'Independent') return 'default';
    if (level === 'Supervision' || level === 'Limited Assistance') return 'secondary';
    return 'outline';
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

  if (adlRecords.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Activity className="mb-4 h-12 w-12 text-muted-foreground/40" />
          <h3 className="mb-2 text-lg font-semibold">No ADL records yet</h3>
          <p className="text-sm text-muted-foreground">
            Click "Add ADL Record" to record activities of daily living
          </p>
        </CardContent>
      </Card>
    );
  }

  // Sort ADL records by timestamp (newest first)
  const sortedRecords = [...adlRecords].sort((a, b) => Number(b.timestamp - a.timestamp));

  return (
    <div className="space-y-4">
      {sortedRecords.map((record) => {
        const date = formatDate(record.timestamp);

        return (
          <Card key={Number(record.timestamp)} className="transition-shadow hover:shadow-md">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-4 flex items-center gap-3">
                    <Activity className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-semibold">{date}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Activity</p>
                      <p className="text-lg font-semibold">{record.activityType}</p>
                    </div>
                    <Separator />
                    <div className="grid gap-3 md:grid-cols-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Assistance Level</p>
                        <Badge variant={getAssistanceLevelVariant(record.assistanceLevel)} className="mt-1">
                          {record.assistanceLevel}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Supervisor</p>
                        <p className="font-medium">{record.supervisorId.toString().slice(0, 10)}...</p>
                      </div>
                    </div>
                    {record.notes && (
                      <>
                        <Separator />
                        <div>
                          <p className="text-xs text-muted-foreground">Staff Notes</p>
                          <p className="mt-1 text-sm">{record.notes}</p>
                        </div>
                      </>
                    )}
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
                      <AlertDialogTitle>Delete ADL Record</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this ADL record for {record.activityType} from{' '}
                        {date}? This action cannot be undone.
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
