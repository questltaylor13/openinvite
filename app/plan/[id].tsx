import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Share,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { usePlans } from '@/context/PlansContext';
import { Colors } from '@/constants/theme';
import { Avatar } from '@/components/Avatar';
import { RSVPStatus, User, CalendarProvider, PlanMessage } from '@/types/plan';

const CALENDAR_NAMES: Record<CalendarProvider, string> = {
  google: 'Google Calendar',
  apple: 'Apple Calendar',
  outlook: 'Outlook',
};
import {
  formatDate,
  formatTime,
  isDeadlinePassed,
  getDaysUntilDeadline,
} from '@/utils/date-helpers';

// Response section component for grouped RSVPs
function ResponseSection({
  title,
  users,
  color,
  colors,
}: {
  title: string;
  users: User[];
  color: string;
  colors: typeof Colors.dark;
}) {
  return (
    <View style={responseSectionStyles.container}>
      <View style={responseSectionStyles.header}>
        <View style={[responseSectionStyles.dot, { backgroundColor: color }]} />
        <Text style={[responseSectionStyles.title, { color: colors.text }]}>{title}</Text>
      </View>
      <View style={responseSectionStyles.users}>
        {users.map((user) => (
          <View key={user.id} style={responseSectionStyles.userRow}>
            <Avatar user={user} size={32} />
            <Text style={[responseSectionStyles.userName, { color: colors.text }]}>
              {user.name}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const responseSectionStyles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
  },
  users: {
    gap: 10,
    paddingLeft: 16,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  userName: {
    fontSize: 15,
  },
});

export default function PlanDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    getPlanById,
    deletePlan,
    setRSVP,
    getMyRSVP,
    getRSVPsForPlan,
    getGroupNames,
    users,
    getDefaultCalendar,
    addPlanToCalendar,
    isPlanInCalendar,
    getMessagesForPlan,
    sendMessage,
    getUserById,
    currentUser,
  } = usePlans();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = Colors.dark;

  const defaultCalendar = getDefaultCalendar();
  const hasConnectedCalendar = !!defaultCalendar;

  const [messageText, setMessageText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  const plan = getPlanById(id);
  const myRSVP = plan ? getMyRSVP(plan.id) : null;
  const rsvpResponses = plan ? getRSVPsForPlan(plan.id) : { going: [], maybe: [], interested: [] };
  const planMessages = plan ? getMessagesForPlan(plan.id) : [];

  const getVisibilityText = (): string => {
    if (!plan?.visibility) return 'Everyone';

    switch (plan.visibility.type) {
      case 'everyone':
        return 'Everyone';
      case 'friends':
        return 'Friends Only';
      case 'groups':
        if (plan.visibility.groupIds && plan.visibility.groupIds.length > 0) {
          const groupNames = getGroupNames(plan.visibility.groupIds);
          return groupNames.join(', ');
        }
        return 'Specific Groups';
      case 'people':
        if (plan.visibility.userIds && plan.visibility.userIds.length > 0) {
          const userNames = plan.visibility.userIds
            .map((uid) => users.find((u) => u.id === uid)?.name.split(' ')[0])
            .filter(Boolean);
          return userNames.join(', ');
        }
        return 'Specific People';
      default:
        return 'Everyone';
    }
  };

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

  const handleRSVPPress = (status: RSVPStatus) => {
    if (myRSVP === status) {
      // Tapping the same status again removes the RSVP
      setRSVP(plan.id, null);
    } else {
      setRSVP(plan.id, status);

      // Show calendar prompt when RSVPing "Going" and plan is not already in calendar
      if (status === 'going' && hasConnectedCalendar && !isPlanInCalendar(plan.id)) {
        setTimeout(() => {
          Alert.alert(
            'Add to Calendar?',
            `Would you like to add "${plan.title}" to your ${CALENDAR_NAMES[defaultCalendar!]}?`,
            [
              { text: 'No', style: 'cancel' },
              {
                text: 'Yes',
                onPress: () => addPlanToCalendar(plan.id),
              },
            ]
          );
        }, 300); // Small delay so RSVP animation completes first
      }
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

  const formatMessageTime = (dateString: string): string => {
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
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleSendMessage = () => {
    if (!messageText.trim() || !plan) return;
    sendMessage(plan.id, messageText.trim());
    setMessageText('');
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

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.detailRow}>
            <View style={[styles.iconContainer, { backgroundColor: colors.accent + '20' }]}>
              <Ionicons name="eye" size={20} color={colors.accent} />
            </View>
            <View style={styles.detailContent}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Visible to</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>{getVisibilityText()}</Text>
            </View>
          </View>
        </View>

        {plan.notes && (
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.notesLabel, { color: colors.textSecondary }]}>Notes</Text>
            <Text style={[styles.notesText, { color: colors.text }]}>{plan.notes}</Text>
          </View>
        )}

        {/* RSVP Buttons */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Response</Text>
          <View style={styles.rsvpButtonGroup}>
            <Pressable
              style={[
                styles.rsvpOptionButton,
                { borderColor: myRSVP === 'going' ? colors.success : colors.border },
                myRSVP === 'going' && { backgroundColor: colors.success + '20' },
              ]}
              onPress={() => handleRSVPPress('going')}
            >
              <Ionicons
                name={myRSVP === 'going' ? 'checkmark-circle' : 'checkmark-circle-outline'}
                size={24}
                color={myRSVP === 'going' ? colors.success : colors.textSecondary}
              />
              <Text
                style={[
                  styles.rsvpOptionText,
                  { color: myRSVP === 'going' ? colors.success : colors.text },
                ]}
              >
                Going
              </Text>
              <Text style={[styles.rsvpOptionSubtext, { color: colors.textSecondary }]}>
                {"I'm in"}
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.rsvpOptionButton,
                { borderColor: myRSVP === 'maybe' ? colors.warning : colors.border },
                myRSVP === 'maybe' && { backgroundColor: colors.warning + '20' },
              ]}
              onPress={() => handleRSVPPress('maybe')}
            >
              <Ionicons
                name={myRSVP === 'maybe' ? 'help-circle' : 'help-circle-outline'}
                size={24}
                color={myRSVP === 'maybe' ? colors.warning : colors.textSecondary}
              />
              <Text
                style={[
                  styles.rsvpOptionText,
                  { color: myRSVP === 'maybe' ? colors.warning : colors.text },
                ]}
              >
                Maybe
              </Text>
              <Text style={[styles.rsvpOptionSubtext, { color: colors.textSecondary }]}>
                Not sure yet
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.rsvpOptionButton,
                { borderColor: myRSVP === 'interested' ? colors.accent : colors.border },
                myRSVP === 'interested' && { backgroundColor: colors.accent + '20' },
              ]}
              onPress={() => handleRSVPPress('interested')}
            >
              <Ionicons
                name={myRSVP === 'interested' ? 'eye' : 'eye-outline'}
                size={24}
                color={myRSVP === 'interested' ? colors.accent : colors.textSecondary}
              />
              <Text
                style={[
                  styles.rsvpOptionText,
                  { color: myRSVP === 'interested' ? colors.accent : colors.text },
                ]}
              >
                Interested
              </Text>
              <Text style={[styles.rsvpOptionSubtext, { color: colors.textSecondary }]}>
                Tracking
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Response Lists */}
        {(rsvpResponses.going.length > 0 || rsvpResponses.maybe.length > 0 || rsvpResponses.interested.length > 0) && (
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Responses</Text>

            {rsvpResponses.going.length > 0 && (
              <ResponseSection
                title={`Going (${rsvpResponses.going.length})`}
                users={rsvpResponses.going}
                color={colors.success}
                colors={colors}
              />
            )}

            {rsvpResponses.maybe.length > 0 && (
              <ResponseSection
                title={`Maybe (${rsvpResponses.maybe.length})`}
                users={rsvpResponses.maybe}
                color={colors.warning}
                colors={colors}
              />
            )}

            {rsvpResponses.interested.length > 0 && (
              <ResponseSection
                title={`Interested (${rsvpResponses.interested.length})`}
                users={rsvpResponses.interested}
                color={colors.accent}
                colors={colors}
              />
            )}
          </View>
        )}

        {/* Discussion Section */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.discussionHeader}>
            <Ionicons name="chatbubbles-outline" size={20} color={colors.accent} />
            <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>
              Discussion
            </Text>
            <Text style={[styles.messageCount, { color: colors.textSecondary }]}>
              {planMessages.length}
            </Text>
          </View>

          {planMessages.length === 0 ? (
            <View style={styles.noMessages}>
              <Text style={[styles.noMessagesText, { color: colors.textSecondary }]}>
                No messages yet. Start the conversation!
              </Text>
            </View>
          ) : (
            <View style={styles.messagesList}>
              {planMessages.map((msg) => {
                const sender = getUserById(msg.userId);
                const isMe = msg.userId === currentUser.id;
                return (
                  <View
                    key={msg.id}
                    style={[
                      styles.messageItem,
                      isMe && styles.messageItemMe,
                    ]}
                  >
                    {!isMe && sender && (
                      <Avatar user={sender} size={32} />
                    )}
                    <View style={[
                      styles.messageBubble,
                      isMe
                        ? { backgroundColor: colors.accent }
                        : { backgroundColor: colors.border },
                    ]}>
                      {!isMe && (
                        <Text style={[styles.messageSender, { color: colors.accent }]}>
                          {sender?.name || 'Unknown'}
                        </Text>
                      )}
                      <Text style={[
                        styles.messageText,
                        { color: isMe ? '#fff' : colors.text },
                      ]}>
                        {msg.text}
                      </Text>
                      <Text style={[
                        styles.messageTime,
                        { color: isMe ? 'rgba(255,255,255,0.7)' : colors.textSecondary },
                      ]}>
                        {formatMessageTime(msg.createdAt)}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          <View style={[styles.messageInputContainer, { borderTopColor: colors.border }]}>
            <TextInput
              style={[
                styles.messageInput,
                { backgroundColor: colors.background, color: colors.text, borderColor: colors.border },
              ]}
              placeholder="Type a message..."
              placeholderTextColor={colors.textSecondary}
              value={messageText}
              onChangeText={setMessageText}
              multiline
              maxLength={500}
            />
            <Pressable
              style={[
                styles.sendButton,
                { backgroundColor: messageText.trim() ? colors.accent : colors.border },
              ]}
              onPress={handleSendMessage}
              disabled={!messageText.trim()}
            >
              <Ionicons
                name="send"
                size={18}
                color={messageText.trim() ? '#fff' : colors.textSecondary}
              />
            </Pressable>
          </View>
        </View>

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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  rsvpButtonGroup: {
    flexDirection: 'row',
    gap: 10,
  },
  rsvpOptionButton: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  rsvpOptionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  rsvpOptionSubtext: {
    fontSize: 11,
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
  // Discussion styles
  discussionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  messageCount: {
    fontSize: 14,
    marginLeft: 'auto',
  },
  noMessages: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  noMessagesText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  messagesList: {
    gap: 12,
    marginBottom: 16,
  },
  messageItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  messageItemMe: {
    justifyContent: 'flex-end',
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 10,
    borderRadius: 12,
  },
  messageSender: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
  },
  messageInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  messageInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    fontSize: 15,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
