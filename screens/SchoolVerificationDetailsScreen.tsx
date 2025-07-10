import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const dummySchools = [
  { name: 'Kimana Girls School', documents: 'ID, Proof of Address', status: 'Pending', date: '2025-07-01' },
  { name: 'Maasai Primary School', documents: 'ID, Registration Cert.', status: 'Under Review', date: '2025-07-02' },
  { name: 'Nairobi High', documents: 'ID, Proof of Address', status: 'Approved', date: '2025-07-03' },
];

export default function SchoolVerificationDetailsScreen() {
  // Color badge for status
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Approved': return [styles.statusBadge, styles.statusApproved];
      case 'Pending': return [styles.statusBadge, styles.statusPending];
      case 'Under Review': return [styles.statusBadge, styles.statusReview];
      default: return styles.statusBadge;
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>School Verifications</Text>
      <View style={styles.tableCard}>
        <View style={styles.listHeader}>
          <Text style={[styles.cell, styles.headerCell]}>School</Text>
          <Text style={[styles.cell, styles.headerCell]}>Documents</Text>
          <Text style={[styles.cell, styles.headerCell]}>Status</Text>
          <Text style={[styles.cell, styles.headerCell]}>Date</Text>
        </View>
        {dummySchools.map((item, idx) => (
          <View key={idx} style={[styles.listRow, idx % 2 === 0 ? styles.rowEven : styles.rowOdd]}> 
            <Text style={styles.cell}>{item.name}</Text>
            <Text style={styles.cell}>{item.documents}</Text>
            <View style={[styles.cell, {alignItems: 'flex-start'}]}>
              <Text style={getStatusStyle(item.status)}>{item.status}</Text>
            </View>
            <Text style={styles.cell}>{item.date}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 16, backgroundColor: '#f7fafd', paddingTop: 40 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 8, color: '#023c69', textAlign: 'center' },
  tableCard: { backgroundColor: '#fff', borderRadius: 14, padding: 8, shadowColor: '#2979ff', shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  listHeader: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#e3e8ee', paddingBottom: 8, marginBottom: 2 },
  listRow: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderColor: '#f1f4f8', paddingVertical: 10, borderRadius: 8, paddingHorizontal: 2 },
  rowEven: { backgroundColor: '#f7fafd' },
  rowOdd: { backgroundColor: '#fff' },
  cell: { flex: 1, fontSize: 15, color: '#222', paddingRight: 4 },
  headerCell: { fontWeight: 'bold', color: '#2979ff', fontSize: 15 },
  statusBadge: { fontWeight: 'bold', fontSize: 13, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, overflow: 'hidden', alignSelf: 'flex-start' },
  statusApproved: { backgroundColor: '#e6f6ee', color: '#00c853' },
  statusPending: { backgroundColor: '#fffbe7', color: '#ffb300' },
  statusReview: { backgroundColor: '#eaf3fb', color: '#2979ff' },
});
