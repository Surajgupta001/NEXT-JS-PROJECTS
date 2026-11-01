import express, { response } from 'express';
import cors from 'cors';
import { withOneMinuteLogs } from '@oneminutelogs/express';
import { ApiResponse } from './types/common.types.js';
import { API_PREFIX } from './config/constants.js';
import { apiRouter } from './routes/index.js';
import { notFoundHandler } from './middleware/not-found.middleware.js';
import { errorHandler } from './middleware/error.middleware.js';
import { env } from './config/env.js';

export const app = express();

app.disable('x-powered-by');
app.use(express.json({ limit: '2mb' }));
app.use(cors())
app.use(express.urlencoded({ extended: true }));

app.use(
  withOneMinuteLogs({
    apiKey: env.oneMinuteLogsApiKey!,
    projectName: 'backend',
    environment: process.env.NODE_ENV || 'development',
  }),
);

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