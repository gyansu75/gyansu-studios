import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { supabase } from '../lib/supabase';

interface Member {
  id: string;
  full_name: string;
  created_at: string;
}

export default function AdminMembersScreen() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchMembers() {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, created_at')
      .eq('role', 'member');

    if (!error && data) {
      setMembers(data);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchMembers();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>👥 Gym Members</Text>
      {loading ? (
        <ActivityIndicator color="#FFD700" size="large" />
      ) : (
        <FlatList
          data={members}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.memberCard}>
              <View>
                <Text style={styles.memberName}>{item.full_name || 'Member'}</Text>
                <Text style={styles.joinedDate}>Joined: {new Date(item.created_at).toLocaleDateString()}</Text>
              </View>
              <Text style={styles.statusBadge}>ACTIVE</Text>
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
  memberCard: { backgroundColor: '#1A1D24', padding: 16, borderRadius: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: '#2A2E39' },
  memberName: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  joinedDate: { color: '#888', fontSize: 12, marginTop: 4 },
  statusBadge: { color: '#00E676', backgroundColor: '#052912', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, fontSize: 11, fontWeight: 'bold' },
});