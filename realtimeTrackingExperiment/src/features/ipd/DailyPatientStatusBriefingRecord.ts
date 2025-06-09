export interface DailyPatientStatusBriefingRecord {
    patient:{
        patientId: string;
        patientName: string;
        Age: number;
    }
    ipdId: string;
    hospitalId: string;
    bedNo: string;
    RoomNo: string;
    DailyPatientStatusBriefing: DailyPatientStatusBriefingRecordDetails[];
}

export interface DailyPatientStatusBriefingRecordDetails {
    date: string;
    time: string;
    explainedPatientConditionToPatientRelatives: string;
    doctorName: string;
    doctorSignature: string;
    patientRelativeName: string;
    patientRelativeSignature: string;
}