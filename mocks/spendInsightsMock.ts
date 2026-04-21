import type {
  CategoryInsight,
  SpendInsightsResponse,
} from '@/types/spendInsights';

/**
 * Mock data per PRD §9.3 — Cobalt cardmember in Toronto.
 * Returns a response per billing month so navigation arrows / trend bars feel real.
 *
 * History covers 6 months: Oct 2025 → Mar 2026 (current).
 * Months earlier than Oct 2025 return undefined (PRD §7.3 history limit).
 */

interface MockMonth {
  billingMonth: string;
  start: string;
  end: string;
  totalSpend: number;
  totalMR: number;
  categories: Array<Omit<CategoryInsight, 'monthOverMonthDelta'>>;
}

const MONTHS: MockMonth[] = [
  // ── Oct 2025 — establishing baseline
  {
    billingMonth: '2025-10',
    start: '2025-10-01',
    end: '2025-10-31',
    totalSpend: 1980.25,
    totalMR: 6940,
    categories: [
      cat('dining', 690, 3450, 5, 690, 2500, [
        { name: 'Pai Northern Thai', transactionCount: 5, totalSpend: 184.5 },
        { name: 'Bar Raval', transactionCount: 3, totalSpend: 142.0 },
        { name: 'DoorDash', transactionCount: 7, totalSpend: 156.25 },
      ]),
      cat('groceries', 305, 1525, 5, 305, 2500, [
        { name: 'Loblaws', transactionCount: 3, totalSpend: 168.4 },
        { name: 'Voila by Sobeys', transactionCount: 2, totalSpend: 92.6 },
        { name: 'Farm Boy', transactionCount: 1, totalSpend: 44.0 },
      ]),
      cat('streaming', 42, 126, 3, undefined, undefined, [
        { name: 'Netflix', transactionCount: 1, totalSpend: 20.99 },
        { name: 'Spotify', transactionCount: 1, totalSpend: 10.99 },
        { name: 'Crave', transactionCount: 1, totalSpend: 9.99 },
      ]),
      cat('transit', 165, 330, 2, undefined, undefined, [
        { name: 'TTC Presto', transactionCount: 4, totalSpend: 64.0 },
        { name: 'Uber', transactionCount: 6, totalSpend: 78.5 },
        { name: 'Green P Parking', transactionCount: 3, totalSpend: 22.5 },
      ]),
      cat('travel', 290, 290, 1, undefined, undefined, [
        { name: 'Air Canada', transactionCount: 1, totalSpend: 245.0 },
        { name: 'Airbnb', transactionCount: 1, totalSpend: 45.0 },
      ]),
      cat('shopping', 268, 268, 1, undefined, undefined, [
        { name: 'Amazon.ca', transactionCount: 4, totalSpend: 142.3 },
        { name: 'Indigo', transactionCount: 1, totalSpend: 64.5 },
        { name: 'MEC', transactionCount: 1, totalSpend: 61.2 },
      ]),
      cat('entertainment', 110, 110, 1, undefined, undefined, [
        { name: 'Cineplex', transactionCount: 2, totalSpend: 56.0 },
        { name: 'Ticketmaster', transactionCount: 1, totalSpend: 54.0 },
      ]),
      cat('other', 110.25, 110, 1, undefined, undefined, [
        { name: 'Shoppers Drug Mart', transactionCount: 2, totalSpend: 64.25 },
        { name: 'Bell Mobility', transactionCount: 1, totalSpend: 46.0 },
      ]),
    ],
  },

  // ── Nov 2025
  {
    billingMonth: '2025-11',
    start: '2025-11-01',
    end: '2025-11-30',
    totalSpend: 2210.0,
    totalMR: 7620,
    categories: [
      cat('dining', 760, 3800, 5, 760, 2500, [
        { name: 'Pai Northern Thai', transactionCount: 4, totalSpend: 162.0 },
        { name: 'UberEats', transactionCount: 9, totalSpend: 218.4 },
        { name: 'Bang Bang Ice Cream', transactionCount: 3, totalSpend: 32.1 },
      ]),
      cat('groceries', 320, 1600, 5, 320, 2500, [
        { name: 'Loblaws', transactionCount: 4, totalSpend: 196.7 },
        { name: 'Farm Boy', transactionCount: 2, totalSpend: 78.4 },
      ]),
      cat('streaming', 45, 135, 3, undefined, undefined, [
        { name: 'Netflix', transactionCount: 1, totalSpend: 20.99 },
        { name: 'Spotify', transactionCount: 1, totalSpend: 10.99 },
        { name: 'Disney+', transactionCount: 1, totalSpend: 13.99 },
      ]),
      cat('transit', 175, 350, 2, undefined, undefined, [
        { name: 'TTC Presto', transactionCount: 4, totalSpend: 64.0 },
        { name: 'Uber', transactionCount: 8, totalSpend: 92.4 },
      ]),
      cat('travel', 380, 380, 1, undefined, undefined, [
        { name: 'Air Canada', transactionCount: 1, totalSpend: 312.0 },
        { name: 'Hotwire', transactionCount: 1, totalSpend: 68.0 },
      ]),
      cat('shopping', 295, 295, 1, undefined, undefined, [
        { name: 'Amazon.ca', transactionCount: 5, totalSpend: 184.2 },
        { name: 'Aritzia', transactionCount: 1, totalSpend: 110.8 },
      ]),
      cat('entertainment', 105, 105, 1, undefined, undefined, [
        { name: 'Scotiabank Arena', transactionCount: 1, totalSpend: 78.0 },
        { name: 'Cineplex', transactionCount: 1, totalSpend: 27.0 },
      ]),
      cat('other', 130, 130, 1, undefined, undefined, [
        { name: 'Bell Mobility', transactionCount: 1, totalSpend: 92.0 },
        { name: 'Shoppers Drug Mart', transactionCount: 1, totalSpend: 38.0 },
      ]),
    ],
  },

  // ── Dec 2025 — holiday spike
  {
    billingMonth: '2025-12',
    start: '2025-12-01',
    end: '2025-12-31',
    totalSpend: 2845.6,
    totalMR: 9215,
    categories: [
      cat('dining', 910, 4550, 5, 910, 2500, [
        { name: 'Alo', transactionCount: 1, totalSpend: 285.0 },
        { name: 'Edulis', transactionCount: 1, totalSpend: 192.0 },
        { name: 'UberEats', transactionCount: 11, totalSpend: 254.6 },
      ]),
      cat('groceries', 410, 2050, 5, 410, 2500, [
        { name: 'Loblaws', transactionCount: 5, totalSpend: 245.0 },
        { name: 'Pusateri\u2019s', transactionCount: 1, totalSpend: 92.4 },
        { name: 'Farm Boy', transactionCount: 1, totalSpend: 72.6 },
      ]),
      cat('streaming', 55, 165, 3, undefined, undefined, [
        { name: 'Netflix', transactionCount: 1, totalSpend: 20.99 },
        { name: 'Apple TV+', transactionCount: 1, totalSpend: 12.99 },
        { name: 'Crave', transactionCount: 1, totalSpend: 21.0 },
      ]),
      cat('transit', 195, 390, 2, undefined, undefined, [
        { name: 'Uber', transactionCount: 12, totalSpend: 142.5 },
        { name: 'TTC Presto', transactionCount: 3, totalSpend: 52.5 },
      ]),
      cat('travel', 510, 510, 1, undefined, undefined, [
        { name: 'Westjet', transactionCount: 1, totalSpend: 412.0 },
        { name: 'Airbnb', transactionCount: 1, totalSpend: 98.0 },
      ]),
      cat('shopping', 480, 480, 1, undefined, undefined, [
        { name: 'Amazon.ca', transactionCount: 8, totalSpend: 268.4 },
        { name: 'Indigo', transactionCount: 2, totalSpend: 124.6 },
        { name: 'Hudson\u2019s Bay', transactionCount: 1, totalSpend: 87.0 },
      ]),
      cat('entertainment', 165, 165, 1, undefined, undefined, [
        { name: 'TIFF Lightbox', transactionCount: 2, totalSpend: 64.0 },
        { name: 'Ticketmaster', transactionCount: 1, totalSpend: 101.0 },
      ]),
      cat('other', 120.6, 120, 1, undefined, undefined, [
        { name: 'Bell Mobility', transactionCount: 1, totalSpend: 92.0 },
        { name: 'Canada Post', transactionCount: 2, totalSpend: 28.6 },
      ]),
    ],
  },

  // ── Jan 2026
  {
    billingMonth: '2026-01',
    start: '2026-01-01',
    end: '2026-01-31',
    totalSpend: 1920.4,
    totalMR: 6720,
    categories: [
      cat('dining', 615, 3075, 5, 615, 2500, [
        { name: 'Sushi Masaki Saito', transactionCount: 1, totalSpend: 198.0 },
        { name: 'UberEats', transactionCount: 6, totalSpend: 142.5 },
        { name: 'Pai Northern Thai', transactionCount: 2, totalSpend: 86.0 },
      ]),
      cat('groceries', 360, 1800, 5, 360, 2500, [
        { name: 'Loblaws', transactionCount: 4, totalSpend: 192.4 },
        { name: 'Farm Boy', transactionCount: 2, totalSpend: 88.0 },
      ]),
      cat('streaming', 45, 135, 3, undefined, undefined, [
        { name: 'Netflix', transactionCount: 1, totalSpend: 20.99 },
        { name: 'Spotify', transactionCount: 1, totalSpend: 10.99 },
      ]),
      cat('transit', 170, 340, 2, undefined, undefined, [
        { name: 'TTC Presto', transactionCount: 4, totalSpend: 64.0 },
        { name: 'Uber', transactionCount: 7, totalSpend: 84.2 },
      ]),
      cat('travel', 245, 245, 1, undefined, undefined, [
        { name: 'Air Canada', transactionCount: 1, totalSpend: 198.0 },
        { name: 'Airbnb', transactionCount: 1, totalSpend: 47.0 },
      ]),
      cat('shopping', 285, 285, 1, undefined, undefined, [
        { name: 'Amazon.ca', transactionCount: 4, totalSpend: 158.4 },
        { name: 'Aritzia', transactionCount: 1, totalSpend: 88.0 },
      ]),
      cat('entertainment', 88, 88, 1, undefined, undefined, [
        { name: 'Cineplex', transactionCount: 2, totalSpend: 56.0 },
        { name: 'TIFF Lightbox', transactionCount: 1, totalSpend: 32.0 },
      ]),
      cat('other', 112.4, 112, 1, undefined, undefined, [
        { name: 'Bell Mobility', transactionCount: 1, totalSpend: 92.0 },
        { name: 'Shoppers Drug Mart', transactionCount: 1, totalSpend: 20.4 },
      ]),
    ],
  },

  // ── Feb 2026
  {
    billingMonth: '2026-02',
    start: '2026-02-01',
    end: '2026-02-28',
    totalSpend: 2020.0,
    totalMR: 7000,
    categories: [
      cat('dining', 700, 3500, 5, 700, 2500, [
        { name: 'Pai Northern Thai', transactionCount: 3, totalSpend: 124.0 },
        { name: 'UberEats', transactionCount: 8, totalSpend: 196.0 },
        { name: 'DaiLo', transactionCount: 1, totalSpend: 142.0 },
      ]),
      cat('groceries', 320, 1600, 5, 320, 2500, [
        { name: 'Loblaws', transactionCount: 4, totalSpend: 198.4 },
        { name: 'Voila by Sobeys', transactionCount: 1, totalSpend: 64.6 },
      ]),
      cat('streaming', 45, 135, 3, undefined, undefined, [
        { name: 'Netflix', transactionCount: 1, totalSpend: 20.99 },
        { name: 'Spotify', transactionCount: 1, totalSpend: 10.99 },
        { name: 'Disney+', transactionCount: 1, totalSpend: 13.99 },
      ]),
      cat('transit', 170, 340, 2, undefined, undefined, [
        { name: 'TTC Presto', transactionCount: 4, totalSpend: 64.0 },
        { name: 'Uber', transactionCount: 7, totalSpend: 88.2 },
      ]),
      cat('travel', 280, 280, 1, undefined, undefined, [
        { name: 'Air Canada', transactionCount: 1, totalSpend: 234.0 },
        { name: 'Airbnb', transactionCount: 1, totalSpend: 46.0 },
      ]),
      cat('shopping', 240, 240, 1, undefined, undefined, [
        { name: 'Amazon.ca', transactionCount: 4, totalSpend: 142.4 },
        { name: 'Indigo', transactionCount: 1, totalSpend: 48.0 },
      ]),
      cat('entertainment', 130, 130, 1, undefined, undefined, [
        { name: 'Scotiabank Arena', transactionCount: 1, totalSpend: 92.0 },
        { name: 'Cineplex', transactionCount: 1, totalSpend: 38.0 },
      ]),
      cat('other', 135, 135, 1, undefined, undefined, [
        { name: 'Bell Mobility', transactionCount: 1, totalSpend: 92.0 },
        { name: 'Canada Post', transactionCount: 1, totalSpend: 18.0 },
      ]),
    ],
  },

  // ── Mar 2026 — current month, matches PRD §9.3 example
  {
    billingMonth: '2026-03',
    start: '2026-03-01',
    end: '2026-03-28',
    totalSpend: 2140.5,
    totalMR: 7820,
    categories: [
      cat('dining', 820, 4100, 5, 820, 2500, [
        { name: 'Pai Northern Thai', transactionCount: 4, totalSpend: 168.0 },
        { name: 'UberEats', transactionCount: 9, totalSpend: 224.5 },
        { name: 'Bar Raval', transactionCount: 2, totalSpend: 96.0 },
        { name: 'Chipotle', transactionCount: 4, totalSpend: 72.0 },
        { name: 'Bang Bang Ice Cream', transactionCount: 3, totalSpend: 36.5 },
      ]),
      cat('groceries', 340, 1700, 5, 340, 2500, [
        { name: 'Loblaws', transactionCount: 4, totalSpend: 198.4 },
        { name: 'Voila by Sobeys', transactionCount: 1, totalSpend: 78.6 },
        { name: 'Farm Boy', transactionCount: 1, totalSpend: 63.0 },
      ]),
      cat('streaming', 45, 135, 3, undefined, undefined, [
        { name: 'Netflix', transactionCount: 1, totalSpend: 20.99 },
        { name: 'Spotify', transactionCount: 1, totalSpend: 10.99 },
        { name: 'Disney+', transactionCount: 1, totalSpend: 13.99 },
      ]),
      cat('transit', 180, 360, 2, undefined, undefined, [
        { name: 'TTC Presto', transactionCount: 4, totalSpend: 64.0 },
        { name: 'Uber', transactionCount: 8, totalSpend: 92.4 },
        { name: 'Green P Parking', transactionCount: 2, totalSpend: 24.0 },
      ]),
      cat('travel', 320, 320, 1, undefined, undefined, [
        { name: 'Air Canada', transactionCount: 1, totalSpend: 245.0 },
        { name: 'Airbnb', transactionCount: 1, totalSpend: 75.0 },
      ]),
      cat('shopping', 210, 210, 1, undefined, undefined, [
        { name: 'Amazon.ca', transactionCount: 5, totalSpend: 142.3 },
        { name: 'Indigo', transactionCount: 1, totalSpend: 38.5 },
        { name: 'MEC', transactionCount: 1, totalSpend: 29.2 },
      ]),
      cat('entertainment', 95, 95, 1, undefined, undefined, [
        { name: 'Cineplex', transactionCount: 2, totalSpend: 56.0 },
        { name: 'TIFF Lightbox', transactionCount: 1, totalSpend: 39.0 },
      ]),
      cat('other', 130.5, 130, 1, undefined, undefined, [
        { name: 'Shoppers Drug Mart', transactionCount: 2, totalSpend: 64.5 },
        { name: 'Bell Mobility', transactionCount: 1, totalSpend: 46.0 },
        { name: 'Canada Post', transactionCount: 1, totalSpend: 20.0 },
      ]),
    ],
  },
];

function cat(
  categoryId: CategoryInsight['categoryId'],
  totalSpend: number,
  mrPointsEarned: number,
  earnRateMultiplier: CategoryInsight['earnRateMultiplier'],
  cobaltCapUsed: number | undefined,
  cobaltCapLimit: number | undefined,
  topMerchants: CategoryInsight['topMerchants'],
): Omit<CategoryInsight, 'monthOverMonthDelta'> {
  return {
    categoryId,
    totalSpend,
    mrPointsEarned,
    earnRateMultiplier,
    ...(cobaltCapUsed !== undefined ? { cobaltCapUsed } : {}),
    ...(cobaltCapLimit !== undefined ? { cobaltCapLimit } : {}),
    topMerchants,
  };
}

function buildResponse(idx: number): SpendInsightsResponse {
  const month = MONTHS[idx]!;
  const prior = idx > 0 ? MONTHS[idx - 1] : undefined;

  const categories: CategoryInsight[] = month.categories.map((c) => {
    const priorCat = prior?.categories.find((p) => p.categoryId === c.categoryId);
    const priorAmount = priorCat?.totalSpend ?? 0;
    const deltaAmount = +(c.totalSpend - priorAmount).toFixed(2);
    const deltaPercent =
      priorAmount === 0 ? 0 : +((deltaAmount / priorAmount) * 100).toFixed(1);
    return {
      ...c,
      monthOverMonthDelta: { amount: deltaAmount, percent: deltaPercent },
    };
  });

  // Trend: most recent first, up to 6 months ending at this month
  const trendSlice = MONTHS.slice(Math.max(0, idx - 5), idx + 1);
  const trend = trendSlice
    .map((m) => ({ billingMonth: m.billingMonth, totalSpend: m.totalSpend }))
    .reverse();

  return {
    billingMonth: month.billingMonth,
    billingPeriod: { start: month.start, end: month.end },
    totalSpend: { amount: month.totalSpend, currency: 'CAD' },
    totalMRPointsEarned: month.totalMR,
    cardProduct: 'cobalt',
    categories,
    trend,
  };
}

export const AVAILABLE_BILLING_MONTHS: string[] = MONTHS.map((m) => m.billingMonth);
export const CURRENT_BILLING_MONTH = MONTHS[MONTHS.length - 1]!.billingMonth;
export const EARLIEST_BILLING_MONTH = MONTHS[0]!.billingMonth;

export function getMockSpendInsights(
  billingMonth: string = CURRENT_BILLING_MONTH,
): SpendInsightsResponse | undefined {
  const idx = MONTHS.findIndex((m) => m.billingMonth === billingMonth);
  if (idx === -1) return undefined;
  return buildResponse(idx);
}
