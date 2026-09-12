import { PixelRatio } from 'react-native';

/**
 * Kona "Reading Nook" design tokens.
 * Warm palette, consistent spacing, accessibility-ready type scale.
 */

export const colors = {
  cocoa: '#6D5B4B',
  honey: '#C4956A',
  cream: '#FBF8F4',
  linen: '#FFFDFB',
  espresso: '#3B2F2F',
  dusty: '#9C8B7E',
  sage: '#5A8A6E',
  rosewood: '#C0503C',
  parchment: '#F5EDE3',
  white: '#FFFFFF',
  transparent: 'transparent',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const elevation = {
  none: {},
  low: {
    shadowColor: '#3B2F2F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  medium: {
    shadowColor: '#3B2F2F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  high: {
    shadowColor: '#3B2F2F',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 8,
  },
} as const;

export const HIT_TARGET = 44;
export const MAX_FONT_SIZE_MULTIPLIER = 1.5;

const BASE_FONT_SIZES = {
  hero: 28,
  title: 20,
  subtitle: 17,
  body: 15,
  caption: 12,
  micro: 10,
} as const;

export type FontToken = keyof typeof BASE_FONT_SIZES;

/**
 * Returns a font size scaled by the device's accessibility font-scale setting,
 * clamped to MAX_FONT_SIZE_MULTIPLIER to prevent extreme layout breakage.
 */
export function scaledFontSize(token: FontToken): number {
  const scale = Math.min(PixelRatio.getFontScale(), MAX_FONT_SIZE_MULTIPLIER);
  return Math.round(BASE_FONT_SIZES[token] * scale);
}

export const lightTokens = {
  colors,
  spacing,
  radii,
  elevation,
} as const;

/** Placeholder structure for a future dark-mode pass (out of scope for AP1). */
export const darkTokens = {
  colors: {
    ...colors,
    cream: '#2A2420',
    linen: '#3B322C',
    espresso: '#F5EDE3',
    parchment: '#3A332C',
    dusty: '#C4B8AE',
  },
  spacing,
  radii,
  elevation,
} as const;
