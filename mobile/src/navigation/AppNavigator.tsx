import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text } from 'react-native';
import { useAuthStore } from '../store/auth.store';

import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { CallsScreen } from '../screens/CallsScreen';
import { MessagesScreen } from '../screens/MessagesScreen';
import { NumbersScreen } from '../screens/NumbersScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const tabIcon = (name: string, focused: boolean) => {
  const icons: Record<string, string> = {
    Calls: '📞', Messages: '💬', Numbers: '🔢', Settings: '⚙️',
  };
  return <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>{icons[name] || '●'}</Text>;
};

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => tabIcon(route.name, focused),
        tabBarStyle: { backgroundColor: '#1A1A2E', borderTopColor: 'rgba(255,255,255,0.1)' },
        tabBarActiveTintColor: '#6C63FF',
        tabBarInactiveTintColor: '#6b7280',
        headerStyle: { backgroundColor: '#0F0F1A' },
        headerTintColor: '#fff',
        headerShadowVisible: false,
      })}>
      <Tab.Screen name="Calls" component={CallsScreen} />
      <Tab.Screen name="Messages" component={MessagesScreen} />
      <Tab.Screen name="Numbers" component={NumbersScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

export function AppNavigator() {
  const { accessToken } = useAuthStore();
  return accessToken ? <MainTabs /> : <AuthStack />;
}
