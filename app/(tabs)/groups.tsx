import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { usePlans } from '@/context/PlansContext';
import { Colors } from '@/constants/theme';
import { Avatar } from '@/components/Avatar';
import { Group, User, GroupType, GroupInvite } from '@/types/plan';

export default function GroupsScreen() {
  const {
    sharedGroups,
    personalGroups,
    users,
    currentUser,
    addGroup,
    updateGroup,
    deleteGroup,
    leaveSharedGroup,
    pendingInvites,
    inviteToGroup,
    acceptInvite,
    declineInvite,
  } = usePlans();
  const insets = useSafeAreaInsets();
  const colors = Colors.dark;

  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupType, setNewGroupType] = useState<GroupType>('personal');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [newGroupMembers, setNewGroupMembers] = useState<string[]>([]);
  const [createStep, setCreateStep] = useState<'type' | 'details' | 'members'>('type');
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showSharedGroupModal, setShowSharedGroupModal] = useState(false);
  const [selectedSharedGroup, setSelectedSharedGroup] = useState<Group | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [invitingGroup, setInvitingGroup] = useState<Group | null>(null);
  const [selectedInviteMembers, setSelectedInviteMembers] = useState<string[]>([]);

  const resetCreateModal = () => {
    setNewGroupName('');
    setNewGroupType('personal');
    setNewGroupDescription('');
    setNewGroupMembers([]);
    setCreateStep('type');
    setShowNewGroupModal(false);
  };

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }
    addGroup(newGroupName.trim(), newGroupType, {
      memberIds: newGroupMembers,
      description: newGroupType === 'shared' ? newGroupDescription.trim() || undefined : undefined,
    });
    resetCreateModal();
  };

  const toggleNewGroupMember = (userId: string) => {
    setNewGroupMembers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleDeleteGroup = (group: Group) => {
    Alert.alert(
      'Delete Group',
      `Are you sure you want to delete "${group.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteGroup(group.id),
        },
      ]
    );
  };

  const handleLeaveGroup = (group: Group) => {
    Alert.alert(
      'Leave Group',
      `Are you sure you want to leave "${group.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: () => leaveSharedGroup(group.id),
        },
      ]
    );
  };

  const handleEditMembers = (group: Group) => {
    setEditingGroup(group);
    setShowMembersModal(true);
  };

  const handleViewSharedGroup = (group: Group) => {
    setSelectedSharedGroup(group);
    setShowSharedGroupModal(true);
  };

  const handleOpenInviteModal = (group: Group) => {
    setInvitingGroup(group);
    setSelectedInviteMembers([]);
    setShowInviteModal(true);
  };

  const handleSendInvites = () => {
    if (invitingGroup && selectedInviteMembers.length > 0) {
      inviteToGroup(invitingGroup.id, selectedInviteMembers);
      Alert.alert(
        'Invites Sent',
        `Invited ${selectedInviteMembers.length} friend${selectedInviteMembers.length > 1 ? 's' : ''} to ${invitingGroup.name}`
      );
    }
    setShowInviteModal(false);
    setInvitingGroup(null);
    setSelectedInviteMembers([]);
  };

  const toggleInviteMember = (userId: string) => {
    setSelectedInviteMembers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const getInvitableUsers = (group: Group): User[] => {
    // Users who are not already members
    return users.filter((user) => !group.memberIds.includes(user.id));
  };

  const toggleMember = (userId: string) => {
    if (!editingGroup) return;

    const isMember = editingGroup.memberIds.includes(userId);
    const newMemberIds = isMember
      ? editingGroup.memberIds.filter((id) => id !== userId)
      : [...editingGroup.memberIds, userId];

    updateGroup(editingGroup.id, { memberIds: newMemberIds });
    setEditingGroup({ ...editingGroup, memberIds: newMemberIds });
  };

  const getMemberCount = (group: Group) => {
    return group.memberIds.length;
  };

  const getMemberNames = (group: Group, includeMe = false): string => {
    if (group.memberIds.length === 0) return 'No members';
    const allUsers = includeMe ? [currentUser, ...users] : users;
    const names = group.memberIds
      .map((id) => {
        if (id === 'me') return 'You';
        return allUsers.find((u) => u.id === id)?.name.split(' ')[0];
      })
      .filter(Boolean);
    if (names.length <= 3) return names.join(', ');
    return `${names.slice(0, 3).join(', ')} +${names.length - 3}`;
  };

  const getSharedGroupMembers = (group: Group): User[] => {
    const allUsers = [currentUser, ...users];
    return group.memberIds
      .map((id) => allUsers.find((u) => u.id === id))
      .filter((u): u is User => !!u);
  };

  const renderSharedGroupCard = (group: Group) => (
    <Pressable
      key={group.id}
      style={[styles.groupCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={() => handleViewSharedGroup(group)}
    >
      <View style={styles.groupHeader}>
        <View style={styles.groupInfo}>
          <View style={styles.groupNameRow}>
            <Ionicons name="people-circle" size={20} color={colors.accent} style={{ marginRight: 6 }} />
            <Text style={[styles.groupName, { color: colors.text }]}>{group.name}</Text>
          </View>
          <Text style={[styles.memberCount, { color: colors.textSecondary }]}>
            {getMemberCount(group)} member{getMemberCount(group) !== 1 ? 's' : ''}
          </Text>
        </View>
        <Pressable
          style={[styles.actionButton, { backgroundColor: colors.danger + '20' }]}
          onPress={() => handleLeaveGroup(group)}
        >
          <Ionicons name="exit-outline" size={18} color={colors.danger} />
        </Pressable>
      </View>
      {group.description && (
        <Text style={[styles.groupDescription, { color: colors.textSecondary }]}>
          {group.description}
        </Text>
      )}
      <Text style={[styles.memberNames, { color: colors.textSecondary }]}>
        {getMemberNames(group, true)}
      </Text>
    </Pressable>
  );

  const renderPersonalGroupCard = (group: Group) => (
    <View
      key={group.id}
      style={[styles.groupCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      <View style={styles.groupHeader}>
        <View style={styles.groupInfo}>
          <View style={styles.groupNameRow}>
            <Ionicons name="folder" size={18} color={colors.textSecondary} style={{ marginRight: 6 }} />
            <Text style={[styles.groupName, { color: colors.text }]}>{group.name}</Text>
          </View>
          <Text style={[styles.memberCount, { color: colors.textSecondary }]}>
            {getMemberCount(group)} contact{getMemberCount(group) !== 1 ? 's' : ''}
          </Text>
        </View>
        <View style={styles.groupActions}>
          <Pressable
            style={[styles.actionButton, { backgroundColor: colors.accent + '20' }]}
            onPress={() => handleEditMembers(group)}
          >
            <Ionicons name="people" size={18} color={colors.accent} />
          </Pressable>
          <Pressable
            style={[styles.actionButton, { backgroundColor: colors.danger + '20' }]}
            onPress={() => handleDeleteGroup(group)}
          >
            <Ionicons name="trash-outline" size={18} color={colors.danger} />
          </Pressable>
        </View>
      </View>
      <Text style={[styles.memberNames, { color: colors.textSecondary }]}>
        {getMemberNames(group)}
      </Text>
    </View>
  );

  const isEmpty = sharedGroups.length === 0 && personalGroups.length === 0 && pendingInvites.length === 0;

  const renderPendingInvite = (invite: GroupInvite) => (
    <View
      key={invite.id}
      style={[styles.inviteCard, { backgroundColor: colors.accent + '15', borderColor: colors.accent + '40' }]}
    >
      <View style={styles.inviteInfo}>
        <View style={styles.inviteHeader}>
          <Ionicons name="mail" size={18} color={colors.accent} />
          <Text style={[styles.inviteTitle, { color: colors.text }]}>{invite.groupName}</Text>
        </View>
        <Text style={[styles.inviteFrom, { color: colors.textSecondary }]}>
          Invited by {invite.invitedByName}
        </Text>
      </View>
      <View style={styles.inviteActions}>
        <Pressable
          style={[styles.inviteButton, styles.acceptButton, { backgroundColor: colors.accent }]}
          onPress={() => acceptInvite(invite.id)}
        >
          <Ionicons name="checkmark" size={18} color="#fff" />
        </Pressable>
        <Pressable
          style={[styles.inviteButton, styles.declineButton, { backgroundColor: colors.danger + '20' }]}
          onPress={() => declineInvite(invite.id)}
        >
          <Ionicons name="close" size={18} color={colors.danger} />
        </Pressable>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {isEmpty ? (
        <View style={styles.emptyState}>
          <Ionicons name="people-outline" size={64} color={colors.textSecondary} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No groups yet</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Create personal groups to organize your contacts
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 80 }]}
          showsVerticalScrollIndicator={false}
        >
          {pendingInvites.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionHeader, { color: colors.accent }]}>
                PENDING INVITES ({pendingInvites.length})
              </Text>
              <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
                You have been invited to join these groups
              </Text>
              {pendingInvites.map(renderPendingInvite)}
            </View>
          )}

          {sharedGroups.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>
                SHARED GROUPS
              </Text>
              <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
                Groups you are a member of
              </Text>
              {sharedGroups.map(renderSharedGroupCard)}
            </View>
          )}

          {personalGroups.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>
                MY GROUPS
              </Text>
              <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
                Your personal contact groups
              </Text>
              {personalGroups.map(renderPersonalGroupCard)}
            </View>
          )}
        </ScrollView>
      )}

      <Pressable
        style={({ pressed }) => [
          styles.fab,
          { backgroundColor: colors.accent, bottom: insets.bottom + 16 },
          pressed && styles.fabPressed,
        ]}
        onPress={() => {
          setCreateStep('type');
          setShowNewGroupModal(true);
        }}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </Pressable>

      {/* Create Group Modal */}
      <Modal
        visible={showNewGroupModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={resetCreateModal}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          {/* Step 1: Choose Type */}
          {createStep === 'type' && (
            <>
              <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                <Pressable onPress={resetCreateModal}>
                  <Text style={[styles.modalCancel, { color: colors.textSecondary }]}>Cancel</Text>
                </Pressable>
                <Text style={[styles.modalTitle, { color: colors.text }]}>New Group</Text>
                <View style={{ width: 50 }} />
              </View>
              <View style={styles.modalContent}>
                <Text style={[styles.typeSelectTitle, { color: colors.text }]}>
                  What type of group?
                </Text>

                <Pressable
                  style={[
                    styles.typeOption,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                  ]}
                  onPress={() => {
                    setNewGroupType('shared');
                    setCreateStep('details');
                  }}
                >
                  <View style={[styles.typeIconContainer, { backgroundColor: colors.accent + '20' }]}>
                    <Ionicons name="people-circle" size={28} color={colors.accent} />
                  </View>
                  <View style={styles.typeOptionContent}>
                    <Text style={[styles.typeOptionTitle, { color: colors.text }]}>
                      Shared Group
                    </Text>
                    <Text style={[styles.typeOptionDescription, { color: colors.textSecondary }]}>
                      Create a group and invite friends. Everyone can see the group and its members.
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                </Pressable>

                <Pressable
                  style={[
                    styles.typeOption,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                  ]}
                  onPress={() => {
                    setNewGroupType('personal');
                    setCreateStep('details');
                  }}
                >
                  <View style={[styles.typeIconContainer, { backgroundColor: colors.textSecondary + '20' }]}>
                    <Ionicons name="folder" size={28} color={colors.textSecondary} />
                  </View>
                  <View style={styles.typeOptionContent}>
                    <Text style={[styles.typeOptionTitle, { color: colors.text }]}>
                      Personal Group
                    </Text>
                    <Text style={[styles.typeOptionDescription, { color: colors.textSecondary }]}>
                      Organize your contacts privately. Only you can see this group.
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                </Pressable>
              </View>
            </>
          )}

          {/* Step 2: Details */}
          {createStep === 'details' && (
            <>
              <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                <Pressable onPress={() => setCreateStep('type')}>
                  <Ionicons name="chevron-back" size={24} color={colors.accent} />
                </Pressable>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  {newGroupType === 'shared' ? 'Shared Group' : 'Personal Group'}
                </Text>
                <Pressable
                  onPress={() => {
                    if (!newGroupName.trim()) {
                      Alert.alert('Error', 'Please enter a group name');
                      return;
                    }
                    if (newGroupType === 'shared') {
                      setCreateStep('members');
                    } else {
                      handleCreateGroup();
                    }
                  }}
                >
                  <Text style={[styles.modalDone, { color: colors.accent }]}>
                    {newGroupType === 'shared' ? 'Next' : 'Create'}
                  </Text>
                </Pressable>
              </View>
              <ScrollView style={styles.modalScrollContent}>
                <View style={styles.modalContent}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>Group Name</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                    value={newGroupName}
                    onChangeText={setNewGroupName}
                    placeholder={newGroupType === 'shared' ? 'e.g., Weekend Crew' : 'e.g., Close Friends'}
                    placeholderTextColor={colors.textSecondary}
                    autoFocus
                  />

                  {newGroupType === 'shared' && (
                    <>
                      <Text style={[styles.inputLabel, { color: colors.text, marginTop: 20 }]}>
                        Description (optional)
                      </Text>
                      <TextInput
                        style={[
                          styles.input,
                          styles.textArea,
                          { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border },
                        ]}
                        value={newGroupDescription}
                        onChangeText={setNewGroupDescription}
                        placeholder="What's this group about?"
                        placeholderTextColor={colors.textSecondary}
                        multiline
                        numberOfLines={3}
                      />
                    </>
                  )}

                  <Text style={[styles.helpText, { color: colors.textSecondary }]}>
                    {newGroupType === 'shared'
                      ? 'Shared groups are visible to all members. You can invite friends in the next step.'
                      : 'Personal groups help you organize your contacts. Only you can see these groups.'}
                  </Text>
                </View>
              </ScrollView>
            </>
          )}

          {/* Step 3: Invite Members (Shared only) */}
          {createStep === 'members' && (
            <>
              <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                <Pressable onPress={() => setCreateStep('details')}>
                  <Ionicons name="chevron-back" size={24} color={colors.accent} />
                </Pressable>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Invite Friends</Text>
                <Pressable onPress={handleCreateGroup}>
                  <Text style={[styles.modalDone, { color: colors.accent }]}>Create</Text>
                </Pressable>
              </View>
              <ScrollView style={styles.modalScrollContent}>
                <View style={styles.modalContent}>
                  <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                    SELECT FRIENDS TO INVITE ({newGroupMembers.length} selected)
                  </Text>
                  {users.map((user) => {
                    const isSelected = newGroupMembers.includes(user.id);
                    return (
                      <Pressable
                        key={user.id}
                        style={[styles.memberRow, { borderBottomColor: colors.border }]}
                        onPress={() => toggleNewGroupMember(user.id)}
                      >
                        <Avatar user={user} size={40} />
                        <Text style={[styles.memberName, { color: colors.text }]}>{user.name}</Text>
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
                  <Text style={[styles.helpText, { color: colors.textSecondary, marginTop: 16 }]}>
                    You can always invite more friends later.
                  </Text>
                </View>
              </ScrollView>
            </>
          )}
        </View>
      </Modal>

      {/* Edit Members Modal (Personal Groups) */}
      <Modal
        visible={showMembersModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowMembersModal(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Pressable onPress={() => setShowMembersModal(false)}>
              <Text style={[styles.modalCancel, { color: colors.textSecondary }]}>Close</Text>
            </Pressable>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {editingGroup?.name}
            </Text>
            <View style={{ width: 50 }} />
          </View>
          <View style={styles.modalContent}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              SELECT CONTACTS
            </Text>
            {users.map((user) => {
              const isMember = editingGroup?.memberIds.includes(user.id);
              return (
                <Pressable
                  key={user.id}
                  style={[styles.memberRow, { borderBottomColor: colors.border }]}
                  onPress={() => toggleMember(user.id)}
                >
                  <Avatar user={user} size={40} />
                  <Text style={[styles.memberName, { color: colors.text }]}>{user.name}</Text>
                  <View
                    style={[
                      styles.checkbox,
                      { borderColor: isMember ? colors.accent : colors.border },
                      isMember && { backgroundColor: colors.accent },
                    ]}
                  >
                    {isMember && <Ionicons name="checkmark" size={16} color="#fff" />}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
      </Modal>

      {/* View Shared Group Modal */}
      <Modal
        visible={showSharedGroupModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowSharedGroupModal(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Pressable onPress={() => setShowSharedGroupModal(false)}>
              <Text style={[styles.modalCancel, { color: colors.textSecondary }]}>Close</Text>
            </Pressable>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {selectedSharedGroup?.name}
            </Text>
            <Pressable
              onPress={() => {
                if (selectedSharedGroup) {
                  setShowSharedGroupModal(false);
                  handleOpenInviteModal(selectedSharedGroup);
                }
              }}
            >
              <Ionicons name="person-add" size={22} color={colors.accent} />
            </Pressable>
          </View>
          <ScrollView style={styles.modalScrollContent}>
            <View style={styles.modalContent}>
              {selectedSharedGroup?.description && (
                <Text style={[styles.sharedGroupDescription, { color: colors.text }]}>
                  {selectedSharedGroup.description}
                </Text>
              )}

              {/* Invite Button */}
              {selectedSharedGroup && getInvitableUsers(selectedSharedGroup).length > 0 && (
                <Pressable
                  style={[styles.inviteFriendsButton, { backgroundColor: colors.accent }]}
                  onPress={() => {
                    setShowSharedGroupModal(false);
                    handleOpenInviteModal(selectedSharedGroup);
                  }}
                >
                  <Ionicons name="person-add" size={18} color="#fff" />
                  <Text style={styles.inviteFriendsButtonText}>Invite Friends</Text>
                </Pressable>
              )}

              <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                MEMBERS ({selectedSharedGroup?.memberIds.length || 0})
              </Text>
              {selectedSharedGroup && getSharedGroupMembers(selectedSharedGroup).map((user) => (
                <View
                  key={user.id}
                  style={[styles.memberRow, { borderBottomColor: colors.border }]}
                >
                  <Avatar user={user} size={40} />
                  <Text style={[styles.memberName, { color: colors.text }]}>
                    {user.id === 'me' ? 'You' : user.name}
                  </Text>
                  {user.id === 'me' && (
                    <View style={[styles.youBadge, { backgroundColor: colors.accent + '20' }]}>
                      <Text style={[styles.youBadgeText, { color: colors.accent }]}>You</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Invite to Shared Group Modal */}
      <Modal
        visible={showInviteModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowInviteModal(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Pressable onPress={() => setShowInviteModal(false)}>
              <Text style={[styles.modalCancel, { color: colors.textSecondary }]}>Cancel</Text>
            </Pressable>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Invite Friends</Text>
            <Pressable
              onPress={handleSendInvites}
              disabled={selectedInviteMembers.length === 0}
            >
              <Text
                style={[
                  styles.modalDone,
                  { color: selectedInviteMembers.length > 0 ? colors.accent : colors.textSecondary },
                ]}
              >
                Send
              </Text>
            </Pressable>
          </View>
          <ScrollView style={styles.modalScrollContent}>
            <View style={styles.modalContent}>
              <Text style={[styles.inviteToLabel, { color: colors.textSecondary }]}>
                Invite to
              </Text>
              <Text style={[styles.inviteToGroup, { color: colors.text }]}>
                {invitingGroup?.name}
              </Text>

              <Text style={[styles.sectionTitle, { color: colors.textSecondary, marginTop: 24 }]}>
                SELECT FRIENDS ({selectedInviteMembers.length} selected)
              </Text>

              {invitingGroup && getInvitableUsers(invitingGroup).length === 0 ? (
                <Text style={[styles.noUsersText, { color: colors.textSecondary }]}>
                  All your friends are already members of this group.
                </Text>
              ) : (
                invitingGroup && getInvitableUsers(invitingGroup).map((user) => {
                  const isSelected = selectedInviteMembers.includes(user.id);
                  return (
                    <Pressable
                      key={user.id}
                      style={[styles.memberRow, { borderBottomColor: colors.border }]}
                      onPress={() => toggleInviteMember(user.id)}
                    >
                      <Avatar user={user} size={40} />
                      <Text style={[styles.memberName, { color: colors.text }]}>{user.name}</Text>
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
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    marginBottom: 12,
  },
  groupCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  groupInfo: {
    flex: 1,
  },
  groupNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  groupName: {
    fontSize: 18,
    fontWeight: '600',
  },
  memberCount: {
    fontSize: 13,
    marginLeft: 26,
  },
  groupDescription: {
    fontSize: 14,
    marginBottom: 8,
    marginLeft: 26,
  },
  groupActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberNames: {
    fontSize: 14,
    marginLeft: 26,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
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
  inputLabel: {
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
  helpText: {
    fontSize: 13,
    marginTop: 12,
    lineHeight: 18,
  },
  modalScrollContent: {
    flex: 1,
  },
  typeSelectTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  typeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  typeOptionContent: {
    flex: 1,
  },
  typeOptionTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  typeOptionDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 14,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  sharedGroupDescription: {
    fontSize: 15,
    marginBottom: 20,
    lineHeight: 22,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  memberName: {
    flex: 1,
    fontSize: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  youBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  youBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  // Invite styles
  inviteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  inviteInfo: {
    flex: 1,
  },
  inviteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  inviteTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  inviteFrom: {
    fontSize: 13,
    marginLeft: 26,
  },
  inviteActions: {
    flexDirection: 'row',
    gap: 8,
  },
  inviteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptButton: {},
  declineButton: {},
  inviteFriendsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
    gap: 8,
  },
  inviteFriendsButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  inviteToLabel: {
    fontSize: 13,
    marginBottom: 4,
  },
  inviteToGroup: {
    fontSize: 20,
    fontWeight: '600',
  },
  noUsersText: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 20,
  },
});
