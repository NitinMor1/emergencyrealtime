import WebSocket from 'ws';
import { CallRoom } from '../models/callRoomModel';

export const clients = new Map<string, Set<WebSocket>>();
export const callRooms = new Map<string, CallRoom>();
export const activeCalls = new Map<string, Set<string>>();
export const chatRooms = new Map<string, Set<WebSocket>>();

export function generateCallRoomId(patientId: string, doctorId: string): string {
    return `call_${patientId}_${doctorId}_${Date.now()}`;
}

export function generateChatRoomId(senderId: string, receiverId: string, hospitalId: string): string {
    const participants = [senderId, receiverId].sort((a, b) => a.localeCompare(b)).join('_');
    return `chat_${hospitalId}_${participants}`;
}

export function logClientConnections() {
    console.log('Current Connected Clients:');
    if (clients.size > 0) {
        clients.forEach((socketsSet, userId) => console.log(`User ID: ${userId}, Total Connections: ${socketsSet.size}`));
    } else {
        console.log('No active connections');
    }
}
