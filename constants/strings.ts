/**
 * Centralised user-facing copy.
 * EN + FR (Quebec) per PRD FR-16. Currently EN is the active locale; FR keys
 * are kept in sync so V1 launch can flip via a future locale provider.
 */
export const Copy = {
  app: {
    name: 'Amex Spend Insights',
  },
  home: {
    greeting: 'Good evening, Joy',
    accountLabel: 'American Express Cobalt®',
    balanceLabel: 'Current balance',
    paymentDue: 'Min. payment of $25.00 due Apr 12',
    payButton: 'Pay balance',
    statementsButton: 'View statements',
    offersTitle: 'Amex Offers for you',
    offersSubtitle: '6 offers · earn up to 4,200 MR',
  },
  insightsCard: {
    title: (month: string) => `${month} Spending`,
    subtitle: (total: string, topCat: string, topAmount: string) =>
      `${total} total · Top: ${topCat} ${topAmount}`,
    empty: 'Tap to see your spending breakdown',
    desktopEyebrow: 'Spend Insights',
    desktopTitle: (month: string) => `${month} Spending`,
    desktopTotalLine: (total: string, mr: string) =>
      `${total} total · ${mr} MR earned this month`,
    desktopCta: 'View full insights',
    moreCategories: (n: number) =>
      n === 1 ? '+1 more' : `+${n} more`,
  },

  homeDesktop: {
    topNav: {
      menu: 'Menu',
      brand: 'AMERICAN EXPRESS',
      search: 'Search',
      customerService: 'Customer Service',
      logout: 'Logout',
    },
    subNav: {
      home: 'Home',
      statement: 'Statement',
      payments: 'Payments',
      manageAccounts: 'Manage Accounts',
      information: 'Information',
    },
    balanceHero: {
      lastStatementBalance: 'Last Statement Balance',
      lastStatementPeriod: (start: string, end: string) => `${start} – ${end}`,
      amountDueOn: 'Amount is due on',
      minimumAmountDue: 'Minimum Amount Due',
      currentBalance: 'Current Balance',
      availableCredit: (amount: string) => `Available Credit  ${amount}`,
      makePayment: 'Make Payment',
      showDetails: 'Show Details',
      viewTransactions: 'View Transactions',
      info: 'i',
    },
    recentActivity: {
      title: 'Recent Activity',
      latest: 'Latest Transactions',
      pending: 'Pending Transactions',
      planItBanner: 'Pay down your balance with Plan It™.',
      planItCta: 'Create a Plan',
      noPending: 'No pending transactions right now.',
      transactionCount: (n: number) =>
        n === 1 ? '1 transaction this month' : `${n} transactions this month`,
    },
    membershipRewards: {
      title: 'Membership Rewards®',
      payWithPoints: 'Pay Balance with Points',
      viewAndRedeem: 'View and Redeem Points',
      seeWhatEarnedPoints: 'See what earned these points',
    },
    chat: 'Chat',
    feedback: 'Give Feedback',
    greeting: 'Welcome back to American Express',
  },
  insights: {
    headerTitle: 'Spend Insights',
    totalLabel: (month: string) => `Total spent in ${month}`,
    mrBadge: (pts: string) => `${pts} pts earned this month`,
    mrTooltip: (pts: string, dollar: string, aero: string) =>
      `${pts} MR pts ≈ ${dollar} in statement credits or ~${aero} toward Aeroplan`,
    cobaltCap: (used: string) => `${used} of $2,500 5x limit`,
    cobaltCapWarning: 'Approaching 5x cap — over $2,500 earns 1x',
    trendTitle: 'Last 6 months',
    currentMonth: 'Current month',
    historyLimit: (date: string) => `Data not available before ${date}`,
    error: 'Unable to load spending data. Pull to refresh.',
    retry: 'Retry',
    pendingNote: 'Pending transactions excluded from totals',
  },
  category: {
    earned: (pts: string) => `${pts} MR earned`,
    transactionCount: (n: number) =>
      n === 1 ? '1 transaction' : `${n} transactions`,
    topMerchants: 'Top merchants',
    viewAllTransactions: 'View all transactions',
    earnRateCallout: (mult: number) => `Earning ${mult}x Membership Rewards`,
  },
  transactions: {
    headerTitle: (category: string) => `${category} transactions`,
    subtitle: (month: string) => `${month} · posted transactions`,
    summary: (count: number, total: string, mr: string) =>
      `${count === 1 ? '1 transaction' : `${count} transactions`} · ${total} · ${mr} MR`,
    pointsEarned: (pts: string) => `+${pts} MR`,
    earnRate: (mult: number) => `${mult}x`,
    empty: 'No posted transactions for this category yet.',
  },
  onboarding: {
    skip: 'Skip',
    next: 'Next',
    getStarted: 'Get started',
    slides: [
      {
        title: 'See where your money goes',
        body: 'Your spending, organized by category — automatically.',
      },
      {
        title: 'Know what your spending earns',
        body: 'See exactly how many Membership Rewards each category earned you.',
      },
      {
        title: 'Your 5x cap, in plain sight',
        body: 'Never miss a point. Track your $2,500 monthly 5x dining limit in real time.',
      },
    ] as const,
  },
} as const;
