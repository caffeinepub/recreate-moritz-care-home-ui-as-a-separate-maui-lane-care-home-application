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
  Plus,
} from 'lucide-react';
import { RecordDailyVitalsDialog } from '@/components/maui/residents/vitals/RecordDailyVitalsDialog';
import { VitalsHistoryList } from '@/components/maui/residents/vitals/VitalsHistoryList';
import { AddMarRecordDialog } from '@/components/maui/residents/mar/AddMarRecordDialog';
import { MarHistoryList } from '@/components/maui/residents/mar/MarHistoryList';
import { AddAdlRecordDialog } from '@/components/maui/residents/adl/AddAdlRecordDialog';
import { AdlHistoryList } from '@/components/maui/residents/adl/AdlHistoryList';
import { AddMedicationDialog, EditMedicationDialog, MedicationsTab } from '@/components/maui/residents/medications';
import { EditResidentInformationDialog, type EditResidentFormData } from '@/components/maui/residents/EditResidentInformationDialog';
import { ResidentProfilePrintReport } from './ResidentProfilePrintReport';
import { 
  useGetResident, 
  useUpdateResident,
  useUpdateMedication,
  useAddMedication,
  useDiscontinueMedication,
  useDeleteMedication
} from '@/hooks/useQueries';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { toast } from 'sonner';
import type { ResidentUpdateRequest, Medication, MedicationUpdate } from '@/backend';
import { MedicationStatus } from '@/backend';
import { calculateAge, formatAge } from './residentAge';
import { getActiveMedications, getVisibleMedications, generateMedicationId } from '@/lib/medications';

export function ResidentProfile() {
  const { residentId } = useParams({ from: '/resident/$residentId' });
  const [isVitalsDialogOpen, setIsVitalsDialogOpen] = useState(false);
  const [isMarDialogOpen, setIsMarDialogOpen] = useState(false);
  const [isAdlDialogOpen, setIsAdlDialogOpen] = useState(false);
  const [isAddMedicationDialogOpen, setIsAddMedicationDialogOpen] = useState(false);
  const [isEditMedicationDialogOpen, setIsEditMedicationDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);
  const [includePhysicianSignature, setIncludePhysicianSignature] = useState(false);

  const { identity } = useInternetIdentity();

  // Try to parse residentId as Principal
  let residentPrincipal: Principal | null = null;
  try {
    residentPrincipal = Principal.fromText(residentId);
  } catch {
    // Invalid principal
  }

  const { data: backendResident, isLoading, error, refetch } = useGetResident(residentPrincipal);
  const updateResidentMutation = useUpdateResident();
  const updateMedicationMutation = useUpdateMedication();
  const addMedicationMutation = useAddMedication();
  const discontinueMedicationMutation = useDiscontinueMedication();
  const deleteMedicationMutation = useDeleteMedication();

  // Check if current user is the owner or admin
  const currentUserPrincipal = identity?.getPrincipal().toString();
  const isOwner = backendResident && currentUserPrincipal 
    ? backendResident.owner.toString() === currentUserPrincipal 
    : false;

  const age = backendResident ? calculateAge(backendResident.birthDate) : 0;

  const handlePrint = () => {
    window.print();
  };

  const handleEditResident = async (formData: EditResidentFormData) => {
    if (!residentPrincipal || !backendResident) {
      toast.error('Cannot edit resident: Invalid resident ID');
      return;
    }

    try {
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      
      const updateRequest: ResidentUpdateRequest = {
        name: fullName,
        birthDate: formData.dateOfBirth,
        admissionDate: formData.admissionDate,
        roomNumber: formData.roomNumber,
        roomType: formData.roomType,
        bed: formData.bed || undefined,
        medicaidNumber: formData.medicaidNumber,
        medicareNumber: formData.medicareNumber,
        physicians: formData.physicians,
        pharmacy: {
          name: formData.pharmacyName,
          address: formData.pharmacyAddress,
          contactNumber: formData.pharmacyContactNumber,
        },
        insurance: backendResident.insurance,
        responsiblePersons: formData.responsiblePersons,
        medications: backendResident.medications,
      };

      await updateResidentMutation.mutateAsync({
        id: residentPrincipal,
        updateRequest,
      });

      toast.success('Resident information updated successfully');
      setIsEditDialogOpen(false);
    } catch (error: any) {
      console.error('Failed to update resident:', error);
      const errorMessage = error?.message || 'Failed to update resident information';
      toast.error(errorMessage);
    }
  };

  const handleAddMedication = async (medicationData: {
    medicationName: string;
    dosage: string;
    route: string;
    administrationTimes: string[];
    prescribingPhysician: string;
    notes: string;
  }) => {
    if (!residentPrincipal || !backendResident) {
      toast.error('Cannot add medication: Invalid resident ID');
      return;
    }

    try {
      const newMedicationId = generateMedicationId(backendResident.medications);

      // Convert route string back to MedicationRoute type
      let routeValue: any = undefined;
      if (medicationData.route) {
        const routeMap: Record<string, any> = {
          oral: { __kind__: 'oral', oral: null },
          intravenous_IV: { __kind__: 'intravenous_IV', intravenous_IV: null },
          intramuscular_IM: { __kind__: 'intramuscular_IM', intramuscular_IM: null },
          subcutaneous_SubQ: { __kind__: 'subcutaneous_SubQ', subcutaneous_SubQ: null },
          sublingual_SL: { __kind__: 'sublingual_SL', sublingual_SL: null },
          topical: { __kind__: 'topical', topical: null },
          transdermal: { __kind__: 'transdermal', transdermal: null },
          rectal: { __kind__: 'rectal', rectal: null },
          inhalation: { __kind__: 'inhalation', inhalation: null },
          nasal: { __kind__: 'nasal', nasal: null },
          ophthalmic: { __kind__: 'ophthalmic', ophthalmic: null },
          otic: { __kind__: 'otic', otic: null },
          vaginal: { __kind__: 'vaginal', vaginal: null },
          injection: { __kind__: 'injection', injection: null },
        };
        
        if (routeMap[medicationData.route]) {
          routeValue = routeMap[medicationData.route];
        } else {
          routeValue = { __kind__: 'other', other: medicationData.route };
        }
      }

      const newMedication: Medication = {
        id: newMedicationId,
        medicationName: medicationData.medicationName,
        dosage: medicationData.dosage,
        administrationTimes: medicationData.administrationTimes,
        route: routeValue,
        prescribingPhysician: medicationData.prescribingPhysician,
        status: MedicationStatus.active,
      };

      await addMedicationMutation.mutateAsync({
        residentId: residentPrincipal,
        medication: newMedication,
      });

      toast.success('Medication added successfully');
    } catch (error: any) {
      console.error('Failed to add medication:', error);
      const errorMessage = error?.message || 'Failed to add medication';
      toast.error(errorMessage);
    }
  };

  const handleEditMedication = (medication: Medication) => {
    setSelectedMedication(medication);
    setIsEditMedicationDialogOpen(true);
  };

  const handleSaveMedication = async (updatedMedication: Medication) => {
    if (!residentPrincipal) {
      toast.error('Cannot update medication: Invalid resident ID');
      return;
    }

    try {
      const medicationUpdate: MedicationUpdate = {
        id: updatedMedication.id,
        medicationName: updatedMedication.medicationName,
        dosage: updatedMedication.dosage,
        administrationTimes: updatedMedication.administrationTimes,
        route: updatedMedication.route,
        prescribingPhysician: updatedMedication.prescribingPhysician,
        status: updatedMedication.status,
      };

      await updateMedicationMutation.mutateAsync({
        residentId: residentPrincipal,
        medicationUpdate,
      });

      toast.success('Medication updated successfully');
      setIsEditMedicationDialogOpen(false);
      setSelectedMedication(null);
    } catch (error: any) {
      console.error('Failed to update medication:', error);
      const errorMessage = error?.message || 'Failed to update medication';
      toast.error(errorMessage);
    }
  };

  const handleDiscontinueMedication = async (medicationId: bigint) => {
    if (!residentPrincipal) {
      toast.error('Cannot discontinue medication: Invalid resident ID');
      return;
    }

    try {
      await discontinueMedicationMutation.mutateAsync({
        residentId: residentPrincipal,
        medicationId,
      });

      toast.success('Medication discontinued successfully');
    } catch (error: any) {
      console.error('Failed to discontinue medication:', error);
      const errorMessage = error?.message || 'Failed to discontinue medication';
      toast.error(errorMessage);
    }
  };

  const handleResumeMedication = async (medicationId: bigint) => {
    if (!residentPrincipal || !backendResident) {
      toast.error('Cannot resume medication: Invalid resident ID');
      return;
    }

    try {
      const medication = backendResident.medications.find(m => m.id === medicationId);
      if (!medication) {
        toast.error('Medication not found');
        return;
      }

      const medicationUpdate: MedicationUpdate = {
        id: medication.id,
        medicationName: medication.medicationName,
        dosage: medication.dosage,
        administrationTimes: medication.administrationTimes,
        route: medication.route,
        prescribingPhysician: medication.prescribingPhysician,
        status: MedicationStatus.active,
      };

      await updateMedicationMutation.mutateAsync({
        residentId: residentPrincipal,
        medicationUpdate,
      });

      toast.success('Medication resumed successfully');
    } catch (error: any) {
      console.error('Failed to resume medication:', error);
      const errorMessage = error?.message || 'Failed to resume medication';
      toast.error(errorMessage);
    }
  };

  const handleDeleteMedication = async (medicationId: bigint) => {
    if (!residentPrincipal) {
      toast.error('Cannot delete medication: Invalid resident ID');
      return;
    }

    try {
      await deleteMedicationMutation.mutateAsync({
        residentId: residentPrincipal,
        medicationId,
      });

      toast.success('Medication deleted successfully');
    } catch (error: any) {
      console.error('Failed to delete medication:', error);
      const errorMessage = error?.message || 'Failed to delete medication';
      toast.error(errorMessage);
    }
  };

  // No-op handlers for non-owners
  const handleNoOpVoid = () => {
    toast.error('You do not have permission to perform this action.');
  };

  const handleNoOpMedication = (_medication: Medication) => {
    toast.error('You do not have permission to perform this action.');
  };

  const handleNoOpMedicationId = (_medicationId: bigint) => {
    toast.error('You do not have permission to perform this action.');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading resident profile...</p>
        </div>
      </div>
    );
  }

  if (error || !backendResident || !residentPrincipal) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error instanceof Error ? error.message : 'Resident not found or you do not have permission to view this profile.'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const visibleMedications = getVisibleMedications(backendResident.medications);
  const activeMedications = getActiveMedications(backendResident.medications);

  // Prepare initial values for edit dialog
  const nameParts = backendResident.name.split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  const editInitialValues: EditResidentFormData = {
    firstName,
    lastName,
    dateOfBirth: backendResident.birthDate,
    admissionDate: backendResident.admissionDate,
    roomNumber: backendResident.roomNumber,
    roomType: backendResident.roomType,
    bed: backendResident.bed || '',
    status: backendResident.active ? 'Active' : 'Inactive',
    medicaidNumber: backendResident.medicaidNumber,
    medicareNumber: backendResident.medicareNumber,
    physicians: backendResident.physicians,
    pharmacyName: backendResident.pharmacy.name,
    pharmacyAddress: backendResident.pharmacy.address,
    pharmacyContactNumber: backendResident.pharmacy.contactNumber,
    responsiblePersons: backendResident.responsiblePersons,
  };

  // Convert Medication[] to ResidentMedication[] for print report and MAR dialog
  const printMedications = visibleMedications.map(med => ({
    name: med.medicationName,
    dosage: med.dosage,
    route: med.route
      ? '__kind__' in med.route && med.route.__kind__ === 'other'
        ? med.route.other
        : med.route.__kind__
      : undefined,
    times: med.administrationTimes,
    prescriber: med.prescribingPhysician,
    notes: undefined,
  }));

  const activeMedicationsForMAR = activeMedications.map(med => ({
    name: med.medicationName,
    dosage: med.dosage,
    route: med.route
      ? '__kind__' in med.route && med.route.__kind__ === 'other'
        ? med.route.other
        : med.route.__kind__
      : undefined,
    times: med.administrationTimes,
    prescriber: med.prescribingPhysician,
    notes: undefined,
  }));

  return (
    <>
      <div className="space-y-6 print:space-y-4">
        {/* Header Section - Hidden on Print */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{backendResident.name}</h1>
            <p className="text-muted-foreground mt-1">
              Room {backendResident.roomNumber} • {age} years old
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Print Report
            </Button>
            {isOwner && (
              <Button variant="default" size="sm" onClick={() => setIsEditDialogOpen(true)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Information
              </Button>
            )}
          </div>
        </div>

        {/* Resident Information Card */}
        <Card className="print:shadow-none print:border-0">
          <CardHeader className="print:pb-2">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Resident Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 print:gap-2 print:text-sm">
            <div>
              <p className="text-sm text-muted-foreground">Date of Birth</p>
              <p className="font-medium">
                {backendResident.birthDate} {formatAge(age)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Admission Date</p>
              <p className="font-medium">{backendResident.admissionDate}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Room Assignment</p>
              <p className="font-medium">
                Room {backendResident.roomNumber}
                {backendResident.bed && ` - Bed ${backendResident.bed}`}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Room Type</p>
              <p className="font-medium">{backendResident.roomType}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Medicaid Number</p>
              <p className="font-medium">{backendResident.medicaidNumber}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Medicare Number</p>
              <p className="font-medium">{backendResident.medicareNumber}</p>
            </div>
          </CardContent>
        </Card>

        {/* Physicians Card */}
        <Card className="print:shadow-none print:border-0 print:break-inside-avoid">
          <CardHeader className="print:pb-2">
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5" />
              Physicians
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 print:space-y-2 print:text-sm">
            {backendResident.physicians.length > 0 ? (
              backendResident.physicians.map((physician, index) => (
                <div key={index} className="border-l-2 border-primary pl-3">
                  <p className="font-medium">{physician.name}</p>
                  <p className="text-sm text-muted-foreground">{physician.specialty}</p>
                  <p className="text-sm text-muted-foreground">{physician.contactNumber}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No physicians assigned</p>
            )}
          </CardContent>
        </Card>

        {/* Pharmacy Card */}
        <Card className="print:shadow-none print:border-0 print:break-inside-avoid">
          <CardHeader className="print:pb-2">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Pharmacy
            </CardTitle>
          </CardHeader>
          <CardContent className="print:text-sm">
            <div className="space-y-2">
              <div>
                <p className="font-medium">{backendResident.pharmacy.name}</p>
                <p className="text-sm text-muted-foreground">{backendResident.pharmacy.address}</p>
                <p className="text-sm text-muted-foreground">{backendResident.pharmacy.contactNumber}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Responsible Persons Card */}
        <Card className="print:shadow-none print:border-0 print:break-inside-avoid">
          <CardHeader className="print:pb-2">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Responsible Persons
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 print:space-y-2 print:text-sm">
            {backendResident.responsiblePersons.length > 0 ? (
              backendResident.responsiblePersons.map((person, index) => (
                <div key={index} className="border-l-2 border-secondary pl-3">
                  <p className="font-medium">{person.name}</p>
                  <p className="text-sm text-muted-foreground">{person.relationship}</p>
                  <p className="text-sm text-muted-foreground">{person.contactNumber}</p>
                  <p className="text-sm text-muted-foreground">{person.address}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No responsible persons assigned</p>
            )}
          </CardContent>
        </Card>

        {/* Tabs Section - Hidden on Print */}
        <div className="print:hidden">
          <Tabs defaultValue="vitals" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="vitals">
                <Activity className="mr-2 h-4 w-4" />
                Daily Vitals
              </TabsTrigger>
              <TabsTrigger value="mar">
                <Pill className="mr-2 h-4 w-4" />
                MAR
              </TabsTrigger>
              <TabsTrigger value="adl">
                <FileText className="mr-2 h-4 w-4" />
                ADL
              </TabsTrigger>
              <TabsTrigger value="medications">
                <Heart className="mr-2 h-4 w-4" />
                Medications
              </TabsTrigger>
            </TabsList>

            <TabsContent value="vitals" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Daily Vitals Records</h3>
                {isOwner && (
                  <Button onClick={() => setIsVitalsDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Record Vitals
                  </Button>
                )}
              </div>
              <VitalsHistoryList residentId={residentPrincipal} />
            </TabsContent>

            <TabsContent value="mar" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Medication Administration Records</h3>
                {isOwner && (
                  <Button onClick={() => setIsMarDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add MAR Record
                  </Button>
                )}
              </div>
              <MarHistoryList residentId={residentPrincipal} />
            </TabsContent>

            <TabsContent value="adl" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Activities of Daily Living</h3>
                {isOwner && (
                  <Button onClick={() => setIsAdlDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add ADL Record
                  </Button>
                )}
              </div>
              <AdlHistoryList residentId={residentPrincipal} />
            </TabsContent>

            <TabsContent value="medications" className="space-y-4">
              <MedicationsTab
                medications={visibleMedications}
                onAddMedication={isOwner ? () => setIsAddMedicationDialogOpen(true) : handleNoOpVoid}
                onEditMedication={isOwner ? handleEditMedication : handleNoOpMedication}
                onDiscontinueMedication={isOwner ? handleDiscontinueMedication : handleNoOpMedicationId}
                onResumeMedication={isOwner ? handleResumeMedication : handleNoOpMedicationId}
                onDeleteMedication={isOwner ? handleDeleteMedication : handleNoOpMedicationId}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Print Report Component */}
      <ResidentProfilePrintReport
        resident={{
          id: backendResident.id.toString(),
          name: backendResident.name,
          dateOfBirth: backendResident.birthDate,
          admissionDate: backendResident.admissionDate,
          room: `Room ${backendResident.roomNumber}`,
          roomType: backendResident.roomType,
          bed: backendResident.bed,
          status: backendResident.active ? 'Active' : 'Inactive',
          medicaidNumber: backendResident.medicaidNumber,
          medicareNumber: backendResident.medicareNumber,
          physicians: backendResident.physicians,
          pharmacy: backendResident.pharmacy,
          insurance: backendResident.insurance,
          responsiblePersons: backendResident.responsiblePersons,
          medications: backendResident.medications,
        }}
        medications={printMedications}
        includePhysicianSignature={includePhysicianSignature}
      />

      {/* Dialogs */}
      {isOwner && (
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
            activeMedications={activeMedicationsForMAR}
          />
          <AddAdlRecordDialog
            open={isAdlDialogOpen}
            onOpenChange={setIsAdlDialogOpen}
            residentId={residentPrincipal}
          />
          <AddMedicationDialog
            open={isAddMedicationDialogOpen}
            onOpenChange={setIsAddMedicationDialogOpen}
            onAddMedication={handleAddMedication}
            physicians={backendResident.physicians}
          />
          {selectedMedication && (
            <EditMedicationDialog
              open={isEditMedicationDialogOpen}
              onOpenChange={setIsEditMedicationDialogOpen}
              medication={selectedMedication}
              onSave={handleSaveMedication}
              physicians={backendResident.physicians}
            />
          )}
          <EditResidentInformationDialog
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            initialValues={editInitialValues}
            onSave={handleEditResident}
          />
        </>
      )}
    </>
  );
}
