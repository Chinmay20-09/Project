/**
 * Real-Time Data Ingestion Examples
 * Example scripts demonstrating real-time fraud detection
 */

import { RealtimeIngestionClient } from "./client.mjs";

/**
 * Example 1: Connect and ingest single transaction
 */
export async function example1_SingleTransaction() {
  const client = new RealtimeIngestionClient("ws://localhost:3000");

  try {
    // Connect to server
    await client.connect();
    console.log("✅ Connected to real-time server");

    // Create a transaction
    const transaction = {
      id: `TXN-${Date.now()}`,
      amount: 5000,
      merchant: "Online Store",
      userId: "USR-123",
      timestamp: new Date().toISOString(),
      // ... other transaction fields
    };

    // Send transaction
    client.ingestTransaction(transaction);
    console.log("✅ Transaction sent:", transaction.id);

    // Listen for result
    client.on("transaction-result", (result) => {
      console.log("✅ Transaction processed:", result);
      console.log("Action:", result.action);
    });

    // Wait a bit then disconnect
    setTimeout(() => {
      client.disconnect();
    }, 5000);
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

/**
 * Example 2: Batch ingest multiple transactions
 */
export async function example2_BatchIngest() {
  const client = new RealtimeIngestionClient("ws://localhost:3000");

  try {
    await client.connect();
    console.log("✅ Connected");

    // Create batch of transactions
    const transactions = [];
    for (let i = 0; i < 100; i++) {
      transactions.push({
        id: `TXN-BATCH-${i}`,
        amount: Math.random() * 2000,
        merchant: `Store ${i % 10}`,
        userId: `USR-${Math.floor(Math.random() * 100)}`,
        timestamp: new Date().toISOString(),
      });
    }

    // Send batch
    client.ingestBatch(transactions);
    console.log("✅ Batch sent:", transactions.length);

    // Listen for individual results
    let processedCount = 0;
    client.on("transaction-result", (result) => {
      processedCount++;
      if (result.action === "block") {
        console.log(`🚨 Fraud detected: ${result.id}`);
      }
    });

    // Disconnect after all processed
    setTimeout(() => {
      console.log(`✅ Processed: ${processedCount} transactions`);
      client.disconnect();
    }, 10000);
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

/**
 * Example 3: Real-time monitoring with heartbeat
 */
export async function example3_RealtimeMonitoring() {
  const client = new RealtimeIngestionClient("ws://localhost:3000");

  try {
    await client.connect();
    console.log("✅ Connected - Starting real-time monitoring");

    // Start heartbeat to keep connection alive
    client.startHeartbeat(30000);

    // Listen for events
    client.on("transaction-result", (result) => {
      console.log(`📊 [${result.id}] Score: ${result.prediction.score}, Action: ${result.action}`);
    });

    client.on("transaction-error", (error) => {
      console.error(`❌ Error processing transaction:`, error);
    });

    // Query stats every 5 seconds
    setInterval(async () => {
      const stats = await client.queryStats();
      console.log("📈 Queue size:", stats.queue.queueLength);
      console.log("   Processed:", stats.queue.totalProcessed);
    }, 5000);

    // Keep running (this is example, normally runs indefinitely)
    // In real app: client.stopHeartbeat() and client.disconnect() when done
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

/**
 * Example 4: Simulated continuous transaction stream
 */
export async function example4_ContinuousStream() {
  const client = new RealtimeIngestionClient("ws://localhost:3000");

  try {
    await client.connect();
    console.log("✅ Connected - Simulating transaction stream");

    let sentCount = 0;
    let fraudCount = 0;

    // Start heartbeat
    client.startHeartbeat(30000);

    // Listen for results
    client.on("transaction-result", (result) => {
      if (result.action === "block") {
        fraudCount++;
        console.log(`🚨 FRAUD DETECTED [${result.id}]: Score ${result.prediction.score}`);
      }
    });

    // Simulate continuous incoming transactions
    const streamInterval = setInterval(() => {
      const isFraud = Math.random() < 0.001; // 0.1% fraud rate
      const transaction = {
        id: `TXN-STREAM-${sentCount}`,
        amount: isFraud ? 10000 + Math.random() * 5000 : Math.random() * 500,
        merchant: `Merchant-${Math.floor(Math.random() * 1000)}`,
        userId: `USR-${Math.floor(Math.random() * 500)}`,
        timestamp: new Date().toISOString(),
        isFraud: isFraud, // Simulated flag
      };

      client.ingestTransaction(transaction);
      sentCount++;

      if (sentCount % 100 === 0) {
        console.log(`📊 Sent: ${sentCount}, Fraud detected: ${fraudCount}`);
      }

      // Stop after 1000 transactions
      if (sentCount >= 1000) {
        clearInterval(streamInterval);
        setTimeout(() => {
          client.stopHeartbeat();
          client.disconnect();
          console.log("✅ Stream ended");
        }, 2000);
      }
    }, 100); // One transaction every 100ms
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

/**
 * Example 5: Query system health and stats
 */
export async function example5_HealthAndStats() {
  const client = new RealtimeIngestionClient("ws://localhost:3000");

  try {
    await client.connect();
    console.log("✅ Connected");

    // Query health
    const health = await client.queryHealth();
    console.log("Health Status:");
    console.log(health);

    // Query stats
    const stats = await client.queryStats();
    console.log("\nIngestion Stats:");
    console.log(stats);

    client.disconnect();
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

/**
 * Example 6: HTTP API (Alternative to WebSocket)
 */
export async function example6_HTTPApi() {
  const API_BASE = "http://localhost:3000/api/realtime";

  try {
    // Ingest single transaction
    const response = await fetch(`${API_BASE}/ingest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: `TXN-HTTP-${Date.now()}`,
        amount: 3000,
        merchant: "Store",
        userId: "USR-123",
      }),
    });
    const result = await response.json();
    console.log("✅ Transaction ingested:", result);

    // Get stats
    const statsRes = await fetch(`${API_BASE}/stats`);
    const stats = await statsRes.json();
    console.log("📊 Stats:", stats);

    // Get health
    const healthRes = await fetch(`${API_BASE}/health`);
    const health = await healthRes.json();
    console.log("💚 Health:", health);
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

// Run examples (uncomment to test)
// example1_SingleTransaction().catch(console.error);
// example2_BatchIngest().catch(console.error);
// example3_RealtimeMonitoring().catch(console.error);
// example4_ContinuousStream().catch(console.error);
// example5_HealthAndStats().catch(console.error);
// example6_HTTPApi().catch(console.error);

export default {
  example1_SingleTransaction,
  example2_BatchIngest,
  example3_RealtimeMonitoring,
  example4_ContinuousStream,
  example5_HealthAndStats,
  example6_HTTPApi,
};
