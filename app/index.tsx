import React from 'react';
import { router } from 'expo-router';
import { MobileHome } from '@/components/home/MobileHome';
import { DesktopHome } from '@/components/home/DesktopHome';
import { useAccount } from '@/services/accountApi';
import { useSpendInsights } from '@/services/spendInsightsApi';
import { useSpendInsightsStore } from '@/store/spendInsightsStore';
import { useResponsive } from '@/utils/useResponsive';
import { CURRENT_BILLING_MONTH } from '@/mocks/spendInsightsMock';

/**
 * Home screen dispatcher.
 *
 * Branches by viewport width:
 *   width >= 1024 → DesktopHome (rebuilt to match the Amex Canada reference)
 *   width <  1024 → MobileHome  (the original mobile experience, unchanged)
 *
 * Data fetching for both account + insights happens once here so the two
 * variants stay in sync and we don't double-fetch.
 */
export default function HomeScreen() {
  const { isDesktop } = useResponsive();

  const { data: account, isLoading: accountLoading } = useAccount();
  const { data: insights, isLoading: insightsLoading } = useSpendInsights(
    CURRENT_BILLING_MONTH,
  );
  const onboardingComplete = useSpendInsightsStore((s) => s.onboardingComplete);
  const setSelectedBillingMonth = useSpendInsightsStore(
    (s) => s.setSelectedBillingMonth,
  );

  const onOpenInsights = () => {
    setSelectedBillingMonth(CURRENT_BILLING_MONTH);
    if (!onboardingComplete) {
      router.push('/spend-insights/onboarding');
    } else {
      router.push('/spend-insights');
    }
  };

  if (isDesktop) {
    return (
      <DesktopHome
        account={account}
        accountLoading={accountLoading}
        insights={insights}
        insightsLoading={insightsLoading}
        onOpenInsights={onOpenInsights}
      />
    );
  }

  return (
    <MobileHome
      account={account}
      insights={insights}
      insightsLoading={insightsLoading}
      onOpenInsights={onOpenInsights}
    />
  );
}
