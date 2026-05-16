import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export function RegisterScreen({ navigation }: any) {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setLoading(true);
    try {
      await axios.post(`${API_URL}/v1/auth/register`, form);
      Alert.alert('Success', 'Account created! Check your email to verify.', [
        { text: 'OK', onPress: () => navigation.navigate('Login') },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  const fields = [
    { key: 'firstName', label: 'First Name', placeholder: 'John' },
    { key: 'lastName', label: 'Last Name', placeholder: 'Doe' },
    { key: 'email', label: 'Email', placeholder: 'you@example.com', keyboard: 'email-address' as const },
    { key: 'password', label: 'Password', placeholder: 'Min 8 characters', secure: true },
  ];

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join thousands of businesses on VoIP Platform</Text>

        <View style={styles.form}>
          {fields.map(f => (
            <View key={f.key}>
              <Text style={styles.label}>{f.label}</Text>
              <TextInput
                style={styles.input} placeholder={f.placeholder} placeholderTextColor="#6b7280"
                value={form[f.key as keyof typeof form]}
                onChangeText={v => setForm(prev => ({ ...prev, [f.key]: v }))}
                keyboardType={f.keyboard || 'default'}
                secureTextEntry={f.secure}
                autoCapitalize={f.secure || f.key === 'email' ? 'none' : 'words'}
              />
            </View>
          ))}
          <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Create Account</Text>}
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.link}>Already have an account? <Text style={styles.linkBold}>Sign In</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F1A' },
  content: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 32 },
  form: { gap: 12, marginBottom: 24 },
  label: { color: '#9ca3af', fontSize: 13, marginBottom: 6 },
  input: {
    backgroundColor: '#1A1A2E', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 13, color: '#fff', fontSize: 15,
  },
  button: { backgroundColor: '#6C63FF', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  link: { color: '#6b7280', textAlign: 'center', fontSize: 14 },
  linkBold: { color: '#6C63FF', fontWeight: '600' },
});
