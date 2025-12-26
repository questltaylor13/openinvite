import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { usePlans } from '@/context/PlansContext';

function HeaderRight() {
  const { unreadCount } = usePlans();
  const router = useRouter();
  const colors = Colors.dark;

  return (
    <View style={styles.headerRight}>
      <Pressable
        style={styles.headerButton}
        onPress={() => router.push('/(tabs)/notifications')}
        hitSlop={8}
      >
        <Ionicons name="notifications-outline" size={24} color={colors.text} />
        {unreadCount > 0 && (
          <View style={[styles.badge, { backgroundColor: colors.danger }]}>
            <Text style={styles.badgeText}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </Text>
          </View>
        )}
      </Pressable>
      <Pressable
        style={styles.headerButton}
        onPress={() => router.push('/(tabs)/settings')}
        hitSlop={8}
      >
        <Ionicons name="settings-outline" size={24} color={colors.text} />
      </Pressable>
    </View>
  );
}

export default function TabLayout() {
  const colors = Colors.dark;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.tabIconDefault,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        tabBarButton: HapticTab,
        headerRight: () => <HeaderRight />,
      }}
    >
      <Tabs.Screen
        name="discover"
        options={{
          title: 'Discover',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="compass-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'My Plans',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="groups"
        options={{
          title: 'Groups',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={size} color={color} />
          ),
        }}
      />
      {/* Hidden from tab bar but accessible via header */}
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Notifications',
          href: null, // Hide from tab bar
          headerRight: () => null, // Don't show header icons on this screen
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          href: null, // Hide from tab bar
          headerRight: () => null, // Don't show header icons on this screen
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          href: null, // Hide from tab bar
          headerRight: () => null, // Don't show header icons on this screen
        }}
      />
      <Tabs.Screen
        name="friends"
        options={{
          title: 'Friends',
          href: null, // Hide from tab bar
          headerRight: () => null, // Don't show header icons on this screen
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginRight: 8,
  },
  headerButton: {
    padding: 8,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
});
