import React, { useMemo } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { AmexColors } from '@/constants/amexColors';
import { CATEGORY_META } from '@/constants/categories';
import { Copy } from '@/constants/strings';
import type {
  CategoryInsight,
  SpendInsightsResponse,
} from '@/types/spendInsights';
import {
  formatBillingDates,
  formatCurrency,
  formatMonthLong,
  formatPoints,
} from '@/utils/format';
import { DonutChart } from './DonutChart';
import { EarnRateBadge } from './EarnRateBadge';
import { Skeleton } from './Skeleton';

interface Props {
  insights: SpendInsightsResponse | undefined;
  loading?: boolean;
  onOpenInsights: () => void;
}

/**
 * Web-only style fragments. RN's StyleSheet types don't include CSS
 * properties like `transitionProperty` and `cursor`, but `react-native-web`
 * passes them through to the DOM. We isolate them here so the rest of the
 * stylesheet stays strictly typed.
 */
const WEB_TRANSITIONS_CARD =
  Platform.OS === 'web'
    ? {
        transitionProperty: 'box-shadow, border-color, transform',
        transitionDuration: '150ms',
        cursor: 'pointer',
      }
    : {};

const WEB_TRANSITIONS_CHIP =
  Platform.OS === 'web'
    ? {
        transitionProperty: 'border-color, background-color',
        transitionDuration: '120ms',
        cursor: 'pointer',
      }
    : {};

/**
 * Full-width desktop teaser placed between the Balance Hero and the
 * Recent Activity / MR row. The single highest-value entry point into
 * Spend Insights — composed of donut + headline metrics + 4 category chips
 * + primary CTA, all wired to deep-link into the main insights surface.
 */
export function SpendInsightsDesktopRow({
  insights,
  loading,
  onOpenInsights,
}: Props) {
  const t = Copy.insightsCard;

  const sortedTopCategories = useMemo<CategoryInsight[]>(() => {
    if (!insights) return [];
    return [...insights.categories].sort((a, b) => b.totalSpend - a.totalSpend);
  }, [insights]);

  const topFour = sortedTopCategories.slice(0, 4);
  const remaining = Math.max(0, sortedTopCategories.length - 4);

  const slices = useMemo(
    () =>
      sortedTopCategories
        .filter((c) => c.totalSpend > 0)
        .map((c) => ({ categoryId: c.categoryId, value: c.totalSpend })),
    [sortedTopCategories],
  );

  if (loading || !insights) {
    return <DesktopRowSkeleton />;
  }

  return (
    <Pressable
      onPress={onOpenInsights}
      accessibilityRole="button"
      accessibilityLabel="Open Spend Insights"
      style={({ hovered, pressed }) => [
        styles.card,
        hovered && styles.cardHover,
        pressed && styles.cardPressed,
      ]}
    >
      <View style={styles.eyebrowRow}>
        <View style={styles.eyebrowPill}>
          <View style={styles.eyebrowDot} />
          <Text style={styles.eyebrow}>{t.desktopEyebrow}</Text>
        </View>
        <Text style={styles.eyebrowMeta}>
          {formatBillingDates(insights.billingPeriod.start, insights.billingPeriod.end)}
        </Text>
      </View>

      <View style={styles.row}>
        {/* ── Donut block ── */}
        <View style={styles.donutBlock}>
          <DonutChart
            slices={slices}
            totalSpend={insights.totalSpend.amount}
            billingMonth={insights.billingMonth}
            size={132}
            thickness={16}
          />
        </View>

        {/* ── Middle: title + total + chips ── */}
        <View style={styles.middle}>
          <Text style={styles.title}>{t.desktopTitle(formatMonthLong(insights.billingMonth))}</Text>
          <Text style={styles.totalLine}>
            <Text style={styles.totalAmount}>
              {formatCurrency(insights.totalSpend.amount, true)}
            </Text>
            <Text style={styles.totalDivider}>  ·  </Text>
            <Text style={styles.mrText}>
              {formatPoints(insights.totalMRPointsEarned)} MR earned this month
            </Text>
          </Text>

          <View style={styles.chipRow}>
            {topFour.map((cat) => (
              <CategoryChip
                key={cat.categoryId}
                insight={cat}
                onPress={(e) => {
                  // Stop the row's onPress from also firing.
                  e?.stopPropagation?.();
                  router.push(`/spend-insights/${cat.categoryId}`);
                }}
              />
            ))}
            {remaining > 0 && (
              <View style={styles.moreChip}>
                <Text style={styles.moreChipText}>{t.moreCategories(remaining)}</Text>
              </View>
            )}
          </View>
        </View>

        {/* ── CTA block ── */}
        <View style={styles.ctaBlock}>
          <Pressable
            onPress={onOpenInsights}
            accessibilityRole="button"
            style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
          >
            <Text style={styles.ctaText}>{t.desktopCta}  →</Text>
          </Pressable>
          <Text style={styles.ctaSubtle}>
            Donut · per-category MR · Cobalt 5x cap
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

interface ChipProps {
  insight: CategoryInsight;
  onPress: (e?: { stopPropagation?: () => void }) => void;
}

function CategoryChip({ insight, onPress }: ChipProps) {
  const meta = CATEGORY_META[insight.categoryId];
  return (
    <Pressable
      onPress={(e) => onPress(e as unknown as { stopPropagation?: () => void })}
      accessibilityRole="link"
      accessibilityLabel={`${meta.label}, ${formatCurrency(insight.totalSpend, true)}, ${formatPoints(insight.mrPointsEarned)} MR`}
      style={({ hovered, pressed }) => [
        styles.chip,
        hovered && styles.chipHover,
        pressed && styles.chipPressed,
      ]}
    >
      <View style={[styles.chipDot, { backgroundColor: meta.color }]} />
      <Text style={styles.chipLabel}>{meta.label}</Text>
      <EarnRateBadge multiplier={insight.earnRateMultiplier} />
      <Text style={styles.chipSpend}>{formatCurrency(insight.totalSpend)}</Text>
      <Text style={styles.chipMr}>· {formatPoints(insight.mrPointsEarned)} MR</Text>
    </Pressable>
  );
}

function DesktopRowSkeleton() {
  return (
    <View style={styles.card}>
      <Skeleton width={120} height={14} />
      <View style={[styles.row, { marginTop: 16 }]}>
        <View style={styles.donutBlock}>
          <Skeleton width={132} height={132} radius={66} />
        </View>
        <View style={styles.middle}>
          <Skeleton width={220} height={20} />
          <Skeleton width={300} height={14} style={{ marginTop: 12 }} />
          <View style={[styles.chipRow, { marginTop: 18 }]}>
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} width={180} height={36} radius={18} />
            ))}
          </View>
        </View>
        <View style={styles.ctaBlock}>
          <Skeleton width={170} height={42} radius={4} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: AmexColors.surface,
    borderRadius: 8,
    paddingHorizontal: 28,
    paddingVertical: 22,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
    borderWidth: 1,
    borderColor: AmexColors.divider,
    ...(WEB_TRANSITIONS_CARD as object),
  },
  cardHover: {
    borderColor: AmexColors.blue,
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  cardPressed: { opacity: 0.95 },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  eyebrowPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: AmexColors.blueLight,
    borderRadius: 999,
  },
  eyebrowDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: AmexColors.blue,
  },
  eyebrow: {
    color: AmexColors.blue,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  eyebrowMeta: {
    color: AmexColors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  donutBlock: {
    width: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  middle: {
    flex: 1,
    minWidth: 0,
    gap: 6,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: AmexColors.textPrimary,
  },
  totalLine: {
    fontSize: 14,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: AmexColors.textPrimary,
  },
  totalDivider: { color: AmexColors.textTertiary },
  mrText: {
    color: AmexColors.blue,
    fontWeight: '700',
    fontSize: 14,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: AmexColors.surfaceMuted,
    borderWidth: 1,
    borderColor: 'transparent',
    ...(WEB_TRANSITIONS_CHIP as object),
  },
  chipHover: {
    borderColor: AmexColors.blue,
    backgroundColor: AmexColors.blueLight,
  },
  chipPressed: { opacity: 0.85 },
  chipDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  chipLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: AmexColors.textPrimary,
  },
  chipSpend: {
    fontSize: 13,
    fontWeight: '700',
    color: AmexColors.textPrimary,
    marginLeft: 2,
  },
  chipMr: {
    fontSize: 12,
    color: AmexColors.textSecondary,
    fontWeight: '600',
  },
  moreChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: AmexColors.divider,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreChipText: {
    fontSize: 12,
    color: AmexColors.textSecondary,
    fontWeight: '600',
  },
  ctaBlock: {
    width: 220,
    alignItems: 'flex-end',
    gap: 8,
  },
  cta: {
    backgroundColor: AmexColors.blue,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 4,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  ctaPressed: { opacity: 0.85 },
  ctaText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  ctaSubtle: {
    fontSize: 11,
    color: AmexColors.textTertiary,
    textAlign: 'right',
  },
});
