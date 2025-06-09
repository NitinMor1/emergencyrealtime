export interface AnaesthesiaCheckUpRecord{
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

    SystematicExamination: SystematicExamination;
    other:Other;
    investigations:Investigations;
}

export interface Other{
    angeBlood_BloodProducts: string;
    no_of_units: number;
    ASA_grade: asa_grade;
    NYHAclass: number;
    Consent: consent;

}

export enum consent{
    informed = "Informed",
    highRisk = "High Risk",
}
export enum asa_grade{
    I = "I",
    II = "II",
    III = "III",
    IV = "IV",
    V = "V",
    E = "E",
}
export interface Airway{
    mouthOpening: string;
    neckMovement: string;
    Mpg: number;
    Denition: string;
    difficultIntubation: string;
}

export interface SystematicExamination{
    CVS:string;
    RESP: string;
    CNS: string;
    GCS: string;
    P_A: string;
    VenousAccess: string;
    CentralLine: string;
    Chemoport: string;
}

export interface Investigations{
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

export interface BloodSugar{
    F: string;
    PP: string;
    R: string;
}

export interface RFT{
    S_Creatinine: string;
    Bun: string;
    NAp_Kp: string;
}

export interface UrineInvestigation{
    R_E: string;
    Culture: string;
}