import express from "express";
import cors from "cors";
import http from "http";
import apiRoutes from "./routes/api.js";
import { getIngestionManager } from "./realtime/ingestion.mjs";
import { createRealtimeWebSocketServer } from "./realtime/websocket.mjs";
import { createRealtimeRoutes } from "./realtime/routes.mjs";
import { SafeMLServiceClient } from "./realtime/ml-client.mjs";

const app = express();
const server = http.createServer(app);

// Middlewares
app.use(cors());
app.use(express.json());

// Initialize ML Service client
const mlClient = new SafeMLServiceClient(
  process.env.ML_SERVICE_URL || "http://localhost:5000"
);

// Initialize real-time ingestion manager with ML client
const ingestionManager = getIngestionManager(mlClient);

// Setup WebSocket server for real-time streaming
const wsServer = createRealtimeWebSocketServer(server, ingestionManager);

// Routes
app.use("/api", apiRoutes);
app.use("/api/realtime", createRealtimeRoutes(ingestionManager));

// ML Service status endpoint
app.get("/api/ml-service/health", async (req, res) => {
  try {
    const stats = await mlClient.client.getStats();
    const modelInfo = await mlClient.client.getModelInfo();
    res.json({
      health: mlClient.client.isHealthy ? "healthy" : "unhealthy",
      stats,
      modelInfo,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      health: "unhealthy",
      error: error.message,
    });
  }
});

// Test route
app.get("/", (req, res) => {
  res.send("Backend running 🚀 - Real-Time Fraud Detection System with ML Inference");
});

// Status endpoint
app.get("/status", async (req, res) => {
  res.json({
    status: "running",
    realtime: ingestionManager.getHealth(),
    mlService: mlClient.getClientStats(),
    timestamp: new Date().toISOString(),
  });
});

// Start server
async function startServer() {
  // Initialize ML client before starting server
  console.log("🤖 Initializing ML Service client...");
  const mlReady = await mlClient.initialize();

  if (!mlReady) {
    console.warn(
      "⚠️  ML Service not ready, running in degraded mode. Make sure Python ML service is running."
    );
  }

  server.listen(3000, () => {
    console.log("🚀 Server running on http://localhost:3000");
    console.log("🔴 WebSocket real-time streaming available at ws://localhost:3000");

    // Start ingestion pipeline
    ingestionManager.start();
    console.log("📊 Real-time ingestion pipeline started");

    // Start backend push stream to connected WebSocket clients
    wsServer.startDemoStream(2000);
    console.log("🔄 Live backend push stream enabled (heartbeat every 2s)");

    // Log initial stats
    console.log("Initial stats:", ingestionManager.getHealth());

    if (mlReady) {
      console.log("✅ ML Service connected and ready for inference");
    } else {
      console.log(
        "⚠️  ML Service not available. Start Python service to enable inference."
      );
      console.log("   Run: python ml-service/service.py");
    }
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
