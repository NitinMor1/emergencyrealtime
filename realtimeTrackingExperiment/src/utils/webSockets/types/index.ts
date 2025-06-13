// Types for better type safety and modularity
import { EEmergencyType, ILocation, EStatus } from '../../../features/emergency/emergencyModel';
import WebSocket from 'ws';

// Type aliases for commonly used union types
export type UserRole = 'hospital' | 'paramedic' | 'patient' | 'doctor' | 'nurse' | 'admin' | 'receptionist' | 'technician' | 'pharmacist';
export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type MessageType = 'text' | 'image' | 'file' | 'location' | 'voice';
export type UserStatus = 'active' | 'idle' | 'busy' | 'emergency';
export type NotificationType = 'emergency' | 'chat' | 'dispatch' | 'consultation' | 'admin';

// WebSocket message types for the message handler
export type WebSocketMessageType =
    | 'login' | 'logout'
    | 'joinHospital' | 'emergencyLocationUpdate' | 'locationRequest'
    | 'sendMessage' | 'joinChatRoom' | 'markAsRead' | 'deleteMessage' | 'typing'
    | 'userOnline' | 'userOffline'
    | 'emergencyRequest' | 'emergencyAcceptance' | 'emergencyStatusUpdate'
    | 'callInitiate' | 'callAccept' | 'callReject' | 'callEnd' | 'callAddParticipant'
    | 'notification' | 'heartbeat'
    | 'getHospitalFleet' | 'getHospitalFleetStatus' | 'getHospitalActiveAmbulances'
    | 'joinTrackingRoom' | 'connect' | 'shareLocation' | 'joinEmergencyRoom' | 'updateLocation' | 'getEmergencyLocationUpdate';

export interface ClientInfo {
    ws: WebSocket;
    userId: string;
    hospitalId?: string;
    role: UserRole;
    department?: string; // e.g., 'emergency', 'cardiology', 'surgery', etc.
    specialization?: string; // e.g., 'cardiologist', 'surgeon', 'general', etc.
    isOnline: boolean;
    lastSeen: Date;
}

export interface EmergencyData {
    status: EStatus;
    emergencyId: string;
    patientId: string;
    patientName?: string;
    patientPhone?: string;
    patientEmail?: string,
    hospitalId: string;
    emergencyLocation: ILocation;
    emergencyDescription?: string;
    emergencyType: EEmergencyType;
    timestamp: string;
    requestedBy: string;
    requestedByRole: UserRole;
    responderId?: string;
    driver?: {
        username: string;
        name: string;
        employeeId: string;
    };
    paramedic?: {
        username: string;
        name: string;
        employeeId: string;
    };
    ambulance?: string;
    assignedDepartment?: string;
    estimatedArrival?: string;
    acceptedAt?: string;
    completedAt?: string;
    lastUpdated?: string;
    lastUpdatedBy?: string;
    responseNotes?: string;
    progressNotes?: Array<{
        note: string;
        addedBy: string;
        addedByRole: UserRole;
        timestamp: string;
    }>;
    rejections?: Array<{
        rejectedBy: string;
        rejectedByRole: UserRole;
        reason?: string;
        timestamp: string;
    }>;
}


export const priorityOrder = {
    'Critical': 0,
    'High': 1,
    'Medium': 2,
    'Low': 3
}

export interface EmergencyRoomInfo {
    participants: WebSocket[],
    emergencyId: string,
    hospitalId: string,
    patientLocation?: {
        timestamp: string;
        lat: string;
        lng: string;
    },
    paramedicLocation?: {
        timestamp: string;
        lat: string;
        lng: string;
    }
}

export interface ChatMessage {
    messageId: string;
    senderId: string;
    receiverId: string;
    hospitalId: string;
    message: string;
    messageType: MessageType;
    timestamp: string;
    isRead: boolean;
    isDelivered: boolean;
    replyTo?: string;
    attachments?: Array<{
        type: string;
        url: string;
        name: string;
        size?: number;
    }>;
}

export interface LocationUpdate {
    userId: string;
    userRole: UserRole;
    hospitalId?: string;
    location: {
        lat: number;
        lng: number;
        accuracy?: number;
        speed?: number;
        heading?: number;
        timestamp: string;
    };
    isEmergency?: boolean;
    emergencyId?: string;
    status?: UserStatus;
    timestamp: string;
}

export interface DispatchInfo {
    emergencyId: string;
    assignedParamedicId?: string;
    location: {
        lat: number;
        lng: number;
        address?: string;
    };
    priority: Priority;
    instructions: string;
    estimatedArrival?: string;
    equipmentNeeded?: string[];
}

export interface WebSocketMessage {
    type: string;
    senderId?: string;
    receiverId?: string;
    hospitalId?: string;
    role?: UserRole;
    data?: any;
    timestamp?: string;
    [key: string]: any;
}

export interface ConnectionStats {
    totalConnections: number;
    hospitals: number;
    paramedics: number;
    patients: number;
    doctors: number;
    nurses: number;
    admins: number;
    receptionists: number;
    technicians: number;
    pharmacists: number;
    hospitalBreakdown: Record<string, number>;
    departmentBreakdown: Record<string, Record<string, number>>;
    specializationBreakdown: Record<string, number>;
}

export interface WebSocketResponse {
    type: string;
    success?: boolean;
    message?: string;
    data?: any;
    timestamp: string;
    error?: string;
}

export interface NotificationData {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    priority: Priority;
    timestamp: string;
    data?: any;
}
