import { EEmergencyType } from "features/emergency/emergencyModel";
import { UserRole } from "../types";

// types/notification.ts
export type NotificationType =
    | 'EMERGENCY_ALERT'
    | 'EMERGENCY_CREATION'
    | 'EMERGENCY_ASSIGNMENT'
    | 'CHAT_MESSAGE'
    | 'SYSTEM_ALERT'
    | 'LOCATION_UPDATE'
    | 'STATUS_UPDATE';

export interface INotification {
    _id?: string;
    userId: string;
    userRole: UserRole[];
    hospitalId?: string;
    type: NotificationType;
    title: string;
    message: string;
    metadata?: {
        emergencyId?: string;
        chatRoomId?: string;
        location?: {
            latitude: number;
            longitude: number;
        };
        status?: string;
        [key: string]: any;
    };
    priority: EEmergencyType;
    delivered: boolean;
    read: boolean;
    createdAt: Date;
    updatedAt?: Date;
    expiresAt?: Date;
}


export const NotificationStorage = new Map<string, INotification[]>();

// Add a new notification
export const addNotification = (notification: INotification): void => {
    const userNotifications = NotificationStorage.get(notification.userId) ?? [];
    userNotifications.push(notification);
    NotificationStorage.set(notification.userId, userNotifications);
}

// Get all notifications for a user
export const getUserNotifications = (userId: string): INotification[] => {
    return NotificationStorage.get(userId) || [];
}

export const getHospitalNotifications = (hospitalId: string): INotification[] => {
    return NotificationStorage.get(hospitalId) || [];
}

// Get undelivered notifications for a user
export const getUndeliveredNotifications = (userId: string): INotification[] => {
    const userNotifications = NotificationStorage.get(userId) || [];
    return userNotifications.filter(n => !n.delivered);
}

export const getUndeliveredHospitalNotifications = (hospitalId: string): INotification[] => {
    const userNotifications = NotificationStorage.get(hospitalId) || [];
    return userNotifications.filter(n => !n.delivered);
}

// Mark notifications as delivered
export const markAsDelivered = (id: string, notificationIds: string[]): void => {
    const userNotifications = NotificationStorage.get(id) || [];
    userNotifications.forEach(notification => {
        if (notificationIds.includes(notification._id!)) {
            notification.delivered = true;
            notification.updatedAt = new Date();
        }
    });
}

// Mark notifications as read
export const markAsRead = (id: string, notificationIds: string[]): void => {
    const userNotifications = NotificationStorage.get(id) || [];
    userNotifications.forEach(notification => {
        if (notificationIds.includes(notification._id!)) {
            notification.read = true;
            notification.updatedAt = new Date();
        }
    });
}

export const clearUserNotifications = (userId: string) => {
    NotificationStorage.set(userId, []);
    console.log("cleared notifications: ");
    return;
}

// Clean up expired notifications
export const cleanupExpiredNotifications = (): void => {
    const now = new Date();
    NotificationStorage.forEach((userNotifications, userId) => {
        const validNotifications = userNotifications.filter(n =>
            !n.expiresAt || n.expiresAt > now
        );
        NotificationStorage.set(userId, validNotifications);
    });
}

export const removeUserRoleFromHospitalNotification = (hospitalId: string, role: UserRole) => {
    const hospitalNotifications = getHospitalNotifications(hospitalId);

    const updatedNotifications = hospitalNotifications
        .map(n => {
            if (n.userRole.includes(role)) {
                n.userRole = n.userRole.filter(r => r !== role);
                if (n.userRole.length === 0) {
                    return null;
                }
            }
            return n;
        })
        .filter((n): n is INotification => n !== null);

    NotificationStorage.set(hospitalId, updatedNotifications);
}