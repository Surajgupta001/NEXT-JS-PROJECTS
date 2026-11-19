import { JSONCodec } from "nats";
import { NotificationEvent, NOTIFICATIONS_SUBJECT } from "./subject.js";
import { getNats } from "../config/nats.js";

const codec = JSONCodec<NotificationEvent>();

export const sendNotification = async (input: Omit<NotificationEvent, 'eventId' | 'createdAt'>) => {
    const nats = await getNats();
    const event = {
        ...input,
        eventId: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
    };

    await nats.jetstream().publish(NOTIFICATIONS_SUBJECT, codec.encode(event));

    return event;
};