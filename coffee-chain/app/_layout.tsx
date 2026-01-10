// Root layout with tab navigation

import React, { useEffect, useState } from 'react';
import { Tabs } from 'expo-router';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { initDatabase } from '../src/database/schema';

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      try {
        await initDatabase();
        setIsReady(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize database');
      }
    }
    init();
  }, []);

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Error: {error}</Text>
      </View>
    );
  }

  if (!isReady) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2C1810" />
        <Text style={styles.loading}>Loading CoffeeChain...</Text>
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#2C1810',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#e5e7eb',
        },
        headerStyle: {
          backgroundColor: '#2C1810',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Collection',
          tabBarIcon: ({ color }) => <TabIcon name="☕" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <TabIcon name="🔍" color={color} />,
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: 'Add Lot',
          tabBarIcon: ({ color }) => <TabIcon name="➕" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <TabIcon name="👤" color={color} />,
        }}
      />
    </Tabs>
  );
}

function TabIcon({ name, color }: { name: string; color: string }) {
  return (
    <Text style={{ fontSize: 20, opacity: color === '#2C1810' ? 1 : 0.5 }}>
      {name}
    </Text>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loading: {
    marginTop: 16,
    color: '#6b7280',
    fontSize: 16,
  },
  error: {
    color: '#ef4444',
    fontSize: 16,
  },
});
