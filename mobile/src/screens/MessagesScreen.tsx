import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../store/auth.store';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export function MessagesScreen({ navigation }: any) {
  const { accessToken } = useAuthStore();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API_URL}/v1/messages/conversations`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    }).then(r => setConversations(r.data.data || [])).finally(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator style={{ flex: 1, backgroundColor: '#0F0F1A' }} color="#6C63FF" />;

  return (
    <View style={styles.container}>
      <FlatList
        data={conversations}
        keyExtractor={(item: any) => item.remoteNumber}
        renderItem={({ item }: any) => (
          <TouchableOpacity style={styles.item}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.remoteNumber?.slice(-2)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.number}>{item.remoteNumber}</Text>
              <Text style={styles.lastMsg} numberOfLines={1}>{item.lastMessage || 'No messages'}</Text>
            </View>
            {item.unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No conversations yet</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F1A' },
  item: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)', gap: 12 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#6C63FF', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  number: { color: '#fff', fontSize: 15, fontWeight: '500' },
  lastMsg: { color: '#6b7280', fontSize: 13, marginTop: 2 },
  badge: { backgroundColor: '#6C63FF', borderRadius: 10, minWidth: 20, height: 20, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  empty: { color: '#6b7280', textAlign: 'center', marginTop: 60, fontSize: 15 },
});
