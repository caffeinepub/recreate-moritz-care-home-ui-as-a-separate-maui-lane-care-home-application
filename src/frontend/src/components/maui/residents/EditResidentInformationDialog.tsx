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
import { X, Calendar, Plus, Loader2, Trash2 } from 'lucide-react';

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
  responsiblePersons: Array<{
    name: string;
    relationship: string;
    contactNumber: string;
    address: string;
  }>;
}

interface EditResidentInformationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues: EditResidentFormData;
  onSave: (values: EditResidentFormData) => Promise<void> | void;
  isSaving?: boolean;
}

export function EditResidentInformationDialog({
  open,
  onOpenChange,
  initialValues,
  onSave,
  isSaving = false,
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

  const handleRoomTypeChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      roomType: value,
      // Clear bed if room type is not Shared
      bed: value === 'Shared' ? prev.bed : '',
    }));
    if (errors.roomType) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.roomType;
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

  const handleRemovePhysician = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      physicians: prev.physicians.filter((_, i) => i !== index),
    }));
  };

  const handleResponsiblePersonChange = (index: number, field: string, value: string) => {
    setFormData((prev) => {
      const newResponsiblePersons = [...prev.responsiblePersons];
      newResponsiblePersons[index] = { ...newResponsiblePersons[index], [field]: value };
      return { ...prev, responsiblePersons: newResponsiblePersons };
    });
  };

  const handleAddResponsiblePerson = () => {
    setFormData((prev) => ({
      ...prev,
      responsiblePersons: [
        ...prev.responsiblePersons,
        { name: '', relationship: '', contactNumber: '', address: '' },
      ],
    }));
  };

  const handleRemoveResponsiblePerson = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      responsiblePersons: prev.responsiblePersons.filter((_, i) => i !== index),
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
    if (formData.roomType === 'Shared' && !formData.bed.trim()) {
      newErrors.bed = 'Bed is required for shared rooms';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (validateForm()) {
      await onSave(formData);
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
              disabled={isSaving}
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
                  disabled={isSaving}
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
                  disabled={isSaving}
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
                    disabled={isSaving}
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
                    disabled={isSaving}
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
                  disabled={isSaving}
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
                  onValueChange={handleRoomTypeChange}
                  disabled={isSaving}
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

              {formData.roomType === 'Shared' && (
                <div className="space-y-2">
                  <Label htmlFor="bed">
                    Bed <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.bed}
                    onValueChange={(value) => handleInputChange('bed', value)}
                    disabled={isSaving}
                  >
                    <SelectTrigger
                      id="bed"
                      className={errors.bed ? 'border-destructive' : ''}
                    >
                      <SelectValue placeholder="Select bed" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">A</SelectItem>
                      <SelectItem value="B">B</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.bed && (
                    <p className="text-xs text-destructive">{errors.bed}</p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="medicaidNumber">Medicaid Number</Label>
                <Input
                  id="medicaidNumber"
                  value={formData.medicaidNumber}
                  onChange={(e) => handleInputChange('medicaidNumber', e.target.value)}
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="medicareNumber">Medicare Number</Label>
                <Input
                  id="medicareNumber"
                  value={formData.medicareNumber}
                  onChange={(e) => handleInputChange('medicareNumber', e.target.value)}
                  disabled={isSaving}
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
                disabled={isSaving}
              >
                <Plus className="h-4 w-4" />
                Add Physician
              </Button>
            </div>

            <div className="space-y-4">
              {formData.physicians.length === 0 ? (
                <p className="text-sm text-muted-foreground">No physicians added yet.</p>
              ) : (
                formData.physicians.map((physician, index) => (
                  <Card key={index} className="border-border">
                    <CardContent className="pt-4">
                      <div className="mb-3 flex items-center justify-between">
                        <p className="text-sm font-semibold">Physician {index + 1}</p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemovePhysician(index)}
                          disabled={isSaving}
                          className="h-8 gap-1 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                          Remove
                        </Button>
                      </div>
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                          <Label htmlFor={`physician-name-${index}`}>Physician Name</Label>
                          <Input
                            id={`physician-name-${index}`}
                            value={physician.name}
                            onChange={(e) =>
                              handlePhysicianChange(index, 'name', e.target.value)
                            }
                            disabled={isSaving}
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
                            disabled={isSaving}
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
                            disabled={isSaving}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
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
                  disabled={isSaving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pharmacyAddress">Address</Label>
                <Input
                  id="pharmacyAddress"
                  value={formData.pharmacyAddress}
                  onChange={(e) => handleInputChange('pharmacyAddress', e.target.value)}
                  disabled={isSaving}
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
                  disabled={isSaving}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Responsible Persons Section */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold">Responsible Persons</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddResponsiblePerson}
                className="gap-2"
                disabled={isSaving}
              >
                <Plus className="h-4 w-4" />
                Add Person
              </Button>
            </div>

            <div className="space-y-4">
              {formData.responsiblePersons.length === 0 ? (
                <p className="text-sm text-muted-foreground">No responsible persons added yet.</p>
              ) : (
                formData.responsiblePersons.map((person, index) => (
                  <Card key={index} className="border-border">
                    <CardContent className="pt-4">
                      <div className="mb-3 flex items-center justify-between">
                        <p className="text-sm font-semibold">Contact {index + 1}</p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveResponsiblePerson(index)}
                          disabled={isSaving}
                          className="h-8 gap-1 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                          Remove
                        </Button>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor={`person-name-${index}`}>Name</Label>
                          <Input
                            id={`person-name-${index}`}
                            value={person.name}
                            onChange={(e) =>
                              handleResponsiblePersonChange(index, 'name', e.target.value)
                            }
                            disabled={isSaving}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`person-relationship-${index}`}>Relationship</Label>
                          <Input
                            id={`person-relationship-${index}`}
                            value={person.relationship}
                            onChange={(e) =>
                              handleResponsiblePersonChange(index, 'relationship', e.target.value)
                            }
                            disabled={isSaving}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`person-contact-${index}`}>Contact Number</Label>
                          <Input
                            id={`person-contact-${index}`}
                            value={person.contactNumber}
                            onChange={(e) =>
                              handleResponsiblePersonChange(index, 'contactNumber', e.target.value)
                            }
                            disabled={isSaving}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`person-address-${index}`}>Address</Label>
                          <Input
                            id={`person-address-${index}`}
                            value={person.address}
                            onChange={(e) =>
                              handleResponsiblePersonChange(index, 'address', e.target.value)
                            }
                            disabled={isSaving}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 border-t border-border bg-background px-6 py-4">
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
