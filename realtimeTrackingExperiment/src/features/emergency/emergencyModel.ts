import { ObjectId } from "mongoose";
import { IPatient } from "../account/patients/PatientModel";

export interface IEmergency {
    hospitalId: string;
    creatorId:string;
    emergencyId: string;
    emergencyType: string;
    emergencyLocation: string;
    emergencyTime: string;
    driver: string | ObjectId; // driver Id, 
    vehicleNumber: string;
    vehicleLocation: string;
    available: boolean;
    patient: {
        name:IPatient["name"];
        username: IPatient["username"];
        phoneNumber: IPatient["phoneNumber"];
        email: IPatient["email"];
    };
    isCompleted: boolean;
    completedTime: string;
    assigneeId: string | ObjectId; // paramedic Id
    isRequestRejected?: boolean | undefined;
}

export interface ILocation {
    latitude: number;
    longitude: number;
}

export enum EStatus {
    REQUESTED = "Requested",
    CANCELLED = "Cancelled",
    REJECTED = "Rejected",
    CREATED = "Created",
    COMPLETED = "Completed"
}

export enum EEmergencyType {
    LOW = "Low",
    MEDIUM = "Medium",
    CRITICAL = "Critical",
    ACCIDENT = "Accident" // Added based on sample data
}

export interface IRejection {
    isRequestRejected: boolean;
    rejectedBy: string;
    reason: string;
}