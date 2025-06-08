import React, { useState } from 'react';
import {
  ScrollView,
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';

const featureList = [
  "shaftangle", "offset", "headdiameter", "lateraledge", "acetabdiameter",
  "alphaangle", "combinednecrotic", "maxpercent", "percentnecrotic", "volum",
  "labraltear", "age", "male", "white", "toxic", "medical", "idiopathic", "trauma"
];

export default function PredictScreen() {
  const [inputs, setInputs] = useState({});
  const [result, setResult] = useState(null);

  const handleChange = (key, value) => {
    const num = parseFloat(value);
    setInputs({ ...inputs, [key]: isNaN(num) ? 0 : num });
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch("https://jrl.onrender.com/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inputs),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const json = await response.json();
      setResult(json);
    } catch (error) {
      console.error("API request failed:", error);
      Alert.alert("Error", "Could not connect to the prediction API.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Collapse Risk Prediction</Text>
      {featureList.map((key) => (
        <View key={key} style={styles.inputGroup}>
          <Text style={styles.label}>{key}</Text>
          <TextInput
            keyboardType="numeric"
            style={styles.input}
            onChangeText={(text) => handleChange(key, text)}
          />
        </View>
      ))}
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Predict</Text>
      </TouchableOpacity>

      {result && (
        <View style={styles.result}>
          <Text style={styles.prediction}>
            Prediction: {result.prediction === 1 ? "High Risk" : "Low Risk"}
          </Text>
          <Text style={styles.probability}>
            Probability: {result.probability}%
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginTop: 40,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    marginBottom: 4,
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#999',
    padding: 10,
    borderRadius: 6,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#1E90FF',
    padding: 16,
    borderRadius: 8,
    marginTop: 24,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '600',
  },
  result: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#e6f7ff',
    borderRadius: 8,
  },
  prediction: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  probability: {
    fontSize: 16,
    marginTop: 5,
  },
});
