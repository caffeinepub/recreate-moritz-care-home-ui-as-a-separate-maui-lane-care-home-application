import { useState } from 'react';
import { useParams } from '@tanstack/react-router';
import { Principal } from '@dfinity/principal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Activity,
  Pill,
  FileText,
  Printer,
  User,
  MapPin,
  Heart,
  Edit,
  AlertCircle,
  Stethoscope,
  Building2,
  Users,
} from 'lucide-react';
import { RecordDailyVitalsDialog } from '@/components/maui/residents/vitals/RecordDailyVitalsDialog';
import { VitalsHistoryList } from '@/components/maui/residents/vitals/VitalsHistoryList';
import { AddMarRecordDialog } from '@/components/maui/residents/mar/AddMarRecordDialog';
import { MarHistoryList } from '@/components/maui/residents/mar/MarHistoryList';
import { AddAdlRecordDialog } from '@/components/maui/residents/adl/AddAdlRecordDialog';
import { AdlHistoryList } from '@/components/maui/residents/adl/AdlHistoryList';
import { AddMedicationDialog } from '@/components/maui/residents/medications/AddMedicationDialog';
import { EditResidentInformationDialog, type EditResidentFormData } from '@/components/maui/residents/EditResidentInformationDialog';
import { ResidentProfilePrintReport } from './ResidentProfilePrintReport';
import { useGetResident, useUpdateResident } from '@/hooks/useQueries';
import { toast } from 'sonner';
import type { ResidentUpdateRequest } from '@/backend';
import {
  getResidentProfileData,
  type ResidentMedication,
} from './mockResidentProfileData';
import { calculateAge, formatAge } from './residentAge';

export function ResidentProfile() {
  const { residentId } = useParams({ from: '/resident/$residentId' });
  const [isVitalsDialogOpen, setIsVitalsDialogOpen] = useState(false);
  const [isMarDialogOpen, setIsMarDialogOpen] = useState(false);
  const [isAdlDialogOpen, setIsAdlDialogOpen] = useState(false);
  const [isAddMedicationDialogOpen, setIsAddMedicationDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [clientMedications, setClientMedications] = useState<ResidentMedication[]>([]);
  const [includePhysicianSignature, setIncludePhysicianSignature] = useState(false);

  // Try to parse residentId as Principal, fallback to mock data if invalid
  let residentPrincipal: Principal | null = null;
  try {
    residentPrincipal = Principal.fromText(residentId);
  } catch {
    // Invalid principal, will use mock data
  }

  const { data: backendResident, isLoading, error, refetch } = useGetResident(residentPrincipal);
  const updateResidentMutation = useUpdateResident();

  // Use backend data if available, otherwise fallback to mock
  const profileData = backendResident
    ? {
        id: backendResident.id.toString(),
        name: backendResident.name,
        dateOfBirth: backendResident.birthDate,
        admissionDate: backendResident.admissionDate,
        room: backendResident.roomNumber ? `Room ${backendResident.roomNumber}` : 'Room TBD',
        roomType: backendResident.roomType || 'TBD',
        status: backendResident.active ? 'Active' : 'Discharged',
        medicaidNumber: backendResident.medicaidNumber || '-',
        medicareNumber: backendResident.medicareNumber || '-',
        physicians: backendResident.physicians || [],
        pharmacy: backendResident.pharmacy || { name: '-', address: '-', contactNumber: '-' },
        insurance: backendResident.insurance || { company: '-', policyNumber: '-', address: '-', contactNumber: '-' },
        responsiblePersons: backendResident.responsiblePersons || [],
      }
    : getResidentProfileData(residentId);

  const allMedications = [...clientMedications];

  // Calculate age from date of birth
  const residentAge = calculateAge(profileData.dateOfBirth);
  const ageDisplay = formatAge(residentAge);

  const handleAddMedication = (medication: ResidentMedication) => {
    setClientMedications((prev) => [...prev, medication]);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEditSave = async (values: EditResidentFormData) => {
    if (!residentPrincipal || !backendResident) {
      toast.error('Cannot update resident: Invalid resident ID');
      return;
    }

    try {
      // Build update request with all editable fields
      const updateRequest: ResidentUpdateRequest = {
        name: `${values.firstName} ${values.lastName}`.trim(),
        birthDate: values.dateOfBirth,
        admissionDate: values.admissionDate,
        roomNumber: values.roomNumber,
        roomType: values.roomType,
        bed: values.roomType === 'Shared' && values.bed ? values.bed : undefined,
        medicaidNumber: values.medicaidNumber,
        medicareNumber: values.medicareNumber,
        physicians: values.physicians,
        pharmacy: {
          name: values.pharmacyName,
          address: values.pharmacyAddress,
          contactNumber: values.pharmacyContactNumber,
        },
        responsiblePersons: values.responsiblePersons,
        // Preserve existing backend fields that aren't in the edit dialog
        insurance: backendResident.insurance,
        medications: backendResident.medications,
      };

      await updateResidentMutation.mutateAsync({
        id: residentPrincipal,
        updateRequest,
      });

      toast.success('Resident information updated successfully');
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Failed to update resident:', error);
      toast.error('Failed to save changes. Please try again.');
    }
  };

  // Prepare initial values for edit dialog from backend data
  const getEditInitialValues = (): EditResidentFormData => {
    if (!backendResident) {
      return {
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        admissionDate: '',
        roomNumber: '',
        roomType: '',
        bed: '',
        status: 'Active',
        medicaidNumber: '',
        medicareNumber: '',
        physicians: [],
        pharmacyName: '',
        pharmacyAddress: '',
        pharmacyContactNumber: '',
        responsiblePersons: [],
      };
    }

    // Split name into first and last
    const nameParts = backendResident.name.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    return {
      firstName,
      lastName,
      dateOfBirth: backendResident.birthDate,
      admissionDate: backendResident.admissionDate,
      roomNumber: backendResident.roomNumber,
      roomType: backendResident.roomType,
      bed: backendResident.bed || '',
      status: backendResident.active ? 'Active' : 'Discharged',
      medicaidNumber: backendResident.medicaidNumber,
      medicareNumber: backendResident.medicareNumber,
      physicians: backendResident.physicians,
      pharmacyName: backendResident.pharmacy.name,
      pharmacyAddress: backendResident.pharmacy.address,
      pharmacyContactNumber: backendResident.pharmacy.contactNumber,
      responsiblePersons: backendResident.responsiblePersons,
    };
  };

  const handleRetry = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading resident profile...</p>
        </div>
      </div>
    );
  }

  // If there was an error loading from backend but we have a valid principal, show error with retry
  if (error && residentPrincipal) {
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Failed to load resident profile. Please try again.';

    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
        <div className="flex flex-col items-center justify-center gap-4 py-12">
          <Button onClick={handleRetry} variant="outline">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="no-print container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-6 flex flex-col gap-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">{profileData.name}</h1>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge variant="secondary" className="gap-1">
                  <MapPin className="h-3 w-3" />
                  {profileData.room}
                </Badge>
                <Badge
                  variant={profileData.status === 'Active' ? 'default' : 'outline'}
                  className="gap-1"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {profileData.status}
                </Badge>
              </div>
            </div>
            <div className="flex gap-2">
              {residentPrincipal && backendResident && (
                <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              )}
              <Button onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
            </div>
          </div>

          {/* Print Options */}
          <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3">
            <Switch
              id="physician-signature"
              checked={includePhysicianSignature}
              onCheckedChange={setIncludePhysicianSignature}
            />
            <Label
              htmlFor="physician-signature"
              className="flex cursor-pointer items-center gap-2 text-sm font-medium"
            >
              Include physician printed name & signature
              <span className="text-xs font-normal text-muted-foreground">
                ({includePhysicianSignature ? 'ON' : 'OFF'})
              </span>
            </Label>
          </div>
        </div>

        {/* Basic Information Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-sm text-muted-foreground">Date of Birth</p>
                <p className="font-medium">
                  {profileData.dateOfBirth}
                  {ageDisplay && <span className="ml-1 text-muted-foreground">{ageDisplay}</span>}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Admission Date</p>
                <p className="font-medium">{profileData.admissionDate}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Medicaid Number</p>
                <p className="font-medium">{profileData.medicaidNumber || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Medicare Number</p>
                <p className="font-medium">{profileData.medicareNumber || '-'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Physicians Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5" />
              Assigned Physicians
            </CardTitle>
          </CardHeader>
          <CardContent>
            {profileData.physicians.length === 0 ? (
              <p className="text-sm text-muted-foreground">No physicians assigned</p>
            ) : (
              <div className="space-y-4">
                {profileData.physicians.map((physician, index) => (
                  <div key={index} className="rounded-lg border border-border p-4">
                    <div className="grid gap-3 md:grid-cols-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Name</p>
                        <p className="font-medium">{physician.name || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Specialty</p>
                        <p className="font-medium">{physician.specialty || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Contact</p>
                        <p className="font-medium">{physician.contactNumber || '-'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pharmacy Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Pharmacy Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground">Pharmacy Name</p>
                <p className="font-medium">{profileData.pharmacy.name || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="font-medium">{profileData.pharmacy.address || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Contact Number</p>
                <p className="font-medium">{profileData.pharmacy.contactNumber || '-'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Responsible Persons Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Responsible Persons
            </CardTitle>
          </CardHeader>
          <CardContent>
            {profileData.responsiblePersons.length === 0 ? (
              <p className="text-sm text-muted-foreground">No responsible persons listed</p>
            ) : (
              <div className="space-y-4">
                {profileData.responsiblePersons.map((person, index) => (
                  <div key={index} className="rounded-lg border border-border p-4">
                    <div className="grid gap-3 md:grid-cols-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Name</p>
                        <p className="font-medium">{person.name || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Relationship</p>
                        <p className="font-medium">{person.relationship || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Contact Number</p>
                        <p className="font-medium">{person.contactNumber || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Address</p>
                        <p className="font-medium">{person.address || '-'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabs Section */}
        <Tabs defaultValue="vitals" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="vitals" className="gap-2">
              <Activity className="h-4 w-4" />
              Daily Vitals
            </TabsTrigger>
            <TabsTrigger value="mar" className="gap-2">
              <FileText className="h-4 w-4" />
              MAR
            </TabsTrigger>
            <TabsTrigger value="adl" className="gap-2">
              <Heart className="h-4 w-4" />
              ADL
            </TabsTrigger>
            <TabsTrigger value="medications" className="gap-2">
              <Pill className="h-4 w-4" />
              Medications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="vitals" className="space-y-4">
            <div className="flex justify-between">
              <h2 className="text-xl font-semibold">Daily Vitals History</h2>
              <Button onClick={() => setIsVitalsDialogOpen(true)}>
                <Activity className="mr-2 h-4 w-4" />
                Record Vitals
              </Button>
            </div>
            {residentPrincipal && <VitalsHistoryList residentId={residentPrincipal} />}
          </TabsContent>

          <TabsContent value="mar" className="space-y-4">
            <div className="flex justify-between">
              <h2 className="text-xl font-semibold">Medication Administration Records</h2>
              <Button onClick={() => setIsMarDialogOpen(true)}>
                <FileText className="mr-2 h-4 w-4" />
                Add MAR Record
              </Button>
            </div>
            {residentPrincipal && <MarHistoryList residentId={residentPrincipal} />}
          </TabsContent>

          <TabsContent value="adl" className="space-y-4">
            <div className="flex justify-between">
              <h2 className="text-xl font-semibold">Activities of Daily Living</h2>
              <Button onClick={() => setIsAdlDialogOpen(true)}>
                <Heart className="mr-2 h-4 w-4" />
                Add ADL Record
              </Button>
            </div>
            {residentPrincipal && <AdlHistoryList residentId={residentPrincipal} />}
          </TabsContent>

          <TabsContent value="medications" className="space-y-4">
            <div className="flex justify-between">
              <h2 className="text-xl font-semibold">Current Medications</h2>
              <Button onClick={() => setIsAddMedicationDialogOpen(true)}>
                <Pill className="mr-2 h-4 w-4" />
                Add Medication
              </Button>
            </div>
            <div className="grid gap-4">
              {allMedications.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No medications recorded
                  </CardContent>
                </Card>
              ) : (
                allMedications.map((med, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold">{med.name}</h3>
                          <div className="mt-2 grid gap-2 text-sm md:grid-cols-2">
                            <div>
                              <span className="text-muted-foreground">Dosage:</span>{' '}
                              <span className="font-medium">{med.dosage || '-'}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Route:</span>{' '}
                              <span className="font-medium">{med.route || '-'}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Times:</span>{' '}
                              <span className="font-medium">
                                {med.times?.join(', ') || '-'}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Prescriber:</span>{' '}
                              <span className="font-medium">{med.prescriber || '-'}</span>
                            </div>
                          </div>
                          {med.notes && (
                            <div className="mt-2 text-sm">
                              <span className="text-muted-foreground">Notes:</span>{' '}
                              <span>{med.notes}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Print Report */}
      <ResidentProfilePrintReport
        resident={profileData}
        medications={allMedications}
        includePhysicianSignature={includePhysicianSignature}
      />

      {/* Dialogs */}
      {residentPrincipal && (
        <>
          <RecordDailyVitalsDialog
            open={isVitalsDialogOpen}
            onOpenChange={setIsVitalsDialogOpen}
            residentId={residentPrincipal}
          />
          <AddMarRecordDialog
            open={isMarDialogOpen}
            onOpenChange={setIsMarDialogOpen}
            residentId={residentPrincipal}
            activeMedications={allMedications}
          />
          <AddAdlRecordDialog
            open={isAdlDialogOpen}
            onOpenChange={setIsAdlDialogOpen}
            residentId={residentPrincipal}
          />
          <EditResidentInformationDialog
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            initialValues={getEditInitialValues()}
            onSave={handleEditSave}
            isSaving={updateResidentMutation.isPending}
          />
        </>
      )}
      <AddMedicationDialog
        open={isAddMedicationDialogOpen}
        onOpenChange={setIsAddMedicationDialogOpen}
        onAddMedication={handleAddMedication}
        assignedPhysicians={profileData.physicians}
      />
    </>
  );
}
