import { 
  users, 
  modelConnectors, 
  endpoints, 
  apiKeys, 
  conversations, 
  messages, 
  auditLogs, 
  usageRecords,
  subscriptionPlans,
  type User, 
  type InsertUser,
  type ModelConnector,
  type InsertModelConnector,
  type Endpoint,
  type InsertEndpoint,
  type ApiKey,
  type InsertApiKey,
  type Conversation,
  type InsertConversation,
  type Message,
  type InsertMessage,
  type AuditLog,
  type InsertAuditLog,
  type UsageRecord,
  type InsertUsageRecord,
  type SubscriptionPlan,
  type InsertSubscriptionPlan,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserStripeInfo(id: string, stripeCustomerId: string, stripeSubscriptionId: string): Promise<User>;
  getAllUsers(): Promise<User[]>;
  deleteUser(id: string): Promise<void>;
  
  // Model Connectors
  getModelConnector(id: string): Promise<ModelConnector | undefined>;
  getAllModelConnectors(): Promise<ModelConnector[]>;
  createModelConnector(connector: InsertModelConnector): Promise<ModelConnector>;
  updateModelConnector(id: string, connector: Partial<InsertModelConnector>): Promise<ModelConnector>;
  deleteModelConnector(id: string): Promise<void>;
  updateConnectorHealth(id: string, status: string): Promise<void>;
  
  // Endpoints
  getEndpoint(id: string): Promise<Endpoint | undefined>;
  getEndpointByRoute(route: string): Promise<Endpoint | undefined>;
  getAllEndpoints(): Promise<Endpoint[]>;
  createEndpoint(endpoint: InsertEndpoint): Promise<Endpoint>;
  updateEndpoint(id: string, endpoint: Partial<InsertEndpoint>): Promise<Endpoint>;
  deleteEndpoint(id: string): Promise<void>;
  
  // API Keys
  getApiKey(id: string): Promise<ApiKey | undefined>;
  getApiKeyByKey(key: string): Promise<ApiKey | undefined>;
  getAllApiKeys(userId?: string): Promise<ApiKey[]>;
  createApiKey(apiKey: InsertApiKey): Promise<ApiKey>;
  deleteApiKey(id: string): Promise<void>;
  updateApiKeyUsage(id: string, tokensUsed: number): Promise<void>;
  
  // Conversations
  getConversation(id: string): Promise<Conversation | undefined>;
  getAllConversations(userId: string): Promise<Conversation[]>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  updateConversation(id: string, conversation: Partial<InsertConversation>): Promise<Conversation>;
  deleteConversation(id: string): Promise<void>;
  
  // Messages
  getMessage(id: string): Promise<Message | undefined>;
  getMessagesByConversation(conversationId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  deleteMessage(id: string): Promise<void>;
  
  // Audit Logs
  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;
  getAllAuditLogs(limit?: number): Promise<AuditLog[]>;
  
  // Usage Records
  createUsageRecord(record: InsertUsageRecord): Promise<UsageRecord>;
  getUsageRecords(userId?: string, limit?: number): Promise<UsageRecord[]>;
  
  // Subscription Plans
  getAllSubscriptionPlans(): Promise<SubscriptionPlan[]>;
  createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUserStripeInfo(id: string, stripeCustomerId: string, stripeSubscriptionId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ stripeCustomerId, stripeSubscriptionId })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users).orderBy(desc(users.createdAt));
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  // Model Connectors
  async getModelConnector(id: string): Promise<ModelConnector | undefined> {
    const [connector] = await db.select().from(modelConnectors).where(eq(modelConnectors.id, id));
    return connector || undefined;
  }

  async getAllModelConnectors(): Promise<ModelConnector[]> {
    return db.select().from(modelConnectors).orderBy(desc(modelConnectors.createdAt));
  }

  async createModelConnector(connector: InsertModelConnector): Promise<ModelConnector> {
    const [created] = await db.insert(modelConnectors).values(connector).returning();
    return created;
  }

  async updateModelConnector(id: string, connector: Partial<InsertModelConnector>): Promise<ModelConnector> {
    const [updated] = await db
      .update(modelConnectors)
      .set(connector)
      .where(eq(modelConnectors.id, id))
      .returning();
    return updated;
  }

  async deleteModelConnector(id: string): Promise<void> {
    await db.delete(modelConnectors).where(eq(modelConnectors.id, id));
  }

  async updateConnectorHealth(id: string, status: string): Promise<void> {
    await db
      .update(modelConnectors)
      .set({ healthStatus: status, lastHealthCheck: new Date() })
      .where(eq(modelConnectors.id, id));
  }

  // Endpoints
  async getEndpoint(id: string): Promise<Endpoint | undefined> {
    const [endpoint] = await db.select().from(endpoints).where(eq(endpoints.id, id));
    return endpoint || undefined;
  }

  async getEndpointByRoute(route: string): Promise<Endpoint | undefined> {
    const [endpoint] = await db.select().from(endpoints).where(eq(endpoints.route, route));
    return endpoint || undefined;
  }

  async getAllEndpoints(): Promise<Endpoint[]> {
    return db.select().from(endpoints).orderBy(desc(endpoints.createdAt));
  }

  async createEndpoint(endpoint: InsertEndpoint): Promise<Endpoint> {
    const [created] = await db.insert(endpoints).values(endpoint).returning();
    return created;
  }

  async updateEndpoint(id: string, endpoint: Partial<InsertEndpoint>): Promise<Endpoint> {
    const [updated] = await db
      .update(endpoints)
      .set(endpoint)
      .where(eq(endpoints.id, id))
      .returning();
    return updated;
  }

  async deleteEndpoint(id: string): Promise<void> {
    await db.delete(endpoints).where(eq(endpoints.id, id));
  }

  // API Keys
  async getApiKey(id: string): Promise<ApiKey | undefined> {
    const [apiKey] = await db.select().from(apiKeys).where(eq(apiKeys.id, id));
    return apiKey || undefined;
  }

  async getApiKeyByKey(key: string): Promise<ApiKey | undefined> {
    const [apiKey] = await db.select().from(apiKeys).where(eq(apiKeys.key, key));
    return apiKey || undefined;
  }

  async getAllApiKeys(userId?: string): Promise<ApiKey[]> {
    if (userId) {
      return db.select().from(apiKeys).where(eq(apiKeys.userId, userId)).orderBy(desc(apiKeys.createdAt));
    }
    return db.select().from(apiKeys).orderBy(desc(apiKeys.createdAt));
  }

  async createApiKey(apiKey: InsertApiKey): Promise<ApiKey> {
    const [created] = await db.insert(apiKeys).values(apiKey).returning();
    return created;
  }

  async deleteApiKey(id: string): Promise<void> {
    await db.delete(apiKeys).where(eq(apiKeys.id, id));
  }

  async updateApiKeyUsage(id: string, tokensUsed: number): Promise<void> {
    await db
      .update(apiKeys)
      .set({ 
        usedTokens: tokensUsed,
        lastUsedAt: new Date(),
      })
      .where(eq(apiKeys.id, id));
  }

  // Conversations
  async getConversation(id: string): Promise<Conversation | undefined> {
    const [conversation] = await db.select().from(conversations).where(eq(conversations.id, id));
    return conversation || undefined;
  }

  async getAllConversations(userId: string): Promise<Conversation[]> {
    return db.select().from(conversations).where(eq(conversations.userId, userId)).orderBy(desc(conversations.updatedAt));
  }

  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    const [created] = await db.insert(conversations).values(conversation).returning();
    return created;
  }

  async updateConversation(id: string, conversation: Partial<InsertConversation>): Promise<Conversation> {
    const [updated] = await db
      .update(conversations)
      .set({ ...conversation, updatedAt: new Date() })
      .where(eq(conversations.id, id))
      .returning();
    return updated;
  }

  async deleteConversation(id: string): Promise<void> {
    await db.delete(conversations).where(eq(conversations.id, id));
  }

  // Messages
  async getMessage(id: string): Promise<Message | undefined> {
    const [message] = await db.select().from(messages).where(eq(messages.id, id));
    return message || undefined;
  }

  async getMessagesByConversation(conversationId: string): Promise<Message[]> {
    return db.select().from(messages).where(eq(messages.conversationId, conversationId)).orderBy(messages.createdAt);
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [created] = await db.insert(messages).values(message).returning();
    return created;
  }

  async deleteMessage(id: string): Promise<void> {
    await db.delete(messages).where(eq(messages.id, id));
  }

  // Audit Logs
  async createAuditLog(log: InsertAuditLog): Promise<AuditLog> {
    const [created] = await db.insert(auditLogs).values(log).returning();
    return created;
  }

  async getAllAuditLogs(limit: number = 100): Promise<AuditLog[]> {
    return db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(limit);
  }

  // Usage Records
  async createUsageRecord(record: InsertUsageRecord): Promise<UsageRecord> {
    const [created] = await db.insert(usageRecords).values(record).returning();
    return created;
  }

  async getUsageRecords(userId?: string, limit: number = 100): Promise<UsageRecord[]> {
    if (userId) {
      return db.select().from(usageRecords).where(eq(usageRecords.userId, userId)).orderBy(desc(usageRecords.createdAt)).limit(limit);
    }
    return db.select().from(usageRecords).orderBy(desc(usageRecords.createdAt)).limit(limit);
  }

  // Subscription Plans
  async getAllSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return db.select().from(subscriptionPlans).where(eq(subscriptionPlans.active, true));
  }

  async createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan> {
    const [created] = await db.insert(subscriptionPlans).values(plan).returning();
    return created;
  }
}

export const storage = new DatabaseStorage();
