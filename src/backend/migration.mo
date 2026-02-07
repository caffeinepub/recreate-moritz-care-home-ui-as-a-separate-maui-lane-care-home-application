import Map "mo:core/Map";
import List "mo:core/List";
import Set "mo:core/Set";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Int "mo:core/Int";
import Nat "mo:core/Nat";

module {
  type MedicationStatus = {
    #active;
    #discontinued;
    #deleted;
  };

  type MedicationRoute = {
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

  type OldMedication = {
    id : Nat;
    medicationName : Text;
    dosage : Text;
    administrationTimes : [Text];
    prescribingPhysician : Text;
    status : MedicationStatus;
  };

  type NewMedication = {
    id : Nat;
    medicationName : Text;
    dosage : Text;
    administrationTimes : [Text];
    route : ?MedicationRoute;
    prescribingPhysician : Text;
    status : MedicationStatus;
  };

  type ResidentId = Principal;

  type Physician = {
    name : Text;
    contactNumber : Text;
    specialty : Text;
  };

  type PharmacyInfo = {
    name : Text;
    address : Text;
    contactNumber : Text;
  };

  type InsuranceInfo = {
    company : Text;
    policyNumber : Text;
    address : Text;
    contactNumber : Text;
  };

  type ResponsiblePerson = {
    name : Text;
    relationship : Text;
    contactNumber : Text;
    address : Text;
  };

  type OldResident = {
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
    medications : [OldMedication];
  };

  type NewResident = {
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
    medications : [NewMedication];
  };

  type UserProfile = {
    name : Text;
  };

  type VitalsRecord = {
    timestamp : Int;
    temperature : Float;
    pulse : Nat;
    bloodPressure : Text;
    bloodOxygen : Nat;
  };

  type MarRecord = {
    timestamp : Int;
    medicationName : Text;
    dosage : Text;
    administrationTime : Text;
    nurseId : Principal;
  };

  type AdlRecord = {
    timestamp : Int;
    activityType : Text;
    assistanceLevel : Text;
    notes : Text;
    supervisorId : Principal;
  };

  type OldActor = {
    residentsDirectory : Map.Map<ResidentId, OldResident>;
    userProfiles : Map.Map<Principal, UserProfile>;
    vitalsRecords : Map.Map<ResidentId, List.List<VitalsRecord>>;
    marRecords : Map.Map<ResidentId, List.List<MarRecord>>;
    adlRecords : Map.Map<ResidentId, List.List<AdlRecord>>;
    seededUsers : Set.Set<Principal>;
  };

  type NewActor = {
    residentsDirectory : Map.Map<ResidentId, NewResident>;
    userProfiles : Map.Map<Principal, UserProfile>;
    vitalsRecords : Map.Map<ResidentId, List.List<VitalsRecord>>;
    marRecords : Map.Map<ResidentId, List.List<MarRecord>>;
    adlRecords : Map.Map<ResidentId, List.List<AdlRecord>>;
    seededUsers : Set.Set<Principal>;
  };

  public func run(old : OldActor) : NewActor {
    let newResidentsDirectory = old.residentsDirectory.map<ResidentId, OldResident, NewResident>(
      func(_id, oldResident) {
        let medicationsIter = oldResident.medications.values();
        let newMedications = medicationsIter.map<OldMedication, NewMedication>(
          func(oldMedication) {
            {
              id = oldMedication.id;
              medicationName = oldMedication.medicationName;
              dosage = oldMedication.dosage;
              administrationTimes = oldMedication.administrationTimes;
              route = null;
              prescribingPhysician = oldMedication.prescribingPhysician;
              status = oldMedication.status;
            };
          }
        ).toArray();
        { oldResident with medications = newMedications };
      }
    );
    {
      old with
      residentsDirectory = newResidentsDirectory;
    };
  };
};
