"""
API utilities for data generation
Provides functions to access generator from the backend
"""

import sys
import os
import pandas as pd
from generator import TransactionDataGenerator, get_data_from_generator
from config import TRAINING, PREDICTION


class DataAPI:
    """API for accessing generated data from backend services"""
    
    def __init__(self):
        self.training_gen = None
        self.prediction_gen = None
    
    def get_training_data(self, use_config=True, **kwargs):
        """Get data for model training"""
        if use_config:
            config = TRAINING.copy()
            config.update(kwargs)
        else:
            config = kwargs
        
        return get_data_from_generator(**config)
    
    def get_prediction_data(self, use_config=True, **kwargs):
        """Get data for model prediction"""
        if use_config:
            config = PREDICTION.copy()
            config.update(kwargs)
        else:
            config = kwargs
        
        return get_data_from_generator(**config)
    
    def get_batch_stream(self, batch_size=100, fraud_ratio=0.001):
        """Get a stream of batches for real-time processing"""
        gen = TransactionDataGenerator(random_seed=None)  # Non-deterministic
        return gen.generate_batch(batch_size=batch_size, fraud_ratio=fraud_ratio)
    
    def generate_user_transactions(self, user_id=None, n_samples=1000, fraud_ratio=0.001):
        """Generate transactions for a specific user"""
        df = get_data_from_generator(
            source='generator',
            n_samples=n_samples * 100,  # Generate extra
            fraud_ratio=fraud_ratio,
            use_user_ids=True,
            n_users=100,
            random_seed=None
        )
        
        # Filter for specific user or return first user
        if user_id is None:
            user_id = df['user_id'].unique()[0]
        
        return df[df['user_id'] == user_id].head(n_samples)
    
    def export_to_csv(self, df, output_path):
        """Export generated data to CSV file"""
        df.to_csv(output_path, index=False)
        return output_path
    
    @staticmethod
    def get_data_stats(df):
        """Get statistics about generated data"""
        return {
            'total_transactions': len(df),
            'fraud_count': (df['Class'] == 1).sum() if 'Class' in df.columns else 0,
            'fraud_percentage': ((df['Class'] == 1).sum() / len(df) * 100) if 'Class' in df.columns else 0,
            'amount_mean': df['Amount'].mean() if 'Amount' in df.columns else 0,
            'amount_max': df['Amount'].max() if 'Amount' in df.columns else 0,
            'unique_users': df['user_id'].nunique() if 'user_id' in df.columns else 0,
        }


# Singleton instance
_api_instance = None


def get_data_api():
    """Get or create the DataAPI instance"""
    global _api_instance
    if _api_instance is None:
        _api_instance = DataAPI()
    return _api_instance


if __name__ == "__main__":
    # Example usage from backend
    api = get_data_api()
    
    # Get training data
    print("Fetching training data...")
    train_data = api.get_training_data()
    print(f"Training data shape: {train_data.shape}")
    print(api.get_data_stats(train_data))
    
    # Get prediction data
    print("\nFetching prediction data...")
    pred_data = api.get_prediction_data()
    print(f"Prediction data shape: {pred_data.shape}")
    print(api.get_data_stats(pred_data))
    
    # Get user-specific transactions
    print("\nFetching user-specific transactions...")
    user_data = api.generate_user_transactions(n_samples=100)
    print(f"User data shape: {user_data.shape}")
    print(user_data.head())
