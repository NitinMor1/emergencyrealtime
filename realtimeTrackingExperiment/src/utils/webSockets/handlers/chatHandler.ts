import WebSocket from 'ws';
import { sendChat, markMessageAsRead, markMessageAsDelivered, deleteMessage, updateUserPresence } from '../../../features/chats/chatController';
import { ITypingStatus } from '../../../features/chats/chatsModel';
import { getUserWebSockets } from '../core/clientManager';
import { broadcastToHospital } from '../core/broadcasting';

// Store chat rooms with their participants
export const chatRooms = new Map<string, Set<WebSocket>>();
// Store typing status for each chat room
export const typingStatus = new Map<string, ITypingStatus[]>();
// Store user presence
export const userPresence = new Map<string, { isOnline: boolean; lastSeen: string; }>();

// Generate a unique chat room ID based on participants and hospitalId
export function generateChatRoomId(senderId: string, receiverId: string, hospitalId: string): string {
    const participants = [senderId, receiverId].sort((a, b) => a.localeCompare(b)).join('_');
    return `chat_${hospitalId}_${participants}`;
}

export async function handleEmergencyRequest(
    emergencyId: string,
    patientId: string,
    patientPhoneNumber: string,
    hospitalId: string,
    patientWs: WebSocket,
    problem: string
) {
    try {
        // Broadcast this emergency request to particular hospital using new system
        const emergencyMessage = {
            type: 'emergency_request',
            data: {
                emergencyId,
                patientId,
                patientPhoneNumber,
                hospitalId,
                problem,
                message: `Emergency request from patient ${patientId} with phone number ${patientPhoneNumber}.`
            },
            timestamp: new Date().toISOString()
        };
        
        // Use the new broadcasting system to notify hospital staff
        broadcastToHospital(hospitalId, emergencyMessage);

    } catch (error) {
        console.error('Error handling emergency request:', error);
    }
}

export async function handleSendMessage(
    senderId: string,
    receiverId: string,
    message: string,
    hospitalId: string,
    senderWs: WebSocket,
    messageType: 'text' | 'image' | 'file' = 'text',
    replyTo?: string
) {
    const chatRoomId = generateChatRoomId(senderId, receiverId, hospitalId);
    
    // Create the chat room if it doesn't exist
    if (!chatRooms.has(chatRoomId)) {
        chatRooms.set(chatRoomId, new Set());
    }

    // Add the sender to the chat room
    chatRooms.get(chatRoomId)?.add(senderWs);

    try {
        // Save the message to the database
        const savedMessage = await sendChat(hospitalId, message, senderId, receiverId, messageType, replyTo);

        const chatMessage = {
            type: 'receiveMessage',
            messageId: savedMessage._id,
            senderId,
            receiverId,
            message,
            messageType,
            timestamp: savedMessage.timestamp,
            isRead: false,
            isDelivered: false,
            chatRoomId,
            replyTo
        };

        // Send to sender (confirmation)
        senderWs.send(JSON.stringify({
            ...chatMessage,
            type: 'messageSent',
            isDelivered: true
        }));        // Send to receiver if online
        const receiverWebSockets = getUserWebSockets(receiverId);
        if (receiverWebSockets.length > 0) {
            receiverWebSockets.forEach((receiverWs: WebSocket) => {
                if (receiverWs.readyState === WebSocket.OPEN) {
                    receiverWs.send(JSON.stringify(chatMessage));
                }
            });
            
            // Mark as delivered
            await markMessageAsDelivered(hospitalId, savedMessage._id);
        }

    } catch (error) {
        console.error('Error handling chat message:', error);
        senderWs.send(JSON.stringify({
            type: 'error',
            message: 'Failed to send message'
        }));
    }
}

export async function handleMarkAsRead(
    messageId: string,
    userId: string,
    hospitalId: string,
    senderId: string,
    ws: WebSocket
) {
    try {
        await markMessageAsRead(hospitalId, messageId, userId);
          // Notify sender that message was read
        const senderWebSockets = getUserWebSockets(senderId);
        senderWebSockets.forEach((senderWs: WebSocket) => {
            if (senderWs.readyState === WebSocket.OPEN) {
                senderWs.send(JSON.stringify({
                    type: 'messageRead',
                    messageId,
                    readBy: userId,
                    timestamp: new Date().toISOString()
                }));
            }
        });

        // Confirm to the reader
        ws.send(JSON.stringify({
            type: 'messageMarkedAsRead',
            messageId,
            success: true
        }));

    } catch (error) {
        console.error('Error marking message as read:', error);
        ws.send(JSON.stringify({
            type: 'error',
            message: 'Failed to mark message as read'
        }));
    }
}

export async function handleDeleteMessage(
    messageId: string,
    userId: string,
    hospitalId: string,
    deleteForAll: boolean,
    chatRoomId: string,
    ws: WebSocket
) {
    try {
        await deleteMessage(hospitalId, messageId, userId, deleteForAll);
        
        const deleteNotification = {
            type: 'messageDeleted',
            messageId,
            deletedBy: userId,
            deleteForAll,
            timestamp: new Date().toISOString()
        };

        if (deleteForAll) {
            // Notify all participants in the chat room
            const room = chatRooms.get(chatRoomId);
            if (room) {
                room.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify(deleteNotification));
                    }
                });
            }
        } else {
            // Only confirm to the deleter
            ws.send(JSON.stringify(deleteNotification));
        }

    } catch (error) {
        console.error('Error deleting message:', error);
        ws.send(JSON.stringify({
            type: 'error',
            message: 'Failed to delete message'
        }));
    }
}

export function handleTypingStatus(
    chatRoomId: string,
    userId: string,
    isTyping: boolean,
    ws: WebSocket
) {
    const typingData: ITypingStatus = {
        chatRoomId,
        userId,
        isTyping,
        timestamp: new Date().toISOString()
    };

    // Update typing status
    if (!typingStatus.has(chatRoomId)) {
        typingStatus.set(chatRoomId, []);
    }

    const roomTypingStatus = typingStatus.get(chatRoomId)!;
    const existingIndex = roomTypingStatus.findIndex(status => status.userId === userId);

    if (existingIndex !== -1) {
        if (isTyping) {
            roomTypingStatus[existingIndex] = typingData;
        } else {
            roomTypingStatus.splice(existingIndex, 1);
        }
    } else if (isTyping) {
        roomTypingStatus.push(typingData);
    }

    // Broadcast typing status to other participants in the room
    const room = chatRooms.get(chatRoomId);
    if (room) {
        room.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                    type: 'typingStatus',
                    ...typingData
                }));
            }
        });
    }

    // Auto-clear typing status after 3 seconds
    if (isTyping) {
        setTimeout(() => {
            handleTypingStatus(chatRoomId, userId, false, ws);
        }, 3000);
    }
}

export async function handleUserOnline(userId: string, hospitalId: string, ws: WebSocket) {
    try {
        await updateUserPresence(hospitalId, userId, true);
        userPresence.set(userId, { isOnline: true, lastSeen: new Date().toISOString() });
        
        // Broadcast user online status
        broadcastUserPresence(userId, true, hospitalId);
        
    } catch (error) {
        console.error('Error updating user online status:', error);
    }
}

export async function handleUserOffline(userId: string, hospitalId: string) {
    try {
        await updateUserPresence(hospitalId, userId, false);
        userPresence.set(userId, { isOnline: false, lastSeen: new Date().toISOString() });
        
        // Broadcast user offline status
        broadcastUserPresence(userId, false, hospitalId);
        
    } catch (error) {
        console.error('Error updating user offline status:', error);
    }
}

function broadcastUserPresence(userId: string, isOnline: boolean, hospitalId: string) {
    const timestamp = new Date().toISOString();
    const presenceMessage = {
        type: 'userPresence',
        data: {
            userId,
            isOnline,
            lastSeen: timestamp,
            hospitalId
        },
        timestamp
    };

    // Broadcast to all users in the same hospital using the new broadcasting system
    broadcastToHospital(hospitalId, presenceMessage, userId);
}

export function addUserToChatRoom(chatRoomId: string, ws: WebSocket) {
    if (!chatRooms.has(chatRoomId)) {
        chatRooms.set(chatRoomId, new Set());
    }
    chatRooms.get(chatRoomId)?.add(ws);
}

export function cleanupChatRooms(ws: WebSocket) {
    // Remove the client from all chat rooms
    for (const [chatRoomId, clientsInRoom] of chatRooms.entries()) {
        clientsInRoom.delete(ws);
        if (clientsInRoom.size === 0) {
            chatRooms.delete(chatRoomId);
            typingStatus.delete(chatRoomId);
        }
    }
}
