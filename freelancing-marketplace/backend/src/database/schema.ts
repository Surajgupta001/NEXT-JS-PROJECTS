import { create } from "domain";
import { desc, relations } from "drizzle-orm";
import { boolean, integer, jsonb, numeric, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const accountRole = pgEnum("account_role", ["FREELANCER", "CLIENT"]);

export const accounts = pgTable("accounts", {
    id: uuid("id").defaultRandom().primaryKey(),
    auth_id: text("auth_id").notNull().unique(),
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
    weekly_availability: text("weekly_availability").notNull(),
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

export const job_posts = pgTable("job_posts", {
    id: uuid("id").defaultRandom().primaryKey(),
    client_id: text("client_id").notNull().references(() => accounts.auth_id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description").notNull(),
    expertise_level: text("expertise_level").notNull(),
    expected_duration: text("expected_duration").notNull(),
    skills: text("skills").array().notNull().default([]),
    total_budget: numeric("total_budget", {
        precision: 9,
        scale: 2,
    }).notNull(),
    milestones: jsonb("milestones").$type<
        Array<{
            id: string;
            title: string;
            budget: number;
            dueDate: string;
        }>
    >().notNull(),
    screening_questions: text("screening_questions").array().default([]),
    attachments: jsonb("attachments").$type<
        Array<{
            fileId: string;
            fileName: string;
            fileUrl: string;
            fileType: string;
            fileSize: number;
        }>
    >().default([]),
    status: text("status").notNull().default("DRAFT"),
    published_At: timestamp("published_At", { withTimezone: true }),
    hired_at: timestamp("hired_at", { withTimezone: true }),
    created_At: timestamp("created_At", { withTimezone: true }).defaultNow(),
    updated_At: timestamp("updated_At", { withTimezone: true }).defaultNow(),
});

export const connects = pgTable("connects", {
    id: uuid("id").defaultRandom().primaryKey(),
    freelancer_id: text("freelancer_id").notNull().unique().references(() => freelancer_metadata.auth_id, { onDelete: "cascade" }),
    connects: integer("connects").notNull().default(0),
    created_At: timestamp("created_At", { withTimezone: true }).defaultNow(),
    updated_At: timestamp("updated_At", { withTimezone: true }).defaultNow(),
});

export const connects_history = pgTable("connects_history", {
    id: uuid("id").defaultRandom().primaryKey(),
    connects_id: uuid("connects_id").notNull().references(() => connects.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    description: text("description").notNull(),
    amount: integer("amount").notNull(),
    create_At: timestamp("create_At", { withTimezone: true }).defaultNow(),
});

export const connects_purchase_history = pgTable("connects_purchase_history", {
    id: uuid("id").defaultRandom().primaryKey(),
    connects_id: uuid("connects_id").notNull().references(() => connects.id, { onDelete: "cascade" }),
    purchased_connects: integer("purchased_connects").notNull(),
    amount_paid: numeric("amount_paid").notNull(),
    payment_id: text("payment_id").notNull().unique(),
    status: text("status").notNull().default("PENDING"),
    created_At: timestamp("created_At", { withTimezone: true }).defaultNow(),
    updated_At: timestamp("updated_At", { withTimezone: true }).defaultNow(),
});

export const connectsRelations = relations(connects, ({ many, one }) => ({
    freelancer: one(freelancer_metadata, {
        fields: [connects.freelancer_id],
        references: [freelancer_metadata.auth_id],
    }),
    history: many(connects_history),
    purchase: many(connects_purchase_history),
}));

export const connectsHistoryRelations = relations(connects_history, ({ one }) => ({
    balance: one(connects, {
        fields: [connects_history.connects_id],
        references: [connects.id],
    }),
}));

export const connectsPurchaseHistoryRelations = relations(connects_purchase_history, ({ one }) => ({
    balance: one(connects, {
        fields: [connects_purchase_history.connects_id],
        references: [connects.id],
    }),
}));