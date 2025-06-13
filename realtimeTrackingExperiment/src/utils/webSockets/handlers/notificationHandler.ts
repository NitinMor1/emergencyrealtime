import { INotification } from "../models/notificationModel";

const notificationQueue = new Map<string, INotification[]>;

export const getUserNotification = (userId: string): INotification[] => {
    return notificationQueue.get(userId) ?? [];
}
