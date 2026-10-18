import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { supabase } from '../lib/supabase';
import { Users, UserCheck, TrendingUp, AlertTriangle, LogOut } from 'lucide-react-native';

export default function AdminDashboardScreen() {
  const [totalMembers, setTotalMembers] = useState(0);
  const [todayCheckins, setTodayCheckins] = useState(0);
  const [atRiskMembers, setAtRiskMembers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function fetchAdminMetrics() {
    setLoading(true);

    // Fetch total members count
    const { count: memberCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'member');

    // Fetch total workout logs created today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const { count: checkinCount } = await supabase
      .from('workout_logs')
      .select('*', { count: 'exact', head: true })
      .gte('logged_at', startOfDay.toISOString());

    setTotalMembers(memberCount || 0);
    setTodayCheckins(checkinCount || 0);
    setAtRiskMembers(Math.max(0, (memberCount || 0) - (checkinCount || 0)));

    setLoading(false);
    setRefreshing(false);
  }

  useEffect(() => {
    fetchAdminMetrics();
  }, []);

  return (
    <ScrollView 
      style={styles.container} 
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchAdminMetrics(); }} tintColor="#FFD700" />}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.badge}>GYM OWNER PORTAL</Text>
          <Text style={styles.title}>Admin Control</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={() => supabase.auth.signOut()}>
          <LogOut color="#FF3B30" size={20} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color="#FFD700" size="large" style={{ marginTop: 40 }} />
      ) : (
        <>
          {/* Key Metrics Grid */}
          <View style={styles.grid}>
            <View style={styles.card}>
              <Users color="#FFD700" size={24} />
              <Text style={styles.metricValue}>{totalMembers}</Text>
              <Text style={styles.metricLabel}>Total Members</Text>
            </View>

            <View style={styles.card}>
              <UserCheck color="#00E676" size={24} />
              <Text style={styles.metricValue}>{todayCheckins}</Text>
              <Text style={styles.metricLabel}>Today's Activity</Text>
            </View>

            <View style={styles.card}>
              <TrendingUp color="#29B6F6" size={24} />
              <Text style={styles.metricValue}>₹45,000</Text>
              <Text style={styles.metricLabel}>Est. Revenue</Text>
            </View>

            <View style={styles.card}>
              <AlertTriangle color="#FF3B30" size={24} />
              <Text style={styles.metricValue}>{atRiskMembers}</Text>
              <Text style={styles.metricLabel}>Inactive Members</Text>
            </View>
          </View>

          {/* Rapid Action Banner */}
          <View style={styles.actionBanner}>
            <Text style={styles.bannerTitle}>Retention Radar Alert</Text>
            <Text style={styles.bannerSub}>
              {atRiskMembers} members haven't logged workouts recently. Send a WhatsApp nudge to drive retention.
            </Text>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0C10', padding: 20, paddingTop: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  badge: { color: '#FFD700', fontSize: 11, fontWeight: 'bold', letterSpacing: 1 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#FFF' },
  logoutBtn: { backgroundColor: '#1A1D24', padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#2A2E39' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { width: '48%', backgroundColor: '#1A1D24', padding: 18, borderRadius: 14, marginBottom: 16, borderWidth: 1, borderColor: '#2A2E39' },
  metricValue: { color: '#FFF', fontSize: 24, fontWeight: 'bold', marginTop: 10 },
  metricLabel: { color: '#888', fontSize: 12, marginTop: 4 },
  actionBanner: { backgroundColor: '#1E1908', padding: 18, borderRadius: 14, borderWidth: 1, borderColor: '#FFD700', marginTop: 10 },
  bannerTitle: { color: '#FFD700', fontWeight: 'bold', fontSize: 16 },
  bannerSub: { color: '#CCC', fontSize: 13, marginTop: 6, lineHeight: 18 },
});