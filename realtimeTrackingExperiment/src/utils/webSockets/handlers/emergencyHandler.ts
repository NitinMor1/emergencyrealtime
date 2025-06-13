// Emergency booking and dispatch system with role-based isolation
import WebSocket from 'ws';
import { EmergencyData, UserRole, Priority, WebSocketResponse, EmergencyRoomInfo, priorityOrder } from '../types';
import {
    sendEmergencyAlert,
    broadcastToUser,
    broadcastToParamedic,
    broadcastToHospitalRoles
} from '../core/broadcasting';
import {
    emergencyRooms,
    generateEmergencyId,
    paramedicsClients,
    patientClients
} from '../core/clientManager';
import { EEmergencyType, EStatus, ILocation } from '../../../features/emergency/emergencyModel';
import { IUser } from 'features/account/users/UserModel';


// Emergency state management
const activeEmergencies = new Map<string, EmergencyData>();
const emergencyQueue = new Map<string, EmergencyData[]>(); // hospitalId -> emergency queue


const emergencyRoles: UserRole[] = ['doctor', 'nurse', 'admin', 'hospital'];

/**
 * Handle new emergency request from patient or paramedic
 */
export async function handleEmergencyRequest(
    ws: WebSocket,
    data: {
        hospitalId: string,
        emergencyType: string,
        emergencyDescription: string,
        name: string,
        phoneNumber: string,
        email: string,
        patientId: string,
        emergencyLocation: ILocation,
        requestedBy: string,
        requestedByRole: string
    }
): Promise<void> {
    try {
        const emergencyId = generateEmergencyId();
        const timestamp = new Date().toISOString();

        const emergencyData: EmergencyData = {
            emergencyId,
            status: EStatus.REQUESTED,
            patientId: data.patientId,
            patientName: data.name,
            patientPhone: data.phoneNumber,
            patientEmail: data.email,
            hospitalId: data.hospitalId,
            emergencyType: data.emergencyType as EEmergencyType,
            emergencyLocation: data.emergencyLocation,
            timestamp,
            emergencyDescription: data.emergencyDescription,
            requestedBy: data.requestedBy,
            requestedByRole: data.requestedByRole as UserRole
        };

        // Store emergency
        activeEmergencies.set(emergencyId, emergencyData);

        // Add to hospital queue
        if (!emergencyQueue.has(data.hospitalId)) {
            emergencyQueue.set(data.hospitalId, []);
        }
        emergencyQueue.get(data.hospitalId)?.push(emergencyData);

        // Sort queue by priority and timestamp
        emergencyQueue.get(data.hospitalId)?.sort((a, b) => {

            if (priorityOrder[a.emergencyType] !== priorityOrder[b.emergencyType]) {
                return priorityOrder[a.emergencyType] - priorityOrder[b.emergencyType];
            }
            return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        });

        // Confirm to requester
        const confirmMessage: WebSocketResponse = {
            type: 'emergencyRequestConfirmation',
            success: true,
            data: {
                emergencyId,
                hospitalId: data.hospitalId,
                message: 'Your emergency request has been received and dispatched to hospital staff.'
            },
            timestamp
        };
        ws.send(JSON.stringify(confirmMessage));

        // Alert hospital staff
        const alertMessage: WebSocketResponse = {
            type: 'emergencyAlert',
            data: emergencyData,
            timestamp
        };

        // Send emergency alert to staff having creation authority
        sendEmergencyAlert(data.hospitalId, alertMessage);

        console.log(`Emergency ${emergencyId} created for hospital ${data.hospitalId} with type ${data.emergencyType}`);

    } catch (error) {
        console.error('Error handling emergency request:', error);
        ws.send(JSON.stringify({
            type: 'error',
            message: 'Failed to request emergency',
            timestamp: new Date().toISOString()
        }));
    }
}

/**
 * Handle emergency response (accept/reject) from hospital staff
 */
export async function handleEmergencyResponse(
    ws: WebSocket,
    data: {
        emergencyId: string,
        emergencyRoomId?: string,
        driver?: {
            username: string;
            name: string;
            employeeId: string;
        },
        paramedic?: {
            username: string;
            name: string;
            employeeId: string;
        },
        ambulance?: string,
        responderRole: IUser,
        action: 'accept' | 'reject',
        rejectionReason?: string,
        notes?: string,
    },
    userId: string
): Promise<void> {
    const emergency: EmergencyData | undefined = activeEmergencies.get(data.emergencyId);
    console.log("emergency: " + emergency)
    if (!emergency || emergency.status != EStatus.REQUESTED) {
        ws.send(JSON.stringify({
            type: 'error',
            message: 'Emergency not found or already responded',
            timestamp: new Date().toISOString()
        }));
        return;
    }
    try {

        const timestamp = new Date().toISOString();

        if (data.action === 'accept') {

            if (!data.paramedic?.username || !data.driver?.username || !data.ambulance || !data.emergencyRoomId) {
                ws.send(JSON.stringify({
                    type: 'error',
                    message: 'Paramedic, driver, and ambulance information are required to accept the emergency.',
                    timestamp: new Date().toISOString()
                }));
                return;
            }

            // Update emergency status
            emergency.responderId = userId;
            emergency.paramedic = data.paramedic;
            emergency.driver = data.driver;
            emergency.responseNotes = data.notes;
            emergency.acceptedAt = timestamp;
            emergency.status = EStatus.CREATED


            await createAndJoinEmergencyJoinRoom(
                emergency.emergencyId,
                emergency.hospitalId,
                ws, // self
                emergency.requestedBy,
                emergency.paramedic.username,
                emergency.driver.username,
                data.emergencyRoomId
            );

            // Remove from queue



            // Notify patient
            broadcastToUser(emergency.requestedBy, {
                type: 'emergencyAccepted',
                data: {
                    emergencyId: data.emergencyId,
                    emergencyRoomId: data.emergencyRoomId,
                    assignedRole: data.responderRole,
                    responderId: userId,
                    driver: data.driver,
                    paramedic: data.paramedic,
                    ambulance: data.ambulance,
                    hospitalId: emergency.hospitalId,
                    notes: data.notes
                },
                timestamp
            });



            // Notify hospital staff
            broadcastToHospitalRoles(emergency.hospitalId, emergencyRoles, {
                type: 'emergencyStatusUpdate',
                data: {
                    emergencyId: data.emergencyId,
                    emergencyRoomId: data.emergencyRoomId,
                    status: 'accepted',
                    responderId: userId,
                    responderRole: data.responderRole
                },
                timestamp
            }, userId);

            broadcastToParamedic(emergency.hospitalId, {
                type: 'emergencyAssigned',
                data: {
                    emergencyId: data.emergencyId,
                    emergencyRoomId: data.emergencyRoomId,
                    responderId: userId,
                    responderRole: data.responderRole
                },
                timestamp
            }, data.paramedic.username)


            console.log(`Emergency ${data.emergencyId} accepted by ${data.responderRole} ${userId}`);
        }

        else if (data.action === 'reject') {

            emergency.status = EStatus.REJECTED;

            const rejectedMessageData = {
                status: 'rejected',
                reason: data.rejectionReason,
                responderId: userId,
                responderRole: data.responderRole
            }

            broadcastToHospitalRoles(emergency.hospitalId, emergencyRoles, {
                type: 'emergencyStatusUpdate',
                data: rejectedMessageData,
                timestamp
            }, userId);

            broadcastToUser(emergency.requestedBy, {
                type: 'emergencyRejected',
                data: rejectedMessageData,
                timestamp
            });

            console.log(`Emergency ${data.emergencyId} rejected by ${data.responderRole} ${userId}`);
        }


    } catch (error) {
        console.error('Error handling emergency response:', error);
        ws.send(JSON.stringify({
            type: 'error',
            message: 'Failed to process emergency response',
            timestamp: new Date().toISOString()
        }));
    }
    finally {
        const queue = emergencyQueue.get(emergency.hospitalId);
        if (queue) {
            const index = queue.findIndex(e => e.emergencyId === data.emergencyId);
            if (index > -1) {
                queue.splice(index, 1);
            }
        }
    }
}

export async function createAndJoinEmergencyJoinRoom(
    emergencyId: string,
    hospitalId: string,
    responder: WebSocket,
    patientId: string,
    paramedicId: string,
    driverId: string,
    emergencyRoomId: string
) {

    const paraClient = paramedicsClients.get(hospitalId);

    const paramedicClientInfo = paraClient?.find(client => client.userId == paramedicId);

    const paramedic = paramedicClientInfo?.ws;
    const patient = patientClients.get(patientId)?.ws;


    if (responder && patient && paramedic) {

        const participants: EmergencyRoomInfo = {
            emergencyId,
            hospitalId,
            participants: [
                paramedic,
                patient,
                responder
            ],
        };

        emergencyRooms.set(emergencyRoomId, participants);
        return;
    } else {
        console.warn("[handleEmergencyJoinRoom] Missing participant(s):", {
            responder: !!responder,
            patient: !!patient,
            paramedic: !!paramedic
        });
    }
}

export async function joinEmergencyRoom(
    emergencyId: string,
    emergencyRoomId: string,
    ws: WebSocket) {
    const emergency: EmergencyData | undefined = activeEmergencies.get(emergencyId);
    const emergencyRoom = emergencyRooms.get(emergencyRoomId);
    if (!emergency || !emergencyRoom) {
        ws.send(JSON.stringify({
            type: 'error',
            message: 'Emergency not found',
            timestamp: new Date().toISOString()
        }));
        return;
    }

    emergencyRoom.participants.push(ws);

    ws.send(JSON.stringify({
        type: 'joinEmergencyRoomSuccess',
        data: {
            ...emergency,
            ...emergencyRoom,
            message: 'Successfully joined the emergency room.'
        },
        timestamp: new Date().toISOString()
    }));

}

export async function getEmergencyLocationUpdate(
    emergencyRoomId: string,
    userRole: string,
    ws: WebSocket) {

    const emergencyRoom = emergencyRooms.get(emergencyRoomId);
    if (!emergencyRoom) {
        ws.send(JSON.stringify({
            type: 'error',
            message: 'Emergency not found',
            timestamp: new Date().toISOString()
        }));
        return;
    }

    switch (userRole) {
        case 'paramedic':
            ws.send(JSON.stringify({
                type: 'emergencyLocationUpdates',
                data: {
                    emergencyId: emergencyRoom.emergencyId,
                    emergencyRoomId,
                    patientLocation: emergencyRoom.patientLocation,
                    message: 'Location update for paramedic.'
                },
                timestamp: new Date().toISOString()
            }));
            break;

        case 'patient':
            ws.send(JSON.stringify({
                type: 'emergencyLocationUpdates',
                data: {
                    emergencyId: emergencyRoom.emergencyId,
                    emergencyRoomId,
                    paramedicLocation: emergencyRoom.paramedicLocation,
                    message: 'Location update for patient.'
                },
                timestamp: new Date().toISOString()
            }));
            break;

        case 'Hospital':
        case 'nurse':
        case 'doctor':
        case 'admin':
            ws.send(JSON.stringify({
                type: 'emergencyLocationUpdates',
                data: {
                    emergencyId: emergencyRoom.emergencyId,
                    emergencyRoomId,
                    patientLocation: emergencyRoom.patientLocation,
                    paramedicLocation: emergencyRoom.paramedicLocation,
                    message: 'Location update for doctor, nurse and admin.'
                },
                timestamp: new Date().toISOString()
            }));
            break;

        default:
            ws.send(JSON.stringify({
                type: 'error',
                message: 'Not authorized role for location update',
                timestamp: new Date().toISOString()
            }));
            break;
    }
}

/**
 * Handle emergency status updates (progress, completion, etc.)
 */
// export async function handleEmergencyStatusUpdate(
//     ws: WebSocket,
//     data: {
//         emergencyId: string;
//         status: 'in_progress' | 'completed' | 'cancelled';
//         updatedBy: string;
//         updatedByRole: UserRole;
//         notes?: string;
//         completionDetails?: Record<string, any>;
//     }
// ): Promise<void> {
//     try {
//         const emergency = activeEmergencies.get(data.emergencyId);
//         if (!emergency) {
//             ws.send(JSON.stringify({
//                 type: 'error',
//                 message: 'Emergency not found',
//                 timestamp: new Date().toISOString()
//             }));
//             return;
//         }

//         const timestamp = new Date().toISOString();

//         // Update emergency status
//         emergency.status = data.status;
//         emergency.lastUpdated = timestamp;
//         emergency.lastUpdatedBy = data.updatedBy;
//         if (data.notes) {
//             emergency.progressNotes ??= [];
//             emergency.progressNotes.push({
//                 note: data.notes,
//                 addedBy: data.updatedBy,
//                 addedByRole: data.updatedByRole,
//                 timestamp
//             });
//         }

//         if (data.status === 'completed') {
//             emergency.completedAt = timestamp;
//             emergency.completionDetails = data.completionDetails;
//             // Remove from active emergencies after 24 hours for audit
//             setTimeout(() => {
//                 activeEmergencies.delete(data.emergencyId);
//             }, 24 * 60 * 60 * 1000);
//         }

//         // Notify all relevant parties
//         const updateMessage: WebSocketResponse = {
//             type: 'emergency_status_update',
//             data: {
//                 emergencyId: data.emergencyId,
//                 status: data.status,
//                 updatedBy: data.updatedBy,
//                 updatedByRole: data.updatedByRole,
//                 notes: data.notes,
//                 completionDetails: data.completionDetails
//             },
//             timestamp
//         };

//         // Notify patient
//         broadcastToUser(emergency.patientId, updateMessage);

//         // Notify hospital staff
//         broadcastToHospital(emergency.hospitalId, updateMessage);

//         // // Notify paramedics if relevant
//         // if (emergency.assignedRole === 'paramedic' || data.status === 'completed') {
//         //     broadcastToParamedics(emergency.hospitalId, updateMessage);
//         // }

//         // Confirm to updater
//         ws.send(JSON.stringify({
//             type: 'emergency_update_confirmed',
//             success: true,
//             data: {
//                 emergencyId: data.emergencyId,
//                 status: data.status
//             },
//             timestamp
//         }));

//         console.log(`Emergency ${data.emergencyId} status updated to ${data.status} by ${data.updatedByRole} ${data.updatedBy}`);

//     } catch (error) {
//         console.error('Error handling emergency status update:', error);
//         ws.send(JSON.stringify({
//             type: 'error',
//             message: 'Failed to update emergency status',
//             timestamp: new Date().toISOString()
//         }));
//     }
// }

/**
 * Get emergency queue for a hospital
 */
export function getEmergencyQueue(hospitalId: string): EmergencyData[] {
    return emergencyQueue.get(hospitalId) || [];
}

/**
 * Get active emergency by ID
 */
export function getEmergency(emergencyId: string): EmergencyData | undefined {
    return activeEmergencies.get(emergencyId);
}

/**
 * Get all active emergencies for a hospital
 */
export function getHospitalEmergencies(hospitalId: string): EmergencyData[] {
    return Array.from(activeEmergencies.values()).filter(e => e.hospitalId === hospitalId);
}
