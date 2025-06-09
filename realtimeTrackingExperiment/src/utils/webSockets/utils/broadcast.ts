import WebSocket from 'ws';
import { 
    getHospitalClients, 
    patientClients, 
    getUserWebSockets,
    clients
} from '../core/clientManager';

// Broadcast message to a specific patient
export function broadcastToPatient(patientId: string, message: Object) {
    const patientClient = patientClients.get(patientId);
    
    if (patientClient && patientClient.ws.readyState === WebSocket.OPEN) {
        patientClient.ws.send(JSON.stringify(message));
    } else {
        console.log(`No WebSocket found for patient ${patientId}`);
    }
}

// Broadcast message to all clients in a hospital
export function broadcastToHospital(hospitalId: string, message: Object) {
    const messageString = JSON.stringify(message);
    const hospitalClientsList = getHospitalClients(hospitalId);
    
    hospitalClientsList.forEach((clientInfo) => {
        if (clientInfo.ws.readyState === WebSocket.OPEN) {
            clientInfo.ws.send(messageString);
        }
    });
}

// Broadcast message to multiple hospitals
export function broadcastToHospitals(hospitalIds: string[], message: Object) {
    hospitalIds.forEach(hospitalId => {
        broadcastToHospital(hospitalId, message);
    });
}

// Broadcast message to a specific user (all their active connections)
export function broadcastToUser(userId: string, message: Object) {
    const messageString = JSON.stringify(message);
    const userWebSockets = getUserWebSockets(userId);
    
    userWebSockets.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(messageString);
        }
    });
}

// Broadcast message to all connected clients
export function broadcastToAll(message: Object) {
    const messageString = JSON.stringify(message);
    
    clients.forEach((clientList) => {
        clientList.forEach((clientInfo) => {
            if (clientInfo.ws.readyState === WebSocket.OPEN) {
                clientInfo.ws.send(messageString);
            }
        });
    });
}