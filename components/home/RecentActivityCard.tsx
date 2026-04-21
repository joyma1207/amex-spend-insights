import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AmexColors } from '@/constants/amexColors';
import { CATEGORY_META } from '@/constants/categories';
import { Copy } from '@/constants/strings';
import type { SpendInsightsResponse } from '@/types/spendInsights';
import { formatCurrency } from '@/utils/format';

interface Props {
  insights: SpendInsightsResponse | undefined;
}

interface FlatTxn {
  id: string;
  name: string;
  amount: number;
  date: string;
  categoryColor: string;
  categoryGlyph: string;
  categoryLabel: string;
}

/**
 * Desktop Recent Activity card — left/wide.
 * Tabs: Latest Transactions (default) / Pending Transactions.
 * Pulls a stub list from the top merchants in this month's insights so the
 * data feels internally consistent with the Spend Insights row.
 */
export function RecentActivityCard({ insights }: Props) {
  const t = Copy.homeDesktop.recentActivity;
  const [tab, setTab] = useState<'latest' | 'pending'>('latest');

  const transactions = useMemo<FlatTxn[]>(() => {
    if (!insights) return [];
    const flat: FlatTxn[] = [];
    insights.categories.forEach((cat) => {
      const meta = CATEGORY_META[cat.categoryId];
      cat.topMerchants.forEach((m, i) => {
        flat.push({
          id: `${cat.categoryId}-${i}-${m.name}`,
          name: m.name,
          amount: m.totalSpend,
          date: dateForRow(insights.billingPeriod.end, flat.length),
          categoryColor: meta.color,
          categoryGlyph: meta.glyph,
          categoryLabel: meta.label,
        });
      });
    });
    return flat
      .sort((a, b) => (a.date < b.date ? 1 : -1))
      .slice(0, 6);
  }, [insights]);

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
          {transactions.map((txn) => (
            <View key={txn.id} style={styles.txnRow}>
              <View
                style={[styles.txnIcon, { backgroundColor: txn.categoryColor + '22' }]}
              >
                <Text style={[styles.txnGlyph, { color: txn.categoryColor }]}>
                  {txn.categoryGlyph}
                </Text>
              </View>
              <View style={styles.txnBody}>
                <Text style={styles.txnName} numberOfLines={1}>
                  {txn.name}
                </Text>
                <Text style={styles.txnMeta}>
                  {txn.date} · {txn.categoryLabel}
                </Text>
              </View>
              <Text style={styles.txnAmount}>{formatCurrency(txn.amount, true)}</Text>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.emptyPending}>
          <Text style={styles.emptyPendingText}>{t.noPending}</Text>
        </View>
      )}

      {insights && (
        <Text style={styles.footerNote}>
          {t.transactionCount(
            insights.categories.reduce(
              (acc, c) => acc + c.topMerchants.reduce((a, m) => a + m.transactionCount, 0),
              0,
            ),
          )}
        </Text>
      )}
    </View>
  );
}

/** Stable, deterministic date strings for the stub txn list. */
function dateForRow(billingEnd: string, index: number): string {
  const [, m, d] = billingEnd.split('-');
  const day = Math.max(1, Number(d) - index * 2);
  const monthLabels = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${monthLabels[Number(m) - 1]} ${day}`;
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
  txnList: { gap: 4 },
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
