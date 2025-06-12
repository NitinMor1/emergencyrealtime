import { Server } from 'http';
import WebSocket, { WebSocketServer } from 'ws';
import { handleWebSocketConnection } from './handlers/connectionHandler';
import { handleWebSocketMessage } from './handlers/messageHandler';
import { cleanupConnection } from './utils/cleanup';
import { initializeClientManager } from './core/clientManager';

// Initialize client management system
initializeClientManager();

// Create WebSocket server
export const createWebSocketServer = (server: Server) => {
    const wss = new WebSocketServer({ server });    // WebSocket connection handler
    wss.on('connection', (ws: WebSocket, req) => {
        console.log('A WebSocket user connected');

        // Handle the initial connection setup
        const { userId, hospitalId } = handleWebSocketConnection(ws, req);

        if (!userId) {
            return; // Connection was rejected
        }

        // Handle messages from the WebSocket client
        ws.on('message', async (message: string) => {
            try {
                const data = JSON.parse(message);
                await handleWebSocketMessage(ws, data, userId);
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        });

        // Handle WebSocket disconnection
        ws.on('close', () => {
            console.log('A WebSocket user disconnected');
            cleanupConnection(ws, userId, hospitalId);
        });
    });
};


