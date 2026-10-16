import { relations } from "drizzle-orm";
import { boolean, jsonb, numeric, pgEnum, pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";

export const accountRole = pgEnum("account_role", ["FREELANCER", "CLIENT"]);

export const accounts = pgTable("accounts", {
    id: uuid("id").defaultRandom().primaryKey(),
    auth_id: text("auth_id").notNull(),
    email: text("email").notNull(),
    role: accountRole("role").default("CLIENT").notNull(),
    identityVerified: boolean("identityVerified").default(false),
    paymentMethodVerified: boolean("paymentMethodVerified").default(false),
    isOnBoardingComplete: boolean("isOnBoardingComplete").default(false),
    created_At: timestamp("created_At", { withTimezone: true }),
    updated_At: timestamp("updated_At", { withTimezone: true }),
}, (table) => [
    unique("accounts_auth_id_role_unique").on(table.auth_id, table.role),
]);

export const client_metadata = pgTable("client_metadata", {
    id: uuid("id").defaultRandom().primaryKey(),
    auth_id: text("auth_id").notNull().unique(),
    role: text("role").notNull(),
    company_name: text("company_name").notNull(),
    company_website: text("company_website").notNull(),
    company_size: text("company_size").notNull(),
    industry: text("industry").notNull(),
    company_description: text("company_description").notNull(),
    created_At: timestamp("created_At", { withTimezone: true }),
    updated_At: timestamp("updated_At", { withTimezone: true }),
});

export const freelancer_metadata = pgTable("freelancer_metadata", {
    id: uuid("id").defaultRandom().primaryKey(),
    auth_id: text("auth_id").notNull().unique(),
    professional_title: text("professional_title").notNull(),
    professional_description: text("professional_description").notNull(),
    hourly_rate: numeric("hourly_rate", { precision: 6, scale: 2 }).notNull(),
    country: text("country").notNull(),
    city: text("city").notNull(),
    availability_status: text("availability_status").notNull().default("AVAILABLE"),
    experience_level: text("experience_level").notNull(),
    skills: text("skills").array().notNull().default([]),
    languages: jsonb("languages").$type<Array<{ language: string; proficiency: string }>>().notNull(),
    created_At: timestamp("created_At", { withTimezone: true }).defaultNow(),
    updated_At: timestamp("updated_At", { withTimezone: true }).defaultNow(),
});

export const freelancer_portfolios = pgTable("freelancer_portfolios", {
    id: uuid("id").defaultRandom().primaryKey(),
    freelancer_id: uuid("freelancer_id").notNull().references(() => freelancer_metadata.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    category: text("category").notNull(),
    description: text("description").notNull(),
    live_url: text("live_url"),
    cover_image: jsonb("cover_image").$type<{ imageId: string; url: string }>().notNull(),
    created_At: timestamp("created_At", { withTimezone: true }).defaultNow(),
    updated_At: timestamp("updated_At", { withTimezone: true }).defaultNow(),
});

export const freelancerMetadataRelations = relations(
    freelancer_metadata,
    ({ many }) => ({
        portfolios: many(freelancer_portfolios),
    }),
);

export const freelancerPortfoliosRelations = relations(
    freelancer_portfolios,
    ({ one }) => ({
        freelancer: one(freelancer_metadata, {
            fields: [freelancer_portfolios.freelancer_id],
            references: [freelancer_metadata.id],
        }),
    }),
);