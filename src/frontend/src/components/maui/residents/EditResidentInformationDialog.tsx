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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { X, Calendar, Plus } from 'lucide-react';

export interface EditResidentFormData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  admissionDate: string;
  roomNumber: string;
  roomType: string;
  bed: string;
  status: string;
  medicaidNumber: string;
  medicareNumber: string;
  physicians: Array<{
    name: string;
    contactNumber: string;
    specialty: string;
  }>;
  pharmacyName: string;
  pharmacyAddress: string;
  pharmacyContactNumber: string;
}

interface EditResidentInformationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues: EditResidentFormData;
  onSave: (values: EditResidentFormData) => void;
}

export function EditResidentInformationDialog({
  open,
  onOpenChange,
  initialValues,
  onSave,
}: EditResidentInformationDialogProps) {
  const [formData, setFormData] = useState<EditResidentFormData>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setFormData(initialValues);
      setErrors({});
    }
  }, [open, initialValues]);

  const handleInputChange = (field: keyof EditResidentFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handlePhysicianChange = (index: number, field: string, value: string) => {
    setFormData((prev) => {
      const newPhysicians = [...prev.physicians];
      newPhysicians[index] = { ...newPhysicians[index], [field]: value };
      return { ...prev, physicians: newPhysicians };
    });
  };

  const handleAddPhysician = () => {
    setFormData((prev) => ({
      ...prev,
      physicians: [
        ...prev.physicians,
        { name: '', contactNumber: '', specialty: '' },
      ],
    }));
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
    if (!formData.admissionDate.trim()) {
      newErrors.admissionDate = 'Admission date is required';
    }
    if (!formData.roomNumber.trim()) {
      newErrors.roomNumber = 'Room number is required';
    }
    if (!formData.roomType.trim()) {
      newErrors.roomType = 'Room type is required';
    }
    if (!formData.bed.trim()) {
      newErrors.bed = 'Bed is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave(formData);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto p-0">
        <DialogHeader className="sticky top-0 z-10 border-b border-border bg-background px-6 py-4">
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-xl font-bold">
                Edit Resident Information
              </DialogTitle>
              <DialogDescription className="mt-1 text-sm">
                Update the resident's information below. Fields marked with * are required.
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

        <div className="space-y-6 px-6 py-6">
          {/* Basic Information Section */}
          <div>
            <h3 className="mb-4 text-base font-semibold">Basic Information</h3>
            <div className="grid gap-4 md:grid-cols-2">
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

              <div className="space-y-2">
                <Label htmlFor="admissionDate">
                  Admission Date <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="admissionDate"
                    type="date"
                    value={formData.admissionDate}
                    onChange={(e) => handleInputChange('admissionDate', e.target.value)}
                    className={errors.admissionDate ? 'border-destructive' : ''}
                  />
                  <Calendar className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
                {errors.admissionDate && (
                  <p className="text-xs text-destructive">{errors.admissionDate}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="roomNumber">
                  Room Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="roomNumber"
                  value={formData.roomNumber}
                  onChange={(e) => handleInputChange('roomNumber', e.target.value)}
                  className={errors.roomNumber ? 'border-destructive' : ''}
                />
                {errors.roomNumber && (
                  <p className="text-xs text-destructive">{errors.roomNumber}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="roomType">
                  Room Type <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.roomType}
                  onValueChange={(value) => handleInputChange('roomType', value)}
                >
                  <SelectTrigger
                    id="roomType"
                    className={errors.roomType ? 'border-destructive' : ''}
                  >
                    <SelectValue placeholder="Select room type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Shared">Shared</SelectItem>
                    <SelectItem value="Private">Private</SelectItem>
                    <SelectItem value="Semi-Private">Semi-Private</SelectItem>
                  </SelectContent>
                </Select>
                {errors.roomType && (
                  <p className="text-xs text-destructive">{errors.roomType}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bed">
                  Bed <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.bed}
                  onValueChange={(value) => handleInputChange('bed', value)}
                >
                  <SelectTrigger
                    id="bed"
                    className={errors.bed ? 'border-destructive' : ''}
                  >
                    <SelectValue placeholder="Select bed" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bed A">Bed A</SelectItem>
                    <SelectItem value="Bed B">Bed B</SelectItem>
                    <SelectItem value="Bed C">Bed C</SelectItem>
                    <SelectItem value="Bed D">Bed D</SelectItem>
                  </SelectContent>
                </Select>
                {errors.bed && (
                  <p className="text-xs text-destructive">{errors.bed}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Discharged">Discharged</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="medicaidNumber">Medicaid Number</Label>
                <Input
                  id="medicaidNumber"
                  value={formData.medicaidNumber}
                  onChange={(e) => handleInputChange('medicaidNumber', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="medicareNumber">Medicare Number</Label>
                <Input
                  id="medicareNumber"
                  value={formData.medicareNumber}
                  onChange={(e) => handleInputChange('medicareNumber', e.target.value)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Physicians Section */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold">Physicians</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddPhysician}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Physician
              </Button>
            </div>

            <div className="space-y-4">
              {formData.physicians.map((physician, index) => (
                <Card key={index} className="border-border">
                  <CardContent className="pt-4">
                    <p className="mb-3 text-sm font-semibold">Physician {index + 1}</p>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor={`physician-name-${index}`}>Physician Name</Label>
                        <Input
                          id={`physician-name-${index}`}
                          value={physician.name}
                          onChange={(e) =>
                            handlePhysicianChange(index, 'name', e.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`physician-contact-${index}`}>Contact Number</Label>
                        <Input
                          id={`physician-contact-${index}`}
                          value={physician.contactNumber}
                          onChange={(e) =>
                            handlePhysicianChange(index, 'contactNumber', e.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`physician-specialty-${index}`}>Specialty</Label>
                        <Input
                          id={`physician-specialty-${index}`}
                          value={physician.specialty}
                          onChange={(e) =>
                            handlePhysicianChange(index, 'specialty', e.target.value)
                          }
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Separator />

          {/* Pharmacy Information Section */}
          <div>
            <h3 className="mb-4 text-base font-semibold">Pharmacy Information</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="pharmacyName">Pharmacy Name</Label>
                <Input
                  id="pharmacyName"
                  value={formData.pharmacyName}
                  onChange={(e) => handleInputChange('pharmacyName', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pharmacyAddress">Address</Label>
                <Input
                  id="pharmacyAddress"
                  value={formData.pharmacyAddress}
                  onChange={(e) => handleInputChange('pharmacyAddress', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pharmacyContactNumber">Contact Number</Label>
                <Input
                  id="pharmacyContactNumber"
                  value={formData.pharmacyContactNumber}
                  onChange={(e) =>
                    handleInputChange('pharmacyContactNumber', e.target.value)
                  }
                />
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 border-t border-border bg-background px-6 py-4">
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
