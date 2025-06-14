// Broadcasting utilities for role-based WebSocket communication
import WebSocket from 'ws';
import { ClientInfo, UserRole, WebSocketResponse } from '../types';
import {
    getClientsByRole,
    getClientsByHospital,
    getClientsByDepartment,
    getUserWebSockets,
    paramedicsClients,
    patientClients
} from './clientManager';
import { markAsDelivered } from '../models/notificationModel';
import { clearAllUserNotifications, markAllAsDelivered } from '../services/notificationServices';


/**
 * Send message to specific WebSocket connections
 */
export function sendToClients(clients: ClientInfo[], message: WebSocketResponse): void {
    const messageStr = JSON.stringify(message);

    clients.forEach(client => {

        if (client.ws.readyState === WebSocket.OPEN) {
            try {
                client.ws.send(messageStr);
                console.log("clear emergency")
                clearAllUserNotifications(client.userId);
            } catch (error) {

                console.error(`Failed to send message to client ${client.userId}:`, error);
            }
        }
    });
}

/**
 * Send message to specific WebSocket connections (direct WebSocket array)
 */
export function sendToWebSockets(webSockets: WebSocket[], message: WebSocketResponse): void {
    const messageStr = JSON.stringify(message);

    webSockets.forEach(ws => {
        if (ws.readyState === WebSocket.OPEN) {
            try {
                ws.send(messageStr);
            } catch (error) {
                console.error('Failed to send message to WebSocket:', error);
            }
        }
    });
}

/**
 * Broadcast to all clients with specific roles
 */
export function broadcastToRoles(roles: UserRole[], message: WebSocketResponse, excludeUserId?: string): void {
    roles.forEach(role => {
        const clients = getClientsByRole(role);
        const filteredClients = excludeUserId
            ? clients.filter(client => client.userId !== excludeUserId)
            : clients;

        sendToClients(filteredClients, message);
    });
}

/**
 * Broadcast to all clients in a specific hospital
 */
export function broadcastToHospital(hospitalId: string, message: WebSocketResponse, excludeUserId?: string): void {
    const clients = getClientsByHospital(hospitalId);
    const filteredClients = excludeUserId
        ? clients.filter(client => client.userId !== excludeUserId)
        : clients;

    sendToClients(filteredClients, message);
}
export function broadcastToHospitalRoles(hospitalId: string, roles: UserRole[], message: WebSocketResponse, excludeUserId?: string): void {
    const clients = getClientsByHospital(hospitalId);
    const clientsHavingRoles = clients.filter(client => roles.includes(client.role));
    const filteredClients = excludeUserId
        ? clientsHavingRoles.filter(client => client.userId !== excludeUserId)
        : clientsHavingRoles;

    sendToClients(filteredClients, message);
}

/**
 * Broadcast to all clients in a specific department
 */
export function broadcastToDepartment(
    hospitalId: string,
    department: string,
    message: WebSocketResponse,
    excludeUserId?: string
): void {
    const clients = getClientsByDepartment(hospitalId, department);
    const filteredClients = excludeUserId
        ? clients.filter(client => client.userId !== excludeUserId)
        : clients;

    sendToClients(filteredClients, message);
}

/**
 * Broadcast to specific user (all their connections)
 */
export function broadcastToUser(userId: string, message: WebSocketResponse): void {
    const webSockets = getUserWebSockets(userId);
    sendToWebSockets(webSockets, message);
}

/**
 * Broadcast to multiple specific users
 */
export function broadcastToUsers(userIds: string[], message: WebSocketResponse): void {
    userIds.forEach(userId => {
        broadcastToUser(userId, message);
    });
}

/**
 * Broadcast to all paramedics assigned to a specific hospital
 */
export function broadcastToParamedics(hospitalId: string, message: WebSocketResponse, excludeUserId?: string): void {
    const clients = paramedicsClients.get(hospitalId) || [];
    const filteredClients = excludeUserId
        ? clients.filter(client => client.userId !== excludeUserId)
        : clients;

    sendToClients(filteredClients, message);
}

export function broadcastToParamedic(hospitalId: string, message: WebSocketResponse, id: string): void {
    const clients = paramedicsClients.get(hospitalId) || [];
    const filteredClients = clients.filter(client => client.userId == id);

    sendToClients(filteredClients, message);
}

/**
 * Broadcast to all patients
 */
export function broadcastToPatients(message: WebSocketResponse, excludeUserId?: string): void {
    const clients = Array.from(patientClients.values());
    const filteredClients = excludeUserId
        ? clients.filter(client => client.userId !== excludeUserId)
        : clients;

    sendToClients(filteredClients, message);
}

/**
 * Broadcast to all connected clients (global broadcast)
 */
export function broadcastToAll(message: WebSocketResponse, excludeUserId?: string): void {
    // Get all clients from all role-specific maps
    const allRoles: UserRole[] = ['hospital', 'paramedic', 'patient', 'doctor', 'nurse', 'admin', 'receptionist', 'technician', 'pharmacist'];
    broadcastToRoles(allRoles, message, excludeUserId);
}

/**
 * Send targeted notification based on user roles and context
 */
export function sendTargetedNotification(
    targetRoles: UserRole[],
    message: WebSocketResponse,
    hospitalId?: string,
    department?: string,
    excludeUserId?: string
): void {
    if (department && hospitalId) {
        // Broadcast to specific department
        broadcastToDepartment(hospitalId, department, message, excludeUserId);
    }

    else if (hospitalId) {
        // Broadcast to specific hospital
        const hospitalClients = getClientsByHospital(hospitalId);
        const targetClients = hospitalClients.filter(client => targetRoles.includes(client.role));
        const filteredClients = excludeUserId
            ? targetClients.filter(client => client.userId !== excludeUserId)
            : targetClients;

        sendToClients(filteredClients, message);
    }

    else {
        // Broadcast to roles globally
        broadcastToRoles(targetRoles, message, excludeUserId);
    }
}

/**
 * Send emergency alert to relevant staff
 */

export function sendEmergencyAlert(
    hospitalId: string,
    message: WebSocketResponse,
): void {
    // // Emergency-capable roles
    const emergencyRoles: UserRole[] = ['doctor', 'nurse', 'admin', 'hospital'];
    sendTargetedNotification(emergencyRoles, message, hospitalId);

}

/**
 * Send chat room notification
 */
export function sendChatRoomNotification(
    participantIds: string[],
    message: WebSocketResponse,
    excludeUserId?: string
): void {
    const targetUsers = excludeUserId
        ? participantIds.filter(id => id !== excludeUserId)
        : participantIds;

    broadcastToUsers(targetUsers, message);
}
