
import React, { useState, useEffect } from 'react';
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
  Modal
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';

const featureList = [
  "shaftangle", "offset", "headdiameter", "lateraledge", "acetabdiameter",
  "alphaangle", "combinednecrotic", "maxpercent", "percentnecrotic", "volum",
  "labraltear", "age", "male", "white", "toxic", "medical", "idiopathic", "trauma"
];
const binaryFields = ["male", "white", "toxic", "medical", "idiopathic", "trauma"];

export default function PredictScreen() {
  const [inputs, setInputs] = useState({});
  const [result, setResult] = useState(null);
  const [collapseRisk, setCollapseRisk] = useState('');
  const [code, setCode] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [requestFields, setRequestFields] = useState({ email: '', institution: '', first: '', last: '' });
  const [excelModalVisible, setExcelModalVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

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
      const response = await fetch("https://jrl.onrender.com/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inputs),
      });
      const json = await response.json();
      setResult(json);
      if (!collapseRisk) setCollapseRisk(json.prediction.toString());
    } catch (error) {
      Alert.alert("Error", "Could not connect to the prediction API.");
    }
  };

  const handleDatabaseSubmit = () => {
  console.log("🟨 Submit to database clicked");
  const trimmedRisk = collapseRisk.trim();

  if (!wasManuallyEdited) {
    if (trimmedRisk === result?.prediction?.toString()) {
      console.log("⚠️ Submission blocked: matches auto-filled value and wasn't edited");
      setCollapseRisk('');
      Alert.alert("Manual Entry Required", "Please manually enter collapse risk (0 or 1).");
      return;
    }
  }

  if (trimmedRisk !== '0' && trimmedRisk !== '1') {
    console.log("❌ Invalid collapse risk entered:", trimmedRisk);
    Alert.alert("Invalid Entry", "Collapse risk must be 0 or 1.");
    return;
  }

  console.log("✅ Valid manual entry:", trimmedRisk);
  setCollapseRisk(trimmedRisk);
  setModalVisible(true);
};
  const trimmedRisk = collapseRisk.trim();
  if (trimmedRisk === result?.prediction?.toString()) {
    setCollapseRisk('');
    console.log('Clearing auto-filled value');
    Alert.alert("Manual Entry Required", "Please enter collapse risk manually (0 or 1).");
    return;
  }
  if (trimmedRisk !== '0' && trimmedRisk !== '1') {
    Alert.alert("Invalid Entry", "Collapse risk must be 0 or 1.");
    return;
  }

    if (trimmedRisk !== '0' && trimmedRisk !== '1') {
      Alert.alert("Invalid Entry", "Collapse risk must be 0 or 1.");
      return;
    }
    setCollapseRisk(trimmedRisk);
  setModalVisible(true);
  };

  const handleRequestCode = async () => {
    const emailIsValid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(requestFields.email);
    if (!emailIsValid) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }
    const oneTime = `ONE-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const permanent = `PERM-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    await fetch("https://jrl.onrender.com/send_code_email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...requestFields,
        oneTimeCode: oneTime,
        permanentCode: permanent,
      }),
    });

    Alert.alert("Codes Sent", "Codes have been sent to ShelbyEsc@gmail.com.");
    setRequestFields({ email: '', institution: '', first: '', last: '' });
  };

  const handleConfirmSubmit = async () => {
    if (code.startsWith("PERM-")) {
      await AsyncStorage.setItem("userCode", code);
    }

    const payload = { ...inputs, collapseRisk, code };

    const response = await fetch("https://jrl.onrender.com/submit_data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      Alert.alert("Submitted", "Data submitted successfully.");
    } else {
      Alert.alert("Error", "Submission failed.");
    }

    setModalVisible(false);
  };

  const handleExcelSubmit = async () => {
    setExcelModalVisible(true);
  };

  const pickExcelFile = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'],
        copyToCacheDirectory: true
      });
      if (res.type === 'success') {
        setSelectedFile(res);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick Excel file.");
    }
  };

  const sendExcelFile = async () => {
    Alert.alert("Upload Placeholder", "Simulated file upload complete.");
    setExcelModalVisible(false);
    setSelectedFile(null);
  };

  const handleReset = () => {
    setInputs({});
    setResult(null);
    setCollapseRisk('');
    console.log('Clearing auto-filled value');
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>{"\n\n"}Collapse Risk Prediction</Text>

          {featureList.map((key) => (
            <View key={key} style={styles.inputGroup}>
              <Text style={styles.label}>{key}</Text>
              {binaryFields.includes(key) && <Text style={styles.helper}>Enter 0 or 1</Text>}
              <TextInput
                keyboardType="numeric"
                style={styles.input}
                onChangeText={(text) => handleChange(key, text)}
                value={inputs[key] !== undefined ? String(inputs[key]) : ''}
              />
            </View>
          ))}

          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Predict</Text>
          </TouchableOpacity>

          <TextInput
            placeholder="Enter collapse risk (0 or 1)"
            keyboardType="numeric"
            style={styles.input}
            value={collapseRisk}
            onChangeText={setCollapseRisk}
          />

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
                Probability: {result.probability ?? 'N/A'}%
              </Text>
            </View>
          )}

          <Modal visible={modalVisible} transparent animationType="slide">
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                  <Text style={styles.label}>Enter Code to submit</Text>
                  <TextInput style={styles.input} value={code} onChangeText={setCode} />
                  <Text style={styles.helper}>Request a code to submit</Text>
                  {["email", "institution", "first", "last"].map((field) => (
                    <TextInput
                      key={field}
                      placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                      style={styles.input}
                      value={requestFields[field]}
                      onChangeText={(text) => setRequestFields({ ...requestFields, [field]: text })}
                    />
                  ))}
                  <TouchableOpacity style={styles.button} onPress={handleRequestCode}>
                    <Text style={styles.buttonText}>Request Code</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.button} onPress={handleConfirmSubmit}>
                    <Text style={styles.buttonText}>Confirm Submit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.resetButton} onPress={() => setModalVisible(false)}>
                    <Text style={styles.resetButtonText}>Exit</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </Modal>

          <Modal visible={excelModalVisible} transparent animationType="slide">
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                  <Text style={styles.label}>Upload Excel File</Text>
                  <TouchableOpacity style={styles.button} onPress={pickExcelFile}>
                    <Text style={styles.buttonText}>Choose File</Text>
                  </TouchableOpacity>
                  {selectedFile && <Text style={styles.helper}>Selected: {selectedFile.name}</Text>}
                  <TouchableOpacity style={styles.button} onPress={sendExcelFile}>
                    <Text style={styles.buttonText}>Send</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.resetButton} onPress={() => setExcelModalVisible(false)}>
                    <Text style={styles.resetButtonText}>Exit</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
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
  modalOverlay: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 20 },
  modalContainer: { backgroundColor: '#fff', borderRadius: 10, padding: 20 },
});