import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AmexColors } from '@/constants/amexColors';
import { Copy } from '@/constants/strings';
import type { SpendInsightsResponse } from '@/types/spendInsights';
import type { AccountSnapshot } from '@/types/account';
import { AmexTopNav } from './AmexTopNav';
import { AmexSubNav } from './AmexSubNav';
import { BalanceHeroDesktop } from './BalanceHeroDesktop';
import { RecentActivityCard } from './RecentActivityCard';
import { MembershipRewardsCard } from './MembershipRewardsCard';
import { SpendInsightsDesktopRow } from '@/components/spend-insights/SpendInsightsDesktopRow';

interface Props {
  account: AccountSnapshot | undefined;
  accountLoading: boolean;
  insights: SpendInsightsResponse | undefined;
  insightsLoading: boolean;
  onOpenInsights: () => void;
}

/**
 * Desktop composition of the Amex Canada home.
 *
 *   AmexTopNav
 *   AmexSubNav
 *   BalanceHeroDesktop                 ← 3-column balance hero
 *   SpendInsightsDesktopRow            ← NEW full-width row
 *   ┌─────────────────────────┬──────────────────────┐
 *   │ RecentActivityCard      │ MembershipRewardsCard│
 *   └─────────────────────────┴──────────────────────┘
 */
export function DesktopHome({
  account,
  accountLoading,
  insights,
  insightsLoading,
  onOpenInsights,
}: Props) {
  return (
    <View style={styles.root}>
      <AmexTopNav account={account} />
      <AmexSubNav active="home" />

      <ScrollView
        style={styles.scrollOuter}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.maxWidth}>
          <BalanceHeroDesktop account={account} loading={accountLoading} />

          <View style={styles.gap} />

          <SpendInsightsDesktopRow
            insights={insights}
            loading={insightsLoading}
            onOpenInsights={onOpenInsights}
          />

          <View style={styles.gap} />

          <View style={styles.row}>
            <View style={styles.recentCol}>
              <RecentActivityCard insights={insights} />
            </View>
            <View style={styles.mrCol}>
              <MembershipRewardsCard
                account={account}
                onSeeWhatEarned={onOpenInsights}
              />
            </View>
          </View>

          <View style={styles.footerSpacer} />
        </View>
      </ScrollView>

      <Pressable style={styles.chatBubble} accessibilityRole="button">
        <Text style={styles.chatBubbleText}>💬  {Copy.homeDesktop.chat}</Text>
      </Pressable>

      <View style={styles.feedbackBadge} pointerEvents="none">
        <Text style={styles.feedbackText}>{Copy.homeDesktop.feedback}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: AmexColors.background,
  },
  scrollOuter: { flex: 1 },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 48,
    alignItems: 'center',
  },
  maxWidth: {
    width: '100%',
    maxWidth: 1232,
  },
  gap: { height: 24 },
  row: {
    flexDirection: 'row',
    gap: 24,
    alignItems: 'flex-start',
  },
  recentCol: {
    flex: 2,
    minWidth: 0,
  },
  mrCol: {
    flex: 1,
    minWidth: 0,
  },
  footerSpacer: { height: 48 },
  chatBubble: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    backgroundColor: AmexColors.textPrimary,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatBubbleText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  feedbackBadge: {
    position: 'absolute',
    right: 0,
    top: '40%',
    backgroundColor: '#1D7A3A',
    paddingHorizontal: 6,
    paddingVertical: 24,
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
    transform: [{ rotate: '0deg' }],
  },
  feedbackText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 11,
    writingDirection: 'ltr',
    transform: [{ rotate: '180deg' }],
    // Vertical text — we approximate with line breaks since RN web doesn't
    // honour CSS writing-mode in all browsers reliably.
    letterSpacing: 1,
  },
});
