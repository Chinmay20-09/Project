#!/usr/bin/env python3
"""
Startup script for ML Inference Service
Handles initialization, model loading, and server startup
"""

import os
import sys
import argparse
import logging
from pathlib import Path

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def check_dependencies():
    """Check if all required dependencies are installed"""
    required = ['flask', 'numpy', 'sklearn', 'xgboost']
    missing = []
    
    for package in required:
        try:
            __import__(package)
        except ImportError:
            missing.append(package)
    
    if missing:
        logger.error(f"Missing dependencies: {', '.join(missing)}")
        logger.error(f"Install with: pip install -r requirements.txt")
        return False
    
    logger.info("✅ All dependencies installed")
    return True


def check_model_file(model_path):
    """Check if model file exists"""
    if not os.path.exists(model_path):
        logger.error(f"❌ Model file not found: {model_path}")
        logger.info("Please ensure model.pkl exists in the project root")
        logger.info("Run: python anomaly-detection/train.py")
        return False
    
    logger.info(f"✅ Model file found: {model_path}")
    return True


def setup_environment():
    """Setup environment variables"""
    env_file = Path(__file__).parent / '.env'
    
    if env_file.exists():
        logger.info(f"Loading environment from {env_file}")
        with open(env_file) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#'):
                    key, value = line.split('=', 1)
                    os.environ[key] = value
    
    return {
        'host': os.getenv('ML_SERVICE_HOST', '0.0.0.0'),
        'port': int(os.getenv('ML_SERVICE_PORT', 5000)),
        'model_path': os.getenv('MODEL_PATH', 'model.pkl'),
        'debug': os.getenv('DEBUG', 'false').lower() == 'true',
    }


def start_service(host, port, model_path, debug=False):
    """Start the ML inference service"""
    from service import create_ml_service
    
    logger.info(f"🤖 Starting ML Inference Service")
    logger.info(f"   Host: {host}")
    logger.info(f"   Port: {port}")
    logger.info(f"   Model: {model_path}")
    
    service = create_ml_service(model_path, host, port)
    
    if debug:
        logger.info("Running in debug mode")
        service.start()
    else:
        try:
            import gunicorn.app.wsgiapp
            logger.info("Running with Gunicorn (production)")
            
            sys.argv = [
                'gunicorn',
                '--bind', f'{host}:{port}',
                '--workers', '4',
                '--timeout', '120',
                'service:app'
            ]
            
            gunicorn.app.wsgiapp.run()
        except ImportError:
            logger.warning("⚠️  Gunicorn not installed. Using Flask development server.")
            logger.warning("For production, install: pip install gunicorn")
            logger.info("Starting Flask development server...")
            service.start()


def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(description="ML Inference Service")
    parser.add_argument("--host", help="Server host")
    parser.add_argument("--port", type=int, help="Server port")
    parser.add_argument("--model", help="Path to model file")
    parser.add_argument("--debug", action="store_true", help="Enable debug mode")
    
    args = parser.parse_args()
    
    # Check dependencies
    if not check_dependencies():
        sys.exit(1)
    
    # Setup environment
    config = setup_environment()
    
    # Override with CLI arguments
    if args.host:
        config['host'] = args.host
    if args.port:
        config['port'] = args.port
    if args.model:
        config['model_path'] = args.model
    if args.debug:
        config['debug'] = True
    
    # Check model file
    if not check_model_file(config['model_path']):
        sys.exit(1)
    
    # Start service
    try:
        start_service(
            config['host'],
            config['port'],
            config['model_path'],
            config['debug']
        )
    except KeyboardInterrupt:
        logger.info("\n✅ Service stopped by user")
        sys.exit(0)
    except Exception as e:
        logger.error(f"❌ Service error: {str(e)}")
        sys.exit(1)


if __name__ == "__main__":
    main()
