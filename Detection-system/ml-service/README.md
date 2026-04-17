# Real-Time Model Inference Service

## Overview

The ML Inference Service is a dedicated Python service that provides fast, on-demand fraud detection predictions. It runs separately from the Node.js backend and can be scaled independently.

## Architecture

```
Node.js Backend (Port 3000)
         │
         ├─► Real-Time Ingestion Queue
         │
         └─► ML Client (Python HTTP)
             │
             ▼
     ML Inference Service (Port 5000)
             │
             ├─► Model Loading
             ├─► Batch Processing
             └─► Prediction Serving
```

## Features

- **Fast Inference**: ~50-200ms per transaction
- **Batch Processing**: Process multiple transactions in parallel
- **Health Monitoring**: Built-in health checks and statistics
- **Scalable**: Stateless design for horizontal scaling
- **Production Ready**: Gunicorn WSGI server with multiple workers
- **Containerized**: Docker support for easy deployment

## Installation

### 1. Install Dependencies

```bash
cd ml-service
pip install -r requirements.txt
```

### 2. Ensure Model File

Make sure `model.pkl` is in the project root or set `MODEL_PATH` environment variable.

```bash
cp ../creditcard.csv ../anomaly-detection/model.pkl ./
```

## Quick Start

### Option 1: Development Mode

```bash
cd ml-service
python service.py
```

Expected output:
```
INFO:__main__:✅ Model loaded successfully from model.pkl
INFO:__main__:🚀 Starting ML service on localhost:5000
```

### Option 2: Production Mode with Gunicorn

```bash
cd ml-service
gunicorn --bind 0.0.0.0:5000 --workers 4 service:app
```

### Option 3: Docker

```bash
cd ml-service
docker build -t ml-service .
docker run -p 5000:5000 -v $(pwd):/app ml-service
```

## API Endpoints

### Health Check

```bash
curl http://localhost:5000/health
```

Response:
```json
{
  "status": "healthy",
  "model_loaded": true,
  "timestamp": "2024-01-15T10:30:45.123456"
}
```

### Ready Check

```bash
curl http://localhost:5000/ready
```

### Single Prediction

```bash
curl -X POST http://localhost:5000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "id": "TXN-001",
    "Time": 100,
    "Amount": 5000,
    "V1": 0.5,
    ...
  }'
```

Response:
```json
{
  "score": 0.87,
  "risk_level": "HIGH",
  "is_fraud": 1,
  "metadata": {
    "model_version": "xgboost-v1",
    "inference_time": "2024-01-15T10:30:45.123456",
    "feature_count": 30
  }
}
```

### Batch Prediction

```bash
curl -X POST http://localhost:5000/predict-batch \
  -H "Content-Type: application/json" \
  -d '[
    {"id": "TXN-001", "Amount": 5000, ...},
    {"id": "TXN-002", "Amount": 3000, ...},
    ...
  ]'
```

Response:
```json
{
  "predictions": [
    {
      "transaction_id": "TXN-001",
      "score": 0.87,
      "risk_level": "HIGH",
      "is_fraud": 1
    },
    ...
  ]
}
```

### Get Statistics

```bash
curl http://localhost:5000/stats
```

Response:
```json
{
  "is_loaded": true,
  "load_time": "2024-01-15T10:30:00.000000",
  "inference_count": 1250,
  "error_count": 2,
  "total_inference_time": 125000.5,
  "average_inference_time": 100.2,
  "error_rate": 0.0016
}
```

### Reset Statistics

```bash
curl -X POST http://localhost:5000/stats/reset
```

### Model Information

```bash
curl http://localhost:5000/model-info
```

Response:
```json
{
  "model_type": "XGBoost",
  "model_path": "model.pkl",
  "feature_count": 30,
  "features": ["V1", "V2", ..., "Time", "Amount"],
  "is_loaded": true,
  "load_time": "2024-01-15T10:30:00.000000"
}
```

## Usage in Backend

### Automatic Integration

The Node.js backend automatically connects to the ML service:

```javascript
const mlClient = new SafeMLServiceClient("http://localhost:5000");
await mlClient.initialize();

// Single prediction
const result = await mlClient.predict({
  Amount: 5000,
  Time: 100,
  // ... features
});

// Batch prediction
const results = await mlClient.predictBatch([txn1, txn2]);

// Get stats
const stats = await mlClient.getStats();
```

### Manual Integration

```python
from ml_service.client import MLServiceClient

client = MLServiceClient("http://localhost:5000")

# Single prediction
result = client.predict({
    "id": "TXN-001",
    "Amount": 5000,
    "Time": 100
})

# Batch prediction
results = client.predict_batch([txn1, txn2])

# Get stats
stats = client.get_stats()
```

## Configuration

Edit `ml-service/config.py`:

```python
HOST = "0.0.0.0"           # Listen on all interfaces
PORT = 5000                 # Port number
MODEL_PATH = "model.pkl"    # Path to model file
LOG_LEVEL = "INFO"          # Logging level
BATCH_SIZE_LIMIT = 1000     # Max batch size
```

### Environment Variables

```bash
# Server
ML_SERVICE_HOST=0.0.0.0
ML_SERVICE_PORT=5000

# Model
MODEL_PATH=model.pkl

# Performance
REQUEST_TIMEOUT=30
BATCH_SIZE_LIMIT=1000

# Logging
LOG_LEVEL=INFO
```

## Performance

### Benchmarks

- **Single prediction**: 50-150ms
- **Batch prediction (100)**: 100-300ms (3-5ms per transaction)
- **Throughput**: 1000-2000 predictions/second with 4 workers
- **Memory footprint**: ~500MB (model + API overhead)

### Tuning

**Increase throughput:**
```bash
gunicorn --bind 0.0.0.0:5000 --workers 8 service:app
```

**Reduce latency:**
- Reduce batch size limit
- Use async client calls
- Enable model quantization (if available)

**Monitor performance:**
```python
import requests
stats = requests.get("http://localhost:5000/stats").json()
print(f"Avg latency: {stats['average_inference_time']}ms")
print(f"Error rate: {stats['error_rate']*100}%")
```

## Monitoring

### Health Monitoring

```bash
# Check service status
curl http://localhost:5000/health

# Check model readiness
curl http://localhost:5000/ready

# Get detailed stats
curl http://localhost:5000/stats
```

### Logging

Logs are output to stdout. Capture them:

```bash
python service.py > ml-service.log 2>&1 &
```

### Metrics to Monitor

- `inference_count` - Total predictions made
- `error_count` - Failed predictions
- `average_inference_time` - Average latency
- `error_rate` - Percentage of failures
- Memory usage
- CPU usage
- Request queue depth

## Error Handling

### Common Errors

**"Model not loaded"**
- Ensure `model.pkl` exists in correct path
- Check file permissions
- Try: `python service.py --debug`

**"Connection refused"**
- Service not running
- Wrong port/host
- Firewall blocking connection

**"Batch size exceeded"**
- Maximum batch size is 1000 (configurable)
- Split large batches into smaller chunks

**"Timeout"**
- Increase `REQUEST_TIMEOUT`
- Use smaller batch sizes
- Check service performance

## Security

- ✅ Input validation on all endpoints
- ✅ Error message sanitization
- ⚠️ Add authentication for production
- ⚠️ Use HTTPS/TLS in production
- ⚠️ Rate limiting recommended
- ⚠️ Enable CORS only for trusted domains

## Deployment

### Docker Compose

```yaml
version: '3'
services:
  ml-service:
    build: ./ml-service
    ports:
      - "5000:5000"
    volumes:
      - ./anomaly-detection:/app/models
    environment:
      - MODEL_PATH=/app/models/model.pkl
      - ML_SERVICE_HOST=0.0.0.0
      - ML_SERVICE_PORT=5000
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

### Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ml-service
spec:
  replicas: 2
  selector:
    matchLabels:
      app: ml-service
  template:
    metadata:
      labels:
        app: ml-service
    spec:
      containers:
      - name: ml-service
        image: ml-service:latest
        ports:
        - containerPort: 5000
        livenessProbe:
          httpGet:
            path: /health
            port: 5000
          initialDelaySeconds: 30
          periodSeconds: 10
```

## Scaling

### Horizontal Scaling

```bash
# Run multiple instances
gunicorn --bind 0.0.0.0:5000 --workers 4 service:app
gunicorn --bind 0.0.0.0:5001 --workers 4 service:app
# Use load balancer to distribute requests
```

### Vertical Scaling

```bash
# Increase worker count
gunicorn --bind 0.0.0.0:5000 --workers 16 service:app

# Or use production settings
gunicorn --bind 0.0.0.0:5000 \
         --workers 8 \
         --threads 2 \
         --worker-class gthread \
         --max-requests 1000 \
         service:app
```

## Troubleshooting

### Check Service Status

```bash
curl -v http://localhost:5000/health
```

### View Logs

```bash
# Real-time logs
tail -f ml-service.log

# Last 100 lines
tail -100 ml-service.log
```

### Test Endpoints

```bash
# Health
curl http://localhost:5000/health

# Model info
curl http://localhost:5000/model-info

# Test prediction
curl -X POST http://localhost:5000/predict \
  -H "Content-Type: application/json" \
  -d '{"Amount": 100, "Time": 0}'
```

### Performance Diagnostics

```python
# Check stats
requests.get("http://localhost:5000/stats").json()

# Record baseline
baseline_stats = requests.get("http://localhost:5000/stats").json()

# Run test
for i in range(100):
    requests.post("http://localhost:5000/predict", json=test_txn)

# Compare
final_stats = requests.get("http://localhost:5000/stats").json()
print(f"Latency improved by {baseline_stats['average_inference_time'] - final_stats['average_inference_time']}ms")
```

## Next Steps

1. ✅ Start ML service: `python service.py`
2. ✅ Verify health: `curl http://localhost:5000/health`
3. ✅ Start Node.js backend: `npm start`
4. ✅ Send test transactions through API
5. 🔄 Monitor performance and adjust as needed
6. 🚀 Deploy to production

## Support

- Check logs for error details
- Review `service.py` for implementation
- Test endpoints individually with curl
- Use Docker for consistent environments
