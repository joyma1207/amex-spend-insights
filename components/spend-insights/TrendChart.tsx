import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AmexColors } from '@/constants/amexColors';
import { Copy } from '@/constants/strings';
import { formatCurrency, formatMonthShort } from '@/utils/format';

interface TrendDatum {
  billingMonth: string;
  totalSpend: number;
}

interface Props {
  /** Most recent first; up to 6 months. */
  data: TrendDatum[];
  selectedBillingMonth: string;
  onSelectMonth: (billingMonth: string) => void;
}

/**
 * 6-bar horizontal trend chart shown at the bottom of the insights screen.
 * Tap to navigate to that month (PRD §7.3).
 */
export function TrendChart({ data, selectedBillingMonth, onSelectMonth }: Props) {
  const max = Math.max(...data.map((d) => d.totalSpend), 1);
  const ordered = [...data].reverse(); // oldest left → newest right

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{Copy.insights.trendTitle}</Text>
      <View style={styles.row}>
        {ordered.map((d) => {
          const ratio = d.totalSpend / max;
          const isSelected = d.billingMonth === selectedBillingMonth;
          return (
            <Pressable
              key={d.billingMonth}
              onPress={() => onSelectMonth(d.billingMonth)}
              accessibilityRole="button"
              accessibilityLabel={`${formatMonthShort(d.billingMonth)} ${formatCurrency(d.totalSpend)}`}
              style={({ pressed }) => [styles.barCol, pressed && styles.pressed]}
            >
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: `${Math.max(6, ratio * 100)}%`,
                      backgroundColor: isSelected ? AmexColors.blue : AmexColors.blue,
                      opacity: isSelected ? 1 : 0.3,
                    },
                  ]}
                />
              </View>
              <Text
                style={[
                  styles.barLabel,
                  isSelected && {
                    color: AmexColors.textPrimary,
                    fontWeight: '700',
                  },
                ]}
              >
                {formatMonthShort(d.billingMonth)}
              </Text>
              <Text
                style={[
                  styles.barValue,
                  isSelected && { color: AmexColors.blue, fontWeight: '700' },
                ]}
              >
                {formatCurrency(d.totalSpend)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: AmexColors.surface,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: AmexColors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    height: 110,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  pressed: { opacity: 0.7 },
  barTrack: {
    width: '70%',
    height: 60,
    backgroundColor: AmexColors.surfaceMuted,
    borderRadius: 4,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  bar: {
    width: '100%',
    borderRadius: 4,
  },
  barLabel: {
    fontSize: 11,
    color: AmexColors.textSecondary,
  },
  barValue: {
    fontSize: 10,
    color: AmexColors.textTertiary,
  },
});
