import { ChatMessage, ClientInfo } from '../types';
import { generateChatRoomId, activeChats } from '../core/clientManager';
import { sendChatMessage, sendToUser } from './messagingService';

// Store typing status for each chat room
const typingStatus = new Map<string, Array<{
    userId: string;
    isTyping: boolean;
    timestamp: string;
}>>();

// Store user presence
const userPresence = new Map<string, {
    isOnline: boolean;
    lastSeen: string;
    status?: 'available' | 'busy' | 'away' | 'do_not_disturb';
}>();

// Handle sending chat messages with isolation
export async function handleSendChatMessage(
    senderId: string,
    receiverId: string,
    message: string,
    hospitalId: string,
    messageType: 'text' | 'image' | 'file' | 'location' | 'voice' = 'text',
    replyTo?: string,
    attachments?: Array<{
        type: string;
        url: string;
        name: string;
        size?: number;
    }>
): Promise<string | null> {
    try {
        const chatRoomId = generateChatRoomId(senderId, receiverId, hospitalId);
        const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const timestamp = new Date().toISOString();

        // Add users to active chat tracking
        if (!activeChats.has(chatRoomId)) {
            activeChats.set(chatRoomId, new Set());
        }
        activeChats.get(chatRoomId)?.add(senderId);
        activeChats.get(chatRoomId)?.add(receiverId);

        // Create chat message object
        const chatMessageData = {
            messageId,
            message,
            messageType,
            timestamp,
            replyTo,
            attachments
        };

        // Here you would typically save to database
        // const savedMessage = await saveChatToDatabase(hospitalId, senderId, receiverId, chatMessageData);

        // Send the message using the messaging service
        const sentCount = sendChatMessage(senderId, receiverId, hospitalId, chatMessageData);

        // Mark as delivered if sent successfully
        if (sentCount > 0) {
            // Update delivery status in database
            // await markMessageAsDelivered(messageId);
        }

        console.log(`Chat message sent from ${senderId} to ${receiverId} in hospital ${hospitalId}`);
        return messageId;

    } catch (error) {
        console.error('Error sending chat message:', error);
        return null;
    }
}

// Handle marking messages as read
export async function handleMarkAsRead(
    messageId: string,
    userId: string,
    senderId: string,
    hospitalId: string
): Promise<boolean> {
    try {
        // Here you would update the database
        // await markMessageAsReadInDatabase(messageId, userId);

        // Notify sender that message was read
        sendToUser(senderId, {
            type: 'message_read_receipt',
            messageId,
            readBy: userId,
            timestamp: new Date().toISOString()
        });

        console.log(`Message ${messageId} marked as read by ${userId}`);
        return true;

    } catch (error) {
        console.error('Error marking message as read:', error);
        return false;
    }
}

// Handle typing status
export function handleTypingStatus(
    chatRoomId: string,
    userId: string,
    isTyping: boolean,
    receiverId: string
): void {
    const timestamp = new Date().toISOString();
    
    // Update typing status
    if (!typingStatus.has(chatRoomId)) {
        typingStatus.set(chatRoomId, []);
    }
    
    const chatTypingStatus = typingStatus.get(chatRoomId)!;
    const existingIndex = chatTypingStatus.findIndex(status => status.userId === userId);
    
    if (existingIndex > -1) {
        chatTypingStatus[existingIndex] = { userId, isTyping, timestamp };
    } else {
        chatTypingStatus.push({ userId, isTyping, timestamp });
    }

    // Send typing status to receiver only
    sendToUser(receiverId, {
        type: 'typing_status',
        chatRoomId,
        userId,
        isTyping,
        timestamp
    });

    // Clean up old typing statuses (older than 10 seconds)
    const tenSecondsAgo = new Date(Date.now() - 10000).toISOString();
    typingStatus.set(chatRoomId, chatTypingStatus.filter(status => 
        status.timestamp > tenSecondsAgo || status.userId === userId
    ));
}

// Handle user online status
export function handleUserOnline(
    userId: string, 
    status: 'available' | 'busy' | 'away' | 'do_not_disturb' = 'available'
): void {
    userPresence.set(userId, {
        isOnline: true,
        lastSeen: new Date().toISOString(),
        status
    });

    // Notify contacts about status change
    broadcastUserPresence(userId, true, status);
}

// Handle user offline status
export function handleUserOffline(userId: string): void {
    const currentPresence = userPresence.get(userId);
    if (currentPresence) {
        currentPresence.isOnline = false;
        currentPresence.lastSeen = new Date().toISOString();
        userPresence.set(userId, currentPresence);
    }

    // Notify contacts about status change
    broadcastUserPresence(userId, false);
}

// Broadcast user presence to their active chats
function broadcastUserPresence(
    userId: string, 
    isOnline: boolean, 
    status?: string
): void {
    const presenceUpdate = {
        type: 'user_presence_update',
        userId,
        isOnline,
        status,
        timestamp: new Date().toISOString()
    };

    // Find all chat rooms this user is part of
    activeChats.forEach((participants, chatRoomId) => {
        if (participants.has(userId)) {
            // Send presence update to other participants
            participants.forEach(participantId => {
                if (participantId !== userId) {
                    sendToUser(participantId, presenceUpdate);
                }
            });
        }
    });
}

// Delete message (for sender or for all)
export async function handleDeleteMessage(
    messageId: string,
    userId: string,
    deleteForAll: boolean,
    chatRoomId: string,
    receiverId?: string
): Promise<boolean> {
    try {
        // Here you would update the database
        // await deleteMessageFromDatabase(messageId, userId, deleteForAll);

        if (deleteForAll && receiverId) {
            // Notify receiver about message deletion
            sendToUser(receiverId, {
                type: 'message_deleted',
                messageId,
                chatRoomId,
                deletedBy: userId,
                timestamp: new Date().toISOString()
            });
        }

        console.log(`Message ${messageId} deleted by ${userId} (deleteForAll: ${deleteForAll})`);
        return true;

    } catch (error) {
        console.error('Error deleting message:', error);
        return false;
    }
}

// Get user presence
export function getUserPresence(userId: string) {
    return userPresence.get(userId);
}

// Get typing status for a chat room
export function getChatTypingStatus(chatRoomId: string) {
    return typingStatus.get(chatRoomId) || [];
}

// Clean up inactive chats
export function cleanupInactiveChats(): void {
    const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
    
    // Clean up typing statuses
    typingStatus.forEach((statusList, chatRoomId) => {
        const activeStatuses = statusList.filter(status => 
            status.timestamp > oneHourAgo && status.isTyping
        );
        
        if (activeStatuses.length === 0) {
            typingStatus.delete(chatRoomId);
        } else {
            typingStatus.set(chatRoomId, activeStatuses);
        }
    });
}

// Initialize cleanup interval
setInterval(cleanupInactiveChats, 300000); // Run every 5 minutes

// Export for external access
export { typingStatus, userPresence, activeChats };
