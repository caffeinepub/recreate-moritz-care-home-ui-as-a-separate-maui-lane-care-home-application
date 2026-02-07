import { useState } from 'react';
import { Edit, Trash2, Ban, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { Medication } from '@/backend';

interface MedicationRowActionsProps {
  medication: Medication;
  onEdit: (medication: Medication) => void;
  onDiscontinue: (medicationId: bigint) => void;
  onResume: (medicationId: bigint) => void;
  onDelete: (medicationId: bigint) => void;
  isProcessing?: boolean;
}

export function MedicationRowActions({
  medication,
  onEdit,
  onDiscontinue,
  onResume,
  onDelete,
  isProcessing = false,
}: MedicationRowActionsProps) {
  const [showDiscontinueDialog, setShowDiscontinueDialog] = useState(false);
  const [showResumeDialog, setShowResumeDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const isDiscontinued = medication.status === 'discontinued';

  const handleDiscontinueConfirm = () => {
    onDiscontinue(medication.id);
    setShowDiscontinueDialog(false);
  };

  const handleResumeConfirm = () => {
    onResume(medication.id);
    setShowResumeDialog(false);
  };

  const handleDeleteConfirm = () => {
    onDelete(medication.id);
    setShowDeleteDialog(false);
  };

  return (
    <>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(medication)}
          disabled={isProcessing}
        >
          <Edit className="mr-1 h-3 w-3" />
          Edit
        </Button>

        {isDiscontinued ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowResumeDialog(true)}
            disabled={isProcessing}
          >
            <Play className="mr-1 h-3 w-3" />
            Resume
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDiscontinueDialog(true)}
            disabled={isProcessing}
          >
            <Ban className="mr-1 h-3 w-3" />
            Discontinue
          </Button>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowDeleteDialog(true)}
          disabled={isProcessing}
        >
          <Trash2 className="mr-1 h-3 w-3" />
          Delete
        </Button>
      </div>

      {/* Discontinue Confirmation Dialog */}
      <AlertDialog open={showDiscontinueDialog} onOpenChange={setShowDiscontinueDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discontinue Medication</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to discontinue <strong>{medication.medicationName}</strong>?
              This medication will no longer be available for MAR records, but you can resume it
              later if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDiscontinueConfirm}>
              Discontinue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Resume Confirmation Dialog */}
      <AlertDialog open={showResumeDialog} onOpenChange={setShowResumeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Resume Medication</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to resume <strong>{medication.medicationName}</strong>? This
              medication will become active and available for MAR records again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleResumeConfirm}>Resume</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Medication</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete <strong>{medication.medicationName}</strong>?
              This action cannot be undone and the medication will be removed from the resident's
              record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
