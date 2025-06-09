import { Vitals } from "../account/patients/PatientModel";

export interface IPrescription {
    name: string;
    date: string;
    time: string;
    doctorUsername: string;
    patientUsername: string;
    hospitalName: string;
    hospitalId: string;
    clinicalNote: string;
    diagnosis?: string[];
    complaints?: string[];
    notes?: string[];
    medication?: Medication[];
    investigations?: Investigation[];
    test?: Test[];
    followup?: FollowUp;
    vitals?: IVitals;
    nursing?: Nursing[];
    discharge?: Discharge;
    icdCode?: IcdCode[];
    MedicalHistory?: string[];
    labScanPdf?: IPdf[];
    SystematicExamination?: SystematicExamination;
    Assessment_Plan?: string;
    Nutrition_Assessment?: string[];
    referredTo?: ReferralDoctor;
}

export interface IVitals {
    BP: string;
    Heartrate: string;
    RespiratoryRate: string;
    temp: string;
    spO2: string;
    weight: string;
    height: string;
    BMI: string;
    waist_hips: string;
}

export interface SystematicExamination {
    General: string[];
    CVS: string[];
    RS: string[];
    CNS: string[];
    PA: string[];
    ENT: string[];
}

export interface ReferralDoctor {
    doctorName: string;
    doctorUsername: string;
    phoneNumber: string;
    email: string;
    hospitalId: string;
    hospitalName: string;
    speciality: string;
}

export interface IcdCode {
    CODE: string;
    DESCRIPTION: string;
}

export interface IPdf {
    hospitalId: string;
    title: string;
    filename: string;
    contentType: string;
    length: number;
    uploadDate: Date;
    metadata?: Record<string, any>;
}

export interface Medication {
    name: string;
    medicationDetails: IMedicationDetail[];
}

export interface IMedicationDetail {
    dose: string;
    route: string;
    freq: string;
    dur: string;
    class: string;
    when: string;
}

export interface Investigation {
    investigation: string;
    isCreated: boolean;
}

export interface Test {
    name: string;
    instruction: string;
    date: string;
}

export interface FollowUp {
    date: string;
    reason: string;
}

export interface Nursing {
    instruction: string;
    priority: string;
}

export interface Discharge {
    planned_date: string;
    instruction: string;
    Home_Care: string;
    Recommendations: string;
}

export interface WhatsappPayload {
    apiKey: string;
    campaignName: string;
    destination: string;
    userName: string;
    templateParams: string[];
    source: string;
    buttons: any[];
    carouselCards: any[];
    location: Record<string, any>;
}

export enum notify {
    read = "read",
    unread = "unread"
}