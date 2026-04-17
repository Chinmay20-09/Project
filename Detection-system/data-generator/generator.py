"""
Data Generator for Credit Card Fraud Detection System
Generates synthetic transaction data for model training and testing
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random


class TransactionDataGenerator:
    """Generates synthetic credit card transaction data"""
    
    def __init__(self, random_seed=42):
        """Initialize the generator with optional random seed"""
        self.random_seed = random_seed
        if random_seed:
            np.random.seed(random_seed)
            random.seed(random_seed)
    
    def generate(self, n_samples=10000, fraud_ratio=0.001):
        """
        Generate synthetic transaction dataset
        
        Args:
            n_samples: Number of transactions to generate
            fraud_ratio: Ratio of fraudulent transactions (default 0.001 = 0.1%)
        
        Returns:
            DataFrame with synthetic transaction data
        """
        n_fraud = int(n_samples * fraud_ratio)
        n_legitimate = n_samples - n_fraud
        
        # Generate normal transactions
        legitimate_data = self._generate_legitimate_transactions(n_legitimate)
        
        # Generate fraudulent transactions
        fraud_data = self._generate_fraud_transactions(n_fraud)
        
        # Combine and shuffle
        data = pd.concat([legitimate_data, fraud_data], ignore_index=True)
        data = data.sample(frac=1).reset_index(drop=True)
        
        return data
    
    def _generate_legitimate_transactions(self, n_samples):
        """Generate normal, legitimate transactions"""
        data = {
            'Time': np.random.uniform(0, 172800, n_samples),  # 0-48 hours in seconds
            'Amount': np.random.lognormal(mean=4.0, sigma=1.5, size=n_samples),  # Log-normal distribution
            'Class': np.zeros(n_samples, dtype=int),  # 0 = legitimate
        }
        
        # Add PCA features (V1-V28) - simulating dimensionality reduction output
        for i in range(1, 29):
            data[f'V{i}'] = np.random.normal(0, 1, n_samples)
        
        df = pd.DataFrame(data)
        
        # Ensure Amount is realistic
        df['Amount'] = df['Amount'].clip(upper=2500)
        
        return df
    
    def _generate_fraud_transactions(self, n_samples):
        """Generate fraudulent transactions with anomalous patterns"""
        data = {
            'Time': np.random.uniform(0, 172800, n_samples),
            'Amount': np.random.lognormal(mean=5.5, sigma=2.0, size=n_samples),  # Higher amounts for fraud
            'Class': np.ones(n_samples, dtype=int),  # 1 = fraud
        }
        
        # Add PCA features with anomalous patterns
        for i in range(1, 29):
            # Generate more extreme values for fraud
            if np.random.rand() < 0.3:  # 30% chance of anomalous feature
                data[f'V{i}'] = np.random.normal(3, 1.5, n_samples)  # Shifted distribution
            else:
                data[f'V{i}'] = np.random.normal(0, 1.2, n_samples)
        
        df = pd.DataFrame(data)
        
        # Ensure Amount is realistic
        df['Amount'] = df['Amount'].clip(upper=5000)
        
        return df
    
    def generate_batch(self, batch_size=100, fraud_ratio=0.001):
        """
        Generator that yields batches of transactions (for streaming/real-time scenarios)
        
        Args:
            batch_size: Number of transactions per batch
            fraud_ratio: Ratio of fraudulent transactions per batch
        
        Yields:
            DataFrames of batch_size transactions
        """
        while True:
            batch = self.generate(n_samples=batch_size, fraud_ratio=fraud_ratio)
            yield batch
    
    def generate_with_user_ids(self, n_samples=10000, n_users=50, fraud_ratio=0.001):
        """
        Generate transactions with user IDs for multi-user scenarios
        
        Args:
            n_samples: Total number of transactions
            n_users: Number of unique users
            fraud_ratio: Ratio of fraudulent transactions
        
        Returns:
            DataFrame with user_id column added
        """
        df = self.generate(n_samples=n_samples, fraud_ratio=fraud_ratio)
        
        # Assign random user IDs
        df['user_id'] = np.random.randint(1000, 1000 + n_users, size=len(df))
        
        # Ensure column order matches expected format
        cols = ['Time', 'Amount', 'user_id'] + [f'V{i}' for i in range(1, 29)] + ['Class']
        df = df[cols]
        
        return df


def get_data_from_generator(source='generator', n_samples=10000, fraud_ratio=0.001, **kwargs):
    """
    Unified interface to get data from either generator or CSV file
    
    Args:
        source: 'generator' or 'csv'
        n_samples: Number of samples (only for generator)
        fraud_ratio: Fraud ratio (only for generator)
        **kwargs: Additional arguments
            - csv_path: Path to CSV file (for source='csv')
    
    Returns:
        DataFrame with transaction data
    """
    if source == 'csv':
        csv_path = kwargs.get('csv_path', 'creditcard.csv')
        df = pd.read_csv(csv_path)
        return df
    elif source == 'generator':
        generator = TransactionDataGenerator(random_seed=kwargs.get('random_seed', 42))
        use_user_ids = kwargs.get('use_user_ids', False)
        
        if use_user_ids:
            df = generator.generate_with_user_ids(
                n_samples=n_samples,
                n_users=kwargs.get('n_users', 50),
                fraud_ratio=fraud_ratio
            )
        else:
            df = generator.generate(n_samples=n_samples, fraud_ratio=fraud_ratio)
        
        return df
    else:
        raise ValueError(f"Unknown data source: {source}")


if __name__ == "__main__":
    # Example usage
    print("Generating sample transaction data...")
    
    generator = TransactionDataGenerator(random_seed=42)
    df = generator.generate(n_samples=1000, fraud_ratio=0.001)
    
    print(f"\nGenerated {len(df)} transactions")
    print(f"Fraud cases: {(df['Class'] == 1).sum()}")
    print(f"\nDataset shape: {df.shape}")
    print(f"\nFirst few rows:")
    print(df.head())
    print(f"\nClass distribution:")
    print(df['Class'].value_counts())
    print(f"\nAmount statistics:")
    print(df['Amount'].describe())
