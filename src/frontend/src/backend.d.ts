import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
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
    createVitalsEntry(record: VitalsRecord): Promise<void>;
    deleteVitalsEntry(timestamp: bigint): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listVitalsEntries(): Promise<Array<VitalsRecord>>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
}
