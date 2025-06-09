import WebSocket from 'ws';
import { clients } from '../utils/utils';

export interface LoginData {
    userId: string;
    role?: string;
}

export function handleLogin(ws: WebSocket, data: LoginData) {
    console.log(`Login received for user: ${data.userId}`);
    
    ws.send(JSON.stringify({
        type: 'loginSuccess',
        userId: data.userId,
        role: data.role,
        message: 'Successfully logged in'
    }));
}

export function addUserConnection(userId: string, ws: WebSocket) {
    if (!clients.has(userId)) {
        clients.set(userId, new Set());
    }
    
    const userConnections = clients.get(userId);
    if (userConnections) {
        userConnections.add(ws);
        console.log(`Added WebSocket for user ${userId}. Total connections: ${userConnections.size}`);
    }
}

export function removeUserConnection(userId: string, ws: WebSocket) {
    const userConnections = clients.get(userId);
    if (userConnections) {
        userConnections.delete(ws);
        if (userConnections.size === 0) {
            clients.delete(userId);
        }
    }
}
