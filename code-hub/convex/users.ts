import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

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

export const getUser = query({
    args: {
        userId: v.string()
    },
    handler: async (context, args) => {
        if (!args.userId) return null;

        const user = await context.db
            .query('users')
            .withIndex('by_user_id')
            .filter(q => q.eq(q.field('userId'), args.userId))
            .first();

        if (!user) return null;

        return user;
    }
});

export const upgradeToPro = mutation({
    args: {
        email: v.string(),
        lemonSqueezyCustomerId: v.string(),
        lemonSqueezyOrderId: v.string(),
        amount: v.number(),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("email"), args.email))
            .first();

        if (!user) throw new Error("User not found");

        await ctx.db.patch(user._id, {
            isPro: true,
            proSince: Date.now(),
            lemonSqueezyCustomerId: args.lemonSqueezyCustomerId,
            lemonSqueezyOrderId: args.lemonSqueezyOrderId,
        });

        return { success: true };
    },
});

export const deleteUser = mutation({
    args: {
        userId: v.string(),
    },
    handler: async (ctx, args) => {
        // Find the user profile in Convex
        const user = await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("userId"), args.userId))
            .first();

        if (!user) return;

        // Delete the main user profile record
        await ctx.db.delete(user._id);

        // Cascade Delete: Clean up all code executions owned by this user
        const codeExecutions = await ctx.db
            .query("codeExecutions")
            .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
            .collect();
        for (const execution of codeExecutions) {
            await ctx.db.delete(execution._id);
        }

        // Cascade Delete: Clean up all snippets owned by this user
        const snippets = await ctx.db
            .query("snippets")
            .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
            .collect();
        for (const snippet of snippets) {
            await ctx.db.delete(snippet._id);
        }

        // Cascade Delete: Clean up all snippet comments written by this user
        const snippetComments = await ctx.db
            .query("snippetComments")
            .filter((q) => q.eq(q.field("userId"), args.userId))
            .collect();
        for (const comment of snippetComments) {
            await ctx.db.delete(comment._id);
        }

        // Cascade Delete: Clean up all stars given by this user
        const stars = await ctx.db
            .query("stars")
            .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
            .collect();
        for (const star of stars) {
            await ctx.db.delete(star._id);
        }
    },
});