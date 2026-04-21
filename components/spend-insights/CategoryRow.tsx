import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AmexColors } from '@/constants/amexColors';
import { CATEGORY_META } from '@/constants/categories';
import { Copy } from '@/constants/strings';
import type { CategoryInsight, CardProduct } from '@/types/spendInsights';
import {
  formatCurrency,
  formatDelta,
  formatPoints,
} from '@/utils/format';
import { CobaltCapBar } from './CobaltCapBar';
import { EarnRateBadge } from './EarnRateBadge';

interface Props {
  insight: CategoryInsight;
  cardProduct: CardProduct;
  highlighted?: boolean;
  onPress: () => void;
}

/**
 * 72dp category row used on SpendInsightsMainScreen (PRD §8.2).
 * Renders Cobalt cap progress inline for the dining row when applicable.
 */
export function CategoryRow({ insight, cardProduct, highlighted, onPress }: Props) {
  const meta = CATEGORY_META[insight.categoryId];
  const showCobaltCap =
    cardProduct === 'cobalt' &&
    insight.cobaltCapLimit != null &&
    insight.cobaltCapUsed != null &&
    insight.categoryId === 'dining'; // PRD: dining row owns the shared cap display

  const delta = insight.monthOverMonthDelta;
  const deltaColor =
    delta.amount > 0
      ? AmexColors.negative
      : delta.amount < 0
        ? AmexColors.positive
        : AmexColors.textSecondary;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${meta.label}, spent ${formatCurrency(insight.totalSpend)}, earned ${formatPoints(insight.mrPointsEarned)} Membership Rewards points`}
      style={({ pressed }) => [
        styles.container,
        highlighted && styles.highlighted,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.left}>
        <View style={[styles.icon, { backgroundColor: meta.color + '22' }]}>
          <Text style={[styles.iconGlyph, { color: meta.color }]}>{meta.glyph}</Text>
        </View>
        <View style={styles.labelGroup}>
          <View style={styles.titleLine}>
            <Text style={styles.label}>{meta.label}</Text>
            <EarnRateBadge multiplier={insight.earnRateMultiplier} />
          </View>
          <Text style={styles.subLabel}>
            {Copy.category.earned(formatPoints(insight.mrPointsEarned))}
          </Text>
        </View>
      </View>

      <View style={styles.right}>
        <Text style={styles.amount}>{formatCurrency(insight.totalSpend)}</Text>
        <Text style={[styles.delta, { color: deltaColor }]}>
          {delta.amount === 0 ? '—' : `${formatDelta(delta.amount)}`}
        </Text>
      </View>

      {showCobaltCap && (
        <View style={styles.capRow}>
          <CobaltCapBar
            used={insight.cobaltCapUsed!}
            limit={insight.cobaltCapLimit!}
            variant="inline"
          />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 72,
    backgroundColor: AmexColors.surface,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  highlighted: {
    backgroundColor: AmexColors.blueLight,
  },
  pressed: { opacity: 0.85 },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    minWidth: 0,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconGlyph: { fontSize: 18 },
  labelGroup: { flex: 1, minWidth: 0 },
  titleLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: AmexColors.textPrimary,
  },
  subLabel: {
    marginTop: 2,
    fontSize: 12,
    color: AmexColors.textSecondary,
  },
  right: { alignItems: 'flex-end' },
  amount: {
    fontSize: 15,
    fontWeight: '700',
    color: AmexColors.textPrimary,
  },
  delta: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: '500',
  },
  capRow: { width: '100%', marginTop: 8 },
});
