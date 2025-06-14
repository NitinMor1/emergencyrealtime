import WebSocket from 'ws';
import { removeClient, clients } from '../core/clientManager';
import { cleanupChatRooms } from '../handlers/chatHandler';
import { getUserNotifications } from '../models/notificationModel';

export function handleDisconnection(ws: WebSocket) {
    console.log('A WebSocket user disconnected');

    // Find and clean up the user associated with this WebSocket
    let userIdToCleanup: string | null = null;

    clients.forEach((clientList, userId) => {
        const clientIndex = clientList.findIndex(client => client.ws === ws);
        if (clientIndex !== -1) {
            userIdToCleanup = userId;
        }
    });

    if (userIdToCleanup) {
        removeClient(userIdToCleanup, ws);
        cleanupChatRooms(ws);
    }

    console.log('Cleanup completed for disconnected user');
}

export function cleanupConnection(ws: WebSocket, userId: string | null, hospitalId: string | null) {
    console.log(`Cleaning up connection for user: ${userId}, hospital: ${hospitalId}`);

    if (userId) {
        console.log("Notifications: ", getUserNotifications(userId))
    }


    if (userId) {
        removeClient(userId, ws);
        cleanupChatRooms(ws);
    }

    console.log('Cleanup completed');
}
