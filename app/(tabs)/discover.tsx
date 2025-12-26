import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { usePlans } from '@/context/PlansContext';
import { Colors } from '@/constants/theme';
import { Plan } from '@/types/plan';
import { formatDate, formatTime } from '@/utils/date-helpers';

const MAX_ITEMS = 5;

interface DiscoverCardProps {
  plan: Plan;
  hostName: string;
  subtitle?: string;
  onPress: () => void;
}

function DiscoverCard({ plan, hostName, subtitle, onPress }: DiscoverCardProps) {
  const colors = Colors.dark;
  const isFull = plan.filledSpots >= plan.totalSpots;
  const spotsLeft = plan.totalSpots - plan.filledSpots;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
        pressed && styles.cardPressed,
      ]}
      onPress={onPress}
    >
      <View style={styles.cardHeader}>
        <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>
          {plan.title}
        </Text>
        <View style={[styles.spotsBadge, { backgroundColor: isFull ? colors.danger + '20' : colors.success + '20' }]}>
          <Text style={[styles.spotsText, { color: isFull ? colors.danger : colors.success }]}>
            {isFull ? 'Full' : `${spotsLeft} left`}
          </Text>
        </View>
      </View>

      <View style={styles.cardDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
          <Text style={[styles.detailText, { color: colors.textSecondary }]}>
            {formatDate(plan.date)} at {formatTime(plan.time)}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="person-outline" size={14} color={colors.textSecondary} />
          <Text style={[styles.detailText, { color: colors.textSecondary }]}>
            Hosted by {hostName}
          </Text>
        </View>

        {subtitle && (
          <View style={styles.detailRow}>
            <Ionicons name="people-outline" size={14} color={colors.accent} />
            <Text style={[styles.detailText, { color: colors.accent }]}>
              {subtitle}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

interface SectionProps {
  title: string;
  icon: string;
  children: React.ReactNode;
  showSeeMore?: boolean;
  onSeeMore?: () => void;
  emptyMessage?: string;
  isEmpty?: boolean;
}

function Section({ title, icon, children, showSeeMore, onSeeMore, emptyMessage, isEmpty }: SectionProps) {
  const colors = Colors.dark;

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Ionicons name={icon as any} size={20} color={colors.accent} />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
        </View>
        {showSeeMore && (
          <Pressable onPress={onSeeMore} style={styles.seeMoreButton}>
            <Text style={[styles.seeMoreText, { color: colors.accent }]}>See more</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.accent} />
          </Pressable>
        )}
      </View>

      {isEmpty ? (
        <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            {emptyMessage}
          </Text>
        </View>
      ) : (
        children
      )}
    </View>
  );
}

export default function DiscoverScreen() {
  const { getDiscoverFriendsPlans, getDiscoverGroupPlans, getUserById, getMyRSVP } = usePlans();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = Colors.dark;

  const [showAllFriends, setShowAllFriends] = useState(false);
  const [showAllGroups, setShowAllGroups] = useState(false);

  const friendsPlans = getDiscoverFriendsPlans();
  const groupPlans = getDiscoverGroupPlans();

  const displayedFriendsPlans = showAllFriends ? friendsPlans : friendsPlans.slice(0, MAX_ITEMS);
  const displayedGroupPlans = showAllGroups ? groupPlans : groupPlans.slice(0, MAX_ITEMS);

  const handlePlanPress = (planId: string) => {
    router.push(`/plan/${planId}?discover=true`);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerSection}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Discover Plans
        </Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          See what your friends and groups are up to
        </Text>
      </View>

      <Section
        title="Friends' Plans"
        icon="heart-outline"
        isEmpty={friendsPlans.length === 0}
        emptyMessage="No new plans from friends right now"
        showSeeMore={friendsPlans.length > MAX_ITEMS && !showAllFriends}
        onSeeMore={() => setShowAllFriends(true)}
      >
        {displayedFriendsPlans.map((plan) => {
          const host = getUserById(plan.createdBy || 'unknown');
          return (
            <DiscoverCard
              key={plan.id}
              plan={plan}
              hostName={host?.name || 'Unknown'}
              onPress={() => handlePlanPress(plan.id)}
            />
          );
        })}
        {showAllFriends && friendsPlans.length > MAX_ITEMS && (
          <Pressable
            style={styles.collapseButton}
            onPress={() => setShowAllFriends(false)}
          >
            <Text style={[styles.collapseText, { color: colors.textSecondary }]}>
              Show less
            </Text>
          </Pressable>
        )}
      </Section>

      <Section
        title="From Your Groups"
        icon="people-outline"
        isEmpty={groupPlans.length === 0}
        emptyMessage="No new plans from your groups"
        showSeeMore={groupPlans.length > MAX_ITEMS && !showAllGroups}
        onSeeMore={() => setShowAllGroups(true)}
      >
        {displayedGroupPlans.map(({ plan, groupName }) => {
          const host = getUserById(plan.createdBy || 'unknown');
          return (
            <DiscoverCard
              key={plan.id}
              plan={plan}
              hostName={host?.name || 'Unknown'}
              subtitle={`via ${groupName}`}
              onPress={() => handlePlanPress(plan.id)}
            />
          );
        })}
        {showAllGroups && groupPlans.length > MAX_ITEMS && (
          <Pressable
            style={styles.collapseButton}
            onPress={() => setShowAllGroups(false)}
          >
            <Text style={[styles.collapseText, { color: colors.textSecondary }]}>
              Show less
            </Text>
          </Pressable>
        )}
      </Section>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerSection: {
    padding: 16,
    paddingTop: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 15,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  seeMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  seeMoreText: {
    fontSize: 14,
    fontWeight: '500',
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  cardPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 10,
  },
  spotsBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  spotsText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardDetails: {
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 13,
  },
  emptyCard: {
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
  collapseButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  collapseText: {
    fontSize: 14,
  },
});
