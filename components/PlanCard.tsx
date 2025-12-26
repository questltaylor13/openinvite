import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Plan } from '@/types/plan';
import { Colors } from '@/constants/theme';
import { formatDate, formatTime, isDeadlineSoon, isDeadlinePassed, getDaysUntilDeadline } from '@/utils/date-helpers';

interface PlanCardProps {
  plan: Plan;
  onPress: () => void;
}

export function PlanCard({ plan, onPress }: PlanCardProps) {
  const colors = Colors.dark;
  const isFull = plan.filledSpots >= plan.totalSpots;
  const spotsLeft = plan.totalSpots - plan.filledSpots;
  const deadlinePassed = isDeadlinePassed(plan.rsvpDeadline);
  const deadlineSoon = isDeadlineSoon(plan.rsvpDeadline);
  const daysUntilDeadline = getDaysUntilDeadline(plan.rsvpDeadline);

  const getSpotsColor = () => {
    if (isFull) return colors.danger;
    if (spotsLeft <= 2) return colors.warning;
    return colors.success;
  };

  const getDeadlineText = () => {
    if (deadlinePassed) return 'RSVP closed';
    if (daysUntilDeadline === 0) return 'RSVP ends today';
    if (daysUntilDeadline === 1) return 'RSVP ends tomorrow';
    return `RSVP by ${formatDate(plan.rsvpDeadline)}`;
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
        pressed && styles.cardPressed,
      ]}
      onPress={onPress}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {plan.title}
        </Text>
        <View style={[styles.spotsBadge, { backgroundColor: getSpotsColor() + '20' }]}>
          <Text style={[styles.spotsText, { color: getSpotsColor() }]}>
            {isFull ? 'Full' : `${plan.filledSpots}/${plan.totalSpots}`}
          </Text>
        </View>
      </View>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
          <Text style={[styles.detailText, { color: colors.textSecondary }]}>
            {formatDate(plan.date)} at {formatTime(plan.time)}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
          <Text style={[styles.detailText, { color: colors.textSecondary }]} numberOfLines={1}>
            {plan.location}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons
            name="time-outline"
            size={16}
            color={deadlinePassed ? colors.danger : deadlineSoon ? colors.warning : colors.textSecondary}
          />
          <Text
            style={[
              styles.detailText,
              {
                color: deadlinePassed
                  ? colors.danger
                  : deadlineSoon
                  ? colors.warning
                  : colors.textSecondary,
              },
            ]}
          >
            {getDeadlineText()}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
  },
  cardPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    marginRight: 12,
  },
  spotsBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  spotsText: {
    fontSize: 13,
    fontWeight: '600',
  },
  details: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    flex: 1,
  },
});
