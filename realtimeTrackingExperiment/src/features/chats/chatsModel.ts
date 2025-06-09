export interface IChat {
    _id?: string;
    hospitalId: string;
    message: string;
    sender: string;
    receiver: string;
    timestamp: string;
    messageType: 'text' | 'image' | 'file' | 'deleted';
    isRead: boolean;
    isDelivered: boolean;
    isEdited: boolean;
    editedAt?: string;
    deletedAt?: string;
    deletedBy?: string;
    replyTo?: string; // ID of the message being replied to
    readAt?: string; // When the message was read
    deliveredAt?: string; // When the message was delivered
}

export interface ITypingStatus {
    chatRoomId: string;
    userId: string;
    isTyping: boolean;
    timestamp: string;
}

export interface IUserPresence {
    userId: string;
    isOnline: boolean;
    lastSeen: string;
    hospitalId: string;
}