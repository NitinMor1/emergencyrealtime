export interface ISOS{
    hospitalId: string[];
    sosId: string;
    patientId: string;
    emergencyId: string;
    accepted?:{
        hospitalId: string;
        isAccepted: boolean;
    }
}