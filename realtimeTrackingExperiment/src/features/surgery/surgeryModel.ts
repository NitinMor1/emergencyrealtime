import { Iroom } from "../ipd/ipdModel";

export interface ISurgery {
    hospitalId: string;
    time: string | undefined;
    patientRoom: string | undefined;
    procedure: string | undefined;
    remarks: string | undefined;
    surgeon: string | undefined;
    nurse_team: nurseTeam[] | undefined; // this must be array
    anaesthesiologist: string | undefined; //frontendPending 
    
    anaesthesiaType: string | undefined;
    scrub: string | undefined;
    circulatory: string | undefined;
    patientUsername: string | undefined;
    patientName: string | undefined;
    date: string | undefined;
    hospitalName: string | undefined;
    type: TYPE | undefined;
    prescipDoctor: string | undefined;
    performingDoc: Surgeon[] | [];
    doctorUsername: string | undefined;
    note: string | undefined;
    contents: ITestResult[] | [];
    file_path: string | undefined;
    uploaded_by: string | undefined;
    uploaded_At: string | undefined;
    downloaded_by: string[] | [];
    downloaded_at: string[] | [];
    status: STATUS;
    equipment: equipment[];
    anaesthesiaName: anaesthesiaName[];
    iv: iv[];
    bloodUnit: string | undefined;
    room: Iroom;
    medicine: medicine[];
}

export interface Surgeon{
    title: string;
    empid: string | undefined;
    name: string;
    phoneNumber?:string;
}

//add surgeon (surgery mongo id ) array me push karke
export interface medicine {
    medicineName: string;
    quantity: number;
}

export interface iv {
    ivName: string;
    ivId: string;
    nurse: {
        nurseName: string;
        nurseId: string;
    };
    witnessDoctor: {
        witnessName: string;
        witnessId: string;
    };
    pharmacist: {
        pharmacistName: string;
        pharmacistId: string;
    };
    dosage: string;
    time: string;
    date: string;
    notes: string;
}
export interface anaesthesiaName {
    anaesthesiaName: string;
    anaesthesiaId: string;
    nurse: {
        nurseName: string;
        nurseId: string;
    };
    witnessDoctor: {
        witnessName: string;
        witnessId: string;
    };
    pharmacist: {
        pharmacistName: string;
        pharmacistId: string;
    };
    dosage: string;
    time: string;
    date: string;
    notes: string;
}

export interface nurseTeam {
    nurseName: string;
    nurseId: string;
}
export interface equipment {
    equipmentId?: string;
    equipmentName: string;
    quantity: number;
    status: string; // booked from date to date
}

export enum TYPE {
    SURGERY = "surgery"
}
export enum STATUS {
    PENDING = "Pending",
    COMPLETED = "Completed",
    SCHEDULED = "Scheduled",
    ONGOING = "Ongoing",
}
export interface ITestResult {
    test_name: string;
    result_value: string;
    unit: string;
    ref_range: string;
}

export interface AnaesthesiaCheckUpRecord {
    Date_Time: string;
    anesthetist: string;

    presentComplaints: string;
    durationOfComplaints: string;
    PastMedicalHistory: string;
    PastSurgicalHistory: string;
    PresentDrugHistory: string;
    Pre_AnaestheticCheckUp: string;
    ImmediatePre_evaluation: string;

    DrugAllergy: string;
    Addiction: string;

    Airway: Airway

    generalExamination: GeneralExamination
    SystematicExamination: SystematicExamination;
    other: Other;
    investigations: Investigations;


}

export interface GeneralExamination {
    T: string;
    BP: string;
    P: string;
    Pain: string;
    Pallor_cynosis_Lymphadenopathy: string;
    Clubbing_JVP_EDEMA: string;
}

export interface Other {
    angeBlood_BloodProducts: string;
    no_of_units: number;
    ASA_grade: asa_grade;
    NYHAclass: number;
    Consent: consent;

}

export enum consent {
    informed = "Informed",
    highRisk = "High Risk",
}
export enum asa_grade {
    I = "I",
    II = "II",
    III = "III",
    IV = "IV",
    V = "V",
    E = "E",
}
export interface Airway {
    mouthOpening: string;
    neckMovement: string;
    Mpg: number;
    Denition: string;
    difficultIntubation: string;

}

export interface SystematicExamination {
    CVS: string;
    RESP: string;
    CNS: string;
    GCS: string;
    P_A: string;
    VenousAccess: string;
    CentralLine: string;
    Chemoport: string;
}

export interface Investigations {
    Hb: string;
    TLC: string;
    DLC: string;
    Platelet: string;
    PT_INR: string;
    BT_CT: string;
    APTT_ACT: string;
    bloodSugar: BloodSugar;
    LFT: string;
    RFT: RFT;
    urine: UrineInvestigation;
    ECG: string;
    CXray: string;
    PFT: string;

    HbsAg: string;
    HIV: string;
    HCV: string;
    ECHO: string;
}

export interface BloodSugar {
    F: string;
    PP: string;
    R: string;
}

export interface RFT {
    S_Creatinine: string;
    Bun: string;
    NAp_Kp: string;
}

export interface UrineInvestigation {
    R_E: string;
    Culture: string;
}
/*
{
    "hospitalId": "hos_7BA7CF",
    "patientUsername": "pat_11BA72",
    "hospitalId": "hos_7BA7CF",
    "time": "12:30",
    "ot": "OT-1",
    "patientRoom": "Room-1",
    "procedure": "Appendectomy",
    "remarks": "N/A",
    "surgeon": "Dr. John Doe",
    "nurse_team": "Nurse Team 1",
    "anaesthesiologist": "Dr. Jane Doe",
    "anaesthesiaType": "General",
    "scrub": "Nurse 1",
    "circulatory": "Nurse 2",
    "patientUsername": "patient1",
    "patientName": "Patient 1",
    "date": "2021-08-12",
    "hospitalName": "Hospital 1",
    "type": "surgery",
    "prescipDoctor": "Dr. Jane Doe",
    "performingDoc": "Dr. John Doe",
    "note": "N/A",
    "contents": [
        {
            "test_name": "Blood Pressure",
            "result_value": "120/80",
            "unit": "mmHg",
            "ref_range": "120/80 - 140/90"
        },
        {
            "test_name": "Heart Rate",
            "result_value": "72",
            "unit": "bpm",
            "ref_range": "60 - 100"
        }
    ],
    "file_path": "file_path",
    "uploaded_by": "Dr. John Doe",
    "uploaded_At": "2021-08-12",
    "downloaded_by": [],
    "downloaded_at": [],
    "status": "Pending"
}
*/