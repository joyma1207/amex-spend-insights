import React, { useEffect, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, G, Path } from 'react-native-svg';
import { AmexColors } from '@/constants/amexColors';
import { CATEGORY_META } from '@/constants/categories';
import type { CategoryId } from '@/types/spendInsights';
import { formatCurrency, formatMonthShort } from '@/utils/format';

const AnimatedPath = Animated.createAnimatedComponent(Path);

export interface DonutSlice {
  categoryId: CategoryId;
  value: number;
}

interface Props {
  slices: DonutSlice[];
  totalSpend: number;
  billingMonth: string;
  /** Diameter in dp — PRD specifies 196dp on the main screen */
  size?: number;
  thickness?: number;
  highlightedCategory?: CategoryId | null;
  onSlicePress?: (categoryId: CategoryId) => void;
}

interface Segment {
  categoryId: CategoryId;
  startAngle: number;
  endAngle: number;
  color: string;
}

/**
 * Animated donut. Up to 8 slices, 300ms ease-out arc draw on load (PRD §8.2).
 * Pure SVG so it works identically on iOS, Android, and web with no native module.
 */
export function DonutChart({
  slices,
  totalSpend,
  billingMonth,
  size = 196,
  thickness = 22,
  highlightedCategory,
  onSlicePress,
}: Props) {
  const radius = size / 2;
  const innerRadius = radius - thickness;
  const circumference = 2 * Math.PI * (radius - thickness / 2);

  const total = slices.reduce((acc, s) => acc + s.value, 0);

  const segments = useMemo<Segment[]>(() => {
    if (total <= 0) return [];
    let cursor = -Math.PI / 2; // start at 12 o'clock
    return slices.map((slice) => {
      const angle = (slice.value / total) * Math.PI * 2;
      const seg: Segment = {
        categoryId: slice.categoryId,
        startAngle: cursor,
        endAngle: cursor + angle,
        color: CATEGORY_META[slice.categoryId].color,
      };
      cursor += angle;
      return seg;
    });
  }, [slices, total]);

  // Animated draw — single shared progress drives a stroke-dashoffset on
  // a tracer circle, then we render coloured arcs underneath. Combined effect:
  // colour appears to sweep around in 300ms. (PRD §8.2)
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = 0;
    progress.value = withTiming(1, {
      duration: 300,
      easing: Easing.out(Easing.cubic),
    });
  }, [billingMonth, progress]);

  const maskProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <G rotation={0} origin={`${radius}, ${radius}`}>
          {segments.map((seg) => {
            const isFaded =
              highlightedCategory != null && highlightedCategory !== seg.categoryId;
            return (
              <Path
                key={seg.categoryId}
                d={describeArc(radius, radius, radius - thickness / 2, seg.startAngle, seg.endAngle)}
                stroke={seg.color}
                strokeWidth={thickness}
                strokeLinecap="butt"
                fill="none"
                opacity={isFaded ? 0.25 : 1}
                onPress={onSlicePress ? () => onSlicePress(seg.categoryId) : undefined}
              />
            );
          })}

          {/* White cover that retracts to reveal coloured arcs in 300ms */}
          <AnimatedPath
            d={describeArc(radius, radius, radius - thickness / 2, -Math.PI / 2, Math.PI * 1.5 - 0.001)}
            stroke={AmexColors.surface}
            strokeWidth={thickness + 1}
            fill="none"
            strokeDasharray={circumference}
            animatedProps={maskProps}
          />

          {/* Inner cutout for cleaner edge */}
          <Circle
            cx={radius}
            cy={radius}
            r={innerRadius}
            fill={AmexColors.surface}
          />
        </G>
      </Svg>

      <View style={styles.centre} pointerEvents="none">
        <Text style={styles.centreTotal}>{formatCurrency(totalSpend)}</Text>
        <Text style={styles.centreMonth}>{formatMonthShort(billingMonth)}</Text>
      </View>
    </View>
  );
}

/** Describe an SVG arc segment between two angles (radians). */
function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
): string {
  const startX = cx + r * Math.cos(startAngle);
  const startY = cy + r * Math.sin(startAngle);
  const endX = cx + r * Math.cos(endAngle);
  const endY = cy + r * Math.sin(endAngle);
  const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;
  return `M ${startX} ${startY} A ${r} ${r} 0 ${largeArcFlag} 1 ${endX} ${endY}`;
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  centre: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centreTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: AmexColors.textPrimary,
  },
  centreMonth: {
    marginTop: 2,
    fontSize: 11,
    color: AmexColors.textSecondary,
  },
});
