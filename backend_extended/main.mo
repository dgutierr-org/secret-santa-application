import Cycles "mo:base/ExperimentalCycles";
import Nat "mo:base/Nat";
import OrderedMap "mo:base/OrderedMap";
import Principal "mo:base/Principal";
import Time "mo:base/Time";
import Array "mo:base/Array";
import Text "mo:base/Text";
import FileStorage "file-storage/file-storage";
import Http "file-storage/http";
import Int "mo:base/Int";
import Iter "mo:base/Iter";
import Random "mo:base/Random";
import Debug "mo:base/Debug";

import Registry "blob-storage/registry";

actor Main {
    
    type Profile = {
        name : Text;
        photoPath : ?Text;
        wishList : Text;
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

    
    transient let principalMap = OrderedMap.Make<Principal>(Principal.compare);
    transient let timeMap = OrderedMap.Make<Int>(Int.compare);

    var profiles = principalMap.empty<Profile>();
    var assignments = principalMap.empty<Principal>();
    var currentStage : Stage = #submission;
    var deadline : Time.Time = 0;
    var pastRounds = timeMap.empty<Round>();
    var storage = FileStorage.new();
    let registry = Registry.new();

    
    public shared ({ caller }) func createOrUpdateProfile(name : Text, photoPath : ?Text, wishList : Text) : async () {
        profiles := principalMap.put(profiles, caller, { name; photoPath; wishList });
    };

    public query func getProfile(p : Principal) : async ?Profile {
        principalMap.get(profiles, p);
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

    
    public query func getParticipantPhotos() : async [(Text, ?Text)] {
        Array.map<(Principal, Profile), (Text, ?Text)>(
            Array.filter<(Principal, Profile)>(
                Iter.toArray(principalMap.entries(profiles)),
                func((_, _)) { true },
            ),
            func((_, profile)) { (profile.name, profile.photoPath) },
        );
    };

    
    public query ({ caller }) func getMyPhotoPath() : async Text {
        switch (principalMap.get(profiles, caller)) {
            case (?profile) {
                switch (profile.photoPath) {
                    case (?path) path;
                    case null Debug.trap("No photo path found for user");
                };
            };
            case null Debug.trap("User profile not found");
        };
    };

    
    public shared func setDeadline(newDeadline : Time.Time) : async () {
        deadline := newDeadline;
    };

    public query func getDeadline() : async Time.Time {
        deadline;
    };

    public shared func triggerResolution() : async () {
        if (principalMap.size(profiles) < 2) {
            return;
        };

        
        let profileList = Iter.toArray(principalMap.keys(profiles));
        var shuffledList = Array.thaw<Principal>(profileList);

        
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

        
        var seed = await Random.blob();
        var maxAttempts = 100;
        var attempts = 0;

        while (hasSelfAssignment(profileList, Array.freeze<Principal>(shuffledList)) and attempts < maxAttempts) {
            var i = 0;
            while (i < shuffledList.size()) {
                let j = Random.rangeFrom(0, seed) % shuffledList.size();
                let temp = shuffledList[i];
                shuffledList[i] := shuffledList[j];
                shuffledList[j] := temp;
                i += 1;
            };
            attempts += 1;
        };

        if (hasSelfAssignment(profileList, Array.freeze<Principal>(shuffledList))) {
            return;
        };

        
        var i = 0;
        while (i < profileList.size()) {
            assignments := principalMap.put(assignments, profileList[i], shuffledList[i]);
            i += 1;
        };

        currentStage := #resolution;
    };

    public shared func resetRound() : async () {
        
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

        
        profiles := principalMap.empty();
        assignments := principalMap.empty();
        currentStage := #submission;
        deadline := 0;
    };

    
    public query ({ caller }) func getMyAssignment() : async ?Profile {
        if (currentStage != #resolution) {
            return null;
        };
        switch (principalMap.get(assignments, caller)) {
            case (?recipient) { principalMap.get(profiles, recipient) };
            case null { null };
        };
    };

    public query func getAllAssignments() : async [Assignment] {
        Array.map<(Principal, Principal), Assignment>(
            Iter.toArray(principalMap.entries(assignments)),
            func((santa, recipient)) : Assignment = {
                santa;
                recipient;
            },
        );
    };

    public query func getAssignmentNames() : async [(Text, Text)] {
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

    
    public query func getPastRounds() : async [(Time.Time, Round)] {
        Iter.toArray(timeMap.entries(pastRounds));
    };

    public shared func deletePastRound(timestamp : Time.Time) : async () {
        pastRounds := timeMap.delete(pastRounds, timestamp);
    };

    
    public query func fileList() : async [FileStorage.FileMetadata] {
        FileStorage.list(storage);
    };

    public func fileUpload(path : Text, mimeType : Text, chunk : Blob, complete : Bool) : async () {
        FileStorage.upload(storage, path, mimeType, chunk, complete);
    };

    public func fileDelete(path : Text) : async () {
        FileStorage.delete(storage, path);
    };

    public query func http_request(request : Http.HttpRequest) : async Http.HttpResponse {
        FileStorage.fileRequest(storage, request, httpStreamingCallback);
    };

    public query func httpStreamingCallback(token : Http.StreamingToken) : async Http.StreamingCallbackHttpResponse {
        FileStorage.httpStreamingCallback(storage, token);
    };

    
    public shared func registerFileReference(path : Text, hash : Text) : async () {
        Registry.add(registry, path, hash);
    };

    public query func getFileReference(path : Text) : async Registry.FileReference {
        Registry.get(registry, path);
    };

    public query func listFileReferences() : async [Registry.FileReference] {
        Registry.list(registry);
    };

    public shared func dropFileReference(path : Text) : async () {
        Registry.remove(registry, path);
    };

type __CAFFEINE_STORAGE_RefillInformation = {
    proposed_top_up_amount: ?Nat;
};

type __CAFFEINE_STORAGE_RefillResult = {
    success: ?Bool;
    topped_up_amount: ?Nat;
};

    public shared (msg) func __CAFFEINE_STORAGE_refillCashier(refill_information: ?__CAFFEINE_STORAGE_RefillInformation) : async __CAFFEINE_STORAGE_RefillResult {
    let cashier = Principal.fromText("72ch2-fiaaa-aaaar-qbsvq-cai");
    
    assert (cashier == msg.caller);
    
    let current_balance = Cycles.balance();
    let reserved_cycles : Nat = 400_000_000_000;
    
    let current_free_cycles_count : Nat = Nat.sub(current_balance, reserved_cycles);
    
    let cycles_to_send : Nat = switch (refill_information) {
        case null { current_free_cycles_count };
        case (?info) {
            switch (info.proposed_top_up_amount) {
                case null { current_free_cycles_count };
                case (?proposed) { Nat.min(proposed, current_free_cycles_count) };
            }
        };
    };

    let target_canister = actor(Principal.toText(cashier)) : actor {
        account_top_up_v1 : ({ account : Principal }) -> async ();
    };
    
    let current_principal = Principal.fromActor(Main);
    
    await (with cycles = cycles_to_send) target_canister.account_top_up_v1({ account = current_principal });
    
    return {
        success = ?true;
        topped_up_amount = ?cycles_to_send;
    };
};
    public shared (msg) func __CAFFEINE_STORAGE_blobsToRemove() : async [Text] {
    await Registry.requireAuthorized(registry, msg.caller, "72ch2-fiaaa-aaaar-qbsvq-cai");
    
    Registry.getBlobsToRemove(registry);
};
    public shared (msg) func __CAFFEINE_STORAGE_blobsRemoved(hashes : [Text]) : async Nat {
    await Registry.requireAuthorized(registry, msg.caller, "72ch2-fiaaa-aaaar-qbsvq-cai");
    
    Registry.clearBlobsRemoved(registry, hashes);
};
    public shared (msg) func __CAFFEINE_STORAGE_updateGatewayPrincipals() : async () {
    await Registry.requireAuthorized(registry, msg.caller, "72ch2-fiaaa-aaaar-qbsvq-cai");
    await Registry.updateGatewayPrincipals(registry, "72ch2-fiaaa-aaaar-qbsvq-cai");
};
};

