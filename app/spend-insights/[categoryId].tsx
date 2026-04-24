import React, { useMemo } from 'react';
import {
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
import { CobaltCapBar } from '@/components/spend-insights/CobaltCapBar';
import { EarnRateBadge } from '@/components/spend-insights/EarnRateBadge';
import { useSpendInsights } from '@/services/spendInsightsApi';
import { useSpendInsightsStore } from '@/store/spendInsightsStore';
import {
  formatCurrency,
  formatDelta,
  formatDeltaPercent,
  formatMonthLong,
  formatPoints,
} from '@/utils/format';
import type { CategoryId } from '@/types/spendInsights';

export default function CategoryDetailScreen() {
  const { categoryId } = useLocalSearchParams<{ categoryId: CategoryId }>();
  const selectedBillingMonth = useSpendInsightsStore((s) => s.selectedBillingMonth);
  const { data } = useSpendInsights(selectedBillingMonth);

  const insight = useMemo(
    () => data?.categories.find((c) => c.categoryId === categoryId),
    [data, categoryId],
  );

  if (!insight || !data) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.topbar}>
          <Pressable onPress={() => router.back()} style={styles.iconButton}>
            <Text style={styles.iconButtonText}>‹</Text>
          </Pressable>
        </View>
        <View style={{ padding: 24 }}>
          <Text style={{ color: AmexColors.textSecondary }}>Category not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const meta = CATEGORY_META[insight.categoryId];
  const showCobaltCap =
    data.cardProduct === 'cobalt' &&
    insight.cobaltCapLimit != null &&
    insight.cobaltCapUsed != null;

  const totalMerchantSpend = insight.topMerchants.reduce(
    (acc, m) => acc + m.totalSpend,
    0,
  );
  const totalTransactions = insight.topMerchants.reduce(
    (acc, m) => acc + m.transactionCount,
    0,
  );

  const delta = insight.monthOverMonthDelta;
  const deltaColor =
    delta.amount > 0 ? AmexColors.negative : delta.amount < 0 ? AmexColors.positive : AmexColors.textSecondary;

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <View style={styles.topbar}>
        <Pressable onPress={() => router.back()} style={styles.iconButton} accessibilityLabel="Back">
          <Text style={styles.iconButtonText}>‹</Text>
        </Pressable>
        <Text style={styles.topbarTitle}>{meta.label}</Text>
        <View style={styles.iconButton} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={[styles.hero, { borderColor: meta.color + '33' }]}>
          <View style={[styles.heroIcon, { backgroundColor: meta.color + '22' }]}>
            <Text style={[styles.heroIconGlyph, { color: meta.color }]}>{meta.glyph}</Text>
          </View>
          <View style={styles.heroAmountRow}>
            <Text style={styles.heroAmount}>{formatCurrency(insight.totalSpend, true)}</Text>
            <EarnRateBadge multiplier={insight.earnRateMultiplier} size="md" />
          </View>
          <Text style={styles.heroSub}>{meta.description}</Text>
          <Text style={styles.heroMonth}>{formatMonthLong(data.billingMonth)}</Text>

          <View style={[styles.divider, { backgroundColor: AmexColors.divider }]} />

          <View style={styles.statsRow}>
            <Stat label="MR earned" value={formatPoints(insight.mrPointsEarned)} accent />
            <Stat
              label="vs last month"
              value={delta.amount === 0 ? '—' : formatDelta(delta.amount)}
              valueColor={deltaColor}
            />
            <Stat label="Transactions" value={String(totalTransactions)} />
          </View>

          <Text style={styles.callout}>
            {Copy.category.earnRateCallout(insight.earnRateMultiplier)}
            {delta.amount !== 0 ? ` · ${formatDeltaPercent(delta.percent)}` : ''}
          </Text>

          {showCobaltCap && (
            <CobaltCapBar
              used={insight.cobaltCapUsed!}
              limit={insight.cobaltCapLimit!}
              variant="detail"
            />
          )}
        </View>

        {/* Top merchants — top 5 per PRD §8.2 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{Copy.category.topMerchants}</Text>
          <View style={styles.merchantList}>
            {insight.topMerchants.slice(0, 5).map((m, i) => {
              const sharePct = totalMerchantSpend > 0 ? (m.totalSpend / totalMerchantSpend) * 100 : 0;
              return (
                <View key={`${m.name}-${i}`} style={styles.merchantRow}>
                  <View style={styles.merchantRank}>
                    <Text style={styles.merchantRankText}>{i + 1}</Text>
                  </View>
                  <View style={styles.merchantBody}>
                    <View style={styles.merchantNameRow}>
                      <Text style={styles.merchantName} numberOfLines={1}>
                        {m.name}
                      </Text>
                      <Text style={styles.merchantAmount}>
                        {formatCurrency(m.totalSpend, true)}
                      </Text>
                    </View>
                    <Text style={styles.merchantMeta}>
                      {Copy.category.transactionCount(m.transactionCount)} ·{' '}
                      {sharePct.toFixed(0)}% of category
                    </Text>
                    <View style={styles.merchantBarTrack}>
                      <View
                        style={[
                          styles.merchantBarFill,
                          {
                            width: `${sharePct}%`,
                            backgroundColor: meta.color,
                          },
                        ]}
                      />
                    </View>
                  </View>
                </View>
              );
            })}
          </View>

          {insight.anomalies?.map((anomaly) => (
            <View
              key={`${anomaly.merchantName}-${anomaly.date}`}
              style={styles.anomalyCard}
              accessibilityRole="alert"
            >
              <View style={styles.anomalyIconWrap}>
                <Text style={styles.anomalyIconGlyph}>!</Text>
              </View>
              <View style={styles.anomalyBody}>
                <Text style={styles.anomalyTitle}>
                  Heads up — unusual purchase
                </Text>
                <Text style={styles.anomalyReason}>{anomaly.reason}</Text>
                <View style={styles.anomalyRow}>
                  <Text style={styles.anomalyMerchant}>
                    {anomaly.merchantName}
                  </Text>
                  <Text style={styles.anomalyAmount}>
                    {formatCurrency(anomaly.amount, true)}
                  </Text>
                </View>
                <View style={styles.anomalyActions}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.anomalyButton,
                      styles.anomalyButtonPrimary,
                      pressed && { opacity: 0.85 },
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel="Confirm this purchase was me"
                  >
                    <Text style={styles.anomalyButtonPrimaryText}>
                      Yes, this was me
                    </Text>
                  </Pressable>
                  <Pressable
                    style={({ pressed }) => [
                      styles.anomalyButton,
                      styles.anomalyButtonSecondary,
                      pressed && { opacity: 0.85 },
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel="Report this purchase as fraud"
                  >
                    <Text style={styles.anomalyButtonSecondaryText}>
                      Report as fraud
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          ))}

          <Pressable
            style={styles.linkRow}
            accessibilityRole="link"
            accessibilityLabel={`${Copy.category.viewAllTransactions} for ${meta.label}`}
            onPress={() =>
              router.push({
                pathname: '/spend-insights/transactions/[categoryId]',
                params: { categoryId: insight.categoryId },
              })
            }
          >
            <Text style={styles.linkText}>{Copy.category.viewAllTransactions}</Text>
            <Text style={styles.linkChev}>›</Text>
          </Pressable>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({
  label,
  value,
  accent,
  valueColor,
}: {
  label: string;
  value: string;
  accent?: boolean;
  valueColor?: string;
}) {
  return (
    <View style={styles.stat}>
      <Text
        style={[
          styles.statValue,
          accent && { color: AmexColors.blue },
          valueColor ? { color: valueColor } : undefined,
        ]}
      >
        {value}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
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
  scroll: { paddingHorizontal: 16, paddingBottom: 24 },
  hero: {
    backgroundColor: AmexColors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
  },
  heroIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroIconGlyph: { fontSize: 22 },
  heroAmountRow: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  heroAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: AmexColors.textPrimary,
    letterSpacing: -0.5,
  },
  heroSub: {
    marginTop: 6,
    fontSize: 13,
    color: AmexColors.textSecondary,
  },
  heroMonth: {
    marginTop: 2,
    fontSize: 12,
    color: AmexColors.textTertiary,
  },
  divider: { height: 1, marginVertical: 16 },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  stat: { flex: 1 },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: AmexColors.textPrimary,
  },
  statLabel: {
    marginTop: 2,
    fontSize: 11,
    color: AmexColors.textSecondary,
  },
  callout: {
    marginTop: 14,
    fontSize: 12,
    color: AmexColors.textSecondary,
    fontStyle: 'italic',
  },
  section: {
    marginTop: 20,
    backgroundColor: AmexColors.surface,
    borderRadius: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: AmexColors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 12,
  },
  merchantList: { gap: 14 },
  merchantRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  merchantRank: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: AmexColors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  merchantRankText: {
    fontSize: 11,
    fontWeight: '700',
    color: AmexColors.textSecondary,
  },
  merchantBody: { flex: 1, minWidth: 0 },
  merchantNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  merchantName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: AmexColors.textPrimary,
  },
  merchantAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: AmexColors.textPrimary,
  },
  merchantMeta: {
    marginTop: 2,
    fontSize: 11,
    color: AmexColors.textSecondary,
  },
  merchantBarTrack: {
    marginTop: 6,
    height: 4,
    borderRadius: 2,
    backgroundColor: AmexColors.divider,
    overflow: 'hidden',
  },
  merchantBarFill: { height: '100%', borderRadius: 2 },
  linkRow: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '600',
    color: AmexColors.blue,
  },
  linkChev: {
    fontSize: 22,
    color: AmexColors.blue,
  },
  anomalyCard: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: AmexColors.warning,
    backgroundColor: '#FFF7E8',
  },
  anomalyIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: AmexColors.warning,
    alignItems: 'center',
    justifyContent: 'center',
  },
  anomalyIconGlyph: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 18,
  },
  anomalyBody: { flex: 1, minWidth: 0 },
  anomalyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: AmexColors.textPrimary,
  },
  anomalyReason: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 17,
    color: AmexColors.textSecondary,
  },
  anomalyRow: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0E4CC',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  anomalyMerchant: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: AmexColors.textPrimary,
  },
  anomalyAmount: {
    fontSize: 13,
    fontWeight: '700',
    color: AmexColors.textPrimary,
  },
  anomalyActions: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 8,
  },
  anomalyButton: {
    flex: 1,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  anomalyButtonPrimary: {
    backgroundColor: AmexColors.blue,
  },
  anomalyButtonPrimaryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  anomalyButtonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: AmexColors.blue,
  },
  anomalyButtonSecondaryText: {
    color: AmexColors.blue,
    fontSize: 12,
    fontWeight: '700',
  },
});
