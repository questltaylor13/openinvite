import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { usePlans } from '@/context/PlansContext';
import { Colors } from '@/constants/theme';
import { CalendarProvider } from '@/types/plan';
import { Avatar } from '@/components/Avatar';

interface CalendarOption {
  provider: CalendarProvider;
  name: string;
  icon: string;
  color: string;
}

const CALENDAR_OPTIONS: CalendarOption[] = [
  {
    provider: 'google',
    name: 'Google Calendar',
    icon: 'logo-google',
    color: '#4285F4',
  },
  {
    provider: 'apple',
    name: 'Apple Calendar',
    icon: 'logo-apple',
    color: '#000000',
  },
  {
    provider: 'outlook',
    name: 'Outlook',
    icon: 'mail',
    color: '#0078D4',
  },
];

export default function SettingsScreen() {
  const { connectedCalendars, toggleCalendarConnection, currentUser } = usePlans();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colors = Colors.dark;

  const handleToggleCalendar = (provider: CalendarProvider, currentlyConnected: boolean) => {
    if (currentlyConnected) {
      Alert.alert(
        'Disconnect Calendar',
        `Are you sure you want to disconnect ${CALENDAR_OPTIONS.find(c => c.provider === provider)?.name}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Disconnect',
            style: 'destructive',
            onPress: () => toggleCalendarConnection(provider),
          },
        ]
      );
    } else {
      // Mock connection - in real app, this would trigger OAuth
      toggleCalendarConnection(provider);
      Alert.alert(
        'Calendar Connected',
        `Successfully connected to ${CALENDAR_OPTIONS.find(c => c.provider === provider)?.name}!`
      );
    }
  };

  const isConnected = (provider: CalendarProvider): boolean => {
    return connectedCalendars.some((c) => c.provider === provider && c.connected);
  };

  const getConnectedEmail = (provider: CalendarProvider): string | undefined => {
    return connectedCalendars.find((c) => c.provider === provider)?.email;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Section */}
        <View style={styles.section}>
          <Pressable
            style={[styles.profileCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => router.push('/(tabs)/profile')}
          >
            <Avatar user={currentUser} size={60} />
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: colors.text }]}>{currentUser.name}</Text>
              <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>
                {currentUser.username ? `@${currentUser.username}` : 'Tap to edit profile'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </Pressable>
        </View>

        {/* Connected Calendars Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>
            CONNECTED CALENDARS
          </Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
            Sync your plans with your favorite calendar apps
          </Text>

          <View style={[styles.calendarList, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {CALENDAR_OPTIONS.map((calendar, index) => {
              const connected = isConnected(calendar.provider);
              const email = getConnectedEmail(calendar.provider);

              return (
                <View key={calendar.provider}>
                  <View style={styles.calendarRow}>
                    <View style={[styles.calendarIcon, { backgroundColor: calendar.color + '20' }]}>
                      <Ionicons
                        name={calendar.icon as any}
                        size={24}
                        color={calendar.color}
                      />
                    </View>
                    <View style={styles.calendarInfo}>
                      <Text style={[styles.calendarName, { color: colors.text }]}>
                        {calendar.name}
                      </Text>
                      {connected && email && (
                        <Text style={[styles.calendarEmail, { color: colors.textSecondary }]}>
                          {email}
                        </Text>
                      )}
                    </View>
                    <Pressable
                      style={[
                        styles.connectButton,
                        connected
                          ? { backgroundColor: colors.success + '20' }
                          : { backgroundColor: colors.accent + '20' },
                      ]}
                      onPress={() => handleToggleCalendar(calendar.provider, connected)}
                    >
                      {connected ? (
                        <>
                          <Ionicons name="checkmark" size={16} color={colors.success} />
                          <Text style={[styles.connectButtonText, { color: colors.success }]}>
                            Connected
                          </Text>
                        </>
                      ) : (
                        <Text style={[styles.connectButtonText, { color: colors.accent }]}>
                          Connect
                        </Text>
                      )}
                    </Pressable>
                  </View>
                  {index < CALENDAR_OPTIONS.length - 1 && (
                    <View style={[styles.divider, { backgroundColor: colors.border }]} />
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* Friends Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>
            SOCIAL
          </Text>

          <Pressable
            style={[styles.preferencesList, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => router.push('/(tabs)/friends')}
          >
            <View style={styles.preferenceRow}>
              <Ionicons name="people-outline" size={22} color={colors.accent} />
              <Text style={[styles.preferenceName, { color: colors.text }]}>
                Friends
              </Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </View>
          </Pressable>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>
            PREFERENCES
          </Text>

          <View style={[styles.preferencesList, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.preferenceRow}>
              <Ionicons name="notifications-outline" size={22} color={colors.textSecondary} />
              <Text style={[styles.preferenceName, { color: colors.text }]}>
                Notifications
              </Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.preferenceRow}>
              <Ionicons name="shield-outline" size={22} color={colors.textSecondary} />
              <Text style={[styles.preferenceName, { color: colors.text }]}>
                Privacy
              </Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.preferenceRow}>
              <Ionicons name="help-circle-outline" size={22} color={colors.textSecondary} />
              <Text style={[styles.preferenceName, { color: colors.text }]}>
                Help & Support
              </Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </View>
          </View>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={[styles.appName, { color: colors.textSecondary }]}>
            OpenInvite
          </Text>
          <Text style={[styles.appVersion, { color: colors.textSecondary }]}>
            Version 1.0.0
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    marginBottom: 12,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  avatarLarge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '600',
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
  },
  calendarList: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  calendarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  calendarIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarInfo: {
    flex: 1,
    marginLeft: 12,
  },
  calendarName: {
    fontSize: 16,
    fontWeight: '500',
  },
  calendarEmail: {
    fontSize: 13,
    marginTop: 2,
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  connectButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginLeft: 70,
  },
  preferencesList: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  preferenceName: {
    flex: 1,
    fontSize: 16,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  appName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 13,
  },
});
