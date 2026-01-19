import { DefaultTheme } from 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    background: string;
    backgroundAlt: string;
    text: string;
    textSecondary: string;
    border: string;
    borderRadius: string;
    surface: string;
    accent: string;
    accentGold: string;
    accentMuted: string;
    accentHover: string;
    danger: string;
    dangerMuted: string;
    success: string;
    shadow: string;
    overlay: string;
    glow: string;
    glowSecondary: string;
  }
}

// Neon Cube - Light Theme
// Clean and modern with purple accents
export const lightTheme: DefaultTheme = {
  background: '#F8F7FC',
  backgroundAlt: '#EFEDF5',
  text: '#1A1625',
  textSecondary: '#64607D',
  border: '#E0DCF0',
  borderRadius: '12px',
  surface: '#FFFFFF',
  accent: '#8B5CF6',           // Violet
  accentGold: '#D946EF',       // Magenta/fuchsia
  accentMuted: 'rgba(139, 92, 246, 0.1)',
  accentHover: '#7C3AED',      // Darker violet
  danger: '#EF4444',           // Red
  dangerMuted: 'rgba(239, 68, 68, 0.1)',
  success: '#22C55E',          // Green
  shadow: 'rgba(139, 92, 246, 0.15)',
  overlay: 'rgba(26, 22, 37, 0.6)',
  glow: 'rgba(139, 92, 246, 0.5)',
  glowSecondary: 'rgba(217, 70, 239, 0.5)',
};

// Neon Cube - Dark Theme
// Inspired by the glowing cube logo
export const darkTheme: DefaultTheme = {
  background: '#08080C',       // Near black with subtle blue
  backgroundAlt: '#0E0E14',    // Slightly lighter
  text: '#F4F4F8',             // Bright white
  textSecondary: '#9896A8',    // Muted lavender
  border: '#1E1E2A',           // Dark purple-gray
  borderRadius: '12px',
  surface: '#12121A',          // Dark surface
  accent: '#A78BFA',           // Soft violet
  accentGold: '#E879F9',       // Bright magenta
  accentMuted: 'rgba(167, 139, 250, 0.15)',
  accentHover: '#C4B5FD',      // Lighter violet
  danger: '#F87171',           // Softer red for dark mode
  dangerMuted: 'rgba(248, 113, 113, 0.15)',
  success: '#4ADE80',          // Softer green for dark mode
  shadow: 'rgba(0, 0, 0, 0.5)',
  overlay: 'rgba(0, 0, 0, 0.8)',
  glow: 'rgba(167, 139, 250, 0.4)',
  glowSecondary: 'rgba(232, 121, 249, 0.4)',
};
