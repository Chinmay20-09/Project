"""
Real-Time Model Inference Service
Serves XGBoost fraud detection model predictions via REST API
"""

import os
import sys
import pickle
import json
import logging
from typing import Dict, List, Optional, Tuple
import numpy as np
import pandas as pd
from datetime import datetime
import traceback
from flask import Flask, request, jsonify, make_response

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class ModelManager:
    """Manages model loading, caching, and inference"""
    
    def __init__(self, model_path: str = "model.pkl"):
        """Initialize model manager"""
        self.model_path = model_path
        self.model = None
        self.is_loaded = False
        self.load_time = None
        self.inference_count = 0
        self.error_count = 0
        self.total_inference_time = 0.0
        self.feature_names = [f"V{i}" for i in range(1, 29)] + ["Time", "Amount"]
        
    def load_model(self) -> bool:
        """Load model from disk"""
        try:
            if not os.path.exists(self.model_path):
                logger.error(f"Model file not found: {self.model_path}")
                return False
            
            with open(self.model_path, 'rb') as f:
                self.model = pickle.load(f)
            
            self.is_loaded = True
            self.load_time = datetime.now().isoformat()
            logger.info(f"✅ Model loaded successfully from {self.model_path}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Error loading model: {str(e)}")
            self.is_loaded = False
            return False
    
    def is_ready(self) -> bool:
        """Check if model is ready for inference"""
        return self.is_loaded and self.model is not None
    
    def predict_single(self, features: Dict) -> Dict:
        """
        Predict for single transaction
        
        Args:
            features: Dictionary with feature values
        
        Returns:
            Prediction result with score and risk level
        """
        if not self.is_ready():
            raise ValueError("Model not loaded. Call load_model() first.")
        
        try:
            # Prepare features in correct order
            feature_vector = self._prepare_features(features)
            
            # Get prediction probability
            score = self.model.predict_proba(feature_vector)[0][1]
            
            # Determine risk level
            risk_level = self._determine_risk_level(score)
            
            # Update stats
            self.inference_count += 1
            
            return {
                'score': float(score),
                'risk_level': risk_level,
                'is_fraud': int(score > 0.5),
                'metadata': {
                    'model_version': 'xgboost-v1',
                    'inference_time': datetime.now().isoformat(),
                    'feature_count': len(feature_vector[0])
                }
            }
            
        except Exception as e:
            self.error_count += 1
            logger.error(f"❌ Error in prediction: {str(e)}")
            raise
    
    def predict_batch(self, transactions: List[Dict]) -> List[Dict]:
        """
        Predict for multiple transactions
        
        Args:
            transactions: List of transaction dictionaries
        
        Returns:
            List of prediction results
        """
        if not self.is_ready():
            raise ValueError("Model not loaded. Call load_model() first.")
        
        results = []
        
        try:
            # Prepare all features
            feature_vectors = []
            for txn in transactions:
                features = self._prepare_features(txn)
                feature_vectors.append(features[0])
            
            # Stack into matrix
            X = np.array(feature_vectors)
            
            # Get predictions
            scores = self.model.predict_proba(X)[:, 1]
            
            # Build results
            for i, score in enumerate(scores):
                risk_level = self._determine_risk_level(score)
                results.append({
                    'transaction_id': transactions[i].get('id', f'TXN-{i}'),
                    'score': float(score),
                    'risk_level': risk_level,
                    'is_fraud': int(score > 0.5)
                })
            
            self.inference_count += len(transactions)
            
            return results
            
        except Exception as e:
            self.error_count += len(transactions)
            logger.error(f"❌ Error in batch prediction: {str(e)}")
            raise
    
    def _prepare_features(self, transaction: Dict) -> np.ndarray:
        """Prepare transaction features for model"""
        features = []
        
        # Extract PCA features (V1-V28)
        for i in range(1, 29):
            key = f'V{i}'
            features.append(transaction.get(key, 0.0))
        
        # Add Time
        features.append(float(transaction.get('Time', 0.0)))
        
        # Add Amount
        features.append(float(transaction.get('Amount', 0.0)))
        
        return np.array([features])
    
    def _determine_risk_level(self, score: float) -> str:
        """Determine risk level from score"""
        if score >= 0.8:
            return "CRITICAL"
        elif score >= 0.6:
            return "HIGH"
        elif score >= 0.4:
            return "MEDIUM"
        elif score >= 0.2:
            return "LOW"
        else:
            return "MINIMAL"
    
    def get_stats(self) -> Dict:
        """Get inference statistics"""
        avg_time = (self.total_inference_time / self.inference_count 
                   if self.inference_count > 0 else 0)
        
        return {
            'is_loaded': self.is_loaded,
            'load_time': self.load_time,
            'inference_count': self.inference_count,
            'error_count': self.error_count,
            'total_inference_time': round(self.total_inference_time, 2),
            'average_inference_time': round(avg_time, 2),
            'error_rate': (self.error_count / self.inference_count 
                          if self.inference_count > 0 else 0)
        }
    
    def reset_stats(self):
        """Reset statistics counters"""
        self.inference_count = 0
        self.error_count = 0
        self.total_inference_time = 0.0


class MLServiceServer:
    """Flask-based ML service server"""
    
    def __init__(self, model_path: str = "model.pkl", host: str = "localhost", port: int = 5000):
        """Initialize ML service server"""
        self.model_path = model_path
        self.host = host
        self.port = port
        self.model_manager = ModelManager(model_path)
        self.app = None
        self.setup_flask()
    
    def setup_flask(self):
        """Setup Flask application"""
        try:
            from flask import Flask, request, jsonify, make_response
            
            self.app = Flask(__name__)
            
            # Health check endpoint
            @self.app.route('/health', methods=['GET'])
            def health():
                return jsonify({
                    'status': 'healthy' if self.model_manager.is_ready() else 'unhealthy',
                    'model_loaded': self.model_manager.is_ready(),
                    'timestamp': datetime.now().isoformat()
                }), 200
            
            # Ready check endpoint
            @self.app.route('/ready', methods=['GET'])
            def ready():
                if self.model_manager.is_ready():
                    return jsonify({'ready': True}), 200
                else:
                    return jsonify({'ready': False}), 503
            
            # Single prediction endpoint
            @self.app.route('/predict', methods=['POST'])
            def predict():
                try:
                    data = request.get_json()
                    
                    if not data:
                        return jsonify({'error': 'No data provided'}), 400
                    
                    result = self.model_manager.predict_single(data)
                    return jsonify(result), 200
                    
                except Exception as e:
                    logger.error(f"Prediction error: {str(e)}")
                    return jsonify({'error': str(e)}), 500
            
            # Batch prediction endpoint
            @self.app.route('/predict-batch', methods=['POST'])
            def predict_batch():
                try:
                    data = request.get_json()
                    
                    if not isinstance(data, list):
                        return jsonify({'error': 'Expected list of transactions'}), 400
                    
                    results = self.model_manager.predict_batch(data)
                    return jsonify({'predictions': results}), 200
                    
                except Exception as e:
                    logger.error(f"Batch prediction error: {str(e)}")
                    return jsonify({'error': str(e)}), 500
            
            # Statistics endpoint
            @self.app.route('/stats', methods=['GET'])
            def stats():
                return jsonify(self.model_manager.get_stats()), 200
            
            # Reset stats endpoint
            @self.app.route('/stats/reset', methods=['POST'])
            def reset_stats():
                self.model_manager.reset_stats()
                return jsonify({'message': 'Stats reset'}), 200
            
            # Model info endpoint
            @self.app.route('/model-info', methods=['GET'])
            def model_info():
                return jsonify({
                    'model_type': 'XGBoost',
                    'model_path': self.model_path,
                    'feature_count': 30,
                    'features': self.model_manager.feature_names,
                    'is_loaded': self.model_manager.is_ready(),
                    'load_time': self.model_manager.load_time
                }), 200
            
            # Error handlers
            @self.app.errorhandler(404)
            def not_found(error):
                return jsonify({'error': 'Endpoint not found'}), 404
            
            @self.app.errorhandler(500)
            def internal_error(error):
                return jsonify({'error': 'Internal server error'}), 500
            
            logger.info("✅ Flask app configured")
            
        except ImportError:
            logger.error("Flask not installed. Install with: pip install flask")
            raise
    
    def start(self):
        """Start the ML service server"""
        if not self.model_manager.load_model():
            logger.error("Failed to load model. Cannot start server.")
            return False
        
        logger.info(f"🚀 Starting ML service on {self.host}:{self.port}")
        
        try:
            self.app.run(host=self.host, port=self.port, debug=False)
            return True
        except Exception as e:
            logger.error(f"Failed to start server: {str(e)}")
            return False


def create_ml_service(model_path: str = "model.pkl", host: str = "localhost", port: int = 5000):
    """Factory function to create ML service"""
    return MLServiceServer(model_path, host, port)


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="ML Inference Service")
    parser.add_argument("--model", default="model.pkl", help="Path to model file")
    parser.add_argument("--host", default="localhost", help="Server host")
    parser.add_argument("--port", type=int, default=5000, help="Server port")
    parser.add_argument("--debug", action="store_true", help="Enable debug mode")
    
    args = parser.parse_args()
    
    service = create_ml_service(args.model, args.host, args.port)
    service.start()
