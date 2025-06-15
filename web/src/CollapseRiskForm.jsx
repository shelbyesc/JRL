import React, { useState } from "react";
import axios from "axios";

const featureList = [
  "shaftangle", "offset", "headdiameter", "lateraledge", "acetabdiameter",
  "alphaangle", "combinednecrotic", "maxpercent", "percentnecrotic", "volum",
  "labraltear", "age", "male", "white", "toxic", "medical", "idiopathic", "trauma"
];

const CollapseRiskForm = () => {
  const [inputs, setInputs] = useState({});
  const [prediction, setPrediction] = useState(null);
  const [probability, setProbability] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (key, value) => {
    setInputs({ ...inputs, [key]: parseFloat(value) || 0 });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
     const res = await axios.post("https://collapserisk-api.onrender.com/predict", inputs);
      setProbability(res.data.probability);
    } catch (err) {
      setError("Prediction failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "auto", padding: 20 }}>
      <h2>Collapse Risk Predictor</h2>
      <form onSubmit={handleSubmit}>
        {featureList.map((key) => (
          <div key={key} style={{ marginBottom: 10 }}>
            <label>{key}:</label>
            <input
              type="number"
              step="any"
              onChange={(e) => handleChange(key, e.target.value)}
              style={{ width: "100%", padding: 8, marginTop: 4 }}
              required
            />
          </div>
        ))}
        <button type="submit" disabled={loading} style={{ padding: 10, marginTop: 10 }}>
          {loading ? "Calculating..." : "Predict"}
        </button>
      </form>
      {prediction !== null && (
        <div style={{ marginTop: 20 }}>
          <h3>Result</h3>
          <p><strong>Prediction:</strong> {prediction === 1 ? "High Risk" : "Low Risk"}</p>
          <p><strong>Probability:</strong> {probability}%</p>
        </div>
      )}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default CollapseRiskForm;
