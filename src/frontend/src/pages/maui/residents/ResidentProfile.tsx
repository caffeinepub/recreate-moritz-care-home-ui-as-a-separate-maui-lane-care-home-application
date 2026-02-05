import { useState } from 'react';
import { useParams } from '@tanstack/react-router';
import { Principal } from '@dfinity/principal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Activity,
  Pill,
  FileText,
  Printer,
  User,
  MapPin,
  Heart,
  Edit,
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

export function ResidentProfile() {
  const { residentId } = useParams({ from: '/resident/$residentId' });
  const [isVitalsDialogOpen, setIsVitalsDialogOpen] = useState(false);
  const [isMarDialogOpen, setIsMarDialogOpen] = useState(false);
  const [isAdlDialogOpen, setIsAdlDialogOpen] = useState(false);
  const [isAddMedicationDialogOpen, setIsAddMedicationDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [clientMedications, setClientMedications] = useState<ResidentMedication[]>([]);

  // Try to parse residentId as Principal, fallback to mock data if invalid
  let residentPrincipal: Principal | null = null;
  try {
    residentPrincipal = Principal.fromText(residentId);
  } catch {
    // Invalid principal, will use mock data
  }

  const { data: backendResident, isLoading } = useGetResident(residentPrincipal);
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
      // Build update request preserving backend-only fields
      const updateRequest: ResidentUpdateRequest = {
        name: `${values.firstName} ${values.lastName}`.trim(),
        birthDate: values.dateOfBirth,
        admissionDate: values.admissionDate,
        roomNumber: values.roomNumber,
        roomType: values.roomType,
        medicaidNumber: values.medicaidNumber,
        medicareNumber: values.medicareNumber,
        physicians: values.physicians,
        pharmacy: {
          name: values.pharmacyName,
          address: values.pharmacyAddress,
          contactNumber: values.pharmacyContactNumber,
        },
        // Preserve existing backend fields that aren't in the edit dialog
        insurance: backendResident.insurance,
        responsiblePersons: backendResident.responsiblePersons,
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
        bed: 'Bed A',
        status: 'Active',
        medicaidNumber: '',
        medicareNumber: '',
        physicians: [],
        pharmacyName: '',
        pharmacyAddress: '',
        pharmacyContactNumber: '',
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
      bed: 'Bed A', // Default value as bed is not in backend
      status: backendResident.active ? 'Active' : 'Discharged',
      medicaidNumber: backendResident.medicaidNumber,
      medicareNumber: backendResident.medicareNumber,
      physicians: backendResident.physicians,
      pharmacyName: backendResident.pharmacy.name,
      pharmacyAddress: backendResident.pharmacy.address,
      pharmacyContactNumber: backendResident.pharmacy.contactNumber,
    };
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

  return (
    <>
      <div className="no-print container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
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
              Print Report
            </Button>
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
                <p className="font-medium">{profileData.dateOfBirth}</p>
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
