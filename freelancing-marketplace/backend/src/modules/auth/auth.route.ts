import { Router } from "express";
import { isAuthenticated } from "../../middleware/auth.middleware.js";
import { getAuthStatus, signUp } from "./auth.controller.js";

export const authRouter = Router();

authRouter.post('/sign-up', isAuthenticated, signUp);
authRouter.get('/status', isAuthenticated, getAuthStatus);