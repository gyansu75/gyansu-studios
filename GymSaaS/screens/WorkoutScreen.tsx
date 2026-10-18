import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { supabase } from '../lib/supabase';

export default function WorkoutScreen() {
  const [exercise, setExercise] = useState('');
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSaveLog() {
    if (!exercise || !sets || !reps || !weight) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { error } = await supabase.from('workout_logs').insert([
        {
          user_id: user.id,
          exercise_name: exercise,
          sets: parseInt(sets),
          reps: parseInt(reps),
          weight_kg: parseFloat(weight),
        },
      ]);

      if (error) {
        Alert.alert('Save Error', error.message);
      } else {
        Alert.alert('Success', 'Workout set logged successfully!');
        setExercise('');
        setSets('');
        setReps('');
        setWeight('');
      }
    }
    setLoading(false);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏋️ Log Exercise</Text>
      <TextInput style={styles.input} placeholder="Exercise (e.g. Bench Press)" placeholderTextColor="#777" value={exercise} onChangeText={setExercise} />
      <View style={styles.row}>
        <TextInput style={[styles.input, styles.half]} placeholder="Sets" keyboardType="numeric" placeholderTextColor="#777" value={sets} onChangeText={setSets} />
        <TextInput style={[styles.input, styles.half]} placeholder="Reps" keyboardType="numeric" placeholderTextColor="#777" value={reps} onChangeText={setReps} />
      </View>
      <TextInput style={styles.input} placeholder="Weight (kg)" keyboardType="numeric" placeholderTextColor="#777" value={weight} onChangeText={setWeight} />
      
      <TouchableOpacity style={styles.btn} onPress={handleSaveLog} disabled={loading}>
        <Text style={styles.btnText}>{loading ? 'Saving...' : 'Save Log 🚀'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0C10', padding: 20, paddingTop: 60 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#FFD700', marginBottom: 20 },
  input: { backgroundColor: '#1A1D24', color: '#FFF', padding: 14, borderRadius: 10, fontSize: 16, marginBottom: 14 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  half: { width: '48%' },
  btn: { backgroundColor: '#FFD700', padding: 16, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  btnText: { color: '#000', fontWeight: 'bold', fontSize: 16 },
});