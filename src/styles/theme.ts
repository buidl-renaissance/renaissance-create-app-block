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
  shadow: 'rgba(0, 0, 0, 0.5)',
  overlay: 'rgba(0, 0, 0, 0.8)',
  glow: 'rgba(167, 139, 250, 0.4)',
  glowSecondary: 'rgba(232, 121, 249, 0.4)',
};
