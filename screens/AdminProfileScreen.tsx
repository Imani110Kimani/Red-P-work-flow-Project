import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function AdminProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Profile</Text>
      <View style={styles.avatar}><Text style={styles.avatarText}>AD</Text></View>
      <Text style={styles.info}>Name: Admin</Text>
      <Text style={styles.info}>Email: admin@redp.com</Text>
      {/* Add more admin info here */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f7fafd' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 24, color: '#023c69' },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#ff7a00', alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 32 },
  info: { fontSize: 16, color: '#222', marginBottom: 8 },
});
