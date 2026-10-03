import { boolean, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

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
});

export const client_metadata = pgTable("client_metadata", {
    id: uuid("id").defaultRandom().primaryKey(),
    auth_id: text("auth_id").notNull(),
    role: text("role").notNull(),
    company_name: text("company_name").notNull(),
    company_website: text("company_website").notNull(),
    company_size: text("company_size").notNull(),
    industry: text("industry").notNull(),
    company_description: text("company_description").notNull(),
    created_At: timestamp("created_At", { withTimezone: true }),
    updated_At: timestamp("updated_At", { withTimezone: true }),
});