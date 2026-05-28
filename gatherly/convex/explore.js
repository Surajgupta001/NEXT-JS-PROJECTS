import { v } from "convex/values";
import { query } from "./_generated/server";

export const getFeaturedEvents = query({
    args: {
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const now = Date.now();

        const events = await ctx.db
            .query("events")
            .withIndex('by_start_date')
            .filter((q) => q.gte(q.field("startDate"), now))
            .collect();

        // Sort by registrations count for featured events
        const featured = events
            .sort((a, b) => b.registrationCount - a.registrationCount)
            .slice(0, args.limit ?? 3);

        return featured;
    },
});

// Get events by Location (city, state)
export const getEventsByLocation = query({
    args: {
        city: v.optional(v.string()),
        state: v.optional(v.string()),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const now = Date.now();

        let events = await ctx.db
            .query("events")
            .withIndex('by_start_date')
            .filter((q) => q.gte(q.field("startDate"), now))
            .collect();

        // Filter by city and state or state
        if (args.city) {
            events = events.filter(
                (e) => e.city.toLowerCase() === args.city.toLowerCase()
            );
        } else if (args.state) {
            events = events.filter(
                (e) => e.state && e.state.toLowerCase() === args.state.toLowerCase()
            );
        }
        return events.slice(0, args.limit ?? 4);
    },
});

// Get Popular events (high registration count)
export const getPopularEvents = query({
    args: {
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const now = Date.now();

        const events = await ctx.db
            .query("events")
            .withIndex('by_start_date')
            .filter((q) => q.gte(q.field("startDate"), now))
            .collect();

        // Sort by registrations count for popular events
        const popular = events
            .sort((a, b) => b.registrationCount - a.registrationCount)
            .slice(0, args.limit ?? 6);

        return popular;
    }
});

// Get events by category
export const getEventsByCategory = query({
    args: {
        category: v.string(),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const now = Date.now();

        const events = await ctx.db
            .query("events")
            .withIndex('by_category', (q) => q.eq('category', args.category))
            .filter((q) => q.gte(q.field("startDate"), now))
            .collect();

        return events.slice(0, args.limit ?? 12);
    },
});

// Get Category counts
export const getCategoryCounts = query({
    handler: async (ctx) => {
        const events = await ctx.db
            .query("events")
            .withIndex('by_start_date')
            .filter((q) => q.gte(q.field("startDate"), Date.now()))
            .collect()

        // Count events by category
        const counts = {};
        events.forEach((event) => {
            counts[event.category] = (counts[event.category] || 0) + 1;
        });

        return counts;
    }
});