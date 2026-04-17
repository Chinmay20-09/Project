import pickle
import pandas as pd
import numpy as np
import sys
import os

# Add data-generator to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'data-generator'))
from generator import get_data_from_generator

# Configuration: Set to 'generator' to use synthetic data or 'csv' to use static data
DATA_SOURCE = 'generator'  # Change to 'csv' to use creditcard.csv instead
CSV_PATH = "G:\\KAAM\\Hackathon\\archive\\creditcard.csv"

# -------------------------------
# 1. Load trained model
# -------------------------------
with open("model.pkl", "rb") as f:
    model = pickle.load(f)

# -------------------------------
# 2. Load dataset
# -------------------------------
if DATA_SOURCE == 'generator':
    print("Loading data from generator...")
    df = get_data_from_generator(
        source='generator',
        n_samples=10000,  # Generate 10k transactions for prediction
        fraud_ratio=0.001,
        use_user_ids=True,  # Add user_id column for multi-user scenario
        n_users=10,
        random_seed=123  # Different seed for diversity
    )
    print(f"Generated {len(df)} transactions from data generator")
else:
    print(f"Loading data from CSV: {CSV_PATH}")
    df = pd.read_csv(CSV_PATH)

# Extract user_id if it exists, otherwise create synthetic ones
if 'user_id' not in df.columns:
    df['user_id'] = np.random.randint(1000, 1010, size=len(df))

# Store original data before modifications
original_df = df.copy()

# -------------------------------
# 3. Select a user
# -------------------------------
# Select first available user from data
selected_user = df['user_id'].unique()[0] if len(df['user_id'].unique()) > 0 else 1001
user_df = df[df['user_id'] == selected_user].copy()

print(f"Selected User: {selected_user}")
print(f"Total Transactions for User: {len(user_df)}")

# -------------------------------
# 5. Prepare features
# -------------------------------
# Remove non-feature columns
feature_cols = [col for col in user_df.columns if col not in ['Class', 'user_id']]
X = user_df[feature_cols]

# -------------------------------
# 6. Predict probabilities
# -------------------------------
probs = model.predict_proba(X)[:, 1]
user_df['fraud_prob'] = probs
print("\nMax fraud probability:", user_df['fraud_prob'].max())
print("Min fraud probability:", user_df['fraud_prob'].min())

# -------------------------------
# 7. Define thresholds
# -------------------------------
THRESHOLD_ALERT = 0.05
THRESHOLD_BLOCK = 0.15

def classify_action(prob):
    if prob >= THRESHOLD_BLOCK:
        return "blocked"
    elif prob >= THRESHOLD_ALERT:
        return "alert"
    else:
        return "safe"

user_df['action'] = user_df['fraud_prob'].apply(classify_action)

# -------------------------------
# 8. Final Outputs
# -------------------------------
transactions_analysed = len(user_df)
fraud_alerts = len(user_df[user_df['action'] == 'alert'])
frauds_blocked = len(user_df[user_df['action'] == 'blocked'])

# -------------------------------
# 9. Print Results
# -------------------------------
print("\n--- USER FRAUD SUMMARY ---")
print("Transactions Analysed:", transactions_analysed)
print("Fraud Alerts:", fraud_alerts)
print("Frauds Blocked:", frauds_blocked)

# Optional: preview
print("\nSample Data:")
print(user_df[['fraud_prob', 'action']].head())