import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const dummyStudents = [
  { name: 'Jane Doe', idStatus: 'Verified', gradeStatus: 'Pending', completed: 'No', date: '2025-07-01' },
  { name: 'Rajombol Siayho', idStatus: 'Pending', gradeStatus: 'Verified', completed: 'Yes', date: '2025-07-02' },
  { name: 'Amina Njeri', idStatus: 'Verified', gradeStatus: 'Verified', completed: 'Yes', date: '2025-07-03' },
];

export default function StudentVerificationDetailsScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Student Verification Details</Text>
      <Text style={styles.info}>Below is a sample list of student verifications:</Text>
      <View style={styles.listHeader}>
        <Text style={[styles.cell, styles.headerCell]}>Name</Text>
        <Text style={[styles.cell, styles.headerCell]}>ID Status</Text>
        <Text style={[styles.cell, styles.headerCell]}>Grade Status</Text>
        <Text style={[styles.cell, styles.headerCell]}>Completed</Text>
        <Text style={[styles.cell, styles.headerCell]}>Date</Text>
      </View>
      {dummyStudents.map((item, idx) => (
        <View key={idx} style={styles.listRow}>
          <Text style={styles.cell}>{item.name}</Text>
          <Text style={styles.cell}>{item.idStatus}</Text>
          <Text style={styles.cell}>{item.gradeStatus}</Text>
          <Text style={styles.cell}>{item.completed}</Text>
          <Text style={styles.cell}>{item.date}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  info: { fontSize: 16, color: '#555', marginBottom: 16 },
  listHeader: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#eee', paddingBottom: 6, marginBottom: 6 },
  listRow: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#f6f6f6', paddingVertical: 6 },
  cell: { flex: 1, fontSize: 15, color: '#333' },
  headerCell: { fontWeight: 'bold', color: '#00c853' },
});
