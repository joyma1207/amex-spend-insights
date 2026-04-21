/**
 * Amex Canada design tokens.
 * Source of truth: PRD §8.3.
 * Do not introduce new colours without updating this file.
 */
export const AmexColors = {
  // Brand
  blue: '#006FCF',
  blueLight: '#E6F1FB',
  blueDark: '#00457C',

  // Surfaces
  background: '#F5F7FA',
  surface: '#FFFFFF',
  surfaceMuted: '#EEF1F5',
  divider: '#E5E9EE',

  // Text
  textPrimary: '#1A1A1A',
  textSecondary: '#6B6B6B',
  textTertiary: '#A0A4AB',
  textInverse: '#FFFFFF',

  // Semantic
  positive: '#1D7A3A', // delta down (good — spent less)
  negative: '#C0392B', // delta up   (spent more)
  warning: '#F39C12',  // Cobalt cap >=90%

  // Category palette (PRD §15.1)
  category: {
    dining: '#E87722',
    groceries: '#2ECC71',
    streaming: '#1ABC9C',
    transit: '#8E44AD',
    travel: '#006FCF',
    shopping: '#E74C3C',
    entertainment: '#F39C12',
    other: '#95A5A6',
  },
} as const;

export type CategoryColorKey = keyof typeof AmexColors.category;
