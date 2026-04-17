# Data Generator

This folder contains the synthetic data generation module for the Credit Card Fraud Detection System. Instead of relying only on static CSV files, the system can now generate realistic synthetic transaction data for both training and prediction.

## Overview

The `generator.py` module provides:

- **TransactionDataGenerator**: Main class for generating synthetic transaction data
- **get_data_from_generator()**: Unified interface to switch between generator and CSV sources
- Configurable parameters for data volume, fraud ratio, and user distribution

## Features

- **Synthetic Data Generation**: Creates realistic credit card transaction data
- **Fraud Simulation**: Generates fraudulent transactions with anomalous patterns
- **Multi-User Support**: Can generate data with multiple user IDs
- **Flexible Batch Generation**: Supports streaming/real-time data scenarios
- **Seed Control**: Reproducible data generation with configurable random seeds

## Usage

### Basic Usage

```python
from generator import TransactionDataGenerator

# Create generator
generator = TransactionDataGenerator(random_seed=42)

# Generate 10,000 transactions with 0.1% fraud ratio
df = generator.generate(n_samples=10000, fraud_ratio=0.001)
```

### With User IDs (Multi-User Scenarios)

```python
# Generate with 50 unique users
df = generator.generate_with_user_ids(
    n_samples=10000,
    n_users=50,
    fraud_ratio=0.001
)
```

### Batch Generation (Streaming)

```python
# Create a generator for continuous batches
batch_gen = generator.generate_batch(batch_size=100, fraud_ratio=0.001)

# Get batches on-demand
for i in range(10):
    batch = next(batch_gen)
    # Process batch
```

### Using Unified Interface

```python
from generator import get_data_from_generator

# Use generator
df = get_data_from_generator(
    source='generator',
    n_samples=50000,
    fraud_ratio=0.001
)

# Or use CSV file
df = get_data_from_generator(
    source='csv',
    csv_path='creditcard.csv'
)
```

## Configuration in Training/Prediction

### In `train.py`

```python
# Change this to switch data source
DATA_SOURCE = 'generator'  # or 'csv'

# Customize generation
df = get_data_from_generator(
    source='generator',
    n_samples=50000,
    fraud_ratio=0.001,
    random_seed=42
)
```

### In `predict.py`

```python
# Change this to switch data source
DATA_SOURCE = 'generator'  # or 'csv'

# Generate with user IDs
df = get_data_from_generator(
    source='generator',
    n_samples=10000,
    fraud_ratio=0.001,
    use_user_ids=True,
    n_users=10,
    random_seed=123
)
```

## Data Format

Generated data includes:

- **Time**: Transaction time (0-172800 seconds, ~48 hours)
- **Amount**: Transaction amount (realistic ranges, log-normal distribution)
- **V1-V28**: PCA-transformed feature vectors (simulating real dataset dimensions)
- **Class**: Target variable (0=legitimate, 1=fraud)
- **user_id** (optional): User identifier when enabled

### Legitimate Transaction Patterns

- Normal transaction amounts (log-normal distribution)
- Features centered around 0 with standard distribution

### Fraudulent Transaction Patterns

- Higher transaction amounts (shifted log-normal distribution)
- Anomalous feature values (30% of features show shifted distributions)
- Different time distributions

## Advantages Over Static CSV

1. **Unlimited Data**: Generate as much data as needed without limits
2. **Customizable**: Adjust fraud ratio, data volume, and distributions
3. **Reproducible**: Same seed produces identical data
4. **Realistic**: Synthetic patterns mimic real transaction behavior
5. **Scalable**: Generate data in batches for streaming scenarios
6. **Privacy**: No real customer data used

## Running the Generator Directly

```bash
cd data-generator
python generator.py
```

This will generate and display sample data with statistics.

## Integration

The `train.py` and `predict.py` scripts have been updated to use the data generator. Simply change the `DATA_SOURCE` variable from `'generator'` to `'csv'` if you want to revert to using static CSV files.

## Future Enhancements

- Add more sophisticated fraud patterns
- Support time-series generation
- Add geographic distribution patterns
- Support merchant category patterns
- Device/location anomaly detection features
