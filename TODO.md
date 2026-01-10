# Autopilot TODO

## Active Priorities

- [ ] Improve win rate to 60%+ (currently 54%) for consistent $1B scaling
- [ ] The problem with Opus/Claude writing huge amounts of code then running out of tokens - be more incremental

## Features Not Implemented

- [ ] Add SHOO stock ticker
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

---

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
