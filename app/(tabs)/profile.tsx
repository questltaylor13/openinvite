import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { usePlans } from '@/context/PlansContext';
import { Colors } from '@/constants/theme';
import { Avatar } from '@/components/Avatar';

const AVATAR_COLORS = [
  '#6366F1', // Indigo
  '#EC4899', // Pink
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#8B5CF6', // Violet
  '#EF4444', // Red
  '#3B82F6', // Blue
  '#14B8A6', // Teal
];

export default function ProfileScreen() {
  const { currentUser, updateProfile } = usePlans();
  const insets = useSafeAreaInsets();
  const colors = Colors.dark;

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentUser.name);
  const [username, setUsername] = useState(currentUser.username || '');
  const [bio, setBio] = useState(currentUser.bio || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [selectedColor, setSelectedColor] = useState(currentUser.avatarColor);

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a name');
      return;
    }

    updateProfile({
      name: name.trim(),
      username: username.trim() || undefined,
      bio: bio.trim() || undefined,
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      avatarColor: selectedColor,
    });

    setIsEditing(false);
    Alert.alert('Success', 'Profile updated!');
  };

  const handleCancel = () => {
    // Reset to current values
    setName(currentUser.name);
    setUsername(currentUser.username || '');
    setBio(currentUser.bio || '');
    setEmail(currentUser.email || '');
    setPhone(currentUser.phone || '');
    setSelectedColor(currentUser.avatarColor);
    setIsEditing(false);
  };

  const handleShareProfile = async () => {
    const profileUrl = `openinvite://profile/${currentUser.username || currentUser.id}`;
    const message = `Check out my profile on OpenInvite! Add me as a friend: ${profileUrl}`;

    try {
      await Share.share({
        message,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
    >
      {/* Avatar Section */}
      <View style={styles.avatarSection}>
        <Avatar
          user={{ ...currentUser, avatarColor: selectedColor }}
          size={100}
        />
        {isEditing && (
          <View style={styles.colorPicker}>
            <Text style={[styles.colorPickerLabel, { color: colors.textSecondary }]}>
              Choose avatar color
            </Text>
            <View style={styles.colorOptions}>
              {AVATAR_COLORS.map((color) => (
                <Pressable
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    selectedColor === color && styles.colorOptionSelected,
                  ]}
                  onPress={() => setSelectedColor(color)}
                >
                  {selectedColor === color && (
                    <Ionicons name="checkmark" size={20} color="#fff" />
                  )}
                </Pressable>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* Profile Info */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Name</Text>
          {isEditing ? (
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              placeholderTextColor={colors.textSecondary}
            />
          ) : (
            <Text style={[styles.fieldValue, { color: colors.text }]}>{currentUser.name}</Text>
          )}
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Username</Text>
          {isEditing ? (
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              value={username}
              onChangeText={setUsername}
              placeholder="@username"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="none"
            />
          ) : (
            <Text style={[styles.fieldValue, { color: colors.text }]}>
              {currentUser.username ? `@${currentUser.username}` : 'Not set'}
            </Text>
          )}
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Bio</Text>
          {isEditing ? (
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              value={bio}
              onChangeText={setBio}
              placeholder="Tell people about yourself..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          ) : (
            <Text style={[styles.fieldValue, { color: colors.text }]}>
              {currentUser.bio || 'No bio yet'}
            </Text>
          )}
        </View>
      </View>

      {/* Contact Info */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Contact Info</Text>

        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Email</Text>
          {isEditing ? (
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              value={email}
              onChangeText={setEmail}
              placeholder="your@email.com"
              placeholderTextColor={colors.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          ) : (
            <Text style={[styles.fieldValue, { color: colors.text }]}>
              {currentUser.email || 'Not set'}
            </Text>
          )}
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Phone</Text>
          {isEditing ? (
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              value={phone}
              onChangeText={setPhone}
              placeholder="(555) 555-5555"
              placeholderTextColor={colors.textSecondary}
              keyboardType="phone-pad"
            />
          ) : (
            <Text style={[styles.fieldValue, { color: colors.text }]}>
              {currentUser.phone || 'Not set'}
            </Text>
          )}
        </View>
      </View>

      {/* Action Buttons */}
      {isEditing ? (
        <View style={styles.buttonRow}>
          <Pressable
            style={[styles.button, styles.cancelButton, { borderColor: colors.border }]}
            onPress={handleCancel}
          >
            <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>Cancel</Text>
          </Pressable>
          <Pressable
            style={[styles.button, styles.saveButton, { backgroundColor: colors.accent }]}
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <Pressable
            style={[styles.actionButton, { backgroundColor: colors.accent }]}
            onPress={() => setIsEditing(true)}
          >
            <Ionicons name="pencil" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Edit Profile</Text>
          </Pressable>

          <Pressable
            style={[styles.actionButton, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }]}
            onPress={handleShareProfile}
          >
            <Ionicons name="share-outline" size={20} color={colors.text} />
            <Text style={[styles.actionButtonText, { color: colors.text }]}>Share Profile</Text>
          </Pressable>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  colorPicker: {
    marginTop: 16,
    alignItems: 'center',
  },
  colorPickerLabel: {
    fontSize: 14,
    marginBottom: 12,
  },
  colorOptions: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  colorOption: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorOptionSelected: {
    borderWidth: 3,
    borderColor: '#fff',
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  fieldGroup: {
    paddingVertical: 4,
  },
  fieldLabel: {
    fontSize: 13,
    marginBottom: 4,
  },
  fieldValue: {
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    minHeight: 80,
    paddingTop: 12,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {},
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 10,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
});
