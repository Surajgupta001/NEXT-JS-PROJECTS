import { NextFunction, Request, RequestHandler, Response } from "express";

type AsyncrequestHandler = (
    request: Request,
    response: Response,
    next: NextFunction
) => Promise<unknown>;

export const asynchandler = (handler: AsyncrequestHandler): RequestHandler => (request, response, next) => {
    void handler(request, response, next).catch(next);
};