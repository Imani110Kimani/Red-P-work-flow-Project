import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function NotificationsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notifications</Text>
      <Text style={styles.info}>No new notifications.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f7fafd' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 24, color: '#023c69' },
  info: { fontSize: 16, color: '#222', marginBottom: 8 },
});
