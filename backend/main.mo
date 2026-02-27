import OrderedMap "mo:base/OrderedMap";
import BlobStorage "blob-storage/Mixin";
import Principal "mo:base/Principal";
import Time "mo:base/Time";
import Array "mo:base/Array";
import Text "mo:base/Text";
import Http "file-storage/http";
import Int "mo:base/Int";
import Iter "mo:base/Iter";
import Registry "blob-storage/registry";
import Debug "mo:base/Debug";
import AccessControl "authorization/access-control";

actor {
    type Profile = {
        name : Text;
        wishList : Text;
        registrationTime : Time.Time;
    };

    type Assignment = {
        santa : Principal;
        recipient : Principal;
    };

    type Round = {
        profiles : [(Principal, Profile)];
        assignments : [Assignment];
        deadline : Time.Time;
    };

    type Stage = {
        #submission;
        #resolution;
    };

    type UserProfile = {
        name : Text;
    };

    transient let principalMap = OrderedMap.Make<Principal>(Principal.compare);
    transient let timeMap = OrderedMap.Make<Int>(Int.compare);

    var profiles = principalMap.empty<Profile>();
    var assignments = principalMap.empty<Principal>();
    var currentStage : Stage = #submission;
    var deadline : Time.Time = 0;
    var pastRounds = timeMap.empty<Round>();
    var userProfiles = principalMap.empty<UserProfile>();
    let registry = Registry.new();

    let accessControlState = AccessControl.initState();

    public shared ({ caller }) func initializeAccessControl() : async () {
        AccessControl.initialize(accessControlState, caller);
    };

    public query ({ caller }) func getCallerUserRole() : async AccessControl.UserRole {
        AccessControl.getUserRole(accessControlState, caller);
    };

    public shared ({ caller }) func assignCallerUserRole(user : Principal, role : AccessControl.UserRole) : async () {
        AccessControl.assignRole(accessControlState, caller, user, role);
    };

    public query ({ caller }) func isCallerAdmin() : async Bool {
        AccessControl.isAdmin(accessControlState, caller);
    };

    // Profile management
    public shared ({ caller }) func createOrUpdateProfile(name : Text, wishList : Text) : async () {
        if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
            Debug.trap("Unauthorized: Only users can create or update profiles");
        };

        // Check if this is an update (profile exists)
        let isUpdate = switch (principalMap.get(profiles, caller)) {
            case (?_) { true };
            case null { false };
        };

        // If updating, only allow during submission stage
        if (isUpdate and currentStage != #submission) {
            Debug.trap("Unauthorized: Profile editing is only allowed during submission stage");
        };

        let registrationTime = switch (principalMap.get(profiles, caller)) {
            case (?existingProfile) { existingProfile.registrationTime };
            case null { Time.now() };
        };
        profiles := principalMap.put(profiles, caller, { name; wishList; registrationTime });
    };

    public query ({ caller }) func getProfile(p : Principal) : async ?Profile {
        switch (principalMap.get(profiles, p)) {
            case null { null };
            case (?profile) {
                // During submission stage, hide wish lists from others
                if (currentStage == #submission and caller != p) {
                    ?{
                        name = profile.name;
                        wishList = "";
                        registrationTime = profile.registrationTime;
                    };
                } else {
                    ?profile;
                };
            };
        };
    };

    public query func listParticipantNames() : async [Text] {
        Array.map<(Principal, Profile), Text>(
            Array.filter<(Principal, Profile)>(
                Iter.toArray(principalMap.entries(profiles)),
                func((_, _)) { true },
            ),
            func((_, profile)) { profile.name },
        );
    };

    // Stage management
    public shared ({ caller }) func setDeadline(newDeadline : Time.Time) : async () {
        if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
            Debug.trap("Unauthorized: Only admins can set the deadline");
        };
        deadline := newDeadline;
    };

    public query func getDeadline() : async Time.Time {
        deadline;
    };

    public query func getStage() : async Stage {
        currentStage;
    };

    public shared ({ caller }) func triggerResolution() : async () {
        if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
            Debug.trap("Unauthorized: Only admins can trigger resolution");
        };

        if (principalMap.size(profiles) < 2) {
            return;
        };

        // Generate assignments
        let profileList = Iter.toArray(principalMap.keys(profiles));
        var shuffledList = Array.thaw<Principal>(profileList);

        // Helper function to check for self-assignments
        func hasSelfAssignment(original : [Principal], shuffled : [Principal]) : Bool {
            var i = 0;
            while (i < original.size()) {
                if (original[i] == shuffled[i]) {
                    return true;
                };
                i += 1;
            };
            false;
        };

        // Shuffle until no self-assignments
        var maxAttempts = 100;
        var attempts = 0;

        while (hasSelfAssignment(profileList, Array.freeze<Principal>(shuffledList)) and attempts < maxAttempts) {
            var i = 0;
            while (i < shuffledList.size()) {
                let j = i + 1;
                if (j < shuffledList.size()) {
                    let temp = shuffledList[i];
                    shuffledList[i] := shuffledList[j];
                    shuffledList[j] := temp;
                };
                i += 1;
            };
            attempts += 1;
        };

        if (hasSelfAssignment(profileList, Array.freeze<Principal>(shuffledList))) {
            return;
        };

        // Create assignments
        var i = 0;
        while (i < profileList.size()) {
            assignments := principalMap.put(assignments, profileList[i], shuffledList[i]);
            i += 1;
        };

        currentStage := #resolution;
    };

    public shared ({ caller }) func resetRound() : async () {
        if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
            Debug.trap("Unauthorized: Only admins can reset the round");
        };

        // Archive current round
        let currentRound : Round = {
            profiles = Iter.toArray(principalMap.entries(profiles));
            assignments = Array.map<(Principal, Principal), Assignment>(
                Iter.toArray(principalMap.entries(assignments)),
                func((santa, recipient)) : Assignment = {
                    santa;
                    recipient;
                },
            );
            deadline;
        };
        pastRounds := timeMap.put(pastRounds, Time.now(), currentRound);

        // Reset state
        profiles := principalMap.empty();
        assignments := principalMap.empty();
        currentStage := #submission;
        deadline := 0;
    };

    public shared ({ caller }) func rollbackToSubmissionStage() : async () {
        if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
            Debug.trap("Unauthorized: Only admins can roll back to submission stage");
        };

        if (currentStage == #resolution) {
            assignments := principalMap.empty();
            currentStage := #submission;
        };
    };

    // Assignment viewing
    public query ({ caller }) func getMyAssignment() : async ?Profile {
        if (currentStage != #resolution) {
            return null;
        };
        switch (principalMap.get(assignments, caller)) {
            case (?recipient) { principalMap.get(profiles, recipient) };
            case null { null };
        };
    };

    public query ({ caller }) func getAllAssignments() : async [Assignment] {
        if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
            Debug.trap("Unauthorized: Only admins can view all assignments");
        };
        Array.map<(Principal, Principal), Assignment>(
            Iter.toArray(principalMap.entries(assignments)),
            func((santa, recipient)) : Assignment = {
                santa;
                recipient;
            },
        );
    };

    public query ({ caller }) func getAssignmentNames() : async [(Text, Text)] {
        if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
            Debug.trap("Unauthorized: Only admins can view all assignments");
        };
        Array.map<(Principal, Principal), (Text, Text)>(
            Iter.toArray(principalMap.entries(assignments)),
            func((santa, recipient)) : (Text, Text) {
                let santaName = switch (principalMap.get(profiles, santa)) {
                    case (?profile) { profile.name };
                    case null { "Unknown" };
                };
                let recipientName = switch (principalMap.get(profiles, recipient)) {
                    case (?profile) { profile.name };
                    case null { "Unknown" };
                };
                (santaName, recipientName);
            },
        );
    };

    // Historical data
    public query func getPastRounds() : async [(Time.Time, Round)] {
        Iter.toArray(timeMap.entries(pastRounds));
    };

    public shared ({ caller }) func deletePastRound(timestamp : Time.Time) : async () {
        if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
            Debug.trap("Unauthorized: Only admins can delete past rounds");
        };
        pastRounds := timeMap.delete(pastRounds, timestamp);
    };

    // File storage
    public shared ({ caller }) func registerFileReference(path : Text, hash : Text) : async () {
        Registry.add(registry, path, hash);
    };

    public query func getFileReference(path : Text) : async Registry.FileReference {
        Registry.get(registry, path);
    };

    public query func listFileReferences() : async [Registry.FileReference] {
        Registry.list(registry);
    };

    public shared ({ caller }) func dropFileReference(path : Text) : async () {
        Registry.remove(registry, path);
    };

    public query func http_request(request : Http.HttpRequest) : async Http.HttpResponse {
        {
            status_code = 404;
            headers = [
                ("Content-Type", "text/html"),
                ("IC-Certificate", "skip"),
            ];
            body = "<h1>404 - Not Found</h1>";
            streaming_strategy = null;
        };
    };

    public query func httpStreamingCallback(token : Http.StreamingToken) : async {
        body : Blob;
        token : ?Http.StreamingToken;
    } {
        {
            body = "";
            token = null;
        };
    };

    // User profile management
    public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
        if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
            Debug.trap("Unauthorized: Only users can save profiles");
        };
        principalMap.get(userProfiles, caller);
    };

    public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
        if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
            Debug.trap("Unauthorized: Only users can save profiles");
        };
        userProfiles := principalMap.put(userProfiles, caller, profile);
    };

    public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
        if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
            Debug.trap("Unauthorized: Can only view your own profile");
        };
        principalMap.get(userProfiles, user);
    };

    // Participant management
    public shared ({ caller }) func deleteParticipant(participant : Principal) : async () {
        if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
            Debug.trap("Unauthorized: Only admins can delete participants");
        };

        if (currentStage != #submission) {
            Debug.trap("Unauthorized: Participants can only be deleted during submission stage");
        };

        // Prevent admin from deleting themselves
        if (caller == participant) {
            Debug.trap("Admin cannot delete themselves");
        };

        // Remove participant from profiles
        profiles := principalMap.delete(profiles, participant);

        // Remove participant from assignments
        assignments := principalMap.delete(assignments, participant);

        // Remove participant from user profiles
        userProfiles := principalMap.delete(userProfiles, participant);

        // Remove participant from all assignments
        assignments := principalMap.mapFilter<Principal, Principal>(
            assignments,
            func(santa, recipient) {
                if (santa == participant or recipient == participant) {
                    null;
                } else {
                    ?recipient;
                };
            },
        );
    };

    // New function to delete participant by name
    public shared ({ caller }) func deleteParticipantByName(name : Text) : async () {
        if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
            Debug.trap("Unauthorized: Only admins can delete participants");
        };

        if (currentStage != #submission) {
            Debug.trap("Unauthorized: Participants can only be deleted during submission stage");
        };

        // Find the participant by name
        let participant = Array.find<(Principal, Profile)>(
            Iter.toArray(principalMap.entries(profiles)),
            func((_, profile)) { profile.name == name },
        );

        switch (participant) {
            case null {
                Debug.trap("Participant not found");
            };
            case (?found) {
                let (principal, _) = found;

                // Prevent admin from deleting themselves
                if (caller == principal) {
                    Debug.trap("Admin cannot delete themselves");
                };

                // Remove participant from profiles
                profiles := principalMap.delete(profiles, principal);

                // Remove participant from assignments
                assignments := principalMap.delete(assignments, principal);

                // Remove participant from user profiles
                userProfiles := principalMap.delete(userProfiles, principal);

                // Remove participant from all assignments
                assignments := principalMap.mapFilter<Principal, Principal>(
                    assignments,
                    func(santa, recipient) {
                        if (santa == principal or recipient == principal) {
                            null;
                        } else {
                            ?recipient;
                        };
                    },
                );
            };
        };
    };

    include BlobStorage(registry);
};

