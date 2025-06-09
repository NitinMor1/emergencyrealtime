import { CallRoom } from '../models/callRoomModel';
import { generateCallRoomId, getUserWebSockets } from '../core/clientManager';
import { WebSocketResponse } from '../types';
import WebSocket from 'ws';

// Store active call rooms and calls
const callRooms = new Map<string, CallRoom>();
const activeCalls = new Map<string, Set<string>>();

export function handleInitiateCall(doctorId: string, patientId: string, hospitalId: string): string {
    const roomId = generateCallRoomId(patientId, doctorId);
    callRooms.set(roomId, {
        roomId,
        doctorId,
        patientId,
        hospitalId,
        callStartTime: Date.now(),
        callStatus: 'waiting',
        participants: new Set(),
        invitedUsers: new Set(),
    });

    console.log(`Attempting to broadcast call to patient: ${patientId}`);
    const incomingCallMessage: WebSocketResponse = {
        type: 'incomingCall',
        timestamp: new Date().toISOString(),
        data: {
            roomId,
            doctorId,
            patientId,
            hospitalId
        }
    };

    // Send call invitation to patient using new client manager
    const patientWebSockets = getUserWebSockets(patientId);
    patientWebSockets.forEach((ws: WebSocket) => {
        ws.send(JSON.stringify(incomingCallMessage));
    });

    return roomId;
}

export function handleAcceptCall(callRoomId: string, userId: string): boolean {
    const callRoom = callRooms.get(callRoomId);
    if (!callRoom || callRoom.patientId !== userId) {
        console.log(`Call room not found or user ${userId} is not the patient`);
        return false;
    }

    callRoom.callStatus = 'connected';
    console.log(`Call accepted: ${callRoomId}`);

    // Notify doctor that call was accepted
    const doctorWebSockets = getUserWebSockets(callRoom.doctorId);
    const acceptedMessage: WebSocketResponse = {
        type: 'callAccepted',
        timestamp: new Date().toISOString(),
        data: { callRoomId }
    };

    doctorWebSockets.forEach((ws: WebSocket) => {
        ws.send(JSON.stringify(acceptedMessage));
    });

    // Track active call
    if (!activeCalls.has(callRoom.doctorId)) {
        activeCalls.set(callRoom.doctorId, new Set());
    }
    activeCalls.get(callRoom.doctorId)?.add(callRoom.patientId);

    return true;
}

export function handleAddParticipant(callRoomId: string, doctorId: string, newParticipantId: string): boolean {
    const callRoom = callRooms.get(callRoomId);
    if (!callRoom || callRoom.doctorId !== doctorId) {
        console.log(`Call room not found or user ${doctorId} is not the doctor`);
        return false;
    }

    callRoom.invitedUsers.add(newParticipantId);
    console.log(`User ${newParticipantId} added to call room ${callRoomId}`);

    // Notify new participant
    const participantWebSockets = getUserWebSockets(newParticipantId);
    const addedMessage: WebSocketResponse = {
        type: 'addedToCall',
        timestamp: new Date().toISOString(),
        data: { callRoomId }
    };

    participantWebSockets.forEach((ws: WebSocket) => {
        ws.send(JSON.stringify(addedMessage));
    });

    return true;
}

export function handleEndCall(callRoomId: string, userId: string): boolean {
    const callRoom = callRooms.get(callRoomId);
    if (!callRoom || callRoom.doctorId !== userId) {
        console.log(`Call room not found or user ${userId} is not the doctor`);
        return false;
    }

    callRoom.callStatus = 'ended';
    const callDuration = Date.now() - callRoom.callStartTime;
    console.log(`Call ended: ${callRoomId}, duration: ${callDuration}ms`);

    const endMessage: WebSocketResponse = {
        type: 'callEnded',
        timestamp: new Date().toISOString(),
        data: {
            callRoomId,
            callDuration,
        }
    };

    // Notify all participants that call ended
    const allParticipants = [callRoom.doctorId, callRoom.patientId, ...Array.from(callRoom.invitedUsers)];
    allParticipants.forEach(participantId => {
        const webSockets = getUserWebSockets(participantId);
        webSockets.forEach((ws: WebSocket) => {
            ws.send(JSON.stringify(endMessage));
        });
    });

    // Remove from active calls
    if (activeCalls.has(callRoom.doctorId)) {
        activeCalls.get(callRoom.doctorId)?.delete(callRoom.patientId);
        if (activeCalls.get(callRoom.doctorId)?.size === 0) {
            activeCalls.delete(callRoom.doctorId);
        }
    }

    callRooms.delete(callRoomId);
    return true;
}

export function handleRejectCall(callRoomId: string, userId: string): boolean {
    const callRoom = callRooms.get(callRoomId);
    if (!callRoom || callRoom.patientId !== userId) {
        console.log(`Call room not found or user ${userId} is not the patient`);
        return false;
    }

    console.log(`Call rejected: ${callRoomId}`);

    // Notify doctor that call was rejected
    const doctorWebSockets = getUserWebSockets(callRoom.doctorId);
    const rejectedMessage: WebSocketResponse = {
        type: 'callRejected',
        timestamp: new Date().toISOString(),
        data: { callRoomId }
    };

    doctorWebSockets.forEach((ws: WebSocket) => {
        ws.send(JSON.stringify(rejectedMessage));
    });

    // Clean up call room
    callRooms.delete(callRoomId);
    return true;
}

// Get all active calls for a doctor
export function getActiveCalls(doctorId: string): string[] {
    const calls = activeCalls.get(doctorId);
    return calls ? Array.from(calls) : [];
}

// Get call room information
export function getCallRoom(callRoomId: string): CallRoom | undefined {
    return callRooms.get(callRoomId);
}

// Check if user is in an active call
export function isUserInCall(userId: string): boolean {
    for (const [, patientIds] of activeCalls) {
        if (patientIds.has(userId)) {
            return true;
        }
    }
    
    // Check if user is a doctor with active calls
    return activeCalls.has(userId) && (activeCalls.get(userId)?.size ?? 0) > 0;
}
