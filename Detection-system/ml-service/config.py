"""
ML Service Configuration
"""

import os

# Server configuration
HOST = os.getenv("ML_SERVICE_HOST", "0.0.0.0")
PORT = int(os.getenv("ML_SERVICE_PORT", 5000))
DEBUG = os.getenv("DEBUG", "False").lower() == "true"

# Model configuration
MODEL_PATH = os.getenv("MODEL_PATH", "model.pkl")
MODEL_VERSION = "xgboost-v1"
FEATURE_COUNT = 30

# Service configuration
REQUEST_TIMEOUT = int(os.getenv("REQUEST_TIMEOUT", 30))
BATCH_SIZE_LIMIT = int(os.getenv("BATCH_SIZE_LIMIT", 1000))

# Logging configuration
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
LOG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"

# Features
FEATURES = [f"V{i}" for i in range(1, 29)] + ["Time", "Amount"]

# Thresholds for risk levels
RISK_THRESHOLDS = {
    "CRITICAL": 0.8,
    "HIGH": 0.6,
    "MEDIUM": 0.4,
    "LOW": 0.2,
    "MINIMAL": 0.0,
}

# Feature statistics (for normalization if needed)
FEATURE_STATS = {
    "Time": {"mean": 86400, "std": 47461},  # Statistics from training data
    "Amount": {"mean": 88.26, "std": 250.12},
    # Add more as needed
}

def get_config():
    """Get current configuration"""
    return {
        "host": HOST,
        "port": PORT,
        "debug": DEBUG,
        "model_path": MODEL_PATH,
        "model_version": MODEL_VERSION,
        "features": FEATURES,
        "thresholds": RISK_THRESHOLDS,
    }
