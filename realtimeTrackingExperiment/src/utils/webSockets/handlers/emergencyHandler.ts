// Emergency booking and dispatch system with role-based isolation
import WebSocket from 'ws';
import { EmergencyData, UserRole, Priority, WebSocketResponse } from '../types';
import { 
    sendEmergencyAlert,
    broadcastToHospital,
    broadcastToParamedics,
    broadcastToUser
} from '../core/broadcasting';
import { 
    generateEmergencyId
} from '../core/clientManager';

// Emergency state management
const activeEmergencies = new Map<string, EmergencyData>();
const emergencyQueue = new Map<string, EmergencyData[]>(); // hospitalId -> emergency queue
const dispatchedEmergencies = new Map<string, string>(); // emergencyId -> paramedicId

/**
 * Handle new emergency request from patient or paramedic
 */
export async function handleEmergencyRequest(
    ws: WebSocket,
    data: {
        patientId: string;
        hospitalId: string;
        location: { lat: number; lng: number };
        condition: string;
        priority: Priority;
        description?: string;
        vitals?: Record<string, any>;
        requestedBy: string; // userId who created the request
        requestedByRole: UserRole;
    }
): Promise<void> {
    try {
        const emergencyId = generateEmergencyId();
        const timestamp = new Date().toISOString();
        
        const emergencyData: EmergencyData = {
            emergencyId,
            patientId: data.patientId,
            hospitalId: data.hospitalId,
            location: data.location,
            condition: data.condition,
            priority: data.priority,
            status: 'pending',
            timestamp,
            description: data.description,
            vitals: data.vitals,
            requestedBy: data.requestedBy,
            requestedByRole: data.requestedByRole
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
            const priorityOrder = { 'critical': 0, 'high': 1, 'medium': 2, 'low': 3 };
            if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            }
            return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        });

        // Confirm to requester
        const confirmMessage: WebSocketResponse = {
            type: 'emergency_created',
            success: true,
            data: {
                emergencyId,
                status: 'pending',
                message: 'Emergency request created and dispatched to hospital staff'
            },
            timestamp
        };
        ws.send(JSON.stringify(confirmMessage));

        // Alert hospital staff
        const alertMessage: WebSocketResponse = {
            type: 'emergency_alert',
            data: emergencyData,
            timestamp
        };

        // Send to emergency-capable departments first
        const emergencyDepartments = ['emergency', 'icu', 'trauma', 'cardiology'];
        sendEmergencyAlert(data.hospitalId, alertMessage, emergencyDepartments);

        // Notify paramedics
        broadcastToParamedics(data.hospitalId, {
            type: 'emergency_available',
            data: emergencyData,
            timestamp
        });

        console.log(`Emergency ${emergencyId} created for hospital ${data.hospitalId} with priority ${data.priority}`);

    } catch (error) {
        console.error('Error handling emergency request:', error);
        ws.send(JSON.stringify({
            type: 'error',
            message: 'Failed to create emergency request',
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
        emergencyId: string;
        responderId: string;
        responderRole: UserRole;
        action: 'accept' | 'reject';
        estimatedArrival?: string;
        assignedDepartment?: string;
        notes?: string;
    }
): Promise<void> {
    try {
        const emergency = activeEmergencies.get(data.emergencyId);
        if (!emergency) {
            ws.send(JSON.stringify({
                type: 'error',
                message: 'Emergency not found',
                timestamp: new Date().toISOString()
            }));
            return;
        }

        const timestamp = new Date().toISOString();

        if (data.action === 'accept') {
            // Update emergency status
            emergency.status = 'accepted';
            emergency.assignedTo = data.responderId;
            emergency.assignedRole = data.responderRole;
            emergency.estimatedArrival = data.estimatedArrival;
            emergency.assignedDepartment = data.assignedDepartment;
            emergency.responseNotes = data.notes;
            emergency.acceptedAt = timestamp;

            // Remove from queue
            const queue = emergencyQueue.get(emergency.hospitalId);
            if (queue) {
                const index = queue.findIndex(e => e.emergencyId === data.emergencyId);
                if (index > -1) {
                    queue.splice(index, 1);
                }
            }

            // Notify patient
            broadcastToUser(emergency.patientId, {
                type: 'emergency_accepted',
                data: {
                    emergencyId: data.emergencyId,
                    assignedTo: data.responderId,
                    assignedRole: data.responderRole,
                    estimatedArrival: data.estimatedArrival,
                    hospitalId: emergency.hospitalId,
                    assignedDepartment: data.assignedDepartment,
                    notes: data.notes
                },
                timestamp
            });

            // Notify hospital staff
            broadcastToHospital(emergency.hospitalId, {
                type: 'emergency_status_update',
                data: {
                    emergencyId: data.emergencyId,
                    status: 'accepted',
                    assignedTo: data.responderId,
                    assignedRole: data.responderRole
                },
                timestamp
            }, data.responderId);

            console.log(`Emergency ${data.emergencyId} accepted by ${data.responderRole} ${data.responderId}`);        } else if (data.action === 'reject') {
            // Keep in queue but log the rejection
            emergency.rejections ??= [];
            emergency.rejections.push({
                rejectedBy: data.responderId,
                rejectedByRole: data.responderRole,
                reason: data.notes,
                timestamp
            });

            console.log(`Emergency ${data.emergencyId} rejected by ${data.responderRole} ${data.responderId}`);
        }

        // Confirm to responder
        ws.send(JSON.stringify({
            type: 'emergency_response_confirmed',
            success: true,
            data: {
                emergencyId: data.emergencyId,
                action: data.action
            },
            timestamp
        }));

    } catch (error) {
        console.error('Error handling emergency response:', error);
        ws.send(JSON.stringify({
            type: 'error',
            message: 'Failed to process emergency response',
            timestamp: new Date().toISOString()
        }));
    }
}

/**
 * Handle emergency status updates (progress, completion, etc.)
 */
export async function handleEmergencyStatusUpdate(
    ws: WebSocket,
    data: {
        emergencyId: string;
        status: 'in_progress' | 'completed' | 'cancelled';
        updatedBy: string;
        updatedByRole: UserRole;
        notes?: string;
        completionDetails?: Record<string, any>;
    }
): Promise<void> {
    try {
        const emergency = activeEmergencies.get(data.emergencyId);
        if (!emergency) {
            ws.send(JSON.stringify({
                type: 'error',
                message: 'Emergency not found',
                timestamp: new Date().toISOString()
            }));
            return;
        }

        const timestamp = new Date().toISOString();

        // Update emergency status
        emergency.status = data.status;
        emergency.lastUpdated = timestamp;
        emergency.lastUpdatedBy = data.updatedBy;
          if (data.notes) {
            emergency.progressNotes ??= [];
            emergency.progressNotes.push({
                note: data.notes,
                addedBy: data.updatedBy,
                addedByRole: data.updatedByRole,
                timestamp
            });
        }

        if (data.status === 'completed') {
            emergency.completedAt = timestamp;
            emergency.completionDetails = data.completionDetails;
            // Remove from active emergencies after 24 hours for audit
            setTimeout(() => {
                activeEmergencies.delete(data.emergencyId);
            }, 24 * 60 * 60 * 1000);
        }

        // Notify all relevant parties
        const updateMessage: WebSocketResponse = {
            type: 'emergency_status_update',
            data: {
                emergencyId: data.emergencyId,
                status: data.status,
                updatedBy: data.updatedBy,
                updatedByRole: data.updatedByRole,
                notes: data.notes,
                completionDetails: data.completionDetails
            },
            timestamp
        };

        // Notify patient
        broadcastToUser(emergency.patientId, updateMessage);

        // Notify hospital staff
        broadcastToHospital(emergency.hospitalId, updateMessage);

        // Notify paramedics if relevant
        if (emergency.assignedRole === 'paramedic' || data.status === 'completed') {
            broadcastToParamedics(emergency.hospitalId, updateMessage);
        }

        // Confirm to updater
        ws.send(JSON.stringify({
            type: 'emergency_update_confirmed',
            success: true,
            data: {
                emergencyId: data.emergencyId,
                status: data.status
            },
            timestamp
        }));

        console.log(`Emergency ${data.emergencyId} status updated to ${data.status} by ${data.updatedByRole} ${data.updatedBy}`);

    } catch (error) {
        console.error('Error handling emergency status update:', error);
        ws.send(JSON.stringify({
            type: 'error',
            message: 'Failed to update emergency status',
            timestamp: new Date().toISOString()
        }));
    }
}

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
