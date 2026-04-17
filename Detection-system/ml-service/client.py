"""
ML Service Client for model inference
Can be used standalone or integrated with backend
"""

import requests
import json
import logging
from typing import Dict, List, Optional, Union
from dataclasses import dataclass
from datetime import datetime

logger = logging.getLogger(__name__)


@dataclass
class PredictionResult:
    """Prediction result from model"""
    score: float
    risk_level: str
    is_fraud: int
    transaction_id: Optional[str] = None
    inference_time: Optional[str] = None
    
    def to_dict(self) -> Dict:
        """Convert to dictionary"""
        return {
            'score': self.score,
            'risk_level': self.risk_level,
            'is_fraud': self.is_fraud,
            'transaction_id': self.transaction_id,
            'inference_time': self.inference_time
        }


class MLServiceClient:
    """Client for communicating with ML service"""
    
    def __init__(self, base_url: str = "http://localhost:5000", timeout: int = 30):
        """
        Initialize ML service client
        
        Args:
            base_url: Base URL of ML service
            timeout: Request timeout in seconds
        """
        self.base_url = base_url.rstrip('/')
        self.timeout = timeout
        self.session = requests.Session()
        self.health_check_interval = 60  # Check health every 60s
        self.last_health_check = None
        self.is_healthy = False
    
    def health_check(self) -> bool:
        """
        Check if ML service is healthy
        
        Returns:
            True if service is healthy, False otherwise
        """
        try:
            response = self.session.get(
                f"{self.base_url}/health",
                timeout=self.timeout
            )
            
            if response.status_code == 200:
                data = response.json()
                self.is_healthy = data.get('model_loaded', False)
                self.last_health_check = datetime.now()
                return self.is_healthy
            
            self.is_healthy = False
            return False
            
        except requests.RequestException as e:
            logger.error(f"Health check failed: {str(e)}")
            self.is_healthy = False
            return False
    
    def ready_check(self) -> bool:
        """
        Check if model is ready for inference
        
        Returns:
            True if model is ready, False otherwise
        """
        try:
            response = self.session.get(
                f"{self.base_url}/ready",
                timeout=self.timeout
            )
            return response.status_code == 200
            
        except requests.RequestException:
            return False
    
    def predict(self, transaction: Dict) -> Union[PredictionResult, Dict]:
        """
        Get prediction for single transaction
        
        Args:
            transaction: Transaction data dictionary
        
        Returns:
            PredictionResult or error dictionary
        """
        if not self.is_healthy:
            self.health_check()
        
        try:
            response = self.session.post(
                f"{self.base_url}/predict",
                json=transaction,
                timeout=self.timeout
            )
            
            if response.status_code == 200:
                data = response.json()
                return PredictionResult(
                    score=data['score'],
                    risk_level=data['risk_level'],
                    is_fraud=data['is_fraud'],
                    transaction_id=transaction.get('id'),
                    inference_time=data.get('metadata', {}).get('inference_time')
                )
            else:
                return {
                    'error': f"HTTP {response.status_code}",
                    'details': response.json()
                }
                
        except requests.RequestException as e:
            logger.error(f"Prediction request failed: {str(e)}")
            return {
                'error': 'Connection failed',
                'details': str(e)
            }
    
    def predict_batch(self, transactions: List[Dict]) -> Union[List[PredictionResult], Dict]:
        """
        Get predictions for multiple transactions
        
        Args:
            transactions: List of transaction dictionaries
        
        Returns:
            List of PredictionResult objects or error dictionary
        """
        if not self.is_healthy:
            self.health_check()
        
        try:
            response = self.session.post(
                f"{self.base_url}/predict-batch",
                json=transactions,
                timeout=self.timeout
            )
            
            if response.status_code == 200:
                data = response.json()
                results = []
                for pred in data.get('predictions', []):
                    results.append(PredictionResult(
                        score=pred['score'],
                        risk_level=pred['risk_level'],
                        is_fraud=pred['is_fraud'],
                        transaction_id=pred.get('transaction_id')
                    ))
                return results
            else:
                return {
                    'error': f"HTTP {response.status_code}",
                    'details': response.json()
                }
                
        except requests.RequestException as e:
            logger.error(f"Batch prediction request failed: {str(e)}")
            return {
                'error': 'Connection failed',
                'details': str(e)
            }
    
    def get_stats(self) -> Dict:
        """
        Get inference statistics from service
        
        Returns:
            Statistics dictionary
        """
        try:
            response = self.session.get(
                f"{self.base_url}/stats",
                timeout=self.timeout
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                return {'error': f"HTTP {response.status_code}"}
                
        except requests.RequestException as e:
            logger.error(f"Stats request failed: {str(e)}")
            return {'error': str(e)}
    
    def reset_stats(self) -> bool:
        """
        Reset inference statistics
        
        Returns:
            True if successful, False otherwise
        """
        try:
            response = self.session.post(
                f"{self.base_url}/stats/reset",
                timeout=self.timeout
            )
            return response.status_code == 200
            
        except requests.RequestException as e:
            logger.error(f"Reset stats failed: {str(e)}")
            return False
    
    def get_model_info(self) -> Dict:
        """
        Get model information
        
        Returns:
            Model information dictionary
        """
        try:
            response = self.session.get(
                f"{self.base_url}/model-info",
                timeout=self.timeout
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                return {'error': f"HTTP {response.status_code}"}
                
        except requests.RequestException as e:
            logger.error(f"Model info request failed: {str(e)}")
            return {'error': str(e)}


def create_ml_client(base_url: str = "http://localhost:5000") -> MLServiceClient:
    """Factory function to create ML client"""
    return MLServiceClient(base_url)


if __name__ == "__main__":
    # Example usage
    client = MLServiceClient("http://localhost:5000")
    
    # Check health
    print("Checking health...")
    is_healthy = client.health_check()
    print(f"Healthy: {is_healthy}")
    
    # Get model info
    print("\nGetting model info...")
    info = client.get_model_info()
    print(json.dumps(info, indent=2))
    
    # Make prediction
    print("\nMaking prediction...")
    transaction = {
        'id': 'TXN-001',
        'Amount': 5000,
        'Time': 100,
        'V1': 0.5, 'V2': -0.2, 'V3': 0.1,
        # ... other V features
    }
    result = client.predict(transaction)
    print(f"Result: {result}")
