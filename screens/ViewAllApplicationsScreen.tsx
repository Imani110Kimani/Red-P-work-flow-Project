import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const allApplications = [
  { name: 'Jane Doe', school: 'Kimana Girls School', status: 'Pending', date: '2025-07-01' },
  { name: 'Rajombol Siayho', school: 'Maasai Primary School', status: 'Approved', date: '2025-07-02' },
  { name: 'Amina Njeri', school: 'Nairobi High', status: 'In Progress', date: '2025-07-03' },
  { name: 'Samuel Kip', school: 'Eldoret School', status: 'Pending', date: '2025-07-04' },
  { name: 'Mary Wambui', school: 'Kisumu Academy', status: 'Approved', date: '2025-07-05' },
];

export default function ViewAllApplicationsScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>All Applications</Text>
      <View style={styles.listHeader}>
        <Text style={[styles.cell, styles.headerCell]}>Name</Text>
        <Text style={[styles.cell, styles.headerCell]}>School</Text>
        <Text style={[styles.cell, styles.headerCell]}>Status</Text>
        <Text style={[styles.cell, styles.headerCell]}>Date</Text>
      </View>
      {allApplications.map((item, idx) => (
        <View key={idx} style={styles.listRow}>
          <Text style={styles.cell}>{item.name}</Text>
          <Text style={styles.cell}>{item.school}</Text>
          <Text style={styles.cell}>{item.status}</Text>
          <Text style={styles.cell}>{item.date}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  listHeader: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#eee', paddingBottom: 6, marginBottom: 6 },
  listRow: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#f6f6f6', paddingVertical: 6 },
  cell: { flex: 1, fontSize: 15, color: '#333' },
  headerCell: { fontWeight: 'bold', color: '#ff7a00' },
});
