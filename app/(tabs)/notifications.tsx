import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { usePlans } from '@/context/PlansContext';
import { Colors } from '@/constants/theme';
import { AppNotification } from '@/types/plan';

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function getNotificationIcon(type: AppNotification['type']): string {
  switch (type) {
    case 'rsvp':
      return 'checkmark-circle';
    case 'group_invite':
      return 'people';
    case 'plan_reminder':
      return 'alarm';
    case 'group_accepted':
      return 'person-add';
    default:
      return 'notifications';
  }
}

function getNotificationColor(type: AppNotification['type'], colors: typeof Colors.dark): string {
  switch (type) {
    case 'rsvp':
      return colors.success;
    case 'group_invite':
      return colors.accent;
    case 'plan_reminder':
      return colors.warning;
    case 'group_accepted':
      return colors.success;
    default:
      return colors.textSecondary;
  }
}

export default function NotificationsScreen() {
  const { notifications, markAsRead, markAllAsRead, deleteNotification, unreadCount } = usePlans();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = Colors.dark;

  const handleNotificationPress = (notification: AppNotification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }

    // Navigate to relevant screen
    if (notification.planId) {
      router.push(`/plan/${notification.planId}`);
    } else if (notification.groupId) {
      router.push('/(tabs)/groups');
    }
  };

  const handleSwipeDelete = (notificationId: string) => {
    deleteNotification(notificationId);
  };

  const renderNotification = ({ item }: { item: AppNotification }) => {
    const iconName = getNotificationIcon(item.type);
    const iconColor = getNotificationColor(item.type, colors);

    return (
      <Pressable
        style={({ pressed }) => [
          styles.notificationItem,
          { backgroundColor: item.read ? colors.background : colors.surface },
          pressed && styles.pressed,
        ]}
        onPress={() => handleNotificationPress(item)}
        onLongPress={() => handleSwipeDelete(item.id)}
      >
        <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
          <Ionicons name={iconName as any} size={24} color={iconColor} />
        </View>
        <View style={styles.contentContainer}>
          <View style={styles.headerRow}>
            <Text
              style={[
                styles.notificationTitle,
                { color: colors.text },
                !item.read && styles.unreadTitle,
              ]}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            <Text style={[styles.timeText, { color: colors.textSecondary }]}>
              {formatTimeAgo(item.createdAt)}
            </Text>
          </View>
          <Text
            style={[styles.notificationMessage, { color: colors.textSecondary }]}
            numberOfLines={2}
          >
            {item.message}
          </Text>
          {!item.read && <View style={[styles.unreadDot, { backgroundColor: colors.accent }]} />}
        </View>
      </Pressable>
    );
  };

  const sortedNotifications = [...notifications].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {unreadCount > 0 && (
        <Pressable
          style={[styles.markAllButton, { borderBottomColor: colors.border }]}
          onPress={markAllAsRead}
        >
          <Ionicons name="checkmark-done" size={18} color={colors.accent} />
          <Text style={[styles.markAllText, { color: colors.accent }]}>
            Mark all as read
          </Text>
        </Pressable>
      )}

      {sortedNotifications.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="notifications-off-outline" size={64} color={colors.textSecondary} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No notifications</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            You'll see RSVPs and group invites here
          </Text>
        </View>
      ) : (
        <FlatList
          data={sortedNotifications}
          keyExtractor={(item) => item.id}
          renderItem={renderNotification}
          contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => (
            <View style={[styles.separator, { backgroundColor: colors.border }]} />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  markAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
    borderBottomWidth: 1,
  },
  markAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  pressed: {
    opacity: 0.7,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    position: 'relative',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 15,
    flex: 1,
    marginRight: 8,
  },
  unreadTitle: {
    fontWeight: '600',
  },
  timeText: {
    fontSize: 12,
  },
  notificationMessage: {
    fontSize: 14,
    lineHeight: 20,
  },
  unreadDot: {
    position: 'absolute',
    top: 4,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  separator: {
    height: 1,
    marginLeft: 76,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    textAlign: 'center',
  },
});
