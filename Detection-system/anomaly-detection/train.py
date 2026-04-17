import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import confusion_matrix, classification_report
from xgboost import XGBClassifier
import sys
import os
import shap
import pickle

# Add data-generator to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'data-generator'))
from generator import get_data_from_generator

# Configuration: Set to 'generator' to use synthetic data or 'csv' to use creditcard.csv instead
DATA_SOURCE = 'generator'
CSV_PATH = 'creditcard.csv'

# -----------------------------
# 1. Load Dataset (FIXED)
# -----------------------------
if DATA_SOURCE == 'generator':
    print("Loading data from generator...")
    df = get_data_from_generator(
        source='generator',
        n_samples=50000,  # Generate 50k transactions for training
        fraud_ratio=0.001,
        random_seed=42
    )
    print(f"Generated {len(df)} transactions from data generator")
else:
    print(f"Loading data from CSV: {CSV_PATH}")
    if not os.path.exists(CSV_PATH):
        raise FileNotFoundError(f"Dataset not found: {CSV_PATH}")
    df = pd.read_csv(CSV_PATH)

# -----------------------------
# 2. Features and Labels
# -----------------------------
X = df.drop('Class', axis=1)
y = df['Class']

# -----------------------------
# 3. Train-Test Split
# -----------------------------
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# -----------------------------
# 4. Handle Imbalance
# -----------------------------
fraud = sum(y_train == 1)
non_fraud = sum(y_train == 0)
scale_pos_weight = non_fraud / fraud

# -----------------------------
# 5. Model Training (XGBoost)
# -----------------------------
model = XGBClassifier(
    n_estimators=200,
    max_depth=6,
    learning_rate=0.1,
    scale_pos_weight=scale_pos_weight,
    eval_metric='logloss',
    random_state=42,
    use_label_encoder=False
)

model.fit(X_train, y_train)

# -----------------------------
# 6. SHAP Explainer (FIXED)
# -----------------------------
explainer = shap.TreeExplainer(model)

# -----------------------------
# 7. Probability Predictions
# -----------------------------
y_probs = model.predict_proba(X_test)[:, 1]

# -----------------------------
# 8. Apply Custom Threshold
# -----------------------------
THRESHOLD = 0.3
y_pred = (y_probs > THRESHOLD).astype(int)

# -----------------------------
# 9. Evaluation
# -----------------------------
print(f"Threshold Used: {THRESHOLD}")

print("\nConfusion Matrix:")
print(confusion_matrix(y_test, y_pred))

print("\nClassification Report:")
print(classification_report(y_test, y_pred))

# -----------------------------
# 10. Reason Mapping
# ----------------------------- 
FEATURE_MAP = {
    "Amount": "High transaction amount",
    "Time": "Unusual transaction time"
}

def get_fraud_reasons(sample, shap_values, threshold=0.05):
    reasons = []

    for i, feature in enumerate(sample.columns):
        value = shap_values[0][i]

        if value > threshold:
            if feature in FEATURE_MAP:
                reasons.append(FEATURE_MAP[feature])
            else:
                reasons.append(f"{feature} shows anomalous pattern")

    return reasons

# -----------------------------
# 11. Prediction with Reasoning
# -----------------------------
def predict_with_reason(sample):
    prob = model.predict_proba(sample)[0][1]
    prediction = int(prob > THRESHOLD)

    if prediction == 0:
        return {
            "fraud": False,
            "confidence": float(prob)
        }

    shap_values = explainer.shap_values(sample)

    reasons = get_fraud_reasons(sample, shap_values)

    return {
        "fraud": True,
        "confidence": float(prob),
        "reasons": reasons[:3]
    }

# -----------------------------
# 12. Test Sample
# -----------------------------
sample = X_test.iloc[[0]]
result = predict_with_reason(sample)

print("\nSample Prediction:")
print(result)

# -----------------------------
# 13. Save Model
# -----------------------------
pickle.dump(model, open("model.pkl", "wb"))
print("\nModel saved as model.pkl")
