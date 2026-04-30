import React, { useMemo } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { AmexColors } from '@/constants/amexColors';
import { CATEGORY_META } from '@/constants/categories';
import { SpendInsightsHomeCard } from '@/components/spend-insights/SpendInsightsHomeCard';
import { useAllTransactions } from '@/services/spendInsightsApi';
import type {
  CategoryTransaction,
  SpendInsightsResponse,
} from '@/types/spendInsights';
import type { AccountSnapshot } from '@/types/account';
import {
  formatCurrency,
  formatDueDateShort,
  formatPoints,
} from '@/utils/format';

interface Props {
  insights: SpendInsightsResponse | undefined;
  insightsLoading: boolean;
  account: AccountSnapshot | undefined;
  onOpenInsights: () => void;
}

/**
 * Mobile home — modeled on the Amex Canada iOS reference.
 *
 * Layout (top → bottom):
 *   1. Top bar: card switcher · centered card title + last4 · search
 *   2. Cobalt card visual (decorative)
 *   3. Balance card: Current Balance / Balance Due / Min payment line /
 *      Available Credit / Membership Rewards / Statements link
 *   4. Make Payment (full-width pill button)
 *   5. Spend Insights teaser  ← per request, sits directly below Make Payment
 *   6. Recent Activity stub
 *   7. Bottom tab bar (Overview · Membership · Amex Offers · Account)
 */
export function MobileHome({
  insights,
  insightsLoading,
  account,
  onOpenInsights,
}: Props) {
  const topFour = useMemo(() => {
    if (!insights) return undefined;
    return [...insights.categories]
      .sort((a, b) => b.totalSpend - a.totalSpend)
      .slice(0, 4);
  }, [insights]);

  const topCategory = topFour?.[0];

  const { data: transactions } = useAllTransactions(insights?.billingMonth);
  const transactionGroups = useMemo(() => groupByDate(transactions ?? []), [
    transactions,
  ]);

  const last4 = account?.last4 ?? '••••';
  const currentBalance = account
    ? formatCurrency(account.currentBalance, true)
    : '$—';
  const balanceDue = account
    ? formatCurrency(account.lastStatementBalance, true)
    : '$—';
  const availableCredit = account
    ? formatCurrency(account.availableCredit, true)
    : '$—';
  const mrBalance = account ? formatPoints(account.membershipRewardsBalance) : '—';
  const minPaymentLine = account
    ? `${formatCurrency(account.minAmountDue, true)} Minimum payment due on ${formatDueDateShort(account.amountDueDate)}`
    : '';

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safe}>
      {/* ── Top bar ─────────────────────────────────────────────────── */}
      <View style={styles.topBar}>
        <Pressable hitSlop={10} accessibilityLabel="Switch card">
          <CardSwitcherIcon />
        </Pressable>
        <View style={styles.topBarCenter}>
          <Text style={styles.topBarTitle} numberOfLines={1}>
            American Express Cobalt® Card
          </Text>
          <Text style={styles.topBarSubtitle}>•••• {last4}</Text>
        </View>
        <Pressable hitSlop={10} accessibilityLabel="Search">
          <SearchIcon />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Cobalt card visual ─────────────────────────────────────── */}
        <View style={styles.cobaltCardWrap}>
          <CobaltCardVisual last4={last4} />
        </View>

        {/* ── Balance card ───────────────────────────────────────────── */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Current Balance</Text>
          <Text style={styles.balanceAmount}>{currentBalance}</Text>

          <View style={styles.balanceRow}>
            <Text style={styles.balanceRowLabel}>Balance Due</Text>
            <Text style={styles.balanceRowValueStrong}>{balanceDue}</Text>
          </View>
          <Text style={styles.balanceMinDue}>{minPaymentLine}</Text>

          <View style={styles.balanceRow}>
            <Text style={styles.balanceRowLabel}>Available Credit</Text>
            <Text style={styles.balanceRowValue}>{availableCredit}</Text>
          </View>

          <View style={styles.balanceRow}>
            <Text style={styles.balanceRowLabel}>Membership Rewards</Text>
            <Text style={styles.balanceRowValue}>{mrBalance}</Text>
          </View>

          <View style={styles.divider} />
          <Pressable accessibilityRole="link" hitSlop={6}>
            <Text style={styles.linkBlue}>Statements</Text>
          </Pressable>
        </View>

        {/* ── Make Payment ───────────────────────────────────────────── */}
        <Pressable
          style={({ pressed }) => [
            styles.makePayment,
            pressed && styles.makePaymentPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Make payment"
        >
          <DollarIcon />
          <Text style={styles.makePaymentText}>Make Payment</Text>
        </Pressable>

        {/* ── Spend Insights (PRD §8.1 entry point) ──────────────────── */}
        <View style={styles.insightsSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeader}>Spend Insights</Text>
            <View style={styles.newPill}>
              <Text style={styles.newPillText}>NEW</Text>
            </View>
          </View>
          <Text style={styles.sectionSubcopy}>
            You can now see your spending and Membership Rewards here.
          </Text>
          <SpendInsightsHomeCard
            loading={insightsLoading}
            billingMonth={insights?.billingMonth}
            totalSpend={insights?.totalSpend.amount}
            topCategory={topCategory}
            topFour={topFour}
            onPress={onOpenInsights}
          />
        </View>

        {/* ── Recent Activity ────────────────────────────────────────── */}
        {/*
          Sourced from useAllTransactions(billingMonth) — identical generator
          as the per-category "View all transactions" screens, so this feed is
          always a strict superset of what you'll see after drilling in.
        */}
        {transactionGroups.map((group) => (
          <View key={group.date}>
            <Text style={styles.dateHeader}>
              {formatDayMonth(group.date)}
            </Text>
            {group.rows.map((row) => {
              const meta = CATEGORY_META[row.categoryId];
              return (
                <View key={row.id} style={styles.txnCard}>
                  <View style={styles.txnIconDot}>
                    <Text style={{ color: meta.color, fontSize: 14 }}>
                      {meta.glyph}
                    </Text>
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={styles.txnMerchant} numberOfLines={1}>
                      {row.merchantName.toUpperCase()}
                    </Text>
                    <Text style={styles.txnSubMeta}>
                      {meta.label} · +
                      {row.pointsEarned.toLocaleString('en-CA')} MR
                    </Text>
                  </View>
                  <View style={styles.txnAmountWrap}>
                    <Text style={styles.txnAmount}>
                      {formatCurrency(row.amount, true)}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        ))}

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* ── Bottom tab bar ───────────────────────────────────────────── */}
      <View style={styles.tabBar}>
        <TabItem icon={<HomeIcon active />} label="Overview" active />
        <TabItem icon={<StarIcon />} label="Membership" />
        <TabItem icon={<TagIcon />} label="Amex Offers" />
        <TabItem icon={<PersonIcon />} label="Account" />
      </View>
    </SafeAreaView>
  );
}

/* ── Helpers ────────────────────────────────────────────────────────── */

function groupByDate(
  rows: CategoryTransaction[],
): Array<{ date: string; rows: CategoryTransaction[] }> {
  const bucket = new Map<string, CategoryTransaction[]>();
  for (const row of rows) {
    const arr = bucket.get(row.date) ?? [];
    arr.push(row);
    bucket.set(row.date, arr);
  }
  return Array.from(bucket.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, list]) => ({
      date,
      rows: list.sort((a, b) => b.amount - a.amount),
    }));
}

/** "21 Apr" style, matching the Amex Canada iOS date header format. */
function formatDayMonth(iso: string): string {
  const [, m, d] = iso.split('-');
  const monthLabels = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${Number(d)} ${monthLabels[Number(m) - 1]}`;
}

/* ── Sub-components ─────────────────────────────────────────────────── */

function TabItem({
  icon,
  label,
  active,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <Pressable style={styles.tabItem} accessibilityRole="tab" accessibilityLabel={label}>
      {icon}
      <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{label}</Text>
    </Pressable>
  );
}

function CobaltCardVisual({ last4: _last4 }: { last4: string }) {
  return (
    <View style={styles.cobaltCardOuter}>
      <Image
        source={require('@/assets/cobalt-card.png')}
        style={styles.cobaltCardImage}
        resizeMode="contain"
        accessibilityLabel="American Express Cobalt Card"
      />
    </View>
  );
}

/* ── Inline icons (kept here so this view is self-contained) ────────── */

function CardSwitcherIcon() {
  return (
    <Svg width={28} height={28} viewBox="0 0 28 28">
      <Rect
        x={3.5}
        y={6}
        width={16}
        height={11}
        rx={1.5}
        fill="none"
        stroke={AmexColors.blue}
        strokeWidth={1.6}
      />
      <Rect
        x={8.5}
        y={11}
        width={16}
        height={11}
        rx={1.5}
        fill={AmexColors.surface}
        stroke={AmexColors.blue}
        strokeWidth={1.6}
      />
    </Svg>
  );
}

function SearchIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24">
      <Circle
        cx={11}
        cy={11}
        r={6.5}
        fill="none"
        stroke={AmexColors.blue}
        strokeWidth={1.8}
      />
      <Path
        d="M16 16 L21 21"
        stroke={AmexColors.blue}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function DollarIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24">
      <Circle
        cx={12}
        cy={12}
        r={10}
        fill="none"
        stroke={AmexColors.blue}
        strokeWidth={1.6}
      />
      <Path
        d="M14.5 9 Q12.5 8 11 9 Q9.5 10.2 11 11.5 L13 12.4 Q14.8 13.6 13 15 Q11 16 9.5 14.7 M12 7.5 V9 M12 15.5 V17"
        stroke={AmexColors.blue}
        strokeWidth={1.5}
        fill="none"
        strokeLinecap="round"
      />
    </Svg>
  );
}

function HomeIcon({ active }: { active?: boolean }) {
  const color = active ? AmexColors.blue : AmexColors.textSecondary;
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24">
      <Path
        d="M3 11 L12 3 L21 11 V20 H14 V14 H10 V20 H3 Z"
        fill={active ? color : 'none'}
        stroke={color}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function StarIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24">
      <Circle
        cx={12}
        cy={12}
        r={9}
        fill="none"
        stroke={AmexColors.textSecondary}
        strokeWidth={1.5}
      />
      <Path
        d="M12 7 L13.5 10.5 L17 11 L14.5 13.5 L15.2 17 L12 15 L8.8 17 L9.5 13.5 L7 11 L10.5 10.5 Z"
        fill="none"
        stroke={AmexColors.textSecondary}
        strokeWidth={1.3}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function TagIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24">
      <Path
        d="M3 11 V4 H10 L21 15 L15 21 L4 10"
        fill="none"
        stroke={AmexColors.textSecondary}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      <Circle cx={7.5} cy={7.5} r={1.4} fill={AmexColors.textSecondary} />
    </Svg>
  );
}

function PersonIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24">
      <Circle
        cx={12}
        cy={9}
        r={4}
        fill="none"
        stroke={AmexColors.textSecondary}
        strokeWidth={1.6}
      />
      <Path
        d="M4 21 Q4 14 12 14 Q20 14 20 21"
        fill="none"
        stroke={AmexColors.textSecondary}
        strokeWidth={1.6}
        strokeLinecap="round"
      />
    </Svg>
  );
}

/* ── Styles ─────────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: AmexColors.background },

  /* Top bar */
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: AmexColors.background,
  },
  topBarCenter: { flex: 1, alignItems: 'center', paddingHorizontal: 8 },
  topBarTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: AmexColors.textPrimary,
  },
  topBarSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: AmexColors.textSecondary,
    letterSpacing: 1,
  },

  /* Scroll */
  scroll: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 24 },

  /* Cobalt card visual — kept compact so Spend Insights is above the fold */
  cobaltCardWrap: { alignItems: 'center', marginTop: 0, marginBottom: 12 },
  cobaltCardOuter: {
    width: '62%',
    maxWidth: 240,
    aspectRatio: 1.579, // matches cobalt-card.png (480 × 304)
  },
  cobaltCardImage: {
    width: '100%',
    height: '100%',
  },

  /* Balance card */
  balanceCard: {
    backgroundColor: AmexColors.surface,
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  balanceLabel: {
    fontSize: 14,
    color: AmexColors.textSecondary,
  },
  balanceAmount: {
    marginTop: 4,
    fontSize: 30,
    fontWeight: '700',
    color: AmexColors.textPrimary,
    letterSpacing: -0.5,
  },
  balanceRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  balanceRowLabel: {
    fontSize: 14,
    color: AmexColors.textSecondary,
  },
  balanceRowValue: {
    fontSize: 14,
    fontWeight: '600',
    color: AmexColors.textPrimary,
  },
  balanceRowValueStrong: {
    fontSize: 15,
    fontWeight: '700',
    color: AmexColors.textPrimary,
  },
  balanceMinDue: {
    marginTop: 4,
    fontSize: 12,
    color: AmexColors.textSecondary,
  },
  divider: {
    marginTop: 16,
    height: StyleSheet.hairlineWidth,
    backgroundColor: AmexColors.divider,
  },
  linkBlue: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
    color: AmexColors.blue,
  },

  /* Make Payment */
  makePayment: {
    marginTop: 16,
    height: 56,
    borderRadius: 28,
    backgroundColor: AmexColors.blueLight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  makePaymentPressed: { opacity: 0.85 },
  makePaymentText: {
    fontSize: 16,
    fontWeight: '700',
    color: AmexColors.blue,
  },

  /* Insights section */
  insightsSection: { marginTop: 24 },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: '700',
    color: AmexColors.textPrimary,
    letterSpacing: -0.2,
  },
  newPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: AmexColors.blue,
  },
  newPillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  sectionSubcopy: {
    marginTop: 4,
    marginBottom: 12,
    fontSize: 13,
    lineHeight: 18,
    color: AmexColors.textSecondary,
  },

  /* Recent activity */
  dateHeader: {
    marginTop: 20,
    marginBottom: 8,
    fontSize: 16,
    fontWeight: '700',
    color: AmexColors.textPrimary,
  },
  txnCard: {
    marginBottom: 8,
    backgroundColor: AmexColors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  txnMerchant: {
    fontSize: 14,
    fontWeight: '500',
    color: AmexColors.textPrimary,
    letterSpacing: 0.2,
  },
  txnAmountWrap: { alignItems: 'flex-end' },
  txnAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: AmexColors.textPrimary,
  },
  txnPending: {
    marginTop: 2,
    fontSize: 12,
    color: AmexColors.textSecondary,
  },
  txnIconDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AmexColors.surfaceMuted,
  },
  txnSubMeta: {
    marginTop: 2,
    fontSize: 11,
    color: AmexColors.textSecondary,
  },

  /* Bottom tab bar */
  tabBar: {
    flexDirection: 'row',
    paddingTop: 8,
    paddingBottom: 6,
    paddingHorizontal: 4,
    backgroundColor: AmexColors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: AmexColors.divider,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
    gap: 2,
  },
  tabLabel: {
    fontSize: 11,
    color: AmexColors.textSecondary,
    fontWeight: '500',
  },
  tabLabelActive: {
    color: AmexColors.blue,
    fontWeight: '700',
  },
});
