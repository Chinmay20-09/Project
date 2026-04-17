/**
 * Real-Time Ingestion Configuration
 */

export const realtimeConfig = {
  // Queue configuration
  queue: {
    maxSize: process.env.QUEUE_MAX_SIZE || 10000,
  },

  // Stream processor configuration
  processor: {
    batchSize: process.env.BATCH_SIZE || 10,
    batchInterval: process.env.BATCH_INTERVAL || 1000, // ms
  },

  // WebSocket configuration
  websocket: {
    enabled: process.env.WEBSOCKET_ENABLED !== "false",
    heartbeatInterval: process.env.WS_HEARTBEAT_INTERVAL || 30000, // ms
  },

  // Processing thresholds
  thresholds: {
    blockScore: process.env.BLOCK_SCORE || 0.8,
    alertScore: process.env.ALERT_SCORE || 0.5,
    reviewScore: process.env.REVIEW_SCORE || 0.3,
  },

  // Monitoring
  monitoring: {
    logsEnabled: process.env.LOGS_ENABLED !== "false",
    metricsEnabled: process.env.METRICS_ENABLED !== "false",
  },
};

export function getRealtimeConfig() {
  return realtimeConfig;
}

export function updateRealtimeConfig(updates) {
  Object.assign(realtimeConfig, updates);
}
