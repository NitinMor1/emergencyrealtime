
import WebSocket from 'ws';
import { 
    IAmbulanceTracking, 
    IHospitalAmbulanceFleet, 
    IAmbulanceLocation,
    ITrackingRoom,
    AmbulanceTrackingStorage 
} from '../models/ambulanceTrackingModel';

const storage = AmbulanceTrackingStorage.getInstance();

/**
 * Get the fleet status for a specific hospital
 */
export function getHospitalFleetStatus(hospitalId: string): IHospitalAmbulanceFleet | null {
    try {
        const fleet = storage.getHospitalFleet(hospitalId);
        
        if (!fleet) {
            // Initialize a default fleet if none exists
            initializeDefaultFleet(hospitalId);
            return storage.getHospitalFleet(hospitalId) || null;
        }
        
        return fleet;
    } catch (error) {
        console.error('Error getting hospital fleet status:', error);
        return null;
    }
}

/**
 * Get active ambulances for a specific hospital
 */
export function getHospitalActiveAmbulances(hospitalId: string): IAmbulanceTracking[] {
    try {
        const fleet = storage.getHospitalFleet(hospitalId);
        
        if (!fleet) {
            return [];
        }
        
        return Array.from(fleet.ambulances.values()).filter(ambulance => ambulance.isActive);
    } catch (error) {
        console.error('Error getting hospital active ambulances:', error);
        return [];
    }
}

/**
 * Handle joining a tracking room for real-time ambulance tracking
 */
export function handleJoinTrackingRoom(
    ws: WebSocket, 
    trackingRoomId: string, 
    userId: string, 
    userType: string
): void {
    try {
        let room = storage.getTrackingRoom(trackingRoomId);
        
        // If room doesn't exist, create it
        if (!room) {
            // Extract emergency and hospital info from room ID if possible
            const [, emergencyId, hospitalId] = trackingRoomId.split('_');
            room = storage.createTrackingRoom(trackingRoomId, emergencyId || 'unknown', hospitalId || 'unknown');
        }
        
        // Add participant to room
        const success = storage.addParticipantToRoom(trackingRoomId, userId, userType, ws);
        
        if (success) {
            // Send confirmation to the user
            ws.send(JSON.stringify({
                type: 'trackingRoomJoined',
                success: true,
                data: {
                    roomId: trackingRoomId,
                    userId,
                    userType,
                    participantCount: room.participants.size
                },
                timestamp: new Date().toISOString()
            }));
            
            // Notify other participants about the new user
            broadcastToRoom(room, {
                type: 'participantJoined',
                data: {
                    roomId: trackingRoomId,
                    userId,
                    userType,
                    participantCount: room.participants.size
                },
                timestamp: new Date().toISOString()
            }, userId);
            
        } else {
            ws.send(JSON.stringify({
                type: 'error',
                message: 'Failed to join tracking room',
                timestamp: new Date().toISOString()
            }));
        }
    } catch (error) {
        console.error('Error handling join tracking room:', error);
        ws.send(JSON.stringify({
            type: 'error',
            message: 'Internal error while joining tracking room',
            timestamp: new Date().toISOString()
        }));
    }
}

/**
 * Update ambulance location and broadcast to tracking rooms
 */
export function updateAmbulanceLocation(
    ambulanceId: string, 
    location: IAmbulanceLocation, 
    hospitalId: string
): void {
    try {
        storage.updateAmbulanceLocation(ambulanceId, location);
        
        // Broadcast location update to relevant tracking rooms
        const rooms = storage.getAllTrackingRooms().filter(room => 
            room.ambulanceId === ambulanceId || room.hospitalId === hospitalId
        );
        
        rooms.forEach(room => {
            broadcastToRoom(room, {
                type: 'ambulanceLocationUpdate',
                data: {
                    ambulanceId,
                    location,
                    timestamp: new Date().toISOString()
                }
            });
        });
    } catch (error) {
        console.error('Error updating ambulance location:', error);
    }
}

/**
 * Add or update an ambulance in the hospital fleet
 */
export function addOrUpdateAmbulance(hospitalId: string, ambulance: IAmbulanceTracking): void {
    try {
        storage.addAmbulanceToFleet(hospitalId, ambulance);
        
        // Broadcast fleet update to relevant tracking rooms
        const rooms = storage.getAllTrackingRooms().filter(room => 
            room.hospitalId === hospitalId
        );
        
        rooms.forEach(room => {
            broadcastToRoom(room, {
                type: 'fleetUpdate',
                data: {
                    hospitalId,
                    ambulance,
                    timestamp: new Date().toISOString()
                }
            });
        });
    } catch (error) {
        console.error('Error adding/updating ambulance:', error);
    }
}

/**
 * Handle leaving a tracking room
 */
export function handleLeaveTrackingRoom(trackingRoomId: string, userId: string): void {
    try {
        const room = storage.getTrackingRoom(trackingRoomId);
        if (!room) return;
        
        const success = storage.removeParticipantFromRoom(trackingRoomId, userId);
        
        if (success) {
            // Notify remaining participants about the user leaving
            broadcastToRoom(room, {
                type: 'participantLeft',
                data: {
                    roomId: trackingRoomId,
                    userId,
                    participantCount: room.participants.size
                },
                timestamp: new Date().toISOString()
            });
        }
    } catch (error) {
        console.error('Error handling leave tracking room:', error);
    }
}

/**
 * Get all ambulances with their current status
 */
export function getAllAmbulancesStatus(hospitalId?: string): IAmbulanceTracking[] {
    try {
        if (hospitalId) {
            const fleet = storage.getHospitalFleet(hospitalId);
            return fleet ? Array.from(fleet.ambulances.values()) : [];
        }
        
        // For now, return empty array if no specific hospital is requested
        // TODO: Implement method to get all ambulances from all hospitals
        return [];
    } catch (error) {
        console.error('Error getting all ambulances status:', error);
        return [];
    }
}

/**
 * Initialize a default fleet for a hospital (for demo/testing purposes)
 */
function initializeDefaultFleet(hospitalId: string): void {
    const defaultAmbulances: IAmbulanceTracking[] = [
        {
            emergencyId: '',
            ambulanceId: `amb_${hospitalId}_001`,
            vehicleNumber: 'AMB-001',
            hospitalId,
            status: 'idle',
            isActive: true,
            capacity: 2,
            currentPatients: 0,
            equipment: ['defibrillator', 'oxygen', 'stretcher'],
            lastKnownLocation: {
                latitude: 40.7128,
                longitude: -74.0060,
                address: 'Hospital Base',
                timestamp: new Date(),
                status: 'idle'
            }
        },
        {
            emergencyId: '',
            ambulanceId: `amb_${hospitalId}_002`,
            vehicleNumber: 'AMB-002',
            hospitalId,
            status: 'idle',
            isActive: true,
            capacity: 2,
            currentPatients: 0,
            equipment: ['defibrillator', 'oxygen', 'stretcher', 'ventilator'],
            lastKnownLocation: {
                latitude: 40.7580,
                longitude: -73.9855,
                address: 'Hospital Base',
                timestamp: new Date(),
                status: 'idle'
            }
        }
    ];
    
    defaultAmbulances.forEach(ambulance => {
        storage.addAmbulanceToFleet(hospitalId, ambulance);
    });
}

/**
 * Broadcast a message to all participants in a tracking room
 */
function broadcastToRoom(room: ITrackingRoom, message: any, excludeUserId?: string): void {
    room.participants.forEach((participant, userId) => {
        if (excludeUserId && userId === excludeUserId) return;
        
        try {
            if (participant.ws && participant.ws.readyState === 1) { // WebSocket.OPEN
                participant.ws.send(JSON.stringify(message));
            }
        } catch (error) {
            console.error(`Error broadcasting to user ${userId}:`, error);
        }
    });
}

/**
 * Create a tracking room for an emergency
 */
export function createEmergencyTrackingRoom(
    emergencyId: string, 
    hospitalId: string, 
    ambulanceId?: string
): string {
    const roomId = `tracking_${emergencyId}_${hospitalId}`;
    storage.createTrackingRoom(roomId, emergencyId, hospitalId, ambulanceId);
    return roomId;
}

/**
 * Get tracking room information
 */
export function getTrackingRoomInfo(roomId: string): ITrackingRoom | null {
    return storage.getTrackingRoom(roomId) || null;
}
