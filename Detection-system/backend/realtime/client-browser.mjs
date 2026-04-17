/**
 * Real-Time Ingestion Client for Browser/Frontend
 * Browser-compatible version of the ingestion client
 */

export class RealtimeIng​estionClient {
  constructor(wsUrl = "ws://localhost:3000") {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.isConnected = false;
    this.messageHandlers = new Map();
    this.requestId = 0;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
  }

  /**
   * Connect to the WebSocket server
   */
  async connect() {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.wsUrl);

        this.ws.onopen = () => {
          this.isConnected = true;
          this.reconnectAttempts = 0;
          console.log("✅ Connected to real-time server");
          this.emit("connected");
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
        };

        this.ws.onerror = (error) => {
          console.error("❌ WebSocket error:", error);
          this.emit("error", error);
          reject(error);
        };

        this.ws.onclose = () => {
          this.isConnected = false;
          console.log("⚠️ Disconnected from server");
          this.emit("disconnected");
          this.attemptReconnect();
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Attempt to reconnect
   */
  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * this.reconnectAttempts;
      console.log(
        `🔄 Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`
      );

      setTimeout(() => {
        this.connect().catch(() => {
          // Error already logged in connect()
        });
      }, delay);
    }
  }

  /**
   * Disconnect from server
   */
  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
  }

  /**
   * Handle incoming message
   */
  handleMessage(data) {
    try {
      const message = JSON.parse(data);
      const { event, data: messageData } = message;

      // Call registered handlers
      if (this.messageHandlers.has(event)) {
        const handlers = this.messageHandlers.get(event);
        handlers.forEach((handler) => {
          try {
            handler(messageData);
          } catch (error) {
            console.error(`Error in ${event} handler:`, error);
          }
        });
      }

      // Generic "message" event
      this.emit("message", { event, data: messageData });
    } catch (error) {
      console.error("Error parsing message:", error);
    }
  }

  /**
   * Send message to server
   */
  send(type, data) {
    if (!this.isConnected) {
      throw new Error("Not connected to server");
    }

    try {
      this.ws.send(JSON.stringify({ type, data }));
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  }

  /**
   * Ingest single transaction
   */
  ingestTransaction(transaction) {
    if (!transaction.id) {
      transaction.id = `TXN-${Date.now()}-${Math.random()}`;
    }
    if (!transaction.timestamp) {
      transaction.timestamp = new Date().toISOString();
    }
    this.send("ingest", transaction);
    return transaction.id;
  }

  /**
   * Ingest batch of transactions
   */
  ingestBatch(transactions) {
    const augmented = transactions.map((txn) => ({
      ...txn,
      id: txn.id || `TXN-${Date.now()}-${Math.random()}`,
      timestamp: txn.timestamp || new Date().toISOString(),
    }));
    this.send("batch-ingest", augmented);
    return augmented.map((t) => t.id);
  }

  /**
   * Query statistics
   */
  async queryStats() {
    return this.sendRequest("query-stats", {});
  }

  /**
   * Query health status
   */
  async queryHealth() {
    return this.sendRequest("query-health", {});
  }

  /**
   * Query result for transaction
   */
  async queryResult(transactionId) {
    return this.sendRequest("query-result", { transactionId });
  }

  /**
   * Send request and wait for response
   */
  async sendRequest(type, data) {
    return new Promise((resolve, reject) => {
      const requestId = ++this.requestId;
      const timeout = setTimeout(() => {
        reject(new Error(`Request ${type} timeout`));
      }, 10000);

      const originalHandler = (response) => {
        clearTimeout(timeout);
        resolve(response);
      };

      this.once(`${type}-${requestId}`, originalHandler);
      data.requestId = requestId;
      this.send(type, data);
    });
  }

  /**
   * Register event handler
   */
  on(event, handler) {
    if (!this.messageHandlers.has(event)) {
      this.messageHandlers.set(event, []);
    }
    this.messageHandlers.get(event).push(handler);
  }

  /**
   * Register one-time event handler
   */
  once(event, handler) {
    const wrappedHandler = (data) => {
      handler(data);
      this.off(event, wrappedHandler);
    };
    this.on(event, wrappedHandler);
  }

  /**
   * Unregister event handler
   */
  off(event, handler) {
    if (!this.messageHandlers.has(event)) return;
    const handlers = this.messageHandlers.get(event);
    const index = handlers.indexOf(handler);
    if (index > -1) {
      handlers.splice(index, 1);
    }
  }

  /**
   * Emit local event
   */
  emit(event, data) {
    if (!this.messageHandlers.has(event)) return;
    const handlers = this.messageHandlers.get(event);
    handlers.forEach((handler) => {
      try {
        handler(data);
      } catch (error) {
        console.error(`Error in ${event} handler:`, error);
      }
    });
  }

  /**
   * Send ping to keep connection alive
   */
  ping() {
    try {
      this.send("ping", { timestamp: Date.now() });
    } catch (error) {
      console.error("Error sending ping:", error);
    }
  }

  /**
   * Start heartbeat
   */
  startHeartbeat(interval = 30000) {
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected) {
        this.ping();
      }
    }, interval);
  }

  /**
   * Stop heartbeat
   */
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
  }

  /**
   * Get connection status
   */
  getStatus() {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      wsUrl: this.wsUrl,
    };
  }
}

// Make available globally in browser
if (typeof window !== "undefined") {
  window.RealtimeIngestionClient = RealtimeIngestionClient;
}

export default RealtimeIngestionClient;
