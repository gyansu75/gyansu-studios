import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { supabase } from '../lib/supabase';

interface WorkoutLog {
  id: string;
  exercise_name: string;
  sets: number;
  reps: number;
  weight_kg: number;
  logged_at: string;
}

export default function HomeScreen() {
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalWorkouts, setTotalWorkouts] = useState(0);

  async function fetchDashboardData() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      // Fetch workout history from Supabase
      const { data, error, count } = await supabase
        .from('workout_logs')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .order('logged_at', { ascending: false });

      if (!error && data) {
        setLogs(data);
        setTotalWorkouts(count || data.length);
      }
    }
    setLoading(false);
    setRefreshing(false);
  }

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏠 Gym Dashboard</Text>

      {/* Stats Cards Row */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statNum}>{totalWorkouts}</Text>
          <Text style={styles.statLabel}>Total Sets Logged</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNum}>Active</Text>
          <Text style={styles.statLabel}>Membership</Text>
        </View>
      </View>

      <Text style={styles.sectionHeader}>Recent Activity</Text>

      {loading ? (
        <ActivityIndicator color="#FFD700" size="large" style={{ marginTop: 20 }} />
      ) : logs.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>No workout logs yet!</Text>
          <Text style={styles.emptySubText}>Go to the "Workout" tab to log your first set.</Text>
        </View>
      ) : (
        <FlatList
          data={logs}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchDashboardData(); }} tintColor="#FFD700" />
          }
          renderItem={({ item }) => (
            <View style={styles.logCard}>
              <View>
                <Text style={styles.exerciseName}>{item.exercise_name}</Text>
                <Text style={styles.logDetails}>
                  {item.sets} Sets × {item.reps} Reps
                </Text>
              </View>
              <Text style={styles.weightTag}>{item.weight_kg} kg</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0C10', padding: 20, paddingTop: 60 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#FFD700', marginBottom: 20 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  statBox: { width: '48%', backgroundColor: '#1A1D24', padding: 18, borderRadius: 12, borderWidth: 1, borderColor: '#2A2E39' },
  statNum: { color: '#FFD700', fontSize: 22, fontWeight: 'bold' },
  statLabel: { color: '#888', fontSize: 12, marginTop: 4 },
  sectionHeader: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  emptyBox: { backgroundColor: '#1A1D24', padding: 24, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  emptyText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  emptySubText: { color: '#777', fontSize: 12, marginTop: 6, textAlign: 'center' },
  logCard: {
    backgroundColor: '#1A1D24',
    padding: 16,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#2A2E39',
  },
  exerciseName: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  logDetails: { color: '#888', fontSize: 13, marginTop: 2 },
  weightTag: { color: '#FFD700', fontSize: 16, fontWeight: 'bold', backgroundColor: '#262105', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
});