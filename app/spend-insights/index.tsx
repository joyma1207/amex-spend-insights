import React, { useCallback, useMemo, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { AmexColors } from '@/constants/amexColors';
import { CATEGORY_ORDER } from '@/constants/categories';
import { Copy } from '@/constants/strings';
import { CategoryRow } from '@/components/spend-insights/CategoryRow';
import { DonutChart } from '@/components/spend-insights/DonutChart';
import { MRPointsBadge } from '@/components/spend-insights/MRPointsBadge';
import { TrendChart } from '@/components/spend-insights/TrendChart';
import { SpendInsightsSkeleton } from '@/components/spend-insights/Skeleton';
import { useSpendInsights } from '@/services/spendInsightsApi';
import { useSpendInsightsStore } from '@/store/spendInsightsStore';
import {
  AVAILABLE_BILLING_MONTHS,
  CURRENT_BILLING_MONTH,
  EARLIEST_BILLING_MONTH,
} from '@/mocks/spendInsightsMock';
import {
  formatBillingDates,
  formatCurrency,
  formatMonthLong,
  formatMonthShort,
} from '@/utils/format';
import type { CategoryId } from '@/types/spendInsights';

export default function SpendInsightsMainScreen() {
  const selectedBillingMonth = useSpendInsightsStore((s) => s.selectedBillingMonth);
  const setSelectedBillingMonth = useSpendInsightsStore(
    (s) => s.setSelectedBillingMonth,
  );

  const { data, isLoading, isError, refetch, isRefetching } = useSpendInsights(
    selectedBillingMonth,
  );

  const [highlighted, setHighlighted] = useState<CategoryId | null>(null);

  const sortedCategories = useMemo(() => {
    if (!data) return [];
    return [...data.categories].sort(
      (a, b) =>
        CATEGORY_ORDER.indexOf(a.categoryId) - CATEGORY_ORDER.indexOf(b.categoryId),
    );
  }, [data]);

  const slices = useMemo(
    () =>
      sortedCategories
        .filter((c) => c.totalSpend > 0)
        .map((c) => ({ categoryId: c.categoryId, value: c.totalSpend })),
    [sortedCategories],
  );

  const onSelectMonth = useCallback(
    (month: string) => {
      if (AVAILABLE_BILLING_MONTHS.includes(month)) {
        setSelectedBillingMonth(month);
        setHighlighted(null);
      }
    },
    [setSelectedBillingMonth],
  );

  const idx = AVAILABLE_BILLING_MONTHS.indexOf(selectedBillingMonth);
  const canGoPrev = idx > 0;
  const canGoNext = idx >= 0 && idx < AVAILABLE_BILLING_MONTHS.length - 1;
  const isCurrent = selectedBillingMonth === CURRENT_BILLING_MONTH;

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      {/* Top nav */}
      <View style={styles.topbar}>
        <Pressable
          onPress={() => router.back()}
          accessibilityLabel="Back"
          style={styles.iconButton}
        >
          <Text style={styles.iconButtonText}>‹</Text>
        </Pressable>
        <Text style={styles.topbarTitle}>{Copy.insights.headerTitle}</Text>
        {isCurrent ? (
          <View style={styles.iconButton} />
        ) : (
          <Pressable
            onPress={() => onSelectMonth(CURRENT_BILLING_MONTH)}
            accessibilityLabel="Jump to current month"
            style={styles.todayButton}
          >
            <Text style={styles.todayButtonText}>Now</Text>
          </Pressable>
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={AmexColors.blue}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {isLoading && !data ? (
          <SpendInsightsSkeleton />
        ) : isError || !data ? (
          <View style={styles.errorWrap}>
            <Text style={styles.errorText}>{Copy.insights.error}</Text>
            <Pressable style={styles.retryBtn} onPress={() => refetch()}>
              <Text style={styles.retryBtnText}>{Copy.insights.retry}</Text>
            </Pressable>
          </View>
        ) : (
          <>
            {/* Month nav */}
            <View style={styles.monthNav}>
              <Pressable
                onPress={() =>
                  canGoPrev && onSelectMonth(AVAILABLE_BILLING_MONTHS[idx - 1]!)
                }
                disabled={!canGoPrev}
                style={[styles.monthNavButton, !canGoPrev && styles.monthNavButtonDisabled]}
                accessibilityLabel="Previous month"
                accessibilityRole="button"
              >
                <Text style={styles.monthNavChevron}>‹</Text>
                <Text style={styles.monthNavText}>Previous month</Text>
              </Pressable>
              <View style={styles.monthLabelGroup}>
                <Text style={styles.monthLabel}>
                  {formatMonthLong(data.billingMonth)}
                </Text>
                <Text style={styles.monthDates}>
                  {formatBillingDates(data.billingPeriod.start, data.billingPeriod.end)}
                </Text>
              </View>
              <Pressable
                onPress={() =>
                  canGoNext && onSelectMonth(AVAILABLE_BILLING_MONTHS[idx + 1]!)
                }
                disabled={!canGoNext}
                style={[styles.monthNavButton, !canGoNext && styles.monthNavButtonDisabled]}
                accessibilityLabel="Next month"
                accessibilityRole="button"
              >
                <Text style={styles.monthNavText}>Next month</Text>
                <Text style={styles.monthNavChevron}>›</Text>
              </Pressable>
            </View>

            {!canGoPrev && (
              <Text style={styles.historyLimit}>
                {Copy.insights.historyLimit(formatMonthShort(EARLIEST_BILLING_MONTH))}
              </Text>
            )}

            {/* Total spend + MR badge */}
            <View style={styles.totalsBlock}>
              <Text style={styles.totalAmount}>
                {formatCurrency(data.totalSpend.amount, true)}
              </Text>
              <Text style={styles.totalLabel}>
                {Copy.insights.totalLabel(formatMonthLong(data.billingMonth))}
              </Text>
              <View style={styles.mrBadgeWrap}>
                <MRPointsBadge points={data.totalMRPointsEarned} />
              </View>
            </View>

            {/* Donut */}
            <View style={styles.donutWrap}>
              <DonutChart
                slices={slices}
                totalSpend={data.totalSpend.amount}
                billingMonth={data.billingMonth}
                highlightedCategory={highlighted}
                onSlicePress={(id) =>
                  setHighlighted((prev) => (prev === id ? null : id))
                }
              />
            </View>

            {/* Category list */}
            <View style={styles.list}>
              {sortedCategories.map((insight) => (
                <CategoryRow
                  key={insight.categoryId}
                  insight={insight}
                  cardProduct={data.cardProduct}
                  highlighted={highlighted === insight.categoryId}
                  onPress={() => router.push(`/spend-insights/${insight.categoryId}`)}
                />
              ))}
            </View>

            <Text style={styles.pendingNote}>{Copy.insights.pendingNote}</Text>

            {/* Trend */}
            <View style={styles.trendWrap}>
              <TrendChart
                data={data.trend}
                selectedBillingMonth={selectedBillingMonth}
                onSelectMonth={onSelectMonth}
              />
            </View>

            <View style={styles.footerSpacer} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: AmexColors.background },
  topbar: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    backgroundColor: AmexColors.background,
  },
  topbarTitle: {
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
  todayButton: {
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: AmexColors.blueLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayButtonText: {
    color: AmexColors.blue,
    fontWeight: '700',
    fontSize: 12,
  },
  scroll: { paddingHorizontal: 16, paddingBottom: 24 },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  monthNavButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 44,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
  },
  monthNavButtonDisabled: { opacity: 0.35 },
  monthNavText: {
    fontSize: 13,
    color: AmexColors.blue,
    fontWeight: '600',
  },
  monthNavChevron: {
    fontSize: 20,
    color: AmexColors.blue,
    lineHeight: 22,
    fontWeight: '500',
  },
  monthLabelGroup: { alignItems: 'center', flex: 1 },
  monthLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: AmexColors.textPrimary,
  },
  monthDates: {
    marginTop: 2,
    fontSize: 12,
    color: AmexColors.textSecondary,
  },
  historyLimit: {
    marginTop: 6,
    textAlign: 'center',
    fontSize: 11,
    color: AmexColors.textTertiary,
  },
  totalsBlock: {
    alignItems: 'center',
    marginTop: 18,
  },
  totalAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: AmexColors.textPrimary,
    letterSpacing: -0.5,
  },
  totalLabel: {
    marginTop: 4,
    fontSize: 12,
    color: AmexColors.textSecondary,
  },
  mrBadgeWrap: { marginTop: 12 },
  donutWrap: { alignItems: 'center', marginTop: 24, marginBottom: 8 },
  list: { marginTop: 16, gap: 8 },
  pendingNote: {
    marginTop: 12,
    fontSize: 11,
    color: AmexColors.textTertiary,
    textAlign: 'center',
  },
  trendWrap: { marginTop: 20 },
  footerSpacer: { height: 24 },
  errorWrap: { padding: 24, alignItems: 'center' },
  errorText: {
    fontSize: 14,
    color: AmexColors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryBtn: {
    backgroundColor: AmexColors.blue,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryBtnText: { color: AmexColors.textInverse, fontWeight: '700' },
});
