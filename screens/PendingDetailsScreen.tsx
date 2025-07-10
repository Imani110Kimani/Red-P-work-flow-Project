import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const PendingDetailsScreen = () => {
  // Placeholder data
  const pendings = [
    { id: 1, name: 'Jane Doe', type: 'Admission', status: 'In Progress', date: '2025-07-09' },
    { id: 2, name: 'Maasai Primary School', type: 'School', status: 'Pending', date: '2025-07-08' },
    { id: 3, name: 'Brian Lee', type: 'Student', status: 'In Progress', date: '2025-07-07' },
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Pending</Text>
      {pendings.map((item) => (
        <View key={item.id} style={styles.card}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.type}>{item.type}</Text>
          <Text style={styles.status}>{item.status}</Text>
          <Text style={styles.date}>{item.date}</Text>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7fafd', padding: 16, paddingTop: 40 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 8, color: '#ffb300', textAlign: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: '#ffb300', shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  name: { fontWeight: 'bold', fontSize: 16, color: '#222' },
  type: { fontSize: 13, color: '#2979ff', marginTop: 2 },
  status: { fontSize: 13, color: '#5a6a85', marginTop: 2 },
  date: { fontSize: 12, color: '#5a6a85', marginTop: 2 },
});

export default PendingDetailsScreen;
