import type { AccountSnapshot } from '@/types/account';

/**
 * Cobalt snapshot mirroring the Amex Canada home reference screenshot.
 *
 * Balances are aligned to the Spend Insights mock so the home hero and
 * the insights screens tell a single, consistent story (today: Apr 21, 2026):
 *   - Last Statement Balance = Mar 2026 total spend ($2,235.50, closed Mar 31)
 *   - Current Balance        = Apr 2026 (in-progress) total spend ($1,717.60)
 */
export const ACCOUNT_MOCK: AccountSnapshot = {
  last4: '61005',
  cardProductLabel: 'American Express Cobalt® Card',
  lastStatementBalance: 2235.5,
  lastStatementPeriod: { start: '2026-03-01', end: '2026-03-31' },
  minAmountDue: 10.0,
  amountDueDate: '2026-04-30',
  currentBalance: 1717.6,
  availableCredit: 10005.0,
  membershipRewardsBalance: 82603,
};

export function getMockAccount(): AccountSnapshot {
  return ACCOUNT_MOCK;
}
