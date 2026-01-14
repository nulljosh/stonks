# Autopilot TODO

## Active Priorities

### P0 - Critical
- [ ] **Trading algorithm regression** - See commit `cb4c5de` for working 60%+ win rate logic
  - Issue: Stuck trading micro-caps at $1, not scaling to larger positions
  - Root cause: Phase 1/2 momentum thresholds need tuning
  - Fix: Restore 0.8% strength threshold for balance < $1.20, 1.5%+ after

### P1 - High
- [ ] Fix news widget not loading on Vercel (works locally)
- [ ] Fix Polymarket API connection issues
- [ ] Bundle splitting (577KB → <200KB target)

### P2 - Medium
- [ ] Add SHOO stock ticker
- [ ] Calculate and display ROI metrics
- [ ] Incremental code generation (avoid token exhaustion)

## Known Issues & Limitations

### Current Limitations
- [ ] Simulator crashes after 5-10 seconds on older hardware (performance mode helps)
- [ ] No real broker integration (simulation only)
- [ ] API rate limits: Yahoo Finance ~2K req/hour, Polymarket ~10 req/sec
- [ ] Bundle size: 237KB (target <200KB)
- [ ] Polling-based updates (WebSocket feeds planned)
- [ ] Financial news widget not loading on Vercel (works locally)

### Error Handling Status
- ✓ API failures: Graceful degradation with cached data
- ✓ Network issues: Auto-retry with exponential backoff
- ✓ Invalid tickers: Input validation + error messages
- ✓ Browser support: Chrome/Edge/Safari/Firefox latest

## Features Not Implemented
- [ ] Add S&P 500 full coverage (500 stocks)
- [ ] Add Kalshi prediction market integration
- [ ] Implement tabbed interface for multi-view dashboard
- [ ] Sentiment analysis for Monte Carlo auto-parameterization
- [ ] Implement Black-Scholes options pricing model
- [ ] Add Delta-Threshold bandwidth optimization algorithm
- [ ] Document TradingView webhook integration
- [ ] Document cTrader API integration
- [ ] Document Wealthsimple/broker connection strategies

## Performance Optimizations

- [ ] Bundle splitting (target <200KB main bundle, currently 577KB)
- [ ] WebSocket feeds (replace polling)
- [ ] Binary payloads (compress API responses)
- [ ] Vectorized math (SIMD-optimized Monte Carlo)
- [ ] Code-split Recharts library

## Future Phases

- [ ] C++ core → WebAssembly compilation
- [ ] Custom RTOS research
- [ ] White paper publication
- [ ] iOS/Android apps

## Statistical Arbitrage Strategy

**Vision:** Renaissance Tech-inspired stat arb across 50K+ instruments. Find micro-correlations (52% win rate), execute millions of trades/day. See `STRATEGY.md` for full implementation plan.

**Key Metrics:** 10K instruments, 1K trades/day, 12%+ annual return, <1ms latency, Raspberry Pi 5 deployment.

---

## Completed (2026-01-11 Session)

- [x] Fix $1 stagnation with two-phase approach (0.8% strength < $1.20, 1.5%+ after)
- [x] Restore 60%+ win rate logic from commit cb4c5de
- [x] Allow micro-cap trading only when balance < $1.20
- [x] Keep tight 1.5% SL / 4.5% TP ratio (3:1 R/R)

## Completed (2026-01-10 Session)

- [x] Fix simulator crash - Performance mode enabled (300ms ticks)
- [x] Fix horizontal ticker rendering
- [x] Add error logging/test suite (26 tests)
- [x] Win rate improved 36% → 54%
- [x] Fix $1 escape issue
- [x] Fix $0.00 BONK position sizing
- [x] Fix order placement logic
- [x] Prevent expensive stocks wiping accounts
- [x] Error handling + test cases
- [x] Integrate NEWT news widget
- [x] Add weather widget
- [x] C core prototype (2.5M ticks/sec, 10KB memory)
- [x] Memory optimizations (capped arrays)
- [x] GitHub link + breadcrumbs
- [x] Whitepaper v1.1 with C benchmarks
