import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { Principal } from '@dfinity/principal';
import { useCreateResident } from '@/hooks/useQueries';

interface AddResidentFormData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
}

interface AddNewResidentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddNewResidentDialog({
  open,
  onOpenChange,
}: AddNewResidentDialogProps) {
  const [formData, setFormData] = useState<AddResidentFormData>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createResidentMutation = useCreateResident();

  useEffect(() => {
    if (open) {
      setFormData({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
      });
      setErrors({});
    }
  }, [open]);

  const handleInputChange = (field: keyof AddResidentFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!formData.dateOfBirth.trim()) {
      newErrors.dateOfBirth = 'Date of birth is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddResident = async () => {
    if (!validateForm()) return;

    try {
      // Generate a unique resident ID using timestamp and random component
      const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const residentId = Principal.fromText(
        Principal.fromUint8Array(new TextEncoder().encode(uniqueId)).toString()
      );

      await createResidentMutation.mutateAsync({
        id: residentId,
        name: `${formData.firstName} ${formData.lastName}`,
        birthDate: formData.dateOfBirth,
      });

      onOpenChange(false);
      toast.success('Resident added successfully');
    } catch (error: any) {
      console.error('Failed to add resident:', error);
      toast.error(error.message || 'Failed to add resident');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-hidden p-0">
        <DialogHeader className="sticky top-0 z-10 border-b border-border bg-background px-6 py-4">
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-xl font-bold">Add New Resident</DialogTitle>
              <DialogDescription className="mt-1 text-sm">
                Enter the resident's basic information. Fields marked with * are required.
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
        </DialogHeader>

        <div className="max-h-[calc(90vh-180px)] overflow-y-auto px-6 py-6">
          <div className="space-y-6">
            <div>
              <h3 className="mb-4 text-base font-semibold">Basic Information</h3>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">
                    First Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className={errors.firstName ? 'border-destructive' : ''}
                  />
                  {errors.firstName && (
                    <p className="text-xs text-destructive">{errors.firstName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">
                    Last Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className={errors.lastName ? 'border-destructive' : ''}
                  />
                  {errors.lastName && (
                    <p className="text-xs text-destructive">{errors.lastName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">
                    Date of Birth <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="dateOfBirth"
                      type="date"
                      placeholder="MM/DD/YYYY"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      className={errors.dateOfBirth ? 'border-destructive' : ''}
                    />
                    <Calendar className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  </div>
                  {errors.dateOfBirth && (
                    <p className="text-xs text-destructive">{errors.dateOfBirth}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 border-t border-border bg-background px-6 py-4">
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddResident}
              disabled={createResidentMutation.isPending}
            >
              {createResidentMutation.isPending ? 'Adding...' : 'Add Resident'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
