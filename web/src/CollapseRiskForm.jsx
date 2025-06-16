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
  const [enteredRisk, setEnteredRisk] = useState("");
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [institution, setInstitution] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const apiUrl = import.meta.env.VITE_API_URL;

  const handleChange = (key, value) => {
    setInputs({ ...inputs, [key]: parseFloat(value) || 0 });
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await axios.post(`${apiUrl}/predict`, inputs);
      setPrediction(res.data.prediction);
      setProbability(res.data.probability);
    } catch (err) {
      console.error("Prediction error:", err);
      let msg = "Unknown error from backend";
      if (err.response?.data?.error) {
        msg = err.response.data.error;
      } else if (err.response?.data) {
        try {
          msg = JSON.stringify(err.response.data, null, 2);
        } catch {
          msg = "[Error object]";
        }
      } else if (err.message) {
        msg = err.message;
      }
      setError("Prediction failed:\n" + msg);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestCode = async () => {
    if (!email || !first || !last || !institution) {
      alert("Please fill in all identity fields.");
      return;
    }
    const oneTime = "ONE-" + Math.random().toString(36).substr(2, 6).toUpperCase();
    const permanent = "PERM-" + Math.random().toString(36).substr(2, 6).toUpperCase();
    try {
      await axios.post(`${apiUrl}/send_code_email`, {
        email,
        institution,
        first,
        last,
        oneTimeCode: oneTime,
        permanentCode: permanent
      });
      alert("Codes sent to ShelbyEsc@gmail.com.");
    } catch {
      alert("Failed to send code.");
    }
  };

  const handleSubmitData = async () => {
    if (!code || !enteredRisk || !["0", "1"].includes(enteredRisk)) {
      alert("Enter a valid code and collapse risk (0 or 1).");
      return;
    }
    try {
      await axios.post(`${apiUrl}/submit_data`, {
        ...inputs,
        collapseRisk: enteredRisk,
        calculated: prediction,
        code: code
      });
      setMessage("✅ Submitted successfully.");
    } catch {
      setError("Submission failed.");
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "auto", padding: 20 }}>
      <h2>Collapse Risk Predictor</h2>
      <form onSubmit={handlePredict}>
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

      <div style={{ marginTop: 30 }}>
        <h3>Secure Submit</h3>
        <div style={{ marginBottom: 10 }}>
          <label>Collapse Risk (Manual):</label>
          <input
            type="text"
            maxLength="1"
            value={enteredRisk}
            onChange={(e) => setEnteredRisk(e.target.value)}
            style={{ width: "100%", padding: 8, marginTop: 4 }}
            placeholder="Enter 0 or 1"
          />
        </div>
        <div style={{ marginBottom: 10 }}>
          <label>Code:</label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            style={{ width: "100%", padding: 8, marginTop: 4 }}
          />
        </div>
        <button onClick={handleSubmitData} style={{ padding: 10, marginTop: 10 }}>
          Submit to Database
        </button>
      </div>

      <div style={{ marginTop: 30 }}>
        <h4>Need a Code?</h4>
        <input placeholder="First Name" value={first} onChange={(e) => setFirst(e.target.value)} style={{ width: "100%", marginBottom: 5 }} />
        <input placeholder="Last Name" value={last} onChange={(e) => setLast(e.target.value)} style={{ width: "100%", marginBottom: 5 }} />
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: "100%", marginBottom: 5 }} />
        <input placeholder="Institution" value={institution} onChange={(e) => setInstitution(e.target.value)} style={{ width: "100%", marginBottom: 5 }} />
        <button onClick={handleRequestCode} style={{ padding: 8, marginTop: 5 }}>
          Request Code
        </button>
      </div>

      {error && <p style={{ color: "red", marginTop: 20, whiteSpace: "pre-wrap" }}>{error}</p>}
      {message && <p style={{ color: "green", marginTop: 20 }}>{message}</p>}
    </div>
  );
};

export default CollapseRiskForm;
