// types/notification.ts
export type NotificationType = 'ALERT' | 'MESSAGE' | 'REMINDER' | 'SYSTEM';

export interface INotification {
    _id?: string; // MongoDB ID
    userId: string;
    type: NotificationType;
    title: string;
    body: string;
    metadata?: any; // for optional additional info
    delivered: boolean;
    read: boolean;
    createdAt: Date;
    updatedAt?: Date;
}
