import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const dummySchools = [
  { name: 'Kimana Girls School', documents: 'ID, Proof of Address', status: 'Pending', date: '2025-07-01' },
  { name: 'Maasai Primary School', documents: 'ID, Registration Cert.', status: 'Under Review', date: '2025-07-02' },
  { name: 'Nairobi High', documents: 'ID, Proof of Address', status: 'Approved', date: '2025-07-03' },
];

export default function SchoolVerificationDetailsScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>School Verification Details</Text>
      <Text style={styles.info}>Below is a sample list of school verifications:</Text>
      <View style={styles.listHeader}>
        <Text style={[styles.cell, styles.headerCell]}>School</Text>
        <Text style={[styles.cell, styles.headerCell]}>Documents</Text>
        <Text style={[styles.cell, styles.headerCell]}>Status</Text>
        <Text style={[styles.cell, styles.headerCell]}>Date</Text>
      </View>
      {dummySchools.map((item, idx) => (
        <View key={idx} style={styles.listRow}>
          <Text style={styles.cell}>{item.name}</Text>
          <Text style={styles.cell}>{item.documents}</Text>
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
  info: { fontSize: 16, color: '#555', marginBottom: 16 },
  listHeader: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#eee', paddingBottom: 6, marginBottom: 6 },
  listRow: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#f6f6f6', paddingVertical: 6 },
  cell: { flex: 1, fontSize: 15, color: '#333' },
  headerCell: { fontWeight: 'bold', color: '#2979ff' },
});
