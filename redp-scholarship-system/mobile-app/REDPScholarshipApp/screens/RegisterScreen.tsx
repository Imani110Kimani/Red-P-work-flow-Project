import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Button, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function RegisterScreen({ navigation }: any) {
  const [image, setImage] = useState<string | null>(null);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image source={require('../assets/redp-logo.png')} style={styles.logo} />
      </View>
      <Text style={styles.title}>Create Admin Account</Text>
      <Text style={styles.subtitle}>Join RED(P) Management System</Text>
      <View style={styles.row}>
        <TextInput style={[styles.input, { flex: 1, marginRight: 8 }]} placeholder="First Name" />
        <TextInput style={[styles.input, { flex: 1 }]} placeholder="Last Name" />
      </View>
      <TextInput style={styles.input} placeholder="Email Address" keyboardType="email-address" autoCapitalize="none" />
      <TouchableOpacity style={styles.upload} onPress={pickImage}>
        <Text style={styles.uploadText}>{image ? 'ID Uploaded' : 'Upload ID'}</Text>
      </TouchableOpacity>
      {image && <Image source={{ uri: image }} style={styles.imagePreview} />}
      <TextInput style={styles.input} placeholder="Create password" secureTextEntry />
      <TextInput style={styles.input} placeholder="Confirm password" secureTextEntry />
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Create Account</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.login}>
        <Text style={styles.loginText}>Already have an account? Sign in</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff7f0', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#555', marginBottom: 24 },
  row: { flexDirection: 'row', width: '100%', marginBottom: 16 },
  input: { width: '100%', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 16 },
  upload: { backgroundColor: '#eee', borderRadius: 8, padding: 12, width: '100%', alignItems: 'center', marginBottom: 8 },
  uploadText: { color: '#f60', fontWeight: '500' },
  imagePreview: { width: 100, height: 60, marginBottom: 16, borderRadius: 8 },
  button: { backgroundColor: '#f60', borderRadius: 8, paddingVertical: 14, width: '100%', alignItems: 'center', marginBottom: 16 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  login: { marginTop: 8 },
  loginText: { color: '#333', fontSize: 14 },
  logoContainer: { width: '100%', alignItems: 'center', marginBottom: 12, position: 'relative' },
  logo: { width: 80, height: 80, borderRadius: 20, marginBottom: 4, backgroundColor: 'rgba(255,122,0,0.08)', borderWidth: 1, borderColor: '#eee', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 2, elevation: 2, opacity: 0.85 },
});
