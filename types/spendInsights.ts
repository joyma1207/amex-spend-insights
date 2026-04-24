/**
 * Types for GET /v1/accounts/{accountId}/spend-insights
 * Mirrors PRD §9.1 contract exactly.
 */

export type CategoryId =
  | 'dining'
  | 'groceries'
  | 'streaming'
  | 'transit'
  | 'travel'
  | 'shopping'
  | 'entertainment'
  | 'other';

export type EarnRateMultiplier = 1 | 2 | 3 | 5;

export type CardProduct = 'cobalt' | 'gold' | 'platinum' | 'aeroplan-reserve' | 'simplycash';

export interface Money {
  amount: number;
  currency: 'CAD';
}

export interface BillingPeriod {
  /** ISO date YYYY-MM-DD */
  start: string;
  /** ISO date YYYY-MM-DD */
  end: string;
}

export interface MonthOverMonthDelta {
  amount: number;
  percent: number;
}

export interface TopMerchant {
  name: string;
  transactionCount: number;
  totalSpend: number;
}

/**
 * Purchases flagged by the fraud-protection / anomaly-detection layer —
 * typically a merchant the cardholder has never used before with a spend
 * well above their usual per-transaction ceiling for this category.
 * Surfaced on the category detail screen as a "Heads up" banner (PRD §8.2a).
 */
export interface MerchantAnomaly {
  merchantName: string;
  amount: number;
  /** ISO date the flagged transaction posted */
  date: string;
  /** Short, humanized reason copy to show in the banner */
  reason: string;
}

export interface CategoryInsight {
  categoryId: CategoryId;
  totalSpend: number;
  mrPointsEarned: number;
  earnRateMultiplier: EarnRateMultiplier;
  /** Only present for Cobalt 5x categories (dining + groceries share one $2,500 cap) */
  cobaltCapUsed?: number;
  cobaltCapLimit?: number;
  monthOverMonthDelta: MonthOverMonthDelta;
  topMerchants: TopMerchant[];
  /** Optional fraud/anomaly flags for this category in this billing month. */
  anomalies?: MerchantAnomaly[];
}

export interface SpendInsightsResponse {
  /** YYYY-MM */
  billingMonth: string;
  billingPeriod: BillingPeriod;
  totalSpend: Money;
  totalMRPointsEarned: number;
  cardProduct: CardProduct;
  categories: CategoryInsight[];
  /** Most recent first, length up to 6 (current + 5 prior). Used by TrendChart. */
  trend: Array<{ billingMonth: string; totalSpend: number }>;
}

/**
 * Individual posted transaction row for the category-scoped transactions list
 * (PRD §8.2 — "View all transactions"). In production this shape mirrors the
 * existing Amex Canada transactions service; here we synthesize from the
 * merchant aggregates so per-merchant totals and category totals still reconcile.
 */
export interface CategoryTransaction {
  id: string;
  categoryId: CategoryId;
  merchantName: string;
  /** ISO date YYYY-MM-DD */
  date: string;
  amount: number;
  earnRateMultiplier: EarnRateMultiplier;
  pointsEarned: number;
}
