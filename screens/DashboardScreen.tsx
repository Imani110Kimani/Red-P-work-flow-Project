import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';

// Centralized color palette
const COLORS = {
  primary: '#023c69',
  accent: '#ff7a00',
  background: '#f7fafd',
  card: '#fff',
  text: '#222',
  subtitle: '#5a6a85',
  stat: '#2979ff',
  success: '#00c853',
  pending: '#ffb300',
  border: '#e3e8ee',
  light: '#f1f4f8',
};

// ...existing code...

const admissionsStats = { newToday: 1, pending: 2, inProgress: 1, total: 4 };
const schoolStats = { pending: 2, underReview: 1, approved: 3, total: 2 };
const studentStats = { id: 1, grade: 0, completed: 6, total: 1 };

const recentApplications = [
  { name: 'Jane Doe', school: 'Kimana Girls School', status: 'Pending' },
  { name: 'Rajombol Siayho', school: 'Maasai Primary School', status: 'Approved' },
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
      {/* Orange header with greeting and avatar */}
      <View style={styles.headerCard}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>RED(P) Dashboard</Text>
            <Text style={styles.greeting}>Welcome back, Admin!</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.headerIcon} onPress={() => navigation.navigate('Notifications')}>
              <Text style={{fontSize:20}}>🔔</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('AdminProfile')}>
              <View style={styles.avatarCircle}><Text style={styles.avatarCircleText}>AD</Text></View>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* White card with two summary boxes */}
      <View style={styles.topSummaryCard}>
        <View style={styles.topSummaryRow}>
          <View style={[styles.topSummaryBox, { backgroundColor: '#fff' }]}> 
            <Text style={styles.topSummaryIcon}>👤</Text>
            <Text style={styles.topSummaryValue}>{admissionsStats.total}</Text>
            <Text style={styles.topSummaryLabel}>Admissions</Text>
          </View>
          <View style={[styles.topSummaryBox, { backgroundColor: '#fff' }]}> 
            <Text style={styles.topSummaryIcon}>📋</Text>
            <Text style={styles.topSummaryValue}>{schoolStats.total}</Text>
            <Text style={styles.topSummaryLabel}>School Verification</Text>
          </View>
        </View>
      </View>

      {/* 2x2 grid of improved summary cards */}
      <View style={styles.summaryGrid}>
        {/* Admissions Card */}
        <TouchableOpacity
          style={[styles.summaryGridItem, styles.cardAdmissions]}
          onPress={() => navigation.navigate('AdmissionsDetails')}
          activeOpacity={0.85}
        >
          <View style={styles.cardRow}>
            <Text style={[styles.summaryGridValue, { color: COLORS.accent }]}>{admissionsStats.total}</Text>
            <View style={styles.trendBadgePositive}><Text style={styles.trendBadgeText}>+12%</Text></View>
          </View>
          <Text style={styles.summaryGridLabel}>Admissions</Text>
          <View style={styles.miniStatsRow}>
            <Text style={styles.miniStat}>New: <Text style={styles.miniStatValue}>{admissionsStats.newToday}</Text></Text>
            <Text style={styles.miniStat}>Pending: <Text style={styles.miniStatValue}>{admissionsStats.pending}</Text></Text>
          </View>
        </TouchableOpacity>
        {/* Schools Card */}
        <TouchableOpacity
          style={[styles.summaryGridItem, styles.cardSchools]}
          onPress={() => navigation.navigate('SchoolVerificationDetails')}
          activeOpacity={0.85}
        >
          <View style={styles.cardRow}>
            <Text style={[styles.summaryGridValue, { color: COLORS.stat }]}>{schoolStats.total}</Text>
            <View style={styles.trendBadgeNegative}><Text style={styles.trendBadgeText}>-3%</Text></View>
          </View>
          <Text style={styles.summaryGridLabel}>Schools</Text>
          <View style={styles.miniStatsRow}>
            <Text style={styles.miniStat}>Pending: <Text style={styles.miniStatValue}>{schoolStats.pending}</Text></Text>
            <Text style={styles.miniStat}>Approved: <Text style={styles.miniStatValue}>{schoolStats.approved}</Text></Text>
          </View>
        </TouchableOpacity>
        {/* Students Card */}
        <TouchableOpacity
          style={[styles.summaryGridItem, styles.cardStudents]}
          onPress={() => navigation.navigate('StudentVerificationDetails')}
          activeOpacity={0.85}
        >
          <View style={styles.cardRow}>
            <Text style={[styles.summaryGridValue, { color: COLORS.success }]}>{studentStats.total}</Text>
            <View style={styles.trendBadgePositive}><Text style={styles.trendBadgeText}>+8%</Text></View>
          </View>
          <Text style={styles.summaryGridLabel}>Students</Text>
          <View style={styles.miniStatsRow}>
            <Text style={styles.miniStat}>Completed: <Text style={styles.miniStatValue}>{studentStats.completed}</Text></Text>
          </View>
        </TouchableOpacity>
        {/* Pending Card */}
        <TouchableOpacity
          style={[styles.summaryGridItem, styles.cardPending]}
          onPress={() => navigation.navigate('AdmissionsDetails')}
          activeOpacity={0.85}
        >
          <View style={styles.cardRow}>
            <Text style={[styles.summaryGridValue, { color: COLORS.pending }]}>{admissionsStats.inProgress}</Text>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: '40%' }]} />
            </View>
          </View>
          <Text style={styles.summaryGridLabel}>Pending</Text>
          <View style={styles.miniStatsRow}>
            <Text style={styles.miniStat}>In Progress: <Text style={styles.miniStatValue}>{admissionsStats.inProgress}</Text></Text>
          </View>
        </TouchableOpacity>
      </View>



      {/* Quick Actions */}
      <View style={styles.sectionCard}>
        <Text style={styles.quickTitle}>Quick Actions</Text>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: COLORS.primary }]}> 
          <Text style={styles.actionBtnText}>📝 New Admission</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtnOutline}>
          <Text style={[styles.actionBtnOutlineText, { color: COLORS.primary }]}>📋 Verify School</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtnOutline}>
          <Text style={[styles.actionBtnOutlineText, { color: COLORS.primary }]}>📢 Notify</Text>
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
            <View key={idx} style={[styles.recentRow, { backgroundColor: COLORS.light, minWidth: 220, marginRight: 10, borderColor: COLORS.border, borderWidth: 1 }]}> 
              <View style={[styles.avatar, { backgroundColor: COLORS.primary }]}><Text style={[styles.avatarText, { color: '#fff' }]}>{app.name.split(' ').map(n => n[0]).join('')}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.recentName}>{app.name}</Text>
                <Text style={styles.recentSchool}>{app.school}</Text>
              </View>
              <Text style={[styles.recentStatus, app.status === 'Pending' ? { backgroundColor: COLORS.pending, color: '#fff' } : { backgroundColor: COLORS.success, color: '#fff' }]}>{app.status}</Text>
            </View>
          ))}
        </ScrollView>
        <TouchableOpacity style={styles.detailsBtn} onPress={() => navigation.navigate('ApplicantList')}>
          <Text style={[styles.detailsBtnText, { color: COLORS.primary }]}>View All Applications</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { backgroundColor: COLORS.background },
  container: { padding: 16, paddingBottom: 32 },
  headerCard: { backgroundColor: COLORS.accent, borderRadius: 20, paddingVertical: 32, paddingHorizontal: 20, marginBottom: 0, shadowColor: COLORS.accent, shadowOpacity: 0.10, shadowRadius: 8, elevation: 6 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', letterSpacing: 1 },
  greeting: { color: '#fff', fontSize: 15, marginTop: 4, fontWeight: '500' },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  headerIcon: { marginRight: 10 },
  avatarCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginLeft: 2 },
  avatarCircleText: { color: COLORS.accent, fontWeight: 'bold', fontSize: 16 },
  topSummaryCard: { backgroundColor: '#fff', borderRadius: 16, marginHorizontal: 2, marginTop: -18, marginBottom: 18, padding: 10, shadowColor: COLORS.primary, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  topSummaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  topSummaryBox: { flex: 1, alignItems: 'center', borderRadius: 12, marginHorizontal: 4, paddingVertical: 18, elevation: 1 },
  topSummaryIcon: { fontSize: 22, marginBottom: 2, color: COLORS.accent },
  topSummaryValue: { fontSize: 18, fontWeight: 'bold', color: COLORS.primary, marginBottom: 2 },
  topSummaryLabel: { fontSize: 13, color: COLORS.subtitle, fontWeight: '600' },
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 18 },
  summaryGridItem: {
    width: '48%',
    borderRadius: 16,
    paddingVertical: 18,
    marginBottom: 12,
    elevation: 2,
    backgroundColor: '#fff',
    shadowColor: COLORS.primary,
    shadowOpacity: 0.06,
    shadowRadius: 4,
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    justifyContent: 'center',
    minHeight: 110,
    // Subtle gradient effect (simulated)
  },
  summaryGridValue: { fontSize: 26, fontWeight: 'bold', marginBottom: 2, marginRight: 8 },
  summaryGridLabel: { fontSize: 14, color: COLORS.subtitle, fontWeight: '700', marginBottom: 6 },
  cardRow: { flexDirection: 'row', alignItems: 'center', width: '100%', marginBottom: 2, justifyContent: 'space-between' },
  miniStatsRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  miniStat: { fontSize: 12, color: COLORS.subtitle, marginRight: 10 },
  miniStatValue: { fontWeight: 'bold', color: COLORS.text },
  trendBadgePositive: { backgroundColor: '#e6f6ee', borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2, marginLeft: 4 },
  trendBadgeNegative: { backgroundColor: '#ffeaea', borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2, marginLeft: 4 },
  trendBadgeText: { fontSize: 11, fontWeight: 'bold', color: COLORS.success },
  progressBarBg: { height: 8, width: 40, backgroundColor: '#ffe6a1', borderRadius: 4, marginLeft: 4, overflow: 'hidden' },
  progressBarFill: { height: 8, backgroundColor: COLORS.pending, borderRadius: 4 },
  cardAdmissions: { backgroundColor: '#fff7f0' },
  cardSchools: { backgroundColor: '#eaf3fb' },
  cardStudents: { backgroundColor: '#e6f6ee' },
  cardPending: { backgroundColor: '#fffbe7' },
  sectionCard: { backgroundColor: COLORS.card, borderRadius: 18, padding: 18, marginBottom: 18, shadowColor: COLORS.primary, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 },
  sectionTitle: { fontSize: 17, fontWeight: 'bold', marginBottom: 2, color: COLORS.text },
  sectionCount: { color: COLORS.primary, fontWeight: 'bold' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  statBox: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 16, fontWeight: 'bold', color: COLORS.primary },
  statLabel: { fontSize: 12, color: COLORS.subtitle },
  detailsBtn: { alignSelf: 'flex-start', marginTop: 4 },
  detailsBtnText: { color: COLORS.primary, fontWeight: 'bold' },
  quickTitle: { fontSize: 15, fontWeight: 'bold', marginBottom: 10, color: COLORS.text },
  actionBtn: { borderRadius: 8, paddingVertical: 12, alignItems: 'center', marginBottom: 10 },
  actionBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  actionBtnOutline: { borderWidth: 1, borderColor: COLORS.primary, borderRadius: 8, paddingVertical: 12, alignItems: 'center', marginBottom: 10, backgroundColor: COLORS.card },
  actionBtnOutlineText: { fontWeight: 'bold', fontSize: 15 },
  recentRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 8, padding: 10, marginBottom: 8 },
  avatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  avatarText: { fontWeight: 'bold', fontSize: 16 },
  recentName: { fontWeight: 'bold', color: COLORS.text },
  recentSchool: { fontSize: 12, color: COLORS.subtitle },
  recentStatus: { fontWeight: 'bold', fontSize: 13, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
});
