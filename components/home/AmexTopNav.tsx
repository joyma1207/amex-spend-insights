import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AmexColors } from '@/constants/amexColors';
import { Copy } from '@/constants/strings';
import type { AccountSnapshot } from '@/types/account';

interface Props {
  account?: AccountSnapshot | undefined;
}

/**
 * Desktop-only Amex Canada top bar.
 * Mirrors the reference: Menu pill (left) · brand wordmark (centre) ·
 * search/customer service/logout/card switcher (right).
 */
export function AmexTopNav({ account }: Props) {
  const t = Copy.homeDesktop.topNav;

  return (
    <View style={styles.bar}>
      <View style={styles.inner}>
        <Pressable style={styles.menuButton} accessibilityRole="button">
          <View style={styles.menuLines}>
            <View style={styles.menuLine} />
            <View style={styles.menuLine} />
            <View style={styles.menuLine} />
          </View>
          <Text style={styles.menuLabel}>{t.menu}</Text>
        </Pressable>

        <Text style={styles.brand} accessibilityRole="header">
          {t.brand}
        </Text>

        <View style={styles.right}>
          <Pressable style={styles.iconLink} accessibilityRole="link">
            <Text style={styles.searchGlyph}>⌕</Text>
          </Pressable>
          <Pressable accessibilityRole="link">
            <Text style={styles.link}>{t.customerService}</Text>
          </Pressable>
          <Pressable accessibilityRole="link">
            <Text style={styles.link}>{t.logout}</Text>
          </Pressable>
          <View style={styles.cardSwitcher}>
            <View style={styles.miniCard} />
            <Text style={styles.cardSwitcherLast4}>
              -{account?.last4 ?? '00000'}
            </Text>
          </View>
        </View>
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
    height: 56,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    maxWidth: 1280,
    width: '100%',
    alignSelf: 'center',
  },
  menuButton: {
    height: 36,
    paddingHorizontal: 12,
    backgroundColor: AmexColors.blue,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  menuLines: { gap: 3 },
  menuLine: {
    width: 14,
    height: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
  },
  menuLabel: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  brand: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    color: AmexColors.blue,
    fontWeight: '900',
    fontSize: 18,
    letterSpacing: 2,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  iconLink: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchGlyph: {
    fontSize: 18,
    color: AmexColors.blue,
    fontWeight: '700',
  },
  link: {
    color: AmexColors.blue,
    fontSize: 13,
    fontWeight: '600',
  },
  cardSwitcher: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: AmexColors.divider,
    borderRadius: 4,
  },
  miniCard: {
    width: 28,
    height: 18,
    borderRadius: 2,
    backgroundColor: AmexColors.textPrimary,
  },
  cardSwitcherLast4: {
    color: AmexColors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
});
