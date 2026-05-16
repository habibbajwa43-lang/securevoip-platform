import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList,
  Alert, ActivityIndicator,
} from 'react-native';
import { useAuthStore } from '../store/auth.store';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export function CallsScreen() {
  const { accessToken } = useAuthStore();
  const [calls, setCalls] = useState([]);
  const [dialNumber, setDialNumber] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeCall, setActiveCall] = useState<any>(null);
  const [callDuration, setCallDuration] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetchCalls();
  }, []);

  useEffect(() => {
    if (activeCall) {
      timerRef.current = setInterval(() => setCallDuration(d => d + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setCallDuration(0);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [activeCall]);

  const fetchCalls = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/v1/calls`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setCalls(data.data || []);
    } finally { setLoading(false); }
  };

  const formatDuration = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const handleKeypad = (key: string) => setDialNumber(p => p + key);

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];

  if (activeCall) {
    return (
      <View style={styles.callScreen}>
        <Text style={styles.callNumber}>{activeCall.number}</Text>
        <Text style={styles.callStatus}>In Call</Text>
        <Text style={styles.callTimer}>{formatDuration(callDuration)}</Text>
        <View style={styles.callActions}>
          <TouchableOpacity style={[styles.callBtn, styles.endBtn]} onPress={() => setActiveCall(null)}>
            <Text style={styles.callBtnText}>📵 End</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Dialer */}
      <View style={styles.dialer}>
        <TextInput
          style={styles.dialInput} value={dialNumber} onChangeText={setDialNumber}
          placeholder="Enter number" placeholderTextColor="#6b7280" keyboardType="phone-pad" textAlign="center"
        />
        <View style={styles.keypad}>
          {keys.map(k => (
            <TouchableOpacity key={k} style={styles.key} onPress={() => handleKeypad(k)}>
              <Text style={styles.keyText}>{k}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity
          style={[styles.callButton, !dialNumber && styles.callButtonDisabled]}
          onPress={() => dialNumber && setActiveCall({ number: dialNumber })}
          disabled={!dialNumber}>
          <Text style={styles.callButtonText}>📞</Text>
        </TouchableOpacity>
      </View>

      {/* Recent calls */}
      <Text style={styles.sectionTitle}>Recent Calls</Text>
      {loading ? <ActivityIndicator color="#6C63FF" style={{ marginTop: 20 }} /> : (
        <FlatList
          data={calls}
          keyExtractor={(item: any) => item.id}
          renderItem={({ item }: any) => (
            <View style={styles.callItem}>
              <Text style={styles.callItemIcon}>{item.direction === 'inbound' ? '📲' : '📤'}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.callItemNumber}>{item.toNumber || item.fromNumber}</Text>
                <Text style={styles.callItemTime}>{new Date(item.createdAt).toLocaleString()}</Text>
              </View>
              <Text style={styles.callItemDuration}>{formatDuration(item.duration || 0)}</Text>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.empty}>No recent calls</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F1A' },
  callScreen: { flex: 1, backgroundColor: '#1A1A2E', alignItems: 'center', justifyContent: 'center' },
  callNumber: { color: '#fff', fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
  callStatus: { color: '#6C63FF', fontSize: 16, marginBottom: 8 },
  callTimer: { color: '#9ca3af', fontSize: 20, fontFamily: 'monospace', marginBottom: 60 },
  callActions: { flexDirection: 'row', gap: 24 },
  callBtn: { paddingVertical: 14, paddingHorizontal: 32, borderRadius: 50, alignItems: 'center' },
  endBtn: { backgroundColor: '#ef4444' },
  callBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  dialer: { padding: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  dialInput: { color: '#fff', fontSize: 28, letterSpacing: 4, marginBottom: 16, minHeight: 50 },
  keypad: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  key: {
    width: '30%', aspectRatio: 2, backgroundColor: '#1A1A2E',
    borderRadius: 12, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  keyText: { color: '#fff', fontSize: 22, fontWeight: '500' },
  callButton: {
    backgroundColor: '#22c55e', width: 64, height: 64, borderRadius: 32,
    alignItems: 'center', justifyContent: 'center', alignSelf: 'center',
  },
  callButtonDisabled: { opacity: 0.4 },
  callButtonText: { fontSize: 28 },
  sectionTitle: { color: '#9ca3af', fontSize: 13, fontWeight: '600', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
  callItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)', gap: 12 },
  callItemIcon: { fontSize: 22 },
  callItemNumber: { color: '#fff', fontSize: 15, fontWeight: '500' },
  callItemTime: { color: '#6b7280', fontSize: 12, marginTop: 2 },
  callItemDuration: { color: '#9ca3af', fontSize: 13 },
  empty: { color: '#6b7280', textAlign: 'center', marginTop: 40, fontSize: 15 },
});
