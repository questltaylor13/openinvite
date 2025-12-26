import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Plan, User, RSVP, RSVPStatus, Group, GroupType, GroupInvite, ConnectedCalendar, CalendarSync, CalendarProvider, AppNotification, PlanMessage } from '@/types/plan';
import { mockPlans, mockUsers, mockRSVPs, mockGroups, mockGroupInvites, otherSharedGroups, currentUser, mockNotifications, mockDiscoverablePlans, mockPlanMessages } from '@/utils/mock-data';

const STORAGE_KEY = '@openinvite_plans';
const RSVP_STORAGE_KEY = '@openinvite_rsvps';
const GROUPS_STORAGE_KEY = '@openinvite_groups';
const INVITES_STORAGE_KEY = '@openinvite_invites';
const OTHER_GROUPS_STORAGE_KEY = '@openinvite_other_groups';
const CALENDARS_STORAGE_KEY = '@openinvite_calendars';
const CALENDAR_SYNCS_STORAGE_KEY = '@openinvite_calendar_syncs';
const NOTIFICATIONS_STORAGE_KEY = '@openinvite_notifications';
const MESSAGES_STORAGE_KEY = '@openinvite_messages';

// Mock emails for connected calendars
const MOCK_EMAILS: Record<CalendarProvider, string> = {
  google: 'you@gmail.com',
  apple: 'you@icloud.com',
  outlook: 'you@outlook.com',
};

interface PlansContextType {
  plans: Plan[];
  addPlan: (plan: Omit<Plan, 'id' | 'createdAt'>) => void;
  updatePlan: (id: string, updates: Partial<Plan>) => void;
  deletePlan: (id: string) => void;
  getPlanById: (id: string) => Plan | undefined;
  isLoading: boolean;
  // RSVP functions
  rsvps: RSVP[];
  users: User[];
  currentUser: User;
  setRSVP: (planId: string, status: RSVPStatus | null) => void;
  getMyRSVP: (planId: string) => RSVPStatus | null;
  getRSVPsForPlan: (planId: string) => { going: User[]; maybe: User[]; interested: User[] };
  // Group functions
  groups: Group[];
  sharedGroups: Group[];
  personalGroups: Group[];
  addGroup: (name: string, type: GroupType, options?: { memberIds?: string[]; description?: string }) => void;
  updateGroup: (id: string, updates: Partial<Group>) => void;
  deleteGroup: (id: string) => void;
  leaveSharedGroup: (groupId: string) => void;
  getGroupById: (id: string) => Group | undefined;
  getGroupNames: (groupIds: string[]) => string[];
  getUsersInGroup: (groupId: string) => User[];
  // Invite functions
  pendingInvites: GroupInvite[];
  inviteToGroup: (groupId: string, userIds: string[]) => void;
  acceptInvite: (inviteId: string) => void;
  declineInvite: (inviteId: string) => void;
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
  addNotification: (notification: Omit<AppNotification, 'id' | 'createdAt'>) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (notificationId: string) => void;
  clearAllNotifications: () => void;
  // Discover functions
  discoverablePlans: Plan[];
  getDiscoverFriendsPlans: () => Plan[];
  getDiscoverGroupPlans: () => { plan: Plan; groupName: string }[];
  getUserById: (userId: string) => User | undefined;
  // Message functions
  messages: PlanMessage[];
  getMessagesForPlan: (planId: string) => PlanMessage[];
  sendMessage: (planId: string, text: string) => void;
}

const PlansContext = createContext<PlansContextType | undefined>(undefined);

export function PlansProvider({ children }: { children: ReactNode }) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [pendingInvites, setPendingInvites] = useState<GroupInvite[]>([]);
  const [allGroups, setAllGroups] = useState<Group[]>([]); // Groups not yet joined (for invites)
  const [connectedCalendars, setConnectedCalendars] = useState<ConnectedCalendar[]>([]);
  const [calendarSyncs, setCalendarSyncs] = useState<CalendarSync[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [messages, setMessages] = useState<PlanMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [storedPlans, storedRsvps, storedGroups, storedInvites, storedOtherGroups, storedCalendars, storedSyncs, storedNotifications, storedMessages] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEY),
        AsyncStorage.getItem(RSVP_STORAGE_KEY),
        AsyncStorage.getItem(GROUPS_STORAGE_KEY),
        AsyncStorage.getItem(INVITES_STORAGE_KEY),
        AsyncStorage.getItem(OTHER_GROUPS_STORAGE_KEY),
        AsyncStorage.getItem(CALENDARS_STORAGE_KEY),
        AsyncStorage.getItem(CALENDAR_SYNCS_STORAGE_KEY),
        AsyncStorage.getItem(NOTIFICATIONS_STORAGE_KEY),
        AsyncStorage.getItem(MESSAGES_STORAGE_KEY),
      ]);

      if (storedPlans) {
        setPlans(JSON.parse(storedPlans));
      } else {
        setPlans(mockPlans);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(mockPlans));
      }

      if (storedRsvps) {
        setRsvps(JSON.parse(storedRsvps));
      } else {
        setRsvps(mockRSVPs);
        await AsyncStorage.setItem(RSVP_STORAGE_KEY, JSON.stringify(mockRSVPs));
      }

      if (storedGroups) {
        setGroups(JSON.parse(storedGroups));
      } else {
        setGroups(mockGroups);
        await AsyncStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(mockGroups));
      }

      if (storedInvites) {
        setPendingInvites(JSON.parse(storedInvites));
      } else {
        setPendingInvites(mockGroupInvites);
        await AsyncStorage.setItem(INVITES_STORAGE_KEY, JSON.stringify(mockGroupInvites));
      }

      if (storedOtherGroups) {
        setAllGroups(JSON.parse(storedOtherGroups));
      } else {
        setAllGroups(otherSharedGroups);
        await AsyncStorage.setItem(OTHER_GROUPS_STORAGE_KEY, JSON.stringify(otherSharedGroups));
      }

      if (storedCalendars) {
        setConnectedCalendars(JSON.parse(storedCalendars));
      } else {
        // Default: no calendars connected
        setConnectedCalendars([]);
      }

      if (storedSyncs) {
        setCalendarSyncs(JSON.parse(storedSyncs));
      } else {
        setCalendarSyncs([]);
      }

      if (storedNotifications) {
        setNotifications(JSON.parse(storedNotifications));
      } else {
        setNotifications(mockNotifications);
        await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(mockNotifications));
      }

      if (storedMessages) {
        setMessages(JSON.parse(storedMessages));
      } else {
        setMessages(mockPlanMessages);
        await AsyncStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(mockPlanMessages));
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      setPlans(mockPlans);
      setRsvps(mockRSVPs);
      setGroups(mockGroups);
      setPendingInvites(mockGroupInvites);
      setAllGroups(otherSharedGroups);
      setConnectedCalendars([]);
      setCalendarSyncs([]);
      setNotifications(mockNotifications);
      setMessages(mockPlanMessages);
    } finally {
      setIsLoading(false);
    }
  };

  const savePlans = async (newPlans: Plan[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newPlans));
    } catch (error) {
      console.error('Failed to save plans:', error);
    }
  };

  const addPlan = (planData: Omit<Plan, 'id' | 'createdAt'>) => {
    const newPlan: Plan = {
      ...planData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    const newPlans = [newPlan, ...plans];
    setPlans(newPlans);
    savePlans(newPlans);
  };

  const updatePlan = (id: string, updates: Partial<Plan>) => {
    const newPlans = plans.map((plan) =>
      plan.id === id ? { ...plan, ...updates } : plan
    );
    setPlans(newPlans);
    savePlans(newPlans);
  };

  const deletePlan = (id: string) => {
    const newPlans = plans.filter((plan) => plan.id !== id);
    setPlans(newPlans);
    savePlans(newPlans);
  };

  const getPlanById = (id: string) => {
    // Check user's own plans first, then discoverable plans
    return plans.find((plan) => plan.id === id) || mockDiscoverablePlans.find((plan) => plan.id === id);
  };

  // RSVP functions
  const saveRsvps = async (newRsvps: RSVP[]) => {
    try {
      await AsyncStorage.setItem(RSVP_STORAGE_KEY, JSON.stringify(newRsvps));
    } catch (error) {
      console.error('Failed to save RSVPs:', error);
    }
  };

  const setRSVP = (planId: string, status: RSVPStatus | null) => {
    let newRsvps: RSVP[];

    if (status === null) {
      // Remove RSVP
      newRsvps = rsvps.filter(
        (r) => !(r.userId === currentUser.id && r.planId === planId)
      );
    } else {
      // Check if already has RSVP for this plan
      const existingIndex = rsvps.findIndex(
        (r) => r.userId === currentUser.id && r.planId === planId
      );

      if (existingIndex >= 0) {
        // Update existing
        newRsvps = [...rsvps];
        newRsvps[existingIndex] = { userId: currentUser.id, planId, status };
      } else {
        // Add new
        newRsvps = [...rsvps, { userId: currentUser.id, planId, status }];
      }
    }

    setRsvps(newRsvps);
    saveRsvps(newRsvps);
  };

  const getMyRSVP = (planId: string): RSVPStatus | null => {
    const myRsvp = rsvps.find(
      (r) => r.userId === currentUser.id && r.planId === planId
    );
    return myRsvp?.status ?? null;
  };

  const getRSVPsForPlan = (planId: string) => {
    const planRsvps = rsvps.filter((r) => r.planId === planId);
    const allUsers = [currentUser, ...mockUsers];

    const getUserById = (userId: string) =>
      allUsers.find((u) => u.id === userId);

    const going: User[] = [];
    const maybe: User[] = [];
    const interested: User[] = [];

    planRsvps.forEach((rsvp) => {
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

  // Group functions
  const saveGroups = async (newGroups: Group[]) => {
    try {
      await AsyncStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(newGroups));
    } catch (error) {
      console.error('Failed to save groups:', error);
    }
  };

  // Filter groups by type
  const sharedGroups = groups.filter((g) => g.type === 'shared');
  const personalGroups = groups.filter((g) => g.type === 'personal');

  const addGroup = (name: string, type: GroupType, options?: { memberIds?: string[]; description?: string }) => {
    const initialMembers = type === 'shared'
      ? [currentUser.id, ...(options?.memberIds || [])]
      : (options?.memberIds || []);

    const newGroup: Group = {
      id: `${type === 'shared' ? 'sg' : 'g'}${Date.now()}`,
      name,
      memberIds: initialMembers,
      createdAt: new Date().toISOString(),
      type,
      createdBy: currentUser.id,
      description: options?.description,
    };
    const newGroups = [...groups, newGroup];
    setGroups(newGroups);
    saveGroups(newGroups);
  };

  const leaveSharedGroup = (groupId: string) => {
    const group = groups.find((g) => g.id === groupId);
    if (!group || group.type !== 'shared') return;

    const newMemberIds = group.memberIds.filter((id) => id !== currentUser.id);
    if (newMemberIds.length === 0) {
      // If no members left, delete the group
      const newGroups = groups.filter((g) => g.id !== groupId);
      setGroups(newGroups);
      saveGroups(newGroups);
    } else {
      // Otherwise, just remove the current user
      const newGroups = groups.map((g) =>
        g.id === groupId ? { ...g, memberIds: newMemberIds } : g
      );
      setGroups(newGroups);
      saveGroups(newGroups);
    }
  };

  const updateGroup = (id: string, updates: Partial<Group>) => {
    const newGroups = groups.map((group) =>
      group.id === id ? { ...group, ...updates } : group
    );
    setGroups(newGroups);
    saveGroups(newGroups);
  };

  const deleteGroup = (id: string) => {
    const newGroups = groups.filter((group) => group.id !== id);
    setGroups(newGroups);
    saveGroups(newGroups);
  };

  const getGroupById = (id: string) => {
    return groups.find((group) => group.id === id);
  };

  const getGroupNames = (groupIds: string[]): string[] => {
    return groupIds
      .map((id) => groups.find((g) => g.id === id)?.name)
      .filter((name): name is string => !!name);
  };

  const getUsersInGroup = (groupId: string): User[] => {
    const group = groups.find((g) => g.id === groupId);
    if (!group) return [];
    return group.memberIds
      .map((userId) => mockUsers.find((u) => u.id === userId))
      .filter((user): user is User => !!user);
  };

  // Invite functions
  const saveInvites = async (newInvites: GroupInvite[]) => {
    try {
      await AsyncStorage.setItem(INVITES_STORAGE_KEY, JSON.stringify(newInvites));
    } catch (error) {
      console.error('Failed to save invites:', error);
    }
  };

  const saveAllGroups = async (newAllGroups: Group[]) => {
    try {
      await AsyncStorage.setItem(OTHER_GROUPS_STORAGE_KEY, JSON.stringify(newAllGroups));
    } catch (error) {
      console.error('Failed to save other groups:', error);
    }
  };

  const inviteToGroup = (groupId: string, userIds: string[]) => {
    const group = groups.find((g) => g.id === groupId);
    if (!group || group.type !== 'shared') return;

    const newInvites: GroupInvite[] = userIds
      .filter((userId) => !group.memberIds.includes(userId)) // Don't invite existing members
      .filter((userId) => !pendingInvites.some((inv) => inv.groupId === groupId && inv.invitedUserId === userId)) // Don't duplicate invites
      .map((userId) => ({
        id: `inv${Date.now()}_${userId}`,
        groupId,
        groupName: group.name,
        invitedUserId: userId,
        invitedByUserId: currentUser.id,
        invitedByName: currentUser.name,
        createdAt: new Date().toISOString(),
      }));

    if (newInvites.length > 0) {
      const updatedInvites = [...pendingInvites, ...newInvites];
      setPendingInvites(updatedInvites);
      saveInvites(updatedInvites);
    }
  };

  const acceptInvite = (inviteId: string) => {
    const invite = pendingInvites.find((inv) => inv.id === inviteId);
    if (!invite) return;

    // Find the group in allGroups (groups not yet joined)
    const groupToJoin = allGroups.find((g) => g.id === invite.groupId);
    if (groupToJoin) {
      // Add user to the group and move it to the joined groups
      const updatedGroup: Group = {
        ...groupToJoin,
        memberIds: [...groupToJoin.memberIds, currentUser.id],
      };

      // Add to groups
      const newGroups = [...groups, updatedGroup];
      setGroups(newGroups);
      saveGroups(newGroups);

      // Remove from allGroups
      const newAllGroups = allGroups.filter((g) => g.id !== invite.groupId);
      setAllGroups(newAllGroups);
      saveAllGroups(newAllGroups);

      // Add a confirmation notification
      const joinNotification: AppNotification = {
        id: `notif_${Date.now()}`,
        type: 'group_accepted',
        title: 'Joined Group',
        message: `You joined ${groupToJoin.name}`,
        read: false,
        createdAt: new Date().toISOString(),
        groupId: groupToJoin.id,
        groupName: groupToJoin.name,
      };
      const newNotifications = [joinNotification, ...notifications];
      setNotifications(newNotifications);
      saveNotifications(newNotifications);
    }

    // Remove the invite
    const newInvites = pendingInvites.filter((inv) => inv.id !== inviteId);
    setPendingInvites(newInvites);
    saveInvites(newInvites);
  };

  const declineInvite = (inviteId: string) => {
    const newInvites = pendingInvites.filter((inv) => inv.id !== inviteId);
    setPendingInvites(newInvites);
    saveInvites(newInvites);
  };

  // Calendar functions
  const saveCalendars = async (newCalendars: ConnectedCalendar[]) => {
    try {
      await AsyncStorage.setItem(CALENDARS_STORAGE_KEY, JSON.stringify(newCalendars));
    } catch (error) {
      console.error('Failed to save calendars:', error);
    }
  };

  const saveCalendarSyncs = async (newSyncs: CalendarSync[]) => {
    try {
      await AsyncStorage.setItem(CALENDAR_SYNCS_STORAGE_KEY, JSON.stringify(newSyncs));
    } catch (error) {
      console.error('Failed to save calendar syncs:', error);
    }
  };

  const toggleCalendarConnection = (provider: CalendarProvider) => {
    const existing = connectedCalendars.find((c) => c.provider === provider);

    let newCalendars: ConnectedCalendar[];
    if (existing) {
      // Toggle connection status
      newCalendars = connectedCalendars.map((c) =>
        c.provider === provider ? { ...c, connected: !c.connected } : c
      );
    } else {
      // Add new connection
      newCalendars = [
        ...connectedCalendars,
        {
          provider,
          connected: true,
          email: MOCK_EMAILS[provider],
        },
      ];
    }

    setConnectedCalendars(newCalendars);
    saveCalendars(newCalendars);
  };

  const getDefaultCalendar = (): CalendarProvider | null => {
    const connected = connectedCalendars.filter((c) => c.connected);
    if (connected.length === 0) return null;
    // Return the first connected calendar
    return connected[0].provider;
  };

  const addPlanToCalendar = (planId: string, provider?: CalendarProvider) => {
    const calendarProvider = provider || getDefaultCalendar();
    if (!calendarProvider) return;

    // Check if already synced
    const existing = calendarSyncs.find((s) => s.planId === planId);
    if (existing) return;

    const newSync: CalendarSync = {
      planId,
      provider: calendarProvider,
      syncedAt: new Date().toISOString(),
    };

    const newSyncs = [...calendarSyncs, newSync];
    setCalendarSyncs(newSyncs);
    saveCalendarSyncs(newSyncs);
  };

  const removePlanFromCalendar = (planId: string) => {
    const newSyncs = calendarSyncs.filter((s) => s.planId !== planId);
    setCalendarSyncs(newSyncs);
    saveCalendarSyncs(newSyncs);
  };

  const isPlanInCalendar = (planId: string): boolean => {
    return calendarSyncs.some((s) => s.planId === planId);
  };

  // Notification functions
  const saveNotifications = async (newNotifications: AppNotification[]) => {
    try {
      await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(newNotifications));
    } catch (error) {
      console.error('Failed to save notifications:', error);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const addNotification = (notificationData: Omit<AppNotification, 'id' | 'createdAt'>) => {
    const newNotification: AppNotification = {
      ...notificationData,
      id: `notif_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const newNotifications = [newNotification, ...notifications];
    setNotifications(newNotifications);
    saveNotifications(newNotifications);
  };

  const markAsRead = (notificationId: string) => {
    const newNotifications = notifications.map((n) =>
      n.id === notificationId ? { ...n, read: true } : n
    );
    setNotifications(newNotifications);
    saveNotifications(newNotifications);
  };

  const markAllAsRead = () => {
    const newNotifications = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(newNotifications);
    saveNotifications(newNotifications);
  };

  const deleteNotification = (notificationId: string) => {
    const newNotifications = notifications.filter((n) => n.id !== notificationId);
    setNotifications(newNotifications);
    saveNotifications(newNotifications);
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    saveNotifications([]);
  };

  // Discover functions
  const discoverablePlans = mockDiscoverablePlans;

  const getUserById = (userId: string): User | undefined => {
    if (userId === currentUser.id) return currentUser;
    return mockUsers.find((u) => u.id === userId);
  };

  const getDiscoverFriendsPlans = (): Plan[] => {
    // Get plans from friends that are visible to everyone or friends
    // Filter out plans already RSVP'd to
    const myRsvpPlanIds = rsvps
      .filter((r) => r.userId === currentUser.id)
      .map((r) => r.planId);

    return discoverablePlans
      .filter((plan) => {
        // Only friends/everyone visibility (not group-specific)
        const visibility = plan.visibility?.type;
        return visibility === 'friends' || visibility === 'everyone';
      })
      .filter((plan) => !myRsvpPlanIds.includes(plan.id))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const getDiscoverGroupPlans = (): { plan: Plan; groupName: string }[] => {
    // Get plans shared with groups the user is in
    const myGroupIds = sharedGroups.map((g) => g.id);
    const myRsvpPlanIds = rsvps
      .filter((r) => r.userId === currentUser.id)
      .map((r) => r.planId);

    return discoverablePlans
      .filter((plan) => {
        if (plan.visibility?.type !== 'groups') return false;
        // Check if any of the plan's group IDs match user's groups
        const planGroupIds = plan.visibility.groupIds || [];
        return planGroupIds.some((gId) => myGroupIds.includes(gId));
      })
      .filter((plan) => !myRsvpPlanIds.includes(plan.id))
      .map((plan) => {
        // Find the matching group name
        const planGroupIds = plan.visibility?.groupIds || [];
        const matchingGroup = sharedGroups.find((g) => planGroupIds.includes(g.id));
        return {
          plan,
          groupName: matchingGroup?.name || 'Unknown Group',
        };
      })
      .sort((a, b) => new Date(a.plan.date).getTime() - new Date(b.plan.date).getTime());
  };

  // Message functions
  const saveMessages = async (newMessages: PlanMessage[]) => {
    try {
      await AsyncStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(newMessages));
    } catch (error) {
      console.error('Failed to save messages:', error);
    }
  };

  const getMessagesForPlan = (planId: string): PlanMessage[] => {
    return messages
      .filter((m) => m.planId === planId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  };

  const sendMessage = (planId: string, text: string) => {
    const newMessage: PlanMessage = {
      id: `msg_${Date.now()}`,
      planId,
      userId: currentUser.id,
      text,
      createdAt: new Date().toISOString(),
    };
    const newMessages = [...messages, newMessage];
    setMessages(newMessages);
    saveMessages(newMessages);
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
        users: mockUsers,
        currentUser,
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
