import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AmexColors } from '@/constants/amexColors';
import { CATEGORY_META } from '@/constants/categories';
import { Copy } from '@/constants/strings';
import { useAllTransactions } from '@/services/spendInsightsApi';
import type {
  CategoryTransaction,
  SpendInsightsResponse,
} from '@/types/spendInsights';
import { formatCurrency, formatDueDateShort } from '@/utils/format';

interface Props {
  insights: SpendInsightsResponse | undefined;
}

interface DateGroup {
  date: string;
  rows: CategoryTransaction[];
}

/**
 * Desktop Recent Activity card.
 * Tabs: Latest Transactions (default) / Pending Transactions.
 *
 * Pulls from `useAllTransactions`, the same generator that powers each
 * category's "View all transactions" screen — so clicking a category and
 * drilling in always produces a strict subset of what's visible here.
 */
export function RecentActivityCard({ insights }: Props) {
  const t = Copy.homeDesktop.recentActivity;
  const [tab, setTab] = useState<'latest' | 'pending'>('latest');

  const { data: transactions } = useAllTransactions(insights?.billingMonth);

  const groups = useMemo<DateGroup[]>(() => {
    if (!transactions) return [];
    const bucket = new Map<string, CategoryTransaction[]>();
    for (const txn of transactions) {
      const arr = bucket.get(txn.date) ?? [];
      arr.push(txn);
      bucket.set(txn.date, arr);
    }
    return Array.from(bucket.entries())
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([date, rows]) => ({
        date,
        rows: rows.sort((a, b) => b.amount - a.amount),
      }));
  }, [transactions]);

  const totalCount = transactions?.length ?? 0;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{t.title}</Text>

      <View style={styles.tabsRow}>
        <Pressable
          onPress={() => setTab('latest')}
          accessibilityRole="tab"
          accessibilityState={{ selected: tab === 'latest' }}
          style={[styles.tab, tab === 'latest' ? styles.tabActive : styles.tabInactive]}
        >
          <Text style={[styles.tabText, tab === 'latest' && styles.tabTextActive]}>
            {tab === 'latest' ? '✓ ' : ''}
            {t.latest}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setTab('pending')}
          accessibilityRole="tab"
          accessibilityState={{ selected: tab === 'pending' }}
          style={[styles.tab, tab === 'pending' ? styles.tabActive : styles.tabInactive]}
        >
          <Text style={[styles.tabText, tab === 'pending' && styles.tabTextActive]}>
            {t.pending}
          </Text>
        </Pressable>
      </View>

      <View style={styles.planItBanner}>
        <View style={styles.planItIcon}>
          <Text style={styles.planItIconText}>$</Text>
        </View>
        <Text style={styles.planItText}>
          {t.planItBanner}{' '}
          <Text style={styles.planItLink}>{t.planItCta}</Text>
          <Text style={styles.planItLink}>  ›</Text>
        </Text>
      </View>

      {tab === 'latest' ? (
        <View style={styles.txnList}>
          {groups.map((group) => (
            <View key={group.date}>
              <Text style={styles.dateHeader}>
                {formatDueDateShort(group.date)}
              </Text>
              {group.rows.map((row) => {
                const meta = CATEGORY_META[row.categoryId];
                return (
                  <View key={row.id} style={styles.txnRow}>
                    <View
                      style={[
                        styles.txnIcon,
                        { backgroundColor: meta.color + '22' },
                      ]}
                    >
                      <Text style={[styles.txnGlyph, { color: meta.color }]}>
                        {meta.glyph}
                      </Text>
                    </View>
                    <View style={styles.txnBody}>
                      <Text style={styles.txnName} numberOfLines={1}>
                        {row.merchantName}
                      </Text>
                      <Text style={styles.txnMeta}>
                        {meta.label} · {row.earnRateMultiplier}x · +
                        {row.pointsEarned.toLocaleString('en-CA')} MR
                      </Text>
                    </View>
                    <Text style={styles.txnAmount}>
                      {formatCurrency(row.amount, true)}
                    </Text>
                  </View>
                );
              })}
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.emptyPending}>
          <Text style={styles.emptyPendingText}>{t.noPending}</Text>
        </View>
      )}

      {totalCount > 0 && (
        <Text style={styles.footerNote}>{t.transactionCount(totalCount)}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: AmexColors.surface,
    borderRadius: 8,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: AmexColors.textPrimary,
    marginBottom: 16,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 4,
  },
  tabActive: {
    backgroundColor: AmexColors.blue,
  },
  tabInactive: {
    backgroundColor: AmexColors.surfaceMuted,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: AmexColors.textPrimary,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  planItBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: AmexColors.surfaceMuted,
    borderRadius: 4,
    marginBottom: 16,
  },
  planItIcon: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: AmexColors.blueLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planItIconText: {
    color: AmexColors.blue,
    fontWeight: '900',
    fontSize: 14,
  },
  planItText: {
    flex: 1,
    fontSize: 13,
    color: AmexColors.textPrimary,
    lineHeight: 18,
  },
  planItLink: {
    color: AmexColors.blue,
    fontWeight: '700',
  },
  txnList: { gap: 0 },
  dateHeader: {
    marginTop: 12,
    marginBottom: 4,
    fontSize: 11,
    fontWeight: '700',
    color: AmexColors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  txnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: AmexColors.divider,
  },
  txnIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txnGlyph: { fontSize: 16 },
  txnBody: { flex: 1, minWidth: 0 },
  txnName: {
    fontSize: 14,
    fontWeight: '600',
    color: AmexColors.textPrimary,
  },
  txnMeta: {
    marginTop: 2,
    fontSize: 11,
    color: AmexColors.textSecondary,
  },
  txnAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: AmexColors.textPrimary,
  },
  emptyPending: {
    paddingVertical: 36,
    alignItems: 'center',
  },
  emptyPendingText: {
    fontSize: 13,
    color: AmexColors.textSecondary,
  },
  footerNote: {
    marginTop: 14,
    fontSize: 11,
    color: AmexColors.textTertiary,
  },
});
