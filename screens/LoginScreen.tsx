
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Platform } from 'react-native';
// Custom cross-platform checkbox for Expo Go compatibility
function CustomCheckbox({ value, onValueChange }: { value: boolean; onValueChange: (val: boolean) => void }) {
  return (
    <TouchableOpacity
      onPress={() => onValueChange(!value)}
      style={{
        width: 18,
        height: 18,
        borderWidth: 1,
        borderColor: '#aaa',
        borderRadius: 4,
        marginRight: 6,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: value ? '#f60' : '#fff',
      }}
    >
      {value ? (
        <View style={{
          width: 10,
          height: 10,
          backgroundColor: '#fff',
          borderRadius: 2,
        }} />
      ) : null}
    </TouchableOpacity>
  );
}
import { MaterialIcons, Feather } from '@expo/vector-icons';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  return (
    <View style={styles.bg}>
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <MaterialIcons name="lock" size={40} color="#fff" />
        </View>
        <Text style={styles.title}>Admin Login</Text>
        <Text style={styles.subtitle}>Access RED(P) Management System</Text>
        <View style={styles.inputContainer}>
          <MaterialIcons name="email" size={22} color="#f60" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Email Address"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            placeholderTextColor="#aaa"
          />
        </View>
        <View style={styles.inputContainer}>
          <Feather name="lock" size={22} color="#f60" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            placeholderTextColor="#aaa"
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
            <Feather name={showPassword ? 'eye' : 'eye-off'} size={20} color="#aaa" />
          </TouchableOpacity>
        </View>
        <View style={styles.rowBetween}>
          <View style={styles.rowCenter}>
            <CustomCheckbox value={rememberMe} onValueChange={setRememberMe} />
            <Text style={styles.rememberText}>Remember me</Text>
          </View>
          <TouchableOpacity>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Confirmation')}>
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.signup}>
          <Text style={styles.signupText}>Need an account? Sign up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7f8fa',
    padding: 16,
  },
  card: {
    width: 340,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
  },
  iconCircle: {
    backgroundColor: '#f60',
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    marginTop: -48,
    shadowColor: '#f60',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#222',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    marginBottom: 18,
    backgroundColor: '#fafbfc',
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#222',
    backgroundColor: 'transparent',
  },
  eyeIcon: {
    padding: 4,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 22,
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    marginRight: 6,
    ...Platform.select({ ios: { width: 18, height: 18 }, android: {} }),
  },
  rememberText: {
    fontSize: 15,
    color: '#444',
  },
  forgotText: {
    color: '#f60',
    fontWeight: '500',
    fontSize: 15,
  },
  button: {
    backgroundColor: '#f60',
    borderRadius: 8,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 4,
    shadowColor: '#f60',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
    letterSpacing: 0.5,
  },
  signup: {
    marginTop: 8,
  },
  signupText: {
    color: '#333',
    fontSize: 15,
    textAlign: 'center',
  },
});
