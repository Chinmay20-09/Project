/**
 * WebSocket Server for Real-Time Data Streaming
 * Handles client connections and message routing
 */

import { WebSocketServer, WebSocket as WsClient } from "ws";

export class RealtimeWebSocketServer {
  constructor(server, ingestionManager, options = {}) {
    this.wss = new WebSocketServer({ server, ...options });
    this.ingestionManager = ingestionManager;
    this.clientCounter = 0;
    this.clients = new Map();
    this.mlServiceUrl = options.mlServiceUrl || "http://localhost:5000/predict";
    this.setupHandlers();
    console.log("[WS] WebSocket server initialized");
  }

  /**
   * Setup WebSocket event handlers
   */
  setupHandlers() {
    this.wss.on("connection", (ws, req) => this.handleConnection(ws, req));
    this.wss.on("error", (error) => {
      console.error("[ERROR][WS] WebSocket server error:", error.stack || error);
    });
  }

  handleConnection(ws, req) {
    const clientId = `client-${++this.clientCounter}`;
    console.log(`[WS] Client connected: ${clientId}`);

    ws.isAlive = true;
    ws.clientId = clientId;
    ws.on("pong", () => {
      ws.isAlive = true;
    });

    this.clients.set(clientId, ws);
    if (this.ingestionManager?.registerClient) {
      this.ingestionManager.registerClient(clientId, ws);
    }

    ws.on("message", (message) => {
      console.log(`[WS] Message received from ${clientId}:`, message.toString());
      this.handleMessage(clientId, message, ws);
    });

    ws.on("close", () => {
      this.stopClientStream(clientId, ws);
      this.clients.delete(clientId);
      if (this.ingestionManager?.unregisterClient) {
        this.ingestionManager.unregisterClient(clientId);
      }
      console.log(`[WS] Client disconnected: ${clientId}`);
    });

    ws.on("error", (error) => {
      console.error(`[ERROR][WS] WebSocket error for ${clientId}:`, error.stack || error);
    });

    this.sendToClient(ws, "connection-established", {
      clientId,
      message: "Connected to real-time fraud detection system",
    });

    this.startClientStream(clientId, ws);
  }

  /**
   * Handle incoming WebSocket message
   */
  handleMessage(clientId, message, ws) {
    try {
      const parsed = JSON.parse(message);
      const { type, data } = parsed;

      switch (type) {
        case "ingest":
          this.handleIngest(clientId, data, ws);
          break;
        case "batch-ingest":
          this.handleBatchIngest(clientId, data, ws);
          break;
        case "query-stats":
          this.handleQueryStats(clientId, ws);
          break;
        case "query-health":
          this.handleQueryHealth(clientId, ws);
          break;
        case "query-result":
          this.handleQueryResult(clientId, data, ws);
          break;
        case "subscribe":
          this.handleSubscribe(clientId, data, ws);
          break;
        case "ping":
          this.sendToClient(ws, "pong", { timestamp: Date.now() });
          break;
        default:
          console.warn(`Unknown message type: ${type}`);
      }
    } catch (error) {
      console.error("Error parsing WebSocket message:", error);
      this.sendToClient(ws, "error", { message: "Invalid message format" });
    }
  }

  /**
   * Handle single transaction ingestion
   */
  handleIngest(clientId, transaction, ws) {
    try {
      const success = this.ingestionManager.ingestTransaction(transaction);
      this.sendToClient(ws, "ingest-acknowledged", {
        transactionId: transaction.id,
        success,
        queueSize: this.ingestionManager.queue.size(),
      });
    } catch (error) {
      this.sendToClient(ws, "error", { message: error.message });
    }
  }

  /**
   * Handle batch transaction ingestion
   */
  handleBatchIngest(clientId, transactions, ws) {
    try {
      const result = this.ingestionManager.ingestBatch(transactions);
      this.sendToClient(ws, "batch-ingest-acknowledged", {
        ...result,
        queueSize: this.ingestionManager.queue.size(),
      });
    } catch (error) {
      this.sendToClient(ws, "error", { message: error.message });
    }
  }

  /**
   * Handle stats query
   */
  handleQueryStats(clientId, ws) {
    const stats = this.ingestionManager.getStats();
    this.sendToClient(ws, "stats-response", stats);
  }

  /**
   * Handle health query
   */
  handleQueryHealth(clientId, ws) {
    const health = this.ingestionManager.getHealth();
    this.sendToClient(ws, "health-response", health);
  }

  /**
   * Handle result query for specific transaction
   */
  handleQueryResult(clientId, data, ws) {
    const { transactionId } = data;
    const result = this.ingestionManager.processor.getResult(transactionId);
    this.sendToClient(ws, "result-response", {
      transactionId,
      result: result || null,
      found: result !== null,
    });
  }

  /**
   * Handle subscription setup (future feature)
   */
  handleSubscribe(clientId, data, ws) {
    // Can be extended for topic-based subscriptions
    this.sendToClient(ws, "subscription-confirmed", {
      subscriptionType: data.type || "all-events",
    });
  }

  /**
   * Send message to specific client
   */
  sendToClient(ws, eventType, data) {
    const payload = { event: eventType, data };
    if (ws.readyState === WsClient.OPEN) {
      ws.send(JSON.stringify(payload), (error) => {
        if (error) {
          console.error(`[ERROR][WS] Failed to send ${eventType} to ${ws.clientId || "unknown"}:`, error.stack || error);
        } else {
          console.log(`[WS] Sent ${eventType} to ${ws.clientId || "unknown"}:`, payload);
        }
      });
    } else {
      console.warn(`[WS] Cannot send ${eventType} to ${ws.clientId || "unknown"}: socket not OPEN`, { readyState: ws.readyState });
    }
  }

  /**
   * Broadcast message to all clients
   */
  broadcast(eventType, data) {
    const message = JSON.stringify({ event: eventType, data });
    this.wss.clients.forEach((client) => {
      if (client.readyState === WsClient.OPEN) {
        client.send(message);
      }
    });
  }

  /**
   * Broadcast a fraud alert to all connected clients
   */
  broadcastAlert(alert) {
    this.broadcast("fraud-alert", alert);
  }

  /**
   * Emit a simple periodic update for demo purposes
   */
  startClientStream(clientId, ws, intervalMs = 5000) {
    if (ws.clientStreamInterval) {
      return;
    }

    console.log(`[STREAM] Starting real-time stream for client ${clientId}`);

    ws.clientStreamInterval = setInterval(() => {
      void this.sendLivePrediction(clientId, ws);
    }, intervalMs);
  }

  stopClientStream(clientId, ws) {
    if (ws?.clientStreamInterval) {
      clearInterval(ws.clientStreamInterval);
      ws.clientStreamInterval = null;
      console.log(`[STREAM] Stopped real-time stream for client ${clientId}`);
    }
  }

  async sendLivePrediction(clientId, ws) {
    if (ws.readyState !== WsClient.OPEN) {
      console.warn(`[STREAM] Skipping prediction for ${clientId}: websocket not open`, { readyState: ws.readyState });
      return;
    }

    if (ws.mlRequestInFlight) {
      console.log(`[STREAM] Skipping overlapping prediction for ${clientId}`);
      return;
    }

    ws.mlRequestInFlight = true;

    const transaction = {
      amount: Number((Math.random() * 500 + 20).toFixed(2)),
      frequency: Number((Math.random() * 10 + 1).toFixed(2)),
      ip_risk: Number(Math.random().toFixed(2)),
    };
    const timestamp = new Date().toISOString();

    console.log(`[STREAM] Sending ML request for ${clientId}:`, transaction);

    try {
      const prediction = await this.requestPrediction(transaction);
      console.log(`[ML RAW]`, prediction);

      const mapped = this.mapMlResponse(prediction);
      console.log(`[ML MAPPED]`, mapped);

      const payload = {
        ...transaction,
        risk_score: mapped.risk_score,
        fraud: mapped.fraud,
        risk_level: mapped.risk_level,
        timestamp,
      };

      this.sendToClient(ws, "fraud-update", payload);
      if (payload.fraud === 1) {
        this.sendToClient(ws, "high-risk-alert", payload);
      }
    } catch (error) {
      console.error(`[ERROR][STREAM] ML prediction failed for ${clientId}:`, error.stack || error);
      const fallbackPayload = {
        ...transaction,
        risk_score: 0,
        fraud: 0,
        risk_level: "UNKNOWN",
        timestamp,
        error: error.message || "ML service error",
      };
      this.sendToClient(ws, "fraud-update", fallbackPayload);
    } finally {
      ws.mlRequestInFlight = false;
    }
  }

  async requestPrediction(transaction) {
    const response = await fetch(this.mlServiceUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(transaction),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`ML service returned ${response.status}: ${text}`);
    }

    const prediction = await response.json();
    return prediction;
  }

  mapMlResponse(prediction) {
    const mapped = {
      risk_score: typeof prediction?.score === "number" ? prediction.score : 0,
      fraud: prediction?.is_fraud === 1 ? 1 : 0,
      risk_level: typeof prediction?.risk_level === "string" ? prediction.risk_level : "UNKNOWN",
    };

    if (prediction == null || prediction.score == null || prediction.is_fraud == null || prediction.risk_level == null) {
      console.warn("[ML WARNING] ML response missing expected fields, using defaults:", prediction);
    }

    return mapped;
  }

  startDemoStream(intervalMs = 5000) {
    if (this.demoInterval) {
      return;
    }

    console.log("[STREAM] Starting global demo stream");
    this.demoInterval = setInterval(() => {
      const heartbeat = {
        timestamp: new Date().toISOString(),
        connectedClients: this.wss.clients.size,
      };
      console.log("[STREAM] Global heartbeat generated:", heartbeat);
      this.broadcast("server-heartbeat", heartbeat);
    }, intervalMs);
  }

  stopDemoStream() {
    if (this.demoInterval) {
      clearInterval(this.demoInterval);
      this.demoInterval = null;
      console.log("[STREAM] Stopped global demo stream");
    }
  }

  /**
   * Get server stats
   */
  getStats() {
    return {
      connectedClients: this.wss.clients.size,
      ingestionStats: this.ingestionManager.getStats(),
    };
  }

  /**
   * Close server
   */
  close() {
    this.stopDemoStream();
    this.wss.close();
  }
}

export function createRealtimeWebSocketServer(server, ingestionManager) {
  return new RealtimeWebSocketServer(server, ingestionManager);
}
