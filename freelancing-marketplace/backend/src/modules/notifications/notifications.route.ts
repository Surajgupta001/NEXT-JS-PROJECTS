import { Router } from "express";
import { isAuthenticated } from "../../middleware/auth.middleware.js";
import { listNotifications, markAllNotificationsRead, notificationsStream } from "./notifications.controller.js";

export const notificationsRouter = Router();

notificationsRouter.use(isAuthenticated);
notificationsRouter.get('/', listNotifications);
notificationsRouter.patch('/read-all', markAllNotificationsRead);
notificationsRouter.get('/stream', notificationsStream);