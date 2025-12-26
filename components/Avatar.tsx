import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { User } from '@/types/plan';

interface AvatarProps {
  user: User;
  size?: number;
}

export function Avatar({ user, size = 36 }: AvatarProps) {
  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: user.avatarColor,
        },
      ]}
    >
      <Text style={[styles.initials, { fontSize: size * 0.4 }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    color: '#fff',
    fontWeight: '600',
  },
});
