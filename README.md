# Autopilot - High-Alpha Financial Terminal

> Low-latency prediction markets + trading simulator + quantitative analysis. Built for speed, optimized for efficiency.

⚠️ **KNOWN ISSUE**: Simulator may crash after 5-10 seconds on older hardware. Use the ⚡ performance mode toggle in header. Fix in progress - see TODO.md.

**Live Demo**: `npm run dev` → http://localhost:5173

---

## Overview

Autopilot is a high-performance financial terminal that combines:
- **Trading Simulator**: $100 → $10K challenge with 13 assets (indices, metals, tech stocks)
- **Prediction Markets**: Real-time Polymarket integration with 90%+ probability filters
- **Monte Carlo Analysis**: Auto-parameterized simulations with bull/base/bear scenarios
- **Live Market Data**: Yahoo Finance integration for stocks, commodities, crypto

### Architecture Goals

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Memory Footprint | <10MB | ~177KB gzip | ✅ |
| API Latency | <100ms | ~200ms | 🟡 |
| Bundle Size | <500KB | 577KB | 🟡 |
| React Warnings | 0 | 0 | ✅ |

---

## Features

### 1. Trading Simulator (Main UI)
- **Autonomous Trading**: Algorithm scans 13 assets for momentum opportunities
- **Risk Management**: 8% position sizing, 3.5% stop-loss, 7% take-profit, trailing stops
- **Diversification**: Forces rotation between assets to prevent overconcentration
- **Performance Tracking**: Win rate, P&L, trade history

**Assets**:
- Indices: Nasdaq 100, S&P 500, Dow Jones
- Metals: Gold, Silver
- Tech: AAPL, MSFT, GOOGL, NVDA, TSLA, META, COIN, PLTR

### 2. Prediction Markets (Polymarket)
- **Real-Time Data**: Live probability feeds from Polymarket
- **Category Filters**: Politics, Crypto, Sports, Finance, Culture
- **90%+ Easy Money Filter**: High-probability market finder
- **Mobile-Optimized**: Tap-to-preview tooltips with full market details

### 3. Monte Carlo Simulations
- **5,000 Path Analysis**: Bull/Base/Bear scenario projections
- **Auto-Parameterized**: Zero user input - drift (μ) and volatility (σ) derived from macro data
- **Visual Confidence Bands**: P5, P50, P95 percentiles
- **Target Probabilities**: Fibonacci-based price targets

### 4. Historical Analysis
- **1-Year Charts**: Full historical price data via Yahoo Finance
- **Volatility Metrics**: Annualized vol calculations
- **52-Week Ranges**: Support/resistance levels

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 19 + Vite | Fast dev + HMR |
| Charts | Recharts | Lightweight data viz |
| APIs | Polymarket, Yahoo Finance | Live market data |
| Math | Custom Monte Carlo | 5,000 path simulations |
| Deployment | Vercel | Edge CDN |
| Future | C++ Core → WASM | 10x performance |

---

## Installation

### Prerequisites
- Node.js 18+
- npm or yarn
- NewsAPI key (free at https://newsapi.org)

### Quick Start

```bash
# Clone
git clone https://github.com/nulljosh/stonks.git
cd stonks

# Install dependencies
npm install

# Start dev server
npm run dev
# → Opens at http://localhost:5173

# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Setup

The news widget requires a NewsAPI key:

1. **Get API Key**: Sign up at https://newsapi.org (free tier: 100 requests/day)
2. **Create `.env` file** in project root:
   ```bash
   cp .env.example .env
   ```
3. **Add your key**:
   ```
   NEWS_API_KEY=your_actual_key_here
   ```
4. **For Vercel deployment**, add env var:
   ```bash
   vercel env add NEWS_API_KEY
   ```

### Run Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:ui

# Coverage report
npm run test:coverage
```

---

## Deployment

### Vercel (Recommended)

#### Option 1: GitHub Integration (Easiest)
1. Push code to GitHub (already done)
2. Go to [vercel.com](https://vercel.com)
3. Import GitHub repo: `nulljosh/stonks`
4. Vercel auto-detects Vite config
5. Deploy → Live URL in 30 seconds

#### Option 2: CLI Deployment
```bash
# Login to Vercel
npx vercel login

# Deploy to preview
npx vercel

# Deploy to production
npx vercel --prod
```

### Manual Deployment (Any Host)

```bash
# Build production assets
npm run build

# Output: dist/
# Upload dist/ folder to your host (Netlify, Cloudflare Pages, etc.)
```

---

## Project Structure

```
stonks/
├── api/                    # Backend API integrations
│   ├── commodities.js      # Gold, silver, oil prices
│   ├── history.js          # Historical price data (Yahoo)
│   ├── markets.js          # Polymarket API client
│   ├── prices.js           # Live price aggregator
│   ├── stocks.js           # Stock quotes (Yahoo Finance)
│   └── validate-link.js    # Market link validator
├── src/
│   ├── App.jsx             # Main app (trading sim + markets + MC)
│   ├── hooks/
│   │   ├── useLivePrices.js    # Real-time price updates
│   │   ├── usePolymarket.js    # Prediction market data
│   │   └── useStocks.js        # Stock price hooks
│   ├── utils/
│   │   ├── assets.js       # Asset definitions + scenarios
│   │   ├── math.js         # Monte Carlo + Fibonacci targets
│   │   └── theme.js        # Dark/light theme config
│   └── index.css           # Global styles
├── CLAUDE.md               # Development guide + skills
├── README.md               # This file
├── package.json            # Dependencies
└── vite.config.js          # Build config
```

---

## Configuration

### Assets

Edit `src/utils/assets.js` to modify:
- **Default Assets**: BTC, ETH, Gold, Silver, etc.
- **Monte Carlo Scenarios**: Bull/Base/Bear drift & volatility
- **Price Targets**: Fibonacci levels, custom targets

### Trading Simulator

Edit `src/App.jsx` lines 11-25 to modify:
- **Asset List**: Add/remove symbols
- **Base Prices**: Initial price anchors
- **Colors**: Asset color coding

### API Configuration

No API keys required currently. All data sources are public:
- **Polymarket**: Public REST API
- **Yahoo Finance**: yfinance library (server-side)

---

## Roadmap

### Phase 1: Current (Web App)
- [x] Trading simulator with 13 assets
- [x] Polymarket integration
- [x] Monte Carlo simulations
- [x] Historical charts (1Y)
- [x] Dark mode UI
- [x] Mobile responsive
- [ ] Kalshi integration
- [ ] Additional stocks (HIMS, PG, TGT, WMT)
- [ ] S&P 500 full coverage

### Phase 2: Efficiency Optimizations
- [ ] **Delta-Threshold Algorithm**: Only update UI when price moves >0.5%
- [ ] **Binary Payloads**: Compress API responses from 100+ bytes to 14 bytes
- [ ] **Vectorized Math**: SIMD-optimized Monte Carlo
- [ ] **WebSocket Feeds**: Replace polling with push updates
- [ ] **Bundle Splitting**: Code-split to <200KB main bundle

### Phase 3: Advanced Features
- [ ] **Black-Scholes Model**: Options pricing + Greeks
- [ ] **News API Integration**: Auto-parameterize μ/σ from sentiment
- [ ] **Custom Stock Input**: Any ticker via Yahoo Finance
- [ ] **Watchlists**: localStorage persistence
- [ ] **Price Alerts**: Browser notifications

### Phase 4: Trading Integration
- [ ] **TradingView Webhooks**: Alert → Autopilot → Broker
- [ ] **cTrader API**: Forex/CFD execution
- [ ] **Interactive Brokers**: TWS API integration
- [ ] **Paper Trading Mode**: Test strategies risk-free
- [ ] **Position Limits**: Risk management guardrails

### Phase 5: Performance Rewrite
- [ ] **C++ Core**: Rewrite compute modules in C++
- [ ] **WebAssembly Bridge**: Compile to WASM for browser
- [ ] **Custom RTOS**: Bare-metal financial OS (research)
- [ ] **Sub-ms Latency**: <1ms tick-to-trade

### Phase 6: Academic
- [ ] **White Paper**: Publish algorithms & optimizations
- [ ] **Benchmark Suite**: Performance vs Bloomberg, MetaTrader
- [ ] **Open Source**: Community efficiency techniques

---

## Performance Metrics

| Operation | Current | Target | Notes |
|-----------|---------|--------|-------|
| Monte Carlo (5K paths) | ~50ms | <10ms | SIMD potential |
| Polymarket API | ~200ms | <100ms | Caching + WebSocket |
| Bundle Load | ~577KB | <200KB | Code splitting |
| Memory Usage | ~177KB gzip | <10MB runtime | "10MB Dashboard" goal |
| Initial Load | ~1.5s | <500ms | Edge CDN + preload |

---

## Known Issues & Limitations

### Current Limitations
1. **No Real Broker Integration**: Simulation only (planned)
2. **API Rate Limits**: Yahoo Finance ~2K req/hour, Polymarket ~10 req/sec
3. **Bundle Size**: 577KB (needs code splitting)
4. **Polling-Based Updates**: WebSocket feeds planned

### Error Handling
- **API Failures**: Graceful degradation - cached data shown
- **Network Issues**: Auto-retry with exponential backoff
- **Invalid Tickers**: Input validation + error messages
- **Browser Support**: Chrome/Edge/Safari/Firefox latest

---

## Development

### Code Style
- **No Emojis**: Keep code professional (emojis in UI only where appropriate)
- **Functional Components**: React hooks, no class components
- **Descriptive Names**: `filteredMarkets` not `fm`
- **Comments**: Explain *why*, not *what*

### Testing Strategy
```bash
# Unit tests: Monte Carlo math, Fibonacci targets
npm test -- math.test.js

# Integration tests: API clients, hooks
npm test -- markets.test.js

# E2E tests: TODO (Playwright)
```

### Performance Profiling
```bash
# Build with source maps
npm run build -- --sourcemap

# Analyze bundle
npx vite-bundle-visualizer
```

---

## Meme Culture

**"Nothing Ever Happens"** - The chud philosophy that markets rarely move significantly. Autopilot embraces this:
- Silent by default
- Only alerts on >3% moves
- VIX spike banner
- Contrarian mindset

---

## Contributing

### Guidelines
1. **Keep it Fast**: Every feature must justify its bundle size
2. **Test Everything**: No untested code to main
3. **Document Algorithms**: Aim for white paper quality
4. **Optimize First**: Premature optimization is encouraged here

### Suggested Improvements
- Add more simulators (Kelly Criterion, Sharpe Ratio optimizer)
- Integrate more markets (Kalshi, Manifold, Augur)
- Build iOS/Android apps (React Native or Swift/Kotlin)
- Create trading strategy backtester

---

## Real-World Trading Considerations

### Simulation vs Reality

| Aspect | Simulator | Real World | Solution |
|--------|-----------|------------|----------|
| Execution | Instant | 50-500ms | Pre-fetch with WebSocket |
| Slippage | None | 0.1-1% | Model as f(volume, spread, vol) |
| Liquidity | Unlimited | Partial fills | Order book depth analysis |
| Fees | $0 | $0-$10/trade | Include in P&L calculations |
| Rate Limits | None | 10 req/sec | Delta-Threshold caching |

### Risk Management
- **Start Small**: $100 → $1K → $10K (not $100 → $100K)
- **Position Limits**: Max 20% per asset
- **Kill Switch**: Emergency liquidation button
- **Paper Trade First**: Test with fake money for 3+ months
- **Regulatory Compliance**: Check local laws (not financial advice)

---

## License

MIT License - See LICENSE file

---

## Disclaimer

**This software is for educational purposes only. Not financial advice. Trade at your own risk.**

- Simulation results do not guarantee real-world performance
- Past performance does not predict future results
- You can lose money trading
- Consult a licensed financial advisor before trading

---

## Credits

Built by [@nulljosh](https://github.com/nulljosh) with Claude Sonnet 4.5

**Tech Inspiration**:
- Bloomberg Terminal (UI/UX)
- MetaTrader (charting)
- QuantConnect (backtesting philosophy)
- Interactive Brokers (API design)

**Meme Inspiration**:
- "Nothing ever happens" - /biz/ culture
- "Number go up" - crypto optimism
- "Easy money" - prediction market degeneracy

---

## Support

- **Issues**: [GitHub Issues](https://github.com/nulljosh/stonks/issues)
- **Discussions**: [GitHub Discussions](https://github.com/nulljosh/stonks/discussions)
- **Twitter**: [@trommatic](https://twitter.com/trommatic)

---

**Last Updated**: 2026-01-09
**Version**: v1.0.0 (Autopilot Launch)
