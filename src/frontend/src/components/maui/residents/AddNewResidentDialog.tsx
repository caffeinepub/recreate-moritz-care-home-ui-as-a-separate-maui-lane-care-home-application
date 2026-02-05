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
import { toast } from 'sonner';

interface Physician {
  name: string;
  contactNumber: string;
  specialty: string;
}

interface ResponsiblePerson {
  name: string;
  relationship: string;
  contactNumber: string;
  address: string;
}

interface Medication {
  name: string;
  dosage: string;
  administrationTimes: string;
  prescribingPhysician: string;
}

interface AddResidentFormData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  admissionDate: string;
  roomNumber: string;
  roomType: string;
  medicaidNumber: string;
  medicareNumber: string;
  physicians: Physician[];
  pharmacyName: string;
  pharmacyAddress: string;
  pharmacyContactNumber: string;
  insuranceCompany: string;
  policyNumber: string;
  insuranceAddress: string;
  insuranceContactNumber: string;
  responsiblePersons: ResponsiblePerson[];
  medications: Medication[];
}

interface AddNewResidentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddResident: (resident: {
    id: number;
    name: string;
    age: number;
    room: string;
    status: 'Active' | 'Discharged';
    physicians: number;
    medications: number;
  }) => void;
}

export function AddNewResidentDialog({
  open,
  onOpenChange,
  onAddResident,
}: AddNewResidentDialogProps) {
  const [formData, setFormData] = useState<AddResidentFormData>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    admissionDate: '',
    roomNumber: '',
    roomType: '',
    medicaidNumber: '',
    medicareNumber: '',
    physicians: [{ name: '', contactNumber: '', specialty: '' }],
    pharmacyName: '',
    pharmacyAddress: '',
    pharmacyContactNumber: '',
    insuranceCompany: '',
    policyNumber: '',
    insuranceAddress: '',
    insuranceContactNumber: '',
    responsiblePersons: [{ name: '', relationship: '', contactNumber: '', address: '' }],
    medications: [{ name: '', dosage: '', administrationTimes: '', prescribingPhysician: '' }],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setFormData({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        admissionDate: '',
        roomNumber: '',
        roomType: '',
        medicaidNumber: '',
        medicareNumber: '',
        physicians: [{ name: '', contactNumber: '', specialty: '' }],
        pharmacyName: '',
        pharmacyAddress: '',
        pharmacyContactNumber: '',
        insuranceCompany: '',
        policyNumber: '',
        insuranceAddress: '',
        insuranceContactNumber: '',
        responsiblePersons: [{ name: '', relationship: '', contactNumber: '', address: '' }],
        medications: [{ name: '', dosage: '', administrationTimes: '', prescribingPhysician: '' }],
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

  const handlePhysicianChange = (index: number, field: keyof Physician, value: string) => {
    setFormData((prev) => {
      const newPhysicians = [...prev.physicians];
      newPhysicians[index] = { ...newPhysicians[index], [field]: value };
      return { ...prev, physicians: newPhysicians };
    });
  };

  const handleAddPhysician = () => {
    setFormData((prev) => ({
      ...prev,
      physicians: [...prev.physicians, { name: '', contactNumber: '', specialty: '' }],
    }));
  };

  const handleResponsiblePersonChange = (
    index: number,
    field: keyof ResponsiblePerson,
    value: string
  ) => {
    setFormData((prev) => {
      const newPersons = [...prev.responsiblePersons];
      newPersons[index] = { ...newPersons[index], [field]: value };
      return { ...prev, responsiblePersons: newPersons };
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

  const handleMedicationChange = (index: number, field: keyof Medication, value: string) => {
    setFormData((prev) => {
      const newMedications = [...prev.medications];
      newMedications[index] = { ...newMedications[index], [field]: value };
      return { ...prev, medications: newMedications };
    });
  };

  const handleAddMedication = () => {
    setFormData((prev) => ({
      ...prev,
      medications: [
        ...prev.medications,
        { name: '', dosage: '', administrationTimes: '', prescribingPhysician: '' },
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateAge = (dateOfBirth: string): number => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleAddResident = () => {
    if (validateForm()) {
      const age = calculateAge(formData.dateOfBirth);
      const newResident = {
        id: Date.now(),
        name: `${formData.firstName} ${formData.lastName}`,
        age,
        room: `Room ${formData.roomNumber} - ${formData.roomType}`,
        status: 'Active' as const,
        physicians: formData.physicians.filter((p) => p.name.trim()).length,
        medications: formData.medications.filter((m) => m.name.trim()).length,
      };

      onAddResident(newResident);
      onOpenChange(false);
      toast.success('Resident added successfully');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-hidden p-0">
        <DialogHeader className="sticky top-0 z-10 border-b border-border bg-background px-6 py-4">
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-xl font-bold">Add New Resident</DialogTitle>
              <DialogDescription className="mt-1 text-sm">
                Enter the resident's information below. Fields marked with * are required.
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

                <div className="space-y-2">
                  <Label htmlFor="admissionDate">
                    Admission Date <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="admissionDate"
                      type="date"
                      placeholder="MM/DD/YYYY"
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
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Shared">Shared</SelectItem>
                      <SelectItem value="Private">Private</SelectItem>
                      <SelectItem value="Semi-Private">Semi-Private</SelectItem>
                      <SelectItem value="Solo">Solo</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.roomType && (
                    <p className="text-xs text-destructive">{errors.roomType}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="medicaidNumber">Medicaid Number</Label>
                  <Input
                    id="medicaidNumber"
                    placeholder="Optional"
                    value={formData.medicaidNumber}
                    onChange={(e) => handleInputChange('medicaidNumber', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="medicareNumber">Medicare Number</Label>
                  <Input
                    id="medicareNumber"
                    placeholder="Optional"
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
                            placeholder="Dr. Smith"
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
                            placeholder="(555) 123-4567"
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
                            placeholder="Cardiology"
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
                    placeholder="Care Pharmacy"
                    value={formData.pharmacyName}
                    onChange={(e) => handleInputChange('pharmacyName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pharmacyAddress">Address</Label>
                  <Input
                    id="pharmacyAddress"
                    placeholder="123 Main St"
                    value={formData.pharmacyAddress}
                    onChange={(e) => handleInputChange('pharmacyAddress', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pharmacyContactNumber">Contact Number</Label>
                  <Input
                    id="pharmacyContactNumber"
                    placeholder="(555) 987-6543"
                    value={formData.pharmacyContactNumber}
                    onChange={(e) =>
                      handleInputChange('pharmacyContactNumber', e.target.value)
                    }
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Insurance Information Section */}
            <div>
              <h3 className="mb-4 text-base font-semibold">Insurance Information</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="insuranceCompany">Insurance Company</Label>
                  <Input
                    id="insuranceCompany"
                    placeholder="Blue Cross Blue Shield"
                    value={formData.insuranceCompany}
                    onChange={(e) => handleInputChange('insuranceCompany', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="policyNumber">Policy Number</Label>
                  <Input
                    id="policyNumber"
                    placeholder="POL-123456"
                    value={formData.policyNumber}
                    onChange={(e) => handleInputChange('policyNumber', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="insuranceAddress">Address</Label>
                  <Input
                    id="insuranceAddress"
                    placeholder="456 Insurance Blvd"
                    value={formData.insuranceAddress}
                    onChange={(e) => handleInputChange('insuranceAddress', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="insuranceContactNumber">Contact Number</Label>
                  <Input
                    id="insuranceContactNumber"
                    placeholder="(555) 111-2222"
                    value={formData.insuranceContactNumber}
                    onChange={(e) =>
                      handleInputChange('insuranceContactNumber', e.target.value)
                    }
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
                >
                  <Plus className="h-4 w-4" />
                  Add Contact
                </Button>
              </div>

              <div className="space-y-4">
                {formData.responsiblePersons.map((person, index) => (
                  <Card key={index} className="border-border">
                    <CardContent className="pt-4">
                      <p className="mb-3 text-sm font-semibold">Contact Person {index + 1}</p>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor={`person-name-${index}`}>Name</Label>
                          <Input
                            id={`person-name-${index}`}
                            placeholder="John Doe"
                            value={person.name}
                            onChange={(e) =>
                              handleResponsiblePersonChange(index, 'name', e.target.value)
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`person-relationship-${index}`}>Relationship</Label>
                          <Input
                            id={`person-relationship-${index}`}
                            placeholder="Son"
                            value={person.relationship}
                            onChange={(e) =>
                              handleResponsiblePersonChange(
                                index,
                                'relationship',
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`person-contact-${index}`}>Contact Number</Label>
                          <Input
                            id={`person-contact-${index}`}
                            placeholder="(555) 123-4444"
                            value={person.contactNumber}
                            onChange={(e) =>
                              handleResponsiblePersonChange(
                                index,
                                'contactNumber',
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`person-address-${index}`}>Address</Label>
                          <Input
                            id={`person-address-${index}`}
                            placeholder="789 Oak Ave"
                            value={person.address}
                            onChange={(e) =>
                              handleResponsiblePersonChange(index, 'address', e.target.value)
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

            {/* Medications Section */}
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-semibold">Medications</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddMedication}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Medication
                </Button>
              </div>

              <div className="space-y-4">
                {formData.medications.map((medication, index) => (
                  <Card key={index} className="border-border">
                    <CardContent className="pt-4">
                      <p className="mb-3 text-sm font-semibold">Medication {index + 1}</p>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor={`medication-name-${index}`}>Medication Name</Label>
                          <Input
                            id={`medication-name-${index}`}
                            placeholder="Aspirin"
                            value={medication.name}
                            onChange={(e) =>
                              handleMedicationChange(index, 'name', e.target.value)
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`medication-dosage-${index}`}>Dosage</Label>
                          <Input
                            id={`medication-dosage-${index}`}
                            placeholder="100mg"
                            value={medication.dosage}
                            onChange={(e) =>
                              handleMedicationChange(index, 'dosage', e.target.value)
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`medication-times-${index}`}>
                            Administration Times
                          </Label>
                          <Input
                            id={`medication-times-${index}`}
                            placeholder="8:00 AM, 8:00 PM (comma)"
                            value={medication.administrationTimes}
                            onChange={(e) =>
                              handleMedicationChange(
                                index,
                                'administrationTimes',
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`medication-physician-${index}`}>
                            Prescribing Physician
                          </Label>
                          <Input
                            id={`medication-physician-${index}`}
                            placeholder="Enter physician name from"
                            value={medication.prescribingPhysician}
                            onChange={(e) =>
                              handleMedicationChange(
                                index,
                                'prescribingPhysician',
                                e.target.value
                              )
                            }
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 border-t border-border bg-background px-6 py-4">
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddResident}>Add Resident</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
