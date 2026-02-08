import Map "mo:core/Map";
import List "mo:core/List";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Nat64 "mo:core/Nat64";
import Set "mo:core/Set";
import Blob "mo:core/Blob";
import Array "mo:core/Array";
import Int "mo:core/Int";
import Nat "mo:core/Nat";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  public type HealthCheckResponse = {
    status : Text;
    message : Text;
    canisterId : Text;
    timestamp : Int;
  };

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

  public type MedicationRoute = {
    #oral;
    #intravenous_IV;
    #intramuscular_IM;
    #topical;
    #subcutaneous_SubQ;
    #sublingual_SL;
    #rectal;
    #inhalation;
    #nasal;
    #ophthalmic;
    #otic;
    #transdermal;
    #vaginal;
    #injection;
    #other : Text;
  };

  public type MedicationStatus = {
    #active;
    #discontinued;
    #deleted;
  };

  public type Medication = {
    id : Nat;
    medicationName : Text;
    dosage : Text;
    administrationTimes : [Text];
    route : ?MedicationRoute;
    prescribingPhysician : Text;
    status : MedicationStatus;
  };

  public type MedicationUpdate = {
    id : Nat;
    medicationName : Text;
    dosage : Text;
    administrationTimes : [Text];
    route : ?MedicationRoute;
    prescribingPhysician : Text;
    status : MedicationStatus;
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
    bed : ?Text;
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

  public type ResidentUpdateResult = {
    #notFound;
    #updated;
  };

  public type ResidentStatusUpdateResult = {
    #notFound;
    #activated;
    #terminated;
  };

  // Residents Directory DTO
  public type ResidentDirectoryEntry = {
    id : ResidentId;
    name : Text;
    birthDate : Text;
    createdAt : Int;
    active : Bool;
    admissionDate : Text;
    roomNumber : Text;
    roomType : Text;
    bed : ?Text;
  };

  public type DirectoryLoadPerformance = {
    backendQueryTimeNanos : Nat64;
    totalRequestTimeNanos : Nat64;
    residentCount : Nat;
  };

  // Residents Directory DTO
  public type ResidentsDirectoryResponse = {
    residents : [ResidentDirectoryEntry];
    directoryLoadPerformance : DirectoryLoadPerformance;
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let residentsDirectory = Map.empty<ResidentId, Resident>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let vitalsRecords = Map.empty<ResidentId, List.List<VitalsRecord>>();
  let marRecords = Map.empty<ResidentId, List.List<MarRecord>>();
  let adlRecords = Map.empty<ResidentId, List.List<AdlRecord>>();
  let seededUsers = Set.empty<Principal>();

  // Lightweight Health Check Method (Unprotected Query)
  public query func healthCheck() : async HealthCheckResponse {
    {
      status = "ok";
      message = "Caffeine backend is running smoothly. This is the last successful call from your browser. Timestamp is from backend execution, not your device";
      canisterId = "backend017-pbshi";
      timestamp = Time.now();
    };
  };

  private func canAccessResident(caller : Principal, residentId : ResidentId) : Bool {
    if (AccessControl.isAdmin(accessControlState, caller)) {
      return true;
    };

    switch (residentsDirectory.get(residentId)) {
      case (null) { false };
      case (?resident) { resident.owner == caller };
    };
  };

  // Generate unique resident ID based on owner and timestamp
  private func generateResidentId(owner : Principal, seed : Nat) : Principal {
    let ownerBlob = owner.toBlob();
    let timeBlob = Blob.fromArray(Array.tabulate<Nat8>(8, func(i) {
      let shift = (7 - i) * 8;
      Nat8.fromNat((Time.now().toNat() + seed) / (2 ** shift) % 256);
    }));
    let combined = Blob.fromArray(ownerBlob.toArray().concat(timeBlob.toArray()));
    combined.fromBlob();
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

  /// Residents Directory - Lightweight Endpoint for Residents Card Grid (Dashboard)
  public query ({ caller }) func getResidentsDirectory() : async ResidentsDirectoryResponse {
    let requestStartTime = Time.now();

    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access the residents directory");
    };

    let backendQueryStartTime = Time.now();

    let isAdmin = AccessControl.isAdmin(accessControlState, caller);

    let filteredResidents = residentsDirectory.values().toArray().filter(func(resident) { isAdmin or resident.owner == caller });

    let residentEntries = filteredResidents.map(
      func(resident) {
        {
          id = resident.id;
          name = resident.name;
          birthDate = resident.birthDate;
          createdAt = resident.createdAt;
          active = resident.active;
          admissionDate = resident.admissionDate;
          roomNumber = resident.roomNumber;
          roomType = resident.roomType;
          bed = resident.bed;
        };
      }
    );

    let backendQueryDuration = Time.now() - backendQueryStartTime;
    let totalRequestDuration = Time.now() - requestStartTime;

    {
      residents = residentEntries;
      directoryLoadPerformance = {
        backendQueryTimeNanos = Nat64.fromIntWrap(backendQueryDuration);
        totalRequestTimeNanos = Nat64.fromIntWrap(totalRequestDuration);
        residentCount = residentEntries.size();
      };
    };
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

  // Medication Management
  public shared ({ caller }) func updateMedication(residentId : ResidentId, medicationUpdate : MedicationUpdate) : async Medication {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update medication");
    };

    if (not canAccessResident(caller, residentId)) {
      Runtime.trap("Unauthorized: Cannot update medications for this resident");
    };

    switch (residentsDirectory.get(residentId)) {
      case (null) { Runtime.trap("Resident not found") };
      case (?resident) {
        let updatedMedications : [Medication] = resident.medications.map(
          func(m) {
            if (m.id == medicationUpdate.id) {
              {
                m with
                medicationName = medicationUpdate.medicationName;
                dosage = medicationUpdate.dosage;
                administrationTimes = medicationUpdate.administrationTimes;
                route = medicationUpdate.route;
                prescribingPhysician = medicationUpdate.prescribingPhysician;
                status = medicationUpdate.status;
              };
            } else {
              m;
            };
          }
        );

        let updatedResident = {
          resident with
          medications = updatedMedications;
        };

        residentsDirectory.add(residentId, updatedResident);
        switch (updatedMedications.find(func(m) { m.id == medicationUpdate.id })) {
          case (null) { Runtime.trap("Medication not found after update") };
          case (?medication) { medication };
        };
      };
    };
  };

  public shared ({ caller }) func addMedication(residentId : ResidentId, newMedication : Medication) : async Medication {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add medication");
    };

    if (not canAccessResident(caller, residentId)) {
      Runtime.trap("Unauthorized: Cannot add medications for this resident");
    };

    switch (residentsDirectory.get(residentId)) {
      case (null) { Runtime.trap("Resident not found") };
      case (?resident) {
        if (resident.medications.find(func(m) { m.id == newMedication.id }) != null) {
          Runtime.trap("Medication with this ID already exists");
        };

        let updatedMedications = resident.medications.concat([newMedication]);
        let updatedResident = {
          resident with
          medications = updatedMedications;
        };

        residentsDirectory.add(residentId, updatedResident);
        newMedication;
      };
    };
  };

  public shared ({ caller }) func discontinueMedication(residentId : ResidentId, medicationId : Nat) : async Medication {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can discontinue medication");
    };

    if (not canAccessResident(caller, residentId)) {
      Runtime.trap("Unauthorized: Cannot access this resident");
    };

    switch (residentsDirectory.get(residentId)) {
      case (null) { Runtime.trap("Resident not found") };
      case (?resident) {
        let updatedMedications = resident.medications.map(
          func(m) {
            if (m.id == medicationId) {
              { m with status = #discontinued };
            } else {
              m;
            };
          }
        );

        let updatedResident = {
          resident with
          medications = updatedMedications;
        };

        residentsDirectory.add(residentId, updatedResident);
        switch (updatedMedications.find(func(m) { m.id == medicationId })) {
          case (null) { Runtime.trap("Medication not found after update") };
          case (?medication) { medication };
        };
      };
    };
  };

  public shared ({ caller }) func deleteMedication(residentId : ResidentId, medicationId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete medication");
    };

    if (not canAccessResident(caller, residentId)) {
      Runtime.trap("Unauthorized: Cannot access this resident");
    };

    switch (residentsDirectory.get(residentId)) {
      case (null) { Runtime.trap("Resident not found") };
      case (?resident) {
        let updatedMedications = resident.medications.map(
          func(m) {
            if (m.id == medicationId) {
              { m with status = #deleted };
            } else {
              m;
            };
          }
        );

        let updatedResident = {
          resident with
          medications = updatedMedications;
        };

        residentsDirectory.add(residentId, updatedResident);
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
  public query ({ caller }) func isResidentActive(residentId : ResidentId) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check resident status");
    };

    if (not canAccessResident(caller, residentId)) {
      Runtime.trap("Unauthorized: Cannot access this resident");
    };

    switch (residentsDirectory.get(residentId)) {
      case (null) { false };
      case (?resident) { resident.active };
    };
  };

  public shared ({ caller }) func ensureResidentsSeeded() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can seed residents");
    };

    if (seededUsers.contains(caller)) {
      return ();
    };

    func timestamp(dayOffset : Nat) : Int {
      let secondsInDay = 24 * 60 * 60;
      let dayInNanos = secondsInDay * 1000000000;
      Time.now() - Int.fromNat(dayOffset * dayInNanos);
    };

    func createResident(residentId : Principal, name : Text, birthDate : Text, admissionDate : Text, roomNumber : Text, roomType : Text, bed : ?Text) : Resident {
      let physicians : [Physician] = [{
        name = "Dr. Samantha Richards";
        contactNumber = "555-990-4321";
        specialty = "Geriatrics";
      }];

      let pharmacy : PharmacyInfo = {
        name = "Good Health Pharmacy";
        address = "789 Main Street";
        contactNumber = "555-321-7890";
      };

      let insurance : InsuranceInfo = {
        company = "HealthShield";
        policyNumber = "HS54321";
        address = "123 Insurance Lane";
        contactNumber = "555-123-4567";
      };

      let responsiblePersons : [ResponsiblePerson] = [{
        name = "Michael Johnson";
        relationship = "Son";
        contactNumber = "555-234-5678";
        address = "1111 Oak St, Cityname";
      }];

      let medications : [Medication] = [
        {
          id = 1;
          medicationName = "Enalapril";
          dosage = "10mg";
          administrationTimes = ["08:00", "20:00"];
          route = null;
          prescribingPhysician = "Dr. Samantha Richards";
          status = #active;
        },
        {
          id = 2;
          medicationName = "Lasix";
          dosage = "40mg";
          administrationTimes = ["09:00"];
          route = null;
          prescribingPhysician = "Dr. Samantha Richards";
          status = #active;
        },
      ];

      {
        id = residentId;
        name;
        birthDate;
        createdAt = Time.now();
        active = true;
        owner = caller;
        admissionDate;
        roomNumber;
        roomType;
        bed;
        medicaidNumber = "MC123456789";
        medicareNumber = "MD987654321";
        physicians;
        pharmacy;
        insurance;
        responsiblePersons;
        medications;
      };
    };

    func createVitalsEntry(temp : Float, pulse : Nat, bp : Text, oxygen : Nat, daysAgo : Nat) : VitalsRecord {
      {
        timestamp = timestamp(daysAgo);
        temperature = temp;
        pulse;
        bloodPressure = bp;
        bloodOxygen = oxygen;
      };
    };

    func createMARRecord(medicationName : Text, dosage : Text, adminTime : Text, nurseId : Principal, daysAgo : Nat) : MarRecord {
      {
        timestamp = timestamp(daysAgo);
        medicationName;
        dosage;
        administrationTime = adminTime;
        nurseId;
      };
    };

    func createADLRecord(activityType : Text, assistanceLevel : Text, notes : Text, supervisorId : Principal, daysAgo : Nat) : AdlRecord {
      {
        timestamp = timestamp(daysAgo);
        activityType;
        assistanceLevel;
        notes;
        supervisorId;
      };
    };

    // Generate unique IDs for each resident
    let residentId1 = generateResidentId(caller, 1);
    let residentId2 = generateResidentId(caller, 2);
    let residentId3 = generateResidentId(caller, 3);

    let resident1 = createResident(residentId1, "Emily Doe", "1942-06-12", "2021-01-15", "201", "Private", null);
    let resident2 = createResident(residentId2, "John Smith", "1938-03-22", "2022-03-10", "301", "Shared", ?("A"));
    let resident3 = createResident(residentId3, "Betty White", "1944-09-18", "2020-09-10", "301", "Shared", ?("B"));

    let residents = [resident1, resident2, resident3];

    for (resident in residents.values()) {
      residentsDirectory.add(resident.id, resident);

      let vitalsList = List.empty<VitalsRecord>();
      for (i in Array.tabulate<Nat>(6, func(i) { i }).values()) {
        vitalsList.add(
          createVitalsEntry(
            36.5 + (i.toFloat() * 0.2),
            65,
            "115/75",
            98,
            i,
          )
        );
      };
      vitalsRecords.add(resident.id, vitalsList);

      let marList = List.empty<MarRecord>();
      for (i in Array.tabulate<Nat>(4, func(i) { i }).values()) {
        marList.add(
          createMARRecord(
            resident.medications[if (i % 2 == 0) { 0 } else { 1 }].medicationName,
            resident.medications[if (i % 2 == 0) { 0 } else { 1 }].dosage,
            resident.medications[if (i % 2 == 0) { 0 } else { 1 }].administrationTimes[0],
            caller,
            i,
          )
        );
      };
      marRecords.add(resident.id, marList);

      let adlList = List.empty<AdlRecord>();
      for (i in Array.tabulate<Nat>(5, func(i) { i }).values()) {
        adlList.add(
          createADLRecord(
            if (i % 2 == 0) { "Toileting" } else { "Feeding" },
            if (i % 2 == 0) { "Moderate" } else { "Extensive" },
            "Routine check",
            caller,
            i,
          )
        );
      };
      adlRecords.add(resident.id, adlList);
    };

    seededUsers.add(caller);
  };
};
