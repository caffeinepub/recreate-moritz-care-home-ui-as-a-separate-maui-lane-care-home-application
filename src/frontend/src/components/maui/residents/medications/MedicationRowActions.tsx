import { useState } from 'react';
import { Edit, Ban, Play, MoreVertical, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { MedicationStatus } from '@/backend';

interface MedicationRowActionsProps {
  medication: Medication;
  onEdit: (medication: Medication) => void;
  onDiscontinue: (medicationId: bigint) => void;
  onResume: (medicationId: bigint) => void;
  onDelete: (medicationId: bigint) => void;
}

export function MedicationRowActions({
  medication,
  onEdit,
  onDiscontinue,
  onResume,
  onDelete,
}: MedicationRowActionsProps) {
  const [showDiscontinueDialog, setShowDiscontinueDialog] = useState(false);
  const [showResumeDialog, setShowResumeDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const isActive = medication.status === MedicationStatus.active;

  const handleEdit = () => {
    onEdit(medication);
  };

  const handleDiscontinueClick = () => {
    setShowDiscontinueDialog(true);
  };

  const handleDiscontinueConfirm = () => {
    onDiscontinue(medication.id);
    setShowDiscontinueDialog(false);
  };

  const handleResumeClick = () => {
    setShowResumeDialog(true);
  };

  const handleResumeConfirm = () => {
    onResume(medication.id);
    setShowResumeDialog(false);
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    onDelete(medication.id);
    setShowDeleteDialog(false);
  };

  return (
    <>
      <div className="flex items-center gap-1">
        {/* Edit Button - Always visible */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleEdit}
          className="h-8 w-8"
          title="Edit medication"
        >
          <Edit className="h-4 w-4" />
        </Button>

        {/* Discontinue/Resume Button - Prominent */}
        {isActive ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDiscontinueClick}
            className="h-8 w-8"
            title="Discontinue medication"
          >
            <Ban className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleResumeClick}
            className="h-8 w-8"
            title="Resume medication"
          >
            <Play className="h-4 w-4" />
          </Button>
        )}

        {/* Overflow Menu - Delete hidden here */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              title="More actions"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={handleDeleteClick}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Discontinue Confirmation Dialog */}
      <AlertDialog open={showDiscontinueDialog} onOpenChange={setShowDiscontinueDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discontinue Medication</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to discontinue <strong>{medication.medicationName}</strong>?
              This medication will be marked as discontinued but can be resumed later.
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
              Are you sure you want to resume <strong>{medication.medicationName}</strong>?
              This medication will be marked as active again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleResumeConfirm}>
              Resume
            </AlertDialogAction>
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
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
