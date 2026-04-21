import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G, Path } from 'react-native-svg';
import { AmexColors } from '@/constants/amexColors';
import { CATEGORY_META } from '@/constants/categories';
import { Copy } from '@/constants/strings';
import type { CategoryInsight, CategoryId } from '@/types/spendInsights';
import { formatCurrency, formatMonthLong } from '@/utils/format';

interface Props {
  loading?: boolean;
  billingMonth?: string;
  totalSpend?: number;
  topCategory?: CategoryInsight;
  /** Top 4 categories by spend — feeds the 24x24 mini donut */
  topFour?: CategoryInsight[];
  onPress: () => void;
}

/**
 * 80dp home-screen teaser (PRD §8.1). Lives between the account balance and
 * Amex Offers. The mini donut is a 24x24 representation of the top 4 categories.
 */
export function SpendInsightsHomeCard({
  loading,
  billingMonth,
  totalSpend,
  topCategory,
  topFour,
  onPress,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Open Spend Insights"
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.iconWrap}>
        {topFour && topFour.length > 0 ? (
          <MiniDonut categories={topFour} />
        ) : (
          <View style={styles.iconPlaceholder} />
        )}
      </View>

      <View style={styles.body}>
        {loading || !billingMonth || totalSpend == null ? (
          <>
            <Text style={styles.title}>Spend Insights</Text>
            <Text style={styles.subtitle}>{Copy.insightsCard.empty}</Text>
          </>
        ) : (
          <>
            <Text style={styles.title}>
              {Copy.insightsCard.title(formatMonthLong(billingMonth))}
            </Text>
            <Text style={styles.subtitle} numberOfLines={1}>
              {topCategory
                ? Copy.insightsCard.subtitle(
                    formatCurrency(totalSpend),
                    CATEGORY_META[topCategory.categoryId].label,
                    formatCurrency(topCategory.totalSpend),
                  )
                : `${formatCurrency(totalSpend)} total`}
            </Text>
          </>
        )}
      </View>

      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

function MiniDonut({ categories }: { categories: CategoryInsight[] }) {
  const size = 24;
  const radius = size / 2;
  const thickness = 5;
  const total = categories.reduce((acc, c) => acc + c.totalSpend, 0) || 1;
  let cursor = -Math.PI / 2;

  return (
    <Svg width={size} height={size}>
      <G>
        {categories.map((c) => {
          const angle = (c.totalSpend / total) * Math.PI * 2;
          const start = cursor;
          const end = cursor + angle;
          cursor = end;
          const r = radius - thickness / 2;
          const sx = radius + r * Math.cos(start);
          const sy = radius + r * Math.sin(start);
          const ex = radius + r * Math.cos(end);
          const ey = radius + r * Math.sin(end);
          const large = end - start > Math.PI ? 1 : 0;
          return (
            <Path
              key={c.categoryId as CategoryId}
              d={`M ${sx} ${sy} A ${r} ${r} 0 ${large} 1 ${ex} ${ey}`}
              stroke={CATEGORY_META[c.categoryId].color}
              strokeWidth={thickness}
              fill="none"
              strokeLinecap="butt"
            />
          );
        })}
        <Circle cx={radius} cy={radius} r={radius - thickness} fill={AmexColors.surface} />
      </G>
    </Svg>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 80,
    backgroundColor: AmexColors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  pressed: { opacity: 0.85 },
  iconWrap: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: AmexColors.surfaceMuted,
  },
  body: { flex: 1, minWidth: 0 },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: AmexColors.textPrimary,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 12,
    color: AmexColors.textSecondary,
  },
  chevron: {
    fontSize: 22,
    color: AmexColors.blue,
    fontWeight: '300',
    marginLeft: 4,
  },
});
