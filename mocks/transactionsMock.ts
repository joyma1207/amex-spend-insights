import type {
  CategoryId,
  CategoryTransaction,
  TopMerchant,
} from '@/types/spendInsights';
import { getMockSpendInsights } from './spendInsightsMock';

/**
 * Deterministic per-category transactions generator.
 *
 * Works by expanding the merchant aggregates (`topMerchants`) into individual
 * transactions whose `amount` sums exactly back to each merchant's `totalSpend`
 * and whose `transactionCount` matches. Amounts carry believable variance
 * (±30% around the mean with a last-row reconciliation), dates are spread
 * across the billing period, and points are computed as amount × earn rate.
 *
 * Determinism: we seed a tiny PRNG from `merchantName + startDate` so repeat
 * calls return identical data — critical for stable rendering and screenshots.
 */
export function getCategoryTransactions(
  categoryId: CategoryId,
  billingMonth: string,
): CategoryTransaction[] {
  const response = getMockSpendInsights(billingMonth);
  if (!response) return [];
  const category = response.categories.find((c) => c.categoryId === categoryId);
  if (!category) return [];

  const { start, end } = response.billingPeriod;
  const out: CategoryTransaction[] = [];

  for (const merchant of category.topMerchants) {
    out.push(
      ...expandMerchant(
        merchant,
        categoryId,
        category.earnRateMultiplier,
        start,
        end,
      ),
    );
  }

  // Newest first so the list reads like a real statement feed.
  return out.sort((a, b) => b.date.localeCompare(a.date));
}

/**
 * All posted transactions across every category for the given billing month.
 * Used by the home screen's "Recent Activity" feed so the numbers line up 1:1
 * with the per-category "View all transactions" screens — same generator, same
 * seed, same amounts.
 */
export function getAllTransactions(
  billingMonth: string,
): CategoryTransaction[] {
  const response = getMockSpendInsights(billingMonth);
  if (!response) return [];
  const out: CategoryTransaction[] = [];
  for (const category of response.categories) {
    out.push(...getCategoryTransactions(category.categoryId, billingMonth));
  }
  return out.sort((a, b) => b.date.localeCompare(a.date));
}

/* ── internals ─────────────────────────────────────────────────────── */

function expandMerchant(
  merchant: TopMerchant,
  categoryId: CategoryId,
  earnRate: 1 | 2 | 3 | 5,
  start: string,
  end: string,
): CategoryTransaction[] {
  if (merchant.transactionCount <= 0) return [];

  // Transit has the most distinctive real-world rhythms — model them explicitly
  // so the "View all transactions" screen reflects the user's actual behaviour
  // (commute taps, biweekly fill-ups, weekend nights out) rather than evenly
  // spaced $X/ea rows.
  if (categoryId === 'transit') {
    const nameLower = merchant.name.toLowerCase();
    if (nameLower.includes('presto')) {
      return expandTtcPresto(merchant, categoryId, earnRate, start, end);
    }
    if (nameLower === 'shell' || nameLower === 'esso') {
      return expandGasFills(merchant, categoryId, earnRate, start, end);
    }
    if (nameLower === 'uber') {
      return expandUberRides(merchant, categoryId, earnRate, start, end);
    }
  }

  return expandDefault(merchant, categoryId, earnRate, start, end);
}

function expandDefault(
  merchant: TopMerchant,
  categoryId: CategoryId,
  earnRate: 1 | 2 | 3 | 5,
  start: string,
  end: string,
): CategoryTransaction[] {
  const { name, transactionCount, totalSpend } = merchant;
  const rng = mulberry32(hashString(`${name}|${start}`));
  const amounts = distributeAmounts(totalSpend, transactionCount, rng);
  const dates = spreadDates(start, end, transactionCount, rng);

  return amounts.map((amount, i) => ({
    id: `${categoryId}-${slug(name)}-${start}-${i}`,
    categoryId,
    merchantName: name,
    date: dates[i]!,
    amount: round2(amount),
    earnRateMultiplier: earnRate,
    pointsEarned: Math.round(amount * earnRate),
  }));
}

/* ── transit-specific expanders ────────────────────────────────────── */

/**
 * TTC Presto: fixed-fare taps clustered on office-commute days.
 * Pattern: Tue/Wed/Thu are office days, each producing 2 taps (morning + evening)
 * at $2.50 each ($5/day). If the merchant's transactionCount is odd, the last
 * commute day has a single tap. We top up with Mon/Fri if we run out of Tue–Thu.
 * Any rounding drift lands on the final tap so the sum equals totalSpend exactly.
 */
function expandTtcPresto(
  merchant: TopMerchant,
  categoryId: CategoryId,
  earnRate: 1 | 2 | 3 | 5,
  start: string,
  end: string,
): CategoryTransaction[] {
  const totalTaps = merchant.transactionCount;
  const commuteDays = selectCommuteDays(start, end, Math.ceil(totalTaps / 2));
  const tapFare = 2.5;

  const txns: CategoryTransaction[] = [];
  let tapsEmitted = 0;
  let running = 0;

  for (let dayIdx = 0; dayIdx < commuteDays.length && tapsEmitted < totalTaps; dayIdx++) {
    const date = commuteDays[dayIdx]!;
    const tapsToday = Math.min(2, totalTaps - tapsEmitted);
    for (let t = 0; t < tapsToday; t++) {
      const isLastTap = tapsEmitted === totalTaps - 1;
      const amount = isLastTap
        ? round2(merchant.totalSpend - running)
        : tapFare;
      running += amount;
      txns.push({
        id: `${categoryId}-ttc-${date}-${t}`,
        categoryId,
        merchantName: 'TTC Presto',
        date,
        amount,
        earnRateMultiplier: earnRate,
        pointsEarned: Math.round(amount * earnRate),
      });
      tapsEmitted++;
    }
  }
  return txns;
}

/**
 * Gas fills: one or two biweekly fill-ups per merchant. Shell is phased earlier
 * in the period, Esso later, so when both appear they read as an alternating
 * rhythm (~week 1 Shell, ~week 3 Esso). Amounts carry ±10% variance around the
 * per-fill mean with last-row reconciliation.
 */
function expandGasFills(
  merchant: TopMerchant,
  categoryId: CategoryId,
  earnRate: 1 | 2 | 3 | 5,
  start: string,
  end: string,
): CategoryTransaction[] {
  const { name, transactionCount, totalSpend } = merchant;
  const rng = mulberry32(hashString(`${name}|${start}`));
  const isShell = name.toLowerCase() === 'shell';
  const basePhase = isShell ? 0.18 : 0.6; // week ~1 for Shell, week ~3 for Esso
  const stride = isShell ? 0.42 : 0.4; // how far subsequent fills jump

  const startMs = parseIsoDateMs(start);
  const endMs = parseIsoDateMs(end);
  const periodDays = Math.max(1, Math.round((endMs - startMs) / 86_400_000) + 1);

  const perFill = totalSpend / transactionCount;
  const txns: CategoryTransaction[] = [];
  let running = 0;

  for (let i = 0; i < transactionCount; i++) {
    const slot = clamp(basePhase + i * stride, 0.05, 0.95);
    const dayOffset = Math.min(periodDays - 1, Math.floor(slot * periodDays));
    const date = addDays(start, dayOffset);

    const isLast = i === transactionCount - 1;
    let amount: number;
    if (isLast) {
      amount = round2(totalSpend - running);
    } else {
      const variance = (rng() - 0.5) * 0.2; // ±10%
      amount = round2(perFill * (1 + variance));
      running += amount;
    }

    txns.push({
      id: `${categoryId}-${slug(name)}-${date}-${i}`,
      categoryId,
      merchantName: name,
      date,
      amount,
      earnRateMultiplier: earnRate,
      pointsEarned: Math.round(amount * earnRate),
    });
  }
  return txns;
}

/**
 * Uber (transit only): mix of cheap weekday commutes ($12–22 each) and pricier
 * weekend nights out ($25–55+). About 40% of rides (min 1 when count ≥ 2) are
 * nights out, placed on Fri/Sat. Commutes land on Mon–Thu. The final night-out
 * absorbs any rounding so sums reconcile exactly to totalSpend.
 */
function expandUberRides(
  merchant: TopMerchant,
  categoryId: CategoryId,
  earnRate: 1 | 2 | 3 | 5,
  start: string,
  end: string,
): CategoryTransaction[] {
  const { transactionCount, totalSpend } = merchant;
  const rng = mulberry32(hashString(`Uber|${start}`));

  // Only label a ride as a "night out" when the budget genuinely supports
  // a ≥ ~$22 pricier trip while still leaving room for weekday commutes.
  const avgSpend = totalSpend / transactionCount;
  const nightOutCount =
    transactionCount >= 2 && avgSpend >= 16
      ? Math.max(1, Math.round(transactionCount * 0.4))
      : 0;
  const commuteCount = transactionCount - nightOutCount;

  const commuteDates = pickDates(start, end, (dow) => dow >= 1 && dow <= 4, commuteCount);
  const nightDates = pickDates(start, end, (dow) => dow === 5 || dow === 6, nightOutCount);

  // Step 1: deterministic commute amounts in [$10, $20]. Lower floor so budgets
  // like $25/2 rides still read naturally (quick commute + modest night out).
  const commuteAmounts: number[] = [];
  for (let i = 0; i < commuteCount; i++) {
    commuteAmounts.push(round2(10 + rng() * 10));
  }

  // Step 2: night-out amounts get the remainder. Each ≥ $22 only when budget
  // allows; otherwise last-row reconciliation keeps the sum exact.
  const nightAmounts: number[] = [];
  if (nightOutCount > 0) {
    let nightBudget = round2(
      totalSpend - commuteAmounts.reduce((s, a) => s + a, 0),
    );
    // Give night-outs a minimum floor where possible by pulling from commutes.
    const floorTotal = nightOutCount * 22;
    if (nightBudget < floorTotal && commuteCount > 0) {
      const deficit = floorTotal - nightBudget;
      const perPull = round2(deficit / commuteCount);
      for (let i = 0; i < commuteCount; i++) {
        commuteAmounts[i] = round2(Math.max(8, commuteAmounts[i]! - perPull));
      }
      nightBudget = round2(
        totalSpend - commuteAmounts.reduce((s, a) => s + a, 0),
      );
    }
    const baseNight = nightBudget / nightOutCount;
    let running = 0;
    for (let i = 0; i < nightOutCount - 1; i++) {
      const variance = (rng() - 0.5) * 0.4; // ±20% — nights out should feel variable
      const a = Math.max(18, round2(baseNight * (1 + variance)));
      nightAmounts.push(a);
      running += a;
    }
    // Final amount reconciles; no floor here so totals always match exactly.
    nightAmounts.push(round2(nightBudget - running));
  } else if (commuteCount > 0) {
    // No night-out: land any rounding drift on the last commute so the sum
    // equals totalSpend to the penny.
    const drift = round2(
      totalSpend - commuteAmounts.reduce((s, a) => s + a, 0),
    );
    commuteAmounts[commuteAmounts.length - 1] = round2(
      commuteAmounts[commuteAmounts.length - 1]! + drift,
    );
  }

  const txns: CategoryTransaction[] = [];
  for (let i = 0; i < commuteCount; i++) {
    const date = commuteDates[i] ?? fallbackDate(start, end, i, commuteCount);
    txns.push({
      id: `${categoryId}-uber-commute-${date}-${i}`,
      categoryId,
      merchantName: 'Uber',
      date,
      amount: commuteAmounts[i]!,
      earnRateMultiplier: earnRate,
      pointsEarned: Math.round(commuteAmounts[i]! * earnRate),
    });
  }
  for (let i = 0; i < nightOutCount; i++) {
    const date = nightDates[i] ?? fallbackDate(start, end, i, nightOutCount);
    txns.push({
      id: `${categoryId}-uber-night-${date}-${i}`,
      categoryId,
      merchantName: 'Uber',
      date,
      amount: nightAmounts[i]!,
      earnRateMultiplier: earnRate,
      pointsEarned: Math.round(nightAmounts[i]! * earnRate),
    });
  }
  return txns;
}

/* ── transit date helpers ──────────────────────────────────────────── */

/**
 * Pick `count` commute dates. Prefer Tue/Wed/Thu (canonical office days),
 * then fall back to Mon/Fri, then to any weekday. This keeps clusters on
 * mid-week dates while still filling the requested count on short months.
 */
function selectCommuteDays(
  start: string,
  end: string,
  count: number,
): string[] {
  const primary = enumerateDates(start, end, (dow) => dow >= 2 && dow <= 4);
  if (primary.length >= count) return primary.slice(0, count);

  const secondary = enumerateDates(
    start,
    end,
    (dow) => dow === 1 || dow === 5,
  );
  const merged = [...primary, ...secondary].sort();
  if (merged.length >= count) return merged.slice(0, count);

  // Extremely short windows — fall back to any weekday.
  const anyWeekday = enumerateDates(start, end, (dow) => dow >= 1 && dow <= 5);
  return anyWeekday.slice(0, count);
}

/**
 * Return the first `count` dates in [start, end] matching the day-of-week
 * predicate, spread evenly. Used for Uber commute vs. night-out placement.
 */
function pickDates(
  start: string,
  end: string,
  dowPredicate: (dow: number) => boolean,
  count: number,
): string[] {
  if (count <= 0) return [];
  const pool = enumerateDates(start, end, dowPredicate);
  if (pool.length === 0) return [];
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    const slot = Math.floor(((i + 0.5) / count) * pool.length);
    out.push(pool[Math.min(slot, pool.length - 1)]!);
  }
  return out;
}

function enumerateDates(
  start: string,
  end: string,
  dowPredicate: (dow: number) => boolean,
): string[] {
  const startMs = parseIsoDateMs(start);
  const endMs = parseIsoDateMs(end);
  const out: string[] = [];
  for (let ms = startMs; ms <= endMs; ms += 86_400_000) {
    const dow = new Date(ms).getUTCDay(); // 0=Sun … 6=Sat
    if (dowPredicate(dow)) {
      out.push(msToIso(ms));
    }
  }
  return out;
}

function msToIso(ms: number): string {
  const dt = new Date(ms);
  const y = dt.getUTCFullYear();
  const m = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const d = String(dt.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function fallbackDate(
  start: string,
  end: string,
  idx: number,
  count: number,
): string {
  const startMs = parseIsoDateMs(start);
  const endMs = parseIsoDateMs(end);
  const periodDays = Math.max(1, Math.round((endMs - startMs) / 86_400_000) + 1);
  const slot = (idx + 0.5) / Math.max(1, count);
  return addDays(start, Math.floor(slot * (periodDays - 1)));
}

/**
 * Split `total` into `count` amounts with ±30% variance, where the last amount
 * is computed as (total − sum of prior) so the sum is exact.
 * Falls back to uniform split if variance would produce a non-positive last value.
 */
function distributeAmounts(
  total: number,
  count: number,
  rng: () => number,
): number[] {
  if (count === 1) return [total];

  const mean = total / count;
  const amounts: number[] = [];
  let running = 0;
  for (let i = 0; i < count - 1; i++) {
    const variance = (rng() - 0.5) * 0.6; // ±30%
    const a = Math.max(2, +(mean * (1 + variance)).toFixed(2));
    amounts.push(a);
    running += a;
  }
  const last = +(total - running).toFixed(2);
  if (last < 1) {
    // Variance overshot — fall back to uniform split.
    const uniform = +(total / count).toFixed(2);
    const drift = +(total - uniform * count).toFixed(2);
    const out = Array(count).fill(uniform);
    out[count - 1] = +(uniform + drift).toFixed(2);
    return out;
  }
  amounts.push(last);
  return amounts;
}

/**
 * Spread `count` dates across [start, end] inclusive. Uses even intervals with
 * a small jitter so multiple transactions per week look natural, then clamps
 * to the period so we never emit a date outside the billing window.
 */
function spreadDates(
  start: string,
  end: string,
  count: number,
  rng: () => number,
): string[] {
  const startMs = parseIsoDateMs(start);
  const endMs = parseIsoDateMs(end);
  const periodDays = Math.max(
    1,
    Math.round((endMs - startMs) / 86_400_000) + 1,
  );

  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    const slot = (i + 0.5) / count;
    const jitter = (rng() - 0.5) * (1 / Math.max(2, count));
    const dayOffset = Math.floor(clamp(slot + jitter, 0, 1) * (periodDays - 1));
    out.push(addDays(start, dayOffset));
  }
  return out;
}

function parseIsoDateMs(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number);
  return Date.UTC(y!, (m ?? 1) - 1, d ?? 1);
}

function addDays(iso: string, days: number): string {
  const ms = parseIsoDateMs(iso) + days * 86_400_000;
  const dt = new Date(ms);
  const y = dt.getUTCFullYear();
  const m = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const d = String(dt.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

function round2(n: number): number {
  return +n.toFixed(2);
}

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function hashString(s: string): number {
  let h = 2166136261 | 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Small, dependency-free PRNG. Seeded → deterministic output. */
function mulberry32(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
