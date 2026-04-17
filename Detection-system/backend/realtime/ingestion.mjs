/**
 * Real-Time Data Ingestion Layer
 * Handles streaming transaction data with queue management
 */

import EventEmitter from "events";

export class TransactionQueue extends EventEmitter {
  constructor(maxSize = 10000) {
    super();
    this.queue = [];
    this.maxSize = maxSize;
    this.stats = {
      totalIngested: 0,
      totalProcessed: 0,
      totalErrors: 0,
      avgProcessingTime: 0,
    };
    this.processingTimes = [];
  }

  /**
   * Add transaction to queue
   */
  enqueue(transaction) {
    if (this.queue.length >= this.maxSize) {
      this.stats.totalErrors++;
      this.emit("queue-full", {
        message: "Queue is full, dropping transaction",
        transaction,
      });
      return false;
    }

    const queuedTxn = {
      id: transaction.id || `TXN-${Date.now()}-${Math.random()}`,
      timestamp: transaction.timestamp || new Date().toISOString(),
      data: transaction,
      status: "pending",
      createdAt: Date.now(),
    };

    this.queue.push(queuedTxn);
    this.stats.totalIngested++;
    this.emit("transaction-enqueued", queuedTxn);
    return true;
  }

  /**
   * Get next transaction from queue
   */
  dequeue() {
    if (this.queue.length === 0) return null;
    return this.queue.shift();
  }

  /**
   * Peek at next transaction without removing
   */
  peek() {
    return this.queue.length > 0 ? this.queue[0] : null;
  }

  /**
   * Batch dequeue
   */
  dequeueBatch(size) {
    const batch = this.queue.splice(0, Math.min(size, this.queue.length));
    return batch;
  }

  /**
   * Record processing time
   */
  recordProcessingTime(txnId, time) {
    this.processingTimes.push(time);
    if (this.processingTimes.length > 1000) {
      this.processingTimes.shift();
    }
    this.stats.avgProcessingTime =
      this.processingTimes.reduce((a, b) => a + b, 0) /
      this.processingTimes.length;
  }

  /**
   * Get queue statistics
   */
  getStats() {
    return {
      ...this.stats,
      queueLength: this.queue.length,
      maxSize: this.maxSize,
      utilizationPercent: ((this.queue.length / this.maxSize) * 100).toFixed(2),
      avgProcessingTime: this.stats.avgProcessingTime.toFixed(2),
    };
  }

  /**
   * Get queue size
   */
  size() {
    return this.queue.length;
  }

  /**
   * Clear queue
   */
  clear() {
    const size = this.queue.length;
    this.queue = [];
    return size;
  }

  /**
   * Check if queue is full
   */
  isFull() {
    return this.queue.length >= this.maxSize;
  }

  /**
   * Check if queue is empty
   */
  isEmpty() {
    return this.queue.length === 0;
  }
}

export class StreamProcessor extends EventEmitter {
  constructor(queue, mlService, batchSize = 10, batchInterval = 1000) {
    super();
    this.queue = queue;
    this.mlService = mlService;
    this.batchSize = batchSize;
    this.batchInterval = batchInterval;
    this.isProcessing = false;
    this.processingInterval = null;
    this.results = new Map();
  }

  /**
   * Start processing stream
   */
  start() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    this.processingInterval = setInterval(() => {
      this.processBatch();
    }, this.batchInterval);

    this.emit("processor-started", { batchSize: this.batchSize });
    console.log("Stream processor started");
  }

  /**
   * Stop processing stream
   */
  stop() {
    if (!this.isProcessing) return;
    this.isProcessing = false;

    if (this.processingInterval) {
      clearInterval(this.processingInterval);
    }

    this.emit("processor-stopped");
    console.log("Stream processor stopped");
  }

  /**
   * Process a batch of transactions
   */
  async processBatch() {
    if (this.queue.isEmpty()) return;

    const batch = this.queue.dequeueBatch(this.batchSize);
    if (batch.length === 0) return;

    const startTime = Date.now();

    try {
      const results = await Promise.allSettled(
        batch.map((txn) => this.processSingleTransaction(txn))
      );

      results.forEach((result, index) => {
        if (result.status === "fulfilled") {
          const processingTime = Date.now() - startTime;
          this.queue.recordProcessingTime(batch[index].id, processingTime);
          this.results.set(batch[index].id, result.value);
          this.emit("transaction-processed", result.value);
        } else {
          this.queue.stats.totalErrors++;
          this.emit("transaction-error", {
            txnId: batch[index].id,
            error: result.reason,
          });
        }
      });

      this.queue.stats.totalProcessed += results.filter(
        (r) => r.status === "fulfilled"
      ).length;
    } catch (error) {
      this.emit("batch-processing-error", { batch, error });
    }
  }

  /**
   * Process single transaction with ML service
   */
  async processSingleTransaction(queuedTxn) {
    queuedTxn.status = "processing";
    const startTime = Date.now();

    try {
      // Call ML service for prediction
      const prediction = await this.mlService.predict(queuedTxn.data);

      // Check if prediction is an error
      if (prediction.error) {
        throw new Error(prediction.error);
      }

      const enrichedResult = {
        ...queuedTxn,
        status: "completed",
        prediction: {
          score: prediction.score,
          risk_level: prediction.risk_level,
          is_fraud: prediction.is_fraud,
        },
        processedAt: new Date().toISOString(),
        inferenceLatency: prediction.inferenceTime || (Date.now() - startTime),
        action: this.determineAction(prediction),
      };

      return enrichedResult;
    } catch (error) {
      queuedTxn.status = "error";
      throw error;
    }
  }

  /**
   * Determine action based on prediction
   */
  determineAction(prediction) {
    // Handle both old and new prediction formats
    const score = prediction.score !== undefined ? prediction.score : prediction.probability || 0;

    if (score >= 0.8) return "block";
    if (score >= 0.5) return "alert";
    if (score >= 0.3) return "review";
    return "approve";
  }

  /**
   * Get result for transaction
   */
  getResult(txnId) {
    return this.results.get(txnId) || null;
  }

  /**
   * Get all results
   */
  getAllResults() {
    return Array.from(this.results.values());
  }

  /**
   * Clear old results (keep last N results)
   */
  clearOldResults(keepCount = 1000) {
    if (this.results.size > keepCount) {
      const entriesToDelete = this.results.size - keepCount;
      let deleted = 0;
      for (const [key] of this.results) {
        if (deleted >= entriesToDelete) break;
        this.results.delete(key);
        deleted++;
      }
    }
  }

  /**
   * Get processor stats
   */
  getStats() {
    return {
      isProcessing: this.isProcessing,
      batchSize: this.batchSize,
      batchInterval: this.batchInterval,
      cachedResults: this.results.size,
    };
  }
}

export class RealtimeIngestionManager extends EventEmitter {
  constructor(mlService, maxQueueSize = 10000) {
    super();
    this.queue = new TransactionQueue(maxQueueSize);
    this.processor = new StreamProcessor(this.queue, mlService);
    this.mlService = mlService;
    this.connectedClients = new Map();
    this.setupEventHandlers();
  }

  /**
   * Setup internal event handlers
   */
  setupEventHandlers() {
    this.queue.on("transaction-enqueued", (txn) => {
      this.emit("transaction-enqueued", txn);
    });

    this.processor.on("transaction-processed", (result) => {
      // Notify connected WebSocket clients
      this.broadcastToClients("transaction-result", result);
      this.emit("transaction-processed", result);
    });

    this.processor.on("transaction-error", (error) => {
      this.emit("transaction-error", error);
    });
  }

  /**
   * Ingest transaction from external source
   */
  ingestTransaction(transaction) {
    const enqueued = this.queue.enqueue(transaction);
    if (!enqueued) {
      this.emit("ingestion-failed", { transaction });
    }
    return enqueued;
  }

  /**
   * Ingest batch of transactions
   */
  ingestBatch(transactions) {
    const results = transactions.map((txn) => this.ingestTransaction(txn));
    return {
      total: transactions.length,
      successful: results.filter((r) => r).length,
      failed: results.filter((r) => !r).length,
    };
  }

  /**
   * Register WebSocket client
   */
  registerClient(clientId, ws) {
    this.connectedClients.set(clientId, ws);
    this.emit("client-connected", { clientId, totalClients: this.connectedClients.size });
  }

  /**
   * Unregister WebSocket client
   */
  unregisterClient(clientId) {
    this.connectedClients.delete(clientId);
    this.emit("client-disconnected", { clientId, totalClients: this.connectedClients.size });
  }

  /**
   * Broadcast message to all connected clients
   */
  broadcastToClients(eventType, data) {
    const message = JSON.stringify({ event: eventType, data });

    this.connectedClients.forEach((ws) => {
      if (ws.readyState === 1) {
        // WebSocket.OPEN
        ws.send(message);
      }
    });
  }

  /**
   * Start the ingestion pipeline
   */
  start() {
    this.processor.start();
    this.emit("ingestion-manager-started");
  }

  /**
   * Stop the ingestion pipeline
   */
  stop() {
    this.processor.stop();
    this.emit("ingestion-manager-stopped");
  }

  /**
   * Get comprehensive stats
   */
  getStats() {
    return {
      queue: this.queue.getStats(),
      processor: this.processor.getStats(),
      connectedClients: this.connectedClients.size,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get health status
   */
  getHealth() {
    const stats = this.getStats();
    const queueUtilization = parseFloat(stats.queue.utilizationPercent);

    let health = "healthy";
    if (queueUtilization > 90) health = "critical";
    else if (queueUtilization > 70) health = "warning";

    return {
      health,
      queue: stats.queue,
      processor: stats.processor,
      connectedClients: stats.connectedClients,
    };
  }
}

// Export singleton instance getter
let ingestionManager = null;

export function getIngestionManager(mlService, maxQueueSize = 10000) {
  if (!ingestionManager) {
    ingestionManager = new RealtimeIngestionManager(mlService, maxQueueSize);
  }
  return ingestionManager;
}

export function resetIngestionManager() {
  if (ingestionManager) {
    ingestionManager.stop();
    ingestionManager = null;
  }
}
