import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { PlansProvider } from '@/context/PlansContext';
import { Colors } from '@/constants/theme';

// Customize the dark theme
const OpenInviteTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: Colors.dark.accent,
    background: Colors.dark.background,
    card: Colors.dark.surface,
    text: Colors.dark.text,
    border: Colors.dark.border,
  },
};

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  return (
    <PlansProvider>
      <ThemeProvider value={OpenInviteTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="plan/[id]"
            options={{
              presentation: 'card',
              headerShown: true,
              headerTitle: 'Plan Details',
              headerBackTitle: 'Back',
              headerStyle: { backgroundColor: Colors.dark.background },
              headerTintColor: Colors.dark.text,
            }}
          />
          <Stack.Screen
            name="add-plan"
            options={{
              presentation: 'modal',
              headerShown: true,
              headerTitle: 'New Plan',
              headerStyle: { backgroundColor: Colors.dark.surface },
              headerTintColor: Colors.dark.text,
            }}
          />
        </Stack>
        <StatusBar style="light" />
      </ThemeProvider>
    </PlansProvider>
  );
}
