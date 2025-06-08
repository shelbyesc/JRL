// import React, { useState } from 'react';
// import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
// import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
// import * as Google from 'expo-auth-session/providers/google';
// import * as WebBrowser from 'expo-web-browser';

// WebBrowser.maybeCompleteAuthSession();

// export default function LoginScreen() {
//   const auth = getAuth();
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');

//   // 🔐 Replace with your Firebase Web Client ID (OAuth 2.0)
//   const [request, response, promptAsync] = Google.useAuthRequest({
//     expoClientId: 'YOUR_EXPO_CLIENT_ID'
//   });

//   const handleLogin = async () => {
//     try {
//       await signInWithEmailAndPassword(auth, email, password);
//     } catch (error) {
//       Alert.alert('Login Error', error.message);
//     }
//   };

//   const handleSignup = async () => {
//     try {
//       await createUserWithEmailAndPassword(auth, email, password);
//       Alert.alert('Account created');
//     } catch (error) {
//       Alert.alert('Signup Error', error.message);
//     }
//   };

//   const handleGoogleLogin = async () => {
//     if (response?.type === 'success') {
//       const { id_token } = response.params;
//       const credential = GoogleAuthProvider.credential(id_token);
//       await signInWithCredential(auth, credential);
//     }
//   };

//   if (response?.type === 'success') {
//     handleGoogleLogin();
//   }

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Collapse Risk Predictor</Text>

//       <TextInput
//         style={styles.input}
//         placeholder="Email"
//         keyboardType="email-address"
//         autoCapitalize="none"
//         onChangeText={setEmail}
//         value={email}
//       />

//       <TextInput
//         style={styles.input}
//         placeholder="Password"
//         secureTextEntry
//         onChangeText={setPassword}
//         value={password}
//       />

//       <TouchableOpacity style={styles.button} onPress={handleLogin}>
//         <Text style={styles.buttonText}>Log In</Text>
//       </TouchableOpacity>

//       <TouchableOpacity style={styles.link} onPress={handleSignup}>
//         <Text style={styles.linkText}>Create New Account</Text>
//       </TouchableOpacity>

//       <View style={styles.divider}><Text>or</Text></View>

//       <TouchableOpacity style={styles.googleButton} onPress={() => promptAsync()}>
//         <Text style={styles.googleText}>Sign in with Google</Text>
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 30, paddingTop: 80, backgroundColor: '#f5f5f5' },
//   title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 30 },
//   input: { backgroundColor: '#fff', padding: 12, borderRadius: 8, borderColor: '#ccc', borderWidth: 1, marginBottom: 15 },
//   button: { backgroundColor: '#1E90FF', padding: 15, borderRadius: 8, marginTop: 10 },
//   buttonText: { color: '#fff', textAlign: 'center', fontSize: 16 },
//   link: { marginTop: 12, alignItems: 'center' },
//   linkText: { color: '#1E90FF', fontSize: 14 },
//   divider: { marginVertical: 20, alignItems: 'center' },
//   googleButton: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 8, alignItems: 'center' },
//   googleText: { fontSize: 16 }
// });
