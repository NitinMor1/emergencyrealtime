import { EEmergencyType } from "../../../features/emergency/emergencyModel";
import { INotification, NotificationStorage, NotificationType, addNotification, clearUserNotifications, getHospitalNotifications, getUndeliveredHospitalNotifications, getUndeliveredNotifications, getUserNotifications, markAsDelivered, removeUserRoleFromHospitalNotification } from "../models/notificationModel"
import { ClientInfo, UserRole } from "../types";
import WebSocket from 'ws';

// Create and store a notification
export const createNotification = (
    userIds: string[],
    type: NotificationType,
    title: string,
    message: string,
    options: {
        userRoles?: UserRole[];
        hospitalId?: string;
        priority?: EEmergencyType;
        metadata?: any;
        expiresIn?: number | 1800000; // in milliseconds
    } = {}
): INotification[] => {
    const notifications: INotification[] = [];
    const timestamp = new Date();
    const expiresAt = new Date(timestamp.getTime() + (options?.expiresIn || 1800000));

    userIds.forEach(userId => {
        const notification: INotification = {
            userId,
            userRole: options.userRoles || [],
            hospitalId: options.hospitalId,
            type,
            title,
            message,
            metadata: options.metadata,
            priority: options.priority || EEmergencyType.MEDIUM,
            delivered: false,
            read: false,
            createdAt: timestamp,
            expiresAt
        };

        addNotification(notification);
        notifications.push(notification);
    });

    return notifications;
}

// Handle user reconnection
export const handleUserReconnection = async (user: ClientInfo, ws: WebSocket) => {

    const undeliveredNotifications = getUndeliveredNotifications(user.userId);;

    if (undeliveredNotifications.length > 0) {
        const message = {
            type: 'notifications',
            data: undeliveredNotifications,
            timestamp: new Date().toISOString()
        };

        ws.send(JSON.stringify(message));
        console.log(`[NotificationService] Sent undelivered notifications to user: ${user.userId}`);

        clearUserNotifications(user.userId);
    }

    if (user.hospitalId) {
        handleHospitalNotifications(user.hospitalId, user.role, ws);
    }

}

export const handleHospitalNotifications = (hospitalId: string, role: UserRole, ws: WebSocket) => {
    const hospitalNotifications = getHospitalNotifications(hospitalId);

    const roleSpecificNotification = hospitalNotifications.filter(n => n.userRole.includes(role));

    if (roleSpecificNotification.length > 0) {

        const message = {
            type: 'notifications',
            data: roleSpecificNotification,
            timestamp: new Date().toISOString()
        };

        ws.send(JSON.stringify(message));
        removeUserRoleFromHospitalNotification(hospitalId, role);
    }
}

export const markAllAsDelivered = (userId: string) => {
    const notifications = getUserNotifications(userId) ?? [];

    if (notifications.length > 0) {
        const notificationIds = notifications.map(n => n._id!);
        markAsDelivered(userId, notificationIds)
    }

}

export const clearAllUserNotifications = (userId: string) => {
    return clearUserNotifications(userId);
}