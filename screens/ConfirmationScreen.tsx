import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Image } from 'react-native';

type ConfirmationScreenProps = {
  navigation: any;
};

const ConfirmationScreen: React.FC<ConfirmationScreenProps> = ({ navigation }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    // Replace '123456' with your actual logic or backend verification
    if (code === '123456') {
      setError('');
      navigation.navigate('Dashboard');
    } else {
      setError('Invalid code. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <View style={styles.logoContainer}>
          <Image source={require('../assets/redp-logo.png')} style={styles.logo} />
        </View>
        <Text style={styles.title}>Enter Confirmation Code</Text>
        <Text style={styles.subtitle}>A code has been sent to your email. Please enter it below to continue.</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter code"
          value={code}
          onChangeText={setCode}
          keyboardType="number-pad"
          maxLength={6}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <TouchableOpacity style={styles.button} onPress={handleConfirm}>
          <Text style={styles.buttonText}>Confirm</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff7f0', // light orange background for better logo visibility
  },
  card: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    alignItems: 'center',
  },
  logoContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    marginBottom: 4,
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
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#222',
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 18,
    marginBottom: 12,
    backgroundColor: '#fafbfc',
    textAlign: 'center',
    letterSpacing: 4,
  },
  button: {
    backgroundColor: '#007bff',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 32,
    marginTop: 8,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    marginBottom: 8,
    fontSize: 15,
  },
});

export default ConfirmationScreen;
