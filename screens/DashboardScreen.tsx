import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';

const summaryData = [
  { label: 'Admissions', value: 4, color: '#ff7a00', icon: '👤', nav: 'Admissions' },
  { label: 'School Verification', value: 2, color: '#2979ff', icon: '📋', nav: 'SchoolVerification' },
  { label: 'Student Verification', value: 1, color: '#00c853', icon: '✔️', nav: 'StudentVerification' },
  { label: 'Pending Setup', value: 1, color: '#ffd600', icon: '⏰', nav: 'PendingSetup' },
];

const admissionsStats = { newToday: 1, pending: 2, inProgress: 1, total: 4 };
const schoolStats = { pending: 2, underReview: 1, approved: 3, total: 2 };
const studentStats = { id: 1, grade: 0, completed: 6, total: 1 };

const recentApplications = [
  { name: 'Jane Doe', school: 'Kimana Girls School', status: 'Pending', color: '#ffe0b2' },
  { name: 'Rajombol Siayho', school: 'Maasai Primary School', status: 'Approved', color: '#c8e6c9' },
];

export default function DashboardScreen({ navigation }: any) {
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000); // Simulate refresh
  };

  // Auto-scroll logic for Recent Applications
  const scrollRef = useRef<ScrollView>(null);
  const [scrollX, setScrollX] = useState(0);
  const [scrollDirection, setScrollDirection] = useState(1); // 1 = right, -1 = left
  const maxScroll = 220 * (recentApplications.length - 1); // 220 is minWidth + marginRight

  useEffect(() => {
    const interval = setInterval(() => {
      setScrollX((prev) => {
        let next = prev + 2 * scrollDirection;
        if (next >= maxScroll) {
          setScrollDirection(-1);
          next = maxScroll;
        } else if (next <= 0) {
          setScrollDirection(1);
          next = 0;
        }
        scrollRef.current?.scrollTo({ x: next, animated: true });
        return next;
      });
    }, 30);
    return () => clearInterval(interval);
  }, [scrollDirection, maxScroll]);

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View style={styles.headerCard}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>RED(P)</Text>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.headerIcon}><Text style={{fontSize:20}}>🔔</Text></TouchableOpacity>
            <TouchableOpacity style={styles.headerIcon}><Text style={{fontSize:20}}>👤</Text></TouchableOpacity>
          </View>
        </View>
        <Text style={styles.greeting}>Hello, Admin!</Text>
        <Text style={styles.headerSubtitle}>Management</Text>
        <View style={styles.summaryBoxRow}>
          <TouchableOpacity
            style={[styles.summaryBox, { backgroundColor: '#ff7a00' }]}
            onPress={() => navigation.navigate('AdmissionsDetails')}
            activeOpacity={0.8}
          >
            <Text style={styles.summaryBoxIcon}>👤</Text>
            <Text style={styles.summaryBoxValue}>{admissionsStats.total}</Text>
            <Text style={styles.summaryBoxLabel}>Admissions</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.summaryBox, { backgroundColor: '#2979ff' }]}
            onPress={() => navigation.navigate('SchoolVerificationDetails')}
            activeOpacity={0.8}
          >
            <Text style={styles.summaryBoxIcon}>📋</Text>
            <Text style={styles.summaryBoxValue}>{schoolStats.total}</Text>
            <Text style={styles.summaryBoxLabel}>School Verification</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.summaryBox, { backgroundColor: '#00c853' }]}
            onPress={() => navigation.navigate('StudentVerificationDetails')}
            activeOpacity={0.8}
          >
            <Text style={styles.summaryBoxIcon}>✔️</Text>
            <Text style={styles.summaryBoxValue}>{studentStats.total}</Text>
            <Text style={styles.summaryBoxLabel}>Student Verification</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Admissions Card */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Admissions <Text style={styles.sectionCount}>{admissionsStats.total}</Text></Text>
        <Text style={styles.sectionSubtitle}>Total applications received <Text style={styles.sectionTrend}>+2 this week</Text></Text>
        <View style={styles.statsRow}>
          <View style={styles.statBox}><Text style={styles.statValue}>{admissionsStats.newToday}</Text><Text style={styles.statLabel}>New today</Text></View>
          <View style={styles.statBox}><Text style={styles.statValue}>{admissionsStats.pending}</Text><Text style={styles.statLabel}>Pending review</Text></View>
          <View style={styles.statBox}><Text style={styles.statValue}>{admissionsStats.inProgress}</Text><Text style={styles.statLabel}>In progress</Text></View>
        </View>
        <TouchableOpacity style={styles.detailsBtn} onPress={() => navigation.navigate('AdmissionsDetails')}>
          <Text style={styles.detailsBtnText}>View Details →</Text>
        </TouchableOpacity>
      </View>

      {/* School Verification Card */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>School Verification <Text style={styles.sectionCount}>{schoolStats.total}</Text></Text>
        <Text style={styles.sectionSubtitle}>Schools awaiting verification <Text style={styles.sectionTrend}>1 completed today</Text></Text>
        <View style={styles.statsRow}>
          <View style={styles.statBox}><Text style={styles.statValue}>{schoolStats.pending}</Text><Text style={styles.statLabel}>Documents pending</Text></View>
          <View style={styles.statBox}><Text style={styles.statValue}>{schoolStats.underReview}</Text><Text style={styles.statLabel}>Under review</Text></View>
          <View style={styles.statBox}><Text style={styles.statValue}>{schoolStats.approved}</Text><Text style={styles.statLabel}>Approved this week</Text></View>
        </View>
        <TouchableOpacity style={styles.detailsBtn} onPress={() => navigation.navigate('SchoolVerificationDetails')}>
          <Text style={styles.detailsBtnText}>View Details →</Text>
        </TouchableOpacity>
      </View>

      {/* Student Verification Card */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Student Verification <Text style={styles.sectionCount}>{studentStats.total}</Text></Text>
        <Text style={styles.sectionSubtitle}>Students awaiting verification <Text style={styles.sectionTrend}>2 verified today</Text></Text>
        <View style={styles.statsRow}>
          <View style={styles.statBox}><Text style={styles.statValue}>{studentStats.id}</Text><Text style={styles.statLabel}>ID verification</Text></View>
          <View style={styles.statBox}><Text style={styles.statValue}>{studentStats.grade}</Text><Text style={styles.statLabel}>Grade verification</Text></View>
          <View style={styles.statBox}><Text style={styles.statValue}>{studentStats.completed}</Text><Text style={styles.statLabel}>Completed</Text></View>
        </View>
        <TouchableOpacity style={styles.detailsBtn} onPress={() => navigation.navigate('StudentVerificationDetails')}>
          <Text style={styles.detailsBtnText}>View Details →</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      <View style={styles.sectionCard}>
        <Text style={styles.quickTitle}>Quick Actions</Text>
        <TouchableOpacity style={styles.actionBtn}>
          <Text style={styles.actionBtnText}>📝 Process New Admissions</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtnOutline}>
          <Text style={styles.actionBtnOutlineText}>📋 Verify School Details</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtnOutline}>
          <Text style={styles.actionBtnOutlineText}>📢 Send Notifications</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Applications */}
      <View style={styles.sectionCard}>
        <Text style={styles.quickTitle}>Recent Applications</Text>
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{marginBottom: 8}}
        >
          {recentApplications.map((app, idx) => (
            <View key={idx} style={[styles.recentRow, { backgroundColor: app.color, minWidth: 220, marginRight: 10 }]}> 
              <View style={styles.avatar}><Text style={styles.avatarText}>{app.name.split(' ').map(n => n[0]).join('')}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.recentName}>{app.name}</Text>
                <Text style={styles.recentSchool}>{app.school}</Text>
              </View>
              <Text style={[styles.recentStatus, app.status === 'Pending' ? styles.statusPending : styles.statusApproved]}>{app.status}</Text>
            </View>
          ))}
        </ScrollView>
        <TouchableOpacity style={styles.detailsBtn}><Text style={[styles.detailsBtnText, { color: '#ff7a00' }]}>View All Applications</Text></TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { backgroundColor: '#f6f6f6' },
  container: { padding: 16, paddingBottom: 32 },
  headerCard: { backgroundColor: '#ff7a00', borderRadius: 20, padding: 20, marginBottom: 20, shadowColor: '#ff7a00', shadowOpacity: 0.15, shadowRadius: 8, elevation: 6 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  headerIcons: { flexDirection: 'row' },
  headerIcon: { marginLeft: 12 },
  greeting: { color: '#fff', fontSize: 16, marginTop: 8, marginBottom: 2, fontWeight: 'bold' },
  headerSubtitle: { color: '#fff', fontSize: 16, marginBottom: 16 },
  summaryBoxRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  summaryBox: { flex: 1, marginHorizontal: 4, borderRadius: 10, alignItems: 'center', paddingVertical: 14, paddingHorizontal: 6, elevation: 3 },
  summaryBoxIcon: { fontSize: 22, marginBottom: 2, color: '#fff' },
  summaryBoxValue: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 2 },
  summaryBoxLabel: { fontSize: 12, color: '#fff' },
  sectionCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 18, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 2 },
  sectionCount: { color: '#ff7a00', fontWeight: 'bold' },
  sectionSubtitle: { fontSize: 13, color: '#555', marginBottom: 10 },
  sectionTrend: { color: '#00c853', fontWeight: 'bold' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  statBox: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  statLabel: { fontSize: 12, color: '#888' },
  detailsBtn: { alignSelf: 'flex-start', marginTop: 4 },
  detailsBtnText: { color: '#2979ff', fontWeight: 'bold' },
  quickTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  actionBtn: { backgroundColor: '#ff7a00', borderRadius: 8, paddingVertical: 12, alignItems: 'center', marginBottom: 10 },
  actionBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  actionBtnOutline: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingVertical: 12, alignItems: 'center', marginBottom: 10 },
  actionBtnOutlineText: { color: '#333', fontWeight: 'bold', fontSize: 15 },
  recentRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 8, padding: 10, marginBottom: 8 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginRight: 10, borderWidth: 1, borderColor: '#eee' },
  avatarText: { fontWeight: 'bold', color: '#ff7a00' },
  recentName: { fontWeight: 'bold', color: '#333' },
  recentSchool: { fontSize: 12, color: '#888' },
  recentStatus: { fontWeight: 'bold', fontSize: 13, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusPending: { backgroundColor: '#fffde7', color: '#ff7a00' },
  statusApproved: { backgroundColor: '#e8f5e9', color: '#00c853' },
});
