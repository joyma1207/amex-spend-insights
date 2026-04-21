import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { AmexColors } from '@/constants/amexColors';
import { Copy } from '@/constants/strings';
import { formatCurrency } from '@/utils/format';

interface Props {
  used: number;
  limit: number;
  /** When true, render compact (used inside CategoryRow). Detail screen uses full. */
  variant?: 'inline' | 'detail';
}

/**
 * The Cobalt $2,500 5x cap progress bar (PRD §8.2).
 * Turns amber at >=90%, exposes 'over the cap' visually if used > limit.
 */
export function CobaltCapBar({ used, limit, variant = 'inline' }: Props) {
  const ratio = Math.min(1, used / limit);
  const isWarning = used / limit >= 0.9;
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(ratio, {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    });
  }, [ratio, progress]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  return (
    <View style={variant === 'detail' ? styles.detailWrap : styles.inlineWrap}>
      <View style={styles.track}>
        <Animated.View
          style={[
            styles.fill,
            fillStyle,
            { backgroundColor: isWarning ? AmexColors.warning : AmexColors.blue },
          ]}
        />
      </View>
      <View style={styles.labelRow}>
        <Text
          style={[
            styles.label,
            isWarning && { color: AmexColors.warning, fontWeight: '600' },
          ]}
        >
          {isWarning ? '⚠ ' : ''}
          {Copy.insights.cobaltCap(formatCurrency(used))}
        </Text>
        {variant === 'detail' && isWarning && (
          <Text style={styles.warningCopy}>{Copy.insights.cobaltCapWarning}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  inlineWrap: { marginTop: 6 },
  detailWrap: { marginTop: 12 },
  track: {
    height: 4,
    borderRadius: 2,
    backgroundColor: AmexColors.divider,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 2,
  },
  labelRow: { marginTop: 4 },
  label: {
    fontSize: 11,
    color: AmexColors.textSecondary,
  },
  warningCopy: {
    marginTop: 2,
    fontSize: 11,
    color: AmexColors.warning,
    fontWeight: '500',
  },
});
