#!/bin/bash
# Start ML Inference Service

echo "🤖 Starting ML Inference Service..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed"
    exit 1
fi

# Check if model exists
if [ ! -f "model.pkl" ]; then
    echo "⚠️  Model file not found. Please run anomaly-detection/train.py first"
    echo "   Or place model.pkl in the current directory"
fi

# Check if requirements are installed
python3 -c "import flask" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "📦 Installing dependencies..."
    pip install -r ml-service/requirements.txt
fi

# Set environment variables
export FLASK_APP=ml-service/service.py
export FLASK_ENV=production

# Start service
cd ml-service

echo "✅ Starting service on port 5000..."
echo "📊 Test health: curl http://localhost:5000/health"

# Use gunicorn if available, otherwise use Flask development server
if command -v gunicorn &> /dev/null; then
    echo "🚀 Using Gunicorn (production)"
    gunicorn --bind 0.0.0.0:5000 --workers 4 --timeout 120 service:app
else
    echo "⚠️  Gunicorn not found, using Flask development server"
    echo "   For production, install: pip install gunicorn"
    python3 service.py --host 0.0.0.0 --port 5000
fi
