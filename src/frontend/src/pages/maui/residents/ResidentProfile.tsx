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
import { AddMedicationDialog, EditMedicationDialog, MedicationRowActions } from '@/components/maui/residents/medications';
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
import { toast } from 'sonner';
import type { ResidentUpdateRequest, Medication, MedicationUpdate } from '@/backend';
import { MedicationStatus } from '@/backend';
import {
  getResidentProfileData,
  type ResidentMedication,
  type ResidentProfileData,
} from './mockResidentProfileData';
import { calculateAge, formatAge } from './residentAge';
import { getActiveMedications, getVisibleMedications, generateMedicationId } from '@/lib/medications';
import { selectValueToRoute } from '@/lib/medicationRoutes';

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

  // Try to parse residentId as Principal, fallback to mock data if invalid
  let residentPrincipal: Principal | null = null;
  try {
    residentPrincipal = Principal.fromText(residentId);
  } catch {
    // Invalid principal, will use mock data
  }

  const { data: backendResident, isLoading, error, refetch } = useGetResident(residentPrincipal);
  const updateResidentMutation = useUpdateResident();
  const updateMedicationMutation = useUpdateMedication();
  const addMedicationMutation = useAddMedication();
  const discontinueMedicationMutation = useDiscontinueMedication();
  const deleteMedicationMutation = useDeleteMedication();

  // Use backend data if available, otherwise fallback to mock
  const profileData: ResidentProfileData = backendResident
    ? {
        id: backendResident.id.toString(),
        name: backendResident.name,
        dateOfBirth: backendResident.birthDate,
        admissionDate: backendResident.admissionDate,
        room: backendResident.roomNumber ? `Room ${backendResident.roomNumber}` : 'Room TBD',
        roomType: backendResident.roomType || 'TBD',
        bed: backendResident.bed,
        status: backendResident.active ? 'Active' : 'Inactive',
        medicaidNumber: backendResident.medicaidNumber,
        medicareNumber: backendResident.medicareNumber,
        physicians: backendResident.physicians,
        pharmacy: backendResident.pharmacy,
        insurance: backendResident.insurance,
        responsiblePersons: backendResident.responsiblePersons,
        medications: backendResident.medications,
      }
    : getResidentProfileData(residentId);

  const age = calculateAge(profileData.dateOfBirth);

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
        insurance: profileData.insurance, // Use existing insurance data since form doesn't have these fields
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
      toast.error(error?.message || 'Failed to update resident information');
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
        // Try to match against known routes
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
          // Treat as "other"
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
      toast.error(error?.message || 'Failed to add medication');
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
      toast.error(error?.message || 'Failed to update medication');
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
      toast.error(error?.message || 'Failed to discontinue medication');
    }
  };

  const handleResumeMedication = async (medicationId: bigint) => {
    if (!residentPrincipal || !backendResident) {
      toast.error('Cannot resume medication: Invalid resident ID');
      return;
    }

    try {
      // Find the medication to resume
      const medication = backendResident.medications.find(m => m.id === medicationId);
      if (!medication) {
        toast.error('Medication not found');
        return;
      }

      // Update the medication status to active
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
      toast.error(error?.message || 'Failed to resume medication');
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
      toast.error(error?.message || 'Failed to delete medication');
    }
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

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load resident profile. Please try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const visibleMedications = getVisibleMedications(profileData.medications);
  const activeMedications = getActiveMedications(profileData.medications);

  // Prepare initial values for edit dialog
  const nameParts = profileData.name.split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  const editInitialValues: EditResidentFormData = {
    firstName,
    lastName,
    dateOfBirth: profileData.dateOfBirth,
    admissionDate: profileData.admissionDate,
    roomNumber: profileData.room.replace('Room ', ''),
    roomType: profileData.roomType,
    bed: profileData.bed || '',
    status: profileData.status,
    medicaidNumber: profileData.medicaidNumber,
    medicareNumber: profileData.medicareNumber,
    physicians: profileData.physicians,
    pharmacyName: profileData.pharmacy.name,
    pharmacyAddress: profileData.pharmacy.address,
    pharmacyContactNumber: profileData.pharmacy.contactNumber,
    responsiblePersons: profileData.responsiblePersons,
  };

  // Convert Medication[] to ResidentMedication[] for print report and MAR dialog
  const printMedications: ResidentMedication[] = visibleMedications.map(med => ({
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

  const activeMedicationsForMAR: ResidentMedication[] = activeMedications.map(med => ({
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
            <h1 className="text-3xl font-bold text-foreground">{profileData.name}</h1>
            <p className="text-muted-foreground mt-1">
              {profileData.room} • {age} years old
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Print Report
            </Button>
            <Button variant="default" size="sm" onClick={() => setIsEditDialogOpen(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Information
            </Button>
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
                {profileData.dateOfBirth} {formatAge(age)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Admission Date</p>
              <p className="font-medium">{profileData.admissionDate}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Room Assignment</p>
              <p className="font-medium">
                {profileData.room}
                {profileData.bed && ` - Bed ${profileData.bed}`}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Room Type</p>
              <p className="font-medium">{profileData.roomType}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Medicaid Number</p>
              <p className="font-medium">{profileData.medicaidNumber}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Medicare Number</p>
              <p className="font-medium">{profileData.medicareNumber}</p>
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
            {profileData.physicians.length > 0 ? (
              profileData.physicians.map((physician, index) => (
                <div key={index} className="border-l-2 border-primary pl-3 print:pl-2">
                  <p className="font-medium">{physician.name}</p>
                  <p className="text-sm text-muted-foreground">{physician.specialty}</p>
                  <p className="text-sm text-muted-foreground">{physician.contactNumber}</p>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">No physicians on file</p>
            )}
          </CardContent>
        </Card>

        {/* Pharmacy Card */}
        <Card className="print:shadow-none print:border-0 print:break-inside-avoid">
          <CardHeader className="print:pb-2">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Pharmacy Information
            </CardTitle>
          </CardHeader>
          <CardContent className="print:text-sm">
            <div className="space-y-1">
              <p className="font-medium">{profileData.pharmacy.name}</p>
              <p className="text-sm text-muted-foreground">{profileData.pharmacy.address}</p>
              <p className="text-sm text-muted-foreground">{profileData.pharmacy.contactNumber}</p>
            </div>
          </CardContent>
        </Card>

        {/* Insurance Card */}
        <Card className="print:shadow-none print:border-0 print:break-inside-avoid">
          <CardHeader className="print:pb-2">
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Insurance Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 print:gap-2 print:text-sm">
            <div>
              <p className="text-sm text-muted-foreground">Company</p>
              <p className="font-medium">{profileData.insurance.company}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Policy Number</p>
              <p className="font-medium">{profileData.insurance.policyNumber}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Address</p>
              <p className="font-medium">{profileData.insurance.address}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Contact Number</p>
              <p className="font-medium">{profileData.insurance.contactNumber}</p>
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
            {profileData.responsiblePersons.length > 0 ? (
              profileData.responsiblePersons.map((person, index) => (
                <div key={index} className="border-l-2 border-primary pl-3 print:pl-2">
                  <p className="font-medium">{person.name}</p>
                  <p className="text-sm text-muted-foreground">{person.relationship}</p>
                  <p className="text-sm text-muted-foreground">{person.contactNumber}</p>
                  <p className="text-sm text-muted-foreground">{person.address}</p>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">No responsible persons on file</p>
            )}
          </CardContent>
        </Card>

        {/* Tabs Section - Hidden on Print */}
        <div className="print:hidden">
          <Tabs defaultValue="vitals" className="space-y-4">
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
                <Pill className="mr-2 h-4 w-4" />
                Medications
              </TabsTrigger>
            </TabsList>

            <TabsContent value="vitals" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Daily Vitals History</h2>
                <Button onClick={() => setIsVitalsDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Record Vitals
                </Button>
              </div>
              {residentPrincipal && <VitalsHistoryList residentId={residentPrincipal} />}
            </TabsContent>

            <TabsContent value="mar" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Medication Administration Records</h2>
                <Button
                  onClick={() => setIsMarDialogOpen(true)}
                  disabled={activeMedications.length === 0}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add MAR Record
                </Button>
              </div>
              {activeMedications.length === 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No active medications available. Add medications in the Medications tab first.
                  </AlertDescription>
                </Alert>
              )}
              {residentPrincipal && <MarHistoryList residentId={residentPrincipal} />}
            </TabsContent>

            <TabsContent value="adl" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Activities of Daily Living</h2>
                <Button onClick={() => setIsAdlDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add ADL Record
                </Button>
              </div>
              {residentPrincipal && <AdlHistoryList residentId={residentPrincipal} />}
            </TabsContent>

            <TabsContent value="medications" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Current Medications</h2>
                <Button onClick={() => setIsAddMedicationDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Medication
                </Button>
              </div>

              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-left p-3 font-medium">Medication</th>
                          <th className="text-left p-3 font-medium">Dosage</th>
                          <th className="text-left p-3 font-medium">Route</th>
                          <th className="text-left p-3 font-medium">Times</th>
                          <th className="text-left p-3 font-medium">Prescriber</th>
                          <th className="text-left p-3 font-medium">Status</th>
                          <th className="text-right p-3 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {visibleMedications.length > 0 ? (
                          visibleMedications.map((medication) => (
                            <tr key={medication.id.toString()} className="hover:bg-muted/30">
                              <td className="p-3 font-medium">{medication.medicationName}</td>
                              <td className="p-3">{medication.dosage}</td>
                              <td className="p-3">
                                {medication.route
                                  ? '__kind__' in medication.route && medication.route.__kind__ === 'other'
                                    ? medication.route.other
                                    : medication.route.__kind__
                                  : '-'}
                              </td>
                              <td className="p-3">
                                {medication.administrationTimes.length > 0
                                  ? medication.administrationTimes.join(', ')
                                  : '-'}
                              </td>
                              <td className="p-3">{medication.prescribingPhysician || '-'}</td>
                              <td className="p-3">
                                <Badge
                                  variant={
                                    medication.status === MedicationStatus.active
                                      ? 'default'
                                      : 'secondary'
                                  }
                                >
                                  {medication.status}
                                </Badge>
                              </td>
                              <td className="p-3">
                                <MedicationRowActions
                                  medication={medication}
                                  onEdit={handleEditMedication}
                                  onDiscontinue={handleDiscontinueMedication}
                                  onResume={handleResumeMedication}
                                  onDelete={handleDeleteMedication}
                                />
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={7} className="p-8 text-center text-muted-foreground">
                              No medications on file. Click "Add Medication" to get started.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Print Report Section - Only visible when printing */}
        <div className="hidden print:block">
          <div className="mb-4 flex items-center gap-2">
            <Label htmlFor="physician-signature-toggle" className="text-sm">
              Include Physician Signature Section
            </Label>
            <Switch
              id="physician-signature-toggle"
              checked={includePhysicianSignature}
              onCheckedChange={setIncludePhysicianSignature}
            />
          </div>
          <ResidentProfilePrintReport
            resident={profileData}
            includePhysicianSignature={includePhysicianSignature}
            medications={printMedications}
          />
        </div>
      </div>

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
            activeMedications={activeMedicationsForMAR}
          />
          <AddAdlRecordDialog
            open={isAdlDialogOpen}
            onOpenChange={setIsAdlDialogOpen}
            residentId={residentPrincipal}
          />
        </>
      )}

      <AddMedicationDialog
        open={isAddMedicationDialogOpen}
        onOpenChange={setIsAddMedicationDialogOpen}
        physicians={profileData.physicians}
        onAddMedication={handleAddMedication}
      />

      <EditMedicationDialog
        open={isEditMedicationDialogOpen}
        onOpenChange={setIsEditMedicationDialogOpen}
        medication={selectedMedication}
        physicians={profileData.physicians}
        onSave={handleSaveMedication}
      />

      <EditResidentInformationDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        initialValues={editInitialValues}
        onSave={handleEditResident}
      />
    </>
  );
}
