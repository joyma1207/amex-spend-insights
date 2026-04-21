import type { AccountSnapshot } from '@/types/account';

/**
 * Cobalt snapshot mirroring the Amex Canada home reference screenshot.
 *
 * Balances are aligned to the Spend Insights mock so the home hero and
 * the insights screens tell a single, consistent story:
 *   - Last Statement Balance = Feb 2026 total spend ($2,020.00)
 *   - Current Balance        = Mar 2026 (in-progress) total spend ($2,140.50)
 */
export const ACCOUNT_MOCK: AccountSnapshot = {
  last4: '61005',
  cardProductLabel: 'American Express Cobalt® Card',
  lastStatementBalance: 2020.0,
  lastStatementPeriod: { start: '2026-02-01', end: '2026-02-28' },
  minAmountDue: 10.0,
  amountDueDate: '2026-04-30',
  currentBalance: 2140.5,
  availableCredit: 10005.0,
  membershipRewardsBalance: 82603,
};

export function getMockAccount(): AccountSnapshot {
  return ACCOUNT_MOCK;
}
