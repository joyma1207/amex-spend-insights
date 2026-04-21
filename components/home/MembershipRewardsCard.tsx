import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { AmexColors } from '@/constants/amexColors';
import { Copy } from '@/constants/strings';
import type { AccountSnapshot } from '@/types/account';
import { formatPoints } from '@/utils/format';

interface Props {
  account: AccountSnapshot | undefined;
  onSeeWhatEarned: () => void;
}

/**
 * Desktop Membership Rewards card — right/narrow.
 * Big lifetime points balance, primary "View and Redeem Points" CTA, plus a
 * lightweight secondary "See what earned these points" link that deep-links
 * into Spend Insights (small cross-sell without promoting MR-embedded
 * placement to primary).
 */
export function MembershipRewardsCard({ account, onSeeWhatEarned }: Props) {
  const t = Copy.homeDesktop.membershipRewards;

  return (
    <View style={styles.card}>
      <View style={styles.swirl} pointerEvents="none">
        <RewardsSwirl />
      </View>

      <Text style={styles.title}>{t.title}</Text>

      <View style={styles.pointsRow}>
        <View style={styles.hex}>
          <Text style={styles.hexGlyph}>✦</Text>
        </View>
        <Text style={styles.points}>
          {account ? formatPoints(account.membershipRewardsBalance) : '—'}
        </Text>
      </View>

      <Pressable accessibilityRole="link" style={styles.linkRow}>
        <Text style={styles.link}>{t.payWithPoints}  ›</Text>
      </Pressable>

      <Pressable accessibilityRole="button" style={styles.outlineCta}>
        <Text style={styles.outlineCtaText}>{t.viewAndRedeem}  ›</Text>
      </Pressable>

      <Pressable
        accessibilityRole="link"
        onPress={onSeeWhatEarned}
        style={styles.secondaryLink}
      >
        <Text style={styles.secondaryLinkText}>{t.seeWhatEarnedPoints}  ›</Text>
      </Pressable>
    </View>
  );
}

/** Decorative MR swirl drawn in SVG so we don't need an asset. */
function RewardsSwirl() {
  return (
    <Svg width={140} height={140} viewBox="0 0 140 140">
      <Defs>
        <LinearGradient id="swirl" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={AmexColors.blue} stopOpacity={0.18} />
          <Stop offset="1" stopColor={AmexColors.blue} stopOpacity={0.04} />
        </LinearGradient>
      </Defs>
      <Path
        d="M120 30 C 90 10, 50 20, 35 55 C 25 80, 50 105, 80 100 C 100 96, 115 80, 110 55"
        stroke="url(#swirl)"
        strokeWidth={6}
        fill="none"
        strokeLinecap="round"
      />
      <Path
        d="M120 50 C 95 35, 60 45, 50 70 C 45 88, 65 105, 88 100"
        stroke="url(#swirl)"
        strokeWidth={4}
        fill="none"
        strokeLinecap="round"
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: AmexColors.surface,
    borderRadius: 8,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
    overflow: 'hidden',
    minHeight: 320,
  },
  swirl: {
    position: 'absolute',
    right: -12,
    bottom: -8,
    opacity: 0.9,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: AmexColors.textPrimary,
    marginBottom: 16,
  },
  pointsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  hex: {
    width: 22,
    height: 22,
    borderRadius: 4,
    backgroundColor: AmexColors.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '45deg' }],
  },
  hexGlyph: {
    color: '#FFFFFF',
    fontSize: 11,
    transform: [{ rotate: '-45deg' }],
  },
  points: {
    fontSize: 32,
    fontWeight: '800',
    color: AmexColors.textPrimary,
    letterSpacing: -0.5,
  },
  linkRow: { marginBottom: 16 },
  link: {
    color: AmexColors.blue,
    fontWeight: '600',
    fontSize: 14,
  },
  outlineCta: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: AmexColors.blue,
    alignSelf: 'flex-start',
    minWidth: 220,
    alignItems: 'center',
  },
  outlineCtaText: {
    color: AmexColors.blue,
    fontWeight: '700',
    fontSize: 14,
  },
  secondaryLink: {
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: AmexColors.divider,
  },
  secondaryLinkText: {
    color: AmexColors.blue,
    fontWeight: '600',
    fontSize: 13,
  },
});
