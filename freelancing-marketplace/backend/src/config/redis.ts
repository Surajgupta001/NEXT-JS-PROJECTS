import { createClient } from "redis";
import { env } from "./env.js";

export const redis = createClient({
    password: env.redis.password,
    database: env.redis.database,
    socket: {
        host: env.redis.host,
        port: env.redis.port,
        reconnectStrategy: (retries) => {
            if (retries > 10) {
                return new Error("Redis reconnect attempts exhausted");
            }

            return Math.min(100 * 2 ** retries, 3_000); // Exponential backoff with a maximum delay of 3 seconds
        },
    },
});

redis.on("error", (err) => console.error("Redis Client Error", err));

export const connectRedis = async (): Promise<void> => {
    if (!redis.isOpen) {
        await redis.connect();
        console.log("Connected to Redis");
    }

    await redis.ping();
    console.log(`Redis connected at ${env.redis.host}:${env.redis.port}, using database ${env.redis.database}`);
};

export const disconnectRedis = async (): Promise<void> => {
    if (redis.isOpen) {
        await redis.quit();
        console.log("Disconnected from Redis");
    }
};