import Map "mo:core/Map";
import List "mo:core/List";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    name : Text;
  };

  public type VitalsRecord = {
    timestamp : Int;
    temperature : Float;
    pulse : Nat;
    bloodPressure : Text;
    bloodOxygen : Nat;
  };

  type ResidentId = Principal;

  let userProfiles = Map.empty<Principal, UserProfile>();
  let residents = Map.empty<ResidentId, List.List<VitalsRecord>>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func createVitalsEntry(record : VitalsRecord) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create vitals entries");
    };

    let currentVitals = switch (residents.get(caller)) {
      case (null) { List.empty<VitalsRecord>() };
      case (?vitals) { vitals };
    };

    let updatedVitals = List.empty<VitalsRecord>();
    residents.add(caller, updatedVitals);
  };

  public query ({ caller }) func listVitalsEntries() : async [VitalsRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view vitals entries");
    };

    switch (residents.get(caller)) {
      case (null) { [] };
      case (?vitals) {
        vitals.toArray();
      };
    };
  };

  public shared ({ caller }) func deleteVitalsEntry(timestamp : Int) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete vitals entries");
    };

    switch (residents.get(caller)) {
      case (null) {
        Runtime.trap("No vitals record found for caller");
      };
      case (?vitals) {
        let filteredVitals = vitals.filter(
          func(record : VitalsRecord) : Bool { record.timestamp != timestamp },
        );
        residents.add(caller, filteredVitals);
      };
    };
  };
};

