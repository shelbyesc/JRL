import React, { useState } from "react";

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
  if (!apiUrl) console.warn("⚠️ VITE_API_URL is not defined.");

  const handleChange = (key, value) => {
    const num = parseFloat(value);
    if (!isNaN(num)) {
      setInputs({ ...inputs, [key]: num });
    }
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch(`${apiUrl}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inputs)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Backend error");
      setPrediction(data.prediction);
      setProbability(data.probability);
    } catch (err) {
      setError("Prediction failed:\n" + err.message);
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
      const res = await fetch(`${apiUrl}/send_code_email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          institution,
          first,
          last,
          oneTimeCode: oneTime,
          permanentCode: permanent
        })
      });
      if (!res.ok) throw new Error();
      alert(`Codes sent to ${email}.`);
    } catch {
      alert("Failed to send code.");
    }
  };

  const handleSubmitData = async () => {
    const trimmedRisk = enteredRisk.trim();
    if (!code || !["0", "1"].includes(trimmedRisk)) {
      alert("Enter a valid code and collapse risk (0 or 1).");
      return;
    }
    try {
      const res = await fetch(`${apiUrl}/submit_data`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...inputs,
          collapseRisk: trimmedRisk,
          calculated: prediction,
          code: code
        })
      });
      if (!res.ok) throw new Error();
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
          <p><strong>Probability:</strong> {(probability * 100).toFixed(2)}%</p>
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
