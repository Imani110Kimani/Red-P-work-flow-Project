import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

export default function LandingScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <Image source={require('../assets/redp-logo.png')} style={styles.logo} />
      <Text style={styles.title}>Welcome to RED(P) Management</Text>
      <Text style={styles.subtitle}>Empowering education through efficient scholarship and verification workflows.</Text>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.buttonText}>Admin Login</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('Register')}>
        <Text style={styles.secondaryButtonText}>Create Admin Account</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff7f0', // light orange background for better logo visibility
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 32,
    borderRadius: 20,
    backgroundColor: 'rgba(255,122,0,0.08)', // subtle orange tint for watermark effect
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
    opacity: 0.85, // slightly faded for watermark effect
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ff7a00',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 32,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#ff7a00',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 40,
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#ff7a00',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 40,
    alignItems: 'center',
    width: '100%',
  },
  secondaryButtonText: {
    color: '#ff7a00',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
