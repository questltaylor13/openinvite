import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Plan, User, RSVP, RSVPStatus, Group, GroupType, GroupInvite, ConnectedCalendar, CalendarSync, CalendarProvider, AppNotification, PlanMessage, PlanRecurrence, RecurrenceType, FriendRequest } from '@/types/plan';

// Mock emails for connected calendars
const MOCK_EMAILS: Record<CalendarProvider, string> = {
  google: 'you@gmail.com',
  apple: 'you@icloud.com',
  outlook: 'you@outlook.com',
};

interface PlansContextType {
  plans: Plan[];
  addPlan: (plan: Omit<Plan, 'id' | 'createdAt'>) => Promise<void>;
  updatePlan: (id: string, updates: Partial<Plan>) => Promise<void>;
  deletePlan: (id: string) => Promise<void>;
  getPlanById: (id: string) => Plan | undefined;
  isLoading: boolean;
  // RSVP functions
  rsvps: RSVP[];
  users: User[];
  currentUser: User;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  setRSVP: (planId: string, status: RSVPStatus | null) => Promise<{ success: boolean; error?: string }>;
  getMyRSVP: (planId: string) => RSVPStatus | null;
  getRSVPsForPlan: (planId: string) => { going: User[]; maybe: User[]; interested: User[] };
  // Group functions
  groups: Group[];
  sharedGroups: Group[];
  personalGroups: Group[];
  addGroup: (name: string, type: GroupType, options?: { memberIds?: string[]; description?: string }) => Promise<void>;
  updateGroup: (id: string, updates: Partial<Group>) => Promise<void>;
  deleteGroup: (id: string) => Promise<void>;
  leaveSharedGroup: (groupId: string) => Promise<void>;
  getGroupById: (id: string) => Group | undefined;
  getGroupNames: (groupIds: string[]) => string[];
  getUsersInGroup: (groupId: string) => User[];
  // Invite functions
  pendingInvites: GroupInvite[];
  inviteToGroup: (groupId: string, userIds: string[]) => Promise<void>;
  acceptInvite: (inviteId: string) => Promise<void>;
  declineInvite: (inviteId: string) => Promise<void>;
  // Calendar functions
  connectedCalendars: ConnectedCalendar[];
  calendarSyncs: CalendarSync[];
  toggleCalendarConnection: (provider: CalendarProvider) => void;
  addPlanToCalendar: (planId: string, provider?: CalendarProvider) => void;
  removePlanFromCalendar: (planId: string) => void;
  isPlanInCalendar: (planId: string) => boolean;
  getDefaultCalendar: () => CalendarProvider | null;
  // Notification functions
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (notification: Omit<AppNotification, 'id' | 'createdAt'>) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  // Discover functions
  discoverablePlans: Plan[];
  getDiscoverFriendsPlans: () => Plan[];
  getDiscoverGroupPlans: () => { plan: Plan; groupName: string }[];
  getUserById: (userId: string) => User | undefined;
  // Message functions
  messages: PlanMessage[];
  getMessagesForPlan: (planId: string) => PlanMessage[];
  sendMessage: (planId: string, text: string) => Promise<void>;
  // Recurrence functions
  getSeriesPlans: (seriesId: string) => Plan[];
  getUpcomingOccurrences: (planId: string) => Plan[];
  updateSeriesPlans: (seriesId: string, updates: Partial<Plan>, fromInstanceIndex?: number) => Promise<void>;
  getRecurrenceLabel: (plan: Plan) => string;
  // Friend functions
  friends: string[];
  friendRequests: FriendRequest[];
  sendFriendRequest: (userId: string) => Promise<void>;
  acceptFriendRequest: (requestId: string) => Promise<void>;
  declineFriendRequest: (requestId: string) => Promise<void>;
  removeFriend: (userId: string) => Promise<void>;
  getFriends: () => User[];
  getPendingFriendRequests: () => FriendRequest[];
  searchUsers: (query: string) => User[];
  isFriend: (userId: string) => boolean;
  hasPendingRequest: (userId: string) => boolean;
  // Refresh function
  refreshData: () => Promise<void>;
}

const PlansContext = createContext<PlansContextType | undefined>(undefined);

// Helper function to add days to a date
const addDays = (dateStr: string, days: number): string => {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

// Helper function to add months to a date
const addMonths = (dateStr: string, months: number): string => {
  const date = new Date(dateStr);
  date.setMonth(date.getMonth() + months);
  return date.toISOString().split('T')[0];
};

// Helper function to calculate next occurrence date
const getNextOccurrenceDate = (baseDate: string, recurrenceType: RecurrenceType, customDays?: number): string => {
  switch (recurrenceType) {
    case 'weekly':
      return addDays(baseDate, 7);
    case 'biweekly':
      return addDays(baseDate, 14);
    case 'monthly':
      return addMonths(baseDate, 1);
    case 'custom':
      return addDays(baseDate, customDays || 7);
    default:
      return baseDate;
  }
};

// Helper function to get recurrence label
const getRecurrenceLabelText = (recurrence: PlanRecurrence | undefined): string => {
  if (!recurrence || recurrence.type === 'none') return '';

  switch (recurrence.type) {
    case 'weekly':
      return 'Repeats weekly';
    case 'biweekly':
      return 'Repeats every 2 weeks';
    case 'monthly':
      return 'Repeats monthly';
    case 'custom':
      return `Repeats every ${recurrence.customDays || 7} days`;
    default:
      return '';
  }
};

// Convert database row to Plan object
const dbToPlan = (row: any): Plan => ({
  id: row.id,
  title: row.title,
  date: row.date,
  time: row.time,
  location: row.location,
  totalSpots: row.total_spots,
  filledSpots: row.filled_spots,
  rsvpDeadline: row.rsvp_deadline,
  notes: row.notes || undefined,
  createdAt: row.created_at,
  createdBy: row.created_by || undefined,
  visibility: row.visibility || undefined,
  recurrence: row.recurrence || undefined,
});

// Convert Plan to database row
const planToDb = (plan: Omit<Plan, 'id' | 'createdAt'>, userId: string) => ({
  title: plan.title,
  date: plan.date,
  time: plan.time,
  location: plan.location,
  total_spots: plan.totalSpots,
  filled_spots: plan.filledSpots,
  rsvp_deadline: plan.rsvpDeadline,
  notes: plan.notes || null,
  created_by: userId,
  visibility: plan.visibility || null,
  recurrence: plan.recurrence || null,
});

// Convert database row to User object
const dbToUser = (row: any): User => ({
  id: row.id,
  name: row.name,
  avatarColor: row.avatar_color,
  bio: row.bio || undefined,
  username: row.username || undefined,
  phone: row.phone || undefined,
  email: row.email || undefined,
});

// Convert database row to Group object
const dbToGroup = (row: any, memberIds: string[]): Group => ({
  id: row.id,
  name: row.name,
  memberIds,
  createdAt: row.created_at,
  type: row.type,
  createdBy: row.created_by || undefined,
  description: row.description || undefined,
});

// Default user for when not logged in
const defaultUser: User = {
  id: '',
  name: 'Guest',
  avatarColor: '#6366F1',
};

export function PlansProvider({ children }: { children: ReactNode }) {
  const { user: authUser, session } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [pendingInvites, setPendingInvites] = useState<GroupInvite[]>([]);
  const [connectedCalendars, setConnectedCalendars] = useState<ConnectedCalendar[]>([]);
  const [calendarSyncs, setCalendarSyncs] = useState<CalendarSync[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [messages, setMessages] = useState<PlanMessage[]>([]);
  const [friends, setFriends] = useState<string[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [discoverablePlans, setDiscoverablePlans] = useState<Plan[]>([]);

  const currentUser = authUser || defaultUser;

  // Load all data from Supabase
  const loadData = useCallback(async () => {
    if (!session?.user?.id) {
      setIsLoading(false);
      return;
    }

    const userId = session.user.id;

    try {
      // Fetch plans created by user or visible to them
      const { data: plansData } = await supabase
        .from('plans')
        .select('*')
        .or(`created_by.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (plansData) {
        setPlans(plansData.map(dbToPlan));
      }

      // Fetch all users (for displaying RSVPs, etc.)
      const { data: usersData } = await supabase
        .from('users')
        .select('*');

      if (usersData) {
        setUsers(usersData.map(dbToUser));
      }

      // Fetch user's RSVPs
      const { data: rsvpsData } = await supabase
        .from('rsvps')
        .select('*')
        .eq('user_id', userId);

      if (rsvpsData) {
        setRsvps(rsvpsData.map(r => ({
          userId: r.user_id,
          planId: r.plan_id,
          status: r.status as RSVPStatus,
        })));
      }

      // Fetch groups user is a member of
      const { data: membershipData } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', userId);

      if (membershipData) {
        const groupIds = membershipData.map(m => m.group_id);
        if (groupIds.length > 0) {
          const { data: groupsData } = await supabase
            .from('groups')
            .select('*')
            .in('id', groupIds);

          if (groupsData) {
            // Fetch all members for each group
            const groupsWithMembers = await Promise.all(
              groupsData.map(async (g) => {
                const { data: members } = await supabase
                  .from('group_members')
                  .select('user_id')
                  .eq('group_id', g.id);
                return dbToGroup(g, members?.map(m => m.user_id) || []);
              })
            );
            setGroups(groupsWithMembers);
          }
        }
      }

      // Fetch pending group invites
      const { data: invitesData } = await supabase
        .from('group_invites')
        .select('*, groups(name)')
        .eq('invited_user_id', userId)
        .eq('status', 'pending');

      if (invitesData) {
        setPendingInvites(invitesData.map(inv => ({
          id: inv.id,
          groupId: inv.group_id,
          groupName: inv.groups?.name || 'Unknown Group',
          invitedUserId: inv.invited_user_id,
          invitedByUserId: inv.invited_by_user_id,
          invitedByName: '', // Will be filled from users
          createdAt: inv.created_at,
        })));
      }

      // Fetch friends
      const { data: friendsData } = await supabase
        .from('friends')
        .select('*')
        .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
        .eq('status', 'accepted');

      if (friendsData) {
        const friendIds = friendsData.map(f =>
          f.user_id === userId ? f.friend_id : f.user_id
        );
        setFriends(friendIds);
      }

      // Fetch friend requests
      const { data: requestsData } = await supabase
        .from('friends')
        .select('*')
        .eq('friend_id', userId)
        .eq('status', 'pending');

      if (requestsData) {
        setFriendRequests(requestsData.map(r => ({
          id: r.id,
          fromUserId: r.user_id,
          toUserId: r.friend_id,
          status: r.status,
          createdAt: r.created_at,
        })));
      }

      // Fetch notifications
      const { data: notificationsData } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (notificationsData) {
        setNotifications(notificationsData.map(n => ({
          id: n.id,
          type: n.type,
          title: n.title,
          message: n.message,
          read: n.read,
          createdAt: n.created_at,
          planId: n.plan_id || undefined,
          planTitle: n.plan_title || undefined,
          groupId: n.group_id || undefined,
          groupName: n.group_name || undefined,
          userId: n.related_user_id || undefined,
          userName: n.related_user_name || undefined,
          rsvpStatus: n.rsvp_status || undefined,
        })));
      }

      // Fetch messages for user's plans
      const planIds = plansData?.map(p => p.id) || [];
      if (planIds.length > 0) {
        const { data: messagesData } = await supabase
          .from('messages')
          .select('*')
          .in('plan_id', planIds)
          .order('created_at', { ascending: true });

        if (messagesData) {
          setMessages(messagesData.map(m => ({
            id: m.id,
            planId: m.plan_id,
            userId: m.user_id,
            text: m.text,
            createdAt: m.created_at,
          })));
        }
      }

      // Fetch discoverable plans (from friends)
      if (friends.length > 0) {
        const { data: discoverData } = await supabase
          .from('plans')
          .select('*')
          .in('created_by', friends)
          .order('date', { ascending: true });

        if (discoverData) {
          setDiscoverablePlans(discoverData.map(dbToPlan));
        }
      }

    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const refreshData = async () => {
    setIsLoading(true);
    await loadData();
  };

  // Plan functions
  const addPlan = async (planData: Omit<Plan, 'id' | 'createdAt'>) => {
    if (!session?.user?.id) return;

    const { data, error } = await supabase
      .from('plans')
      .insert(planToDb(planData, session.user.id))
      .select()
      .single();

    if (error) {
      console.error('Failed to add plan:', error);
      return;
    }

    if (data) {
      setPlans(prev => [dbToPlan(data), ...prev]);
    }
  };

  const updatePlan = async (id: string, updates: Partial<Plan>) => {
    const dbUpdates: any = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.date !== undefined) dbUpdates.date = updates.date;
    if (updates.time !== undefined) dbUpdates.time = updates.time;
    if (updates.location !== undefined) dbUpdates.location = updates.location;
    if (updates.totalSpots !== undefined) dbUpdates.total_spots = updates.totalSpots;
    if (updates.filledSpots !== undefined) dbUpdates.filled_spots = updates.filledSpots;
    if (updates.rsvpDeadline !== undefined) dbUpdates.rsvp_deadline = updates.rsvpDeadline;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
    if (updates.visibility !== undefined) dbUpdates.visibility = updates.visibility;
    if (updates.recurrence !== undefined) dbUpdates.recurrence = updates.recurrence;

    const { error } = await supabase
      .from('plans')
      .update(dbUpdates)
      .eq('id', id);

    if (error) {
      console.error('Failed to update plan:', error);
      return;
    }

    setPlans(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deletePlan = async (id: string) => {
    const { error } = await supabase
      .from('plans')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Failed to delete plan:', error);
      return;
    }

    setPlans(prev => prev.filter(p => p.id !== id));
  };

  const getPlanById = (id: string) => {
    return plans.find(p => p.id === id) || discoverablePlans.find(p => p.id === id);
  };

  // RSVP functions
  const setRSVP = async (planId: string, status: RSVPStatus | null): Promise<{ success: boolean; error?: string }> => {
    if (!session?.user?.id) return { success: false, error: 'Not logged in' };

    const plan = getPlanById(planId);
    const existingRsvp = rsvps.find(r => r.userId === session.user.id && r.planId === planId);
    const wasGoing = existingRsvp?.status === 'going';
    const willBeGoing = status === 'going';

    // Check if plan is full
    if (willBeGoing && !wasGoing && plan) {
      if (plan.filledSpots >= plan.totalSpots) {
        return { success: false, error: 'This plan is full' };
      }
    }

    if (status === null) {
      // Remove RSVP
      const { error } = await supabase
        .from('rsvps')
        .delete()
        .eq('user_id', session.user.id)
        .eq('plan_id', planId);

      if (error) {
        console.error('Failed to remove RSVP:', error);
        return { success: false, error: 'Failed to remove RSVP' };
      }

      setRsvps(prev => prev.filter(r => !(r.userId === session.user.id && r.planId === planId)));
    } else {
      // Upsert RSVP
      const { error } = await supabase
        .from('rsvps')
        .upsert({
          user_id: session.user.id,
          plan_id: planId,
          status,
        }, {
          onConflict: 'user_id,plan_id',
        });

      if (error) {
        console.error('Failed to set RSVP:', error);
        return { success: false, error: 'Failed to set RSVP' };
      }

      setRsvps(prev => {
        const existing = prev.findIndex(r => r.userId === session.user.id && r.planId === planId);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = { userId: session.user.id, planId, status };
          return updated;
        }
        return [...prev, { userId: session.user.id, planId, status }];
      });
    }

    // The trigger in the database should update filled_spots automatically
    // But we also update locally for immediate UI feedback
    if (plan && wasGoing !== willBeGoing) {
      const spotsChange = willBeGoing ? 1 : -1;
      const newFilledSpots = Math.max(0, plan.filledSpots + spotsChange);
      setPlans(prev => prev.map(p => p.id === planId ? { ...p, filledSpots: newFilledSpots } : p));
    }

    return { success: true };
  };

  const getMyRSVP = (planId: string): RSVPStatus | null => {
    const myRsvp = rsvps.find(r => r.userId === currentUser.id && r.planId === planId);
    return myRsvp?.status ?? null;
  };

  const getRSVPsForPlan = (planId: string) => {
    const planRsvps = rsvps.filter(r => r.planId === planId);
    const allUsers = [currentUser, ...users];

    const getUserById = (userId: string) => allUsers.find(u => u.id === userId);

    const going: User[] = [];
    const maybe: User[] = [];
    const interested: User[] = [];

    planRsvps.forEach(rsvp => {
      const user = getUserById(rsvp.userId);
      if (!user) return;

      switch (rsvp.status) {
        case 'going':
          going.push(user);
          break;
        case 'maybe':
          maybe.push(user);
          break;
        case 'interested':
          interested.push(user);
          break;
      }
    });

    return { going, maybe, interested };
  };

  // Profile functions
  const updateProfile = async (updates: Partial<User>) => {
    if (!session?.user?.id) return;

    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.avatarColor !== undefined) dbUpdates.avatar_color = updates.avatarColor;
    if (updates.bio !== undefined) dbUpdates.bio = updates.bio;
    if (updates.username !== undefined) dbUpdates.username = updates.username;
    if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
    if (updates.email !== undefined) dbUpdates.email = updates.email;

    const { error } = await supabase
      .from('users')
      .update(dbUpdates)
      .eq('id', session.user.id);

    if (error) {
      console.error('Failed to update profile:', error);
    }
  };

  // Group functions
  const sharedGroups = groups.filter(g => g.type === 'shared');
  const personalGroups = groups.filter(g => g.type === 'personal');

  const addGroup = async (name: string, type: GroupType, options?: { memberIds?: string[]; description?: string }) => {
    if (!session?.user?.id) return;

    const { data, error } = await supabase
      .from('groups')
      .insert({
        name,
        type,
        created_by: session.user.id,
        description: options?.description || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to add group:', error);
      return;
    }

    if (data) {
      // Add additional members if provided
      if (options?.memberIds && options.memberIds.length > 0) {
        await supabase
          .from('group_members')
          .insert(options.memberIds.map(userId => ({
            group_id: data.id,
            user_id: userId,
          })));
      }

      const memberIds = [session.user.id, ...(options?.memberIds || [])];
      setGroups(prev => [...prev, dbToGroup(data, memberIds)]);
    }
  };

  const updateGroup = async (id: string, updates: Partial<Group>) => {
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.description !== undefined) dbUpdates.description = updates.description;

    const { error } = await supabase
      .from('groups')
      .update(dbUpdates)
      .eq('id', id);

    if (error) {
      console.error('Failed to update group:', error);
      return;
    }

    setGroups(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
  };

  const deleteGroup = async (id: string) => {
    const { error } = await supabase
      .from('groups')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Failed to delete group:', error);
      return;
    }

    setGroups(prev => prev.filter(g => g.id !== id));
  };

  const leaveSharedGroup = async (groupId: string) => {
    if (!session?.user?.id) return;

    const { error } = await supabase
      .from('group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', session.user.id);

    if (error) {
      console.error('Failed to leave group:', error);
      return;
    }

    setGroups(prev => prev.filter(g => g.id !== groupId));
  };

  const getGroupById = (id: string) => groups.find(g => g.id === id);

  const getGroupNames = (groupIds: string[]): string[] => {
    return groupIds
      .map(id => groups.find(g => g.id === id)?.name)
      .filter((name): name is string => !!name);
  };

  const getUsersInGroup = (groupId: string): User[] => {
    const group = groups.find(g => g.id === groupId);
    if (!group) return [];
    return group.memberIds
      .map(userId => users.find(u => u.id === userId))
      .filter((user): user is User => !!user);
  };

  // Invite functions
  const inviteToGroup = async (groupId: string, userIds: string[]) => {
    if (!session?.user?.id) return;

    const group = groups.find(g => g.id === groupId);
    if (!group || group.type !== 'shared') return;

    const invites = userIds
      .filter(userId => !group.memberIds.includes(userId))
      .map(userId => ({
        group_id: groupId,
        invited_user_id: userId,
        invited_by_user_id: session.user.id,
      }));

    if (invites.length > 0) {
      await supabase.from('group_invites').insert(invites);
    }
  };

  const acceptInvite = async (inviteId: string) => {
    if (!session?.user?.id) return;

    const invite = pendingInvites.find(inv => inv.id === inviteId);
    if (!invite) return;

    // Update invite status
    await supabase
      .from('group_invites')
      .update({ status: 'accepted' })
      .eq('id', inviteId);

    // Add user to group
    await supabase
      .from('group_members')
      .insert({
        group_id: invite.groupId,
        user_id: session.user.id,
      });

    setPendingInvites(prev => prev.filter(inv => inv.id !== inviteId));
    await refreshData();
  };

  const declineInvite = async (inviteId: string) => {
    await supabase
      .from('group_invites')
      .update({ status: 'declined' })
      .eq('id', inviteId);

    setPendingInvites(prev => prev.filter(inv => inv.id !== inviteId));
  };

  // Calendar functions (local only for now)
  const toggleCalendarConnection = (provider: CalendarProvider) => {
    setConnectedCalendars(prev => {
      const existing = prev.find(c => c.provider === provider);
      if (existing) {
        return prev.map(c => c.provider === provider ? { ...c, connected: !c.connected } : c);
      }
      return [...prev, { provider, connected: true, email: MOCK_EMAILS[provider] }];
    });
  };

  const getDefaultCalendar = (): CalendarProvider | null => {
    const connected = connectedCalendars.filter(c => c.connected);
    return connected.length > 0 ? connected[0].provider : null;
  };

  const addPlanToCalendar = (planId: string, provider?: CalendarProvider) => {
    const calendarProvider = provider || getDefaultCalendar();
    if (!calendarProvider) return;

    if (calendarSyncs.find(s => s.planId === planId)) return;

    setCalendarSyncs(prev => [...prev, {
      planId,
      provider: calendarProvider,
      syncedAt: new Date().toISOString(),
    }]);
  };

  const removePlanFromCalendar = (planId: string) => {
    setCalendarSyncs(prev => prev.filter(s => s.planId !== planId));
  };

  const isPlanInCalendar = (planId: string): boolean => {
    return calendarSyncs.some(s => s.planId === planId);
  };

  // Notification functions
  const unreadCount = notifications.filter(n => !n.read).length;

  const addNotification = async (notificationData: Omit<AppNotification, 'id' | 'createdAt'>) => {
    if (!session?.user?.id) return;

    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: session.user.id,
        type: notificationData.type,
        title: notificationData.title,
        message: notificationData.message,
        read: false,
        plan_id: notificationData.planId || null,
        plan_title: notificationData.planTitle || null,
        group_id: notificationData.groupId || null,
        group_name: notificationData.groupName || null,
        related_user_id: notificationData.userId || null,
        related_user_name: notificationData.userName || null,
        rsvp_status: notificationData.rsvpStatus || null,
      })
      .select()
      .single();

    if (!error && data) {
      setNotifications(prev => [{
        id: data.id,
        type: data.type,
        title: data.title,
        message: data.message,
        read: data.read,
        createdAt: data.created_at,
        planId: data.plan_id || undefined,
        planTitle: data.plan_title || undefined,
        groupId: data.group_id || undefined,
        groupName: data.group_name || undefined,
        userId: data.related_user_id || undefined,
        userName: data.related_user_name || undefined,
        rsvpStatus: data.rsvp_status || undefined,
      }, ...prev]);
    }
  };

  const markAsRead = async (notificationId: string) => {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n));
  };

  const markAllAsRead = async () => {
    if (!session?.user?.id) return;

    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', session.user.id);

    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = async (notificationId: string) => {
    await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const clearAllNotifications = async () => {
    if (!session?.user?.id) return;

    await supabase
      .from('notifications')
      .delete()
      .eq('user_id', session.user.id);

    setNotifications([]);
  };

  // Discover functions
  const getUserById = (userId: string): User | undefined => {
    if (userId === currentUser.id) return currentUser;
    return users.find(u => u.id === userId);
  };

  const getDiscoverFriendsPlans = (): Plan[] => {
    const myRsvpPlanIds = rsvps
      .filter(r => r.userId === currentUser.id)
      .map(r => r.planId);

    return discoverablePlans
      .filter(plan => {
        const visibility = plan.visibility?.type;
        return visibility === 'friends' || visibility === 'everyone' || !visibility;
      })
      .filter(plan => !myRsvpPlanIds.includes(plan.id))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const getDiscoverGroupPlans = (): { plan: Plan; groupName: string }[] => {
    const myGroupIds = sharedGroups.map(g => g.id);
    const myRsvpPlanIds = rsvps
      .filter(r => r.userId === currentUser.id)
      .map(r => r.planId);

    return discoverablePlans
      .filter(plan => {
        if (plan.visibility?.type !== 'groups') return false;
        const planGroupIds = plan.visibility.groupIds || [];
        return planGroupIds.some(gId => myGroupIds.includes(gId));
      })
      .filter(plan => !myRsvpPlanIds.includes(plan.id))
      .map(plan => {
        const planGroupIds = plan.visibility?.groupIds || [];
        const matchingGroup = sharedGroups.find(g => planGroupIds.includes(g.id));
        return {
          plan,
          groupName: matchingGroup?.name || 'Unknown Group',
        };
      })
      .sort((a, b) => new Date(a.plan.date).getTime() - new Date(b.plan.date).getTime());
  };

  // Message functions
  const getMessagesForPlan = (planId: string): PlanMessage[] => {
    return messages
      .filter(m => m.planId === planId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  };

  const sendMessage = async (planId: string, text: string) => {
    if (!session?.user?.id) return;

    const { data, error } = await supabase
      .from('messages')
      .insert({
        plan_id: planId,
        user_id: session.user.id,
        text,
      })
      .select()
      .single();

    if (!error && data) {
      setMessages(prev => [...prev, {
        id: data.id,
        planId: data.plan_id,
        userId: data.user_id,
        text: data.text,
        createdAt: data.created_at,
      }]);
    }
  };

  // Recurrence functions
  const getSeriesPlans = (seriesId: string): Plan[] => {
    return plans
      .filter(p => p.recurrence?.seriesId === seriesId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const getUpcomingOccurrences = (planId: string): Plan[] => {
    const plan = getPlanById(planId);
    if (!plan?.recurrence?.seriesId) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return plans
      .filter(p => p.recurrence?.seriesId === plan.recurrence?.seriesId)
      .filter(p => new Date(p.date) >= today)
      .filter(p => p.id !== planId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5);
  };

  const updateSeriesPlans = async (seriesId: string, updates: Partial<Plan>, fromInstanceIndex?: number) => {
    const seriesToUpdate = plans.filter(p => {
      if (p.recurrence?.seriesId !== seriesId) return false;
      if (fromInstanceIndex !== undefined && (p.recurrence?.instanceIndex ?? 0) < fromInstanceIndex) {
        return false;
      }
      return true;
    });

    const { date, time, rsvpDeadline, filledSpots, id, createdAt, recurrence, ...safeUpdates } = updates;

    for (const plan of seriesToUpdate) {
      await updatePlan(plan.id, safeUpdates);
    }
  };

  const getRecurrenceLabel = (plan: Plan): string => {
    return getRecurrenceLabelText(plan.recurrence);
  };

  // Friend functions
  const sendFriendRequest = async (userId: string) => {
    if (!session?.user?.id) return;
    if (friends.includes(userId)) return;

    const { error } = await supabase
      .from('friends')
      .insert({
        user_id: session.user.id,
        friend_id: userId,
        status: 'pending',
      });

    if (error) {
      console.error('Failed to send friend request:', error);
    }
  };

  const acceptFriendRequest = async (requestId: string) => {
    const request = friendRequests.find(r => r.id === requestId);
    if (!request) return;

    const { error } = await supabase
      .from('friends')
      .update({ status: 'accepted' })
      .eq('id', requestId);

    if (error) {
      console.error('Failed to accept friend request:', error);
      return;
    }

    setFriends(prev => [...prev, request.fromUserId]);
    setFriendRequests(prev => prev.filter(r => r.id !== requestId));
  };

  const declineFriendRequest = async (requestId: string) => {
    const { error } = await supabase
      .from('friends')
      .update({ status: 'declined' })
      .eq('id', requestId);

    if (!error) {
      setFriendRequests(prev => prev.filter(r => r.id !== requestId));
    }
  };

  const removeFriend = async (userId: string) => {
    if (!session?.user?.id) return;

    await supabase
      .from('friends')
      .delete()
      .or(`and(user_id.eq.${session.user.id},friend_id.eq.${userId}),and(user_id.eq.${userId},friend_id.eq.${session.user.id})`);

    setFriends(prev => prev.filter(id => id !== userId));
  };

  const getFriends = (): User[] => {
    return friends
      .map(id => users.find(u => u.id === id))
      .filter((u): u is User => u !== undefined);
  };

  const getPendingFriendRequests = (): FriendRequest[] => {
    return friendRequests.filter(r => r.status === 'pending');
  };

  const searchUsers = (query: string): User[] => {
    if (!query.trim()) return [];
    const lowerQuery = query.toLowerCase();
    return users.filter(user =>
      user.id !== currentUser.id &&
      (user.name.toLowerCase().includes(lowerQuery) ||
        (user.username && user.username.toLowerCase().includes(lowerQuery)))
    );
  };

  const isFriend = (userId: string): boolean => {
    return friends.includes(userId);
  };

  const hasPendingRequest = (userId: string): boolean => {
    return friendRequests.some(r =>
      r.status === 'pending' &&
      ((r.fromUserId === currentUser.id && r.toUserId === userId) ||
        (r.fromUserId === userId && r.toUserId === currentUser.id))
    );
  };

  return (
    <PlansContext.Provider
      value={{
        plans,
        addPlan,
        updatePlan,
        deletePlan,
        getPlanById,
        isLoading,
        rsvps,
        users,
        currentUser,
        updateProfile,
        setRSVP,
        getMyRSVP,
        getRSVPsForPlan,
        groups,
        sharedGroups,
        personalGroups,
        addGroup,
        updateGroup,
        deleteGroup,
        leaveSharedGroup,
        getGroupById,
        getGroupNames,
        getUsersInGroup,
        pendingInvites,
        inviteToGroup,
        acceptInvite,
        declineInvite,
        connectedCalendars,
        calendarSyncs,
        toggleCalendarConnection,
        addPlanToCalendar,
        removePlanFromCalendar,
        isPlanInCalendar,
        getDefaultCalendar,
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAllNotifications,
        discoverablePlans,
        getDiscoverFriendsPlans,
        getDiscoverGroupPlans,
        getUserById,
        messages,
        getMessagesForPlan,
        sendMessage,
        getSeriesPlans,
        getUpcomingOccurrences,
        updateSeriesPlans,
        getRecurrenceLabel,
        friends,
        friendRequests,
        sendFriendRequest,
        acceptFriendRequest,
        declineFriendRequest,
        removeFriend,
        getFriends,
        getPendingFriendRequests,
        searchUsers,
        isFriend,
        hasPendingRequest,
        refreshData,
      }}
    >
      {children}
    </PlansContext.Provider>
  );
}

export function usePlans() {
  const context = useContext(PlansContext);
  if (!context) {
    throw new Error('usePlans must be used within a PlansProvider');
  }
  return context;
}
