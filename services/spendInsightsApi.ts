import { useQuery } from '@tanstack/react-query';
import {
  CURRENT_BILLING_MONTH,
  getMockSpendInsights,
} from '@/mocks/spendInsightsMock';
import {
  getAllTransactions,
  getCategoryTransactions,
} from '@/mocks/transactionsMock';
import type {
  CategoryId,
  CategoryTransaction,
  SpendInsightsResponse,
} from '@/types/spendInsights';

/**
 * In production this hits:
 *   GET /v1/accounts/{accountId}/spend-insights?billingMonth=YYYY-MM
 * For V1 demo we resolve from the in-process mock with a small artificial delay
 * to exercise the skeleton-shimmer state (PRD FR-13).
 */
async function fetchSpendInsights(
  billingMonth: string,
): Promise<SpendInsightsResponse> {
  await new Promise((r) => setTimeout(r, 350));
  const data = getMockSpendInsights(billingMonth);
  if (!data) {
    throw new Error(`No insights data for ${billingMonth}`);
  }
  return data;
}

export const SPEND_INSIGHTS_QUERY_KEY = 'spend-insights' as const;

export function useSpendInsights(billingMonth: string = CURRENT_BILLING_MONTH) {
  return useQuery({
    queryKey: [SPEND_INSIGHTS_QUERY_KEY, billingMonth],
    queryFn: () => fetchSpendInsights(billingMonth),
    staleTime: 1000 * 60 * 5, // posted txns refresh ≤ every 5 min
    retry: 1,
  });
}

/**
 * In production this hits:
 *   GET /v1/accounts/{accountId}/transactions?category={categoryId}&billingMonth=YYYY-MM
 * Here we synthesize rows from the merchant aggregates so every transaction's
 * amount × earn-rate equals its posted MR points and per-merchant sums
 * reconcile back to `CategoryInsight.topMerchants`.
 */
async function fetchCategoryTransactions(
  categoryId: CategoryId,
  billingMonth: string,
): Promise<CategoryTransaction[]> {
  await new Promise((r) => setTimeout(r, 200));
  return getCategoryTransactions(categoryId, billingMonth);
}

export const CATEGORY_TRANSACTIONS_QUERY_KEY = 'category-transactions' as const;

export function useCategoryTransactions(
  categoryId: CategoryId | undefined,
  billingMonth: string = CURRENT_BILLING_MONTH,
) {
  return useQuery({
    queryKey: [CATEGORY_TRANSACTIONS_QUERY_KEY, categoryId, billingMonth],
    queryFn: () => fetchCategoryTransactions(categoryId!, billingMonth),
    enabled: Boolean(categoryId),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

/**
 * In production this hits:
 *   GET /v1/accounts/{accountId}/transactions?billingMonth=YYYY-MM
 * Returns the same underlying data as `useCategoryTransactions` summed across
 * every category so the home feed and the per-category drill-downs stay in sync.
 */
async function fetchAllTransactions(
  billingMonth: string,
): Promise<CategoryTransaction[]> {
  await new Promise((r) => setTimeout(r, 200));
  return getAllTransactions(billingMonth);
}

export const ALL_TRANSACTIONS_QUERY_KEY = 'all-transactions' as const;

export function useAllTransactions(
  billingMonth: string = CURRENT_BILLING_MONTH,
) {
  return useQuery({
    queryKey: [ALL_TRANSACTIONS_QUERY_KEY, billingMonth],
    queryFn: () => fetchAllTransactions(billingMonth),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}
