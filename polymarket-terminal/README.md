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

```
SwiftUI iOS app "stonks". Dark Bloomberg terminal UI (#0a0a0c bg, green/red for gains/losses). Polymarket API for prediction markets sorted by probability. Yahoo Finance for stocks (AAPL, GOOGL, NVDA, TSLA, COST, JPM). Monte Carlo sim (5000 paths). 1Y historical charts. Scrolling ticker. 90%+ filter. Pull to refresh.
```

**Educational only. Not financial advice.**
