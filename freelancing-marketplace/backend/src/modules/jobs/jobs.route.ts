import { Router } from "express";
import { createClientJobPost, editClientJobPost, getClientJobPosts, removeClientJobPost } from "./jobs.controller.js";
import { isAuthenticated } from "../../middleware/auth.middleware.js";

export const jobRouter = Router();

jobRouter.post("/", isAuthenticated, createClientJobPost);
jobRouter.get('/', isAuthenticated, getClientJobPosts);
jobRouter.get('/:jobId', isAuthenticated, getClientJobPosts);
jobRouter.put('/:jobId', isAuthenticated, editClientJobPost);
jobRouter.delete('/:jobId', isAuthenticated, removeClientJobPost);