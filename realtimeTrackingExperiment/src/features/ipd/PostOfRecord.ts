export interface PostOfRecord{
    patientName: string;
    Age: string;
    Sex: string;
    hospitalId: string;
    ipdId: string;
    date_time: string;
    BedNo: string;
    RoomNo: string;
    POST_OF_RECORD: PostOfRecordDetails[];
}

export interface PostOfRecordDetails{
    Activity: string;
    SPO2_saturation: string;
    Temperature: string;
    Pain_Score: string;
    Consciousness: string;
    Circulation: string;
    Name_Sign_of_Anaesthetist: string;
    Date_Time: string;
}