import { useQuery } from '@tanstack/react-query';
import { getMockAccount } from '@/mocks/accountMock';
import type { AccountSnapshot } from '@/types/account';

/**
 * In production this hits:
 *   GET /v1/accounts/{accountId}
 * For V1 demo we resolve from the in-process mock with the same 350ms delay
 * pattern as useSpendInsights so the desktop chrome and the insights row
 * appear at roughly the same time.
 */
async function fetchAccount(): Promise<AccountSnapshot> {
  await new Promise((r) => setTimeout(r, 350));
  return getMockAccount();
}

export const ACCOUNT_QUERY_KEY = 'account' as const;

export function useAccount() {
  return useQuery({
    queryKey: [ACCOUNT_QUERY_KEY],
    queryFn: fetchAccount,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}
