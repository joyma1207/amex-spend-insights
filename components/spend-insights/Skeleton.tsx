import React, { useEffect } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { AmexColors } from '@/constants/amexColors';

interface Props {
  width?: ViewStyle['width'];
  height?: ViewStyle['height'];
  radius?: number;
  style?: ViewStyle;
}

/**
 * Looping shimmer used in place of a spinner per PRD FR-13.
 */
export function Skeleton({ width = '100%', height = 16, radius = 6, style }: Props) {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.9, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [opacity]);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        styles.base,
        { width, height, borderRadius: radius },
        animStyle,
        style,
      ]}
    />
  );
}

export function SpendInsightsSkeleton() {
  return (
    <View style={styles.wrap}>
      <Skeleton width={140} height={14} />
      <Skeleton width={180} height={32} style={{ marginTop: 12 }} />
      <Skeleton width={160} height={20} radius={12} style={{ marginTop: 12 }} />
      <Skeleton width={196} height={196} radius={98} style={{ marginTop: 28, alignSelf: 'center' }} />
      <View style={{ marginTop: 28, gap: 10 }}>
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} width="100%" height={64} radius={8} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: AmexColors.surfaceMuted,
  },
  wrap: { padding: 16 },
});
