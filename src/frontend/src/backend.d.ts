import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface InsuranceInfo {
    company: string;
    address: string;
    contactNumber: string;
    policyNumber: string;
}
export interface ResidentUpdateRequest {
    bed?: string;
    birthDate: string;
    admissionDate: string;
    name: string;
    roomNumber: string;
    insurance: InsuranceInfo;
    medications: Array<Medication>;
    pharmacy: PharmacyInfo;
    responsiblePersons: Array<ResponsiblePerson>;
    medicaidNumber: string;
    physicians: Array<Physician>;
    roomType: string;
    medicareNumber: string;
}
export interface PharmacyInfo {
    name: string;
    address: string;
    contactNumber: string;
}
export interface MedicationUpdate {
    id: bigint;
    status: MedicationStatus;
    medicationName: string;
    dosage: string;
    prescribingPhysician: string;
    administrationTimes: Array<string>;
    route?: MedicationRoute;
}
export interface Resident {
    id: ResidentId;
    bed?: string;
    active: boolean;
    birthDate: string;
    owner: Principal;
    admissionDate: string;
    name: string;
    createdAt: bigint;
    roomNumber: string;
    insurance: InsuranceInfo;
    medications: Array<Medication>;
    pharmacy: PharmacyInfo;
    responsiblePersons: Array<ResponsiblePerson>;
    medicaidNumber: string;
    physicians: Array<Physician>;
    roomType: string;
    medicareNumber: string;
}
export interface Physician {
    name: string;
    specialty: string;
    contactNumber: string;
}
export interface ResponsiblePerson {
    relationship: string;
    name: string;
    address: string;
    contactNumber: string;
}
export type MedicationRoute = {
    __kind__: "injection";
    injection: null;
} | {
    __kind__: "other";
    other: string;
} | {
    __kind__: "subcutaneous_SubQ";
    subcutaneous_SubQ: null;
} | {
    __kind__: "oral";
    oral: null;
} | {
    __kind__: "otic";
    otic: null;
} | {
    __kind__: "ophthalmic";
    ophthalmic: null;
} | {
    __kind__: "vaginal";
    vaginal: null;
} | {
    __kind__: "intravenous_IV";
    intravenous_IV: null;
} | {
    __kind__: "sublingual_SL";
    sublingual_SL: null;
} | {
    __kind__: "nasal";
    nasal: null;
} | {
    __kind__: "transdermal";
    transdermal: null;
} | {
    __kind__: "inhalation";
    inhalation: null;
} | {
    __kind__: "intramuscular_IM";
    intramuscular_IM: null;
} | {
    __kind__: "topical";
    topical: null;
} | {
    __kind__: "rectal";
    rectal: null;
};
export interface ResidentCreateRequest {
    id: ResidentId;
    bed?: string;
    birthDate: string;
    admissionDate: string;
    name: string;
    roomNumber: string;
    insurance: InsuranceInfo;
    medications: Array<Medication>;
    pharmacy: PharmacyInfo;
    responsiblePersons: Array<ResponsiblePerson>;
    medicaidNumber: string;
    physicians: Array<Physician>;
    roomType: string;
    medicareNumber: string;
}
export interface MarRecord {
    medicationName: string;
    dosage: string;
    nurseId: Principal;
    timestamp: bigint;
    administrationTime: string;
}
export interface HealthCheckResponse {
    status: string;
    message: string;
    timestamp: bigint;
    canisterId: string;
}
export interface AdlRecord {
    activityType: string;
    assistanceLevel: string;
    notes: string;
    timestamp: bigint;
    supervisorId: Principal;
}
export interface ResidentsDirectoryResponse {
    residents: Array<ResidentDirectoryEntry>;
    directoryLoadPerformance: DirectoryLoadPerformance;
}
export interface VitalsRecord {
    temperature: number;
    bloodPressure: string;
    timestamp: bigint;
    pulse: bigint;
    bloodOxygen: bigint;
}
export type ResidentId = Principal;
export interface ResidentDirectoryEntry {
    id: ResidentId;
    bed?: string;
    active: boolean;
    birthDate: string;
    admissionDate: string;
    name: string;
    createdAt: bigint;
    roomNumber: string;
    roomType: string;
}
export interface DirectoryLoadPerformance {
    backendQueryTimeNanos: bigint;
    totalRequestTimeNanos: bigint;
    residentCount: bigint;
}
export interface UserProfile {
    name: string;
}
export interface Medication {
    id: bigint;
    status: MedicationStatus;
    medicationName: string;
    dosage: string;
    prescribingPhysician: string;
    administrationTimes: Array<string>;
    route?: MedicationRoute;
}
export enum MedicationStatus {
    deleted = "deleted",
    active = "active",
    discontinued = "discontinued"
}
export enum ResidentStatusUpdateResult {
    activated = "activated",
    terminated = "terminated",
    notFound = "notFound"
}
export enum ResidentUpdateResult {
    notFound = "notFound",
    updated = "updated"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addMedication(residentId: ResidentId, newMedication: Medication): Promise<Medication>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createAdlRecord(residentId: ResidentId, record: AdlRecord): Promise<void>;
    createMarRecord(residentId: ResidentId, record: MarRecord): Promise<void>;
    createResident(request: ResidentCreateRequest): Promise<Resident>;
    createVitalsEntry(residentId: ResidentId, record: VitalsRecord): Promise<void>;
    deleteAdlRecord(residentId: ResidentId, timestamp: bigint): Promise<void>;
    deleteMarRecord(residentId: ResidentId, timestamp: bigint): Promise<void>;
    deleteMedication(residentId: ResidentId, medicationId: bigint): Promise<void>;
    deleteResident(id: ResidentId): Promise<void>;
    deleteVitalsEntry(residentId: ResidentId, timestamp: bigint): Promise<void>;
    discontinueMedication(residentId: ResidentId, medicationId: bigint): Promise<Medication>;
    ensureResidentsSeeded(): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getResident(id: ResidentId): Promise<Resident | null>;
    /**
     * / Residents Directory - Lightweight Endpoint for Residents Card Grid (Dashboard)
     */
    getResidentsDirectory(): Promise<ResidentsDirectoryResponse>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    healthCheck(): Promise<HealthCheckResponse>;
    isCallerAdmin(): Promise<boolean>;
    isResidentActive(residentId: ResidentId): Promise<boolean>;
    listActiveResidents(): Promise<Array<Resident>>;
    listAdlRecords(residentId: ResidentId): Promise<Array<AdlRecord>>;
    listMarRecords(residentId: ResidentId): Promise<Array<MarRecord>>;
    listVitalsEntries(residentId: ResidentId): Promise<Array<VitalsRecord>>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    toggleResidentStatus(id: ResidentId): Promise<ResidentStatusUpdateResult>;
    updateMedication(residentId: ResidentId, medicationUpdate: MedicationUpdate): Promise<Medication>;
    updateResident(id: ResidentId, updateRequest: ResidentUpdateRequest): Promise<ResidentUpdateResult>;
}
