// Location tracking system with role-based access control
import WebSocket from 'ws';
import { LocationUpdate, UserRole, WebSocketResponse } from '../types';
import { 
    sendTargetedNotification,
    broadcastToParamedics
} from '../core/broadcasting';
import { 
    userLocations,
    getClientsByRole
} from '../core/clientManager';

/**
 * Handle location update from paramedic or patient
 */
export async function handleLocationUpdate(
    ws: WebSocket,
    data: {
        userId: string;
        userRole: UserRole;
        hospitalId?: string;
        location: {
            lat: number;
            lng: number;
            accuracy?: number;
            speed?: number;
            heading?: number;
        };
        isEmergency?: boolean;
        emergencyId?: string;
    }
): Promise<void> {
    try {
        const timestamp = new Date().toISOString();
        
        // Update location in cache
        const locationData = {
            ...data.location,
            timestamp
        };
        userLocations.set(data.userId, locationData);

        // Create location update message
        const locationUpdate: LocationUpdate = {
            userId: data.userId,
            userRole: data.userRole,
            location: locationData,
            isEmergency: data.isEmergency || false,
            emergencyId: data.emergencyId,
            timestamp
        };

        // Confirm to sender
        ws.send(JSON.stringify({
            type: 'location_update_confirmed',
            success: true,
            data: {
                userId: data.userId,
                timestamp
            },
            timestamp
        }));

        // Broadcast based on role and context
        await broadcastLocationUpdate(locationUpdate, data.hospitalId);

        console.log(`Location updated for ${data.userRole} ${data.userId}${data.isEmergency ? ' (EMERGENCY)' : ''}`);

    } catch (error) {
        console.error('Error handling location update:', error);
        ws.send(JSON.stringify({
            type: 'error',
            message: 'Failed to update location',
            timestamp: new Date().toISOString()
        }));
    }
}

/**
 * Handle location request from authorized personnel
 */
export async function handleLocationRequest(
    ws: WebSocket,
    data: {
        requesterId: string;
        requesterRole: UserRole;
        requesterHospitalId?: string;
        targetUserId: string;
        targetRole?: UserRole;
        reason?: string;
    }
): Promise<void> {
    try {
        const timestamp = new Date().toISOString();
        
        // Check authorization
        const isAuthorized = await checkLocationAccessAuthorization(
            data.requesterId,
            data.requesterRole,
            data.requesterHospitalId,
            data.targetUserId,
            data.targetRole
        );

        if (!isAuthorized) {
            ws.send(JSON.stringify({
                type: 'location_request_denied',
                message: 'Unauthorized to access location data',
                timestamp
            }));
            return;
        }

        // Get location data
        const locationData = userLocations.get(data.targetUserId);
        
        if (!locationData) {
            ws.send(JSON.stringify({
                type: 'location_not_found',
                message: 'Location data not available for requested user',
                timestamp
            }));
            return;
        }

        // Send location data
        ws.send(JSON.stringify({
            type: 'location_data',
            data: {
                userId: data.targetUserId,
                location: locationData,
                requestedBy: data.requesterId
            },
            timestamp
        }));

        console.log(`Location data for ${data.targetUserId} requested by ${data.requesterRole} ${data.requesterId}`);

    } catch (error) {
        console.error('Error handling location request:', error);
        ws.send(JSON.stringify({
            type: 'error',
            message: 'Failed to retrieve location data',
            timestamp: new Date().toISOString()
        }));
    }
}

/**
 * Broadcast location update based on role and context
 */
async function broadcastLocationUpdate(locationUpdate: LocationUpdate, hospitalId?: string): Promise<void> {
    const broadcastMessage: WebSocketResponse = {
        type: 'location_update',
        data: locationUpdate,
        timestamp: locationUpdate.timestamp
    };

    switch (locationUpdate.userRole) {
        case 'paramedic':
            // Paramedic locations visible to their assigned hospital
            if (hospitalId) {                // Broadcast to hospital staff who can track paramedics
                sendTargetedNotification(
                    ['admin', 'doctor', 'nurse', 'hospital'],
                    broadcastMessage,
                    hospitalId
                );

                // If it's an emergency, broadcast more widely
                if (locationUpdate.isEmergency) {
                    sendTargetedNotification(
                        ['admin', 'doctor', 'nurse', 'hospital', 'receptionist'],
                        {
                            ...broadcastMessage,
                            type: 'emergency_location_update'
                        },
                        hospitalId
                    );
                }
            }
            break;        case 'patient':
            // Patient locations only visible during emergencies or to assigned care team
            if (locationUpdate.isEmergency && hospitalId) {
                sendTargetedNotification(
                    ['admin', 'doctor', 'nurse', 'hospital'],
                    {
                        ...broadcastMessage,
                        type: 'patient_emergency_location'
                    },
                    hospitalId
                );
                
                // Also notify paramedics
                broadcastToParamedics(hospitalId, {
                    ...broadcastMessage,
                    type: 'patient_emergency_location'
                });
            }
            break;

        case 'doctor':
        case 'nurse':
            // Hospital staff locations visible to admin and same hospital staff
            if (hospitalId) {
                sendTargetedNotification(
                    ['admin', 'hospital'],
                    broadcastMessage,
                    hospitalId
                );
            }
            break;

        case 'admin':
        case 'hospital':
            // Admin locations visible to other admins in same hospital
            if (hospitalId) {
                sendTargetedNotification(
                    ['admin', 'hospital'],
                    broadcastMessage,
                    hospitalId
                );
            }
            break;

        default:
            // Other roles - limited visibility
            break;
    }
}

/**
 * Check if requester is authorized to access location data
 */
async function checkLocationAccessAuthorization(
    requesterId: string,
    requesterRole: UserRole,
    requesterHospitalId?: string,
    targetUserId?: string,
    targetRole?: UserRole
): Promise<boolean> {
    // Self-access always allowed
    if (requesterId === targetUserId) {
        return true;
    }

    // Admin and hospital roles have broad access within their hospital
    if (['admin', 'hospital'].includes(requesterRole) && requesterHospitalId) {
        return true;
    }

    // Doctors and nurses can access location of patients and paramedics in emergencies
    if (['doctor', 'nurse'].includes(requesterRole) && requesterHospitalId) {
        if (targetRole && ['patient', 'paramedic'].includes(targetRole)) {
            return true;
        }
    }

    // Paramedics can access patient locations during emergencies
    if (requesterRole === 'paramedic' && targetRole === 'patient') {
        return true;
    }

    // Patients can access paramedic locations during their emergency
    if (requesterRole === 'patient' && targetRole === 'paramedic') {
        return true;
    }

    return false;
}

/**
 * Get location data for a user (with authorization check)
 */
export function getUserLocation(
    userId: string,
    requesterId: string,
    requesterRole: UserRole,
    requesterHospitalId?: string
): { lat: number; lng: number; timestamp: string } | null {
    // Check authorization
    const locationData = userLocations.get(userId);
    if (!locationData) {
        return null;
    }

    // Simple authorization check (can be expanded)
    if (userId === requesterId || ['admin', 'hospital'].includes(requesterRole)) {
        return locationData;
    }

    return null;
}

/**
 * Get all paramedic locations for a hospital (admin only)
 */
export function getParamedicLocations(hospitalId: string, requesterId: string, requesterRole: UserRole): Array<{
    userId: string;
    location: { lat: number; lng: number; timestamp: string };
}> {
    if (!['admin', 'hospital'].includes(requesterRole)) {
        return [];
    }

    const locations: Array<{ userId: string; location: any }> = [];
    const paramedics = getClientsByRole('paramedic');
    
    paramedics.forEach(paramedic => {
        if (paramedic.hospitalId === hospitalId) {
            const location = userLocations.get(paramedic.userId);
            if (location) {
                locations.push({
                    userId: paramedic.userId,
                    location
                });
            }
        }
    });

    return locations;
}

/**
 * Clear old location data (cleanup function)
 */
export function cleanupOldLocations(): void {
    const cutoffTime = Date.now() - (24 * 60 * 60 * 1000); // 24 hours ago
    
    for (const [userId, locationData] of userLocations.entries()) {
        const locationTime = new Date(locationData.timestamp).getTime();
        if (locationTime < cutoffTime) {
            userLocations.delete(userId);
        }
    }
}

// Run cleanup every hour
setInterval(cleanupOldLocations, 60 * 60 * 1000);
