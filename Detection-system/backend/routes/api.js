import express from "express";
import { runCrawler } from "../crawler/crawler.js";
import { predictRisk } from "../services/mlservice.js";

const router = express.Router();

// Root API endpoint
router.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "Detection System API",
    version: "1.0.0",
    endpoints: {
      transactions: "/transactions",
      alerts: "/alerts",
      users: "/users",
      metrics: "/metrics",
      crawl: "/crawl?url=YOUR_URL",
      predict: "/predict (POST)",
      explainFraud: "/explain-fraud (POST)"
    }
  });
});

// Mock data storage
const mockTransactions = [
  {
    id: "TXN-001",
    userId: "USR-4521",
    amount: 12500,
    merchant: "Wire Transfer - Int'l",
    category: "Transfer",
    riskScore: 92,
    riskLevel: "critical",
    status: "blocked",
    timestamp: "2024-01-15 14:32:18",
    location: "Lagos, Nigeria",
    device: "Unknown Device",
    factors: ["New location", "Large amount", "First-time recipient", "Velocity spike"]
  },
  {
    id: "TXN-002",
    userId: "USR-8832",
    amount: 3200,
    merchant: "Electronics Store",
    category: "Retail",
    riskScore: 78,
    riskLevel: "high",
    status: "flagged",
    timestamp: "2024-01-15 14:28:45",
    location: "Miami, FL",
    device: "iPhone 14 Pro",
    factors: ["Unusual merchant category", "Different city than usual"]
  },
  {
    id: "TXN-003",
    userId: "USR-2291",
    amount: 450,
    merchant: "Amazon",
    category: "E-commerce",
    riskScore: 45,
    riskLevel: "medium",
    status: "flagged",
    timestamp: "2024-01-15 14:22:10",
    location: "New York, NY",
    device: "Safari - MacOS",
    factors: ["Unusual merchant category", "Different city than usual"]
  }
];

const mockAlerts = [
  {
    id: "ALT-001",
    title: "Suspicious Wire Transfer Detected",
    description: "Large international wire transfer to a first-time recipient from a new location",
    severity: "critical",
    status: "open",
    userId: "USR-4521",
    transactionId: "TXN-001",
    amount: 12500,
    location: "Lagos, Nigeria",
    timestamp: "2024-01-15 14:32:18",
    notes: ["Auto-blocked by rule R001"]
  },
  {
    id: "ALT-002",
    title: "Multiple Failed Login Attempts",
    description: "15 failed login attempts detected from multiple IP addresses in the last hour",
    severity: "high",
    status: "investigating",
    userId: "USR-8832",
    timestamp: "2024-01-15 14:28:45",
    notes: []
  },
  {
    id: "ALT-003",
    title: "Unusual Transaction Velocity",
    description: "User made 12 transactions in 30 minutes",
    severity: "medium",
    status: "open",
    userId: "USR-2291",
    timestamp: "2024-01-15 14:25:12",
    notes: []
  },
  {
    id: "ALT-004",
    title: "New Device Registration",
    description: "Account accessed from new device",
    severity: "medium",
    status: "open",
    userId: "USR-1105",
    timestamp: "2024-01-15 14:22:33",
    notes: []
  },
  {
    id: "ALT-005",
    title: "Crypto Exchange Transaction",
    description: "High-value crypto purchase with VPN",
    severity: "medium",
    status: "open",
    userId: "USR-9912",
    timestamp: "2024-01-15 14:12:08",
    notes: []
  },
  {
    id: "ALT-006",
    title: "Account Linked to Fraud Network",
    description: "Recipient account flagged in fraud database",
    severity: "medium",
    status: "open",
    userId: "USR-7724",
    timestamp: "2024-01-15 14:18:55",
    notes: []
  },
  {
    id: "ALT-007",
    title: "Large International Transfer",
    description: "Wire to unknown destination",
    severity: "medium",
    status: "open",
    userId: "USR-5432",
    timestamp: "2024-01-15 14:10:15",
    notes: []
  },
  {
    id: "ALT-008",
    title: "Rapid Card Attempts",
    description: "Multiple card validation attempts",
    severity: "medium",
    status: "open",
    userId: "USR-6789",
    timestamp: "2024-01-15 14:08:22",
    notes: []
  },
  {
    id: "ALT-009",
    title: "Geographic Anomaly",
    description: "Transaction from impossible location",
    severity: "medium",
    status: "open",
    userId: "USR-3456",
    timestamp: "2024-01-15 14:05:18",
    notes: []
  },
  {
    id: "ALT-010",
    title: "Account Takeover Risk",
    description: "Behavior pattern mismatch detected",
    severity: "medium",
    status: "open",
    userId: "USR-8901",
    timestamp: "2024-01-15 14:02:11",
    notes: []
  },
  {
    id: "ALT-011",
    title: "Suspicious Login Location",
    description: "Login from unexpected geographic location",
    severity: "medium",
    status: "open",
    userId: "USR-5555",
    timestamp: "2024-01-15 13:58:45",
    notes: []
  },
  {
    id: "ALT-012",
    title: "Failed Verification Attempts",
    description: "Multiple failed identity verification attempts",
    severity: "medium",
    status: "open",
    userId: "USR-6666",
    timestamp: "2024-01-15 13:55:30",
    notes: []
  }
];

const mockUsers = [
  {
    id: "USR-4521",
    name: "James Wilson",
    email: "j.wilson@email.com",
    riskScore: 87,
    accountAge: "3 months",
    lastLogin: "2 min ago",
    location: "Lagos, Nigeria",
    devices: ["Unknown Device", "Chrome - Windows"],
    transactionCount: 45,
    avgTransaction: 2500,
    totalSpend: 112500,
    anomalyCount: 8,
    status: "flagged"
  },
  {
    id: "USR-8832",
    name: "Sarah Chen",
    email: "s.chen@email.com",
    riskScore: 42,
    accountAge: "2 years",
    lastLogin: "5 min ago",
    location: "Miami, FL",
    devices: ["iPhone 14 Pro", "Safari - MacOS"],
    transactionCount: 234,
    avgTransaction: 450,
    totalSpend: 105300,
    anomalyCount: 2,
    status: "normal"
  }
];

// Transactions endpoints
router.get("/transactions", (req, res) => {
  res.json(mockTransactions);
});

router.get("/transactions/:id", (req, res) => {
  const transaction = mockTransactions.find(t => t.id === req.params.id);
  if (!transaction) {
    return res.status(404).json({ error: "Transaction not found" });
  }
  res.json(transaction);
});

// Alerts endpoints
router.get("/alerts", (req, res) => {
  res.json(mockAlerts);
});

router.get("/alerts/:id", (req, res) => {
  const alert = mockAlerts.find(a => a.id === req.params.id);
  if (!alert) {
    return res.status(404).json({ error: "Alert not found" });
  }
  res.json(alert);
});

router.patch("/alerts/:id", (req, res) => {
  const alert = mockAlerts.find(a => a.id === req.params.id);
  if (!alert) {
    return res.status(404).json({ error: "Alert not found" });
  }
  Object.assign(alert, req.body);
  res.json(alert);
});

// Users endpoints
router.get("/users", (req, res) => {
  res.json(mockUsers);
});

router.get("/users/:id", (req, res) => {
  const user = mockUsers.find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  res.json(user);
});

// Dashboard metrics
router.get("/metrics", (req, res) => {
  res.json({
    totalTransactions: 48293,
    transactionGrowth: 12.5,
    flaggedTransactions: 342,
    blockedTransactions: 87,
    openAlerts: 12,
    alertsGrowth: 8.3,
    highRiskUsers: 24,
    usersGrowth: 5.2,
    systemHealth: 94,
    healthTrend: 2
  });
});

// Crawl endpoint
router.get("/crawl", async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({ error: "URL required" });
    }

    const data = await runCrawler(url);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Crawler failed" });
  }
});

// Prediction endpoint
router.post("/predict", async (req, res) => {
  try {
    const result = await predictRisk(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Prediction failed" });
  }
});

// Fraud explanation endpoint
router.post("/explain-fraud", async (req, res) => {
  try {
    const { transactionData } = req.body;
    
    // Get risk prediction
    const prediction = await predictRisk(transactionData);
    
    // Common fraud patterns based on transaction features
    const fraudReasons = [];
    
    if (transactionData.amount > 10000) {
      fraudReasons.push("Large transaction amount detected");
    }
    
    if (transactionData.isNewLocation) {
      fraudReasons.push("Transaction from new geographic location");
    }
    
    if (transactionData.isNewRecipient) {
      fraudReasons.push("First-time transaction with this recipient");
    }
    
    if (transactionData.velocity > 5) {
      fraudReasons.push("Unusual transaction velocity (high frequency)");
    }
    
    if (transactionData.time > 22 || transactionData.time < 6) {
      fraudReasons.push("Transaction at unusual time (late night)");
    }
    
    if (transactionData.isVpnDetected) {
      fraudReasons.push("VPN or proxy detected");
    }
    
    if (transactionData.deviceMismatch) {
      fraudReasons.push("Different device than usual");
    }
    
    res.json({
      ...prediction,
      reasons: fraudReasons.length > 0 ? fraudReasons : ["No anomalies detected"],
      confidence: prediction.risk === "HIGH" ? 0.85 : prediction.risk === "MEDIUM" ? 0.65 : 0.2
    });
  } catch (err) {
    res.status(500).json({ error: "Fraud explanation failed" });
  }
});

export default router;
