export type VisibilityType = 'everyone' | 'friends' | 'groups' | 'people';

export interface PlanVisibility {
  type: VisibilityType;
  groupIds?: string[];   // When type is 'groups'
  userIds?: string[];    // When type is 'people'
}

// Recurrence types
export type RecurrenceType = 'none' | 'weekly' | 'biweekly' | 'monthly' | 'custom';

export type RecurrenceEndType = 'never' | 'after' | 'on_date';

export interface RecurrenceEnd {
  type: RecurrenceEndType;
  occurrences?: number;  // When type is 'after'
  endDate?: string;      // When type is 'on_date' (ISO date string)
}

export interface PlanRecurrence {
  type: RecurrenceType;
  customDays?: number;   // When type is 'custom' - interval in days
  end: RecurrenceEnd;
  seriesId?: string;     // Groups related recurring plans together
  instanceIndex?: number; // 0 = original, 1+ = generated occurrences
}

export interface Plan {
  id: string;
  title: string;
  date: string; // ISO date string
  time: string; // HH:MM format
  location: string;
  totalSpots: number;
  filledSpots: number;
  rsvpDeadline: string; // ISO date string
  notes?: string;
  createdAt: string;
  createdBy?: string; // User ID of creator (defaults to 'me' if not set)
  visibility?: PlanVisibility; // Defaults to 'everyone' if not set
  recurrence?: PlanRecurrence; // Recurring plan settings
}

export type GroupType = 'shared' | 'personal';

export interface Group {
  id: string;
  name: string;
  memberIds: string[]; // User IDs
  createdAt: string;
  type: GroupType; // 'shared' = invited/added groups, 'personal' = your own organization
  createdBy?: string; // User ID who created the group (for personal groups)
  description?: string; // Optional description for shared groups
}

export interface PlanFormData {
  title: string;
  date: Date;
  time: Date;
  location: string;
  totalSpots: string;
  rsvpDeadline: Date;
  notes: string;
}

export interface User {
  id: string;
  name: string;
  avatarColor: string;
  bio?: string;
  username?: string;
  phone?: string;
  email?: string;
}

// Friend relationship types
export type FriendRequestStatus = 'pending' | 'accepted' | 'declined';

export interface FriendRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: FriendRequestStatus;
  createdAt: string;
}

export type RSVPStatus = 'going' | 'maybe' | 'interested';

export interface RSVP {
  userId: string;
  planId: string;
  status: RSVPStatus;
}

export interface GroupInvite {
  id: string;
  groupId: string;
  groupName: string;
  invitedUserId: string; // The user being invited
  invitedByUserId: string; // Who sent the invite
  invitedByName: string;
  createdAt: string;
}

// Calendar types
export type CalendarProvider = 'google' | 'apple' | 'outlook';

export interface ConnectedCalendar {
  provider: CalendarProvider;
  connected: boolean;
  email?: string; // Mock email for display
}

export interface CalendarSync {
  planId: string;
  provider: CalendarProvider;
  syncedAt: string;
}

// Plan message types
export interface PlanMessage {
  id: string;
  planId: string;
  userId: string;
  text: string;
  createdAt: string;
}

// Notification types
export type NotificationType = 'rsvp' | 'group_invite' | 'plan_reminder' | 'group_accepted' | 'friend_request' | 'friend_accepted';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  // Related data
  planId?: string;
  planTitle?: string;
  groupId?: string;
  groupName?: string;
  userId?: string;
  userName?: string;
  rsvpStatus?: RSVPStatus;
}
