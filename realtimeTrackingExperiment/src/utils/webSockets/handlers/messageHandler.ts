import WebSocket from 'ws';
import { WebSocketMessageType } from '../types';
import {
    handleSendMessage,
    handleMarkAsRead,
    handleDeleteMessage,
    handleTypingStatus
} from './chatHandler';
import {
    handleEmergencyRequest,
    handleEmergencyResponse,
    handleEmergencyStatusUpdate,
} from './emergencyHandler';
import {
    handleLocationUpdate,
    handleLocationRequest
} from './locationHandler';
import {
    handleInitiateCall,
    handleAcceptCall,
    handleRejectCall,
    handleEndCall,
    handleAddParticipant
} from './callHandler';
import {
    getHospitalFleetStatus,
    getHospitalActiveAmbulances,
    handleJoinTrackingRoom
} from './ambulanceTrackingHandler';
import { IAmbulanceTracking } from '../models/ambulanceTrackingModel';
import { sendEmergencyAlert } from '../core/broadcasting';

export interface MessageData {
    type: WebSocketMessageType;
    [key: string]: any;
}

export async function handleWebSocketMessage(
    ws: WebSocket,
    data: MessageData,
    userId: string | null
): Promise<void> {
    console.log('Received WebSocket message:', { type: data.type, userId });

    if (!userId && !['login'].includes(data.type)) {
        ws.send(JSON.stringify({
            type: 'error',
            message: 'Authentication required for this action',
            timestamp: new Date().toISOString()
        }));
        return;
    }

    try {
        switch (data.type) {
            case 'login':
                await handleLogin(ws, data);
                break;

            case 'locationUpdate':
                await handleLocationUpdateMessage(ws, data, userId!);
                break;

            case 'locationRequest':
                await handleLocationRequestMessage(ws, data, userId!);
                break;

            case 'sendMessage':
                await handleSendMessageRequest(ws, data, userId!);
                break;

            case 'joinChatRoom':
                await handleJoinChatRoomRequest(ws, data, userId!);
                break;

            case 'markAsRead':
                await handleMarkAsReadRequest(ws, data, userId!);
                break;

            case 'deleteMessage':
                await handleDeleteMessageRequest(ws, data, userId!);
                break;

            case 'typing':
                await handleTypingRequest(ws, data, userId!);
                break;

            case 'userOnline':
                await handleUserOnline(userId!, data.hospitalId, ws);
                break;

            case 'userOffline':
                await handleUserOffline(userId!, data.hospitalId, ws);
                break;

            case 'emergency_request':
                await handleEmergencyRequestMessage(ws, data, userId!)
                break;

            case 'emergencyAcceptance':
                await handleEmergencyResponseMessage(ws, data, userId!);
                break;

            case 'emergencyStatusUpdate':
                await handleEmergencyStatusUpdateMessage(ws, data, userId!);
                break;

            case 'callInitiate':
                await handleCallInitiateRequest(ws, data, userId!);
                break;

            case 'callAccept':
                await handleCallAcceptRequest(ws, data, userId!);
                break;

            case 'callReject':
                await handleCallRejectRequest(ws, data, userId!);
                break;

            case 'callEnd':
                await handleCallEndRequest(ws, data, userId!);
                break;

            case 'callAddParticipant':
                await handleCallAddParticipantRequest(ws, data, userId!);
                break;
            case 'heartbeat':
                ws.send(JSON.stringify({
                    type: 'heartbeat_ack',
                    timestamp: new Date().toISOString()
                }));
                break;

            case 'getHospitalFleet':
            case 'getHospitalFleetStatus':
                await handleGetHospitalFleetRequest(ws, data, userId!);
                break;

            case 'getHospitalActiveAmbulances':
                await handleGetHospitalActiveAmbulancesRequest(ws, data, userId!);
                break;

            case 'joinTrackingRoom':
                await handleJoinTrackingRoomRequest(ws, data, userId!);
                break;

            case 'connect':
                await handleConnectRequest(ws, data, userId!);
                break;

            default:
                console.log('Unknown message type:', data.type);
                ws.send(JSON.stringify({
                    type: 'error',
                    message: `Unknown message type: ${data.type}`,
                    timestamp: new Date().toISOString()
                }));
        }
    } catch (error) {
        console.error('Error handling WebSocket message:', error);
        ws.send(JSON.stringify({
            type: 'error',
            message: 'Internal server error while processing message',
            timestamp: new Date().toISOString()
        }));
    }
}

async function handleLocationUpdateMessage(ws: WebSocket, data: MessageData, userId: string): Promise<void> {
    if (data.userRole && data.location) {
        await handleLocationUpdate(ws, {
            userId,
            userRole: data.userRole,
            hospitalId: data.hospitalId,
            location: data.location,
            emergencyRoomId: data.emergencyRoomId
        });
    }
}

async function handleLocationRequestMessage(ws: WebSocket, data: MessageData, userId: string): Promise<void> {
    if (data.targetUserId && data.requesterRole) {
        await handleLocationRequest(ws, {
            requesterId: userId,
            requesterRole: data.requesterRole,
            requesterHospitalId: data.requesterHospitalId,
            targetUserId: data.targetUserId,
            targetRole: data.targetRole,
            reason: data.reason
        });
    }
}

async function handleSendMessageRequest(ws: WebSocket, data: MessageData, userId: string): Promise<void> {
    if (data.receiverId && data.message && data.hospitalId) {
        await handleSendMessage(
            userId,
            data.receiverId,
            data.message,
            data.hospitalId,
            ws,
            data.messageType ?? 'text',
            data.replyTo
        );
    }
}

async function handleJoinChatRoomRequest(ws: WebSocket, data: MessageData, userId: string): Promise<void> {
    if (data.receiverId && data.hospitalId) {
        await handleJoinChatRoom(ws, {
            senderId: userId,
            receiverId: data.receiverId,
            hospitalId: data.hospitalId
        });
    }
}

async function handleMarkAsReadRequest(ws: WebSocket, data: MessageData, userId: string): Promise<void> {
    if (data.messageId && data.hospitalId && data.senderId) {
        await handleMarkAsRead(data.messageId, userId, data.hospitalId, data.senderId, ws);
    }
}

async function handleDeleteMessageRequest(ws: WebSocket, data: MessageData, userId: string): Promise<void> {
    if (data.messageId && data.hospitalId && data.chatRoomId) {
        await handleDeleteMessage(
            data.messageId,
            userId,
            data.hospitalId,
            data.deleteForAll ?? false,
            data.chatRoomId,
            ws
        );
    }
}

async function handleTypingRequest(ws: WebSocket, data: MessageData, userId: string): Promise<void> {
    if (data.chatRoomId) {
        handleTypingStatus(data.chatRoomId, userId, data.isTyping ?? false, ws);
    }
}

async function handleEmergencyRequestMessage(ws: WebSocket, data: MessageData, userId: string): Promise<void> {
    if (data.patientId && data.hospitalId && data.location && data.condition && data.priority) {
        await handleEmergencyRequest(ws, {
            patientId: data.patientId,
            hospitalId: data.hospitalId,
            location: data.location,
            condition: data.condition,
            priority: data.priority,
            description: data.description,
            vitals: data.vitals,
            requestedBy: userId,
            requestedByRole: data.requestedByRole ?? 'patient'
        });
    }
}

async function handleEmergencyResponseMessage(ws: WebSocket, data: MessageData, userId: string): Promise<void> {
    if (data.emergencyId && data.action) {
        await handleEmergencyResponse(ws, {
            emergencyId: data.emergencyId,
            driverId: data.driverId,
            paramedicId: data.paramedicId,
            responderRole: data.responderRole ?? 'doctor',
            action: data.action,
            estimatedArrival: data.estimatedArrival,
            assignedDepartment: data.assignedDepartment,
            notes: data.notes
        }, userId);
    }
}

async function handleEmergencyStatusUpdateMessage(ws: WebSocket, data: MessageData, userId: string): Promise<void> {
    if (data.emergencyId && data.status) {
        await handleEmergencyStatusUpdate(ws, {
            emergencyId: data.emergencyId,
            status: data.status,
            updatedBy: userId,
            updatedByRole: data.updatedByRole ?? 'doctor',
            notes: data.notes,
            completionDetails: data.completionDetails
        });
    }
}

async function handleLogin(ws: WebSocket, data: MessageData): Promise<void> {
    console.log(`Login received for user: ${data.userId}`);
    ws.send(JSON.stringify({
        type: 'login_success',
        success: true,
        data: {
            userId: data.userId,
            role: data.role,
            hospitalId: data.hospitalId,
            message: 'Successfully logged in to WebSocket'
        },
        timestamp: new Date().toISOString()
    }));
}

async function handleJoinChatRoom(ws: WebSocket, data: {
    senderId: string;
    receiverId: string;
    hospitalId: string;
}): Promise<void> {
    const chatRoomId = generateChatRoomId(data.senderId, data.receiverId, data.hospitalId);

    // Add user to chat room (this would typically involve adding to a chat room map)
    ws.send(JSON.stringify({
        type: 'chat_room_joined',
        success: true,
        data: {
            chatRoomId,
            participants: [data.senderId, data.receiverId],
            hospitalId: data.hospitalId
        },
        timestamp: new Date().toISOString()
    }));
}

async function handleUserOnline(userId: string, hospitalId: string, ws: WebSocket): Promise<void> {
    const timestamp = new Date().toISOString();

    // For now, just send confirmation back to the user
    ws.send(JSON.stringify({
        type: 'status_updated',
        success: true,
        data: {
            userId,
            status: 'online'
        },
        timestamp
    }));
}

async function handleUserOffline(userId: string, hospitalId: string, ws: WebSocket): Promise<void> {
    const timestamp = new Date().toISOString();

    // For now, just send confirmation back to the user  
    ws.send(JSON.stringify({
        type: 'status_updated',
        success: true,
        data: {
            userId,
            status: 'offline'
        },
        timestamp
    }));
}

function generateChatRoomId(senderId: string, receiverId: string, hospitalId: string): string {
    const participants = [senderId, receiverId].sort((a, b) => a.localeCompare(b)).join('_');
    return `chat_${hospitalId}_${participants}`;
}

// Call handler functions
async function handleCallInitiateRequest(ws: WebSocket, data: MessageData, userId: string): Promise<void> {
    if (data.patientId && data.hospitalId) {
        const roomId = handleInitiateCall(userId, data.patientId, data.hospitalId);
        ws.send(JSON.stringify({
            type: 'callInitiated',
            success: true,
            data: { roomId },
            timestamp: new Date().toISOString()
        }));
    } else {
        ws.send(JSON.stringify({
            type: 'error',
            message: 'Missing required fields for call initiation',
            timestamp: new Date().toISOString()
        }));
    }
}

async function handleCallAcceptRequest(ws: WebSocket, data: MessageData, userId: string): Promise<void> {
    if (data.callRoomId) {
        const success = handleAcceptCall(data.callRoomId, userId);
        ws.send(JSON.stringify({
            type: 'callAcceptResult',
            success,
            data: { callRoomId: data.callRoomId },
            timestamp: new Date().toISOString()
        }));
    } else {
        ws.send(JSON.stringify({
            type: 'error',
            message: 'Missing callRoomId for call acceptance',
            timestamp: new Date().toISOString()
        }));
    }
}

async function handleCallRejectRequest(ws: WebSocket, data: MessageData, userId: string): Promise<void> {
    if (data.callRoomId) {
        const success = handleRejectCall(data.callRoomId, userId);
        ws.send(JSON.stringify({
            type: 'callRejectResult',
            success,
            data: { callRoomId: data.callRoomId },
            timestamp: new Date().toISOString()
        }));
    } else {
        ws.send(JSON.stringify({
            type: 'error',
            message: 'Missing callRoomId for call rejection',
            timestamp: new Date().toISOString()
        }));
    }
}

async function handleCallEndRequest(ws: WebSocket, data: MessageData, userId: string): Promise<void> {
    if (data.callRoomId) {
        const success = handleEndCall(data.callRoomId, userId);
        ws.send(JSON.stringify({
            type: 'callEndResult',
            success,
            data: { callRoomId: data.callRoomId },
            timestamp: new Date().toISOString()
        }));
    } else {
        ws.send(JSON.stringify({
            type: 'error',
            message: 'Missing callRoomId for ending call',
            timestamp: new Date().toISOString()
        }));
    }
}

async function handleCallAddParticipantRequest(ws: WebSocket, data: MessageData, userId: string): Promise<void> {
    if (data.callRoomId && data.participantId) {
        const success = handleAddParticipant(data.callRoomId, userId, data.participantId);
        ws.send(JSON.stringify({
            type: 'participantAddResult',
            success,
            data: {
                callRoomId: data.callRoomId,
                participantId: data.participantId
            },
            timestamp: new Date().toISOString()
        }));
    } else {
        ws.send(JSON.stringify({
            type: 'error',
            message: 'Missing callRoomId or participantId for adding participant',
            timestamp: new Date().toISOString()
        }));
    }
}

// Ambulance tracking handler functions
async function handleGetHospitalFleetRequest(ws: WebSocket, data: MessageData, userId: string): Promise<void> {
    if (data.hospitalId) {
        const fleetStatus = getHospitalFleetStatus(data.hospitalId);

        if (fleetStatus) {
            ws.send(JSON.stringify({
                type: 'hospitalFleetStatus',
                hospitalId: data.hospitalId,
                fleetStatus: {
                    hospitalId: fleetStatus.hospitalId,
                    totalAmbulances: fleetStatus.totalAmbulances,
                    activeAmbulances: fleetStatus.activeAmbulances,
                    availableAmbulances: fleetStatus.availableAmbulances, ambulances: Array.from(fleetStatus.ambulances.values()).map((ambulance: IAmbulanceTracking) => ({
                        emergencyId: ambulance.emergencyId,
                        vehicleNumber: ambulance.vehicleNumber,
                        status: ambulance.lastKnownLocation?.status ?? 'idle',
                        lastLocation: ambulance.lastKnownLocation
                    }))
                },
                timestamp: new Date().toISOString()
            }));
        } else {
            ws.send(JSON.stringify({
                type: 'hospitalFleetStatus',
                hospitalId: data.hospitalId,
                fleetStatus: {
                    hospitalId: data.hospitalId,
                    totalAmbulances: 0,
                    activeAmbulances: 0,
                    availableAmbulances: 0,
                    ambulances: []
                },
                timestamp: new Date().toISOString()
            }));
        }
    } else {
        ws.send(JSON.stringify({
            type: 'error',
            message: 'Missing hospitalId for fleet status request',
            timestamp: new Date().toISOString()
        }));
    }
}

async function handleGetHospitalActiveAmbulancesRequest(ws: WebSocket, data: MessageData, userId: string): Promise<void> {
    if (data.hospitalId) {
        const activeAmbulances = getHospitalActiveAmbulances(data.hospitalId);

        ws.send(JSON.stringify({
            type: 'hospitalActiveAmbulances',
            hospitalId: data.hospitalId,
            ambulances: activeAmbulances,
            count: activeAmbulances.length,
            timestamp: new Date().toISOString()
        }));
    } else {
        ws.send(JSON.stringify({
            type: 'error',
            message: 'Missing hospitalId for active ambulances request',
            timestamp: new Date().toISOString()
        }));
    }
}

async function handleJoinTrackingRoomRequest(ws: WebSocket, data: MessageData, userId: string): Promise<void> {
    if (data.trackingRoomId && data.userType) {
        handleJoinTrackingRoom(ws, data.trackingRoomId, userId, data.userType);
    } else {
        ws.send(JSON.stringify({
            type: 'error',
            message: 'Missing trackingRoomId or userType for joining tracking room',
            timestamp: new Date().toISOString()
        }));
    }
}

async function handleConnectRequest(ws: WebSocket, data: MessageData, userId: string): Promise<void> {
    // Handle general connection request - this could be for establishing connection
    // or for any connection-related initialization
    ws.send(JSON.stringify({
        type: 'connectionEstablished',
        userId: userId,
        success: true,
        message: 'Connection established successfully',
        timestamp: new Date().toISOString()
    }));
}
