import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { AmexColors } from '@/constants/amexColors';
import { Copy } from '@/constants/strings';
import type { AccountSnapshot } from '@/types/account';
import {
  formatCurrency,
  formatDueDate,
  formatStatementDatesDayFirst,
} from '@/utils/format';

interface Props {
  account: AccountSnapshot | undefined;
  loading?: boolean;
}

/**
 * Desktop balance hero — three-column white card matching the Amex Canada
 * reference. Each column owns its own CTA at the bottom:
 *  · Last Statement Balance → View Transactions (outline)
 *  · Amount Due             → Make Payment      (primary, filled blue)
 *  · Current Balance        → Show Details      (outline)
 */
export function BalanceHeroDesktop({ account, loading }: Props) {
  const t = Copy.homeDesktop.balanceHero;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Image
          source={require('@/assets/cobalt-card.png')}
          style={styles.cardChip}
          resizeMode="contain"
          accessibilityLabel="American Express Cobalt Card"
        />
        <View style={styles.headerText}>
          <Text style={styles.productName}>
            {account?.cardProductLabel ?? 'American Express Cobalt® Card'}
          </Text>
          <Text style={styles.last4}>••••{account?.last4 ?? '00000'}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.row}>
        {/* ── Column 1: Last Statement Balance ── */}
        <View style={styles.col}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>{t.lastStatementBalance}</Text>
            <InfoDot />
          </View>
          <Text style={styles.amount}>
            {loading || !account ? '—' : formatCurrency(account.lastStatementBalance, true)}
          </Text>
          <Text style={styles.subLabel}>
            {account
              ? formatStatementDatesDayFirst(
                  account.lastStatementPeriod.start,
                  account.lastStatementPeriod.end,
                )
              : ''}
          </Text>
          <View style={styles.ctaSpacer} />
          <Pressable style={styles.outlineCta} accessibilityRole="link">
            <Text style={styles.outlineCtaText}>{t.viewTransactions}  ›</Text>
          </Pressable>
        </View>

        <ColumnDivider />

        {/* ── Column 2: Amount Due ── */}
        <View style={[styles.col, styles.colCentre]}>
          <Text style={styles.labelMuted}>{t.amountDueOn}</Text>
          <Text style={styles.amountDue}>
            {loading || !account ? '—' : formatDueDate(account.amountDueDate)}
          </Text>
          <View style={styles.dueMetaRow}>
            <View style={styles.labelRow}>
              <Text style={styles.subLabel}>{t.minimumAmountDue}</Text>
              <InfoDot />
            </View>
            <Text style={styles.subLabelStrong}>
              {account ? formatCurrency(account.minAmountDue, true) : ''}
            </Text>
          </View>
          <View style={styles.ctaSpacer} />
          <Pressable style={styles.primaryCta} accessibilityRole="button">
            <Text style={styles.primaryCtaText}>{t.makePayment}  ›</Text>
          </Pressable>
        </View>

        <ColumnDivider />

        {/* ── Column 3: Current Balance ── */}
        <View style={styles.col}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>{t.currentBalance}</Text>
            <InfoDot />
          </View>
          <Text style={styles.amount}>
            {loading || !account ? '—' : formatCurrency(account.currentBalance, true)}
          </Text>
          <Text style={styles.subLabel}>
            {account ? t.availableCredit(formatCurrency(account.availableCredit, true)) : ''}
          </Text>
          <View style={styles.ctaSpacer} />
          <Pressable style={styles.outlineCta} accessibilityRole="link">
            <Text style={styles.outlineCtaText}>{t.showDetails}  ›</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function ColumnDivider() {
  return <View style={styles.colDivider} />;
}

function InfoDot() {
  return (
    <View style={styles.infoDot}>
      <Text style={styles.infoDotText}>i</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: AmexColors.surface,
    borderRadius: 8,
    paddingHorizontal: 28,
    paddingVertical: 22,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  cardChip: {
    width: 56,
    height: 36,
    borderRadius: 4,
    backgroundColor: AmexColors.textPrimary,
  },
  headerText: { flex: 1 },
  productName: {
    fontSize: 15,
    fontWeight: '700',
    color: AmexColors.textPrimary,
  },
  last4: {
    marginTop: 2,
    fontSize: 12,
    color: AmexColors.textSecondary,
    letterSpacing: 1,
  },
  divider: {
    height: 1,
    backgroundColor: AmexColors.divider,
    marginTop: 16,
    marginBottom: 18,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  col: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 16,
    gap: 6,
    alignItems: 'flex-start',
  },
  colCentre: {
    alignItems: 'flex-start',
  },
  colDivider: {
    width: 1,
    backgroundColor: AmexColors.divider,
  },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  label: {
    fontSize: 13,
    color: AmexColors.textPrimary,
    fontWeight: '500',
  },
  labelMuted: {
    fontSize: 13,
    color: AmexColors.textSecondary,
    fontWeight: '500',
  },
  amount: {
    fontSize: 26,
    fontWeight: '700',
    color: AmexColors.textPrimary,
    letterSpacing: -0.5,
  },
  amountDue: {
    fontSize: 26,
    fontWeight: '700',
    color: AmexColors.textPrimary,
  },
  subLabel: {
    fontSize: 12,
    color: AmexColors.textSecondary,
  },
  subLabelStrong: {
    fontSize: 13,
    color: AmexColors.textPrimary,
    fontWeight: '600',
  },
  dueMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  ctaSpacer: { flex: 1, minHeight: 12 },
  primaryCta: {
    marginTop: 12,
    backgroundColor: AmexColors.blue,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 4,
    minWidth: 220,
    alignItems: 'center',
  },
  primaryCtaText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  outlineCta: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 4,
    minWidth: 200,
    borderWidth: 1,
    borderColor: AmexColors.blue,
    alignItems: 'center',
  },
  outlineCtaText: {
    color: AmexColors.blue,
    fontWeight: '700',
    fontSize: 14,
  },
  infoDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: AmexColors.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoDotText: {
    fontSize: 9,
    color: AmexColors.blue,
    fontWeight: '700',
    fontStyle: 'italic',
  },
});
