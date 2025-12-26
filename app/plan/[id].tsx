import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Share,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { usePlans } from '@/context/PlansContext';
import { Colors } from '@/constants/theme';
import {
  formatDate,
  formatTime,
  isDeadlinePassed,
  getDaysUntilDeadline,
} from '@/utils/date-helpers';

export default function PlanDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getPlanById, deletePlan, updatePlan } = usePlans();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = Colors.dark;

  const plan = getPlanById(id);

  if (!plan) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.textSecondary }]}>Plan not found</Text>
      </View>
    );
  }

  const isFull = plan.filledSpots >= plan.totalSpots;
  const spotsLeft = plan.totalSpots - plan.filledSpots;
  const deadlinePassed = isDeadlinePassed(plan.rsvpDeadline);
  const daysUntilDeadline = getDaysUntilDeadline(plan.rsvpDeadline);

  const getSpotsColor = () => {
    if (isFull) return colors.danger;
    if (spotsLeft <= 2) return colors.warning;
    return colors.success;
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Plan',
      'Are you sure you want to delete this plan?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deletePlan(plan.id);
            router.back();
          },
        },
      ]
    );
  };

  const handleSimulateRSVP = () => {
    if (plan.filledSpots < plan.totalSpots && !deadlinePassed) {
      updatePlan(plan.id, { filledSpots: plan.filledSpots + 1 });
    }
  };

  const handleEdit = () => {
    router.push(`/add-plan?planId=${plan.id}`);
  };

  const handleShare = async () => {
    const spotsAvailable = plan.totalSpots - plan.filledSpots;
    const message = `Join me for ${plan.title} on ${formatDate(plan.date)} at ${plan.location}! ${spotsAvailable} spot${spotsAvailable !== 1 ? 's' : ''} available. RSVP by ${formatDate(plan.rsvpDeadline)}.`;

    try {
      await Share.share({
        message,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable onPress={handleEdit} hitSlop={8}>
              <Ionicons name="pencil" size={22} color={colors.accent} />
            </Pressable>
          ),
        }}
      />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: colors.text }]}>{plan.title}</Text>

        <View style={[styles.spotsContainer, { backgroundColor: getSpotsColor() + '20' }]}>
          <Text style={[styles.spotsNumber, { color: getSpotsColor() }]}>
            {plan.filledSpots}/{plan.totalSpots}
          </Text>
          <Text style={[styles.spotsLabel, { color: getSpotsColor() }]}>
            {isFull ? 'Full' : `${spotsLeft} spot${spotsLeft !== 1 ? 's' : ''} left`}
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.detailRow}>
            <View style={[styles.iconContainer, { backgroundColor: colors.accent + '20' }]}>
              <Ionicons name="calendar" size={20} color={colors.accent} />
            </View>
            <View style={styles.detailContent}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Date & Time</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {formatDate(plan.date)} at {formatTime(plan.time)}
              </Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.detailRow}>
            <View style={[styles.iconContainer, { backgroundColor: colors.accent + '20' }]}>
              <Ionicons name="location" size={20} color={colors.accent} />
            </View>
            <View style={styles.detailContent}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Location</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>{plan.location}</Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.detailRow}>
            <View style={[styles.iconContainer, { backgroundColor: deadlinePassed ? colors.danger + '20' : colors.warning + '20' }]}>
              <Ionicons
                name="alarm"
                size={20}
                color={deadlinePassed ? colors.danger : colors.warning}
              />
            </View>
            <View style={styles.detailContent}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>RSVP Deadline</Text>
              <Text
                style={[
                  styles.detailValue,
                  { color: deadlinePassed ? colors.danger : colors.text },
                ]}
              >
                {formatDate(plan.rsvpDeadline)}
                {deadlinePassed
                  ? ' (Closed)'
                  : daysUntilDeadline <= 2
                  ? ` (${daysUntilDeadline === 0 ? 'Today' : daysUntilDeadline === 1 ? 'Tomorrow' : `${daysUntilDeadline} days left`})`
                  : ''}
              </Text>
            </View>
          </View>
        </View>

        {plan.notes && (
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.notesLabel, { color: colors.textSecondary }]}>Notes</Text>
            <Text style={[styles.notesText, { color: colors.text }]}>{plan.notes}</Text>
          </View>
        )}

        {!isFull && !deadlinePassed && (
          <Pressable
            style={({ pressed }) => [
              styles.rsvpButton,
              { backgroundColor: colors.success },
              pressed && styles.buttonPressed,
            ]}
            onPress={handleSimulateRSVP}
          >
            <Ionicons name="person-add" size={20} color="#fff" />
            <Text style={styles.rsvpButtonText}>Simulate RSVP</Text>
          </Pressable>
        )}

        <Pressable
          style={({ pressed }) => [
            styles.shareButton,
            { backgroundColor: colors.accent },
            pressed && styles.buttonPressed,
          ]}
          onPress={handleShare}
        >
          <Ionicons name="share-outline" size={20} color="#fff" />
          <Text style={styles.shareButtonText}>Share Invite</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.deleteButton,
            { borderColor: colors.danger },
            pressed && styles.buttonPressed,
          ]}
          onPress={handleDelete}
        >
          <Ionicons name="trash-outline" size={20} color={colors.danger} />
          <Text style={[styles.deleteButtonText, { color: colors.danger }]}>Delete Plan</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
  },
  errorText: {
    fontSize: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 16,
  },
  spotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 20,
    gap: 12,
  },
  spotsNumber: {
    fontSize: 24,
    fontWeight: '700',
  },
  spotsLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 13,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    marginVertical: 14,
  },
  notesLabel: {
    fontSize: 13,
    marginBottom: 8,
  },
  notesText: {
    fontSize: 16,
    lineHeight: 24,
  },
  rsvpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 10,
  },
  rsvpButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 10,
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  deleteButtonText: {
    fontSize: 17,
    fontWeight: '600',
  },
  buttonPressed: {
    opacity: 0.8,
  },
});
