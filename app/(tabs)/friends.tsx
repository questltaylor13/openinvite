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
import { User, FriendRequest } from '@/types/plan';

export default function FriendsScreen() {
  const {
    getFriends,
    getPendingFriendRequests,
    searchUsers,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    removeFriend,
    isFriend,
    hasPendingRequest,
    getUserById,
    currentUser,
  } = usePlans();

  const insets = useSafeAreaInsets();
  const colors = Colors.dark;

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'add'>('friends');

  const friends = getFriends();
  const pendingRequests = getPendingFriendRequests();
  const searchResults = searchUsers(searchQuery);

  const handleShareInvite = async () => {
    const message = `Add me on OpenInvite! My username is @${currentUser.username || 'yourname'}. Download the app and let's make plans together!`;

    try {
      await Share.share({ message });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleRemoveFriend = (userId: string, userName: string) => {
    Alert.alert(
      'Remove Friend',
      `Are you sure you want to remove ${userName} from your friends?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeFriend(userId),
        },
      ]
    );
  };

  const renderFriendsList = () => (
    <View>
      {friends.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="people-outline" size={48} color={colors.textSecondary} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No friends yet</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Search for friends or share your invite link
          </Text>
          <Pressable
            style={[styles.inviteButton, { backgroundColor: colors.accent }]}
            onPress={handleShareInvite}
          >
            <Ionicons name="share-outline" size={20} color="#fff" />
            <Text style={styles.inviteButtonText}>Share Invite Link</Text>
          </Pressable>
        </View>
      ) : (
        friends.map((friend) => (
          <View
            key={friend.id}
            style={[styles.friendRow, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Avatar user={friend} size={48} />
            <View style={styles.friendInfo}>
              <Text style={[styles.friendName, { color: colors.text }]}>{friend.name}</Text>
              {friend.username && (
                <Text style={[styles.friendUsername, { color: colors.textSecondary }]}>
                  @{friend.username}
                </Text>
              )}
            </View>
            <Pressable
              style={[styles.removeButton, { borderColor: colors.border }]}
              onPress={() => handleRemoveFriend(friend.id, friend.name)}
            >
              <Ionicons name="person-remove-outline" size={18} color={colors.textSecondary} />
            </Pressable>
          </View>
        ))
      )}
    </View>
  );

  const renderPendingRequests = () => (
    <View>
      {pendingRequests.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="mail-outline" size={48} color={colors.textSecondary} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No pending requests</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Friend requests will appear here
          </Text>
        </View>
      ) : (
        pendingRequests.map((request) => {
          const user = getUserById(request.fromUserId);
          if (!user) return null;

          return (
            <View
              key={request.id}
              style={[styles.requestRow, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <Avatar user={user} size={48} />
              <View style={styles.friendInfo}>
                <Text style={[styles.friendName, { color: colors.text }]}>{user.name}</Text>
                <Text style={[styles.requestText, { color: colors.textSecondary }]}>
                  Wants to be your friend
                </Text>
              </View>
              <View style={styles.requestButtons}>
                <Pressable
                  style={[styles.acceptButton, { backgroundColor: colors.success }]}
                  onPress={() => acceptFriendRequest(request.id)}
                >
                  <Ionicons name="checkmark" size={20} color="#fff" />
                </Pressable>
                <Pressable
                  style={[styles.declineButton, { borderColor: colors.border }]}
                  onPress={() => declineFriendRequest(request.id)}
                >
                  <Ionicons name="close" size={20} color={colors.textSecondary} />
                </Pressable>
              </View>
            </View>
          );
        })
      )}
    </View>
  );

  const renderAddFriends = () => (
    <View>
      <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Ionicons name="search" size={20} color={colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search by name or username"
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
          </Pressable>
        )}
      </View>

      {searchQuery.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="search-outline" size={48} color={colors.textSecondary} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Find Friends</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Search for people by name or username
          </Text>
          <View style={[styles.dividerRow, { borderColor: colors.border }]}>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            <Text style={[styles.dividerText, { color: colors.textSecondary }]}>or</Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          </View>
          <Pressable
            style={[styles.inviteButton, { backgroundColor: colors.accent }]}
            onPress={handleShareInvite}
          >
            <Ionicons name="share-outline" size={20} color="#fff" />
            <Text style={styles.inviteButtonText}>Invite via Text/Email</Text>
          </Pressable>
        </View>
      ) : searchResults.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            No users found for "{searchQuery}"
          </Text>
        </View>
      ) : (
        searchResults.map((user) => {
          const isAlreadyFriend = isFriend(user.id);
          const hasPending = hasPendingRequest(user.id);

          return (
            <View
              key={user.id}
              style={[styles.friendRow, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <Avatar user={user} size={48} />
              <View style={styles.friendInfo}>
                <Text style={[styles.friendName, { color: colors.text }]}>{user.name}</Text>
                {user.username && (
                  <Text style={[styles.friendUsername, { color: colors.textSecondary }]}>
                    @{user.username}
                  </Text>
                )}
              </View>
              {isAlreadyFriend ? (
                <View style={[styles.statusBadge, { backgroundColor: colors.success + '20' }]}>
                  <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                  <Text style={[styles.statusText, { color: colors.success }]}>Friends</Text>
                </View>
              ) : hasPending ? (
                <View style={[styles.statusBadge, { backgroundColor: colors.warning + '20' }]}>
                  <Ionicons name="time" size={16} color={colors.warning} />
                  <Text style={[styles.statusText, { color: colors.warning }]}>Pending</Text>
                </View>
              ) : (
                <Pressable
                  style={[styles.addButton, { backgroundColor: colors.accent }]}
                  onPress={() => sendFriendRequest(user.id)}
                >
                  <Ionicons name="person-add" size={18} color="#fff" />
                  <Text style={styles.addButtonText}>Add</Text>
                </Pressable>
              )}
            </View>
          );
        })
      )}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Tab Selector */}
      <View style={[styles.tabBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Pressable
          style={[
            styles.tab,
            activeTab === 'friends' && { backgroundColor: colors.accent + '20' },
          ]}
          onPress={() => setActiveTab('friends')}
        >
          <Ionicons
            name="people"
            size={18}
            color={activeTab === 'friends' ? colors.accent : colors.textSecondary}
          />
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'friends' ? colors.accent : colors.textSecondary },
            ]}
          >
            Friends ({friends.length})
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.tab,
            activeTab === 'requests' && { backgroundColor: colors.accent + '20' },
          ]}
          onPress={() => setActiveTab('requests')}
        >
          <Ionicons
            name="mail"
            size={18}
            color={activeTab === 'requests' ? colors.accent : colors.textSecondary}
          />
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'requests' ? colors.accent : colors.textSecondary },
            ]}
          >
            Requests {pendingRequests.length > 0 && `(${pendingRequests.length})`}
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.tab,
            activeTab === 'add' && { backgroundColor: colors.accent + '20' },
          ]}
          onPress={() => setActiveTab('add')}
        >
          <Ionicons
            name="person-add"
            size={18}
            color={activeTab === 'add' ? colors.accent : colors.textSecondary}
          />
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'add' ? colors.accent : colors.textSecondary },
            ]}
          >
            Add
          </Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'friends' && renderFriendsList()}
        {activeTab === 'requests' && renderPendingRequests()}
        {activeTab === 'add' && renderAddFriends()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    padding: 8,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  content: {
    padding: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
    marginTop: 8,
  },
  inviteButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
    gap: 12,
  },
  requestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
    gap: 12,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '500',
  },
  friendUsername: {
    fontSize: 14,
    marginTop: 2,
  },
  requestText: {
    fontSize: 13,
    marginTop: 2,
  },
  removeButton: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  requestButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  acceptButton: {
    padding: 10,
    borderRadius: 10,
  },
  declineButton: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '500',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 40,
    marginTop: 16,
    marginBottom: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 13,
    marginHorizontal: 12,
  },
});
