# stonks

Live prediction markets dashboard with Monte Carlo simulations.

## Features

- **Polymarket Integration** - Real-time prediction markets
- **Monte Carlo Engine** - 5,000 path simulations
- **Multi-Asset** - Crypto, metals, indices, energy, stocks
- **90%+ Easy Money Filter** - High-probability market finder
- **Live Stock Prices** - AAPL, GOOGL, NVDA, TSLA, COST, JPM, PLTR, HOOD via Yahoo Finance
- **1-Year Historical Charts** - Price history for all assets

## Dev

```bash
npm install
npm run dev
```

## Deploy

```bash
vercel --prod
```

## Development

| Priority | Feature | Status |
|----------|---------|--------|
| 1 | Live stock prices (Yahoo Finance API) | Done |
| 2 | Historical price charts (1Y+) | Done |
| 3 | Bundle size optimization | Pending |
| 4 | Watchlists/localStorage | Pending |
| 5 | Price alerts/notifications | Pending |
| 6 | Trading integration | Backlog |

## iOS App (Vibe Code)

Prompt for converting to native iOS with Vibe Code:

```
Build a native iOS app called "stonks" - a prediction markets dashboard.

Features:
1. Fetch Polymarket API (gamma-api.polymarket.com/markets) - show prediction markets sorted by probability
2. Yahoo Finance API for live stock prices (AAPL, GOOGL, NVDA, TSLA, COST, JPM, PLTR, HOOD)
3. Monte Carlo simulation engine (5000 paths, geometric Brownian motion)
4. Historical price charts (1 year) using Swift Charts
5. Dark mode Bloomberg terminal aesthetic
6. Scrolling ticker tape at top with live prices
7. 90%+ filter for high-probability bets
8. Tap market to open Polymarket in Safari

UI:
- Dark background (#0a0a0c)
- Green for gains (#30d158), red for losses (#ff453a)
- SF Pro font, glass morphism cards
- Pull to refresh
- Blinking status indicators (LIVE, API, MC)

Use SwiftUI, async/await for API calls, and Charts framework for visualizations.
```

**Educational only. Not financial advice.**
