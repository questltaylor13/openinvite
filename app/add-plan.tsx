import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
} from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

import { usePlans } from '@/context/PlansContext';
import { Colors } from '@/constants/theme';
import { VisibilityType, PlanVisibility, CalendarProvider } from '@/types/plan';
import { Avatar } from '@/components/Avatar';

const CALENDAR_NAMES: Record<CalendarProvider, string> = {
  google: 'Google Calendar',
  apple: 'Apple Calendar',
  outlook: 'Outlook',
};

type VisibilityOption = {
  type: VisibilityType;
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const visibilityOptions: VisibilityOption[] = [
  { type: 'everyone', label: 'Everyone', description: 'All your friends can see this', icon: 'globe-outline' },
  { type: 'friends', label: 'Friends Only', description: 'Only your friends can see this', icon: 'people-outline' },
  { type: 'groups', label: 'Specific Groups', description: 'Select which groups can see this', icon: 'people-circle-outline' },
  { type: 'people', label: 'Specific People', description: 'Choose individual friends', icon: 'person-outline' },
];

export default function AddPlanScreen() {
  const router = useRouter();
  const { planId } = useLocalSearchParams<{ planId?: string }>();
  const { addPlan, updatePlan, getPlanById, groups, users, connectedCalendars, getDefaultCalendar, addPlanToCalendar, isPlanInCalendar } = usePlans();
  const colors = Colors.dark;

  const defaultCalendar = getDefaultCalendar();
  const hasConnectedCalendar = !!defaultCalendar;

  const isEditMode = !!planId;
  const existingPlan = isEditMode ? getPlanById(planId) : null;

  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [totalSpots, setTotalSpots] = useState('');
  const [notes, setNotes] = useState('');

  // Date/time state
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [rsvpDeadline, setRsvpDeadline] = useState(new Date());

  // Visibility state
  const [visibilityType, setVisibilityType] = useState<VisibilityType>('everyone');
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [showVisibilityModal, setShowVisibilityModal] = useState(false);
  const [showGroupsModal, setShowGroupsModal] = useState(false);
  const [showPeopleModal, setShowPeopleModal] = useState(false);

  // Calendar state
  const [addToCalendar, setAddToCalendar] = useState(false);

  // Pre-fill form when editing
  useEffect(() => {
    if (existingPlan) {
      setTitle(existingPlan.title);
      setLocation(existingPlan.location);
      setTotalSpots(existingPlan.totalSpots.toString());
      setNotes(existingPlan.notes || '');

      // Parse date
      const [year, month, day] = existingPlan.date.split('-').map(Number);
      setDate(new Date(year, month - 1, day));

      // Parse time
      const [hours, minutes] = existingPlan.time.split(':').map(Number);
      const timeDate = new Date();
      timeDate.setHours(hours, minutes, 0, 0);
      setTime(timeDate);

      // Parse deadline
      const [dYear, dMonth, dDay] = existingPlan.rsvpDeadline.split('-').map(Number);
      setRsvpDeadline(new Date(dYear, dMonth - 1, dDay));

      // Parse visibility
      if (existingPlan.visibility) {
        setVisibilityType(existingPlan.visibility.type);
        setSelectedGroupIds(existingPlan.visibility.groupIds || []);
        setSelectedUserIds(existingPlan.visibility.userIds || []);
      }

      // Check if already in calendar
      setAddToCalendar(isPlanInCalendar(existingPlan.id));
    }
  }, [existingPlan, isPlanInCalendar]);

  // Picker visibility
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDeadlinePicker, setShowDeadlinePicker] = useState(false);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert('Missing Info', 'Please enter a title for your plan.');
      return;
    }
    if (!location.trim()) {
      Alert.alert('Missing Info', 'Please enter a location.');
      return;
    }
    if (!totalSpots || parseInt(totalSpots) < 1) {
      Alert.alert('Missing Info', 'Please enter the number of spots available.');
      return;
    }

    const dateString = date.toISOString().split('T')[0];
    const timeString = `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;
    const deadlineString = rsvpDeadline.toISOString().split('T')[0];

    // Build visibility object
    const visibility: PlanVisibility = { type: visibilityType };
    if (visibilityType === 'groups' && selectedGroupIds.length > 0) {
      visibility.groupIds = selectedGroupIds;
    }
    if (visibilityType === 'people' && selectedUserIds.length > 0) {
      visibility.userIds = selectedUserIds;
    }

    let newPlanId: string | undefined;

    if (isEditMode && existingPlan) {
      updatePlan(planId, {
        title: title.trim(),
        date: dateString,
        time: timeString,
        location: location.trim(),
        totalSpots: parseInt(totalSpots),
        rsvpDeadline: deadlineString,
        notes: notes.trim() || undefined,
        visibility,
      });
      newPlanId = planId;
    } else {
      newPlanId = Date.now().toString(); // This matches the ID generation in context
      addPlan({
        title: title.trim(),
        date: dateString,
        time: timeString,
        location: location.trim(),
        totalSpots: parseInt(totalSpots),
        filledSpots: 0,
        rsvpDeadline: deadlineString,
        notes: notes.trim() || undefined,
        visibility,
      });
    }

    // Add to calendar if enabled
    if (addToCalendar && newPlanId && hasConnectedCalendar) {
      addPlanToCalendar(newPlanId);
    }

    router.back();
  };

  const getVisibilityDisplayText = () => {
    const option = visibilityOptions.find((o) => o.type === visibilityType);
    if (!option) return 'Everyone';

    if (visibilityType === 'groups' && selectedGroupIds.length > 0) {
      const groupNames = selectedGroupIds
        .map((id) => groups.find((g) => g.id === id)?.name)
        .filter(Boolean);
      return groupNames.join(', ');
    }
    if (visibilityType === 'people' && selectedUserIds.length > 0) {
      const userNames = selectedUserIds
        .map((id) => users.find((u) => u.id === id)?.name.split(' ')[0])
        .filter(Boolean);
      return userNames.join(', ');
    }
    return option.label;
  };

  const handleSelectVisibility = (type: VisibilityType) => {
    setVisibilityType(type);
    setShowVisibilityModal(false);

    if (type === 'groups') {
      setShowGroupsModal(true);
    } else if (type === 'people') {
      setShowPeopleModal(true);
    }
  };

  const toggleGroup = (groupId: string) => {
    setSelectedGroupIds((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    );
  };

  const toggleUser = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen
        options={{
          headerTitle: isEditMode ? 'Edit Plan' : 'New Plan',
        }}
      />
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Title *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
            value={title}
            onChangeText={setTitle}
            placeholder="e.g., Dinner at Nobu"
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Date *</Text>
          <Pressable
            style={[styles.pickerButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
            <Text style={[styles.pickerText, { color: colors.text }]}>{formatDate(date)}</Text>
          </Pressable>
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="spinner"
              onChange={(_, selectedDate) => {
                setShowDatePicker(Platform.OS === 'ios');
                if (selectedDate) setDate(selectedDate);
              }}
              minimumDate={new Date()}
              themeVariant="dark"
            />
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Time *</Text>
          <Pressable
            style={[styles.pickerButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => setShowTimePicker(true)}
          >
            <Ionicons name="time-outline" size={20} color={colors.textSecondary} />
            <Text style={[styles.pickerText, { color: colors.text }]}>{formatTime(time)}</Text>
          </Pressable>
          {showTimePicker && (
            <DateTimePicker
              value={time}
              mode="time"
              display="spinner"
              onChange={(_, selectedTime) => {
                setShowTimePicker(Platform.OS === 'ios');
                if (selectedTime) setTime(selectedTime);
              }}
              themeVariant="dark"
            />
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Location *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
            value={location}
            onChangeText={setLocation}
            placeholder="e.g., 123 Main St, Los Angeles"
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Total Spots *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
            value={totalSpots}
            onChangeText={setTotalSpots}
            placeholder="e.g., 6"
            placeholderTextColor={colors.textSecondary}
            keyboardType="number-pad"
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>RSVP Deadline *</Text>
          <Pressable
            style={[styles.pickerButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => setShowDeadlinePicker(true)}
          >
            <Ionicons name="alarm-outline" size={20} color={colors.textSecondary} />
            <Text style={[styles.pickerText, { color: colors.text }]}>{formatDate(rsvpDeadline)}</Text>
          </Pressable>
          {showDeadlinePicker && (
            <DateTimePicker
              value={rsvpDeadline}
              mode="date"
              display="spinner"
              onChange={(_, selectedDate) => {
                setShowDeadlinePicker(Platform.OS === 'ios');
                if (selectedDate) setRsvpDeadline(selectedDate);
              }}
              minimumDate={new Date()}
              maximumDate={date}
              themeVariant="dark"
            />
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Notes (optional)</Text>
          <TextInput
            style={[
              styles.input,
              styles.textArea,
              { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border },
            ]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Any additional details..."
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Who can see this?</Text>
          <Pressable
            style={[styles.pickerButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => setShowVisibilityModal(true)}
          >
            <Ionicons
              name={visibilityOptions.find((o) => o.type === visibilityType)?.icon || 'globe-outline'}
              size={20}
              color={colors.textSecondary}
            />
            <Text style={[styles.pickerText, { color: colors.text, flex: 1 }]} numberOfLines={1}>
              {getVisibilityDisplayText()}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </Pressable>
        </View>

        {/* Calendar Sync Section */}
        <View style={styles.section}>
          <View style={styles.calendarToggleRow}>
            <View style={styles.calendarToggleInfo}>
              <Text style={[styles.label, { color: colors.text, marginBottom: 0 }]}>
                Add to my calendar
              </Text>
              {hasConnectedCalendar ? (
                <Text style={[styles.calendarSubtext, { color: colors.textSecondary }]}>
                  Syncs to {CALENDAR_NAMES[defaultCalendar]}
                </Text>
              ) : (
                <Text style={[styles.calendarSubtext, { color: colors.warning }]}>
                  No calendar connected
                </Text>
              )}
            </View>
            <Pressable
              style={[
                styles.toggle,
                { backgroundColor: addToCalendar && hasConnectedCalendar ? colors.accent : colors.surfaceSecondary },
              ]}
              onPress={() => {
                if (hasConnectedCalendar) {
                  setAddToCalendar(!addToCalendar);
                } else {
                  Alert.alert(
                    'No Calendar Connected',
                    'Connect a calendar in Settings to sync your plans.',
                    [{ text: 'OK' }]
                  );
                }
              }}
              disabled={!hasConnectedCalendar}
            >
              <View
                style={[
                  styles.toggleKnob,
                  {
                    backgroundColor: '#fff',
                    transform: [{ translateX: addToCalendar && hasConnectedCalendar ? 20 : 0 }],
                  },
                ]}
              />
            </Pressable>
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.submitButton,
            { backgroundColor: colors.accent },
            pressed && styles.submitButtonPressed,
          ]}
          onPress={handleSubmit}
        >
          <Text style={styles.submitButtonText}>{isEditMode ? 'Save Changes' : 'Create Plan'}</Text>
        </Pressable>
      </ScrollView>

      {/* Visibility Type Modal */}
      <Modal
        visible={showVisibilityModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowVisibilityModal(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Pressable onPress={() => setShowVisibilityModal(false)}>
              <Text style={[styles.modalCancel, { color: colors.textSecondary }]}>Cancel</Text>
            </Pressable>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Who can see this?</Text>
            <View style={{ width: 50 }} />
          </View>
          <View style={styles.modalContent}>
            {visibilityOptions.map((option) => (
              <Pressable
                key={option.type}
                style={[
                  styles.visibilityOption,
                  { borderBottomColor: colors.border },
                  visibilityType === option.type && { backgroundColor: colors.accent + '10' },
                ]}
                onPress={() => handleSelectVisibility(option.type)}
              >
                <View style={[styles.visibilityIconContainer, { backgroundColor: colors.surface }]}>
                  <Ionicons name={option.icon} size={24} color={colors.accent} />
                </View>
                <View style={styles.visibilityTextContainer}>
                  <Text style={[styles.visibilityLabel, { color: colors.text }]}>{option.label}</Text>
                  <Text style={[styles.visibilityDescription, { color: colors.textSecondary }]}>
                    {option.description}
                  </Text>
                </View>
                {visibilityType === option.type && (
                  <Ionicons name="checkmark-circle" size={24} color={colors.accent} />
                )}
              </Pressable>
            ))}
          </View>
        </View>
      </Modal>

      {/* Groups Selection Modal */}
      <Modal
        visible={showGroupsModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowGroupsModal(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Pressable onPress={() => setShowGroupsModal(false)}>
              <Text style={[styles.modalCancel, { color: colors.textSecondary }]}>Cancel</Text>
            </Pressable>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Select Groups</Text>
            <Pressable onPress={() => setShowGroupsModal(false)}>
              <Text style={[styles.modalDone, { color: colors.accent }]}>Done</Text>
            </Pressable>
          </View>
          <View style={styles.modalContent}>
            {groups.length === 0 ? (
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No groups yet. Create groups in the Groups tab.
              </Text>
            ) : (
              groups.map((group) => {
                const isSelected = selectedGroupIds.includes(group.id);
                return (
                  <Pressable
                    key={group.id}
                    style={[styles.selectionRow, { borderBottomColor: colors.border }]}
                    onPress={() => toggleGroup(group.id)}
                  >
                    <View>
                      <Text style={[styles.selectionLabel, { color: colors.text }]}>{group.name}</Text>
                      <Text style={[styles.selectionSubtext, { color: colors.textSecondary }]}>
                        {group.memberIds.length} member{group.memberIds.length !== 1 ? 's' : ''}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.checkbox,
                        { borderColor: isSelected ? colors.accent : colors.border },
                        isSelected && { backgroundColor: colors.accent },
                      ]}
                    >
                      {isSelected && <Ionicons name="checkmark" size={16} color="#fff" />}
                    </View>
                  </Pressable>
                );
              })
            )}
          </View>
        </View>
      </Modal>

      {/* People Selection Modal */}
      <Modal
        visible={showPeopleModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPeopleModal(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Pressable onPress={() => setShowPeopleModal(false)}>
              <Text style={[styles.modalCancel, { color: colors.textSecondary }]}>Cancel</Text>
            </Pressable>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Select People</Text>
            <Pressable onPress={() => setShowPeopleModal(false)}>
              <Text style={[styles.modalDone, { color: colors.accent }]}>Done</Text>
            </Pressable>
          </View>
          <View style={styles.modalContent}>
            {users.map((user) => {
              const isSelected = selectedUserIds.includes(user.id);
              return (
                <Pressable
                  key={user.id}
                  style={[styles.selectionRow, { borderBottomColor: colors.border }]}
                  onPress={() => toggleUser(user.id)}
                >
                  <View style={styles.userRow}>
                    <Avatar user={user} size={40} />
                    <Text style={[styles.selectionLabel, { color: colors.text }]}>{user.name}</Text>
                  </View>
                  <View
                    style={[
                      styles.checkbox,
                      { borderColor: isSelected ? colors.accent : colors.border },
                      isSelected && { backgroundColor: colors.accent },
                    ]}
                  >
                    {isSelected && <Ionicons name="checkmark" size={16} color="#fff" />}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 14,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  pickerText: {
    fontSize: 16,
  },
  submitButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonPressed: {
    opacity: 0.8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalCancel: {
    fontSize: 16,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  modalDone: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    padding: 20,
  },
  visibilityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    gap: 14,
  },
  visibilityIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  visibilityTextContainer: {
    flex: 1,
  },
  visibilityLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  visibilityDescription: {
    fontSize: 13,
  },
  selectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  selectionLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  selectionSubtext: {
    fontSize: 13,
    marginTop: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
    marginTop: 20,
  },
  calendarToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  calendarToggleInfo: {
    flex: 1,
  },
  calendarSubtext: {
    fontSize: 13,
    marginTop: 4,
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    padding: 2,
    justifyContent: 'center',
  },
  toggleKnob: {
    width: 26,
    height: 26,
    borderRadius: 13,
  },
});
