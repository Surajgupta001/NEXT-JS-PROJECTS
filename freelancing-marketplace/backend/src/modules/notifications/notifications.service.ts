import { desc, eq } from "drizzle-orm"
import { database } from "../../database/client.js"
import { notifications } from "../../database/schema.js"

export const getNotification = (userId: string) => {
    return database.select().from(notifications).where(
        eq(notifications.recipient_id, userId)
    ).orderBy(desc(notifications.created_At)).limit(10)
};

export const readAllNotifications = (userId: string) => {
    return database.update(notifications).set({
        is_read: true, read_at: new Date()
    }).where(eq(notifications.recipient_id, userId))
};