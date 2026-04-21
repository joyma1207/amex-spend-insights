import { useQuery } from '@tanstack/react-query';
import {
  CURRENT_BILLING_MONTH,
  getMockSpendInsights,
} from '@/mocks/spendInsightsMock';
import type { SpendInsightsResponse } from '@/types/spendInsights';

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
