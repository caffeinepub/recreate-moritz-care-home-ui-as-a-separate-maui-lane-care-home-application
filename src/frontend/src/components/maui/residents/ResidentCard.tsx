import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { Eye, Trash2 } from 'lucide-react';
import type { ResidentViewModel } from '@/pages/maui/residents/residentDirectoryViewModel';
import { useNavigate } from '@tanstack/react-router';

interface ResidentCardProps {
  resident: ResidentViewModel;
  onDeleteResident: (residentId: string) => void;
  onToggleResidentStatus: (residentId: string) => void;
}

export function ResidentCard({ resident, onDeleteResident, onToggleResidentStatus }: ResidentCardProps) {
  const navigate = useNavigate();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleViewProfile = () => {
    navigate({ to: '/resident/$residentId', params: { residentId: resident.id } });
  };

  const handleToggleStatus = () => {
    onToggleResidentStatus(resident.id);
  };

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    onDeleteResident(resident.id);
    setIsDeleteDialogOpen(false);
  };

  return (
    <>
      <Card className="overflow-hidden transition-shadow hover:shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground">{resident.name}</h3>
              <div className="mt-1 flex flex-wrap gap-2">
                <Badge variant="secondary" className="text-xs">
                  {resident.room}
                </Badge>
                <Badge
                  variant={resident.status === 'Active' ? 'default' : 'outline'}
                  className="gap-1 text-xs"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {resident.status}
                </Badge>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={handleDeleteClick}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Age: {resident.age} years
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Physicians</p>
              <p className="text-2xl font-bold text-foreground">{resident.physicians}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Medications</p>
              <p className="text-2xl font-bold text-foreground">{resident.medications}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 gap-2" onClick={handleViewProfile}>
              <Eye className="h-4 w-4" />
              View Profile
            </Button>
            <Button variant="outline" className="flex-1" onClick={handleToggleStatus}>
              {resident.status === 'Active' ? 'Discharge' : 'Mark Active'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete resident?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {resident.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
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
