import { procedures } from '../account/invoices/models/ipdBillModel';
import { PatientMedicalHistoryStaff, Vitals } from '../account/patients/PatientModel';
export interface IIPD {
  hospitalId: string;
  id: string;
  patient: {
    name: string;
    username: string;
    DOS: IDOS[] | [];
    DIO: IDIO[] | [];
    nonDrugOrder: INonDrugOrder[] | [];
  };
  admissionDate: string | Date;
  admissionCheckList: admissionCheckList;
  dischargeDate: string | Date | undefined;
  dichargeChecklist: PatientDischargeChecklist | undefined;
  room: Iroom;
  isbedOccupied: boolean; // Flag to indicate if room is occupied
  diagnosis: {
    icdDescription: string;
    icdCode: string;
  }[];
  medications: string[] | undefined;
  procedures?: procedures[] | undefined;
  diet: string | undefined; // Patient's dietary restrictions redefine
  allergies: string[] | undefined; // List of patient's allergies
  // array of date of string type
  visitHistory: IvisitHistory[]; // Array of timestamps for doctor visits
  patientMovement?: patientMovements[] | []; // seperate controller for this one
  insurance?: {
    // Embed insurance details if provided
    id: string | "";
    provider: string | "";
  };
  attendingPhysician: {
    // Embed doctor details
    id: string;
    name: string;
  };
  nurse?: {
    // Embed nurse details if provided
    id: string;
    name: string;
  };
  familyContact?:
  | {
    // Information about emergency contact person
    name: string | "";
    relation: string | ""; // Relationship to patient (e.g., spouse, parent)
    phoneNumber: string;
  }
  | undefined;
  notes?: string | undefined;
  Rate_Type: IRateType;
  NutritionAssessmentForm?: NutritionAssessmentForm;
  equipment?: equipment[];
  EMAR?: logs[];
  labs?: string[];
}

export interface logs {
  empId: string;
  empName: string;
  createdAt: string;
  updatedAt: string;
  actions: string;
}

export interface equipment {
  equipmentId?: string;
  equipmentName: string;
  quantity: number;
  status: string; // booked from date to date
}

export enum IRateType {
  NABHPrice = "NABHPrice",
  NON_NABHPrice = "NON_NABHPrice",
  CustomPrice = "CustomPrice"
}

export interface IDOS {
  date: string;
  time: string;
  drugName: string;
  dosage: string;
  Route: string;
  frequency: string;
  nurse: {
    id: string;
    name: string;
  }
  witness: {
    id: string;
    name: string;
  }
  pharmacist: {
    id: string;
    name: string;
  }
  doctor: {
    id: string;
    name: string;
  }
}

export interface IDIO {
  date: string;
  time: string;
  drugName: string;
  dosage: string;
  diluent: string;
  diluentVolume: string;
  infusionRate: string;
  route: string;
  frequency: string;
  goal: string;
  nurse: {
    id: string;
    name: string;
  }
  witness: {
    id: string;
    name: string;
  }
  pharmacist: {
    id: string;
    name: string;
  }
}

export interface INonDrugOrder {
  date: string;
  time: string;
  order: IOrder;
  PhysicianSign: {
    id: string;
    name: string;
  }
}
export interface IOrder {
  laboratory: string;
  radiology: string;
  otherDiagnosticOrder: string;
}

export interface IvisitHistory {
  date: string;
  time: string;
  relativeName: string;
  relation: string;
  phoneNumber: string;
}

export interface Iid_number {
  id: string;
  number: number;
}

export interface Iroom {
  type: roomType;
  roomNumber: number;
  Beds: Iid_number;
  numberOfBeds: number;
}

export enum roomType {
  EMERGENCY = "Emergency",
  GENERAL = "General",
  PRIVATE = "Private",
  ICU = "ICU",
  SURGICAL = "Surgical",
  OTHER = "Other"
}

export interface PatientDischargeChecklist {
  PdcDetail: PDC[];
  Attendant_Name: string[];
  attendant_digital_sign: string;
  Staff_Nurse_Name: string[];
  staff_nurse_digital_sign: string;
  Consultant_M_O_Name: string[];
  consultant_m_o_digital_sign: string;
}

export interface PDC {
  note: string;
  value: boolean;
}

export interface admissionCheckList {
  object: items[];
  OnAdmission: staffObject;
  OnDischarge: staffObject;
}

export interface staffObject {
  Date_Time: string;
  Attendant_Name: string;
  attendant_digital_sign: string;
  Staff_Name: string;
  staff_digital_sign: string;
}

export interface items {
  sr_no: number;
  item: string;
  AtTheTimeOfAdmission: boolean;
  AtTheTimeOfDischarge: boolean;
}

export interface patientMovements {
  movementId?: string;
  date: string;
  time_out: string;
  Dept_Out: string
  Reason_out: string;
  signature_out: string;
  time_in: string;
  Dept_In: string;
  Reason_In: string;
  signature_In: string;
}

export interface IPlanOfCare {
  patientId: string;
  hospitalId: string;
  IpdId: string; // mongoId of IPD
  Goal_Desired_Result: string;
  Applicable: applicable[] | string[];
  AdvisedInvestigation: string[];
  AdvisedTreatement: string[];
  PlannedSurgericalIntervention: string[];
  DietaryAdvice: dietary;
  PreventiveCare_SpecialPrecautions: PCSP[];
  FoodDrugInteraction: string[];
  Other: string[];
  Consult_Referral: string[];
  Rehabilitive_Aspects: string[]; // Non drug measures to enhance recovery
  Expected_Duration_Of_Stay: string;
  PhysicalExamination: Vitals[];
  SystematicExamination: SE[];
  DiagnosisPreliminary: string;
  FI_NAL_Diagnosis_At_Time_Of_Discharge: string;
  Signatures: PatientMedicalHistoryStaff;
}

export interface SE {
  RespiratorySystem: string;
  CardiovascularSystem: string;
  Abdomen: string;
  Genitourinary: string;
  CNS: string;
}

export interface PCSP {
  Restrain_Needed: string;
  Type: string;
  Reason: string;
}
export interface dietary {
  consistency: consistency[] | string[];
  type: dietarytype[] | string[];
}

export enum consistency {
  normal = "Normal",
  diabetic = "Diabetic",
  soft = "Soft",
  liquid = "Liquid",
  RylesTubeFeed = "Ryles Tube Feed",
  Fasting = "Fasting",
}

export enum dietarytype {
  normal = "Normal",
  diabetic = "Diabetic",
  lowSalt = "Low Salt",
  lowFat = "Low Fat",
  lowCalorie = "Low Calorie",
}

export enum applicable {
  preventive = "Preventive",
  curative = "Curative",
  palliative = "Palliative",
  rehabilitative = "Rehabilitative",
}


export interface investigationFlowChart {
  patientId: string;
  hospitalId: string;
  IPDId: string;
  allInvestigations: allInvestigations[];
  sampleResult: sampleResult[];
  RadioLogy_NonInvasive_Cardiology: RadioLogy_NonInvasive_Cardiology[];
  other: string;
}

export interface allInvestigations {
  investigationName: string;
  investigationType: Investigationtype;
  range: string;
  date_time: string;
}


export enum Investigationtype {
  Hematology = "Hematology",
  Blood_Biochemistry = "Biochemistry",
  Urine_RE = "Urine RE",
  Lipidogram = "Lipidogram",
  Coagulagram = "Coagulagram",
  CardiacEnzymes = "Cardiac Enzymes",
}

export interface sampleResult {
  s_no: number;
  Type_Of_Culture: string;
  Sampling_Date_Time: string;
  TakenBy: string;
  Source: string;
  Preliminary_Report: string;
  Final_Result: string;
}

export interface RadioLogy_NonInvasive_Cardiology {
  s_no: number;
  Area: string;
  DoneOn: string;
  No_of_Films: number;
  Report_Collected_on: string;
  Report_Collected_by: string;
}


export interface NutritionAssessmentForm {
  diagnosis: string;
  dietInstructedByConsultant: string;
  TypeOfDiet: dietType;
  dietInstructedByDietician: dietIntructedByDietician;
  patientBodyDetails: patientBodyDetails;
  nutritionalScreeningRating: NSR;
  Dietary_intake_charge: DIC;
  GastrointestinalSymptoms_that_persisted_for_2_weeks: GIS;
  Functional_Capacity: FC;
  Disease_and_its_relation_to_nutritional_requirement: string;
  Metabolic_demand: MD[];
  Biochemical_market: BCM[];
  Total_lymphocyte_count_less_than_1500_cells_mm: boolean;
  For_ICU_only: FIO[];
  Diet_Plans: DPs[];
}
export interface DPs {
  date_time: string;
  Diet_Plan_Change_in_Diet_Plan: string;
  Signature: string;
}

export enum FIO {
  Hb = "Hb",
  RBS = "RBS",
  Na = "Na",
  K = "K+",
  Cl = "Cl-",
  UREA = "UREA",
  CREATININE = "CREATININE",
}
export interface BCM {
  Albumin: albumin;
  Ranges: range;
  YesOrNo: boolean;
}
export enum range {
  Normal = "Normal",
  Mild_depletion = "Mild depletion",
  Moderate_depletion = "Moderate depletion",
  Severe_depletion = "Severe depletion",
}
export enum albumin {
  _3_5_g_dl = "3.5 g/dl",
  _2_8_3_47_g_dl = "2.8 - 3.47 g/dl",
  _2_1_2_7_g_dl = "2.1 - 2.7 g/dl",
  _2_1 = "< 2.1",
}

export enum MD {
  Stress = "Stress",
  Moderate_Stress = "Moderate Stress",
  High_Stress = "High Stress"
}
export interface FC {
  isApplicable: boolean;
  changes_duration_in_days: number;
  FCtype: FCtype[];
  type: secondaryFCtype[];
}
export enum secondaryFCtype {
  Working_sub_optimally = "Working sub optimally",
  Ammulatory_but_not_working = "Ammulatory but not working",
  Bed_ridden = "Bed ridden",
  Coma = "Coma"
}
export enum FCtype {
  No_dysfunction = "No dysfunction",
  Dysfunction = "Dysfunction",
  Duration_of_days = "Duration of days",
}

export interface GIS {
  isApplicable: boolean;
  changes_duration_in_days: number;
  type: GIStype[];
}
export enum GIStype {
  None = "None",
  Nausea = "Nausea",
  Vomiting = "Vomiting",
  Paint_at_rest_on_eating = "Paint at rest on eating",
  Difficulty_in_cheewing = "Difficulty in chewing",
  Difficulty_in_swallowing = "Difficulty in swallowing",
  Constipated = "Constipated",
  Diarrhea = "Diarrhea",
  Non_functional_GI_tract = "Non functional GI tract",
}
export interface DIC {
  isApplicable: boolean;
  changes_duration_in_days: number;
  type: DICtype[];
}
export enum DICtype {
  Suboptimal_solid_diet = "Suboptimal solid diet",
  Hypocaloric_liquid = "Hypocaloric liquid",
  Starvation_supplement = "Starvation supplement",
  Vitamins = "Vitamins",
  Minerals = "Minerals",
  NIL = "NIL",
}

export interface NSR {
  Nourishment: nourishment;
  WeightChange: weightChange;
}

export enum nourishment {
  Well_Nourished = "Well Nourished",
  Mild_Moderate_nourished = "Mild to Moderate Malnourished",
  Severely_Malnourished = "Severely Malnourished",
}
export interface weightChange {
  OverAll_Loss_in_past_6_months_in_KG: string;
  Changed_in_past_2_weeks_in_kg: string;
  isIncreased: boolean;
}
export interface patientBodyDetails {
  height: number;
  weight: number;
  IBW: number;
  BMI: number;
  index: patientHealthIndex;
}

export enum patientHealthIndex {
  Under_Weight = "Under Weight < 18.5",
  Normal = "Normal 18.5 - 24.9",
  Over_Weight = "Over Weight 25 - 29.9",
  Obesity = "Obesity 29.9 - 39.9",
  Extreme_Obesity = "Extreme Obesity > 40",
}

export enum dietType {
  Vegetarian = "Vegetarian",
  NonVegetarian = "Non-Vegetarian",
}

export enum dietIntructedByDietician {
  RT_Feed = "RT Feed",
  Liquid_Diet = "Liquid Diet",
  Soft_Diet = "Soft Diet",
  Normal_Diet = "Normal Diet",
}

export interface IDynamicIpd {
  hospitalId: string;
  // Add any other guaranteed fields here
  [key: string]: any;  // This allows any additional fields
}

/*
{
"hospitalId":"hos_7BA7CF",
"id":"ipd_67DB86",
"patient":{
    "username":"johndoe@123",
    "name":"John Doe",
    "DOS":[{
        "date":"2022-12-12",
        "time":"10:00:00",
        "drugName":"Paracetamol",
        "dosage":"500mg",
        "Route":"Oral",
        "frequency":"8 hourly",
        "nurse":{
            "id":"nur_69CD69",
            "name":"Nurse Jane"
          },
        "witness":{ 
            "id":"nur_69CD69",
            "name":"Nurse Jane"
          },
        "pharmacist":{
            "id":"phar_69CD69",
            "name":"Pharmacist Jane"
          },
        "doctor":{
            "id":"doc_44186",
            "name":"Dr. Smith"
          }
        }],
    "DIO":[{
        "date":"2022-12-12",
        "time":"10:00:00",
        "drugName":"Paracetamol",
        "dosage":"500mg",
        "diluent":"Water",
        "diluentVolume":"100ml",
        "infusionRate":"20ml/hr",
        "route":"Oral",
        "frequency":"8 hourly",
        "goal":"Fever",
        "nurse":{
            "id":"nur_69CD69",
            "name":"Nurse Jane"
          },
        "witness":{
            "id":"nur_69CD69",
            "name":"Nurse Jane"
          },
        "pharmacist":{
            "id":"phar_69CD69",
            "name":"Pharmacist Jane"
          },
        "doctor":{
            "id":"doc_44186",
            "name":"Dr. Smith"
          },
        "PhysicianSign":{
            "id":"doc_44186",
            "name":"Dr. Smith"
          }
    }],
    "nonDrugOrder":[{
      "date":"2022-12-12",
      "time":"10:00:00",
      "order":{
          "laboratory":"Blood test",
          "radiology":"X-ray",
          "otherDiagnosticOrder":"ECG"
      },
      "PhysicianSign":{
          "id":"doc_44186",
          "name":"Dr. Smith"
      }
    }]
},
"admissionDate":"2022-12-12",
"dischargeDate":"2022-12-15",
"room":{
    "type":"General",
    "roomNumber":15, 
    "Beds":{
        "id":"bed_01",
        "number":1
        },
    "numberOfBeds":1
"isbedOccupied":true,
"diagnosis":"Fever",
"medications":["Paracetamol","Ibuprofen"],
"procedures":["Blood test","X-ray"],
"diet":"No sugar",
"allergies":["Penicillin"],
"visitHistory":[{
    "date":"2022-12-12",
    "time":"10:00:00",
    "relativeName":"John Doe",
    "relation": "Father",
    "phoneNumber":"1234567890"
    },{
    "date":"2022-12-13",
    "time":"11:00:00",
    "relativeName":"Jane Doe",
    "relation": "Mother",
    "phoneNumber":"1234567890"
    }],
"insurance":{
    "id":"isur_27CD64",
    "provider":"XYZ Insurance"
},
"attendingPhysician":{
    "id":"doc_44186",
    "name":"Dr. Smith"
},
"nurse":{
    "id":"nur_69CD69",
    "name":"Nurse Jane"
},
"familyContact":{
    "name":"Jane Doe",
    "relation":"Spouse",
    "phoneNumber":"1234567890"
},
"notes":"Patient requires extra care."
}

*/