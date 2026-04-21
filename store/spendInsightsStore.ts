import { create } from 'zustand';
import { storage } from './storage';
import { CURRENT_BILLING_MONTH } from '@/mocks/spendInsightsMock';

const ONBOARDING_KEY = 'spi.onboardingComplete.v1';

interface SpendInsightsState {
  selectedBillingMonth: string;
  onboardingComplete: boolean;
  setSelectedBillingMonth: (month: string) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
}

export const useSpendInsightsStore = create<SpendInsightsState>((set) => ({
  selectedBillingMonth: CURRENT_BILLING_MONTH,
  onboardingComplete: storage.getString(ONBOARDING_KEY) === '1',
  setSelectedBillingMonth: (month) => set({ selectedBillingMonth: month }),
  completeOnboarding: () => {
    storage.set(ONBOARDING_KEY, '1');
    set({ onboardingComplete: true });
  },
  resetOnboarding: () => {
    storage.delete(ONBOARDING_KEY);
    set({ onboardingComplete: false });
  },
}));
