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

## Statistical Arbitrage Strategy (Renaissance Tech Approach)

**Goal:** Move from momentum trading → statistical arbitrage across infinite markets

**Core Concept:**
- Find tiny correlations across 50,000+ instruments
- Example: "When X moves +0.3%, Y moves +0.25% within 2 hours (52% of the time)"
- Win rate barely above 50%, but execute 1 million times/day
- Key: Thousands of uncorrelated small edges = guaranteed profit

**Implementation Plan:**
- [ ] Build correlation engine (track all pair relationships)
- [ ] Historical data ingestion (1-min bars, 30+ days rolling window)
- [ ] Pattern recognition (find statistically significant edges >50.1% win rate)
- [ ] Multi-market monitoring (stocks, crypto, futures, forex)
- [ ] Execution engine (trade when correlation signal fires)
- [ ] Backtesting framework (test strategies on historical data)
- [ ] Paper trading mode (validate live without capital risk)
- [ ] Risk management (position sizing, max drawdown limits)

**Target Hardware:**
- Raspberry Pi 5 (8GB RAM, <10MB app footprint)
- Runs 24/7 on 5 watts
- Bare-metal deployment (custom Linux kernel + Rust binary)
- Zero human intervention

**Target Performance:**
- Monitor 10,000+ instruments simultaneously
- Execute 1,000+ trades/day
- 12%+ annual return (beating S&P 500)
- <1ms decision latency

**Inspiration:** Jim Simons / Medallion Fund (39% annual returns for 30 years)

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
