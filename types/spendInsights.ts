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
