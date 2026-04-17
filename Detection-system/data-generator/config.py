"""
Configuration for Data Generation
Central place to manage data source settings
"""

# ============================================
# DATA SOURCE CONFIGURATION
# ============================================

# Available sources: 'generator' or 'csv'
DEFAULT_DATA_SOURCE = 'generator'

# Path to CSV file (used if DATA_SOURCE is 'csv')
CSV_FILE_PATH = 'creditcard.csv'
PREDICT_CSV_PATH = "G:\\KAAM\\Hackathon\\archive\\creditcard.csv"

# ============================================
# TRAINING CONFIGURATION
# ============================================

TRAINING = {
    'data_source': 'generator',
    'n_samples': 50000,  # Number of transactions to generate/load
    'fraud_ratio': 0.001,  # 0.1% fraud rate (matches real-world data)
    'random_seed': 42,
    'test_size': 0.2,
    'stratify': True,
}

# ============================================
# PREDICTION CONFIGURATION
# ============================================

PREDICTION = {
    'data_source': 'generator',
    'n_samples': 10000,  # Number of transactions to generate/load
    'fraud_ratio': 0.001,
    'use_user_ids': True,  # Generate with user IDs
    'n_users': 10,  # Number of unique users
    'random_seed': 123,
}

# ============================================
# MODEL CONFIGURATION
# ============================================

MODEL = {
    'n_estimators': 200,
    'max_depth': 6,
    'learning_rate': 0.1,
    'eval_metric': 'logloss',
    'random_state': 42,
}

# ============================================
# PREDICTION THRESHOLDS
# ============================================

THRESHOLDS = {
    'training_threshold': 0.3,  # Threshold for classification during training
    'alert_threshold': 0.05,    # Alert threshold during prediction
    'block_threshold': 0.15,    # Block threshold during prediction
}

# ============================================
# HELPER FUNCTION
# ============================================

def get_config(section):
    """Get configuration for a specific section"""
    configs = {
        'training': TRAINING,
        'prediction': PREDICTION,
        'model': MODEL,
        'thresholds': THRESHOLDS,
    }
    return configs.get(section, {})
