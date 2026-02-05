import Map "mo:core/Map";
import List "mo:core/List";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import Time "mo:core/Time";


import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

// Specify the data migration function in with-clause

actor {
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

  public type Physician = {
    name : Text;
    contactNumber : Text;
    specialty : Text;
  };

  public type PharmacyInfo = {
    name : Text;
    address : Text;
    contactNumber : Text;
  };

  public type InsuranceInfo = {
    company : Text;
    policyNumber : Text;
    address : Text;
    contactNumber : Text;
  };

  public type ResponsiblePerson = {
    name : Text;
    relationship : Text;
    contactNumber : Text;
    address : Text;
  };

  public type Medication = {
    medicationName : Text;
    dosage : Text;
    administrationTimes : [Text];
    prescribingPhysician : Text;
  };

  public type ResidentId = Principal;

  public type Resident = {
    id : ResidentId;
    name : Text;
    birthDate : Text;
    createdAt : Int;
    active : Bool;
    owner : Principal;
    admissionDate : Text;
    roomNumber : Text;
    roomType : Text;
    bed : ?Text; // Optional "A" or "B" for shared rooms
    medicaidNumber : Text;
    medicareNumber : Text;
    physicians : [Physician];
    pharmacy : PharmacyInfo;
    insurance : InsuranceInfo;
    responsiblePersons : [ResponsiblePerson];
    medications : [Medication];
  };

  public type ResidentCreateRequest = {
    id : ResidentId;
    name : Text;
    birthDate : Text;
    admissionDate : Text;
    roomNumber : Text;
    roomType : Text;
    bed : ?Text;
    medicaidNumber : Text;
    medicareNumber : Text;
    physicians : [Physician];
    pharmacy : PharmacyInfo;
    insurance : InsuranceInfo;
    responsiblePersons : [ResponsiblePerson];
    medications : [Medication];
  };

  public type ResidentUpdateRequest = {
    name : Text;
    birthDate : Text;
    admissionDate : Text;
    roomNumber : Text;
    roomType : Text;
    bed : ?Text;
    medicaidNumber : Text;
    medicareNumber : Text;
    physicians : [Physician];
    pharmacy : PharmacyInfo;
    insurance : InsuranceInfo;
    responsiblePersons : [ResponsiblePerson];
    medications : [Medication];
  };

  public type ResidentStatus = {
    #active;
    #terminated;
    #unknown;
  };

  public type ResidentUpdateResult = {
    #notFound;
    #updated;
  };

  public type ResidentStatusUpdateResult = {
    #notFound;
    #activated;
    #terminated;
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let residentsDirectory = Map.empty<ResidentId, Resident>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let vitalsRecords = Map.empty<ResidentId, List.List<VitalsRecord>>();
  let marRecords = Map.empty<ResidentId, List.List<MarRecord>>();
  let adlRecords = Map.empty<ResidentId, List.List<AdlRecord>>();

  private func canAccessResident(caller : Principal, residentId : ResidentId) : Bool {
    if (AccessControl.isAdmin(accessControlState, caller)) {
      return true;
    };

    switch (residentsDirectory.get(residentId)) {
      case (null) { false };
      case (?resident) { resident.owner == caller };
    };
  };

  //-----------------------------------
  // Resident Management (Directory)
  //-----------------------------------

  public shared ({ caller }) func createResident(request : ResidentCreateRequest) : async Resident {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create residents");
    };

    switch (residentsDirectory.get(request.id)) {
      case (?_) { Runtime.trap("Resident already exists") };
      case (null) {
        let resident : Resident = {
          id = request.id;
          name = request.name;
          birthDate = request.birthDate;
          createdAt = Time.now();
          active = true;
          owner = caller;
          admissionDate = request.admissionDate;
          roomNumber = request.roomNumber;
          roomType = request.roomType;
          bed = request.bed;
          medicaidNumber = request.medicaidNumber;
          medicareNumber = request.medicareNumber;
          physicians = request.physicians;
          pharmacy = request.pharmacy;
          insurance = request.insurance;
          responsiblePersons = request.responsiblePersons;
          medications = request.medications;
        };
        residentsDirectory.add(request.id, resident);
        resident;
      };
    };
  };

  public query ({ caller }) func listActiveResidents() : async [Resident] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list residents");
    };

    let isAdmin = AccessControl.isAdmin(accessControlState, caller);

    residentsDirectory.values().toArray().filter(func(resident) { resident.active and (isAdmin or resident.owner == caller) });
  };

  public query ({ caller }) func getResident(id : ResidentId) : async ?Resident {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view residents");
    };

    if (not canAccessResident(caller, id)) {
      Runtime.trap("Unauthorized: Cannot access this resident");
    };

    residentsDirectory.get(id);
  };

  public shared ({ caller }) func updateResident(id : ResidentId, updateRequest : ResidentUpdateRequest) : async ResidentUpdateResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update residents");
    };

    if (not canAccessResident(caller, id)) {
      Runtime.trap("Unauthorized: Cannot update this resident");
    };

    switch (residentsDirectory.get(id)) {
      case (null) { #notFound };
      case (?existing) {
        let updatedResident : Resident = {
          id = existing.id;
          name = updateRequest.name;
          birthDate = updateRequest.birthDate;
          createdAt = existing.createdAt;
          active = existing.active;
          owner = existing.owner;
          admissionDate = updateRequest.admissionDate;
          roomNumber = updateRequest.roomNumber;
          roomType = updateRequest.roomType;
          bed = updateRequest.bed;
          medicaidNumber = updateRequest.medicaidNumber;
          medicareNumber = updateRequest.medicareNumber;
          physicians = updateRequest.physicians;
          pharmacy = updateRequest.pharmacy;
          insurance = updateRequest.insurance;
          responsiblePersons = updateRequest.responsiblePersons;
          medications = updateRequest.medications;
        };
        residentsDirectory.add(id, updatedResident);
        #updated;
      };
    };
  };

  public shared ({ caller }) func toggleResidentStatus(id : ResidentId) : async ResidentStatusUpdateResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can toggle resident status");
    };

    if (not canAccessResident(caller, id)) {
      Runtime.trap("Unauthorized: Cannot modify this resident");
    };

    switch (residentsDirectory.get(id)) {
      case (null) { #notFound };
      case (?resident) {
        let updatedResident : Resident = {
          resident with active = not resident.active;
        };
        residentsDirectory.add(id, updatedResident);
        if (updatedResident.active) { #activated } else { #terminated };
      };
    };
  };

  public shared ({ caller }) func deleteResident(id : ResidentId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete residents");
    };

    if (not canAccessResident(caller, id)) {
      Runtime.trap("Unauthorized: Cannot delete this resident");
    };

    residentsDirectory.remove(id);
    vitalsRecords.remove(id);
    marRecords.remove(id);
    adlRecords.remove(id);
  };

  // Vitals Management Functions
  public shared ({ caller }) func createVitalsEntry(residentId : ResidentId, record : VitalsRecord) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create vitals entries");
    };

    if (not canAccessResident(caller, residentId)) {
      Runtime.trap("Unauthorized: Cannot add vitals for this resident");
    };

    switch (residentsDirectory.get(residentId)) {
      case (null) { Runtime.trap("Resident does not exist") };
      case (?resident) {
        if (not resident.active) {
          Runtime.trap("Cannot add records to inactive resident");
        };

        let currentVitals = switch (vitalsRecords.get(residentId)) {
          case (null) { List.empty<VitalsRecord>() };
          case (?vitals) { vitals };
        };

        let updatedVitals = currentVitals.clone();
        updatedVitals.add(record);

        vitalsRecords.add(residentId, updatedVitals);
      };
    };
  };

  public query ({ caller }) func listVitalsEntries(residentId : ResidentId) : async [VitalsRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list vitals entries");
    };

    if (not canAccessResident(caller, residentId)) {
      Runtime.trap("Unauthorized: Cannot view vitals for this resident");
    };

    switch (residentsDirectory.get(residentId)) {
      case (null) { Runtime.trap("Resident does not exist") };
      case (?_) {
        switch (vitalsRecords.get(residentId)) {
          case (null) { [] };
          case (?vitals) { vitals.toArray() };
        };
      };
    };
  };

  public shared ({ caller }) func deleteVitalsEntry(residentId : ResidentId, timestamp : Int) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete vitals entries");
    };

    if (not canAccessResident(caller, residentId)) {
      Runtime.trap("Unauthorized: Cannot delete vitals for this resident");
    };

    switch (residentsDirectory.get(residentId)) {
      case (null) { Runtime.trap("Resident does not exist") };
      case (_) {
        switch (vitalsRecords.get(residentId)) {
          case (null) { Runtime.trap("No vitals record found for resident") };
          case (?vitals) {
            let filteredVitals = vitals.filter(
              func(record : VitalsRecord) : Bool { record.timestamp != timestamp },
            );
            vitalsRecords.add(residentId, filteredVitals);
          };
        };
      };
    };
  };

  // MAR Record Management
  public shared ({ caller }) func createMarRecord(residentId : ResidentId, record : MarRecord) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create MAR records");
    };

    if (not canAccessResident(caller, residentId)) {
      Runtime.trap("Unauthorized: Cannot add MAR records for this resident");
    };

    switch (residentsDirectory.get(residentId)) {
      case (null) { Runtime.trap("Resident does not exist") };
      case (?resident) {
        if (not resident.active) {
          Runtime.trap("Cannot add records to inactive resident");
        };

        let currentRecords = switch (marRecords.get(residentId)) {
          case (null) { List.empty<MarRecord>() };
          case (?records) { records };
        };

        let updatedRecords = currentRecords.clone();
        updatedRecords.add(record);

        marRecords.add(residentId, updatedRecords);
      };
    };
  };

  public query ({ caller }) func listMarRecords(residentId : ResidentId) : async [MarRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list MAR records");
    };

    if (not canAccessResident(caller, residentId)) {
      Runtime.trap("Unauthorized: Cannot view MAR records for this resident");
    };

    switch (residentsDirectory.get(residentId)) {
      case (null) { Runtime.trap("Resident does not exist") };
      case (_) {
        switch (marRecords.get(residentId)) {
          case (null) { [] };
          case (?records) { records.toArray() };
        };
      };
    };
  };

  public shared ({ caller }) func deleteMarRecord(residentId : ResidentId, timestamp : Int) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete MAR records");
    };

    if (not canAccessResident(caller, residentId)) {
      Runtime.trap("Unauthorized: Cannot delete MAR records for this resident");
    };

    switch (residentsDirectory.get(residentId)) {
      case (null) { Runtime.trap("Resident does not exist") };
      case (_) {
        switch (marRecords.get(residentId)) {
          case (null) { Runtime.trap("No MAR records found for resident") };
          case (?records) {
            let filteredRecords = records.filter(
              func(record : MarRecord) : Bool { record.timestamp != timestamp },
            );
            marRecords.add(residentId, filteredRecords);
          };
        };
      };
    };
  };

  // ADL Record Management
  public shared ({ caller }) func createAdlRecord(residentId : ResidentId, record : AdlRecord) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create ADL records");
    };

    if (not canAccessResident(caller, residentId)) {
      Runtime.trap("Unauthorized: Cannot add ADL records for this resident");
    };

    switch (residentsDirectory.get(residentId)) {
      case (null) { Runtime.trap("Resident does not exist") };
      case (?resident) {
        if (not resident.active) {
          Runtime.trap("Cannot add records to inactive resident");
        };

        let currentRecords = switch (adlRecords.get(residentId)) {
          case (null) { List.empty<AdlRecord>() };
          case (?records) { records };
        };

        let updatedRecords = currentRecords.clone();
        updatedRecords.add(record);

        adlRecords.add(residentId, updatedRecords);
      };
    };
  };

  public query ({ caller }) func listAdlRecords(residentId : ResidentId) : async [AdlRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list ADL records");
    };

    if (not canAccessResident(caller, residentId)) {
      Runtime.trap("Unauthorized: Cannot view ADL records for this resident");
    };

    switch (residentsDirectory.get(residentId)) {
      case (null) { Runtime.trap("Resident does not exist") };
      case (_) {
        switch (adlRecords.get(residentId)) {
          case (null) { [] };
          case (?records) { records.toArray() };
        };
      };
    };
  };

  public shared ({ caller }) func deleteAdlRecord(residentId : ResidentId, timestamp : Int) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete ADL records");
    };

    if (not canAccessResident(caller, residentId)) {
      Runtime.trap("Unauthorized: Cannot delete ADL records for this resident");
    };

    switch (residentsDirectory.get(residentId)) {
      case (null) { Runtime.trap("Resident does not exist") };
      case (_) {
        switch (adlRecords.get(residentId)) {
          case (null) { Runtime.trap("No ADL records found for resident") };
          case (?records) {
            let filteredRecords = records.filter(
              func(record : AdlRecord) : Bool { record.timestamp != timestamp },
            );
            adlRecords.add(residentId, filteredRecords);
          };
        };
      };
    };
  };

  // User Profile Support
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
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

  // Helper Functions
  public func isResidentActive(residentId : ResidentId) : async Bool {
    switch (residentsDirectory.get(residentId)) {
      case (null) { false };
      case (?resident) { resident.active };
    };
  };
};
