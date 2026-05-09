import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const syncUser = mutation({
    args: {
        userId: v.string(),
        email: v.string(),
        name: v.string()
    },

    handler: async (context, args) => {
        const existingUser = await context.db
        .query('users')
        .filter(q => q.eq(q.field('userId'), args.userId))
        .first();

        if (existingUser) {
            await context.db.patch('users', existingUser._id, {
                email: args.email,
                name: args.name,
            });
        } else {
            await context.db.insert('users', {
                userId: args.userId,
                email: args.email,
                name: args.name,
                isPro: false
            });
        }
    }
});