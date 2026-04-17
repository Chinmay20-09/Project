/**
 * Real-Time Data Ingestion Client Library
 * Simple client for connecting to the real-time WebSocket server and sending data
 */

export class RealtimeIngestionClient {
  constructor(wsUrl = "ws://localhost:3000") {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.isConnected = false;
    this.messageHandlers = new Map();
    this.pendingRequests = new Map();
    this.requestId = 0;
  }

  /**
   * Connect to the WebSocket server
   */
  connect() {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.wsUrl);

        this.ws.onopen = () => {
          this.isConnected = true;
          console.log("Connected to real-time server");
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
        };

        this.ws.onerror = (error) => {
          console.error("WebSocket error:", error);
          reject(error);
        };

        this.ws.onclose = () => {
          this.isConnected = false;
          console.log("Disconnected from real-time server");
        };
      } catch (error) {
        reject(error);
      }
    });
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
        handlers.forEach((handler) => handler(messageData));
      }

      // Handle request responses
      if (messageData && messageData.requestId) {
        const pending = this.pendingRequests.get(messageData.requestId);
        if (pending) {
          pending.resolve(messageData);
          this.pendingRequests.delete(messageData.requestId);
        }
      }
    } catch (error) {
      console.error("Error handling message:", error);
    }
  }

  /**
   * Send message to server
   */
  send(type, data) {
    if (!this.isConnected) {
      throw new Error("Not connected to server");
    }

    this.ws.send(JSON.stringify({ type, data }));
  }

  /**
   * Ingest single transaction
   */
  ingestTransaction(transaction) {
    this.send("ingest", transaction);
  }

  /**
   * Ingest batch of transactions
   */
  ingestBatch(transactions) {
    this.send("batch-ingest", transactions);
  }

  /**
   * Query statistics
   */
  queryStats() {
    return this.sendRequest("query-stats", {});
  }

  /**
   * Query health status
   */
  queryHealth() {
    return this.sendRequest("query-health", {});
  }

  /**
   * Query result for transaction
   */
  queryResult(transactionId) {
    return this.sendRequest("query-result", { transactionId });
  }

  /**
   * Send request and wait for response
   */
  sendRequest(type, data) {
    return new Promise((resolve, reject) => {
      const requestId = ++this.requestId;
      const timeout = setTimeout(
        () => {
          this.pendingRequests.delete(requestId);
          reject(new Error("Request timeout"));
        },
        5000
      );

      this.pendingRequests.set(requestId, {
        resolve: (response) => {
          clearTimeout(timeout);
          resolve(response);
        },
        reject: (error) => {
          clearTimeout(timeout);
          reject(error);
        },
      });

      this.send(type, { ...data, requestId });
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
   * Send ping to keep connection alive
   */
  ping() {
    this.send("ping", {});
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
}

// Browser-compatible version
if (typeof window !== "undefined") {
  window.RealtimeIngestionClient = RealtimeIngestionClient;
}

export default RealtimeIngestionClient;
