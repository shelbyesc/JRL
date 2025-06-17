import os
import pandas as pd
import joblib
from flask import Flask, request, jsonify
from flask_cors import CORS
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from dotenv import load_dotenv
from werkzeug.utils import secure_filename
from datetime import datetime

# Load environment variables
load_dotenv()

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

@app.route("/submit_data", methods=["POST"])
def submit_data():
    try:
        data = request.json
        collapseRisk = data.get("collapseRisk", "")
        calculated = data.get("calculated", "")
        code = data.get("code", "")
        if not collapseRisk or not code:
            return jsonify({"error": "Missing collapseRisk or code"}), 400

        row = {k: data.get(k, None) for k in feature_names}
        row["collapseRisk"] = collapseRisk
        row["calculated_collapseRisk"] = calculated
        row["code"] = code
        row["date_of_submission"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        original_file = "labraltearForModel.xlsx"
        base_name = "labraltearForModel"
        extension = ".xlsx"
        backup_folder = "backups"
        os.makedirs(backup_folder, exist_ok=True)

        i = 1
        while os.path.exists(os.path.join(backup_folder, f"{base_name}({i}){extension}")):
            i += 1
        backup_file = os.path.join(backup_folder, f"{base_name}({i}){extension}")

        if os.path.exists(original_file):
            os.rename(original_file, backup_file)
        else:
            return jsonify({"error": "Original database file not found."}), 500

        df = pd.read_excel(backup_file)
        df = pd.concat([df, pd.DataFrame([row])], ignore_index=True)
        df.to_excel(original_file, index=False)

        return jsonify({"status": "submitted", "backup": backup_file, "current": original_file})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/send_code_email", methods=["POST"])
def send_code_email():
    try:
        data = request.json
        email = data.get("email")
        institution = data.get("institution")
        first = data.get("first")
        last = data.get("last")
        one_time = data.get("oneTimeCode")
        permanent = data.get("permanentCode")

        if not all([email, institution, first, last, one_time, permanent]):
            return jsonify({"error": "Missing one or more required fields"}), 400

        message = Mail(
            from_email="shelbyesc@gmail.com",  # ✅ Replace with your verified sender
            to_emails=email,
            subject="Your JRL Submission Code",
            plain_text_content=(
                f"Hi {first} {last} from {institution},\n\n"
                f"Your one-time code: {one_time}\n"
                f"Your permanent code: {permanent}\n\n"
                f"Thank you for using the Collapse Risk Predictor!"
            )
        )

        sg = SendGridAPIClient(os.getenv("SENDGRID_API_KEY"))
        sg.send(message)
        return jsonify({"status": "email sent"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ✅ Required to run on Render or any cloud platform that sets PORT dynamically
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port)
