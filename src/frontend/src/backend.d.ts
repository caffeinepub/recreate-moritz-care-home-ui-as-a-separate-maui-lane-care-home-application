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
export interface MarRecord {
    medicationName: string;
    dosage: string;
    nurseId: Principal;
    timestamp: bigint;
    administrationTime: string;
}
export interface Resident {
    id: ResidentId;
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
export interface AdlRecord {
    activityType: string;
    assistanceLevel: string;
    notes: string;
    timestamp: bigint;
    supervisorId: Principal;
}
export interface ResidentCreateRequest {
    id: ResidentId;
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
export interface VitalsRecord {
    temperature: number;
    bloodPressure: string;
    timestamp: bigint;
    pulse: bigint;
    bloodOxygen: bigint;
}
export type ResidentId = Principal;
export interface UserProfile {
    name: string;
}
export interface Medication {
    medicationName: string;
    dosage: string;
    prescribingPhysician: string;
    administrationTimes: Array<string>;
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
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createAdlRecord(residentId: ResidentId, record: AdlRecord): Promise<void>;
    createMarRecord(residentId: ResidentId, record: MarRecord): Promise<void>;
    createResident(request: ResidentCreateRequest): Promise<Resident>;
    createVitalsEntry(residentId: ResidentId, record: VitalsRecord): Promise<void>;
    deleteAdlRecord(residentId: ResidentId, timestamp: bigint): Promise<void>;
    deleteMarRecord(residentId: ResidentId, timestamp: bigint): Promise<void>;
    deleteResident(id: ResidentId): Promise<void>;
    deleteVitalsEntry(residentId: ResidentId, timestamp: bigint): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getResident(id: ResidentId): Promise<Resident | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isResidentActive(residentId: ResidentId): Promise<boolean>;
    listActiveResidents(): Promise<Array<Resident>>;
    listAdlRecords(residentId: ResidentId): Promise<Array<AdlRecord>>;
    listMarRecords(residentId: ResidentId): Promise<Array<MarRecord>>;
    listVitalsEntries(residentId: ResidentId): Promise<Array<VitalsRecord>>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    toggleResidentStatus(id: ResidentId): Promise<ResidentStatusUpdateResult>;
    updateResident(id: ResidentId, updateRequest: ResidentUpdateRequest): Promise<ResidentUpdateResult>;
}
