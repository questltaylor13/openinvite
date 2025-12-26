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
} from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

import { usePlans } from '@/context/PlansContext';
import { Colors } from '@/constants/theme';

export default function AddPlanScreen() {
  const router = useRouter();
  const { planId } = useLocalSearchParams<{ planId?: string }>();
  const { addPlan, updatePlan, getPlanById } = usePlans();
  const colors = Colors.dark;

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
    }
  }, [existingPlan]);

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

    if (isEditMode && existingPlan) {
      updatePlan(planId, {
        title: title.trim(),
        date: dateString,
        time: timeString,
        location: location.trim(),
        totalSpots: parseInt(totalSpots),
        rsvpDeadline: deadlineString,
        notes: notes.trim() || undefined,
      });
    } else {
      addPlan({
        title: title.trim(),
        date: dateString,
        time: timeString,
        location: location.trim(),
        totalSpots: parseInt(totalSpots),
        filledSpots: 0,
        rsvpDeadline: deadlineString,
        notes: notes.trim() || undefined,
      });
    }

    router.back();
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
});
