/**
 * ML Service Client for Node.js
 * Provides interface to connect to Python ML inference service
 */

import axios from "axios";

export class MLServiceClient {
  constructor(baseUrl = "http://localhost:5000", timeout = 30000) {
    this.baseUrl = baseUrl.replace(/\/$/, ""); // Remove trailing slash
    this.timeout = timeout;
    this.isHealthy = false;
    this.lastHealthCheck = null;
    this.stats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      totalInferenceTime: 0,
    };
  }

  /**
   * Health check - verify ML service is running
   */
  async healthCheck() {
    try {
      const response = await axios.get(`${this.baseUrl}/health`, {
        timeout: this.timeout,
      });

      this.isHealthy = response.data.model_loaded;
      this.lastHealthCheck = new Date().toISOString();
      console.log("✅ ML Service healthy");
      return this.isHealthy;
    } catch (error) {
      this.isHealthy = false;
      console.error("❌ ML Service health check failed:", error.message);
      return false;
    }
  }

  /**
   * Ready check - verify model is loaded and ready
   */
  async readyCheck() {
    try {
      const response = await axios.get(`${this.baseUrl}/ready`, {
        timeout: this.timeout,
      });
      return response.status === 200;
    } catch (error) {
      console.error("Model not ready:", error.message);
      return false;
    }
  }

  /**
   * Get single prediction
   */
  async predict(transaction) {
    const startTime = Date.now();
    this.stats.totalRequests++;

    try {
      const response = await axios.post(`${this.baseUrl}/predict`, transaction, {
        timeout: this.timeout,
        headers: { "Content-Type": "application/json" },
      });

      const inferenceTime = Date.now() - startTime;
      this.stats.successfulRequests++;
      this.stats.totalInferenceTime += inferenceTime;

      return {
        ...response.data,
        transactionId: transaction.id,
        inferenceTime: inferenceTime,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.stats.failedRequests++;
      console.error("Prediction error:", error.message);
      throw error;
    }
  }

  /**
   * Get batch predictions
   */
  async predictBatch(transactions) {
    const startTime = Date.now();
    this.stats.totalRequests++;

    try {
      const response = await axios.post(
        `${this.baseUrl}/predict-batch`,
        transactions,
        {
          timeout: this.timeout * 2, // Double timeout for batches
          headers: { "Content-Type": "application/json" },
        }
      );

      const inferenceTime = Date.now() - startTime;
      this.stats.successfulRequests++;
      this.stats.totalInferenceTime += inferenceTime;

      // Add transaction IDs to results
      const results = response.data.predictions.map((pred, index) => ({
        ...pred,
        transactionId: transactions[index].id,
        inferenceTime: inferenceTime / transactions.length, // Average per transaction
      }));

      return results;
    } catch (error) {
      this.stats.failedRequests += transactions.length;
      console.error("Batch prediction error:", error.message);
      throw error;
    }
  }

  /**
   * Get inference statistics
   */
  async getStats() {
    try {
      const response = await axios.get(`${this.baseUrl}/stats`, {
        timeout: this.timeout,
      });

      // Add client-side stats
      return {
        service: response.data,
        client: {
          totalRequests: this.stats.totalRequests,
          successfulRequests: this.stats.successfulRequests,
          failedRequests: this.stats.failedRequests,
          avgInferenceTime: (
            this.stats.totalInferenceTime / this.stats.successfulRequests
          ).toFixed(2),
        },
      };
    } catch (error) {
      console.error("Stats request failed:", error.message);
      return { error: error.message };
    }
  }

  /**
   * Reset statistics
   */
  async resetStats() {
    try {
      await axios.post(`${this.baseUrl}/stats/reset`, {}, {
        timeout: this.timeout,
      });

      this.stats = {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        totalInferenceTime: 0,
      };

      return true;
    } catch (error) {
      console.error("Reset stats failed:", error.message);
      return false;
    }
  }

  /**
   * Get model information
   */
  async getModelInfo() {
    try {
      const response = await axios.get(`${this.baseUrl}/model-info`, {
        timeout: this.timeout,
      });
      return response.data;
    } catch (error) {
      console.error("Model info request failed:", error.message);
      return { error: error.message };
    }
  }

  /**
   * Get client statistics
   */
  getClientStats() {
    const avgTime =
      this.stats.successfulRequests > 0
        ? (this.stats.totalInferenceTime / this.stats.successfulRequests).toFixed(
            2
          )
        : 0;

    return {
      isHealthy: this.isHealthy,
      lastHealthCheck: this.lastHealthCheck,
      totalRequests: this.stats.totalRequests,
      successfulRequests: this.stats.successfulRequests,
      failedRequests: this.stats.failedRequests,
      successRate: (
        (this.stats.successfulRequests / this.stats.totalRequests) *
        100
      ).toFixed(2),
      avgInferenceTime: avgTime,
    };
  }
}

/**
 * Async wrapper to ensure model is ready before predictions
 */
export class SafeMLServiceClient {
  constructor(baseUrl = "http://localhost:5000", retries = 3) {
    this.client = new MLServiceClient(baseUrl);
    this.retries = retries;
    this.isReady = false;
  }

  /**
   * Initialize and verify connection
   */
  async initialize() {
    for (let i = 0; i < this.retries; i++) {
      const ready = await this.client.readyCheck();
      if (ready) {
        this.isReady = true;
        console.log("✅ ML Service initialized and ready");
        return true;
      }
      console.log(`⏳ Waiting for ML Service... (attempt ${i + 1}/${this.retries})`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    console.error("❌ ML Service failed to initialize");
    return false;
  }

  /**
   * Predict with safety checks
   */
  async predict(transaction) {
    if (!this.isReady) {
      const ready = await this.initialize();
      if (!ready) {
        throw new Error("ML Service is not ready");
      }
    }

    return this.client.predict(transaction);
  }

  /**
   * Batch predict with safety checks
   */
  async predictBatch(transactions) {
    if (!this.isReady) {
      const ready = await this.initialize();
      if (!ready) {
        throw new Error("ML Service is not ready");
      }
    }

    return this.client.predictBatch(transactions);
  }

  /**
   * Get all stats
   */
  async getStats() {
    return this.client.getStats();
  }

  /**
   * Get model info
   */
  async getModelInfo() {
    return this.client.getModelInfo();
  }

  /**
   * Get client stats
   */
  getClientStats() {
    return this.client.getClientStats();
  }
}

export default MLServiceClient;
