import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { supabase } from '../lib/supabase';

export default function ProfileScreen() {
  const [email, setEmail] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) setEmail(user.email);
    });
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>👤 Member Profile</Text>
      <View style={styles.profileCard}>
        <Text style={styles.label}>Email Address</Text>
        <Text style={styles.value}>{email}</Text>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={() => supabase.auth.signOut()}>
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0C10', padding: 20, paddingTop: 60 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#FFD700', marginBottom: 20 },
  profileCard: { backgroundColor: '#1A1D24', padding: 20, borderRadius: 12, marginBottom: 30 },
  label: { color: '#888', fontSize: 12 },
  value: { color: '#FFF', fontSize: 16, fontWeight: 'bold', marginTop: 4 },
  logoutBtn: { backgroundColor: '#FF3B30', padding: 16, borderRadius: 10, alignItems: 'center' },
  logoutText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});