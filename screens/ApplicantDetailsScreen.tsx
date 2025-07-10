import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';

const COLORS = {
  primary: '#023c69',
  accent: '#ff7a00',
  card: '#fff',
  text: '#222',
  subtitle: '#5a6a85',
  border: '#e3e8ee',
  background: '#f7fafd',
};

export default function ApplicantDetailsScreen({ route, navigation }: any) {
  const { id } = route.params;
  const [loading, setLoading] = useState(true);
  const [applicant, setApplicant] = useState<any>(null);

  useEffect(() => {
    // Placeholder for API call
    setTimeout(() => {
      setApplicant({
        id,
        firstName: 'Jane',
        lastName: 'Doe',
        status: 'Pending',
        address: '123 Main St',
        age: 17,
        school: 'Kimana Girls School',
        documents: [
          { name: 'KCPE Certificate', url: '#' },
          { name: 'Result Slip', url: '#' },
          { name: 'Essay', url: '#' },
        ],
      });
      setLoading(false);
    }, 1000);
  }, [id]);

  if (loading) return <ActivityIndicator style={{ flex: 1, marginTop: 40 }} color={COLORS.primary} size="large" />;

  if (!applicant) return <Text style={{ color: COLORS.text, margin: 24 }}>Applicant not found.</Text>;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Text style={styles.backBtnText}>{'<'} Back</Text>
      </TouchableOpacity>
      <Text style={styles.title}>{applicant.firstName} {applicant.lastName}</Text>
      <Text style={styles.status}>{applicant.status}</Text>
      <Text style={styles.label}>Address:</Text>
      <Text style={styles.value}>{applicant.address}</Text>
      <Text style={styles.label}>Age:</Text>
      <Text style={styles.value}>{applicant.age}</Text>
      <Text style={styles.label}>School:</Text>
      <Text style={styles.value}>{applicant.school}</Text>
      <Text style={styles.label}>Documents:</Text>
      {applicant.documents.map((doc: any, idx: number) => (
        <TouchableOpacity key={idx} style={styles.docBtn}>
          <Text style={styles.docBtnText}>{doc.name}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 20 },
  backBtn: { marginBottom: 12 },
  backBtnText: { color: COLORS.primary, fontWeight: 'bold', fontSize: 15 },
  title: { fontSize: 22, fontWeight: 'bold', color: COLORS.primary, marginBottom: 6 },
  status: { color: COLORS.accent, fontWeight: 'bold', marginBottom: 12 },
  label: { color: COLORS.subtitle, fontWeight: 'bold', marginTop: 10 },
  value: { color: COLORS.text, fontSize: 15, marginBottom: 2 },
  docBtn: { marginTop: 8, backgroundColor: COLORS.card, borderRadius: 8, padding: 12, borderWidth: 1, borderColor: COLORS.border },
  docBtnText: { color: COLORS.primary, fontWeight: 'bold' },
});
