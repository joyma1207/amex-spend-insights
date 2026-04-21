import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AmexColors } from '@/constants/amexColors';
import { Copy } from '@/constants/strings';
import {
  formatCurrency,
  formatPoints,
  mrToAeroplanDollars,
  mrToCreditDollars,
} from '@/utils/format';

interface Props {
  points: number;
  /** When true, renders the redemption tooltip below — PRD §8.2 mr badge tap */
  expanded?: boolean;
  onToggle?: () => void;
}

/**
 * The pill at the top of Spend Insights showing total MR earned this month.
 * Tapping toggles a tooltip translating points → CAD value (PRD §6).
 */
export function MRPointsBadge({ points, expanded, onToggle }: Props) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = expanded ?? internalOpen;
  const handlePress = () => {
    if (onToggle) onToggle();
    else setInternalOpen((p) => !p);
  };

  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityHint="Shows redemption value of these Membership Rewards points"
        style={({ pressed }) => [styles.pill, pressed && styles.pillPressed]}
      >
        <View style={styles.dot} />
        <Text style={styles.text}>{Copy.insights.mrBadge(formatPoints(points))}</Text>
      </Pressable>

      {isOpen && (
        <View style={styles.tooltip}>
          <Text style={styles.tooltipText}>
            {Copy.insights.mrTooltip(
              formatPoints(points),
              formatCurrency(mrToCreditDollars(points), true),
              formatCurrency(mrToAeroplanDollars(points), true),
            )}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: AmexColors.blueLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  pillPressed: { opacity: 0.7 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: AmexColors.blue,
  },
  text: {
    color: AmexColors.blue,
    fontWeight: '600',
    fontSize: 13,
  },
  tooltip: {
    marginTop: 8,
    backgroundColor: AmexColors.textPrimary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    maxWidth: 320,
  },
  tooltipText: {
    color: AmexColors.textInverse,
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
  },
});
