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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { X, Calendar, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Principal } from '@dfinity/principal';
import { useCreateResident } from '@/hooks/useQueries';
import type { Physician, PharmacyInfo, InsuranceInfo, ResponsiblePerson, Medication } from '@/backend';
import { MedicationStatus } from '@/backend';

interface AddResidentFormData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  admissionDate: string;
  roomNumber: string;
  roomType: string;
  bed: string;
  medicaidNumber: string;
  medicareNumber: string;
  physicians: Physician[];
  pharmacy: PharmacyInfo;
  insurance: InsuranceInfo;
  responsiblePersons: ResponsiblePerson[];
  medications: Medication[];
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
    admissionDate: '',
    roomNumber: '',
    roomType: '',
    bed: '',
    medicaidNumber: '',
    medicareNumber: '',
    physicians: [],
    pharmacy: { name: '', address: '', contactNumber: '' },
    insurance: { company: '', policyNumber: '', address: '', contactNumber: '' },
    responsiblePersons: [],
    medications: [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createResidentMutation = useCreateResident();

  useEffect(() => {
    if (open) {
      setFormData({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        admissionDate: '',
        roomNumber: '',
        roomType: '',
        bed: '',
        medicaidNumber: '',
        medicareNumber: '',
        physicians: [],
        pharmacy: { name: '', address: '', contactNumber: '' },
        insurance: { company: '', policyNumber: '', address: '', contactNumber: '' },
        responsiblePersons: [],
        medications: [],
      });
      setErrors({});
    }
  }, [open]);

  const handleInputChange = (field: string, value: string) => {
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

  const handleNestedChange = (section: 'pharmacy' | 'insurance', field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  };

  const addPhysician = () => {
    setFormData((prev) => ({
      ...prev,
      physicians: [...prev.physicians, { name: '', contactNumber: '', specialty: '' }],
    }));
  };

  const updatePhysician = (index: number, field: keyof Physician, value: string) => {
    setFormData((prev) => ({
      ...prev,
      physicians: prev.physicians.map((p, i) =>
        i === index ? { ...p, [field]: value } : p
      ),
    }));
  };

  const addResponsiblePerson = () => {
    setFormData((prev) => ({
      ...prev,
      responsiblePersons: [
        ...prev.responsiblePersons,
        { name: '', relationship: '', contactNumber: '', address: '' },
      ],
    }));
  };

  const updateResponsiblePerson = (index: number, field: keyof ResponsiblePerson, value: string) => {
    setFormData((prev) => ({
      ...prev,
      responsiblePersons: prev.responsiblePersons.map((rp, i) =>
        i === index ? { ...rp, [field]: value } : rp
      ),
    }));
  };

  const addMedication = () => {
    const newMedicationId = formData.medications.length > 0
      ? Math.max(...formData.medications.map(m => Number(m.id))) + 1
      : 1;
    
    setFormData((prev) => ({
      ...prev,
      medications: [
        ...prev.medications,
        { 
          id: BigInt(newMedicationId),
          medicationName: '', 
          dosage: '', 
          administrationTimes: [], 
          prescribingPhysician: '',
          status: MedicationStatus.active
        },
      ],
    }));
  };

  const updateMedication = (index: number, field: keyof Medication, value: string | string[]) => {
    setFormData((prev) => ({
      ...prev,
      medications: prev.medications.map((m, i) =>
        i === index ? { ...m, [field]: value } : m
      ),
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

  const handleAddResident = async () => {
    if (!validateForm()) return;

    try {
      const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const residentId = Principal.fromText(
        Principal.fromUint8Array(new TextEncoder().encode(uniqueId)).toString()
      );

      await createResidentMutation.mutateAsync({
        id: residentId,
        name: `${formData.firstName} ${formData.lastName}`,
        birthDate: formData.dateOfBirth,
        admissionDate: formData.admissionDate,
        roomNumber: formData.roomNumber,
        roomType: formData.roomType,
        bed: formData.roomType === 'Shared' && formData.bed ? formData.bed : undefined,
        medicaidNumber: formData.medicaidNumber,
        medicareNumber: formData.medicareNumber,
        physicians: formData.physicians,
        pharmacy: formData.pharmacy,
        insurance: formData.insurance,
        responsiblePersons: formData.responsiblePersons,
        medications: formData.medications,
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
            {/* Basic Information */}
            <div>
              <h3 className="mb-4 text-base font-semibold">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
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
                    onValueChange={handleRoomTypeChange}
                  >
                    <SelectTrigger className={errors.roomType ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Private">Private</SelectItem>
                      <SelectItem value="Semi-Private">Semi-Private</SelectItem>
                      <SelectItem value="Shared">Shared</SelectItem>
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
                    >
                      <SelectTrigger className={errors.bed ? 'border-destructive' : ''}>
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

            {/* Physicians */}
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-semibold">Physicians</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addPhysician}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Physician
                </Button>
              </div>
              <div className="space-y-4">
                {formData.physicians.map((physician, index) => (
                  <div key={index} className="rounded-lg border border-border bg-muted/30 p-4">
                    <h4 className="mb-3 text-sm font-medium">Physician {index + 1}</h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor={`physician-name-${index}`}>Physician Name</Label>
                        <Input
                          id={`physician-name-${index}`}
                          placeholder="Dr. Smith"
                          value={physician.name}
                          onChange={(e) => updatePhysician(index, 'name', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`physician-contact-${index}`}>Contact Number</Label>
                        <Input
                          id={`physician-contact-${index}`}
                          placeholder="(555) 123-4567"
                          value={physician.contactNumber}
                          onChange={(e) => updatePhysician(index, 'contactNumber', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`physician-specialty-${index}`}>Specialty</Label>
                        <Input
                          id={`physician-specialty-${index}`}
                          placeholder="Cardiology"
                          value={physician.specialty}
                          onChange={(e) => updatePhysician(index, 'specialty', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Pharmacy Information */}
            <div>
              <h3 className="mb-4 text-base font-semibold">Pharmacy Information</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pharmacyName">Pharmacy Name</Label>
                  <Input
                    id="pharmacyName"
                    placeholder="CVS Pharmacy"
                    value={formData.pharmacy.name}
                    onChange={(e) => handleNestedChange('pharmacy', 'name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pharmacyAddress">Address</Label>
                  <Input
                    id="pharmacyAddress"
                    placeholder="123 Main St"
                    value={formData.pharmacy.address}
                    onChange={(e) => handleNestedChange('pharmacy', 'address', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pharmacyContact">Contact Number</Label>
                  <Input
                    id="pharmacyContact"
                    placeholder="(555) 123-4567"
                    value={formData.pharmacy.contactNumber}
                    onChange={(e) => handleNestedChange('pharmacy', 'contactNumber', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Insurance Information */}
            <div>
              <h3 className="mb-4 text-base font-semibold">Insurance Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="insuranceCompany">Insurance Company</Label>
                  <Input
                    id="insuranceCompany"
                    placeholder="Blue Cross"
                    value={formData.insurance.company}
                    onChange={(e) => handleNestedChange('insurance', 'company', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="policyNumber">Policy Number</Label>
                  <Input
                    id="policyNumber"
                    placeholder="ABC123456"
                    value={formData.insurance.policyNumber}
                    onChange={(e) => handleNestedChange('insurance', 'policyNumber', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="insuranceAddress">Address</Label>
                  <Input
                    id="insuranceAddress"
                    placeholder="456 Insurance Blvd"
                    value={formData.insurance.address}
                    onChange={(e) => handleNestedChange('insurance', 'address', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="insuranceContact">Contact Number</Label>
                  <Input
                    id="insuranceContact"
                    placeholder="(555) 987-6543"
                    value={formData.insurance.contactNumber}
                    onChange={(e) => handleNestedChange('insurance', 'contactNumber', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Responsible Persons */}
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-semibold">Responsible Persons</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addResponsiblePerson}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Person
                </Button>
              </div>
              <div className="space-y-4">
                {formData.responsiblePersons.map((person, index) => (
                  <div key={index} className="rounded-lg border border-border bg-muted/30 p-4">
                    <h4 className="mb-3 text-sm font-medium">Person {index + 1}</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor={`person-name-${index}`}>Name</Label>
                        <Input
                          id={`person-name-${index}`}
                          placeholder="John Doe"
                          value={person.name}
                          onChange={(e) => updateResponsiblePerson(index, 'name', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`person-relationship-${index}`}>Relationship</Label>
                        <Input
                          id={`person-relationship-${index}`}
                          placeholder="Son"
                          value={person.relationship}
                          onChange={(e) => updateResponsiblePerson(index, 'relationship', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`person-contact-${index}`}>Contact Number</Label>
                        <Input
                          id={`person-contact-${index}`}
                          placeholder="(555) 123-4567"
                          value={person.contactNumber}
                          onChange={(e) => updateResponsiblePerson(index, 'contactNumber', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`person-address-${index}`}>Address</Label>
                        <Input
                          id={`person-address-${index}`}
                          placeholder="789 Oak St"
                          value={person.address}
                          onChange={(e) => updateResponsiblePerson(index, 'address', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 border-t border-border bg-background px-6 py-4">
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
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
