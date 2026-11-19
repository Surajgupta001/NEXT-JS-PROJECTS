import { Response } from "express";

const clients = new Map<string, Set<Response>>();

export const addNotificationClient = (userId: string, response: Response) => {
    const userClients = clients.get(userId) ?? new Set<Response>();
    userClients.add(response);
    clients.set(userId, userClients);

    return () => {
        userClients.delete(response);
        if (!userClients.size) clients.delete(userId);
    }
};

export const emitNotification = (userId: string, notification: any) => {
    const data = `event: notification\ndata: ${JSON.stringify(notification)}\n\n`;
    // Do something with the data, e.g., send it to a client via SSE
    clients.get(userId)?.forEach((client) => client.write(data));
};