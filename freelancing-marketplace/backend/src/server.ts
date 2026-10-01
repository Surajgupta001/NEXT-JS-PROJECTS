import 'dotenv/config';
import { Server } from 'node:http';
import { app } from './app.js';
import { SERVICE_NAME } from './config/constants.js';
import { env } from './config/env.js';

let server: Server | undefined;
let isShuttingDown = false;

const start = async (): Promise<void> => {
    server = app.listen(env.port, () => {
        console.log(
            `${SERVICE_NAME} is listening on http://localhost:${env.port} in ${env.nodeEnv} mode`
        );
    });
};

const closeHttpServer = async (): Promise<void> => {
    if (!server) return;

    await new Promise<void>((resolve, reject) => {
        server?.close((error) => {
            if (error) {
                reject(error);
                return;
            }

            resolve();
        });
    });
};

const shutdown = async (signal: NodeJS.Signals): Promise<void> => {
    if (isShuttingDown) return;

    isShuttingDown = true;

    console.log(`Received ${signal}. Shutting down gracefully...`);
    console.log(`Shutting down ${SERVICE_NAME} in ${env.nodeEnv} mode...`);

    try {
        await closeHttpServer();
        process.exit(0);
    } catch (error) {
        console.error(`Error occurred while shutting down: ${error}`);
        process.exit(1);
    }
};

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));

void start().catch((error) => {
    console.error(`Failed to start ${SERVICE_NAME}: ${error}`);
    process.exit(1);
});
