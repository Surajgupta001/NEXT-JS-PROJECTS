import mongoose from "mongoose";

declare global {
    // eslint-disable-next-line no-var
    var mongooseCache: {
        conn: typeof mongoose | null;
        promise: Promise<typeof mongoose> | null;
    } | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI!

if(!MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined");
};

let cached = global.mongooseCache as { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } | undefined;

if(!cached) {
    cached = { conn: null, promise: null };
    global.mongooseCache = cached;
}

export async function connectToDatabase() {
    if(cached && cached.conn) {
        return cached.conn;
    }

    if(cached && !cached.promise) {
        const opts = {
            bufferCommands: true,
            maxPoolSize: 10
        } as const;
        cached.promise = mongoose.connect(MONGODB_URI, opts);
    }

    try {
        if (cached?.promise) {
            cached.conn = await cached.promise;
        }
    } catch (error) {
        if (cached) cached.promise = null;
        throw error;
    }

    return cached?.conn;
};