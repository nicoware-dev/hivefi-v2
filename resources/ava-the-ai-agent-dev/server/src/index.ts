// // src/index.ts
// import { serve } from "@hono/node-server";
// import { app } from "./app";
// import env from "./env";
// import { registerAgents } from "./agents";
// import { EventBus } from "./comms";
// import { privateKeyToAccount } from "viem/accounts";
// import { setupWebSocket } from "./websocket";
// import figlet from "figlet";
import { WebSocket, WebSocketServer } from "ws";
import { EventBus } from "./comms/event-bus";
import { registerAgents } from "./agents";
import { AIFactory } from "./services/ai/factory";
import env from "./env";
import { privateKeyToAccount } from "viem/accounts";
import { mainnet } from "viem/chains";
// import { RecallStorage } from "./agents/plugins/recall-storage/index";
import { HybridStorage } from "./agents/plugins/hybrid-storage/index";
import { ATCPIPProvider } from "./agents/plugins/atcp-ip";

// console.log(figlet.textSync("AVA-2.0"));
// console.log("======== Initializing Server =========");

// // Initialize event bus and agents
// const eventBus = new EventBus();
// const account = privateKeyToAccount(env.PRIVATE_KEY as `0x${string}`);
// export const agents = registerAgents(eventBus, account);

// const PORT = env.PORT || 3001;

// serve(
//   {
//     fetch: app.fetch,
//     port: PORT,
//   },
//   (info) => {
//     console.log(`[🚀] Server running on http://localhost:${info.port}`);
//     console.log(`[👀] Observer agent starting...`);

//     console.log("Event bus", eventBus);
//     // Setup WebSocket server
//     setupWebSocket(eventBus);

//     // agents.observerAgent.start(account.address);
//   }
// );

async function initializeServices() {
  try {
    // Initialize core services
    const eventBus = new EventBus();
    const account = privateKeyToAccount(env.WALLET_PRIVATE_KEY as `0x${string}`);
    
    // Create AI provider
    const aiProvider = AIFactory.createProvider({
      provider: 'groq',
      apiKey: env.GROQ_API_KEY as string,
      modelName: 'gemma2-9b-it'
    });


    // Initialize Hybrid Storage with both Recall and EthStorage
    const storage = new HybridStorage({
      network: 'testnet',
      syncInterval: 2 * 60 * 1000, // 2 minutes
      batchSize: 4, // 4KB
      eventBus,
      bucketAlias: 'ava',
      maxRetries: 5,
      retryDelay: 1000, // Start with 1 second delay, will increase exponentially
      // EthStorage specific config
      ethStorageRpc: "https://rpc.beta.testnet.l2.ethstorage.io:9596"
    });

    // Wait for client initialization
    await storage.waitForInitialization();

    // Initialize ATCP/IP Provider
    const atcpipProvider = new ATCPIPProvider({
      agentId: 'ava'
    });

    // Initialize agents
    console.log("======== Registering agents =========");

    // Register all agents
    const agents = registerAgents(eventBus, account, aiProvider, storage, atcpipProvider);
    console.log("[initializeServices] All agents registered");

    // Setup WebSocket server
    const WS_PORT = process.env.WS_PORT || 3001;
    const wss = new WebSocketServer({ port: WS_PORT as number });

    wss.on("connection", (ws: WebSocket) => {
      console.log(`[WebSocket] Client connected on port ${WS_PORT}`);

      // Forward events from event bus to WebSocket clients
      eventBus.on("agent-action", async (data) => {
        ws.send(JSON.stringify({
          type: "agent-message",
          timestamp: new Date().toLocaleTimeString(),
          role: "assistant",
          content: `[${data.agent}] ${data.action}`,
          agentName: data.agent,
        }));
      });

      eventBus.on("agent-response", async (data) => {
        ws.send(JSON.stringify({
          type: "agent-message",
          timestamp: new Date().toLocaleTimeString(),
          role: "assistant",
          content: data.message,
          agentName: data.agent,
        }));
      });

      eventBus.on("agent-error", async (data) => {
        ws.send(JSON.stringify({
          type: "agent-message",
          timestamp: new Date().toLocaleTimeString(),
          role: "error",
          content: `Error in ${data.agent}: ${data.error}`,
          agentName: data.agent,
        }));
      });

      // Forward CDP Agent frontend events to WebSocket clients
      eventBus.on("frontend-event", async (data) => {
        ws.send(JSON.stringify({
          type: "cdp-event",
          timestamp: new Date().toLocaleTimeString(),
          eventType: data.type,
          taskId: data.taskId,
          content: data.content || data.message || data.result || null,
          error: data.error || null,
          source: data.source,
          details: data
        }));
        
        // Also log the event to the console
        console.log(`[WebSocket] Forwarded CDP event: ${data.type}`);
      });

      ws.on("message", async (message: string) => {
        try {
          const data = JSON.parse(message.toString());
          console.log("[WebSocket] Received message:", data);
          if (data.type === "settings") {
            // Update AI provider based on settings
            const newProvider = AIFactory.createProvider({
              provider: data.settings.aiProvider.provider,
              apiKey: data.settings.aiProvider.apiKey,
              modelName: data.settings.aiProvider.modelName,
              enablePrivateCompute: data.settings.enablePrivateCompute,
            });

            // Update agents with new settings
            agents.observerAgent.updateAIProvider(newProvider);
            agents.taskManagerAgent.updateAIProvider(newProvider);

            eventBus.emit("agent-action", {
              agent: "system",
              action: "Updated AI provider settings",
            });
          } else if (data.type === "command") {
            // Add user message to chat
            ws.send(JSON.stringify({
              type: "agent-message",
              timestamp: new Date().toLocaleTimeString(),
              role: "user",
              content: data.command,
              agentName: "user",
            }));

            if (data.command === "stop") {
              agents.observerAgent.stop();
              eventBus.emit("agent-action", {
                agent: "system",
                action: "All agents stopped",
              });
            } else {
              eventBus.emit("agent-action", {
                agent: "system",
                action: "Starting task processing",
              });
              
              // Create and process task through task manager
              const taskId = await agents.taskManagerAgent.createTask(data.command);
              // Get the task from the task manager and then assign it
              const task = await agents.taskManagerAgent.getTaskById(taskId);
              if (task) {
                await agents.taskManagerAgent.assignTask(task);
              }
            }
          }
        } catch (error) {
          console.error("[WebSocket] Error processing message:", error);
          ws.send(JSON.stringify({
            type: "agent-message",
            timestamp: new Date().toLocaleTimeString(),
            role: "error",
            content: "Error processing command",
            agentName: "system",
          }));
        }
      });

      ws.on("close", () => {
        eventBus.unsubscribe("agent-action", async (data: any) => Promise.resolve());
        eventBus.unsubscribe("agent-response", async (data: any) => Promise.resolve());
        eventBus.unsubscribe("agent-error", async (data: any) => Promise.resolve());
        eventBus.unsubscribe("frontend-event", async (data: any) => Promise.resolve());
      });
    });

    console.log(`[🔌] WebSocket Server running on ws://localhost:${WS_PORT}`);

  } catch (error) {
    console.error("Error initializing services:", error);
    process.exit(1);
  }
}

// Start the application
initializeServices().catch(error => {
  console.error("Failed to start application:", error);
  process.exit(1);
});
