import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type HeaderField = [string, string];
export type Time = bigint;
export interface StreamingToken {
    resource: string;
    index: bigint;
}
export interface StreamingCallbackHttpResponse {
    token?: StreamingToken;
    body: Uint8Array;
}
export type StreamingCallback = (arg0: StreamingToken) => Promise<StreamingCallbackHttpResponse>;
export interface Profile {
    name: string;
    wishList: string;
    registrationTime: Time;
}
export type StreamingStrategy = {
    __kind__: "Callback";
    Callback: {
        token: StreamingToken;
        callback: [Principal, string];
    };
};
export interface HttpResponse {
    body: Uint8Array;
    headers: Array<HeaderField>;
    streaming_strategy?: StreamingStrategy;
    status_code: number;
}
export interface Assignment {
    recipient: Principal;
    santa: Principal;
}
export interface Round {
    assignments: Array<Assignment>;
    deadline: Time;
    profiles: Array<[Principal, Profile]>;
}
export interface FileReference {
    hash: string;
    path: string;
}
export interface HttpRequest {
    url: string;
    method: string;
    body: Uint8Array;
    headers: Array<HeaderField>;
}
export interface UserProfile {
    name: string;
}
export enum Stage {
    resolution = "resolution",
    submission = "submission"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createOrUpdateProfile(name: string, wishList: string): Promise<void>;
    deleteParticipant(participant: Principal): Promise<void>;
    deleteParticipantByName(name: string): Promise<void>;
    deletePastRound(timestamp: Time): Promise<void>;
    dropFileReference(path: string): Promise<void>;
    getAllAssignments(): Promise<Array<Assignment>>;
    getAssignmentNames(): Promise<Array<[string, string]>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDeadline(): Promise<Time>;
    getFileReference(path: string): Promise<FileReference>;
    getMyAssignment(): Promise<Profile | null>;
    getPastRounds(): Promise<Array<[Time, Round]>>;
    getProfile(p: Principal): Promise<Profile | null>;
    getStage(): Promise<Stage>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    httpStreamingCallback(token: StreamingToken): Promise<{
        token?: StreamingToken;
        body: Uint8Array;
    }>;
    http_request(request: HttpRequest): Promise<HttpResponse>;
    initializeAccessControl(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    listFileReferences(): Promise<Array<FileReference>>;
    listParticipantNames(): Promise<Array<string>>;
    registerFileReference(path: string, hash: string): Promise<void>;
    resetRound(): Promise<void>;
    rollbackToSubmissionStage(): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setDeadline(newDeadline: Time): Promise<void>;
    triggerResolution(): Promise<void>;
}