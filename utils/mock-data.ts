import { Plan, User, RSVP, Group, GroupInvite, AppNotification, PlanMessage } from '@/types/plan';

// Current user (you)
export const currentUser: User = {
  id: 'me',
  name: 'You',
  avatarColor: '#6366F1', // Indigo (accent color)
  bio: 'Denver local. Always down for adventures!',
  username: 'yourname',
  phone: '',
  email: 'you@example.com',
};

// Mock friends
export const mockUsers: User[] = [
  { id: '1', name: 'Alex Chen', avatarColor: '#EC4899' },      // Pink
  { id: '2', name: 'Jordan Smith', avatarColor: '#14B8A6' },   // Teal
  { id: '3', name: 'Sam Wilson', avatarColor: '#F59E0B' },     // Amber
  { id: '4', name: 'Taylor Kim', avatarColor: '#8B5CF6' },     // Purple
  { id: '5', name: 'Morgan Lee', avatarColor: '#EF4444' },     // Red
];

// Pre-populated RSVPs for existing plans
export const mockRSVPs: RSVP[] = [
  // Dinner at Nobu (plan 1) - 3 filled spots
  { userId: '1', planId: '1', status: 'going' },
  { userId: '2', planId: '1', status: 'going' },
  { userId: '3', planId: '1', status: 'maybe' },
  { userId: '4', planId: '1', status: 'interested' },

  // Go-Karting (plan 2) - 5 filled spots
  { userId: '1', planId: '2', status: 'going' },
  { userId: '2', planId: '2', status: 'going' },
  { userId: '3', planId: '2', status: 'going' },
  { userId: '4', planId: '2', status: 'going' },
  { userId: '5', planId: '2', status: 'maybe' },

  // Big Bear Ski Trip (plan 3) - 2 filled spots
  { userId: '1', planId: '3', status: 'going' },
  { userId: '4', planId: '3', status: 'interested' },
  { userId: '5', planId: '3', status: 'interested' },

  // Board Game Night (plan 4) - 6 filled (full)
  { userId: '1', planId: '4', status: 'going' },
  { userId: '2', planId: '4', status: 'going' },
  { userId: '3', planId: '4', status: 'going' },
  { userId: '4', planId: '4', status: 'going' },
  { userId: '5', planId: '4', status: 'going' },

  // Hiking at Runyon (plan 5) - 4 filled spots
  { userId: '2', planId: '5', status: 'going' },
  { userId: '3', planId: '5', status: 'going' },
  { userId: '4', planId: '5', status: 'maybe' },
  { userId: '5', planId: '5', status: 'interested' },
];

// Shared groups (groups you've been invited to or added to)
export const mockSharedGroups: Group[] = [
  {
    id: 'sg1',
    name: 'Friday Night Crew',
    memberIds: ['me', '1', '2', '3'], // You, Alex, Jordan, Sam
    createdAt: '2024-11-15T00:00:00Z',
    type: 'shared',
    description: 'Weekend hangouts around LoDo and RiNo',
  },
  {
    id: 'sg2',
    name: 'Hiking Club',
    memberIds: ['me', '1', '4', '5'], // You, Alex, Taylor, Morgan
    createdAt: '2024-10-20T00:00:00Z',
    type: 'shared',
    description: 'Weekly hikes in the Front Range',
  },
  {
    id: 'sg3',
    name: 'Book Club',
    memberIds: ['me', '2', '4'], // You, Jordan, Taylor
    createdAt: '2024-09-01T00:00:00Z',
    type: 'shared',
    description: 'Monthly book discussions in the Highlands',
  },
];

// Personal groups (groups you create to organize your contacts)
export const mockPersonalGroups: Group[] = [
  {
    id: 'g1',
    name: 'Close Friends',
    memberIds: ['1', '2', '3'], // Alex, Jordan, Sam
    createdAt: '2024-12-01T00:00:00Z',
    type: 'personal',
    createdBy: 'me',
  },
  {
    id: 'g2',
    name: 'Workout Buddies',
    memberIds: ['1', '4'], // Alex, Taylor
    createdAt: '2024-12-01T00:00:00Z',
    type: 'personal',
    createdBy: 'me',
  },
  {
    id: 'g3',
    name: 'Drinking Crew',
    memberIds: ['2', '3', '5'], // Jordan, Sam, Morgan
    createdAt: '2024-12-01T00:00:00Z',
    type: 'personal',
    createdBy: 'me',
  },
  {
    id: 'g4',
    name: 'Quiet Hangs',
    memberIds: ['1', '4', '5'], // Alex, Taylor, Morgan
    createdAt: '2024-12-01T00:00:00Z',
    type: 'personal',
    createdBy: 'me',
  },
  {
    id: 'g5',
    name: 'Work Friends',
    memberIds: ['2', '4'], // Jordan, Taylor
    createdAt: '2024-12-01T00:00:00Z',
    type: 'personal',
    createdBy: 'me',
  },
];

// Combined groups for backward compatibility
export const mockGroups: Group[] = [...mockSharedGroups, ...mockPersonalGroups];

// Groups that exist but user is not a member of (for invite demos)
export const otherSharedGroups: Group[] = [
  {
    id: 'sg4',
    name: 'Pickup Basketball',
    memberIds: ['1', '3', '5'], // Alex, Sam, Morgan - not including 'me'
    createdAt: '2024-08-15T00:00:00Z',
    type: 'shared',
    createdBy: '1',
    description: 'Sunday pickup games at City Park',
  },
  {
    id: 'sg5',
    name: 'Denver Foodies',
    memberIds: ['2', '4', '5'], // Jordan, Taylor, Morgan - not including 'me'
    createdAt: '2024-07-01T00:00:00Z',
    type: 'shared',
    createdBy: '2',
    description: 'Trying new restaurants around Denver',
  },
];

// Pending invites for the current user
export const mockGroupInvites: GroupInvite[] = [
  {
    id: 'inv1',
    groupId: 'sg4',
    groupName: 'Pickup Basketball',
    invitedUserId: 'me',
    invitedByUserId: '1',
    invitedByName: 'Alex Chen',
    createdAt: '2024-12-23T14:00:00Z',
  },
  {
    id: 'inv2',
    groupId: 'sg5',
    groupName: 'Denver Foodies',
    invitedUserId: 'me',
    invitedByUserId: '2',
    invitedByName: 'Jordan Smith',
    createdAt: '2024-12-24T10:30:00Z',
  },
];

// Series ID for recurring volleyball
const VOLLEYBALL_SERIES_ID = 'series_volleyball_1';

export const mockPlans: Plan[] = [
  // Recurring Weekly Volleyball Plans (Every Tuesday)
  {
    id: 'rec1',
    title: 'Weekly Volleyball',
    date: '2024-12-31', // First Tuesday
    time: '18:30',
    location: 'City Park Recreation Center, 2001 Colorado Blvd, Denver',
    totalSpots: 12,
    filledSpots: 6,
    rsvpDeadline: '2024-12-30',
    notes: 'Casual pickup volleyball. All skill levels welcome!',
    createdAt: '2024-12-15T10:00:00Z',
    visibility: { type: 'friends' },
    recurrence: {
      type: 'weekly',
      end: { type: 'never' },
      seriesId: VOLLEYBALL_SERIES_ID,
      instanceIndex: 0,
    },
  },
  {
    id: 'rec2',
    title: 'Weekly Volleyball',
    date: '2025-01-07', // Second Tuesday
    time: '18:30',
    location: 'City Park Recreation Center, 2001 Colorado Blvd, Denver',
    totalSpots: 12,
    filledSpots: 4,
    rsvpDeadline: '2025-01-06',
    notes: 'Casual pickup volleyball. All skill levels welcome!',
    createdAt: '2024-12-15T10:00:00Z',
    visibility: { type: 'friends' },
    recurrence: {
      type: 'weekly',
      end: { type: 'never' },
      seriesId: VOLLEYBALL_SERIES_ID,
      instanceIndex: 1,
    },
  },
  {
    id: 'rec3',
    title: 'Weekly Volleyball',
    date: '2025-01-14', // Third Tuesday
    time: '18:30',
    location: 'City Park Recreation Center, 2001 Colorado Blvd, Denver',
    totalSpots: 12,
    filledSpots: 2,
    rsvpDeadline: '2025-01-13',
    notes: 'Casual pickup volleyball. All skill levels welcome!',
    createdAt: '2024-12-15T10:00:00Z',
    visibility: { type: 'friends' },
    recurrence: {
      type: 'weekly',
      end: { type: 'never' },
      seriesId: VOLLEYBALL_SERIES_ID,
      instanceIndex: 2,
    },
  },
  {
    id: 'rec4',
    title: 'Weekly Volleyball',
    date: '2025-01-21', // Fourth Tuesday
    time: '18:30',
    location: 'City Park Recreation Center, 2001 Colorado Blvd, Denver',
    totalSpots: 12,
    filledSpots: 0,
    rsvpDeadline: '2025-01-20',
    notes: 'Casual pickup volleyball. All skill levels welcome!',
    createdAt: '2024-12-15T10:00:00Z',
    visibility: { type: 'friends' },
    recurrence: {
      type: 'weekly',
      end: { type: 'never' },
      seriesId: VOLLEYBALL_SERIES_ID,
      instanceIndex: 3,
    },
  },
  {
    id: 'rec5',
    title: 'Weekly Volleyball',
    date: '2025-01-28', // Fifth Tuesday
    time: '18:30',
    location: 'City Park Recreation Center, 2001 Colorado Blvd, Denver',
    totalSpots: 12,
    filledSpots: 0,
    rsvpDeadline: '2025-01-27',
    notes: 'Casual pickup volleyball. All skill levels welcome!',
    createdAt: '2024-12-15T10:00:00Z',
    visibility: { type: 'friends' },
    recurrence: {
      type: 'weekly',
      end: { type: 'never' },
      seriesId: VOLLEYBALL_SERIES_ID,
      instanceIndex: 4,
    },
  },
  {
    id: '1',
    title: 'Dinner at Guard and Grace',
    date: '2025-01-03',
    time: '19:30',
    location: 'Guard and Grace, 1801 California St, Denver',
    totalSpots: 6,
    filledSpots: 3,
    rsvpDeadline: '2025-01-02',
    notes: 'Celebrating the new year! Dress code is smart casual.',
    createdAt: '2024-12-20T10:00:00Z',
    visibility: { type: 'groups', groupIds: ['g1'] }, // Close Friends only
  },
  {
    id: '2',
    title: 'Avalanche Game',
    date: '2025-01-05',
    time: '17:00',
    location: 'Ball Arena, 1000 Chopper Cir, Denver',
    totalSpots: 8,
    filledSpots: 5,
    rsvpDeadline: '2025-01-04',
    notes: 'Got tickets in section 118! Wear your burgundy and blue.',
    createdAt: '2024-12-21T14:30:00Z',
    visibility: { type: 'everyone' },
  },
  {
    id: '3',
    title: 'Breckenridge Ski Trip',
    date: '2025-01-18',
    time: '07:00',
    location: 'Breckenridge Ski Resort',
    totalSpots: 4,
    filledSpots: 2,
    rsvpDeadline: '2025-01-15',
    notes: 'Carpooling from Denver. Rentals available at the resort.',
    createdAt: '2024-12-22T09:00:00Z',
    visibility: { type: 'groups', groupIds: ['g1', 'g2'] }, // Close Friends + Workout Buddies
  },
  {
    id: '4',
    title: 'Board Game Night',
    date: '2025-01-10',
    time: '18:00',
    location: 'My place - Capitol Hill',
    totalSpots: 6,
    filledSpots: 6,
    rsvpDeadline: '2025-01-09',
    notes: 'BYOB. I have Catan, Ticket to Ride, and Codenames.',
    createdAt: '2024-12-23T16:00:00Z',
    visibility: { type: 'groups', groupIds: ['g4'] }, // Quiet Hangs
  },
  {
    id: '5',
    title: 'Red Rocks Hike',
    date: '2025-01-12',
    time: '08:00',
    location: 'Red Rocks Park, Trading Post Trail',
    totalSpots: 10,
    filledSpots: 4,
    rsvpDeadline: '2025-01-11',
    createdAt: '2024-12-24T08:00:00Z',
    visibility: { type: 'friends' }, // All friends
  },
];

// Discoverable plans (created by friends, visible to the current user)
export const mockDiscoverablePlans: Plan[] = [
  // Friends' Plans (visible via 'friends' or 'everyone')
  {
    id: 'fp1',
    title: 'Rooftop Drinks at 54thirty',
    date: '2025-01-04',
    time: '18:00',
    location: '54thirty Rooftop, 1475 California St, Denver',
    totalSpots: 8,
    filledSpots: 3,
    rsvpDeadline: '2025-01-03',
    notes: 'Best mountain views in the city! First round on me.',
    createdAt: '2024-12-23T12:00:00Z',
    createdBy: '1', // Alex Chen
    visibility: { type: 'friends' },
  },
  {
    id: 'fp2',
    title: 'Brunch at Snooze',
    date: '2025-01-06',
    time: '11:00',
    location: 'Snooze A.M. Eatery, 2262 Larimer St, Denver',
    totalSpots: 6,
    filledSpots: 2,
    rsvpDeadline: '2025-01-05',
    notes: 'Their pancake flights are incredible. Get there early!',
    createdAt: '2024-12-24T09:00:00Z',
    createdBy: '2', // Jordan Smith
    visibility: { type: 'friends' },
  },
  {
    id: 'fp3',
    title: 'Nuggets Watch Party',
    date: '2025-01-08',
    time: '19:00',
    location: 'Blake Street Tavern, 2301 Blake St, Denver',
    totalSpots: 5,
    filledSpots: 2,
    rsvpDeadline: '2025-01-07',
    createdAt: '2024-12-24T14:00:00Z',
    createdBy: '3', // Sam Wilson
    visibility: { type: 'everyone' },
  },
  {
    id: 'fp4',
    title: 'Axe Throwing',
    date: '2025-01-11',
    time: '14:00',
    location: 'Bad Axe Throwing, 3411 E 52nd Ave, Denver',
    totalSpots: 4,
    filledSpots: 1,
    rsvpDeadline: '2025-01-10',
    notes: 'Always wanted to try this! Beginners welcome.',
    createdAt: '2024-12-22T16:00:00Z',
    createdBy: '4', // Taylor Kim
    visibility: { type: 'friends' },
  },
  {
    id: 'fp5',
    title: 'Fire Pit Hangout',
    date: '2025-01-15',
    time: '17:00',
    location: 'Sloan\'s Lake Park, West Side',
    totalSpots: 12,
    filledSpots: 4,
    rsvpDeadline: '2025-01-14',
    notes: 'Bring blankets and snacks. I\'ll bring the hot cocoa.',
    createdAt: '2024-12-21T11:00:00Z',
    createdBy: '5', // Morgan Lee
    visibility: { type: 'everyone' },
  },
  {
    id: 'fp6',
    title: 'Brewery Tour',
    date: '2025-01-20',
    time: '13:00',
    location: 'Great Divide Brewing Co, 2201 Arapahoe St, Denver',
    totalSpots: 6,
    filledSpots: 3,
    rsvpDeadline: '2025-01-18',
    notes: 'Hitting Great Divide, then maybe Ratio and Our Mutual Friend.',
    createdAt: '2024-12-20T15:00:00Z',
    createdBy: '1', // Alex Chen
    visibility: { type: 'friends' },
  },

  // Group Plans (shared with groups current user is in)
  {
    id: 'gp1',
    title: 'Friday Happy Hour',
    date: '2025-01-03',
    time: '17:30',
    location: 'Finn\'s Manor, 2927 Larimer St, Denver',
    totalSpots: 10,
    filledSpots: 4,
    rsvpDeadline: '2025-01-03',
    notes: 'Weekly tradition! New members welcome.',
    createdAt: '2024-12-24T10:00:00Z',
    createdBy: '2', // Jordan Smith
    visibility: { type: 'groups', groupIds: ['sg1'] }, // Friday Night Crew
  },
  {
    id: 'gp2',
    title: 'Mount Falcon Sunrise Hike',
    date: '2025-01-07',
    time: '06:30',
    location: 'Mount Falcon Park, West Trailhead',
    totalSpots: 8,
    filledSpots: 3,
    rsvpDeadline: '2025-01-06',
    notes: 'Sunrise hike! Bring headlamps. Coffee in Morrison after.',
    createdAt: '2024-12-23T18:00:00Z',
    createdBy: '1', // Alex Chen
    visibility: { type: 'groups', groupIds: ['sg2'] }, // Hiking Club
  },
  {
    id: 'gp3',
    title: 'Book Discussion: Project Hail Mary',
    date: '2025-01-14',
    time: '19:00',
    location: 'Jordan\'s place - Highlands',
    totalSpots: 6,
    filledSpots: 2,
    rsvpDeadline: '2025-01-12',
    notes: 'Finish the book by then! Snacks provided.',
    createdAt: '2024-12-22T20:00:00Z',
    createdBy: '2', // Jordan Smith
    visibility: { type: 'groups', groupIds: ['sg3'] }, // Book Club
  },
  {
    id: 'gp4',
    title: 'Voicebox Karaoke',
    date: '2025-01-10',
    time: '21:00',
    location: 'Voicebox Karaoke, 1290 S Broadway, Denver',
    totalSpots: 8,
    filledSpots: 5,
    rsvpDeadline: '2025-01-09',
    notes: 'Private room booked! Song requests welcome.',
    createdAt: '2024-12-24T13:00:00Z',
    createdBy: '3', // Sam Wilson
    visibility: { type: 'groups', groupIds: ['sg1'] }, // Friday Night Crew
  },
  {
    id: 'gp5',
    title: 'Trail Run at Lookout Mountain',
    date: '2025-01-19',
    time: '07:00',
    location: 'Lookout Mountain Nature Center',
    totalSpots: 6,
    filledSpots: 2,
    rsvpDeadline: '2025-01-17',
    notes: '5-mile loop. Moderate difficulty. Bring water!',
    createdAt: '2024-12-21T14:00:00Z',
    createdBy: '4', // Taylor Kim
    visibility: { type: 'groups', groupIds: ['sg2'] }, // Hiking Club
  },
];

// Mock notifications
export const mockNotifications: AppNotification[] = [
  {
    id: 'notif1',
    type: 'rsvp',
    title: 'New RSVP',
    message: 'Alex Chen is going to Dinner at Guard and Grace',
    read: false,
    createdAt: '2024-12-24T15:30:00Z',
    planId: '1',
    planTitle: 'Dinner at Guard and Grace',
    userId: '1',
    userName: 'Alex Chen',
    rsvpStatus: 'going',
  },
  {
    id: 'notif2',
    type: 'rsvp',
    title: 'New RSVP',
    message: 'Jordan Smith is maybe going to Dinner at Guard and Grace',
    read: false,
    createdAt: '2024-12-24T14:00:00Z',
    planId: '1',
    planTitle: 'Dinner at Guard and Grace',
    userId: '2',
    userName: 'Jordan Smith',
    rsvpStatus: 'maybe',
  },
  {
    id: 'notif3',
    type: 'group_invite',
    title: 'Group Invite',
    message: 'Alex Chen invited you to Pickup Basketball',
    read: false,
    createdAt: '2024-12-23T14:00:00Z',
    groupId: 'sg4',
    groupName: 'Pickup Basketball',
    userId: '1',
    userName: 'Alex Chen',
  },
  {
    id: 'notif4',
    type: 'group_invite',
    title: 'Group Invite',
    message: 'Jordan Smith invited you to Denver Foodies',
    read: true,
    createdAt: '2024-12-22T10:30:00Z',
    groupId: 'sg5',
    groupName: 'Denver Foodies',
    userId: '2',
    userName: 'Jordan Smith',
  },
  {
    id: 'notif5',
    type: 'rsvp',
    title: 'New RSVP',
    message: 'Taylor Kim is interested in Breckenridge Ski Trip',
    read: true,
    createdAt: '2024-12-22T09:15:00Z',
    planId: '3',
    planTitle: 'Breckenridge Ski Trip',
    userId: '4',
    userName: 'Taylor Kim',
    rsvpStatus: 'interested',
  },
  {
    id: 'notif6',
    type: 'plan_reminder',
    title: 'Upcoming Plan',
    message: 'Avalanche Game is coming up in 2 days!',
    read: true,
    createdAt: '2024-12-21T08:00:00Z',
    planId: '2',
    planTitle: 'Avalanche Game',
  },
];

// Mock plan messages/discussions
export const mockPlanMessages: PlanMessage[] = [
  // Dinner at Guard and Grace (plan 1)
  {
    id: 'msg1',
    planId: '1',
    userId: '1', // Alex
    text: 'Should I bring anything?',
    createdAt: '2024-12-23T10:30:00Z',
  },
  {
    id: 'msg2',
    planId: '1',
    userId: 'me',
    text: 'Nope, just yourself! Reservations are all set.',
    createdAt: '2024-12-23T10:45:00Z',
  },
  {
    id: 'msg3',
    planId: '1',
    userId: '2', // Jordan
    text: 'Can\'t wait! I\'ve heard their steaks are incredible.',
    createdAt: '2024-12-23T14:20:00Z',
  },

  // Avalanche Game (plan 2)
  {
    id: 'msg4',
    planId: '2',
    userId: '3', // Sam
    text: 'I can drive if anyone needs a ride from Cap Hill',
    createdAt: '2024-12-22T11:00:00Z',
  },
  {
    id: 'msg5',
    planId: '2',
    userId: '4', // Taylor
    text: 'That would be great! Can you swing by RiNo?',
    createdAt: '2024-12-22T11:15:00Z',
  },
  {
    id: 'msg6',
    planId: '2',
    userId: '3', // Sam
    text: 'Yeah, I\'ll text you when I\'m leaving',
    createdAt: '2024-12-22T11:20:00Z',
  },
  {
    id: 'msg7',
    planId: '2',
    userId: '1', // Alex
    text: 'Go Avs! Let\'s crush the Wild tonight 🏒',
    createdAt: '2024-12-23T09:00:00Z',
  },

  // Breckenridge Ski Trip (plan 3)
  {
    id: 'msg8',
    planId: '3',
    userId: '1', // Alex
    text: 'What time should we leave Denver?',
    createdAt: '2024-12-21T15:00:00Z',
  },
  {
    id: 'msg9',
    planId: '3',
    userId: 'me',
    text: 'I was thinking 7am to beat I-70 traffic. We can stop in Idaho Springs for breakfast.',
    createdAt: '2024-12-21T15:30:00Z',
  },
  {
    id: 'msg10',
    planId: '3',
    userId: '4', // Taylor
    text: 'Works for me! I\'ll bring snacks for the car',
    createdAt: '2024-12-21T16:00:00Z',
  },

  // Red Rocks Hike (plan 5)
  {
    id: 'msg11',
    planId: '5',
    userId: '2', // Jordan
    text: 'Running 10 min late, start without me!',
    createdAt: '2024-12-24T07:50:00Z',
  },
  {
    id: 'msg12',
    planId: '5',
    userId: '3', // Sam
    text: 'No worries, we\'ll wait at the Trading Post lot',
    createdAt: '2024-12-24T07:52:00Z',
  },

  // Discoverable plans - Friday Happy Hour at Finn's Manor (gp1)
  {
    id: 'msg13',
    planId: 'gp1',
    userId: '2', // Jordan
    text: 'Who\'s coming tonight?',
    createdAt: '2024-12-24T14:00:00Z',
  },
  {
    id: 'msg14',
    planId: 'gp1',
    userId: '3', // Sam
    text: 'Count me in! Need a drink after this week',
    createdAt: '2024-12-24T14:10:00Z',
  },

  // Discoverable plans - Mount Falcon Hike (gp2)
  {
    id: 'msg15',
    planId: 'gp2',
    userId: '1', // Alex
    text: 'Reminder: bring headlamps, it\'ll still be dark when we start. Coffee at Red Rocks Grill after!',
    createdAt: '2024-12-24T18:00:00Z',
  },
];
