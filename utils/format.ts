/**
 * Formatting helpers — kept dependency-free so they work identically on
 * iOS, Android, and web (Intl is available everywhere RN ships).
 */

const cadFormatter = new Intl.NumberFormat('en-CA', {
  style: 'currency',
  currency: 'CAD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const cadFormatterCents = new Intl.NumberFormat('en-CA', {
  style: 'currency',
  currency: 'CAD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatCurrency(amount: number, withCents = false): string {
  return (withCents ? cadFormatterCents : cadFormatter).format(amount);
}

const integerFormatter = new Intl.NumberFormat('en-CA');

export function formatPoints(points: number): string {
  return integerFormatter.format(points);
}

export function formatDelta(amount: number): string {
  const sign = amount > 0 ? '+' : amount < 0 ? '−' : '';
  return `${sign}${formatCurrency(Math.abs(amount), Math.abs(amount) < 100)}`;
}

export function formatDeltaPercent(percent: number): string {
  if (percent === 0) return 'no change';
  const sign = percent > 0 ? '+' : '−';
  return `${sign}${Math.abs(percent).toFixed(0)}% vs last month`;
}

const MONTH_LABELS_LONG = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const MONTH_LABELS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/** Parse 'YYYY-MM' or 'YYYY-MM-DD' (UTC-safe — no timezone surprises). */
function parseYearMonth(billingMonth: string): { year: number; monthIndex: number } {
  const [yearStr, monthStr] = billingMonth.split('-');
  return { year: Number(yearStr), monthIndex: Number(monthStr) - 1 };
}

export function formatMonthLong(billingMonth: string): string {
  const { monthIndex } = parseYearMonth(billingMonth);
  return MONTH_LABELS_LONG[monthIndex] ?? billingMonth;
}

export function formatMonthShort(billingMonth: string): string {
  const { monthIndex } = parseYearMonth(billingMonth);
  return MONTH_LABELS_SHORT[monthIndex] ?? billingMonth;
}

export function formatBillingDates(start: string, end: string): string {
  const [, sm, sd] = start.split('-');
  const [, em, ed] = end.split('-');
  const sMonth = MONTH_LABELS_SHORT[Number(sm) - 1];
  const eMonth = MONTH_LABELS_SHORT[Number(em) - 1];
  return `${sMonth} ${Number(sd)} – ${eMonth} ${Number(ed)}`;
}

/**
 * Day-first short statement period — matches the Amex Canada desktop format
 * (e.g. "10 Mar - 09 Apr").
 */
export function formatStatementDatesDayFirst(start: string, end: string): string {
  const [, sm, sd] = start.split('-');
  const [, em, ed] = end.split('-');
  const sMonth = MONTH_LABELS_SHORT[Number(sm) - 1];
  const eMonth = MONTH_LABELS_SHORT[Number(em) - 1];
  const pad = (n: string | undefined) => (n ?? '').padStart(2, '0');
  return `${pad(sd)} ${sMonth} - ${pad(ed)} ${eMonth}`;
}

/**
 * "30 April" — day + full month name. Used for the Amount Due headline.
 */
export function formatDueDate(iso: string): string {
  const [, m, d] = iso.split('-');
  const monthName = MONTH_LABELS_LONG[Number(m) - 1];
  return `${Number(d)} ${monthName}`;
}

/**
 * "30 Apr" — day + 3-char month. Used in the iOS mobile balance card line.
 */
export function formatDueDateShort(iso: string): string {
  const [, m, d] = iso.split('-');
  const monthName = MONTH_LABELS_SHORT[Number(m) - 1];
  return `${Number(d)} ${monthName}`;
}

/**
 * MR redemption math (PRD §6 — points-to-value translation).
 *  - 1 MR ≈ $0.01 in statement credits (1¢)
 *  - 1 MR ≈ $0.02 toward Aeroplan (2¢ — Cobalt 1:1 to Aeroplan + ~2¢/Aeroplan value)
 */
export function mrToCreditDollars(points: number): number {
  return points * 0.01;
}

export function mrToAeroplanDollars(points: number): number {
  return points * 0.02;
}
