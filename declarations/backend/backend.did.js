export const idlFactory = ({ IDL }) => {
  const UserRole = IDL.Variant({
    'admin' : IDL.Null,
    'user' : IDL.Null,
    'guest' : IDL.Null,
  });
  const Time = IDL.Int;
  const Assignment = IDL.Record({
    'recipient' : IDL.Principal,
    'santa' : IDL.Principal,
  });
  const UserProfile = IDL.Record({ 'name' : IDL.Text });
  const FileReference = IDL.Record({ 'hash' : IDL.Text, 'path' : IDL.Text });
  const Profile = IDL.Record({ 'name' : IDL.Text, 'wishList' : IDL.Text });
  const Round = IDL.Record({
    'assignments' : IDL.Vec(Assignment),
    'deadline' : Time,
    'profiles' : IDL.Vec(IDL.Tuple(IDL.Principal, Profile)),
  });
  const StreamingToken = IDL.Record({
    'resource' : IDL.Text,
    'index' : IDL.Nat,
  });
  const HeaderField = IDL.Tuple(IDL.Text, IDL.Text);
  const HttpRequest = IDL.Record({
    'url' : IDL.Text,
    'method' : IDL.Text,
    'body' : IDL.Vec(IDL.Nat8),
    'headers' : IDL.Vec(HeaderField),
  });
  const StreamingCallbackHttpResponse = IDL.Record({
    'token' : IDL.Opt(StreamingToken),
    'body' : IDL.Vec(IDL.Nat8),
  });
  const StreamingCallback = IDL.Func(
      [StreamingToken],
      [StreamingCallbackHttpResponse],
      ['query'],
    );
  const StreamingStrategy = IDL.Variant({
    'Callback' : IDL.Record({
      'token' : StreamingToken,
      'callback' : StreamingCallback,
    }),
  });
  const HttpResponse = IDL.Record({
    'body' : IDL.Vec(IDL.Nat8),
    'headers' : IDL.Vec(HeaderField),
    'streaming_strategy' : IDL.Opt(StreamingStrategy),
    'status_code' : IDL.Nat16,
  });
  return IDL.Service({
    'assignCallerUserRole' : IDL.Func([IDL.Principal, UserRole], [], []),
    'createOrUpdateProfile' : IDL.Func([IDL.Text, IDL.Text], [], []),
    'deletePastRound' : IDL.Func([Time], [], []),
    'dropFileReference' : IDL.Func([IDL.Text], [], []),
    'getAllAssignments' : IDL.Func([], [IDL.Vec(Assignment)], ['query']),
    'getAssignmentNames' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text))],
        ['query'],
      ),
    'getCallerUserProfile' : IDL.Func([], [IDL.Opt(UserProfile)], ['query']),
    'getCallerUserRole' : IDL.Func([], [UserRole], ['query']),
    'getDeadline' : IDL.Func([], [Time], ['query']),
    'getFileReference' : IDL.Func([IDL.Text], [FileReference], ['query']),
    'getMyAssignment' : IDL.Func([], [IDL.Opt(Profile)], ['query']),
    'getPastRounds' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(Time, Round))],
        ['query'],
      ),
    'getProfile' : IDL.Func([IDL.Principal], [IDL.Opt(Profile)], ['query']),
    'getUserProfile' : IDL.Func(
        [IDL.Principal],
        [IDL.Opt(UserProfile)],
        ['query'],
      ),
    'httpStreamingCallback' : IDL.Func(
        [StreamingToken],
        [
          IDL.Record({
            'token' : IDL.Opt(StreamingToken),
            'body' : IDL.Vec(IDL.Nat8),
          }),
        ],
        ['query'],
      ),
    'http_request' : IDL.Func([HttpRequest], [HttpResponse], ['query']),
    'initializeAccessControl' : IDL.Func([], [], []),
    'isAdmin' : IDL.Func([IDL.Principal], [IDL.Bool], []),
    'isCallerAdmin' : IDL.Func([], [IDL.Bool], ['query']),
    'listFileReferences' : IDL.Func([], [IDL.Vec(FileReference)], ['query']),
    'listParticipantNames' : IDL.Func([], [IDL.Vec(IDL.Text)], ['query']),
    'registerFileReference' : IDL.Func([IDL.Text, IDL.Text], [], []),
    'resetRound' : IDL.Func([], [], []),
    'rollbackToSubmissionStage' : IDL.Func([], [], []),
    'saveCallerUserProfile' : IDL.Func([UserProfile], [], []),
    'setDeadline' : IDL.Func([Time], [], []),
    'triggerResolution' : IDL.Func([], [], []),
  });
};
export const init = ({ IDL }) => { return []; };
