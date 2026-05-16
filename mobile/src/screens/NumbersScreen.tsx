import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../store/auth.store';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export function NumbersScreen() {
  const { accessToken } = useAuthStore();
  const [numbers, setNumbers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API_URL}/v1/numbers`, { headers: { Authorization: `Bearer ${accessToken}` } })
      .then(r => setNumbers(r.data.data || r.data || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator style={{ flex: 1, backgroundColor: '#0F0F1A' }} color="#6C63FF" />;

  return (
    <View style={styles.container}>
      <FlatList
        data={numbers}
        keyExtractor={(item: any) => item.id}
        renderItem={({ item }: any) => (
          <View style={styles.item}>
            <Text style={styles.icon}>📞</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.number}>{item.phoneNumber}</Text>
              <Text style={styles.meta}>{item.type} • {item.country}</Text>
            </View>
            <View style={[styles.badge, item.status === 'active' ? styles.green : styles.red]}>
              <Text style={styles.badgeText}>{item.status}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No numbers yet. Purchase from the web portal.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F1A' },
  item: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)', gap: 12 },
  icon: { fontSize: 24 },
  number: { color: '#fff', fontSize: 16, fontWeight: '600' },
  meta: { color: '#6b7280', fontSize: 12, marginTop: 2 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  badgeText: { fontSize: 11, fontWeight: '600', color: '#fff' },
  green: { backgroundColor: 'rgba(34,197,94,0.2)' },
  red: { backgroundColor: 'rgba(239,68,68,0.2)' },
  empty: { color: '#6b7280', textAlign: 'center', marginTop: 60, fontSize: 14, paddingHorizontal: 40 },
});
