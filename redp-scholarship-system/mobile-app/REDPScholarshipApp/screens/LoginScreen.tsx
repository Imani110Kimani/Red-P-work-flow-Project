import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';

export default function LoginScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image source={require('../assets/redp-logo.png')} style={styles.logo} />
      </View>
      <Text style={styles.title}>Admin Login</Text>
      <Text style={styles.subtitle}>Access RED(P) Management System</Text>
      <TextInput style={styles.input} placeholder="Email Address" keyboardType="email-address" autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="Password" secureTextEntry />
      <TouchableOpacity style={styles.forgot}>
        <Text style={styles.forgotText}>Forgot password?</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Confirmation')}>
        <Text style={styles.buttonText}>Sign In</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.signup}>
        <Text style={styles.signupText}>Need an account? Sign up</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff7f0', padding: 20 },
  logoContainer: { width: '100%', alignItems: 'center', marginBottom: 12, position: 'relative' },
  logo: { width: 80, height: 80, borderRadius: 20, marginBottom: 4, backgroundColor: 'rgba(255,122,0,0.08)', borderWidth: 1, borderColor: '#eee', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 2, elevation: 2, opacity: 0.85 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#555', marginBottom: 24 },
  input: { width: '100%', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 16 },
  forgot: { alignSelf: 'flex-end', marginBottom: 16 },
  forgotText: { color: '#f60', fontWeight: '500' },
  button: { backgroundColor: '#f60', borderRadius: 8, paddingVertical: 14, width: '100%', alignItems: 'center', marginBottom: 16 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  signup: { marginTop: 8 },
  signupText: { color: '#333', fontSize: 14 },
});
