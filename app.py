import os
import pandas as pd
import joblib
from flask import Flask, request, jsonify
from flask_cors import CORS
import smtplib
from email.message import EmailMessage

app = Flask(__name__)
CORS(app)

# Load model and scaler
try:
    model = joblib.load("random_forest_model_v1.7.0.joblib")
    scaler = joblib.load("scaler_v1.7.0.joblib")
    print("✅ Model and scaler loaded successfully.")
except Exception as e:
    print(f"❌ Error loading model or scaler: {e}")

feature_names = [
    "shaftangle", "offset", "headdiameter", "lateraledge", "acetabdiameter",
    "alphaangle", "combinednecrotic", "maxpercent", "percentnecrotic", "volum",
    "labraltear", "age", "male", "white", "toxic", "medical", "idiopathic", "trauma"
]

@app.route("/", methods=["GET"])
def home():
    return "✅ JRL API is running."

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.json
        X_input = pd.DataFrame([data], columns=feature_names)
        X_scaled = scaler.transform(X_input)
        probability = model.predict_proba(X_scaled)[0][1]
        prediction = int(probability > 0.5)
        return jsonify({
            "prediction": prediction,
            "probability": round(probability * 100, 2)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/send_code_email", methods=["POST"])
def send_code_email():
    try:
        data = request.json
        email = data.get("email", "")
        institution = data.get("institution", "")
        first = data.get("first", "")
        last = data.get("last", "")
        one_time = data.get("oneTimeCode", "")
        permanent = data.get("permanentCode", "")

        msg = EmailMessage()
        msg["Subject"] = "🔐 New Code Request for JRL App"
        msg["From"] = "noreply@yourapp.com"
        msg["To"] = "ShelbyEsc@gmail.com"
        msg.set_content(f"""
New code request received:

Requester Email: {email}
Institution: {institution}
Name: {first} {last}

Generated Codes:
One-time: {one_time}
Permanent: {permanent}
""")

        # 🔐 Update these with your actual Gmail + App Password
        smtp_server = "smtp.gmail.com"
        smtp_port = 587
        smtp_user = "shelbyesc@gmail.com"        # 🔁 Replace with your Gmail
        smtp_pass = "5698tara"      # 🔁 Replace with App Password

        with smtplib.SMTP(smtp_server, smtp_port) as smtp:
            smtp.starttls()
            smtp.login(smtp_user, smtp_pass)
            smtp.send_message(msg)

        return jsonify({"status": "email sent"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
