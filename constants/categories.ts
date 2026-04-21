import type { CategoryId, EarnRateMultiplier } from '@/types/spendInsights';
import { AmexColors } from './amexColors';

export interface CategoryMeta {
  id: CategoryId;
  /** English label */
  label: string;
  /** French (Quebec) label — PRD FR-16 */
  labelFr: string;
  color: string;
  /** Cobalt earn rate per PRD §15.1 */
  cobaltEarnRate: EarnRateMultiplier;
  /** Single-character emoji glyph used as inline icon (no asset dependency) */
  glyph: string;
  /** Description shown in category detail header */
  description: string;
}

export const CATEGORY_META: Record<CategoryId, CategoryMeta> = {
  dining: {
    id: 'dining',
    label: 'Dining & Drinks',
    labelFr: 'Restos et boissons',
    color: AmexColors.category.dining,
    cobaltEarnRate: 5,
    glyph: '🍽',
    description: 'Restaurants, bars, cafés, DoorDash & UberEats',
  },
  groceries: {
    id: 'groceries',
    label: 'Groceries',
    labelFr: 'Épicerie',
    color: AmexColors.category.groceries,
    cobaltEarnRate: 5,
    glyph: '🛒',
    description: 'Grocery stores, Voila, HelloFresh & meal kits',
  },
  streaming: {
    id: 'streaming',
    label: 'Streaming',
    labelFr: 'Diffusion en continu',
    color: AmexColors.category.streaming,
    cobaltEarnRate: 3,
    glyph: '🎬',
    description: 'Netflix, Spotify, Apple TV+, Disney+, Crave',
  },
  transit: {
    id: 'transit',
    label: 'Transit & Gas',
    labelFr: 'Transport et essence',
    color: AmexColors.category.transit,
    cobaltEarnRate: 2,
    glyph: '🚇',
    description: 'TTC, GO Transit, Uber, Lyft, gas, parking',
  },
  travel: {
    id: 'travel',
    label: 'Travel',
    labelFr: 'Voyages',
    color: AmexColors.category.travel,
    cobaltEarnRate: 1,
    glyph: '✈️',
    description: 'Airlines, hotels, Airbnb, car rental',
  },
  shopping: {
    id: 'shopping',
    label: 'Shopping',
    labelFr: 'Magasinage',
    color: AmexColors.category.shopping,
    cobaltEarnRate: 1,
    glyph: '🛍',
    description: 'Retail, clothing, electronics, Amazon.ca',
  },
  entertainment: {
    id: 'entertainment',
    label: 'Entertainment',
    labelFr: 'Divertissement',
    color: AmexColors.category.entertainment,
    cobaltEarnRate: 1,
    glyph: '🎟',
    description: 'Concerts, Cineplex, sports & events',
  },
  other: {
    id: 'other',
    label: 'Other',
    labelFr: 'Autre',
    color: AmexColors.category.other,
    cobaltEarnRate: 1,
    glyph: '•',
    description: 'All transactions not classified above',
  },
};

/** Display order on the main insights screen — matches PRD §15.1 */
export const CATEGORY_ORDER: CategoryId[] = [
  'dining',
  'groceries',
  'streaming',
  'transit',
  'travel',
  'shopping',
  'entertainment',
  'other',
];
