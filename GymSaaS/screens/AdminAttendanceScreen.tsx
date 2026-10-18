import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { supabase } from '../lib/supabase';
import { QrCode, UserCheck } from 'lucide-react-native';

interface AttendanceRecord {
  id: string;
  check_in_time: string;
  profiles: {
    full_name: string;
    email: string;
  } | null;
}

export default function AdminAttendanceScreen() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function fetchAttendanceLogs() {
   setLoading(true);
  
  // Left join query with profiles table
  const { data, error } = await supabase
    .from('gym_attendance')
    .select(`
      id,
      check_in_time,
      user_id,
      profiles (
        full_name
      )
    `)
    .order('check_in_time', { ascending: false });

  if (error) {
    console.log('Attendance Fetch Error:', error.message);
  } else if (data) {
    setRecords(data as unknown as AttendanceRecord[]);
  }
  
  setLoading(false);
  setRefreshing(false);
  }

  useEffect(() => {
    fetchAttendanceLogs();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📌 Attendance Desk</Text>

      {/* SECTION 1: ADMIN CHECK-IN QR CODE */}
      <View style={styles.qrCard}>
        <View style={styles.qrHeader}>
          <QrCode color="#FFD700" size={20} />
          <Text style={styles.qrTitle}>Member Scan & Check-In</Text>
        </View>
        <Text style={styles.qrSub}>Display this at the reception front desk.</Text>

        <View style={styles.qrContainer}>
          <QRCode
            value="GYMSAAS_CHECKIN"
            size={160}
            color="#000000"
            backgroundColor="#FFFFFF"
          />
        </View>
      </View>

      {/* SECTION 2: LIVE ATTENDANCE TRACKING LOGS */}
      <View style={styles.logHeaderRow}>
        <UserCheck color="#00E676" size={20} />
        <Text style={styles.sectionTitle}>Recent Check-Ins</Text>
      </View>

      {loading ? (
        <ActivityIndicator color="#FFD700" size="large" style={{ marginTop: 20 }} />
      ) : records.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>No check-ins recorded yet today.</Text>
        </View>
      ) : (
        <FlatList
          data={records}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); fetchAttendanceLogs(); }}
              tintColor="#FFD700"
            />
          }
          renderItem={({ item }) => (
            <View style={styles.logCard}>
              <View>
                <Text style={styles.memberName}>
                  {item.profiles?.full_name || 'Gym Member'}
                </Text>
                <Text style={styles.timeText}>
                  {new Date(item.check_in_time).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
              <Text style={styles.dateBadge}>
                {new Date(item.check_in_time).toLocaleDateString()}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0C10', padding: 20, paddingTop: 60 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#FFD700', marginBottom: 16 },
  qrCard: {
    backgroundColor: '#1A1D24',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2A2E39',
    alignItems: 'center',
    marginBottom: 24,
  },
  qrHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qrTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  qrSub: { color: '#888', fontSize: 12, marginTop: 4, marginBottom: 16 },
  qrContainer: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
  },
  logHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  emptyBox: { backgroundColor: '#1A1D24', padding: 20, borderRadius: 12, alignItems: 'center' },
  emptyText: { color: '#888', fontSize: 14 },
  logCard: {
    backgroundColor: '#1A1D24',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#2A2E39',
  },
  memberName: { color: '#FFF', fontSize: 15, fontWeight: 'bold' },
  timeText: { color: '#888', fontSize: 12, marginTop: 2 },
  dateBadge: {
    color: '#00E676',
    backgroundColor: '#052912',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    fontSize: 11,
    fontWeight: 'bold',
  },
});