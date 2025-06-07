import os
print("📁 Working directory:", os.getcwd())
print("📂 Files:", os.listdir())

from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd

app = Flask(__name__)
CORS(app)

# Load model and scaler
try:
    model = joblib.load("random_forest_model_v1.7.0.joblib")
    scaler = joblib.load("scaler_v1.7.0.joblib")
    print("✅ Model and scaler loaded successfully.")
except Exception as e:
    print(f"Error loading model or scaler: {e}")

feature_names = [
    "shaftangle", "offset", "headdiameter", "lateraledge", "acetabdiameter",
    "alphaangle", "combinednecrotic", "maxpercent", "percentnecrotic", "volum",
    "labraltear", "age", "male", "white", "toxic", "medical", "idiopathic", "trauma"
]

@app.route("/", methods=["GET"])
def home():
    return "✅ JRL API is running. Try POST to /predict."

@app.route("/predict", methods=["POST"])
def predict():
    data = request.json
    X_input = pd.DataFrame([data], columns=feature_names)
    X_scaled = scaler.transform(X_input)
    probability = model.predict_proba(X_scaled)[0][1]
    prediction = int(probability > 0.5)
    return jsonify({
        "prediction": prediction,
        "probability": round(probability * 100, 2)
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
