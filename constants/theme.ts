/**
 * OpenInvite Theme
 * Dark theme with accent colors for a modern, clean look
 */

import { Platform } from 'react-native';

// Brand colors
const accent = '#6366F1'; // Indigo
const accentLight = '#818CF8';
const success = '#10B981'; // Green for available spots
const warning = '#F59E0B'; // Amber for deadlines
const danger = '#EF4444'; // Red for full/expired

export const Colors = {
  light: {
    text: '#11181C',
    textSecondary: '#687076',
    background: '#F8FAFC',
    surface: '#FFFFFF',
    surfaceSecondary: '#F1F5F9',
    border: '#E2E8F0',
    tint: accent,
    accent,
    accentLight,
    success,
    warning,
    danger,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: accent,
  },
  dark: {
    text: '#F8FAFC',
    textSecondary: '#94A3B8',
    background: '#0F172A',
    surface: '#1E293B',
    surfaceSecondary: '#334155',
    border: '#334155',
    tint: accent,
    accent,
    accentLight,
    success,
    warning,
    danger,
    icon: '#94A3B8',
    tabIconDefault: '#64748B',
    tabIconSelected: accent,
  },
};

export type ThemeColors = typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
