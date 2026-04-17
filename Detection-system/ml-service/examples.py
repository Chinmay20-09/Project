"""
Real-Time Model Inference Examples
"""

import requests
import json
import time
from ml_service.client import MLServiceClient, PredictionResult


def example_1_single_prediction():
    """Example 1: Single transaction prediction"""
    print("\n📊 Example 1: Single Prediction")
    print("=" * 50)
    
    client = MLServiceClient("http://localhost:5000")
    
    # Check health
    print("Checking service health...")
    if not client.health_check():
        print("❌ Service not healthy")
        return
    
    # Create transaction
    transaction = {
        "id": "TXN-001",
        "Amount": 5000,
        "Time": 100,
        "V1": 0.5,
        "V2": -0.2,
        # Add other V features as needed
    }
    
    # Get prediction
    print("Sending transaction for prediction...")
    result = client.predict(transaction)
    
    if isinstance(result, PredictionResult):
        print(f"✅ Prediction received:")
        print(f"   Transaction ID: {result.transaction_id}")
        print(f"   Score: {result.score}")
        print(f"   Risk Level: {result.risk_level}")
        print(f"   Is Fraud: {result.is_fraud}")
    else:
        print(f"❌ Error: {result}")


def example_2_batch_prediction():
    """Example 2: Batch prediction"""
    print("\n📊 Example 2: Batch Prediction")
    print("=" * 50)
    
    client = MLServiceClient("http://localhost:5000")
    
    # Create transactions
    transactions = [
        {"id": "TXN-001", "Amount": 100, "Time": 0},
        {"id": "TXN-002", "Amount": 200, "Time": 5000},
        {"id": "TXN-003", "Amount": 5000, "Time": 10000},
        {"id": "TXN-004", "Amount": 50000, "Time": 15000},
    ]
    
    print(f"Predicting {len(transactions)} transactions...")
    results = client.predict_batch(transactions)
    
    if isinstance(results, list):
        print(f"✅ Received {len(results)} predictions:")
        for result in results:
            print(
                f"   {result.transaction_id}: "
                f"Score={result.score:.2f}, "
                f"Risk={result.risk_level}, "
                f"Fraud={result.is_fraud}"
            )
    else:
        print(f"❌ Error: {results}")


def example_3_performance_benchmark():
    """Example 3: Performance benchmark"""
    print("\n📊 Example 3: Performance Benchmark")
    print("=" * 50)
    
    client = MLServiceClient("http://localhost:5000")
    
    print("Running performance benchmark...")
    
    # Warm up
    print("Warming up...")
    for _ in range(10):
        client.predict({"Amount": 100, "Time": 0})
    
    # Single transaction benchmark
    print("\n1. Single transaction latency:")
    times = []
    for i in range(100):
        start = time.time()
        client.predict({"Amount": 100, "Time": i})
        times.append((time.time() - start) * 1000)  # Convert to ms
    
    print(f"   Min: {min(times):.2f}ms")
    print(f"   Max: {max(times):.2f}ms")
    print(f"   Avg: {sum(times)/len(times):.2f}ms")
    
    # Batch prediction benchmark
    print("\n2. Batch prediction (100 transactions):")
    transactions = [{"id": f"TXN-{i}", "Amount": 100, "Time": i} for i in range(100)]
    
    start = time.time()
    results = client.predict_batch(transactions)
    batch_time = (time.time() - start) * 1000
    
    if isinstance(results, list):
        print(f"   Total time: {batch_time:.2f}ms")
        print(f"   Per transaction: {batch_time/len(results):.2f}ms")
        print(f"   Throughput: {len(results)/(batch_time/1000):.0f} txn/sec")
    
    # Get service stats
    print("\n3. Service statistics:")
    stats = client.get_stats()
    if "service" in stats:
        service_stats = stats["service"]
        print(f"   Total inferences: {service_stats.get('inference_count', 'N/A')}")
        print(f"   Errors: {service_stats.get('error_count', 'N/A')}")
        print(f"   Avg latency: {service_stats.get('average_inference_time', 'N/A')}ms")


def example_4_error_handling():
    """Example 4: Error handling and recovery"""
    print("\n📊 Example 4: Error Handling")
    print("=" * 50)
    
    client = MLServiceClient("http://localhost:5000")
    
    # Test with invalid data
    print("Testing error handling...")
    
    # Empty transaction
    print("\n1. Empty transaction:")
    result = client.predict({})
    if isinstance(result, PredictionResult):
        print(f"   ✅ Prediction: {result.score}")
    else:
        print(f"   ⚠️  Error (expected): {result.get('error', 'Unknown')}")
    
    # Missing key features
    print("\n2. Minimal transaction:")
    result = client.predict({"Amount": 100})
    if isinstance(result, PredictionResult):
        print(f"   ✅ Prediction: {result.score}")
    else:
        print(f"   ⚠️  Error: {result}")
    
    # Invalid batch
    print("\n3. Invalid batch format:")
    result = requests.post(
        "http://localhost:5000/predict-batch",
        json={"not": "a list"}
    )
    print(f"   Status: {result.status_code}")
    print(f"   Response: {result.json().get('error', 'N/A')}")


def example_5_real_time_monitoring():
    """Example 5: Real-time monitoring"""
    print("\n📊 Example 5: Real-Time Monitoring")
    print("=" * 50)
    
    client = MLServiceClient("http://localhost:5000")
    
    print("Starting real-time monitoring (30 seconds)...")
    
    start_time = time.time()
    transaction_count = 0
    
    while time.time() - start_time < 30:
        # Send random transactions
        transaction = {
            "id": f"TXN-{transaction_count}",
            "Amount": (transaction_count % 5000) + 100,
            "Time": transaction_count * 100,
        }
        
        result = client.predict(transaction)
        if isinstance(result, PredictionResult):
            transaction_count += 1
            
            # Print every 10 transactions
            if transaction_count % 10 == 0:
                stats = client.get_stats()
                if "client" in stats:
                    client_stats = stats["client"]
                    elapsed = time.time() - start_time
                    throughput = transaction_count / elapsed
                    print(
                        f"   {transaction_count} txn in {elapsed:.1f}s "
                        f"({throughput:.0f} txn/sec) - "
                        f"Avg latency: {client_stats.get('avgInferenceTime', 'N/A')}ms"
                    )
        
        time.sleep(0.01)  # Small delay
    
    print(f"\n✅ Completed: {transaction_count} transactions in 30 seconds")
    print(f"   Throughput: {transaction_count/30:.0f} txn/sec")


def example_6_model_info():
    """Example 6: Get model information"""
    print("\n📊 Example 6: Model Information")
    print("=" * 50)
    
    client = MLServiceClient("http://localhost:5000")
    
    print("Fetching model information...")
    info = client.get_model_info()
    
    print(f"\nModel Details:")
    print(f"   Type: {info.get('model_type', 'N/A')}")
    print(f"   Path: {info.get('model_path', 'N/A')}")
    print(f"   Features: {info.get('feature_count', 'N/A')}")
    print(f"   Loaded: {info.get('is_loaded', 'N/A')}")
    print(f"   Loaded at: {info.get('load_time', 'N/A')}")
    
    features = info.get('features', [])
    if features:
        print(f"\n   Feature list ({len(features)}):")
        for i in range(0, min(5, len(features))):
            print(f"     - {features[i]}")
        if len(features) > 5:
            print(f"     ... and {len(features)-5} more")


def example_7_stress_test():
    """Example 7: Stress testing"""
    print("\n📊 Example 7: Stress Test")
    print("=" * 50)
    
    print("⚠️  This will send many requests. Press Ctrl+C to stop.")
    time.sleep(2)
    
    client = MLServiceClient("http://localhost:5000")
    
    print("Running stress test...")
    
    batch_size = 100
    num_batches = 10
    
    for batch_num in range(num_batches):
        # Create batch
        transactions = [
            {
                "id": f"TXN-{batch_num}-{i}",
                "Amount": (i % 1000) * 10,
                "Time": i * 100,
            }
            for i in range(batch_size)
        ]
        
        # Send batch
        start = time.time()
        results = client.predict_batch(transactions)
        elapsed = (time.time() - start) * 1000
        
        if isinstance(results, list):
            print(
                f"   Batch {batch_num+1}/{num_batches}: "
                f"{len(results)} txn in {elapsed:.0f}ms "
                f"({len(results)/(elapsed/1000):.0f} txn/sec)"
            )
        else:
            print(f"   Batch {batch_num+1}/{num_batches}: ❌ Error")
    
    print("\n✅ Stress test complete")
    stats = client.get_stats()
    print(f"Total stats: {json.dumps(stats, indent=2)}")


# Run examples
if __name__ == "__main__":
    print("🚀 ML Service Examples")
    print("=" * 50)
    
    examples = [
        example_1_single_prediction,
        example_2_batch_prediction,
        example_3_performance_benchmark,
        example_4_error_handling,
        example_5_real_time_monitoring,
        example_6_model_info,
        # example_7_stress_test,  # Uncomment to run
    ]
    
    for i, example in enumerate(examples, 1):
        try:
            example()
        except Exception as e:
            print(f"\n❌ Error in example {i}: {str(e)}")
        
        if i < len(examples):
            time.sleep(1)
    
    print("\n✅ All examples completed!")
