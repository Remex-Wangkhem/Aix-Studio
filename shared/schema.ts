import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, jsonb, decimal } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table with RBAC
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("user"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Model connectors - external LLM hosts
export const modelConnectors = pgTable("model_connectors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  protocol: text("protocol").notNull(),
  baseUrl: text("base_url").notNull(),
  authType: text("auth_type").notNull().default("none"),
  authToken: text("auth_token"),
  defaultSettings: jsonb("default_settings").$type<{
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    stopTokens?: string[];
  }>(),
  healthStatus: text("health_status").default("unknown"),
  lastHealthCheck: timestamp("last_health_check"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdBy: varchar("created_by").references(() => users.id),
});

// Endpoints - API endpoints mapped to model connectors with custom settings
export const endpoints = pgTable("endpoints", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  route: text("route").notNull().unique(),
  modelConnectorId: varchar("model_connector_id").references(() => modelConnectors.id).notNull(),
  systemPrompt: text("system_prompt"),
  temperature: decimal("temperature", { precision: 3, scale: 2 }),
  maxTokens: integer("max_tokens"),
  topP: decimal("top_p", { precision: 3, scale: 2 }),
  tokenLimitPerRequest: integer("token_limit_per_request"),
  rateLimitPerMinute: integer("rate_limit_per_minute").default(60),
  accessType: text("access_type").notNull().default("private"),
  frozen: boolean("frozen").default(false),
  inheritDefaults: boolean("inherit_defaults").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdBy: varchar("created_by").references(() => users.id),
});

// API Keys for external access
export const apiKeys = pgTable("api_keys", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: text("key").notNull().unique(),
  name: text("name").notNull(),
  userId: varchar("user_id").references(() => users.id),
  scopes: text("scopes").array().notNull().default(sql`ARRAY['read']::text[]`),
  quotaTokens: integer("quota_tokens"),
  usedTokens: integer("used_tokens").default(0),
  rateLimit: integer("rate_limit").default(100),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastUsedAt: timestamp("last_used_at"),
});

// Conversations - chat sessions
export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  modelConnectorId: varchar("model_connector_id").references(() => modelConnectors.id),
  favorite: boolean("favorite").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Messages in conversations
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").references(() => conversations.id, { onDelete: "cascade" }).notNull(),
  role: text("role").notNull(),
  content: text("content").notNull(),
  tokens: integer("tokens"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Audit logs for admin actions
export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  action: text("action").notNull(),
  resourceType: text("resource_type").notNull(),
  resourceId: text("resource_id"),
  details: jsonb("details"),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Usage tracking for billing
export const usageRecords = pgTable("usage_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  apiKeyId: varchar("api_key_id").references(() => apiKeys.id),
  endpointId: varchar("endpoint_id").references(() => endpoints.id),
  tokens: integer("tokens").notNull(),
  cost: decimal("cost", { precision: 10, scale: 6 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Subscription plans
export const subscriptionPlans = pgTable("subscription_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  stripePriceId: text("stripe_price_id"),
  monthlyPrice: decimal("monthly_price", { precision: 10, scale: 2 }),
  tokenQuota: integer("token_quota"),
  features: jsonb("features").$type<string[]>(),
  active: boolean("active").default(true),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  conversations: many(conversations),
  apiKeys: many(apiKeys),
  createdEndpoints: many(endpoints),
  createdConnectors: many(modelConnectors),
  auditLogs: many(auditLogs),
  usageRecords: many(usageRecords),
}));

export const modelConnectorsRelations = relations(modelConnectors, ({ many, one }) => ({
  endpoints: many(endpoints),
  conversations: many(conversations),
  createdBy: one(users, {
    fields: [modelConnectors.createdBy],
    references: [users.id],
  }),
}));

export const endpointsRelations = relations(endpoints, ({ one, many }) => ({
  modelConnector: one(modelConnectors, {
    fields: [endpoints.modelConnectorId],
    references: [modelConnectors.id],
  }),
  createdBy: one(users, {
    fields: [endpoints.createdBy],
    references: [users.id],
  }),
  usageRecords: many(usageRecords),
}));

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  user: one(users, {
    fields: [conversations.userId],
    references: [users.id],
  }),
  modelConnector: one(modelConnectors, {
    fields: [conversations.modelConnectorId],
    references: [modelConnectors.id],
  }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
}));

export const apiKeysRelations = relations(apiKeys, ({ one, many }) => ({
  user: one(users, {
    fields: [apiKeys.userId],
    references: [users.id],
  }),
  usageRecords: many(usageRecords),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}));

export const usageRecordsRelations = relations(usageRecords, ({ one }) => ({
  user: one(users, {
    fields: [usageRecords.userId],
    references: [users.id],
  }),
  apiKey: one(apiKeys, {
    fields: [usageRecords.apiKeyId],
    references: [apiKeys.id],
  }),
  endpoint: one(endpoints, {
    fields: [usageRecords.endpointId],
    references: [endpoints.id],
  }),
}));

// Insert schemas and types
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
}).extend({
  email: z.string().email(),
});

export const insertModelConnectorSchema = createInsertSchema(modelConnectors).omit({
  id: true,
  createdAt: true,
  healthStatus: true,
  lastHealthCheck: true,
});

export const insertEndpointSchema = createInsertSchema(endpoints).omit({
  id: true,
  createdAt: true,
});

export const insertApiKeySchema = createInsertSchema(apiKeys).omit({
  id: true,
  key: true,
  createdAt: true,
  lastUsedAt: true,
  usedTokens: true,
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  createdAt: true,
});

export const insertUsageRecordSchema = createInsertSchema(usageRecords).omit({
  id: true,
  createdAt: true,
});

export const insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlans).omit({
  id: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type ModelConnector = typeof modelConnectors.$inferSelect;
export type InsertModelConnector = z.infer<typeof insertModelConnectorSchema>;

export type Endpoint = typeof endpoints.$inferSelect;
export type InsertEndpoint = z.infer<typeof insertEndpointSchema>;

export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertApiKey = z.infer<typeof insertApiKeySchema>;

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;

export type UsageRecord = typeof usageRecords.$inferSelect;
export type InsertUsageRecord = z.infer<typeof insertUsageRecordSchema>;

export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type InsertSubscriptionPlan = z.infer<typeof insertSubscriptionPlanSchema>;
