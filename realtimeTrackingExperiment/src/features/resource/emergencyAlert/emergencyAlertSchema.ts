export interface IAlert {  
    hospitalId: string;   
    doctorUsername: string;  
    message: string;    
    status: alertStatus;
    date: string | Date;
    createdBy: string;
}
    
export enum alertStatus {
    CRITICAL = 'Critical',   
    HIGH = 'High',           
    MEDIUM = 'Medium',       
}

/*
{    hospitalId: hos_7BA7CF,
    doctorUsername: doc_7BA7CF,
    message: "Patient is in critical condition",
    status: "Critical"}
*/