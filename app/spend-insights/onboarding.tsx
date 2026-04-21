import React, { useEffect, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { AmexColors } from '@/constants/amexColors';
import { Copy } from '@/constants/strings';
import { CATEGORY_META } from '@/constants/categories';
import { EarnRateBadge } from '@/components/spend-insights/EarnRateBadge';
import { useSpendInsightsStore } from '@/store/spendInsightsStore';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function OnboardingScreen() {
  const { width } = useWindowDimensions();
  const [step, setStep] = useState(0);
  const completeOnboarding = useSpendInsightsStore((s) => s.completeOnboarding);

  const finish = () => {
    completeOnboarding();
    router.replace('/spend-insights');
  };

  const next = () => {
    if (step === 2) finish();
    else setStep(step + 1);
  };

  const slide = Copy.onboarding.slides[step]!;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <View style={styles.dotsRow}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={[styles.dot, step === i && styles.dotActive]} />
          ))}
        </View>
        <Pressable
          onPress={finish}
          accessibilityRole="button"
          style={styles.skipButton}
        >
          <Text style={styles.skipText}>{Copy.onboarding.skip}</Text>
        </Pressable>
      </View>

      <View style={styles.bodyWrap}>
        <View style={[styles.illustration, { width: Math.min(width - 64, 320) }]}>
          {step === 0 && <DonutDrawIllustration key="d" />}
          {step === 1 && <CategoryRowIllustration key="r" />}
          {step === 2 && <CapBarIllustration key="c" />}
        </View>

        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.body}>{slide.body}</Text>
      </View>

      <View style={styles.footer}>
        <Pressable
          onPress={next}
          style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
        >
          <Text style={styles.ctaText}>
            {step === 2 ? Copy.onboarding.getStarted : Copy.onboarding.next}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

/** Slide 1 — donut chart drawing itself in 1s. */
function DonutDrawIllustration() {
  const size = 220;
  const radius = size / 2;
  const r = radius - 16;
  const circumference = 2 * Math.PI * r;
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(1, {
      duration: 1100,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress]);

  const slices = [
    { share: 0.36, color: AmexColors.category.dining },
    { share: 0.20, color: AmexColors.category.groceries },
    { share: 0.14, color: AmexColors.category.transit },
    { share: 0.08, color: AmexColors.category.streaming },
    { share: 0.22, color: AmexColors.category.shopping },
  ];

  let cursor = 0;
  const offsets = slices.map((s) => {
    const o = cursor * circumference;
    const len = s.share * circumference;
    cursor += s.share;
    return { offset: o, len, color: s.color };
  });

  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Svg width={size} height={size}>
        {offsets.map((o, i) => (
          <AnimatedSlice
            key={i}
            cx={radius}
            cy={radius}
            r={r}
            color={o.color}
            offset={o.offset}
            length={o.len}
            circumference={circumference}
            progress={progress}
          />
        ))}
      </Svg>
      <View style={styles.donutCentre} pointerEvents="none">
        <Text style={styles.donutCentreAmt}>$2,140</Text>
        <Text style={styles.donutCentreLabel}>March</Text>
      </View>
    </View>
  );
}

function AnimatedSlice({
  cx,
  cy,
  r,
  color,
  offset,
  length,
  circumference,
  progress,
}: {
  cx: number;
  cy: number;
  r: number;
  color: string;
  offset: number;
  length: number;
  circumference: number;
  progress: Animated.SharedValue<number>;
}) {
  const animatedProps = useAnimatedProps(() => {
    const drawn = Math.min(progress.value * circumference, offset + length);
    const visible = Math.max(0, drawn - offset);
    return {
      strokeDasharray: `${visible} ${circumference}`,
      strokeDashoffset: -offset,
    };
  });

  return (
    <AnimatedCircle
      cx={cx}
      cy={cy}
      r={r}
      stroke={color}
      strokeWidth={26}
      fill="none"
      strokeLinecap="butt"
      transform={`rotate(-90 ${cx} ${cy})`}
      animatedProps={animatedProps}
    />
  );
}

/** Slide 2 — category row sliding in with MR badge. */
function CategoryRowIllustration() {
  const x = useSharedValue(40);
  const opacity = useSharedValue(0);

  useEffect(() => {
    x.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) });
    opacity.value = withTiming(1, { duration: 500 });
  }, [x, opacity]);

  const rowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }],
    opacity: opacity.value,
  }));

  const meta = CATEGORY_META.dining;

  return (
    <Animated.View style={[styles.illusRow, rowStyle]}>
      <View
        style={[
          styles.illusIcon,
          { backgroundColor: meta.color + '22' },
        ]}
      >
        <Text style={{ fontSize: 20, color: meta.color }}>{meta.glyph}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <View style={styles.illusLabelRow}>
          <Text style={styles.illusLabel}>{meta.label}</Text>
          <EarnRateBadge multiplier={5} />
        </View>
        <Text style={styles.illusEarn}>4,100 MR earned</Text>
      </View>
      <Text style={styles.illusAmount}>$820</Text>
    </Animated.View>
  );
}

/** Slide 3 — Cobalt cap bar filling. */
function CapBarIllustration() {
  const ratio = useSharedValue(0);
  useEffect(() => {
    ratio.value = withTiming(0.78, {
      duration: 1100,
      easing: Easing.out(Easing.cubic),
    });
  }, [ratio]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${ratio.value * 100}%`,
  }));

  return (
    <View style={styles.capWrap}>
      <View style={styles.capLabelRow}>
        <Text style={styles.capLabelLeft}>5x dining cap</Text>
        <Text style={styles.capLabelRight}>$1,950 of $2,500</Text>
      </View>
      <View style={styles.capTrack}>
        <Animated.View style={[styles.capFill, fillStyle]} />
      </View>
      <View style={styles.capRangeRow}>
        <Text style={styles.capRangeText}>$0</Text>
        <Text style={styles.capRangeText}>$2,500</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: AmexColors.surface,
    paddingHorizontal: 24,
  },
  topBar: {
    paddingTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dotsRow: { flexDirection: 'row', gap: 6 },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: AmexColors.divider,
  },
  dotActive: { backgroundColor: AmexColors.blue, width: 18 },
  skipButton: {
    height: 32,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipText: { color: AmexColors.textSecondary, fontSize: 14, fontWeight: '600' },
  bodyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 24 },
  illustration: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 240,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: AmexColors.textPrimary,
    textAlign: 'center',
  },
  body: {
    fontSize: 15,
    color: AmexColors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 320,
  },
  footer: { paddingBottom: 16 },
  cta: {
    height: 52,
    borderRadius: 12,
    backgroundColor: AmexColors.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaPressed: { opacity: 0.85 },
  ctaText: {
    color: AmexColors.textInverse,
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.3,
  },
  donutCentre: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  donutCentreAmt: { fontSize: 18, fontWeight: '800', color: AmexColors.textPrimary },
  donutCentreLabel: { fontSize: 12, color: AmexColors.textSecondary, marginTop: 2 },

  illusRow: {
    width: '100%',
    backgroundColor: AmexColors.surface,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    borderWidth: 1,
    borderColor: AmexColors.divider,
  },
  illusIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illusLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  illusLabel: { fontWeight: '700', fontSize: 15, color: AmexColors.textPrimary },
  illusEarn: {
    marginTop: 2,
    color: AmexColors.blue,
    fontWeight: '600',
    fontSize: 12,
  },
  illusAmount: { fontWeight: '700', fontSize: 15, color: AmexColors.textPrimary },

  capWrap: { width: '100%', gap: 12 },
  capLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  capLabelLeft: { fontSize: 13, color: AmexColors.textSecondary },
  capLabelRight: { fontSize: 14, fontWeight: '700', color: AmexColors.blue },
  capTrack: {
    height: 12,
    borderRadius: 6,
    backgroundColor: AmexColors.divider,
    overflow: 'hidden',
  },
  capFill: { height: '100%', borderRadius: 6, backgroundColor: AmexColors.blue },
  capRangeRow: { flexDirection: 'row', justifyContent: 'space-between' },
  capRangeText: { fontSize: 11, color: AmexColors.textTertiary },
});
