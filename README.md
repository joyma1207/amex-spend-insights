# Amex Spend Insights — V1 Prototype

Native in-app spending insights for Amex Canada cardmembers. Built per the
PRD at the root of this repo (the singular source of truth).

## What's in V1

- **Home screen** with `SpendInsightsHomeCard` teaser (PRD §8.1)
- **Spend Insights main screen** — donut, total + MR badge, category list,
  6-month nav, trend chart (PRD §8.2)
- **Category detail** — top 5 merchants, transaction count, earn-rate callout,
  Cobalt cap bar (PRD §7.2)
- **3-slide onboarding** — donut draw, category row, Cobalt cap (PRD §7.1)
- **Cobalt $2,500 5x cap progress bar** with amber warning at ≥90% (PRD FR-09)
- **Membership Rewards per category** with 1¢ statement / 2¢ Aeroplan
  redemption tooltip (PRD §6 differentiator)
- **6-month navigation** with month-over-month deltas (PRD FR-06, FR-07)
- **Skeleton shimmer loading**, pull-to-refresh, error retry (PRD FR-13, FR-14)

## Stack

| Layer | Choice | PRD §9 |
|---|---|---|
| Framework | Expo SDK 52 (React Native 0.76, New Arch) | ✓ |
| Language | TypeScript strict | ✓ |
| Routing | Expo Router (typed routes) | ✓ |
| State | Zustand | ✓ |
| Server state | TanStack React Query | ✓ |
| Persistence | MMKV (encrypted, native) + localStorage shim (web) | ✓ |
| Charts | `react-native-svg` + Reanimated 3 worklets | ◐ |
| Animations | Reanimated 3 (UI thread) | ✓ |

> **Charts deviation from PRD:** Victory Native (Skia) is replaced with
> `react-native-svg` + Reanimated. The PRD specifies Skia for "60fps donut
> animations"; the same outcome is achieved without the Skia native dependency
> chain, and the resulting chart runs identically on iOS, Android, and web.

## Run it

```bash
npm install
npm run start         # Expo dev menu
npm run ios           # iOS Simulator
npm run android       # Android emulator
npm run web           # Browser preview
```

Type checking:

```bash
npm run typecheck
```

## Mock data

`mocks/spendInsightsMock.ts` ships 6 months of realistic Cobalt Toronto
spending (Oct 2025 → Mar 2026). The current month (Mar 2026) matches the
PRD §9.3 example exactly: $820 dining (4,100 MR, 5x), $340 groceries, etc.

The API service hook (`services/spendInsightsApi.ts`) wraps the mock with a
350ms artificial delay to exercise the skeleton-shimmer state.

## Key design tokens

All in `constants/amexColors.ts`. Brand `#006FCF`, surfaces `#FFFFFF` on
`#F5F7FA`, semantic positive `#1D7A3A` / negative `#C0392B`, warning
`#F39C12` for Cobalt cap ≥90%. Category palette mirrors PRD §15.1.

## File layout

```
app/                          # Expo Router screens
  index.tsx                   # Home + SpendInsightsHomeCard
  spend-insights/
    index.tsx                 # Main insights screen
    [categoryId].tsx          # Category detail
    onboarding.tsx            # 3-slide onboarding
components/spend-insights/    # Reusable UI
constants/                    # amexColors, categories, strings (EN+FR)
services/spendInsightsApi.ts  # React Query hook
store/spendInsightsStore.ts   # Zustand + MMKV persistence
types/spendInsights.ts        # API contract types
mocks/spendInsightsMock.ts    # Cobalt Toronto, 6 months
utils/format.ts               # Currency, points, MR redemption math
```

## Out of scope (V2/V3 per PRD §3.2)

- Budgeting, custom categories, transaction reclassification
- Multi-card aggregation, push notifications, AI insights
- Open banking pull from non-Amex accounts
