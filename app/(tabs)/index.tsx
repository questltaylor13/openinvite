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

import { PlanCard } from '@/components/PlanCard';
import { usePlans } from '@/context/PlansContext';
import { Colors } from '@/constants/theme';
import { Plan } from '@/types/plan';

export default function MyPlansScreen() {
  const { plans, isLoading, getMyRSVP, isPlanInCalendar } = usePlans();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = Colors.dark;

  // Sort plans by date (upcoming first)
  const sortedPlans = [...plans].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`);
    const dateB = new Date(`${b.date}T${b.time}`);
    return dateA.getTime() - dateB.getTime();
  });

  const handlePlanPress = (plan: Plan) => {
    router.push(`/plan/${plan.id}`);
  };

  const handleAddPlan = () => {
    router.push('/add-plan');
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {sortedPlans.length === 0 ? (
        <View style={[styles.centered, styles.emptyState]}>
          <Ionicons name="calendar-outline" size={64} color={colors.textSecondary} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No plans yet</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Create your first open invite and let friends join!
          </Text>
          <Pressable
            style={[styles.emptyButton, { backgroundColor: colors.accent }]}
            onPress={handleAddPlan}
          >
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.emptyButtonText}>Create Plan</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={sortedPlans}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PlanCard
              plan={item}
              onPress={() => handlePlanPress(item)}
              myRSVP={getMyRSVP(item.id)}
              inCalendar={isPlanInCalendar(item.id)}
            />
          )}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 80 },
          ]}
          showsVerticalScrollIndicator={false}
        />
      )}

      {sortedPlans.length > 0 && (
        <Pressable
          style={({ pressed }) => [
            styles.fab,
            { backgroundColor: colors.accent, bottom: insets.bottom + 16 },
            pressed && styles.fabPressed,
          ]}
          onPress={handleAddPlan}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingTop: 8,
  },
  emptyState: {
    padding: 32,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
});
