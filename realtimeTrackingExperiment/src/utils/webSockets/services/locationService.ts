import { LocationUpdate, ClientInfo } from '../types';
import { userLocations } from '../core/clientManager';
import { sendLocationUpdate, sendToUser, sendToRoleInHospital } from './messagingService';

// Active location tracking sessions
const activeLocationSessions = new Map<string, {
    userId: string;
    sessionId: string;
    startTime: string;
    lastUpdate: string;
    trackingType: 'emergency' | 'routine' | 'delivery';
    relatedId?: string; // emergency ID, delivery ID, etc.
    isActive: boolean;
}>();

// Location history for tracking
const locationHistory = new Map<string, Array<{
    lat: number;
    lng: number;
    timestamp: string;
    accuracy?: number;
    speed?: number;
    heading?: number;
}>>();

// Handle location updates with role-based isolation
export function handleLocationUpdate(
    userId: string,
    role: ClientInfo['role'],
    hospitalId: string,
    locationData: {
        lat: number;
        lng: number;
        accuracy?: number;
        speed?: number;
        heading?: number;
        status?: 'active' | 'idle' | 'busy' | 'emergency';
    },
    sessionId?: string
): boolean {
    try {
        const timestamp = new Date().toISOString();
        
        // Update current location
        userLocations.set(userId, {
            lat: locationData.lat,
            lng: locationData.lng,
            timestamp,
            accuracy: locationData.accuracy
        });

        // Add to location history
        if (!locationHistory.has(userId)) {
            locationHistory.set(userId, []);
        }
        
        const userHistory = locationHistory.get(userId)!;
        userHistory.push({
            lat: locationData.lat,
            lng: locationData.lng,
            timestamp,
            accuracy: locationData.accuracy,
            speed: locationData.speed,
            heading: locationData.heading
        });

        // Keep only last 100 location points
        if (userHistory.length > 100) {
            userHistory.shift();
        }

        // Update active session if exists
        if (sessionId) {
            const session = activeLocationSessions.get(sessionId);
            if (session && session.userId === userId) {
                session.lastUpdate = timestamp;
            }
        }

        // Send location update to relevant parties based on role and context
        const extendedLocationData = {
            ...locationData,
            timestamp,
            sessionId
        };

        let sentCount = 0;

        switch (role) {
            case 'paramedic':
                // Send to hospital emergency department and assigned patients
                sentCount = sendLocationUpdate(userId, role, hospitalId, extendedLocationData);
                
                // If this is emergency tracking, notify the specific patient
                if (sessionId) {
                    const session = activeLocationSessions.get(sessionId);
                    if (session && session.trackingType === 'emergency' && session.relatedId) {
                        sendToUser(session.relatedId, {
                            type: 'paramedic_location_update',
                            paramedicId: userId,
                            location: extendedLocationData,
                            emergencyId: session.relatedId
                        });
                    }
                }
                break;

            case 'patient':
                // Only send to hospital if in emergency or if tracking is active
                if (locationData.status === 'emergency' || sessionId) {
                    sentCount = sendLocationUpdate(userId, role, hospitalId, extendedLocationData);
                }
                break;

            case 'doctor':
            case 'nurse':
                // Send to emergency department and other relevant staff
                sentCount = sendLocationUpdate(userId, role, hospitalId, extendedLocationData);
                break;

            default:
                // For other roles, only send within hospital
                if (hospitalId) {
                    sentCount = sendLocationUpdate(userId, role, hospitalId, extendedLocationData);
                }
                break;
        }

        console.log(`Location update processed for ${role} ${userId} - sent to ${sentCount} clients`);
        return true;

    } catch (error) {
        console.error('Error handling location update:', error);
        return false;
    }
}

// Start location tracking session
export function startLocationTracking(
    userId: string,
    trackingType: 'emergency' | 'routine' | 'delivery',
    relatedId?: string // emergency ID, patient ID, etc.
): string {
    const sessionId = `location_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = new Date().toISOString();

    activeLocationSessions.set(sessionId, {
        userId,
        sessionId,
        startTime,
        lastUpdate: startTime,
        trackingType,
        relatedId,
        isActive: true
    });

    // Notify user about tracking session start
    sendToUser(userId, {
        type: 'location_tracking_started',
        sessionId,
        trackingType,
        relatedId,
        timestamp: startTime
    });

    console.log(`Location tracking started for user ${userId}, session: ${sessionId}, type: ${trackingType}`);
    return sessionId;
}

// Stop location tracking session
export function stopLocationTracking(sessionId: string, userId?: string): boolean {
    const session = activeLocationSessions.get(sessionId);
    if (!session || (userId && session.userId !== userId)) {
        return false;
    }

    session.isActive = false;
    const stopTime = new Date().toISOString();

    // Notify user about tracking session end
    sendToUser(session.userId, {
        type: 'location_tracking_stopped',
        sessionId,
        trackingType: session.trackingType,
        duration: new Date(stopTime).getTime() - new Date(session.startTime).getTime(),
        timestamp: stopTime
    });

    // If it was emergency tracking, notify relevant parties
    if (session.trackingType === 'emergency' && session.relatedId) {
        sendToUser(session.relatedId, {
            type: 'emergency_tracking_ended',
            paramedicId: session.userId,
            emergencyId: session.relatedId,
            timestamp: stopTime
        });
    }

    // Keep session for historical purposes but mark as inactive
    console.log(`Location tracking stopped for session ${sessionId}`);
    return true;
}

// Get current location of user
export function getCurrentLocation(userId: string) {
    return userLocations.get(userId);
}

// Get location history for user
export function getLocationHistory(userId: string, limit: number = 50) {
    const history = locationHistory.get(userId);
    if (!history) return [];
    
    return history.slice(-limit);
}

// Get active tracking sessions for user
export function getActiveTrackingSessions(userId: string) {
    const sessions: any[] = [];
    activeLocationSessions.forEach((session) => {
        if (session.userId === userId && session.isActive) {
            sessions.push(session);
        }
    });
    return sessions;
}

// Emergency location sharing (for panic situations)
export function shareEmergencyLocation(
    userId: string,
    role: ClientInfo['role'],
    hospitalId: string,
    emergencyData: {
        lat: number;
        lng: number;
        accuracy?: number;
        emergencyType: string;
        description?: string;
    }
): string {
    const sessionId = startLocationTracking(userId, 'emergency', userId);
    
    // Immediately send location to emergency contacts
    const message = {
        type: 'emergency_location_shared',
        userId,
        role,
        sessionId,
        location: {
            ...emergencyData,
            timestamp: new Date().toISOString()
        }
    };

    // Send to hospital emergency department
    if (hospitalId) {
        sendToRoleInHospital(hospitalId, 'doctor', message);
        sendToRoleInHospital(hospitalId, 'nurse', message);
        sendToRoleInHospital(hospitalId, 'paramedic', message);
    }

    console.log(`Emergency location shared by ${role} ${userId}`);
    return sessionId;
}

// Calculate distance between two locations
export function calculateDistance(
    lat1: number, 
    lon1: number, 
    lat2: number, 
    lon2: number
): number {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in kilometers
    return distance;
}

// Get nearby users within a certain radius
export function getNearbyUsers(
    centerLat: number,
    centerLng: number,
    radiusKm: number,
    roleFilter?: ClientInfo['role'][]
): Array<{userId: string, distance: number, location: any}> {
    const nearbyUsers: Array<{userId: string, distance: number, location: any}> = [];
    
    userLocations.forEach((location, userId) => {
        const distance = calculateDistance(centerLat, centerLng, location.lat, location.lng);
        
        if (distance <= radiusKm) {
            // Additional role filtering would require access to user role data
            nearbyUsers.push({
                userId,
                distance,
                location
            });
        }
    });

    return nearbyUsers.sort((a, b) => a.distance - b.distance);
}

// Cleanup old location data
export function cleanupLocationData(): void {
    const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
    
    // Remove old location entries
    userLocations.forEach((location, userId) => {
        if (location.timestamp < oneHourAgo) {
            userLocations.delete(userId);
        }
    });

    // Clean up location history
    locationHistory.forEach((history, userId) => {
        const recentHistory = history.filter(loc => loc.timestamp > oneHourAgo);
        if (recentHistory.length === 0) {
            locationHistory.delete(userId);
        } else {
            locationHistory.set(userId, recentHistory);
        }
    });

    // Clean up inactive sessions older than 1 day
    const oneDayAgo = new Date(Date.now() - 86400000).toISOString();
    activeLocationSessions.forEach((session, sessionId) => {
        if (!session.isActive && session.lastUpdate < oneDayAgo) {
            activeLocationSessions.delete(sessionId);
        }
    });
}

// Initialize cleanup interval
setInterval(cleanupLocationData, 600000); // Run every 10 minutes

// Export for external access
export { activeLocationSessions, locationHistory };
