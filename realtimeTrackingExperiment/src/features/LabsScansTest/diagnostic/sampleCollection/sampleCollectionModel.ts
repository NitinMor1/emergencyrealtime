export interface SampleCollection {
    orderId: string;
    sampleId:string;
    patientId:string;
    empId:string;
    hospitalId:string;
    sampleDetails:string;
    sampleType:string;
    timeOfSampleCollection:string;
    sampleStatus:ESampleStatus;
}

export enum ESampleStatus {
    COLLECTED = 'collected',
    RECEIVED = 'received',
    ANALYZED = 'analyzed',
    DISPOSED = 'disposed',
    EXPIRED = 'expired',
    NOTCOLLECTED = 'notcollected'
}


export interface Delivery{
    deliveryId: string;
    patientId: string;
    hospitalId: string;
    deliveryItem: string;
    status: EStatus;
}

export enum EStatus{
    Delivered = "delivered",
    Pending = "pending"
}

// export interface SampleRegistration extends SampleCollection {
//     registrationNumber: string;
//     barcode: string;
//     collectionDevice: string;
//     preservativeUsed: string;
//     storageRequirements: string;
//     chainOfCustody: ChainOfCustodyEntry[];
// }

// export interface ChainOfCustodyEntry {
//     timestamp: Date;
//     location: string;
//     custodian: string;
//     actionPerformed: ESampleAction;
//     signature: string;
// }

// export enum ESampleAction {
//     TRANSFER = 'Transfer',
//     ALIQUOTING = 'Aliquoting',
//     STORAGE = 'Storage',
//     DISPOSAL = 'Disposal'
// }

/*
    {
        "sampleId": "sam_1A3D31",
        "patientId": "pat_1A3D31",
        "empId": "66eeeabdffb0b73ebb104585",
        "hospitalId": "hos_1A3D31",
        "sampleDetails": "sample details",
        "sampleType": "blood",
        "timeOfSampleCollection": "",
        "sampleStatus": "notcollected"
    }
*/