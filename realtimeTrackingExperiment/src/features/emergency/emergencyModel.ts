
export interface IEmergency {
    hospitalId: string;
    emergencyId: string;
    emergencyType: string;
    emergencyDescription: string;
    emergencyLocation: ILocation;
    emergencyTime: string;
    patient?: {
        name: string;
        username: string;
        phoneNumber: string;
        email: string;
    };
    status: EStatus,
    emergencyRoomId?: string;
    completedTime?: string;
    creatorId?: string; // HPlus creator id
    paramedicId?: string; // paramedic Id
    driverId?: string; // driver Id, 
    ambulanceNumber?: string;
    rejectionReason?: string
}

export interface ILocation {
    address?: string;
    latitude?: number;
    longitude?: number;
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
    HIGH = "High",
    CRITICAL = "Critical",
}
