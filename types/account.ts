/**
 * Account snapshot displayed on the desktop home (PRD reference layout).
 * Keeps the API surface narrow — only what the Amex Canada home renders.
 */

export type CardProductLabel =
  | 'American Express Cobalt® Card'
  | 'American Express Gold Rewards Card'
  | 'American Express® Aeroplan® Reserve Card'
  | 'The Platinum Card®';

export interface AccountSnapshot {
  /** Last 4 of the card PAN, used in the chip and card switcher. */
  last4: string;
  cardProductLabel: CardProductLabel;
  lastStatementBalance: number;
  /** ISO YYYY-MM-DD */
  lastStatementPeriod: { start: string; end: string };
  minAmountDue: number;
  /** ISO YYYY-MM-DD */
  amountDueDate: string;
  currentBalance: number;
  availableCredit: number;
  /** Lifetime MR points balance (the big number on the MR card). */
  membershipRewardsBalance: number;
}
