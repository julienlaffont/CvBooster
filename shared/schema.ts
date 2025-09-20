import { sql } from "drizzle-orm";
import { relations } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  text,
  varchar,
  timestamp,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Stripe subscription enums
export const subscriptionPlanEnum = z.enum(["debutant", "pro", "expert"]);
export const subscriptionStatusEnum = z.enum(["active", "inactive", "cancelled", "past_due"]);

// Affiliate system enums
export const affiliateStatusEnum = z.enum(["pending", "active", "suspended"]);
export const commissionStatusEnum = z.enum(["pending", "validated", "paid", "cancelled"]);

// Session storage table - required for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - supports both Replit Auth and email/password auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  freeCvsGenerated: integer("free_cvs_generated").default(0),
  freeCoverLettersGenerated: integer("free_cover_letters_generated").default(0),
  // Authentication source tracking
  authProvider: varchar("auth_provider").default("email"), // email, google, github, etc.
  // Email/password authentication fields
  passwordHash: varchar("password_hash"),
  emailVerifiedAt: timestamp("email_verified_at"),
  emailVerificationToken: varchar("email_verification_token"),
  passwordResetToken: varchar("password_reset_token"),
  passwordResetExpires: timestamp("password_reset_expires"),
  // Stripe integration fields
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  subscriptionPlan: varchar("subscription_plan").default("debutant"), // debutant, pro, expert
  subscriptionStatus: varchar("subscription_status").default("inactive"), // active, inactive, cancelled, past_due
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// CVs table
export const cvs = pgTable("cvs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  sector: text("sector"),
  position: text("position"),
  score: integer("score").default(0),
  suggestions: jsonb("suggestions").default('[]'),
  status: text("status").default('draft'), // draft, analyzing, optimized
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Cover letters table
export const coverLetters = pgTable("cover_letters", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  companyName: text("company_name"),
  position: text("position"),
  sector: text("sector"),
  score: integer("score").default(0),
  suggestions: jsonb("suggestions").default('[]'),
  status: text("status").default('draft'), // draft, analyzing, optimized
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Chat conversations table
export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").default('New Conversation'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Chat messages table
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  role: text("role").notNull(), // user or assistant
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Affiliates table - stores affiliate program participants
export const affiliates = pgTable("affiliates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  affiliateCode: varchar("affiliate_code").notNull().unique(),
  commissionRate: integer("commission_rate").default(20), // Percentage as integer (20 = 20%)
  status: varchar("status").default("active"), // active, suspended, pending
  totalClicks: integer("total_clicks").default(0),
  totalReferrals: integer("total_referrals").default(0),
  totalCommissions: integer("total_commissions").default(0), // In cents
  totalPaid: integer("total_paid").default(0), // In cents
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Affiliate clicks table - tracks link clicks
export const affiliateClicks = pgTable("affiliate_clicks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  affiliateId: varchar("affiliate_id").notNull().references(() => affiliates.id, { onDelete: "cascade" }),
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  referrer: text("referrer"),
  clickedAt: timestamp("clicked_at").defaultNow(),
});

// Affiliate referrals table - tracks successful conversions
export const affiliateReferrals = pgTable("affiliate_referrals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  affiliateId: varchar("affiliate_id").notNull().references(() => affiliates.id, { onDelete: "cascade" }),
  referredUserId: varchar("referred_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  subscriptionPlan: varchar("subscription_plan"), // pro, expert
  subscriptionAmount: integer("subscription_amount"), // In cents
  commissionAmount: integer("commission_amount"), // In cents
  status: varchar("status").default("pending"), // pending, validated, cancelled
  referredAt: timestamp("referred_at").defaultNow(),
  validatedAt: timestamp("validated_at"),
});

// Affiliate commissions table - tracks commission payments
export const affiliateCommissions = pgTable("affiliate_commissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  affiliateId: varchar("affiliate_id").notNull().references(() => affiliates.id, { onDelete: "cascade" }),
  referralId: varchar("referral_id").references(() => affiliateReferrals.id, { onDelete: "set null" }),
  amount: integer("amount").notNull(), // In cents
  status: varchar("status").default("pending"), // pending, validated, paid, cancelled
  stripeTransferId: varchar("stripe_transfer_id"), // For tracking Stripe payouts
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  cvs: many(cvs),
  coverLetters: many(coverLetters),
  conversations: many(conversations),
  affiliate: one(affiliates),
  referrals: many(affiliateReferrals, {
    relationName: "referredUser"
  }),
}));

export const cvsRelations = relations(cvs, ({ one }) => ({
  user: one(users, {
    fields: [cvs.userId],
    references: [users.id],
  }),
}));

export const coverLettersRelations = relations(coverLetters, ({ one }) => ({
  user: one(users, {
    fields: [coverLetters.userId],
    references: [users.id],
  }),
}));

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  user: one(users, {
    fields: [conversations.userId],
    references: [users.id],
  }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
}));

export const affiliatesRelations = relations(affiliates, ({ one, many }) => ({
  user: one(users, {
    fields: [affiliates.userId],
    references: [users.id],
  }),
  clicks: many(affiliateClicks),
  referrals: many(affiliateReferrals),
  commissions: many(affiliateCommissions),
}));

export const affiliateClicksRelations = relations(affiliateClicks, ({ one }) => ({
  affiliate: one(affiliates, {
    fields: [affiliateClicks.affiliateId],
    references: [affiliates.id],
  }),
}));

export const affiliateReferralsRelations = relations(affiliateReferrals, ({ one }) => ({
  affiliate: one(affiliates, {
    fields: [affiliateReferrals.affiliateId],
    references: [affiliates.id],
  }),
  referredUser: one(users, {
    fields: [affiliateReferrals.referredUserId],
    references: [users.id],
    relationName: "referredUser"
  }),
}));

export const affiliateCommissionsRelations = relations(affiliateCommissions, ({ one }) => ({
  affiliate: one(affiliates, {
    fields: [affiliateCommissions.affiliateId],
    references: [affiliates.id],
  }),
  referral: one(affiliateReferrals, {
    fields: [affiliateCommissions.referralId],
    references: [affiliateReferrals.id],
  }),
}));

// Schema types for insertion
export const insertCvSchema = createInsertSchema(cvs).omit({
  id: true,
  userId: true, // Automatically injected by backend from session
  createdAt: true,
  updatedAt: true,
});

export const insertCoverLetterSchema = createInsertSchema(coverLetters).omit({
  id: true,
  userId: true, // Automatically injected by backend from session
  createdAt: true,
  updatedAt: true,
});

// Update schemas for secure updates (userId already omitted from insert schemas)
export const updateCvSchema = insertCvSchema.partial();

export const updateCoverLetterSchema = insertCoverLetterSchema.partial();

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  userId: true, // Automatically injected by backend from session
  createdAt: true,
  updatedAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

// Affiliate schema types for insertion
export const insertAffiliateSchema = createInsertSchema(affiliates).omit({
  id: true,
  affiliateCode: true, // Auto-generated
  totalClicks: true,
  totalReferrals: true,
  totalCommissions: true,
  totalPaid: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAffiliateClickSchema = createInsertSchema(affiliateClicks).omit({
  id: true,
  clickedAt: true,
});

export const insertAffiliateReferralSchema = createInsertSchema(affiliateReferrals).omit({
  id: true,
  referredAt: true,
  validatedAt: true,
});

export const insertAffiliateCommissionSchema = createInsertSchema(affiliateCommissions).omit({
  id: true,
  createdAt: true,
  paidAt: true,
});

// Exported types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertCv = z.infer<typeof insertCvSchema>;
export type Cv = typeof cvs.$inferSelect;
export type InsertCoverLetter = z.infer<typeof insertCoverLetterSchema>;
export type CoverLetter = typeof coverLetters.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
export type UpdateCv = z.infer<typeof updateCvSchema>;
export type UpdateCoverLetter = z.infer<typeof updateCoverLetterSchema>;

// Affiliate types
export type InsertAffiliate = z.infer<typeof insertAffiliateSchema>;
export type Affiliate = typeof affiliates.$inferSelect;
export type InsertAffiliateClick = z.infer<typeof insertAffiliateClickSchema>;
export type AffiliateClick = typeof affiliateClicks.$inferSelect;
export type InsertAffiliateReferral = z.infer<typeof insertAffiliateReferralSchema>;
export type AffiliateReferral = typeof affiliateReferrals.$inferSelect;
export type InsertAffiliateCommission = z.infer<typeof insertAffiliateCommissionSchema>;
export type AffiliateCommission = typeof affiliateCommissions.$inferSelect;

// Stripe subscription types
export type SubscriptionPlan = z.infer<typeof subscriptionPlanEnum>;
export type SubscriptionStatus = z.infer<typeof subscriptionStatusEnum>;

// Affiliate enum types
export type AffiliateStatus = z.infer<typeof affiliateStatusEnum>;
export type CommissionStatus = z.infer<typeof commissionStatusEnum>;

// Backend-only types that include userId for server-side operations
export type CreateCv = InsertCv & { userId: string };
export type CreateCoverLetter = InsertCoverLetter & { userId: string };
export type CreateConversation = InsertConversation & { userId: string };
