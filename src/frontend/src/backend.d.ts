import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type ResidentId = Principal;
export interface AdlRecord {
    activityType: string;
    assistanceLevel: string;
    notes: string;
    timestamp: bigint;
    supervisorId: Principal;
}
export interface MarRecord {
    medicationName: string;
    dosage: string;
    nurseId: Principal;
    timestamp: bigint;
    administrationTime: string;
}
export interface VitalsRecord {
    temperature: number;
    bloodPressure: string;
    timestamp: bigint;
    pulse: bigint;
    bloodOxygen: bigint;
}
export interface UserProfile {
    name: string;
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
    createResidentProfile(residentId: ResidentId): Promise<void>;
    createVitalsEntry(residentId: ResidentId, record: VitalsRecord): Promise<void>;
    deleteAdlRecord(residentId: ResidentId, timestamp: bigint): Promise<void>;
    deleteMarRecord(residentId: ResidentId, timestamp: bigint): Promise<void>;
    deleteVitalsEntry(residentId: ResidentId, timestamp: bigint): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listAdlRecords(residentId: ResidentId): Promise<Array<AdlRecord>>;
    listMarRecords(residentId: ResidentId): Promise<Array<MarRecord>>;
    listVitalsEntries(residentId: ResidentId): Promise<Array<VitalsRecord>>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
}
