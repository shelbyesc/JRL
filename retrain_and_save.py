import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
import joblib

print("🔁 Training model...")

df = pd.read_excel("labraltearForModel.xlsx")

# Clean up
for col in ['combinednecrotic', 'maxpercent', 'percentnecrotic']:
    df[col] = pd.to_numeric(df[col].replace('.', np.nan), errors='coerce')

df.drop(columns=["ID", "Ficat Class"], inplace=True)
df.fillna(df.mean(), inplace=True)

# Prepare features
X = df.drop(columns=["collapse"])
y = df["collapse"]

# Train model
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)
model = RandomForestClassifier(random_state=42)
model.fit(X_scaled, y)

# Save
joblib.dump(model, "random_forest_model_v1.7.0.joblib")
joblib.dump(scaler, "scaler_v1.7.0.joblib")

print("✅ Model and scaler saved successfully.")
