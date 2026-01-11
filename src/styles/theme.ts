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
  }
}

// Renaissance City - Light Theme
// Inspired by Florentine architecture and classical art
export const lightTheme: DefaultTheme = {
  background: '#FAF7F2',      // Warm parchment
  backgroundAlt: '#F0EBE3',   // Aged paper
  text: '#2C1810',            // Rich sepia brown
  textSecondary: '#6B5344',   // Muted terracotta
  border: '#D4C8BB',          // Sandstone
  borderRadius: '12px',
  surface: '#FFFFFF',
  accent: '#9E3B1D',          // Burnt sienna (Renaissance red)
  accentGold: '#B8860B',      // Classical gold
  shadow: 'rgba(44, 24, 16, 0.12)',
  overlay: 'rgba(44, 24, 16, 0.6)',
};

// Renaissance City - Dark Theme
// Inspired by candlelit chambers and rich tapestries
export const darkTheme: DefaultTheme = {
  background: '#1A1512',      // Deep espresso
  backgroundAlt: '#2A2320',   // Dark walnut
  text: '#F5F0E8',            // Warm ivory
  textSecondary: '#B8A99A',   // Dusty rose
  border: '#3D342D',          // Dark bronze
  borderRadius: '12px',
  surface: '#252019',         // Rich mahogany
  accent: '#C9593A',          // Terracotta flame
  accentGold: '#DAA520',      // Golden rod
  shadow: 'rgba(0, 0, 0, 0.4)',
  overlay: 'rgba(0, 0, 0, 0.75)',
};
