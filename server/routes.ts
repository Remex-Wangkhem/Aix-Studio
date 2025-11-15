import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { RestAdapter } from "./adapters/rest-adapter";
import { MockAdapter } from "./adapters/mock-adapter";
import Stripe from "stripe";
import bcrypt from "bcrypt";
import crypto from "crypto";

// Make Stripe optional - use mock in development if not configured
let stripe: Stripe | null = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2023-10-16",
  });
  console.log("✓ Stripe initialized");
} else {
  console.warn("⚠ Stripe not configured - billing features will be mocked");
}

// Simple token estimation: ~4 characters per token
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

// Generate secure API key
function generateApiKey(): string {
  return 'sk_' + crypto.randomBytes(32).toString('hex');
}

// Middleware to validate API key
async function validateApiKey(req: any, res: any, next: any) {
  const apiKey = req.headers['x-api-key'] as string;
  
  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }

  const key = await storage.getApiKeyByKey(apiKey);
  if (!key) {
    return res.status(401).json({ error: 'Invalid API key' });
  }

  // Check quota
  if (key.quotaTokens && key.usedTokens >= key.quotaTokens) {
    return res.status(429).json({ error: 'Quota exceeded' });
  }

  req.apiKey = key;
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // ============ Auth Routes ============
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, email, password } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const user = await storage.createUser({
        username,
        email,
        password: hashedPassword,
        role: "user",
      });

      await storage.createAuditLog({
        userId: user.id,
        action: "User registered",
        resourceType: "user",
        resourceId: user.id,
      });

      res.json({ id: user.id, username: user.username, email: user.email, role: user.role });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);

      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      res.json({ id: user.id, username: user.username, email: user.email, role: user.role });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ============ Model Connectors ============
  app.get("/api/model-connectors", async (req, res) => {
    try {
      const connectors = await storage.getAllModelConnectors();
      res.json(connectors);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/model-connectors", async (req, res) => {
    try {
      const connector = await storage.createModelConnector(req.body);
      
      await storage.createAuditLog({
        userId: req.body.createdBy,
        action: "Created model connector",
        resourceType: "model_connector",
        resourceId: connector.id,
        details: { name: connector.name },
      });

      res.json(connector);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.put("/api/model-connectors/:id", async (req, res) => {
    try {
      const connector = await storage.updateModelConnector(req.params.id, req.body);
      
      await storage.createAuditLog({
        action: "Updated model connector",
        resourceType: "model_connector",
        resourceId: connector.id,
      });

      res.json(connector);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/model-connectors/:id", async (req, res) => {
    try {
      await storage.deleteModelConnector(req.params.id);
      
      await storage.createAuditLog({
        action: "Deleted model connector",
        resourceType: "model_connector",
        resourceId: req.params.id,
      });

      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/model-connectors/:id/health", async (req, res) => {
    try {
      const connector = await storage.getModelConnector(req.params.id);
      if (!connector) {
        return res.status(404).json({ error: "Connector not found" });
      }

      let adapter;
      if (connector.baseUrl.includes('mock') || connector.baseUrl.includes('192.168')) {
        adapter = new MockAdapter(connector.baseUrl, connector.authToken || undefined);
      } else {
        adapter = new RestAdapter(connector.baseUrl, connector.authToken || undefined);
      }

      const isHealthy = await adapter.healthCheck();
      await storage.updateConnectorHealth(req.params.id, isHealthy ? "healthy" : "unhealthy");

      res.json({ status: isHealthy ? "healthy" : "unhealthy" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============ Endpoints ============
  app.get("/api/endpoints", async (req, res) => {
    try {
      const endpoints = await storage.getAllEndpoints();
      res.json(endpoints);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/endpoints", async (req, res) => {
    try {
      const endpoint = await storage.createEndpoint(req.body);
      
      await storage.createAuditLog({
        userId: req.body.createdBy,
        action: "Created endpoint",
        resourceType: "endpoint",
        resourceId: endpoint.id,
        details: { name: endpoint.name, route: endpoint.route },
      });

      res.json(endpoint);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.put("/api/endpoints/:id", async (req, res) => {
    try {
      const endpoint = await storage.updateEndpoint(req.params.id, req.body);
      
      await storage.createAuditLog({
        action: "Updated endpoint",
        resourceType: "endpoint",
        resourceId: endpoint.id,
      });

      res.json(endpoint);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/endpoints/:id", async (req, res) => {
    try {
      await storage.deleteEndpoint(req.params.id);
      
      await storage.createAuditLog({
        action: "Deleted endpoint",
        resourceType: "endpoint",
        resourceId: req.params.id,
      });

      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ============ Dynamic Endpoint Execution ============
  app.post("/api/x/*", validateApiKey, async (req, res) => {
    try {
      const route = '/api/x/' + req.params[0];
      const endpoint = await storage.getEndpointByRoute(route);

      if (!endpoint) {
        return res.status(404).json({ error: "Endpoint not found" });
      }

      const connector = await storage.getModelConnector(endpoint.modelConnectorId);
      if (!connector) {
        return res.status(500).json({ error: "Model connector not found" });
      }

      // Build messages with system prompt injection
      const messages = [];
      if (endpoint.systemPrompt) {
        messages.push({ role: "system", content: endpoint.systemPrompt });
      }
      messages.push({ role: "user", content: req.body.input || req.body.message || "" });

      // Determine settings (endpoint overrides or defaults)
      const settings = {
        temperature: endpoint.temperature ? parseFloat(endpoint.temperature.toString()) : connector.defaultSettings?.temperature || 0.7,
        max_tokens: endpoint.maxTokens || connector.defaultSettings?.maxTokens || 2048,
        top_p: endpoint.topP ? parseFloat(endpoint.topP.toString()) : connector.defaultSettings?.topP || 1.0,
      };

      // Create adapter (use mock for local/demo hosts)
      let adapter;
      if (connector.baseUrl.includes('192.168') || connector.baseUrl.includes('localhost')) {
        adapter = new MockAdapter(connector.baseUrl, connector.authToken || undefined);
      } else {
        adapter = new RestAdapter(connector.baseUrl, connector.authToken || undefined);
      }

      // Send request
      const response = await adapter.sendRequest({
        messages,
        ...settings,
      });

      // Track usage
      const tokens = response.tokens || estimateTokens(response.content);
      await storage.createUsageRecord({
        apiKeyId: req.apiKey.id,
        userId: req.apiKey.userId,
        endpointId: endpoint.id,
        tokens,
        cost: (tokens * 0.00002).toString(), // $0.00002 per token
      });

      await storage.updateApiKeyUsage(req.apiKey.id, (req.apiKey.usedTokens || 0) + tokens);

      res.json({ 
        output: response.content,
        tokens,
        settings,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============ API Keys ============
  app.get("/api/api-keys", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      const keys = await storage.getAllApiKeys(userId);
      res.json(keys);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/api-keys", async (req, res) => {
    try {
      const key = generateApiKey();
      const apiKey = await storage.createApiKey({
        ...req.body,
        key,
      });

      await storage.createAuditLog({
        userId: req.body.userId,
        action: "Created API key",
        resourceType: "api_key",
        resourceId: apiKey.id,
      });

      res.json({ ...apiKey, key }); // Only time we return the full key
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/api-keys/:id", async (req, res) => {
    try {
      await storage.deleteApiKey(req.params.id);
      
      await storage.createAuditLog({
        action: "Revoked API key",
        resourceType: "api_key",
        resourceId: req.params.id,
      });

      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ============ Conversations ============
  app.get("/api/conversations", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      const conversations = await storage.getAllConversations(userId);
      res.json(conversations);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/conversations", async (req, res) => {
    try {
      const conversation = await storage.createConversation(req.body);
      res.json(conversation);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/conversations/:id", async (req, res) => {
    try {
      await storage.deleteConversation(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ============ Messages ============
  app.get("/api/conversations/:id/messages", async (req, res) => {
    try {
      const messages = await storage.getMessagesByConversation(req.params.id);
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/conversations/:id/messages", async (req, res) => {
    try {
      const message = await storage.createMessage({
        conversationId: req.params.id,
        ...req.body,
      });
      res.json(message);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ============ Chat Stream ============
  app.post("/api/chat/stream", async (req, res) => {
    try {
      const { connectorId, messages, temperature, max_tokens, top_p } = req.body;
      
      const connector = await storage.getModelConnector(connectorId);
      if (!connector) {
        return res.status(404).json({ error: "Connector not found" });
      }

      let adapter;
      if (connector.baseUrl.includes('192.168') || connector.baseUrl.includes('localhost')) {
        adapter = new MockAdapter(connector.baseUrl, connector.authToken || undefined);
      } else {
        adapter = new RestAdapter(connector.baseUrl, connector.authToken || undefined);
      }

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      for await (const chunk of adapter.sendStreamRequest({
        messages,
        temperature,
        max_tokens,
        top_p,
      })) {
        res.write(`data: ${JSON.stringify(chunk)}\n\n`);
        if (chunk.done) {
          res.end();
          break;
        }
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============ Users ============
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users.map(u => ({ ...u, password: undefined })));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/users/:id", async (req, res) => {
    try {
      await storage.deleteUser(req.params.id);
      
      await storage.createAuditLog({
        action: "Deleted user",
        resourceType: "user",
        resourceId: req.params.id,
      });

      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ============ Audit Logs ============
  app.get("/api/audit-logs", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const logs = await storage.getAllAuditLogs(limit);
      res.json(logs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============ Usage Records ============
  app.get("/api/usage-records", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      const records = await storage.getUsageRecords(userId);
      res.json(records);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============ Stripe Billing ============
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      if (!stripe) {
        return res.status(501).json({ error: "Stripe not configured" });
      }
      const { amount } = req.body;
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: "usd",
      });
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/subscription-plans", async (req, res) => {
    try {
      const plans = await storage.getAllSubscriptionPlans();
      res.json(plans);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============ Dashboard Stats ============
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const endpoints = await storage.getAllEndpoints();
      const usageRecords = await storage.getUsageRecords(undefined, 1000);
      
      const totalCalls = usageRecords.length;
      const totalTokens = usageRecords.reduce((sum, r) => sum + (r.tokens || 0), 0);
      const totalRevenue = usageRecords.reduce((sum, r) => sum + parseFloat(r.cost || '0'), 0);

      res.json({
        totalUsers: users.length,
        totalEndpoints: endpoints.length,
        totalCalls,
        totalTokens,
        totalRevenue: totalRevenue.toFixed(2),
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
