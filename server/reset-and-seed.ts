import { db } from "./db";
import { 
  users,
  modelConnectors,
  endpoints,
  apiKeys,
  conversations,
  messages,
  auditLogs,
  usageRecords,
  subscriptionPlans
} from "@shared/schema";
import bcrypt from "bcrypt";
import { storage } from "./storage";

async function resetAndSeed() {
  console.log("🗑️  Clearing existing data...");

  // Delete in reverse order of dependencies
  await db.delete(usageRecords);
  await db.delete(messages);
  await db.delete(conversations);
  await db.delete(auditLogs);
  await db.delete(apiKeys);
  await db.delete(endpoints);
  await db.delete(modelConnectors);
  await db.delete(subscriptionPlans);
  await db.delete(users);

  console.log("✓ Database cleared");

  console.log("\n🌱 Seeding database...");

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await storage.createUser({
    username: "admin",
    email: "admin@eveda.ai",
    password: adminPassword,
    role: "admin",
  });
  console.log("✓ Created admin user");

  // Create OpenBioLLM model connector
  const openBioConnector = await storage.createModelConnector({
    name: "OpenBioLLM-Llama3-8B-GGUF",
    protocol: "REST",
    baseUrl: "http://192.168.75.9:8080",
    authType: "none",
    defaultSettings: {
      temperature: 0.7,
      maxTokens: 2048,
      topP: 1.0,
    },
    createdBy: admin.id,
  });
  console.log("✓ Created OpenBioLLM model connector");

  // Update health status
  await storage.updateConnectorHealth(openBioConnector.id, "healthy");

  // Create doctor endpoint
  await storage.createEndpoint({
    name: "BioDoctorAssistant",
    route: "/api/x/abx/doctor",
    modelConnectorId: openBioConnector.id,
    systemPrompt: "You are a diagnostic doctor. Answer medically and cite guidelines when possible. Provide clear, evidence-based medical information while emphasizing that users should consult healthcare professionals for personalized advice.",
    temperature: "0.2",
    maxTokens: 2048,
    topP: "1.0",
    tokenLimitPerRequest: 4096,
    rateLimitPerMinute: 60,
    accessType: "public",
    frozen: false,
    inheritDefaults: false,
    createdBy: admin.id,
  });
  console.log("✓ Created /api/x/abx/doctor endpoint");

  // Create engineer endpoint
  await storage.createEndpoint({
    name: "BioEngineerAssistant",
    route: "/api/x/abx/engineer",
    modelConnectorId: openBioConnector.id,
    systemPrompt: "You are a senior software engineer with expertise in multiple programming languages and frameworks. Provide clear technical steps and code samples. Focus on best practices, clean code principles, and practical solutions.",
    temperature: "0.7",
    maxTokens: 2048,
    topP: "0.95",
    tokenLimitPerRequest: 4096,
    rateLimitPerMinute: 60,
    accessType: "public",
    frozen: false,
    inheritDefaults: false,
    createdBy: admin.id,
  });
  console.log("✓ Created /api/x/abx/engineer endpoint");

  // Create demo API key
  const demoApiKey = await storage.createApiKey({
    name: "Demo API Key",
    userId: admin.id,
    key: "sk_demo_eveda_" + Math.random().toString(36).substring(2, 15),
    scopes: ["read", "write"],
    quotaTokens: 1000000,
    rateLimit: 100,
  });
  console.log("✓ Created demo API key:", demoApiKey.key);

  // Create subscription plans
  await storage.createSubscriptionPlan({
    name: "Starter",
    monthlyPrice: "29.00",
    tokenQuota: 100000,
    features: ["100,000 tokens/month", "5 API keys", "Email support", "Basic analytics"],
    active: true,
  });

  await storage.createSubscriptionPlan({
    name: "Professional",
    monthlyPrice: "99.00",
    tokenQuota: 1000000,
    features: ["1,000,000 tokens/month", "Unlimited API keys", "Priority support", "Advanced analytics", "Custom endpoints"],
    active: true,
  });

  await storage.createSubscriptionPlan({
    name: "Enterprise",
    monthlyPrice: "499.00",
    tokenQuota: null,
    features: ["Unlimited tokens", "Dedicated support", "SLA guarantee", "On-premise deployment", "Custom integrations"],
    active: true,
  });
  console.log("✓ Created subscription plans");

  // Create initial conversation for demo
  const conversation = await storage.createConversation({
    title: "Welcome to EVEDA AIX STUDIO",
    userId: admin.id,
    modelConnectorId: openBioConnector.id,
    favorite: false,
  });
  console.log("✓ Created initial conversation");

  // Create audit log
  await storage.createAuditLog({
    userId: admin.id,
    action: "Database reset and seeded",
    resourceType: "system",
    details: {
      connectors: 1,
      endpoints: 2,
      users: 1,
    },
  });
  console.log("✓ Created audit log");

  console.log("\n✅ Database reset and seeding complete!");
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Login credentials:");
  console.log("  Username: admin");
  console.log("  Password: admin123");
  console.log("\nModel: OpenBioLLM-Llama3-8B-GGUF");
  console.log("  URL: http://192.168.75.9:8080");
  console.log("\nDemo API Key:", demoApiKey.key);
  console.log("\nTest endpoints:");
  console.log("  POST /api/x/abx/doctor");
  console.log("  POST /api/x/abx/engineer");
  console.log("\nExample curl:");
  console.log(`  curl -X POST http://localhost:5000/api/x/abx/doctor \\`);
  console.log(`    -H "x-api-key: ${demoApiKey.key}" \\`);
  console.log(`    -H "Content-Type: application/json" \\`);
  console.log(`    -d '{"input": "What are the symptoms of the flu?"}'`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

resetAndSeed().catch(console.error).finally(() => process.exit(0));
