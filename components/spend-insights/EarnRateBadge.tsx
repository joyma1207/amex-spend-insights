import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AmexColors } from '@/constants/amexColors';
import type { EarnRateMultiplier } from '@/types/spendInsights';

interface Props {
  multiplier: EarnRateMultiplier;
  size?: 'sm' | 'md';
}

/**
 * Inline 5x / 3x / 2x / 1x pill shown next to each category name (PRD §8.2).
 * 5x and 3x are emphasised — 2x and 1x rendered muted to keep the eye on
 * Cobalt's hero earn rates.
 */
export function EarnRateBadge({ multiplier, size = 'sm' }: Props) {
  const isHero = multiplier >= 3;
  return (
    <View
      style={[
        styles.base,
        size === 'md' ? styles.md : styles.sm,
        isHero ? styles.hero : styles.muted,
      ]}
    >
      <Text
        style={[
          styles.text,
          size === 'md' ? styles.textMd : styles.textSm,
          isHero ? styles.textHero : styles.textMuted,
        ]}
      >
        {multiplier}x
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sm: { paddingHorizontal: 6, paddingVertical: 2 },
  md: { paddingHorizontal: 8, paddingVertical: 3 },
  hero: { backgroundColor: AmexColors.blueLight },
  muted: { backgroundColor: AmexColors.surfaceMuted },
  text: { fontWeight: '700', letterSpacing: 0.2 },
  textSm: { fontSize: 11 },
  textMd: { fontSize: 13 },
  textHero: { color: AmexColors.blue },
  textMuted: { color: AmexColors.textSecondary },
});
