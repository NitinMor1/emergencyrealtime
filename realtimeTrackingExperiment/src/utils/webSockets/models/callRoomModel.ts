import WebSocket from 'ws';

export interface CallRoom {
    roomId: string;
    doctorId: string;
    patientId: string;
    hospitalId?: string;
    callStartTime: number;
    callStatus: 'waiting' | 'connected' | 'ended';
    participants: Set<WebSocket>;
    invitedUsers: Set<string>;
}