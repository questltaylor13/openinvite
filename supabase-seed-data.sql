-- Denver-focused seed data for OpenInvite
-- Run this in your Supabase SQL Editor

-- First, let's create some users
-- Note: These are fake users for demo purposes. In production, users would be created through auth.
INSERT INTO users (id, name, username, email, avatar_color, bio) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Jake Martinez', 'jakemartinez', 'jake@example.com', '#6366F1', 'Denver native. Hiking enthusiast and craft beer lover.'),
  ('22222222-2222-2222-2222-222222222222', 'Emma Thompson', 'emmathompson', 'emma@example.com', '#EC4899', 'New to Denver! Looking to explore the mountains and make friends.'),
  ('33333333-3333-3333-3333-333333333333', 'Marcus Johnson', 'marcusj', 'marcus@example.com', '#10B981', 'Broncos fan. Weekend warrior. Always down for a good time.'),
  ('44444444-4444-4444-4444-444444444444', 'Sofia Rodriguez', 'sofiar', 'sofia@example.com', '#F59E0B', 'Yoga instructor in RiNo. Love outdoor adventures and brunch.'),
  ('55555555-5555-5555-5555-555555555555', 'Tyler Chen', 'tylerchen', 'tyler@example.com', '#8B5CF6', 'Software engineer. Board game enthusiast. Coffee snob.'),
  ('66666666-6666-6666-6666-666666666666', 'Olivia Parker', 'oliviap', 'olivia@example.com', '#06B6D4', 'Food blogger. Always hunting for the best tacos in Denver.'),
  ('77777777-7777-7777-7777-777777777777', 'Ryan Mitchell', 'ryanm', 'ryan@example.com', '#EF4444', 'Skiing in winter, hiking in summer. Living the Colorado dream.'),
  ('88888888-8888-8888-8888-888888888888', 'Ava Williams', 'avaw', 'ava@example.com', '#14B8A6', 'Concert lover. Art enthusiast. Always looking for live music.'),
  ('99999999-9999-9999-9999-999999999999', 'Jordan Lee', 'jordanlee', 'jordan@example.com', '#F97316', 'Photographer. Chasing sunsets at Red Rocks.'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Madison Scott', 'madisons', 'madison@example.com', '#A855F7', 'Fitness junkie. Trail runner. Avocado toast enthusiast.')
ON CONFLICT (id) DO NOTHING;

-- Create Denver-themed groups
INSERT INTO groups (id, name, type, description, created_by) VALUES
  ('g1111111-1111-1111-1111-111111111111', 'Denver Hiking Crew', 'shared', 'Exploring Colorado trails together! All skill levels welcome.', '11111111-1111-1111-1111-111111111111'),
  ('g2222222-2222-2222-2222-222222222222', 'RiNo Happy Hour', 'shared', 'Weekly drinks in the River North Art District', '44444444-4444-4444-4444-444444444444'),
  ('g3333333-3333-3333-3333-333333333333', 'Denver Foodies', 'shared', 'Trying new restaurants around the Mile High City', '66666666-6666-6666-6666-666666666666'),
  ('g4444444-4444-4444-4444-444444444444', 'Board Game Nights', 'shared', 'Weekly game nights in Capitol Hill', '55555555-5555-5555-5555-555555555555'),
  ('g5555555-5555-5555-5555-555555555555', 'Broncos Watch Party', 'shared', 'Watching the Broncos together! Go Broncos!', '33333333-3333-3333-3333-333333333333'),
  ('g6666666-6666-6666-6666-666666666666', 'Red Rocks Crew', 'shared', 'Concert buddies for Red Rocks shows', '88888888-8888-8888-8888-888888888888'),
  ('g7777777-7777-7777-7777-777777777777', 'Ski & Snowboard Squad', 'shared', 'Hitting the slopes together - carpool and group tickets!', '77777777-7777-7777-7777-777777777777'),
  ('g8888888-8888-8888-8888-888888888888', 'Denver Runners Club', 'shared', 'Morning runs, trail runs, and race training', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa')
ON CONFLICT (id) DO NOTHING;

-- Add members to groups
INSERT INTO group_members (group_id, user_id) VALUES
  -- Denver Hiking Crew
  ('g1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111'),
  ('g1111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222'),
  ('g1111111-1111-1111-1111-111111111111', '77777777-7777-7777-7777-777777777777'),
  ('g1111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444'),
  ('g1111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  -- RiNo Happy Hour
  ('g2222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444'),
  ('g2222222-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555555'),
  ('g2222222-2222-2222-2222-222222222222', '66666666-6666-6666-6666-666666666666'),
  ('g2222222-2222-2222-2222-222222222222', '88888888-8888-8888-8888-888888888888'),
  -- Denver Foodies
  ('g3333333-3333-3333-3333-333333333333', '66666666-6666-6666-6666-666666666666'),
  ('g3333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111'),
  ('g3333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222'),
  ('g3333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444'),
  ('g3333333-3333-3333-3333-333333333333', '99999999-9999-9999-9999-999999999999'),
  -- Board Game Nights
  ('g4444444-4444-4444-4444-444444444444', '55555555-5555-5555-5555-555555555555'),
  ('g4444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222'),
  ('g4444444-4444-4444-4444-444444444444', '33333333-3333-3333-3333-333333333333'),
  ('g4444444-4444-4444-4444-444444444444', '88888888-8888-8888-8888-888888888888'),
  -- Broncos Watch Party
  ('g5555555-5555-5555-5555-555555555555', '33333333-3333-3333-3333-333333333333'),
  ('g5555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111'),
  ('g5555555-5555-5555-5555-555555555555', '77777777-7777-7777-7777-777777777777'),
  ('g5555555-5555-5555-5555-555555555555', '99999999-9999-9999-9999-999999999999'),
  -- Red Rocks Crew
  ('g6666666-6666-6666-6666-666666666666', '88888888-8888-8888-8888-888888888888'),
  ('g6666666-6666-6666-6666-666666666666', '44444444-4444-4444-4444-444444444444'),
  ('g6666666-6666-6666-6666-666666666666', '99999999-9999-9999-9999-999999999999'),
  ('g6666666-6666-6666-6666-666666666666', '22222222-2222-2222-2222-222222222222'),
  ('g6666666-6666-6666-6666-666666666666', '55555555-5555-5555-5555-555555555555'),
  -- Ski Squad
  ('g7777777-7777-7777-7777-777777777777', '77777777-7777-7777-7777-777777777777'),
  ('g7777777-7777-7777-7777-777777777777', '11111111-1111-1111-1111-111111111111'),
  ('g7777777-7777-7777-7777-777777777777', '33333333-3333-3333-3333-333333333333'),
  ('g7777777-7777-7777-7777-777777777777', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  -- Denver Runners
  ('g8888888-8888-8888-8888-888888888888', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('g8888888-8888-8888-8888-888888888888', '44444444-4444-4444-4444-444444444444'),
  ('g8888888-8888-8888-8888-888888888888', '77777777-7777-7777-7777-777777777777'),
  ('g8888888-8888-8888-8888-888888888888', '22222222-2222-2222-2222-222222222222')
ON CONFLICT DO NOTHING;

-- Create Denver-themed plans (using dates relative to today)
INSERT INTO plans (id, title, date, time, location, total_spots, filled_spots, rsvp_deadline, notes, created_by, visibility) VALUES
  -- Hiking Plans
  ('p1111111-1111-1111-1111-111111111111', 'Mount Falcon Sunrise Hike',
   (CURRENT_DATE + INTERVAL '3 days')::date, '06:00',
   'Mount Falcon Park, Morrison', 8, 3,
   (CURRENT_DATE + INTERVAL '2 days')::date,
   'Meeting at the east trailhead. Bring water and snacks! About 4 miles round trip with great views of Red Rocks.',
   '11111111-1111-1111-1111-111111111111',
   '{"type": "groups", "groupIds": ["g1111111-1111-1111-1111-111111111111"]}'::jsonb),

  ('p2222222-2222-2222-2222-222222222222', 'Lookout Mountain Trail Run',
   (CURRENT_DATE + INTERVAL '5 days')::date, '07:30',
   'Lookout Mountain Nature Center, Golden', 6, 2,
   (CURRENT_DATE + INTERVAL '4 days')::date,
   'Moderate 5-mile loop with beautiful views. All paces welcome!',
   'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
   '{"type": "friends"}'::jsonb),

  -- Food & Drink Plans
  ('p3333333-3333-3333-3333-333333333333', 'Tacos & Tequila Night',
   (CURRENT_DATE + INTERVAL '2 days')::date, '19:00',
   'Los Chingones, RiNo', 10, 5,
   (CURRENT_DATE + INTERVAL '1 day')::date,
   'Best tacos in Denver! They have an amazing tequila selection too. Making a reservation for the group.',
   '66666666-6666-6666-6666-666666666666',
   '{"type": "groups", "groupIds": ["g3333333-3333-3333-3333-333333333333"]}'::jsonb),

  ('p4444444-4444-4444-4444-444444444444', 'Friday Happy Hour @ Ratio',
   (CURRENT_DATE + INTERVAL '4 days')::date, '17:30',
   'Ratio Beerworks, RiNo', 15, 4,
   (CURRENT_DATE + INTERVAL '3 days')::date,
   'Kicking off the weekend with craft beers! They have a great patio.',
   '44444444-4444-4444-4444-444444444444',
   '{"type": "groups", "groupIds": ["g2222222-2222-2222-2222-222222222222"]}'::jsonb),

  -- Entertainment Plans
  ('p5555555-5555-5555-5555-555555555555', 'Board Game Night - Ticket to Ride Tournament',
   (CURRENT_DATE + INTERVAL '6 days')::date, '18:00',
   'Tabletop Tap, Capitol Hill', 8, 3,
   (CURRENT_DATE + INTERVAL '5 days')::date,
   'Bringing Ticket to Ride, Catan, and Wingspan. They have great beer and snacks!',
   '55555555-5555-5555-5555-555555555555',
   '{"type": "groups", "groupIds": ["g4444444-4444-4444-4444-444444444444"]}'::jsonb),

  ('p6666666-6666-6666-6666-666666666666', 'Broncos vs Chiefs Watch Party',
   (CURRENT_DATE + INTERVAL '7 days')::date, '14:00',
   'Blake Street Tavern, LoDo', 20, 8,
   (CURRENT_DATE + INTERVAL '6 days')::date,
   'Big game! They have great wings and drink specials. Wear your orange!',
   '33333333-3333-3333-3333-333333333333',
   '{"type": "groups", "groupIds": ["g5555555-5555-5555-5555-555555555555"]}'::jsonb),

  ('p7777777-7777-7777-7777-777777777777', 'Red Rocks Yoga on the Rocks',
   (CURRENT_DATE + INTERVAL '10 days')::date, '07:00',
   'Red Rocks Amphitheatre, Morrison', 6, 2,
   (CURRENT_DATE + INTERVAL '8 days')::date,
   'Sunrise yoga at Red Rocks! Bring your own mat. Carpooling from Cap Hill at 6am.',
   '44444444-4444-4444-4444-444444444444',
   '{"type": "friends"}'::jsonb),

  -- Ski Plans
  ('p8888888-8888-8888-8888-888888888888', 'Keystone Day Trip',
   (CURRENT_DATE + INTERVAL '12 days')::date, '06:30',
   'Keystone Resort', 6, 3,
   (CURRENT_DATE + INTERVAL '10 days')::date,
   'Carpooling from Denver at 6:30am. All levels welcome! Can split into groups on the mountain.',
   '77777777-7777-7777-7777-777777777777',
   '{"type": "groups", "groupIds": ["g7777777-7777-7777-7777-777777777777"]}'::jsonb),

  -- Concert Plans
  ('p9999999-9999-9999-9999-999999999999', 'Concert at Mission Ballroom',
   (CURRENT_DATE + INTERVAL '14 days')::date, '19:00',
   'Mission Ballroom, RiNo', 4, 1,
   (CURRENT_DATE + INTERVAL '12 days')::date,
   'Got 4 tickets! Amazing venue, great sound. Let me know if you want in!',
   '88888888-8888-8888-8888-888888888888',
   '{"type": "groups", "groupIds": ["g6666666-6666-6666-6666-666666666666"]}'::jsonb),

  -- Brunch Plans
  ('paaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Sunday Brunch @ Snooze',
   (CURRENT_DATE + INTERVAL '8 days')::date, '10:30',
   'Snooze AM Eatery, Union Station', 8, 4,
   (CURRENT_DATE + INTERVAL '7 days')::date,
   'Best pancakes in Denver! Making a reservation. Bottomless mimosas available.',
   '22222222-2222-2222-2222-222222222222',
   '{"type": "everyone"}'::jsonb),

  -- More casual hangouts
  ('pbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Coffee & Coworking',
   (CURRENT_DATE + INTERVAL '1 day')::date, '09:00',
   'Thump Coffee, Cap Hill', 6, 2,
   CURRENT_DATE::date,
   'Working remotely? Join us for coffee and coworking. Good vibes and great coffee!',
   '55555555-5555-5555-5555-555555555555',
   '{"type": "friends"}'::jsonb),

  ('pcccccc-cccc-cccc-cccc-cccccccccccc', 'Sunset at City Park',
   (CURRENT_DATE + INTERVAL '2 days')::date, '18:30',
   'City Park Pavilion, Denver', 12, 3,
   (CURRENT_DATE + INTERVAL '1 day')::date,
   'Picnic in the park! BYOB and snacks. Great views of the mountains and downtown.',
   '99999999-9999-9999-9999-999999999999',
   '{"type": "everyone"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Add some RSVPs
INSERT INTO rsvps (user_id, plan_id, status) VALUES
  -- Mount Falcon Hike RSVPs
  ('22222222-2222-2222-2222-222222222222', 'p1111111-1111-1111-1111-111111111111', 'going'),
  ('77777777-7777-7777-7777-777777777777', 'p1111111-1111-1111-1111-111111111111', 'going'),
  ('44444444-4444-4444-4444-444444444444', 'p1111111-1111-1111-1111-111111111111', 'going'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'p1111111-1111-1111-1111-111111111111', 'maybe'),

  -- Tacos Night RSVPs
  ('11111111-1111-1111-1111-111111111111', 'p3333333-3333-3333-3333-333333333333', 'going'),
  ('22222222-2222-2222-2222-222222222222', 'p3333333-3333-3333-3333-333333333333', 'going'),
  ('44444444-4444-4444-4444-444444444444', 'p3333333-3333-3333-3333-333333333333', 'going'),
  ('99999999-9999-9999-9999-999999999999', 'p3333333-3333-3333-3333-333333333333', 'going'),
  ('55555555-5555-5555-5555-555555555555', 'p3333333-3333-3333-3333-333333333333', 'maybe'),

  -- Happy Hour RSVPs
  ('55555555-5555-5555-5555-555555555555', 'p4444444-4444-4444-4444-444444444444', 'going'),
  ('66666666-6666-6666-6666-666666666666', 'p4444444-4444-4444-4444-444444444444', 'going'),
  ('88888888-8888-8888-8888-888888888888', 'p4444444-4444-4444-4444-444444444444', 'going'),
  ('22222222-2222-2222-2222-222222222222', 'p4444444-4444-4444-4444-444444444444', 'interested'),

  -- Board Game Night RSVPs
  ('22222222-2222-2222-2222-222222222222', 'p5555555-5555-5555-5555-555555555555', 'going'),
  ('33333333-3333-3333-3333-333333333333', 'p5555555-5555-5555-5555-555555555555', 'going'),
  ('88888888-8888-8888-8888-888888888888', 'p5555555-5555-5555-5555-555555555555', 'going'),

  -- Broncos RSVPs
  ('11111111-1111-1111-1111-111111111111', 'p6666666-6666-6666-6666-666666666666', 'going'),
  ('77777777-7777-7777-7777-777777777777', 'p6666666-6666-6666-6666-666666666666', 'going'),
  ('99999999-9999-9999-9999-999999999999', 'p6666666-6666-6666-6666-666666666666', 'going'),
  ('22222222-2222-2222-2222-222222222222', 'p6666666-6666-6666-6666-666666666666', 'going'),
  ('55555555-5555-5555-5555-555555555555', 'p6666666-6666-6666-6666-666666666666', 'maybe'),

  -- Keystone RSVPs
  ('11111111-1111-1111-1111-111111111111', 'p8888888-8888-8888-8888-888888888888', 'going'),
  ('33333333-3333-3333-3333-333333333333', 'p8888888-8888-8888-8888-888888888888', 'going'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'p8888888-8888-8888-8888-888888888888', 'going'),

  -- Brunch RSVPs
  ('44444444-4444-4444-4444-444444444444', 'paaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'going'),
  ('66666666-6666-6666-6666-666666666666', 'paaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'going'),
  ('88888888-8888-8888-8888-888888888888', 'paaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'going'),
  ('55555555-5555-5555-5555-555555555555', 'paaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'maybe')
ON CONFLICT DO NOTHING;

-- Add some friendships between users
INSERT INTO friends (user_id, friend_id, status) VALUES
  ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'accepted'),
  ('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'accepted'),
  ('11111111-1111-1111-1111-111111111111', '77777777-7777-7777-7777-777777777777', 'accepted'),
  ('22222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', 'accepted'),
  ('22222222-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555555', 'accepted'),
  ('33333333-3333-3333-3333-333333333333', '77777777-7777-7777-7777-777777777777', 'accepted'),
  ('44444444-4444-4444-4444-444444444444', '66666666-6666-6666-6666-666666666666', 'accepted'),
  ('44444444-4444-4444-4444-444444444444', '88888888-8888-8888-8888-888888888888', 'accepted'),
  ('55555555-5555-5555-5555-555555555555', '66666666-6666-6666-6666-666666666666', 'accepted'),
  ('55555555-5555-5555-5555-555555555555', '88888888-8888-8888-8888-888888888888', 'accepted'),
  ('66666666-6666-6666-6666-666666666666', '99999999-9999-9999-9999-999999999999', 'accepted'),
  ('77777777-7777-7777-7777-777777777777', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'accepted'),
  ('88888888-8888-8888-8888-888888888888', '99999999-9999-9999-9999-999999999999', 'accepted')
ON CONFLICT DO NOTHING;

-- Add some messages to plans
INSERT INTO messages (plan_id, user_id, text, created_at) VALUES
  -- Mount Falcon Hike
  ('p1111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'So excited for this! Is the trail dog-friendly?', NOW() - INTERVAL '2 hours'),
  ('p1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Yes! Dogs are welcome on leash. Bring water for them too!', NOW() - INTERVAL '1 hour'),
  ('p1111111-1111-1111-1111-111111111111', '77777777-7777-7777-7777-777777777777', 'Perfect, I am bringing Luna!', NOW() - INTERVAL '30 minutes'),

  -- Tacos Night
  ('p3333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', 'Their birria tacos are incredible. Highly recommend!', NOW() - INTERVAL '3 hours'),
  ('p3333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Can we get a booth? We had a great one last time.', NOW() - INTERVAL '2 hours'),
  ('p3333333-3333-3333-3333-333333333333', '66666666-6666-6666-6666-666666666666', 'Will request it when I make the reservation!', NOW() - INTERVAL '1 hour'),

  -- Broncos Watch Party
  ('p6666666-6666-6666-6666-666666666666', '11111111-1111-1111-1111-111111111111', 'GO BRONCOS! Lets gooo!', NOW() - INTERVAL '5 hours'),
  ('p6666666-6666-6666-6666-666666666666', '77777777-7777-7777-7777-777777777777', 'Should we try to get there early for a good table?', NOW() - INTERVAL '4 hours'),
  ('p6666666-6666-6666-6666-666666666666', '33333333-3333-3333-3333-333333333333', 'Good idea, it gets packed for Chiefs games. Lets meet at 1:30?', NOW() - INTERVAL '3 hours'),

  -- Keystone
  ('p8888888-8888-8888-8888-888888888888', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Anyone need to rent gear?', NOW() - INTERVAL '1 day'),
  ('p8888888-8888-8888-8888-888888888888', '33333333-3333-3333-3333-333333333333', 'I am all set! How many cars are we taking?', NOW() - INTERVAL '20 hours'),
  ('p8888888-8888-8888-8888-888888888888', '77777777-7777-7777-7777-777777777777', 'I can drive 4 people. We can fit skis on the roof.', NOW() - INTERVAL '18 hours')
ON CONFLICT DO NOTHING;

-- Update filled_spots to match actual RSVPs
UPDATE plans SET filled_spots = (
  SELECT COUNT(*) FROM rsvps WHERE rsvps.plan_id = plans.id AND rsvps.status = 'going'
);

SELECT 'Seed data inserted successfully!' as result;
