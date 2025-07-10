import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';

const COLORS = {
  primary: '#023c69',
  accent: '#ff7a00',
  card: '#fff',
  text: '#222',
  subtitle: '#5a6a85',
  border: '#e3e8ee',
  pending: '#ffb300',
  approved: '#00c853',
  background: '#f7fafd',
};

export default function ApplicantListScreen({ navigation }: any) {
  const [loading, setLoading] = useState(true);
  const [applicants, setApplicants] = useState<any[]>([]);

  useEffect(() => {
    // Placeholder for API call
    setTimeout(() => {
      setApplicants([
        { id: 1, firstName: 'Jane', lastName: 'Doe', status: 'Pending' },
        { id: 2, firstName: 'Rajombol', lastName: 'Siayho', status: 'Approved' },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const renderItem = ({ item }: any) => (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.firstName} {item.lastName}</Text>
        <Text style={[styles.status, { backgroundColor: item.status === 'Approved' ? COLORS.approved : COLORS.pending }]}> 
          {item.status}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.viewBtn}
        onPress={() => navigation.navigate('ApplicantDetails', { id: item.id })}
      >
        <Text style={styles.viewBtnText}>View</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) return <ActivityIndicator style={{ flex: 1, marginTop: 40 }} color={COLORS.primary} size="large" />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Applicants</Text>
      <FlatList
        data={applicants}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 24 }}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', color: COLORS.primary, marginBottom: 16 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: 12, padding: 16, elevation: 1 },
  name: { fontSize: 16, fontWeight: 'bold', color: COLORS.text },
  status: { alignSelf: 'flex-start', marginTop: 4, color: '#fff', fontWeight: 'bold', fontSize: 12, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 2, overflow: 'hidden' },
  viewBtn: { marginLeft: 16, backgroundColor: COLORS.primary, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 18 },
  viewBtnText: { color: '#fff', fontWeight: 'bold' },
  separator: { height: 12 },
});
