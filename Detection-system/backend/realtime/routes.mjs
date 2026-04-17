/**
 * Real-Time Ingestion API Routes
 * HTTP endpoints for real-time data ingestion
 */

import express from "express";
import { getIngestionManager } from "./ingestion.mjs";

export function createRealtimeRoutes(ingestionManager) {
  const router = express.Router();

  /**
   * POST /realtime/ingest
   * Ingest single transaction in real-time
   */
  router.post("/ingest", (req, res) => {
    try {
      const transaction = req.body;

      if (!transaction) {
        return res.status(400).json({ error: "Transaction data required" });
      }

      const success = ingestionManager.ingestTransaction(transaction);

      res.json({
        success,
        transactionId: transaction.id,
        queueSize: ingestionManager.queue.size(),
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * POST /realtime/batch-ingest
   * Ingest multiple transactions in real-time
   */
  router.post("/batch-ingest", (req, res) => {
    try {
      const transactions = req.body;

      if (!Array.isArray(transactions)) {
        return res.status(400).json({ error: "Array of transactions required" });
      }

      const result = ingestionManager.ingestBatch(transactions);

      res.json({
        ...result,
        queueSize: ingestionManager.queue.size(),
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /realtime/stats
   * Get current ingestion pipeline statistics
   */
  router.get("/stats", (req, res) => {
    try {
      const stats = ingestionManager.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /realtime/health
   * Get health status of ingestion system
   */
  router.get("/health", (req, res) => {
    try {
      const health = ingestionManager.getHealth();
      const statusCode = health.health === "critical" ? 503 : 200;
      res.status(statusCode).json(health);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /realtime/queue-size
   * Get current queue size
   */
  router.get("/queue-size", (req, res) => {
    try {
      const size = ingestionManager.queue.size();
      const stats = ingestionManager.queue.getStats();
      res.json({
        queueSize: size,
        maxSize: stats.maxSize,
        utilizationPercent: stats.utilizationPercent,
        totalIngested: stats.totalIngested,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /realtime/results/:transactionId
   * Get processing result for specific transaction
   */
  router.get("/results/:transactionId", (req, res) => {
    try {
      const { transactionId } = req.params;
      const result = ingestionManager.processor.getResult(transactionId);

      if (!result) {
        return res.status(404).json({
          error: "Transaction not found or still processing",
          transactionId,
        });
      }

      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /realtime/results
   * Get all recent results
   */
  router.get("/results", (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 100;
      const allResults = ingestionManager.processor.getAllResults();
      const recent = allResults.slice(-limit);

      res.json({
        total: allResults.length,
        limit,
        results: recent,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * POST /realtime/clear-old-results
   * Clear old cached results
   */
  router.post("/clear-old-results", (req, res) => {
    try {
      const keepCount = req.body.keepCount || 1000;
      ingestionManager.processor.clearOldResults(keepCount);

      res.json({
        message: "Old results cleared",
        keepCount,
        cachedResults: ingestionManager.processor.results.size,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * POST /realtime/start
   * Start the ingestion pipeline
   */
  router.post("/start", (req, res) => {
    try {
      ingestionManager.start();
      res.json({
        success: true,
        message: "Ingestion pipeline started",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * POST /realtime/stop
   * Stop the ingestion pipeline
   */
  router.post("/stop", (req, res) => {
    try {
      ingestionManager.stop();
      res.json({
        success: true,
        message: "Ingestion pipeline stopped",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /realtime/connected-clients
   * Get number of connected WebSocket clients
   */
  router.get("/connected-clients", (req, res) => {
    try {
      const stats = ingestionManager.getStats();
      res.json({
        connectedClients: stats.connectedClients,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}

export default createRealtimeRoutes;
