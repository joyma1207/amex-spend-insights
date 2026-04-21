import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AmexColors } from '@/constants/amexColors';
import { Copy } from '@/constants/strings';

interface Props {
  /** Active tab key — currently always 'home' for V1. */
  active?: 'home' | 'statement' | 'payments' | 'manageAccounts' | 'information';
}

const TAB_ORDER: Array<{ id: NonNullable<Props['active']>; labelKey: string }> = [
  { id: 'home', labelKey: 'home' },
  { id: 'statement', labelKey: 'statement' },
  { id: 'payments', labelKey: 'payments' },
  { id: 'manageAccounts', labelKey: 'manageAccounts' },
  { id: 'information', labelKey: 'information' },
];

/**
 * Secondary nav under the brand bar.
 * Statement / Payments / Manage Accounts / Information are visual-only
 * placeholders for V1 (PRD non-goal).
 */
export function AmexSubNav({ active = 'home' }: Props) {
  const labels = Copy.homeDesktop.subNav;

  return (
    <View style={styles.bar}>
      <View style={styles.inner}>
        {TAB_ORDER.map((tab) => {
          const isActive = tab.id === active;
          const label = labels[tab.id as keyof typeof labels];
          return (
            <Pressable
              key={tab.id}
              accessibilityRole="link"
              accessibilityState={{ selected: isActive }}
              style={styles.tab}
            >
              <Text
                style={[
                  styles.tabLabel,
                  isActive && styles.tabLabelActive,
                ]}
              >
                {label}
              </Text>
              <View
                style={[
                  styles.underline,
                  isActive && styles.underlineActive,
                ]}
              />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: AmexColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: AmexColors.divider,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 28,
    maxWidth: 1280,
    width: '100%',
    alignSelf: 'center',
  },
  tab: {
    paddingTop: 14,
    alignItems: 'center',
  },
  tabLabel: {
    color: AmexColors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    paddingBottom: 12,
  },
  tabLabelActive: {
    color: AmexColors.textPrimary,
  },
  underline: {
    height: 3,
    width: '100%',
    backgroundColor: 'transparent',
  },
  underlineActive: {
    backgroundColor: AmexColors.blue,
  },
});
