import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { AmexColors } from '@/constants/amexColors';
import { CATEGORY_META } from '@/constants/categories';
import { Copy } from '@/constants/strings';
import { EarnRateBadge } from '@/components/spend-insights/EarnRateBadge';
import {
  useCategoryTransactions,
  useSpendInsights,
} from '@/services/spendInsightsApi';
import { useSpendInsightsStore } from '@/store/spendInsightsStore';
import {
  formatCurrency,
  formatDueDateShort,
  formatMonthLong,
  formatPoints,
} from '@/utils/format';
import type {
  CategoryId,
  CategoryTransaction,
} from '@/types/spendInsights';

export default function CategoryTransactionsScreen() {
  const { categoryId } = useLocalSearchParams<{ categoryId: CategoryId }>();
  const selectedBillingMonth = useSpendInsightsStore(
    (s) => s.selectedBillingMonth,
  );

  const { data: insights } = useSpendInsights(selectedBillingMonth);
  const { data: transactions, isLoading } = useCategoryTransactions(
    categoryId,
    selectedBillingMonth,
  );

  const meta = categoryId ? CATEGORY_META[categoryId] : undefined;
  const insight = useMemo(
    () => insights?.categories.find((c) => c.categoryId === categoryId),
    [insights, categoryId],
  );

  const groups = useMemo(
    () => groupByDate(transactions ?? []),
    [transactions],
  );

  const totals = useMemo(() => {
    const rows = transactions ?? [];
    const spend = rows.reduce((acc, r) => acc + r.amount, 0);
    const pts = rows.reduce((acc, r) => acc + r.pointsEarned, 0);
    return { count: rows.length, spend, pts };
  }, [transactions]);

  if (!meta || !categoryId) {
    return (
      <SafeAreaView style={styles.safe}>
        <TopBar title="Transactions" />
        <View style={{ padding: 24 }}>
          <Text style={{ color: AmexColors.textSecondary }}>
            Category not found.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <TopBar title={meta.label} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary header — mirrors the totals on the category detail screen */}
        <View style={[styles.header, { borderColor: meta.color + '33' }]}>
          <View style={styles.headerRow}>
            <View style={[styles.iconBubble, { backgroundColor: meta.color + '22' }]}>
              <Text style={[styles.iconGlyph, { color: meta.color }]}>
                {meta.glyph}
              </Text>
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.eyebrow} numberOfLines={1}>
                {insights
                  ? Copy.transactions.subtitle(
                      formatMonthLong(insights.billingMonth),
                    )
                  : ' '}
              </Text>
              <View style={styles.titleRow}>
                <Text style={styles.title} numberOfLines={1}>
                  {meta.label}
                </Text>
                {insight && (
                  <EarnRateBadge
                    multiplier={insight.earnRateMultiplier}
                    size="sm"
                  />
                )}
              </View>
            </View>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryTotal}>
              {formatCurrency(totals.spend, true)}
            </Text>
            <Text style={styles.summaryMeta}>
              {Copy.transactions.summary(
                totals.count,
                formatCurrency(totals.spend, true),
                formatPoints(totals.pts),
              )}
            </Text>
          </View>
        </View>

        {/* Transaction list — grouped by posted date, newest first */}
        {isLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator color={AmexColors.blue} />
          </View>
        ) : groups.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>{Copy.transactions.empty}</Text>
          </View>
        ) : (
          <View style={styles.listCard}>
            {groups.map((group, gi) => (
              <View key={group.date}>
                <View style={styles.dateHeader}>
                  <Text style={styles.dateHeaderText}>
                    {formatDueDateShort(group.date)}
                  </Text>
                </View>
                {group.rows.map((row, ri) => (
                  <Row
                    key={row.id}
                    row={row}
                    accent={meta.color}
                    isLast={
                      gi === groups.length - 1 && ri === group.rows.length - 1
                    }
                  />
                ))}
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function TopBar({ title }: { title: string }) {
  return (
    <View style={styles.topbar}>
      <Pressable
        onPress={() => router.back()}
        style={styles.iconButton}
        accessibilityLabel="Back"
      >
        <Text style={styles.iconButtonText}>‹</Text>
      </Pressable>
      <Text style={styles.topbarTitle} numberOfLines={1}>
        {Copy.transactions.headerTitle(title)}
      </Text>
      <View style={styles.iconButton} />
    </View>
  );
}

function Row({
  row,
  accent,
  isLast,
}: {
  row: CategoryTransaction;
  accent: string;
  isLast: boolean;
}) {
  return (
    <View style={[styles.row, !isLast && styles.rowBorder]}>
      <View style={styles.rowMain}>
        <Text style={styles.merchant} numberOfLines={1}>
          {row.merchantName}
        </Text>
        <Text style={styles.rowAmount}>
          {formatCurrency(row.amount, true)}
        </Text>
      </View>
      <View style={styles.rowMeta}>
        <View style={styles.rateTag}>
          <Text style={[styles.rateTagText, { color: accent }]}>
            {Copy.transactions.earnRate(row.earnRateMultiplier)}
          </Text>
        </View>
        <Text style={styles.rowPoints}>
          {Copy.transactions.pointsEarned(formatPoints(row.pointsEarned))}
        </Text>
      </View>
    </View>
  );
}

function groupByDate(rows: CategoryTransaction[]) {
  const map = new Map<string, CategoryTransaction[]>();
  for (const r of rows) {
    const list = map.get(r.date) ?? [];
    list.push(r);
    map.set(r.date, list);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, list]) => ({
      date,
      rows: list.sort((a, b) => b.amount - a.amount),
    }));
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: AmexColors.background },
  topbar: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  topbarTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    color: AmexColors.textPrimary,
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonText: {
    fontSize: 28,
    color: AmexColors.blue,
    lineHeight: 30,
  },
  scroll: { paddingHorizontal: 16, paddingBottom: 24 },

  header: {
    backgroundColor: AmexColors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBubble: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconGlyph: { fontSize: 18 },
  eyebrow: {
    fontSize: 11,
    fontWeight: '600',
    color: AmexColors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  titleRow: {
    marginTop: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    flexShrink: 1,
    fontSize: 18,
    fontWeight: '700',
    color: AmexColors.textPrimary,
  },
  summaryRow: { marginTop: 14 },
  summaryTotal: {
    fontSize: 26,
    fontWeight: '700',
    color: AmexColors.textPrimary,
    letterSpacing: -0.4,
  },
  summaryMeta: {
    marginTop: 2,
    fontSize: 12,
    color: AmexColors.textSecondary,
  },

  loading: { marginTop: 24, alignItems: 'center' },
  empty: {
    marginTop: 16,
    padding: 20,
    borderRadius: 16,
    backgroundColor: AmexColors.surface,
  },
  emptyText: { color: AmexColors.textSecondary, fontSize: 13 },

  listCard: {
    marginTop: 16,
    backgroundColor: AmexColors.surface,
    borderRadius: 16,
    overflow: 'hidden',
  },
  dateHeader: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 6,
    backgroundColor: AmexColors.surface,
  },
  dateHeaderText: {
    fontSize: 11,
    fontWeight: '700',
    color: AmexColors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  row: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: AmexColors.divider,
  },
  rowMain: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  merchant: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: AmexColors.textPrimary,
  },
  rowAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: AmexColors.textPrimary,
    letterSpacing: -0.2,
  },
  rowMeta: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rateTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: AmexColors.surfaceMuted,
  },
  rateTagText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  rowPoints: {
    fontSize: 12,
    color: AmexColors.textSecondary,
    fontWeight: '600',
  },
});
