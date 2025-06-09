export interface PTDs{
    patientName: string;
    patientId: string;
    hospitalId: string;
    ipdId: string;
    sex: string;
    age: string;
    bedNo: string;
    roomNo: string;
    date_time: string;
    transferDetails: TransferDetails[];
}

export interface TransferDetails{
    sr_no: number;
    date: string;
    Transfer_out: TO;
    Transfer_in: TO;
    handover_given_by: string;
    handover_taken_by: string;
    remarks: string;
}

export interface TO{
    department: string;
    date: string;
}