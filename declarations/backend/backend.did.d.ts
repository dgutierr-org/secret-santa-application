import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Assignment { 'recipient' : Principal, 'santa' : Principal }
export interface FileReference { 'hash' : string, 'path' : string }
export type HeaderField = [string, string];
export interface HttpRequest {
  'url' : string,
  'method' : string,
  'body' : Uint8Array | number[],
  'headers' : Array<HeaderField>,
}
export interface HttpResponse {
  'body' : Uint8Array | number[],
  'headers' : Array<HeaderField>,
  'streaming_strategy' : [] | [StreamingStrategy],
  'status_code' : number,
}
export interface Profile { 'name' : string, 'wishList' : string }
export interface Round {
  'assignments' : Array<Assignment>,
  'deadline' : Time,
  'profiles' : Array<[Principal, Profile]>,
}
export type StreamingCallback = ActorMethod<
  [StreamingToken],
  StreamingCallbackHttpResponse
>;
export interface StreamingCallbackHttpResponse {
  'token' : [] | [StreamingToken],
  'body' : Uint8Array | number[],
}
export type StreamingStrategy = {
    'Callback' : { 'token' : StreamingToken, 'callback' : [Principal, string] }
  };
export interface StreamingToken { 'resource' : string, 'index' : bigint }
export type Time = bigint;
export interface UserProfile { 'name' : string }
export type UserRole = { 'admin' : null } |
  { 'user' : null } |
  { 'guest' : null };
export interface _SERVICE {
  'assignCallerUserRole' : ActorMethod<[Principal, UserRole], undefined>,
  'createOrUpdateProfile' : ActorMethod<[string, string], undefined>,
  'deletePastRound' : ActorMethod<[Time], undefined>,
  'dropFileReference' : ActorMethod<[string], undefined>,
  'getAllAssignments' : ActorMethod<[], Array<Assignment>>,
  'getAssignmentNames' : ActorMethod<[], Array<[string, string]>>,
  'getCallerUserProfile' : ActorMethod<[], [] | [UserProfile]>,
  'getCallerUserRole' : ActorMethod<[], UserRole>,
  'getDeadline' : ActorMethod<[], Time>,
  'getFileReference' : ActorMethod<[string], FileReference>,
  'getMyAssignment' : ActorMethod<[], [] | [Profile]>,
  'getPastRounds' : ActorMethod<[], Array<[Time, Round]>>,
  'getProfile' : ActorMethod<[Principal], [] | [Profile]>,
  'getUserProfile' : ActorMethod<[Principal], [] | [UserProfile]>,
  'httpStreamingCallback' : ActorMethod<
    [StreamingToken],
    { 'token' : [] | [StreamingToken], 'body' : Uint8Array | number[] }
  >,
  'http_request' : ActorMethod<[HttpRequest], HttpResponse>,
  'initializeAccessControl' : ActorMethod<[], undefined>,
  'isAdmin' : ActorMethod<[Principal], boolean>,
  'isCallerAdmin' : ActorMethod<[], boolean>,
  'listFileReferences' : ActorMethod<[], Array<FileReference>>,
  'listParticipantNames' : ActorMethod<[], Array<string>>,
  'registerFileReference' : ActorMethod<[string, string], undefined>,
  'resetRound' : ActorMethod<[], undefined>,
  'rollbackToSubmissionStage' : ActorMethod<[], undefined>,
  'saveCallerUserProfile' : ActorMethod<[UserProfile], undefined>,
  'setDeadline' : ActorMethod<[Time], undefined>,
  'triggerResolution' : ActorMethod<[], undefined>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
