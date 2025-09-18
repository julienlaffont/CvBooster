// Based on javascript_database and javascript_log_in_with_replit blueprints
import {
  users,
  cvs,
  coverLetters,
  conversations,
  messages,
  type User,
  type UpsertUser,
  type Cv,
  type InsertCv,
  type CreateCv,
  type CoverLetter,
  type InsertCoverLetter,
  type CreateCoverLetter,
  type Conversation,
  type InsertConversation,
  type CreateConversation,
  type Message,
  type InsertMessage,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations - required for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserProfileImage(userId: string, imageUrl: string): Promise<User>;
  
  // CV operations
  getUserCvs(userId: string): Promise<Cv[]>;
  getCv(id: string, userId: string): Promise<Cv | undefined>;
  createCv(cv: CreateCv): Promise<Cv>;
  updateCv(id: string, userId: string, updates: Partial<InsertCv>): Promise<Cv>;
  deleteCv(id: string, userId: string): Promise<void>;
  
  // Cover letter operations
  getUserCoverLetters(userId: string): Promise<CoverLetter[]>;
  getCoverLetter(id: string, userId: string): Promise<CoverLetter | undefined>;
  createCoverLetter(letter: CreateCoverLetter): Promise<CoverLetter>;
  updateCoverLetter(id: string, userId: string, updates: Partial<InsertCoverLetter>): Promise<CoverLetter>;
  deleteCoverLetter(id: string, userId: string): Promise<void>;
  
  // Conversation operations
  getUserConversations(userId: string): Promise<Conversation[]>;
  getConversation(id: string, userId: string): Promise<Conversation | undefined>;
  createConversation(conversation: CreateConversation): Promise<Conversation>;
  
  // Message operations
  getConversationMessages(conversationId: string, userId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
}

export class DatabaseStorage implements IStorage {
  // User operations - required for Replit Auth
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    // First, try to find existing user by email
    if (userData.email) {
      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, userData.email));
      
      if (existingUser) {
        // Update existing user
        const [updatedUser] = await db
          .update(users)
          .set({
            ...userData,
            updatedAt: new Date(),
          })
          .where(eq(users.email, userData.email))
          .returning();
        return updatedUser;
      }
    }
    
    // If no existing user by email, try normal upsert by ID
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserProfileImage(userId: string, imageUrl: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        profileImageUrl: imageUrl,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  // CV operations
  async getUserCvs(userId: string): Promise<Cv[]> {
    return await db
      .select()
      .from(cvs)
      .where(eq(cvs.userId, userId))
      .orderBy(desc(cvs.updatedAt));
  }

  async getCv(id: string, userId: string): Promise<Cv | undefined> {
    const [cv] = await db
      .select()
      .from(cvs)
      .where(and(eq(cvs.id, id), eq(cvs.userId, userId)));
    return cv;
  }

  async createCv(cv: CreateCv): Promise<Cv> {
    const [newCv] = await db.insert(cvs).values(cv).returning();
    return newCv;
  }

  async updateCv(id: string, userId: string, updates: Partial<InsertCv>): Promise<Cv> {
    const [updatedCv] = await db
      .update(cvs)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(cvs.id, id), eq(cvs.userId, userId)))
      .returning();
    if (!updatedCv) {
      throw new Error('CV not found');
    }
    return updatedCv;
  }

  async deleteCv(id: string, userId: string): Promise<void> {
    await db.delete(cvs).where(and(eq(cvs.id, id), eq(cvs.userId, userId)));
  }

  // Cover letter operations
  async getUserCoverLetters(userId: string): Promise<CoverLetter[]> {
    return await db
      .select()
      .from(coverLetters)
      .where(eq(coverLetters.userId, userId))
      .orderBy(desc(coverLetters.updatedAt));
  }

  async getCoverLetter(id: string, userId: string): Promise<CoverLetter | undefined> {
    const [letter] = await db
      .select()
      .from(coverLetters)
      .where(and(eq(coverLetters.id, id), eq(coverLetters.userId, userId)));
    return letter;
  }

  async createCoverLetter(letter: CreateCoverLetter): Promise<CoverLetter> {
    const [newLetter] = await db.insert(coverLetters).values(letter).returning();
    return newLetter;
  }

  async updateCoverLetter(id: string, userId: string, updates: Partial<InsertCoverLetter>): Promise<CoverLetter> {
    const [updatedLetter] = await db
      .update(coverLetters)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(coverLetters.id, id), eq(coverLetters.userId, userId)))
      .returning();
    if (!updatedLetter) {
      throw new Error('Cover letter not found');
    }
    return updatedLetter;
  }

  async deleteCoverLetter(id: string, userId: string): Promise<void> {
    await db.delete(coverLetters).where(and(eq(coverLetters.id, id), eq(coverLetters.userId, userId)));
  }

  // Conversation operations
  async getUserConversations(userId: string): Promise<Conversation[]> {
    return await db
      .select()
      .from(conversations)
      .where(eq(conversations.userId, userId))
      .orderBy(desc(conversations.updatedAt));
  }

  async getConversation(id: string, userId: string): Promise<Conversation | undefined> {
    const [conversation] = await db
      .select()
      .from(conversations)
      .where(and(eq(conversations.id, id), eq(conversations.userId, userId)));
    return conversation;
  }

  async createConversation(conversation: CreateConversation): Promise<Conversation> {
    const [newConversation] = await db.insert(conversations).values(conversation).returning();
    return newConversation;
  }

  // Message operations
  async getConversationMessages(conversationId: string, userId: string): Promise<Message[]> {
    // First verify the conversation belongs to the user
    const conversation = await this.getConversation(conversationId, userId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }
    
    return await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();
    return newMessage;
  }

  // Free trial usage tracking
  async canUserGenerateFreeCv(userId: string): Promise<boolean> {
    const user = await this.getUser(userId);
    if (!user) return false;
    return (user.freeCvsGenerated || 0) < 1;
  }

  async canUserGenerateFreeCoverLetter(userId: string): Promise<boolean> {
    const user = await this.getUser(userId);
    if (!user) return false;
    return (user.freeCoverLettersGenerated || 0) < 1;
  }

  async incrementFreeCvUsage(userId: string): Promise<void> {
    await db
      .update(users)
      .set({ 
        freeCvsGenerated: sql`${users.freeCvsGenerated} + 1`,
        updatedAt: new Date() 
      })
      .where(eq(users.id, userId));
  }

  async incrementFreeCoverLetterUsage(userId: string): Promise<void> {
    await db
      .update(users)
      .set({ 
        freeCoverLettersGenerated: sql`${users.freeCoverLettersGenerated} + 1`,
        updatedAt: new Date() 
      })
      .where(eq(users.id, userId));
  }

  async getUserFreeTrialStatus(userId: string): Promise<{ freeCvsGenerated: number; freeCoverLettersGenerated: number } | null> {
    const user = await this.getUser(userId);
    if (!user) return null;
    return {
      freeCvsGenerated: user.freeCvsGenerated || 0,
      freeCoverLettersGenerated: user.freeCoverLettersGenerated || 0
    };
  }
}

export const storage = new DatabaseStorage();
