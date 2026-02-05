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

  public type MarRecord = {
    timestamp : Int;
    medicationName : Text;
    dosage : Text;
    administrationTime : Text;
    nurseId : Principal;
  };

  public type AdlRecord = {
    timestamp : Int;
    activityType : Text;
    assistanceLevel : Text;
    notes : Text;
    supervisorId : Principal;
  };

  type ResidentId = Principal;

  let userProfiles = Map.empty<Principal, UserProfile>();
  let residents = Map.empty<ResidentId, List.List<VitalsRecord>>();
  let marRecords = Map.empty<ResidentId, List.List<MarRecord>>();
  let adlRecords = Map.empty<ResidentId, List.List<AdlRecord>>();

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

  public shared ({ caller }) func createVitalsEntry(residentId : ResidentId, record : VitalsRecord) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create vitals entries");
    };

    // Authorization: Users can only create vitals for themselves, admins can create for anyone
    if (caller != residentId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only create vitals entries for yourself or as admin");
    };

    let currentVitals = switch (residents.get(residentId)) {
      case (null) { List.empty<VitalsRecord>() };
      case (?vitals) { vitals };
    };

    let updatedVitals = currentVitals.clone();
    updatedVitals.add(record);

    residents.add(residentId, updatedVitals);
  };

  public query ({ caller }) func listVitalsEntries(residentId : ResidentId) : async [VitalsRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view vitals entries");
    };

    // Authorization: Users can only view their own vitals, admins can view anyone's
    if (caller != residentId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own vitals entries or as admin");
    };

    switch (residents.get(residentId)) {
      case (null) { [] };
      case (?vitals) {
        vitals.toArray();
      };
    };
  };

  public shared ({ caller }) func deleteVitalsEntry(residentId : ResidentId, timestamp : Int) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete vitals entries");
    };

    // Authorization: Users can only delete their own vitals, admins can delete anyone's
    if (caller != residentId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only delete your own vitals entries or as admin");
    };

    switch (residents.get(residentId)) {
      case (null) {
        Runtime.trap("No vitals record found for resident");
      };
      case (?vitals) {
        let filteredVitals = vitals.filter(
          func(record : VitalsRecord) : Bool { record.timestamp != timestamp },
        );
        residents.add(residentId, filteredVitals);
      };
    };
  };

  public shared ({ caller }) func createMarRecord(residentId : ResidentId, record : MarRecord) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create MAR records");
    };

    // Authorization: Users can only create MAR records for themselves, admins can create for anyone
    if (caller != residentId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only create MAR records for yourself or as admin");
    };

    let currentRecords = switch (marRecords.get(residentId)) {
      case (null) { List.empty<MarRecord>() };
      case (?records) { records };
    };

    let updatedRecords = currentRecords.clone();
    updatedRecords.add(record);

    marRecords.add(residentId, updatedRecords);
  };

  public query ({ caller }) func listMarRecords(residentId : ResidentId) : async [MarRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view MAR records");
    };

    // Authorization: Users can only view their own MAR records, admins can view anyone's
    if (caller != residentId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own MAR records or as admin");
    };

    switch (marRecords.get(residentId)) {
      case (null) { [] };
      case (?records) {
        records.toArray();
      };
    };
  };

  public shared ({ caller }) func deleteMarRecord(residentId : ResidentId, timestamp : Int) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete MAR records");
    };

    // Authorization: Users can only delete their own MAR records, admins can delete anyone's
    if (caller != residentId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only delete your own MAR records or as admin");
    };

    let records = switch (marRecords.get(residentId)) {
      case (null) {
        return Runtime.trap("No MAR records found for resident");
      };
      case (?records) {
        let filteredRecords = records.filter(
          func(record : MarRecord) : Bool { record.timestamp != timestamp },
        );
        marRecords.add(residentId, filteredRecords);
        filteredRecords;
      };
    };

    if (records.size() == 0) {
      marRecords.remove(residentId);
    };
  };

  public shared ({ caller }) func createResidentProfile(residentId : ResidentId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create resident profiles");
    };

    // Authorization: Users can only create their own profile, admins can create for anyone
    if (caller != residentId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only create your own profile or as admin");
    };

    if (residents.containsKey(residentId)) {
      Runtime.trap("Resident profile already exists");
    };

    residents.add(residentId, List.empty<VitalsRecord>());
  };

  // ADL Record Management

  public shared ({ caller }) func createAdlRecord(residentId : ResidentId, record : AdlRecord) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create ADL records");
    };

    // Authorization: Users can only create ADL records for themselves, admins can create for anyone
    if (caller != residentId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only create ADL records for yourself or as admin");
    };

    let currentRecords = switch (adlRecords.get(residentId)) {
      case (null) { List.empty<AdlRecord>() };
      case (?records) { records };
    };

    let updatedRecords = currentRecords.clone();
    updatedRecords.add(record);

    adlRecords.add(residentId, updatedRecords);
  };

  public query ({ caller }) func listAdlRecords(residentId : ResidentId) : async [AdlRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view ADL records");
    };

    // Authorization: Users can only view their own ADL records, admins can view anyone's
    if (caller != residentId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own ADL records or as admin");
    };

    switch (adlRecords.get(residentId)) {
      case (null) { [] };
      case (?records) {
        records.toArray();
      };
    };
  };

  public shared ({ caller }) func deleteAdlRecord(residentId : ResidentId, timestamp : Int) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete ADL records");
    };

    // Authorization: Users can only delete their own ADL records, admins can delete anyone's
    if (caller != residentId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only delete your own ADL records or as admin");
    };

    let records = switch (adlRecords.get(residentId)) {
      case (null) {
        return Runtime.trap("No ADL records found for resident");
      };
      case (?records) {
        let filteredRecords = records.filter(
          func(record : AdlRecord) : Bool { record.timestamp != timestamp },
        );
        adlRecords.add(residentId, filteredRecords);
        filteredRecords;
      };
    };

    if (records.size() == 0) {
      adlRecords.remove(residentId);
    };
  };
};
