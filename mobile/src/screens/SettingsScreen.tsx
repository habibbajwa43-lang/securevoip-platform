import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuthStore } from '../store/auth.store';

export function SettingsScreen() {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  const rows = [
    { label: 'Account', value: user?.email, icon: '👤' },
    { label: 'Plan', value: 'Business', icon: '💼' },
    { label: 'Notifications', value: 'Enabled', icon: '🔔' },
    { label: 'Do Not Disturb', value: 'Off', icon: '🌙' },
    { label: 'App Version', value: '1.0.0', icon: 'ℹ️' },
  ];

  return (
    <View style={styles.container}>
      {/* Profile header */}
      <View style={styles.profile}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.firstName?.[0]}{user?.lastName?.[0]}</Text>
        </View>
        <Text style={styles.name}>{user?.firstName} {user?.lastName}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      {/* Settings rows */}
      <View style={styles.section}>
        {rows.map((row, i) => (
          <View key={row.label} style={[styles.row, i < rows.length - 1 && styles.rowBorder]}>
            <Text style={styles.rowIcon}>{row.icon}</Text>
            <Text style={styles.rowLabel}>{row.label}</Text>
            <Text style={styles.rowValue}>{row.value}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F1A' },
  profile: { alignItems: 'center', padding: 32, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#6C63FF', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  name: { color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 4 },
  email: { color: '#6b7280', fontSize: 14 },
  section: { margin: 20, backgroundColor: '#1A1A2E', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  rowIcon: { fontSize: 20, width: 28, textAlign: 'center' },
  rowLabel: { color: '#d1d5db', fontSize: 15, flex: 1 },
  rowValue: { color: '#6b7280', fontSize: 13 },
  logoutBtn: { marginHorizontal: 20, marginTop: 8, backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  logoutText: { color: '#f87171', fontSize: 15, fontWeight: '600' },
});
