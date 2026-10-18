import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { supabase } from '../lib/supabase';
import { QrCode, CheckCircle2 } from 'lucide-react-native';

export default function MemberScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.containerCenter}>
        <QrCode color="#FFD700" size={60} />
        <Text style={styles.permissionTitle}>Camera Access Required</Text>
        <Text style={styles.permissionSub}>
          We need access to your camera to scan the gym check-in QR code.
        </Text>
        <TouchableOpacity style={styles.grantBtn} onPress={requestPermission}>
          <Text style={styles.grantBtnText}>Grant Camera Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  async function handleBarcodeScanned({ data }: { data: string }) {
    if (scanned || loading) return;
    setScanned(true);
    setLoading(true);

    // Verify QR code payload format
    if (!data.includes('GYMSAAS_CHECKIN')) {
      Alert.alert('Invalid QR Code', 'Please scan the official Gym Check-In QR code.', [
        { text: 'Try Again', onPress: () => setScanned(false) },
      ]);
      setLoading(false);
      return;
    }

    // Insert attendance check-in into Supabase
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { error } = await supabase
        .from('gym_attendance')
        .insert([{ user_id: user.id }]);

      if (error) {
        Alert.alert('Check-In Failed', error.message, [
          { text: 'Try Again', onPress: () => setScanned(false) },
        ]);
      } else {
        Alert.alert('Success! 🎉', 'You have successfully checked in for today!', [
          { text: 'Done', onPress: () => setScanned(false) },
        ]);
      }
    }
    setLoading(false);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📷 Gym Check-In</Text>
      <Text style={styles.subtitle}>Align the admin's QR code within the frame to log attendance.</Text>

      <View style={styles.cameraWrapper}>
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
        />
        <View style={styles.overlayFrame} />
      </View>

      {scanned && (
        <TouchableOpacity style={styles.rescanBtn} onPress={() => setScanned(false)}>
          <CheckCircle2 color="#000" size={20} />
          <Text style={styles.rescanText}>Tap to Scan Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0C10', padding: 20, paddingTop: 60 },
  containerCenter: { flex: 1, backgroundColor: '#0A0C10', justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#FFD700', marginBottom: 6 },
  subtitle: { color: '#888', fontSize: 13, marginBottom: 20 },
  permissionTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold', marginTop: 20 },
  permissionSub: { color: '#888', textAlign: 'center', marginTop: 8, marginBottom: 20 },
  grantBtn: { backgroundColor: '#FFD700', padding: 14, borderRadius: 10 },
  grantBtnText: { color: '#000', fontWeight: 'bold' },
  cameraWrapper: { flex: 1, borderRadius: 16, overflow: 'hidden', borderWidth: 2, borderColor: '#FFD700', justifyContent: 'center', alignItems: 'center' },
  overlayFrame: { width: 220, height: 220, borderWidth: 2, borderColor: '#FFD700', borderRadius: 12, backgroundColor: 'transparent' },
  rescanBtn: { backgroundColor: '#FFD700', padding: 16, borderRadius: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 16 },
  rescanText: { color: '#000', fontWeight: 'bold', fontSize: 16 },
});