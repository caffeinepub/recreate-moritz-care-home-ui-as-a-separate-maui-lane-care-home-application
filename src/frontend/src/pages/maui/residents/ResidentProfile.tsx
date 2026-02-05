import { useNavigate, useParams } from '@tanstack/react-router';
import { ArrowLeft, Printer, Edit, User, Stethoscope, Building2, Users, FileText, Pill, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { getResidentProfileData, ResidentProfileData } from './mockResidentProfileData';
import { getResidentMedications } from './mockResidentMedications';
import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { EditResidentInformationDialog, EditResidentFormData } from '@/components/maui/residents/EditResidentInformationDialog';
import { ResidentProfilePrintReport } from './ResidentProfilePrintReport';
import { RecordDailyVitalsDialog } from '@/components/maui/residents/vitals/RecordDailyVitalsDialog';
import { VitalsHistoryList } from '@/components/maui/residents/vitals/VitalsHistoryList';
import { AddMarRecordDialog, MarHistoryList } from '@/components/maui/residents/mar';
import { AddAdlRecordDialog, AdlHistoryList } from '@/components/maui/residents/adl';
import { useListVitalsEntries, useListMarRecords, useListAdlRecords } from '@/hooks/useQueries';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { Principal } from '@dfinity/principal';

export function ResidentProfile() {
  const navigate = useNavigate();
  const { residentId } = useParams({ from: '/resident/$residentId' });
  const { identity } = useInternetIdentity();
  const [includeSignature, setIncludeSignature] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [vitalsDialogOpen, setVitalsDialogOpen] = useState(false);
  const [marDialogOpen, setMarDialogOpen] = useState(false);
  const [adlDialogOpen, setAdlDialogOpen] = useState(false);

  const initialProfileData = getResidentProfileData(Number(residentId));
  const [profileData, setProfileData] = useState<ResidentProfileData | null>(initialProfileData);
  const medications = getResidentMedications(Number(residentId));

  // Filter active medications for MAR dialog
  const activeMedications = useMemo(
    () => medications.filter((med) => med.status === 'Active'),
    [medications]
  );

  // Convert residentId to Principal for backend calls
  const residentPrincipal = useMemo(() => {
    if (!identity) return null;
    // In a real app, you'd map the numeric residentId to a Principal
    // For now, we'll use the current user's principal as the resident
    return identity.getPrincipal();
  }, [identity]);

  // Fetch vitals data
  const { data: vitalsData = [], isLoading: vitalsLoading } = useListVitalsEntries();

  // Fetch MAR data
  const { data: marData = [], isLoading: marLoading } = useListMarRecords(
    residentPrincipal || Principal.anonymous()
  );

  // Fetch ADL data
  const { data: adlData = [], isLoading: adlLoading } = useListAdlRecords(
    residentPrincipal || Principal.anonymous()
  );

  if (!profileData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Resident not found</h2>
          <Button onClick={() => navigate({ to: '/' })} className="mt-4">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const handleEditProfile = () => {
    setEditDialogOpen(true);
  };

  const handleAddMedication = () => {
    toast.info('Add medication functionality');
  };

  const handleEditMedication = (medId: string) => {
    toast.info(`Edit medication ${medId}`);
  };

  const handleDiscontinueMedication = (medId: string) => {
    toast.info(`Discontinue medication ${medId}`);
  };

  // Convert profile data to form data
  const getFormDataFromProfile = (): EditResidentFormData => {
    const nameParts = profileData.name.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Convert date strings to YYYY-MM-DD format
    const dobParts = profileData.dateOfBirth.split(', ');
    const dobYear = dobParts[1] || '1944';
    const dobMonthDay = dobParts[0] || 'July 14';
    const dobDate = new Date(`${dobMonthDay}, ${dobYear}`);
    const dobFormatted = dobDate.toISOString().split('T')[0];

    const admissionParts = profileData.admissionDate.split(', ');
    const admissionYear = admissionParts[1] || '2021';
    const admissionMonthDay = admissionParts[0] || 'October 14';
    const admissionDate = new Date(`${admissionMonthDay}, ${admissionYear}`);
    const admissionFormatted = admissionDate.toISOString().split('T')[0];

    return {
      firstName,
      lastName,
      dateOfBirth: dobFormatted,
      admissionDate: admissionFormatted,
      roomNumber: profileData.roomNumber,
      roomType: 'Shared',
      bed: `Bed ${profileData.bed}`,
      status: profileData.status,
      medicaidNumber: profileData.insuranceInfo?.medicaidNumber || 'N/A',
      medicareNumber: profileData.insuranceInfo?.medicareNumber || '',
      physicians: profileData.assignedPhysicians.map((p) => ({
        name: p.name,
        contactNumber: p.phone,
        specialty: p.specialty,
      })),
      pharmacyName: profileData.pharmacyInfo.name,
      pharmacyAddress: profileData.pharmacyInfo.address,
      pharmacyContactNumber: profileData.pharmacyInfo.phone,
    };
  };

  const handleSaveProfile = (formData: EditResidentFormData) => {
    // Convert form data back to profile data
    const dob = new Date(formData.dateOfBirth);
    const dobFormatted = dob.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const admission = new Date(formData.admissionDate);
    const admissionFormatted = admission.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const bedLetter = formData.bed.replace('Bed ', '');

    const updatedProfile: ResidentProfileData = {
      ...profileData,
      name: `${formData.firstName} ${formData.lastName}`,
      dateOfBirth: dobFormatted,
      admissionDate: admissionFormatted,
      roomNumber: formData.roomNumber,
      bed: bedLetter,
      status: formData.status as 'Active' | 'Discharged',
      assignedPhysicians: formData.physicians.map((p) => ({
        name: p.name,
        specialty: p.specialty,
        phone: p.contactNumber,
      })),
      pharmacyInfo: {
        name: formData.pharmacyName,
        address: formData.pharmacyAddress,
        phone: formData.pharmacyContactNumber,
      },
      insuranceInfo: {
        medicaidNumber: formData.medicaidNumber,
        medicareNumber: formData.medicareNumber,
      },
    };

    setProfileData(updatedProfile);
    toast.success('Resident information updated successfully');
  };

  return (
    <>
      <div className="no-print container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate({ to: '/' })}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <Separator orientation="vertical" className="h-8" />
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 bg-primary/10">
                <AvatarFallback className="bg-primary/10 text-primary">
                  <User className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{profileData.name}</h1>
                <p className="text-sm text-muted-foreground">Resident Profile</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
              <Switch
                id="include-signature"
                checked={includeSignature}
                onCheckedChange={setIncludeSignature}
              />
              <Label htmlFor="include-signature" className="cursor-pointer text-sm">
                Include physician printed name & signature
              </Label>
            </div>
            <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2">
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button size="sm" onClick={handleEditProfile} className="gap-2">
              <Edit className="h-4 w-4" />
              Edit Profile
            </Button>
          </div>
        </div>

        {/* Overview Summary Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-xl">{profileData.name}</CardTitle>
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    Room {profileData.roomNumber} - Bed {profileData.bed}
                  </Badge>
                  <p className="text-sm text-muted-foreground">Resident ID: {profileData.id}</p>
                </div>
              </div>
              <Badge
                variant={profileData.status === 'Active' ? 'default' : 'outline'}
                className="gap-1"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                {profileData.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
              <div>
                <p className="text-xs text-muted-foreground">Room Number</p>
                <p className="font-semibold">{profileData.roomNumber}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Bed</p>
                <p className="font-semibold">{profileData.bed}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Date of Birth</p>
                <p className="font-semibold">{profileData.dateOfBirth}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Age</p>
                <p className="font-semibold">{profileData.age} years</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Admission Date</p>
                <p className="font-semibold">{profileData.admissionDate}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <p className="font-semibold">{profileData.status}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Three Info Cards Row */}
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          {/* Assigned Physicians */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Stethoscope className="h-4 w-4 text-primary" />
                Assigned Physicians
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {profileData.assignedPhysicians.map((physician, idx) => (
                <div key={idx} className="rounded-lg border border-border bg-muted/30 p-3">
                  <p className="font-semibold">{physician.name}</p>
                  <p className="text-sm text-muted-foreground">{physician.specialty}</p>
                  <p className="mt-1 text-sm">📞 {physician.phone}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Pharmacy Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Building2 className="h-4 w-4 text-primary" />
                Pharmacy Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <p className="font-semibold">{profileData.pharmacyInfo.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  📍 {profileData.pharmacyInfo.address}
                </p>
                <p className="mt-1 text-sm">📞 {profileData.pharmacyInfo.phone}</p>
              </div>
            </CardContent>
          </Card>

          {/* Responsible Contacts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-4 w-4 text-primary" />
                Responsible Contacts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {profileData.responsibleContacts.map((contact, idx) => (
                <div key={idx} className="rounded-lg border border-border bg-muted/30 p-3">
                  <p className="font-semibold">{contact.name}</p>
                  <p className="text-sm text-muted-foreground">{contact.relationship}</p>
                  <p className="mt-1 text-sm">📞 {contact.phone}</p>
                  {contact.email && <p className="text-sm">📧 {contact.email}</p>}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Insurance Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4 text-primary" />
              Insurance Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            {profileData.insuranceInfo ? (
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Medicaid Number</p>
                  <p className="font-semibold">
                    {profileData.insuranceInfo.medicaidNumber || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Medicare Number</p>
                  <p className="font-semibold">
                    {profileData.insuranceInfo.medicareNumber || 'N/A'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <FileText className="mb-2 h-12 w-12 text-muted-foreground/40" />
                <p className="text-muted-foreground">No insurance information available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabbed Section */}
        <Tabs defaultValue="medications" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="medications">Medications</TabsTrigger>
            <TabsTrigger value="vitals">Daily Vitals</TabsTrigger>
            <TabsTrigger value="mar">MAR</TabsTrigger>
            <TabsTrigger value="adl">ADL</TabsTrigger>
          </TabsList>

          <TabsContent value="medications" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Pill className="h-5 w-5 text-primary" />
                    Current Medications
                  </CardTitle>
                  <Button onClick={handleAddMedication} size="sm">
                    Add Medication
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {medications.map((med) => (
                  <div
                    key={med.id}
                    className="rounded-lg border border-border bg-card p-4 transition-shadow hover:shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold">{med.name}</h3>
                          <Badge
                            variant={med.status === 'Active' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {med.status}
                          </Badge>
                        </div>
                        <div className="mt-2 grid gap-2 text-sm md:grid-cols-2">
                          <div>
                            <span className="font-medium">Dosage:</span> {med.dosage}
                          </div>
                          <div>
                            <span className="font-medium">Quantity:</span> {med.quantity}
                          </div>
                          <div>
                            <span className="font-medium">Route:</span> {med.route}
                          </div>
                          <div>
                            <span className="font-medium">Times:</span> {med.times}
                          </div>
                        </div>
                        {med.notes && (
                          <div className="mt-2 text-sm">
                            <span className="font-medium">Notes:</span>{' '}
                            <span className="italic text-muted-foreground">{med.notes}</span>
                          </div>
                        )}
                        <div className="mt-2 text-sm text-muted-foreground">
                          Prescribed by: {med.prescribedBy}
                        </div>
                      </div>
                      <div className="ml-4 flex flex-col gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditMedication(med.id)}
                          className="gap-2"
                        >
                          <Edit className="h-3 w-3" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDiscontinueMedication(med.id)}
                          className="gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        >
                          Discontinue
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vitals" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    Daily Vitals
                  </CardTitle>
                  <Button onClick={() => setVitalsDialogOpen(true)} size="sm">
                    Record Daily Vitals
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <VitalsHistoryList vitals={vitalsData} isLoading={vitalsLoading} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mar" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Pill className="h-5 w-5 text-primary" />
                    MAR (Medication Administration Record)
                  </CardTitle>
                  <Button onClick={() => setMarDialogOpen(true)} size="sm">
                    Add MAR Record
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {residentPrincipal ? (
                  <MarHistoryList
                    marRecords={marData}
                    isLoading={marLoading}
                    residentId={residentPrincipal}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Pill className="mb-4 h-12 w-12 text-muted-foreground/40" />
                    <h3 className="mb-2 text-lg font-semibold">Please log in</h3>
                    <p className="text-sm text-muted-foreground">
                      You must be logged in to view MAR records
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="adl" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    ADL (Activities of Daily Living)
                  </CardTitle>
                  <Button onClick={() => setAdlDialogOpen(true)} size="sm">
                    Add ADL Record
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {residentPrincipal ? (
                  <AdlHistoryList
                    adlRecords={adlData}
                    isLoading={adlLoading}
                    residentId={residentPrincipal}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Activity className="mb-4 h-12 w-12 text-muted-foreground/40" />
                    <h3 className="mb-2 text-lg font-semibold">Please log in</h3>
                    <p className="text-sm text-muted-foreground">
                      You must be logged in to view ADL records
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Resident Dialog */}
        <EditResidentInformationDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          initialValues={getFormDataFromProfile()}
          onSave={handleSaveProfile}
        />

        {/* Record Daily Vitals Dialog */}
        <RecordDailyVitalsDialog open={vitalsDialogOpen} onOpenChange={setVitalsDialogOpen} />

        {/* Add MAR Record Dialog */}
        {residentPrincipal && (
          <AddMarRecordDialog
            open={marDialogOpen}
            onOpenChange={setMarDialogOpen}
            residentId={residentPrincipal}
            activeMedications={activeMedications}
          />
        )}

        {/* Add ADL Record Dialog */}
        {residentPrincipal && (
          <AddAdlRecordDialog
            open={adlDialogOpen}
            onOpenChange={setAdlDialogOpen}
            residentId={residentPrincipal}
          />
        )}
      </div>

      {/* Print Report (hidden on screen, visible when printing) */}
      <ResidentProfilePrintReport
        profileData={profileData}
        medications={medications}
        includeSignature={includeSignature}
      />
    </>
  );
}
