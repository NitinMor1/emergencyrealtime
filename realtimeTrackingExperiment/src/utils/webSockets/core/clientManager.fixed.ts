// Core client management system with role-based isolation
import WebSocket from 'ws';
import { ClientInfo, ConnectionStats, UserRole } from '../types';

// Enhanced clients map to store client information with roles
export const clients = new Map<string, ClientInfo[]>();
export const hospitalClients = new Map<string, ClientInfo[]>(); // hospitalId -> hospital staff clients
export const departmentClients = new Map<string, Map<string, ClientInfo[]>>(); // hospitalId -> department -> clients
export const paramedicsClients = new Map<string, ClientInfo[]>(); // hospitalId -> paramedic clients
export const patientClients = new Map<string, ClientInfo>(); // patientId -> patient client
export const activeChats = new Map<string, Set<string>>(); // chatRoomId -> Set of userIds
export const userLocations = new Map<string, {
    lat: number;
    lng: number;
    timestamp: string;
    accuracy?: number;
    speed?: number;
    heading?: number;
}>(); // userId -> location data

// Statistics tracking
let connectionStats: ConnectionStats = {
    totalConnections: 0,
    hospitals: 0,
    paramedics: 0,
    patients: 0,
    doctors: 0,
    nurses: 0,
    admins: 0,
    receptionists: 0,
    technicians: 0,
    pharmacists: 0,
    hospitalBreakdown: {},
    departmentBreakdown: {},
    specializationBreakdown: {}
};

// Helper functions to reduce complexity in addClient
function addToMainClients(clientInfo: ClientInfo): void {
    const { userId } = clientInfo;
    if (!clients.has(userId)) {
        clients.set(userId, []);
    }
    clients.get(userId)?.push(clientInfo);
}

function addPatientClient(clientInfo: ClientInfo): void {
    patientClients.set(clientInfo.userId, clientInfo);
}

function addParamedicClient(clientInfo: ClientInfo): void {
    const { hospitalId } = clientInfo;
    if (hospitalId) {
        if (!paramedicsClients.has(hospitalId)) {
            paramedicsClients.set(hospitalId, []);
        }
        paramedicsClients.get(hospitalId)?.push(clientInfo);
    }
}

function addHospitalStaffClient(clientInfo: ClientInfo): void {
    const { hospitalId, department } = clientInfo;
    if (!hospitalId) return;

    // Add to hospital clients
    if (!hospitalClients.has(hospitalId)) {
        hospitalClients.set(hospitalId, []);
    }
    hospitalClients.get(hospitalId)?.push(clientInfo);

    // Add to department clients if department is specified
    if (department) {
        if (!departmentClients.has(hospitalId)) {
            departmentClients.set(hospitalId, new Map());
        }
        const hospitalDepts = departmentClients.get(hospitalId)!;
        if (!hospitalDepts.has(department)) {
            hospitalDepts.set(department, []);
        }
        hospitalDepts.get(department)?.push(clientInfo);
    }
}

// Add client to appropriate maps based on role and context
export function addClient(clientInfo: ClientInfo): void {
    const { userId, role } = clientInfo;
    
    addToMainClients(clientInfo);
    
    // Role-based client mapping
    switch (role) {
        case 'patient':
            addPatientClient(clientInfo);
            break;
        case 'paramedic':
            addParamedicClient(clientInfo);
            break;
        default: // Hospital staff (doctor, nurse, admin, etc.)
            addHospitalStaffClient(clientInfo);
            break;
    }

    console.log(`Added ${role} client ${userId} to maps. Total connections: ${clients.get(userId)?.length}`);
}

// Helper functions to reduce complexity in removeClient
function removeFromPatientClients(userId: string): void {
    patientClients.delete(userId);
}

function removeFromParamedicClients(hospitalId: string, ws: WebSocket): void {
    const paramedicList = paramedicsClients.get(hospitalId);
    if (paramedicList) {
        const paramedicIndex = paramedicList.findIndex(client => client.ws === ws);
        if (paramedicIndex > -1) {
            paramedicList.splice(paramedicIndex, 1);
            if (paramedicList.length === 0) {
                paramedicsClients.delete(hospitalId);
            }
        }
    }
}

function removeFromHospitalClients(hospitalId: string, ws: WebSocket): void {
    const hospitalClientList = hospitalClients.get(hospitalId);
    if (hospitalClientList) {
        const hospitalIndex = hospitalClientList.findIndex(client => client.ws === ws);
        if (hospitalIndex > -1) {
            hospitalClientList.splice(hospitalIndex, 1);
            if (hospitalClientList.length === 0) {
                hospitalClients.delete(hospitalId);
            }
        }
    }
}

function removeFromDepartmentClients(hospitalId: string, department: string, ws: WebSocket): void {
    const hospitalDepts = departmentClients.get(hospitalId);
    if (hospitalDepts) {
        const deptClients = hospitalDepts.get(department);
        if (deptClients) {
            const deptIndex = deptClients.findIndex(client => client.ws === ws);
            if (deptIndex > -1) {
                deptClients.splice(deptIndex, 1);
                if (deptClients.length === 0) {
                    hospitalDepts.delete(department);
                    if (hospitalDepts.size === 0) {
                        departmentClients.delete(hospitalId);
                    }
                }
            }
        }
    }
}

function removeFromHospitalStaffClients(hospitalId: string, department: string | undefined, ws: WebSocket): void {
    removeFromHospitalClients(hospitalId, ws);
    if (department) {
        removeFromDepartmentClients(hospitalId, department, ws);
    }
}

// Remove client from all maps
export function removeClient(userId: string, ws: WebSocket): void {
    const userClients = clients.get(userId);
    if (!userClients) return;

    const clientIndex = userClients.findIndex(client => client.ws === ws);
    if (clientIndex === -1) return;

    const removedClient = userClients.splice(clientIndex, 1)[0];
    const { role, hospitalId, department } = removedClient;

    // Remove from role-specific maps
    switch (role) {
        case 'patient':
            removeFromPatientClients(userId);
            break;
        case 'paramedic':
            if (hospitalId) {
                removeFromParamedicClients(hospitalId, ws);
            }
            break;
        default: // Hospital staff
            if (hospitalId) {
                removeFromHospitalStaffClients(hospitalId, department, ws);
            }
            break;
    }

    // Clean up empty user entries
    if (userClients.length === 0) {
        clients.delete(userId);
    }

    console.log(`Removed ${role} client ${userId} from maps`);
}

// Helper function to count role statistics
function updateRoleStats(stats: ConnectionStats, role: UserRole): void {
    const roleKey = `${role}s` as keyof ConnectionStats;
    if (typeof stats[roleKey] === 'number') {
        (stats[roleKey] as number)++;
    }
}

// Helper function to update hospital breakdown
function updateHospitalBreakdown(stats: ConnectionStats, hospitalId: string): void {
    stats.hospitalBreakdown[hospitalId] = (stats.hospitalBreakdown[hospitalId] ?? 0) + 1;
}

// Helper function to update department breakdown
function updateDepartmentBreakdown(stats: ConnectionStats, hospitalId: string, department: string): void {
    if (!stats.departmentBreakdown[hospitalId]) {
        stats.departmentBreakdown[hospitalId] = {};
    }
    stats.departmentBreakdown[hospitalId][department] = 
        (stats.departmentBreakdown[hospitalId][department] ?? 0) + 1;
}

// Helper function to update specialization breakdown
function updateSpecializationBreakdown(stats: ConnectionStats, specialization: string): void {
    stats.specializationBreakdown[specialization] = 
        (stats.specializationBreakdown[specialization] ?? 0) + 1;
}

// Get connection statistics
export function getConnectionStats(): ConnectionStats {
    const stats: ConnectionStats = {
        totalConnections: 0,
        hospitals: 0,
        paramedics: 0,
        patients: 0,
        doctors: 0,
        nurses: 0,
        admins: 0,
        receptionists: 0,
        technicians: 0,
        pharmacists: 0,
        hospitalBreakdown: {},
        departmentBreakdown: {},
        specializationBreakdown: {}
    };

    clients.forEach((clientList) => {
        clientList.forEach((clientInfo) => {
            stats.totalConnections++;
            
            // Count by role
            updateRoleStats(stats, clientInfo.role);
            
            // Count by hospital
            if (clientInfo.hospitalId) {
                updateHospitalBreakdown(stats, clientInfo.hospitalId);
            }

            // Count by department
            if (clientInfo.hospitalId && clientInfo.department) {
                updateDepartmentBreakdown(stats, clientInfo.hospitalId, clientInfo.department);
            }

            // Count by specialization
            if (clientInfo.specialization) {
                updateSpecializationBreakdown(stats, clientInfo.specialization);
            }
        });
    });

    connectionStats = stats;
    return stats;
}

export function updateConnectionStats() {
    getConnectionStats();
}

export function logClientConnections() {
    const stats = getConnectionStats();
    console.log('=== WebSocket Connection Stats ===');
    console.log(`Total Connections: ${stats.totalConnections}`);
    console.log(`Hospitals: ${stats.hospitals}`);
    console.log(`Paramedics: ${stats.paramedics}`);
    console.log(`Patients: ${stats.patients}`);
    console.log(`Doctors: ${stats.doctors}`);
    console.log(`Nurses: ${stats.nurses}`);
    console.log(`Admins: ${stats.admins}`);
    console.log(`Receptionists: ${stats.receptionists}`);
    console.log(`Technicians: ${stats.technicians}`);
    console.log(`Pharmacists: ${stats.pharmacists}`);
    
    if (Object.keys(stats.hospitalBreakdown).length > 0) {
        console.log('Hospital Breakdown:');
        Object.entries(stats.hospitalBreakdown).forEach(([hospitalId, count]) => {
            console.log(`  Hospital ${hospitalId}: ${count} connections`);
        });
    }

    if (Object.keys(stats.departmentBreakdown).length > 0) {
        console.log('Department Breakdown:');
        Object.entries(stats.departmentBreakdown).forEach(([hospitalId, depts]) => {
            console.log(`  Hospital ${hospitalId}:`);
            Object.entries(depts).forEach(([dept, count]) => {
                console.log(`    ${dept}: ${count} connections`);
            });
        });
    }

    if (Object.keys(stats.specializationBreakdown).length > 0) {
        console.log('Specialization Breakdown:');
        Object.entries(stats.specializationBreakdown).forEach(([spec, count]) => {
            console.log(`  ${spec}: ${count} connections`);
        });
    }
    console.log('================================');
}

// Get clients by role
export function getClientsByRole(role: UserRole): ClientInfo[] {
    const roleClients: ClientInfo[] = [];
    clients.forEach((clientList) => {
        clientList.forEach((client) => {
            if (client.role === role) {
                roleClients.push(client);
            }
        });
    });
    return roleClients;
}

// Get clients by hospital
export function getHospitalClients(hospitalId: string): ClientInfo[] {
    return hospitalClients.get(hospitalId) ?? [];
}

// Get clients by department
export function getDepartmentClients(hospitalId: string, department: string): ClientInfo[] {
    const hospitalDepts = departmentClients.get(hospitalId);
    return hospitalDepts?.get(department) ?? [];
}

// Get paramedics for a hospital
export function getParamedicsForHospital(hospitalId: string): ClientInfo[] {
    return paramedicsClients.get(hospitalId) ?? [];
}

// Check if user is online
export function isUserOnline(userId: string): boolean {
    const userClients = clients.get(userId);
    return userClients ? userClients.some(client => client.ws.readyState === WebSocket.OPEN) : false;
}

// Generate unique IDs for chat rooms and emergencies (fixed deprecated substr)
export function generateChatRoomId(senderId: string, receiverId: string, hospitalId: string): string {
    const participants = [senderId, receiverId].sort((a, b) => a.localeCompare(b)).join('_');
    return `chat_${hospitalId}_${participants}`;
}

export function generateEmergencyId(): string {
    return `emergency_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

export function generateCallRoomId(patientId: string, doctorId: string): string {
    return `call_${patientId}_${doctorId}_${Date.now()}`;
}

// Get clients by hospital (alias for compatibility)
export function getClientsByHospital(hospitalId: string): ClientInfo[] {
    return getHospitalClients(hospitalId);
}

// Get clients by department (alias for compatibility)
export function getClientsByDepartment(hospitalId: string, department: string): ClientInfo[] {
    return getDepartmentClients(hospitalId, department);
}

// Get client info for a specific user and WebSocket connection
export function getClientInfo(userId: string, ws: WebSocket): ClientInfo | undefined {
    const userClients = clients.get(userId);
    return userClients?.find(client => client.ws === ws);
}

// Get all clients for a user
export function getUserClients(userId: string): ClientInfo[] {
    return clients.get(userId) ?? [];
}

// Get all active WebSocket connections for a user
export function getUserWebSockets(userId: string): WebSocket[] {
    const userClients = clients.get(userId);
    return userClients ? userClients.map(client => client.ws).filter(ws => ws.readyState === WebSocket.OPEN) : [];
}

/**
 * Initialize the client manager system
 * This function should be called when the WebSocket server starts
 */
export function initializeClientManager(): void {
    console.log('Initializing WebSocket client manager...');
    
    // Clear any existing data
    clients.clear();
    hospitalClients.clear();
    departmentClients.clear();
    paramedicsClients.clear();
    patientClients.clear();
    activeChats.clear();
    
    // Clear user locations only if it has data (fixes the "can only be empty" warning)
    if (userLocations.size > 0) {
        userLocations.clear();
    }
    
    // Reset stats
    connectionStats = {
        totalConnections: 0,
        hospitals: 0,
        paramedics: 0,
        patients: 0,
        doctors: 0,
        nurses: 0,
        admins: 0,
        receptionists: 0,
        technicians: 0,
        pharmacists: 0,
        hospitalBreakdown: {},
        departmentBreakdown: {},
        specializationBreakdown: {}
    };
    
    console.log('WebSocket client manager initialized successfully');
}

/**
 * Add a client to a chat room
 */
export function addClientToChat(chatRoomId: string, userId: string): void {
    if (!activeChats.has(chatRoomId)) {
        activeChats.set(chatRoomId, new Set());
    }
    activeChats.get(chatRoomId)?.add(userId);
}

/**
 * Remove a client from a chat room
 */
export function removeClientFromChat(chatRoomId: string, userId: string): void {
    const chatRoom = activeChats.get(chatRoomId);
    if (chatRoom) {
        chatRoom.delete(userId);
        if (chatRoom.size === 0) {
            activeChats.delete(chatRoomId);
        }
    }
}
