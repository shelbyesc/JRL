import React, { useState, useEffect, useRef } from 'react';
import {
  ScrollView,
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';

import { API_URL } from '../env'; // ✅ IMPORT SHARED API BASE URL

const featureList = [
  "shaftangle", "offset", "headdiameter", "lateraledge", "acetabdiameter",
  "alphaangle", "combinednecrotic", "maxpercent", "percentnecrotic", "volum",
  "labraltear", "age", "male", "white", "toxic", "medical", "idiopathic", "trauma"
];
const binaryFields = ["male", "white", "toxic", "medical", "idiopathic", "trauma"];

export default function PredictScreen() {
  const [inputs, setInputs] = useState({});
  const [result, setResult] = useState(null);
  const [enteredCollapseRisk, setEnteredCollapseRisk] = useState('');
  const [calculatedCollapseRisk, setCalculatedCollapseRisk] = useState('');
  const [code, setCode] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [requestFields, setRequestFields] = useState({ email: '', institution: '', first: '', last: '' });
  const [excelModalVisible, setExcelModalVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const inputRefs = useRef(featureList.map(() => React.createRef()));

  useEffect(() => {
    (async () => {
      const savedCode = await AsyncStorage.getItem('userCode');
      if (savedCode) setCode(savedCode);
    })();
  }, []);

  const handleChange = (key, value) => {
    if (binaryFields.includes(key) && value !== '0' && value !== '1') {
      Alert.alert("Input Error", `${key} must be 0 or 1`);
      return;
    }
    const num = parseFloat(value);
    setInputs({ ...inputs, [key]: isNaN(num) ? 0 : num });
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch(`${API_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inputs),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const json = await response.json();
      setResult(json);
      setCalculatedCollapseRisk(json.prediction.toString());
    } catch (error) {
      console.error("API request failed:", error);
      Alert.alert("Error", "Could not connect to the prediction API.");
    }
  };

  const handleDatabaseSubmit = () => {
    if (!enteredCollapseRisk || (enteredCollapseRisk !== '0' && enteredCollapseRisk !== '1')) {
      Alert.alert("Manual Entry Required", "Please enter collapse risk as 0 or 1.");
      return;
    }
    setModalVisible(true);
  };

  const handleRequestCode = async () => {
    if (!requestFields.email || !/\S+@\S+\.\S+/.test(requestFields.email)) {
      Alert.alert("Input Error", "Please enter a valid email.");
      return;
    }
    const oneTime = `ONE-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const permanent = `PERM-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    await fetch(`${API_URL}/send_code_email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...requestFields,
        oneTimeCode: oneTime,
        permanentCode: permanent,
      }),
    });

    Alert.alert("Codes Sent", "Codes have been sent for approval to ShelbyEsc@gmail.com.");
    setRequestFields({ email: '', institution: '', first: '', last: '' });
  };

  const handleConfirmSubmit = async () => {
    if (code.startsWith("PERM-")) {
      await AsyncStorage.setItem("userCode", code);
    }
    const payload = { ...inputs, collapseRisk: enteredCollapseRisk, code };
    const response = await fetch(`${API_URL}/submit_data`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (response.ok) {
      Alert.alert("Submitted", "Data submitted and stored.");
    } else {
      Alert.alert("Error", "Submission failed.");
    }
    setModalVisible(false);
  };

  const handleExcelSubmit = () => setExcelModalVisible(true);

  const pickExcelFile = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'],
        copyToCacheDirectory: true
      });
      if (res.type === 'success') setSelectedFile(res);
    } catch (error) {
      Alert.alert("Error", "Failed to pick Excel file.");
    }
  };

  const sendExcelFile = async () => {
    if (!selectedFile) {
      Alert.alert("Error", "No file selected.");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("file", {
        uri: selectedFile.uri,
        name: selectedFile.name,
        type: selectedFile.mimeType || "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const response = await fetch(`${API_URL}/submit_excel`, {
        method: "POST",
        headers: { "Content-Type": "multipart/form-data" },
        body: formData,
      });
      const result = await response.json();
      if (response.ok) Alert.alert("Success", `File uploaded: ${result.file}`);
      else Alert.alert("Upload Failed", result.error || "Unknown error");
      setExcelModalVisible(false);
      setSelectedFile(null);
    } catch (error) {
      console.error("Upload error:", error);
      Alert.alert("Error", "Failed to upload Excel file.");
    }
  };

  const handleReset = () => {
    setInputs({});
    setResult(null);
    setEnteredCollapseRisk('');
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>{'\n\n'}Collapse Risk Prediction</Text>

          {featureList.map((key, index) => (
            <View key={key} style={styles.inputGroup}>
              <Text style={styles.label}>{key}</Text>
              {binaryFields.includes(key) && <Text style={styles.helper}>Enter 0 or 1</Text>}
              <TextInput
                ref={inputRefs.current[index]}
                keyboardType="default"
                returnKeyType="next"
                onSubmitEditing={() => {
                  if (index < featureList.length - 1) inputRefs.current[index + 1].current.focus();
                  else Keyboard.dismiss();
                }}
                blurOnSubmit={false}
                style={styles.input}
                onChangeText={(text) => handleChange(key, text)}
                value={inputs[key] !== undefined ? String(inputs[key]) : ''}
              />
            </View>
          ))}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Calculated Risk (Read-only)</Text>
            <TextInput editable={false} value={calculatedCollapseRisk} style={[styles.input, { backgroundColor: '#eee' }]} />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Entered Risk (Manual, required for submission)</Text>
            <TextInput
              placeholder="Enter 0 or 1"
              style={styles.input}
              keyboardType="default"
              value={enteredCollapseRisk}
              onChangeText={(val) => {
                if (val !== '0' && val !== '1') {
                  Alert.alert("Manual Entry Error", "Collapse risk must be 0 or 1.");
                  return;
                }
                setEnteredCollapseRisk(val);
              }}
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Predict</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handleDatabaseSubmit}>
            <Text style={styles.buttonText}>Submit to database</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.resetButton} onPress={handleExcelSubmit}>
            <Text style={styles.resetButtonText}>Submit an Excel sheet to database</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
            <Text style={styles.resetButtonText}>Reset</Text>
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

          {/* Modal code unchanged */}
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 80, backgroundColor: '#f5f5f5' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  inputGroup: { marginBottom: 12 },
  label: { marginBottom: 4, fontSize: 14, fontWeight: '600' },
  helper: { fontSize: 12, color: '#666', marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#999', padding: 10, borderRadius: 6, backgroundColor: '#fff', marginBottom: 10 },
  button: { backgroundColor: '#1E90FF', padding: 16, borderRadius: 8, marginTop: 16 },
  buttonText: { color: '#fff', textAlign: 'center', fontSize: 17, fontWeight: '600' },
  resetButton: { backgroundColor: '#ccc', padding: 14, borderRadius: 8, marginTop: 12 },
  resetButtonText: { color: '#333', textAlign: 'center', fontSize: 16, fontWeight: '500' },
  result: { marginTop: 30, padding: 15, backgroundColor: '#e6f7ff', borderRadius: 8 },
  prediction: { fontSize: 18, fontWeight: 'bold' },
  probability: { fontSize: 16, marginTop: 5 },
  modalOverlay: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 20 },
  modalContainer: { backgroundColor: '#fff', borderRadius: 10, padding: 20 },
});
