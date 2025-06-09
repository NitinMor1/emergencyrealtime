export interface IPatient {
    _id?: string | undefined;
    hospitalId: string,
    officeId: string,
    patientId: string,
    username: string | undefined;
    email: string,
    name:string;
    age: number,
    gender:string,
    password:string | undefined;
    patientGrowth: patientGrowth[],
    bloodGroup: string,
    address: string,
    pincode: string,
    phoneNumber: string,
    secondaryPhoneNumber: string,
    dob?: string | Date,
    group: string,
    flag: string,
    familyHistory: string,
    parentsDetails: parentDetails,
    allergies: string,
    additionalNotes: string,
    preTermDays: number,
    referredBy: string,
    school: string,
    family: Ifamily[],
    vitals: Vitals[],
    patientVaccination: patientVaccination[],
    // for medoc uses
    listOfHospitals: string[];
    listOfDoctors: string[] | [];
    profileUrl: string;
    personalHealth: IPersonalHealth | undefined | null;
    registrationDate?: string | Date;
}
export interface Ifamily {
    id: string | "";
    relation: string | "";
}
export interface IPersonalHealth {
    ovulationCycle: null | IOvulationCycle[];
}

export interface IOvulationCycle {
    startDate: string | Date;
    endDate: string | Date;
    flowRate: string;
}

export interface parentDetails{
    motherHeight: number,
    motherName: string,
    motherProfession: string,
    fatherHeight: number,
    fatherName: string,
    fatherProfession: string,
}

export interface patientGrowth{
    growthId: string,
    date: string | Date,
    bmi: number,
    height: number,
    weight: number
    patientOfficeId: string | undefined,
}


export interface Vitals{
    patientUsername:string,
    patientOfficeId: string,
    date: string | Date,
    time: string,
    note: string,
    status: string,
    unit: string,
    value: string,
    vitalId: string
    vitalName: string | Evitals ;
}

export enum Evitals{
    bodyTemperature = "Body Temperature",
    pulseRate = "Pulse Rate",
    respirationRate = "Respiration Rate",
    bloodPressure = "Blood Pressure",
    OFC = "OFC",
    SPO2 = "SPO2",
    Diastolic = "Diastolic",
    Systolic = "Systolic",
    R_Rate = "R Rate",
}

export interface patientVaccination{
    brand: string,
    dueDate: string | Date,
    givenDate: string | Date,
    name: string,
    notes: string,
    vaccineId: string,
    patientUsername: string,
    patientOfficeId: string
}

export function getOppositeRelation(relation: string): string {
    switch (relation) {
        case 'parent':
            return 'child';
        case 'child':
            return 'parent';
        case 'sibling':
            return 'sibling';
        case 'spouse':
            return 'spouse';
        case 'grandparent':
            return 'grandchild';
        case 'father':
            return 'child';
        case "mother":
            return 'child';
        case "":
            return "";
        default:
            throw new Error('Invalid relation');
    }
}

export interface IPatientMedicalHistoryArray{
    patientId: string;
    medicalHistory: PatientMedicalHistory[];
}
// create an api which allows ME application user to confirm whether hospital is allowed to check the patient's medical history or not in ME Application
export interface PatientMedicalHistory{
    MedicalHistoryId: string;
    hospitalId: string;
    startingDate: string; // ISO date
    endingDate: string; // ISO date
    ChiefComplaints: string;
    HistoryOfPresentIllness: string;
    PastSurgicalHistory: string[]; // if any surgery done in the past or in present then this field will get updated
    PastMedicalHistory: MedicalHistory[]; // if any medical history is not present then this field will get updated
    PersonalHistory: MedicalHistory[];
    PhysicalExamination: PhysicalExamination[];
    ProvisionalDiagnosis: ProvisionalDiagnosis[];
}
export interface PatientMedicalHistoryStaff{
    Date_Time_OF_MedicalOfficer: string;
    NameOfMedicalOfficer:string;
    signatureOfMedicalOfficer: string;
    MedicalOfficer_empId: string;
    NameOfConsultant: string;
    signatureOfConsultant: string;
    Date_Time_Of_Consultation: string;
}

export interface MedicalHistory{
    Disease: string; // need to find mapping field to update this
    Duration: string;
}

export interface PhysicalExamination{
    Parameter: string;
    Value: string;
}

export interface ProvisionalDiagnosis{
    Investigation: investigation[];
    Treatement: treatment[];
}

export interface investigation{
    name: string;
    date: string;
    result: string;
}

export interface treatment{
    name: string;
    date: string;
    description: string;
}
