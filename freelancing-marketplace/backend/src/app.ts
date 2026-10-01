import express, { response } from 'express';
import cors from 'cors';
import { ApiResponse } from './types/common.types.js';
import { API_PREFIX } from './config/constants.js';
import { apiRouter } from './routes/index.js';
import { notFoundHandler } from './middleware/not-found.middleware.js';
import { errorHandler } from './middleware/error.middleware.js';

export const app = express();

app.disable('x-powered-by');
app.use(express.json({ limit: '2mb' }));
app.use(cors())
app.use(express.urlencoded({ extended: true }));

const port = process.env.PORT || 8080;

app.get('/', (_request, response) => {
    const body: ApiResponse<never> = {
        success: true,
        message: 'Welcome to freelancing-marketplace API',
    }

    response.status(200).json(body);
});

app.use(API_PREFIX, apiRouter);
app.use(notFoundHandler);
app.use(errorHandler);