import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Time "mo:core/Time";

module {
  type OldActor = {
    userProfiles : Map.Map<Principal, { name : Text }>;
    residents : Map.Map<Principal, List.List<{ timestamp : Int; temperature : Float; pulse : Nat; bloodPressure : Text; bloodOxygen : Nat }>>;
    marRecords : Map.Map<Principal, List.List<{ timestamp : Int; medicationName : Text; dosage : Text; administrationTime : Text; nurseId : Principal }>>;
    adlRecords : Map.Map<Principal, List.List<{ timestamp : Int; activityType : Text; assistanceLevel : Text; notes : Text; supervisorId : Principal }>>;
  };

  type NewActor = {
    residentsDirectory : Map.Map<Principal, {
      id : Principal;
      name : Text;
      birthDate : Text;
      createdAt : Int;
      active : Bool;
      owner : Principal;
    }>;
    userProfiles : Map.Map<Principal, { name : Text }>;
    vitalsRecords : Map.Map<Principal, List.List<{ timestamp : Int; temperature : Float; pulse : Nat; bloodPressure : Text; bloodOxygen : Nat }>>;
    marRecords : Map.Map<Principal, List.List<{ timestamp : Int; medicationName : Text; dosage : Text; administrationTime : Text; nurseId : Principal }>>;
    adlRecords : Map.Map<Principal, List.List<{ timestamp : Int; activityType : Text; assistanceLevel : Text; notes : Text; supervisorId : Principal }>>;
  };

  public func run(old : OldActor) : NewActor {
    {
      residentsDirectory = Map.empty<Principal, {
        id : Principal;
        name : Text;
        birthDate : Text;
        createdAt : Int;
        active : Bool;
        owner : Principal;
      }>();
      userProfiles = old.userProfiles;
      vitalsRecords = old.residents;
      marRecords = old.marRecords;
      adlRecords = old.adlRecords;
    };
  };
};

