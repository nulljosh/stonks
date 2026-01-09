# Autopilot - Claude Development Guide

## Project Vision
Autopilot is a high-alpha, low-latency financial terminal designed for extreme efficiency. It combines prediction markets (Polymarket, Kalshi) with quantitative simulations and live market data into a unified dashboard optimized for minimal memory footprint and bandwidth usage.

## Architecture Goals
- **Memory**: Target <10MB runtime footprint ("The 10MB Dashboard")
- **Latency**: Sub-100ms data updates via Delta-Threshold algorithm
- **Efficiency**: Binary payloads, vectorized math, O(1) user input
- **Scalability**: Web app → C++ core → Custom RTOS (future)

## Current Stack
- **Frontend**: React + Vite
- **APIs**: Polymarket, Kalshi, Yahoo Finance, News APIs
- **Math**: Monte Carlo, Black-Scholes (auto-parameterized)
- **Deployment**: Vercel

---

## Project Permissions

Claude has permission to:
- Read, write, and edit any files in this workspace
- Execute bash commands for development tasks
- Install packages and dependencies (npm, pip, brew, etc.)
- Make git commits and push changes
- Create, modify, and delete files and directories
- Run tests, builds, and development scripts
- Search the web and fetch content for research
- Use any tools available without asking for confirmation

### Communication Style
- Never use emojis unless explicitly requested
- Keep responses concise and technical
- Act as a Senior Quant Developer and stock market professional
- Prioritize code efficiency and performance

---

## Skills & Commands

### `/sim` - Run Simulation
Executes Monte Carlo or Black-Scholes simulation with auto-parameterized drift/volatility from live news and market data.

**Usage**: `/sim [TICKER] [MODEL]`
**Example**: `/sim AAPL monte-carlo`

**Implementation**:
- Pulls μ (drift) and σ (volatility) from macro news sentiment
- 5,000 path simulations
- Bull/Base/Bear scenario analysis

---

### `/optimize` - Memory & Bandwidth Optimization
Analyzes and optimizes code for memory footprint and bandwidth usage.

**Usage**: `/optimize [TARGET]`
**Example**: `/optimize api/stocks.js`

**Checks**:
- Binary payload usage
- Vectorized math operations
- Delta-Threshold implementation
- Redundant API calls
- Bundle size impact

---

### `/market` - Add Market Integration
Scaffolds a new prediction market or exchange integration.

**Usage**: `/market [PLATFORM]`
**Example**: `/market kalshi`

**Generates**:
- API client in `api/[platform].js`
- React hook in `src/hooks/use[Platform].js`
- Test suite
- Error handling and rate limiting

---

### `/algo` - Document Algorithm
Creates technical documentation for algorithms suitable for white paper inclusion.

**Usage**: `/algo [NAME]`
**Example**: `/algo delta-threshold`

**Output**:
- Mathematical notation
- Pseudocode
- Complexity analysis
- Trade-offs and optimizations

---

### `/broker` - Broker Integration Plan
Generates integration documentation for connecting to trading platforms.

**Usage**: `/broker [PLATFORM]`
**Example**: `/broker tradingview`

**Covers**:
- API authentication flow
- Order execution pipeline
- Risk management considerations
- Latency and slippage handling
- Regulatory compliance notes

---

### `/stock` - Add Stock Coverage
Adds a new stock ticker to the dashboard with live pricing and historical data.

**Usage**: `/stock [TICKER]`
**Example**: `/stock HIMS`

**Updates**:
- `src/utils/assets.js` with new ticker
- Yahoo Finance API integration
- Monte Carlo asset list

---

### `/test-suite` - Generate Comprehensive Tests
Creates test coverage for a module with edge cases and performance benchmarks.

**Usage**: `/test-suite [MODULE]`
**Example**: `/test-suite api/markets`

**Generates**:
- Unit tests with vitest
- Mock API responses
- Error case coverage
- Performance benchmarks

---

### `/deploy` - Deployment & CI/CD
Prepares and executes deployment pipeline with optimization checks.

**Usage**: `/deploy [ENV]`
**Example**: `/deploy prod`

**Steps**:
1. Run tests
2. Bundle size check (<10MB threshold)
3. Build production assets
4. Deploy to Vercel
5. Smoke test endpoints

---

## Development Workflow

### Starting Development
```bash
npm install
npm run dev
```

### Running Tests
```bash
npm test              # Run all tests
npm run test:ui       # Visual test UI
npm run test:coverage # Coverage report
```

### Committing Changes
```bash
git add .
git commit -m "feat: description"
git push
```

---

## Key Algorithms

### 1. Delta-Threshold Update Algorithm
**Purpose**: Minimize bandwidth by only updating UI when price moves beyond threshold.

**Logic**:
- Track last sent price `P_prev`
- Current price `P_curr`
- Threshold `δ = 0.5%`
- Update only if `|P_curr - P_prev| / P_prev > δ`

**Memory**: O(n) where n = number of tracked assets
**Latency**: O(1) per update check

---

### 2. Auto-Parameterized Monte Carlo
**Purpose**: Zero-input simulations using live market data.

**Parameters**:
- **Drift (μ)**: Derived from macro news sentiment analysis
- **Volatility (σ)**: Calculated from historical price variance
- **Paths**: 5,000 simulations
- **Horizon**: User-configurable (default 30 days)

**Optimization**:
- Vectorized operations (SIMD potential)
- Parallel path computation
- Cached news sentiment (15min TTL)

---

### 3. Binary Payload Compression
**Purpose**: Minimize API response sizes.

**Format**:
```
[timestamp (4 bytes)] [price (4 bytes float)] [volume (4 bytes)] [change% (2 bytes)]
= 14 bytes per data point vs 100+ bytes JSON
```

**Implementation**: Future enhancement (currently JSON)

---

## Real-World Trading Considerations

### API Latency
- **Simulation**: Instant execution
- **Reality**: 50-500ms API round-trip
- **Solution**: Pre-fetch with WebSocket, order book snapshots

### Liquidity & Slippage
- **Simulation**: Fill at mid-price
- **Reality**: Bid-ask spread, partial fills
- **Solution**: Model slippage as `f(volume, spread, volatility)`

### Rate Limits
- **Polymarket**: ~10 req/sec
- **Yahoo Finance**: ~2,000 req/hour
- **Solution**: Delta-Threshold + caching

### Paper Trading → Live
1. Test with paper trading API (TD Ameritrade, Alpaca)
2. Implement order confirmation UX
3. Add kill switch and position limits
4. Gradual capital allocation ($100 → $1k → ...)

---

## S&P 500 Coverage Plan

### Memory Budget Analysis
- **Per Stock**: ~100 bytes (ticker, price, change, volume)
- **500 Stocks**: ~50KB base
- **Historical (1Y)**: 252 days × 500 × 14 bytes = ~1.8MB
- **Total**: ~2MB for full S&P 500 coverage

### Implementation Strategy
1. **Phase 1**: Add MAG7 + requested stocks (HIMS, PG, TGT, WMT)
2. **Phase 2**: Top 50 by market cap
3. **Phase 3**: Full S&P 500 with virtualized rendering
4. **Phase 4**: Custom stock input with symbol validation

---

## Broker Integration Roadmap

### TradingView Integration
- **Approach**: TradingView Webhooks → Autopilot API → Broker
- **Flow**: Alert trigger → REST endpoint → Order execution
- **Latency**: ~500ms end-to-end

### cTrader Integration
- **Approach**: cTrader Open API (REST + WebSocket)
- **Features**: Real-time quotes, order management, historical data
- **Use Case**: Forex and CFDs

### Wealthsimple Trade
- **Status**: No public API (as of 2025)
- **Alternative**: Screen scraping (unreliable) or wait for official API
- **Recommended**: Use IBKR, Alpaca, or Tradier instead

### Interactive Brokers (Recommended)
- **API**: TWS API (most robust)
- **Features**: Stocks, options, futures, forex, crypto
- **Latency**: Sub-50ms market data
- **Liquidity**: Direct market access

---

## Future Enhancements

### Phase 1: Current (Web App)
- React dashboard
- API integrations
- Basic simulations

### Phase 2: C++ Core
- Rewrite compute-heavy modules (Monte Carlo, data processing)
- WebAssembly bridge to React frontend
- 10x performance improvement

### Phase 3: Custom RTOS
- Bare-metal financial operating system
- <5MB memory footprint
- Sub-millisecond tick-to-trade
- Custom kernel for order routing

### Phase 4: White Paper
- Publish algorithms and optimizations
- Academic validation of models
- Open-source efficiency techniques

---

## Meme Culture

**Nothing Ever Happens**:
- UI should only alert when macro events ACTUALLY break the status quo
- Silent by default
- Big bold alerts for >3% market moves
- "Something happened" banner when VIX spikes

---

## Technical Debt & TODOs

- [ ] Implement Delta-Threshold algorithm
- [ ] Add Kalshi integration
- [ ] Binary payload compression
- [ ] Vectorized Monte Carlo
- [ ] WebSocket for live data
- [ ] Bundle size <10MB
- [ ] S&P 500 full coverage
- [ ] TradingView webhook receiver
- [ ] Paper trading mode
- [ ] White paper LaTeX template

---

**Last Updated**: 2026-01-09
