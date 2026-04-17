import axios from "axios";

export async function predictRisk(data) {
  try {
    const response = await axios.post("http://localhost:5000/predict", data);

    return response.data;
  } catch (err) {
    console.error(err);
    // Return mock data if ML service is not available
    const score = Math.random();
    let risk = "LOW";
    if (score > 0.7) risk = "HIGH";
    else if (score > 0.4) risk = "MEDIUM";
    
    return { risk, score };
  }
}
