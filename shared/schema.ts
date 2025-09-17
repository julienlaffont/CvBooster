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

// User storage table - required for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
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

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  cvs: many(cvs),
  coverLetters: many(coverLetters),
  conversations: many(conversations),
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

// Update schemas for secure updates
export const updateCvSchema = insertCvSchema.omit({
  userId: true,
}).partial();

export const updateCoverLetterSchema = insertCoverLetterSchema.omit({
  userId: true,
}).partial();

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

// Backend-only types that include userId for server-side operations
export type CreateCv = InsertCv & { userId: string };
export type CreateCoverLetter = InsertCoverLetter & { userId: string };
export type CreateConversation = InsertConversation & { userId: string };
