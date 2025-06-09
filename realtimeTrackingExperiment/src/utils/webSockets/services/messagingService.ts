import WebSocket from 'ws';
import { ClientInfo } from '../types';
import { 
    clients, 
    hospitalClients, 
    departmentClients 
} from '../core/clientManager';

// Send emergency request to specific hospital only
export function sendEmergencyToHospital(
    hospitalId: string,
    emergencyData: {
        patientId: string;
        patientName?: string;
        location: string;
        emergencyType: string;
        description: string;
        timestamp: string;
        [key: string]: any;
    }
) {
    const message = {
        type: 'emergency_request',
        hospitalId,
        data: emergencyData
    };

    const messageString = JSON.stringify(message);
    const hospitalClientList = hospitalClients.get(hospitalId);

    if (hospitalClientList && hospitalClientList.length > 0) {
        let sentCount = 0;
        hospitalClientList.forEach((clientInfo) => {
            if (clientInfo.ws.readyState === WebSocket.OPEN) {
                clientInfo.ws.send(messageString);
                sentCount++;
            }
        });
        
        console.log(`Emergency request sent to ${sentCount} hospital clients for hospital ${hospitalId}`);
        return sentCount;
    } else {
        console.log(`No active hospital clients found for hospital ${hospitalId}`);
        return 0;
    }
}

// Broadcast to all clients of a specific role
export function broadcastToRole(
    role: ClientInfo['role'],
    message: Object,
    excludeUserId?: string
) {
    const messageString = JSON.stringify(message);
    let sentCount = 0;

    clients.forEach((clientList, userId) => {
        if (excludeUserId && userId === excludeUserId) return;
        
        clientList.forEach((clientInfo) => {
            if (clientInfo.role === role && clientInfo.ws.readyState === WebSocket.OPEN) {
                clientInfo.ws.send(messageString);
                sentCount++;
            }
        });
    });

    console.log(`Broadcast sent to ${sentCount} ${role} clients`);
    return sentCount;
}

// Send message to specific user
export function sendToUser(
    userId: string,
    message: Object
) {
    const messageString = JSON.stringify(message);
    const userClients = clients.get(userId);
    
    if (userClients) {
        let sentCount = 0;
        userClients.forEach((clientInfo) => {
            if (clientInfo.ws.readyState === WebSocket.OPEN) {
                clientInfo.ws.send(messageString);
                sentCount++;
            }
        });
        
        console.log(`Message sent to ${sentCount} connections for user ${userId}`);
        return sentCount;
    } else {
        console.log(`No active connections found for user ${userId}`);
        return 0;
    }
}

// Send message to specific department in a hospital
export function sendToDepartment(
    hospitalId: string,
    department: string,
    message: Object
) {
    const messageString = JSON.stringify(message);
    let sentCount = 0;

    const hospitalDepts = departmentClients.get(hospitalId);
    if (hospitalDepts) {
        const deptClients = hospitalDepts.get(department);
        if (deptClients) {
            deptClients.forEach((clientInfo) => {
                if (clientInfo.ws.readyState === WebSocket.OPEN) {
                    clientInfo.ws.send(messageString);
                    sentCount++;
                }
            });
        }
    }

    console.log(`Message sent to ${sentCount} clients in ${department} department of hospital ${hospitalId}`);
    return sentCount;
}

// Send message to specific role in a specific hospital
export function sendToRoleInHospital(
    hospitalId: string,
    role: ClientInfo['role'],
    message: Object
) {
    const messageString = JSON.stringify(message);
    let sentCount = 0;

    const hospitalClientList = hospitalClients.get(hospitalId);
    if (hospitalClientList) {
        hospitalClientList.forEach((clientInfo) => {
            if (clientInfo.role === role && clientInfo.ws.readyState === WebSocket.OPEN) {
                clientInfo.ws.send(messageString);
                sentCount++;
            }
        });
    }

    console.log(`Message sent to ${sentCount} ${role} clients in hospital ${hospitalId}`);
    return sentCount;
}

// Send message to specific role in a specific department
export function sendToRoleInDepartment(
    hospitalId: string,
    department: string,
    role: ClientInfo['role'],
    message: Object
) {
    const messageString = JSON.stringify(message);
    let sentCount = 0;

    const hospitalDepts = departmentClients.get(hospitalId);
    if (hospitalDepts) {
        const deptClients = hospitalDepts.get(department);
        if (deptClients) {
            deptClients.forEach((clientInfo) => {
                if (clientInfo.role === role && clientInfo.ws.readyState === WebSocket.OPEN) {
                    clientInfo.ws.send(messageString);
                    sentCount++;
                }
            });
        }
    }

    console.log(`Message sent to ${sentCount} ${role} clients in ${department} department of hospital ${hospitalId}`);
    return sentCount;
}

// Send to paramedics in a specific hospital
export function sendToParamedicsInHospital(
    hospitalId: string,
    message: Object
) {
    return sendToRoleInHospital(hospitalId, 'paramedic', message);
}

// Send location updates only to relevant clients
export function sendLocationUpdate(
    senderId: string,
    senderRole: ClientInfo['role'],
    hospitalId: string,
    locationData: {
        lat: number;
        lng: number;
        timestamp: string;
        speed?: number;
        heading?: number;
        accuracy?: number;
        status?: 'active' | 'idle' | 'busy' | 'emergency';
    }
) {
    const message = {
        type: 'location_update',
        senderId,
        senderRole,
        hospitalId,
        data: locationData
    };

    const messageString = JSON.stringify(message);
    let sentCount = 0;

    // Send to hospital staff for this hospital (excluding sender)
    const hospitalClientList = hospitalClients.get(hospitalId);
    if (hospitalClientList) {
        hospitalClientList.forEach((clientInfo) => {
            if (clientInfo.userId !== senderId && clientInfo.ws.readyState === WebSocket.OPEN) {
                clientInfo.ws.send(messageString);
                sentCount++;
            }
        });
    }

    // If sender is a paramedic, also send to patients in active emergencies
    if (senderRole === 'paramedic') {
        // Logic to send to relevant patients would go here
        // This would require tracking active emergencies
    }

    console.log(`Location update sent to ${sentCount} relevant clients for hospital ${hospitalId}`);
    return sentCount;
}

// Send isolated chat messages between specific users
export function sendChatMessage(
    senderId: string,
    receiverId: string,
    hospitalId: string,
    messageData: {
        messageId: string;
        message: string;
        messageType: 'text' | 'image' | 'file' | 'location' | 'voice';
        timestamp: string;
        replyTo?: string;
        attachments?: Array<{
            type: string;
            url: string;
            name: string;
            size?: number;
        }>;
    }
) {
    const chatMessage = {
        type: 'receive_chat_message',
        senderId,
        receiverId,
        hospitalId,
        ...messageData
    };

    const messageString = JSON.stringify(chatMessage);
    let sentCount = 0;

    // Send to receiver only (isolated chat)
    const receiverClients = clients.get(receiverId);
    if (receiverClients) {
        receiverClients.forEach((clientInfo) => {
            if (clientInfo.ws.readyState === WebSocket.OPEN) {
                clientInfo.ws.send(messageString);
                sentCount++;
            }
        });
    }

    // Send confirmation to sender
    const senderClients = clients.get(senderId);
    if (senderClients) {
        senderClients.forEach((clientInfo) => {
            if (clientInfo.ws.readyState === WebSocket.OPEN) {
                clientInfo.ws.send(JSON.stringify({
                    ...chatMessage,
                    type: 'chat_message_sent',
                    isDelivered: sentCount > 0
                }));
            }
        });
    }

    console.log(`Chat message sent to ${sentCount} receiver connections`);
    return sentCount;
}
