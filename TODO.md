# Autopilot TODO

## Critical Bugs (Fix First)
- [ ] Fix simulator crash after 5-10s (React render loop issue)
- [ ] Fix horizontal ticker not rendering (data loading issue)
- [ ] Add error logging/test cases to catch crashes
- [ ] Frankly it's not even profitable and probably won't even work for a while
- [ ] It was winning for a day or two but now is getting stuck out at $1. 
- [ ] Trying to place orders for $0.00 BONK etc lol.

## Features Not Implemented
- [ ] Integrate NEWT news feed (separate project at ~/Documents/Code/newt)
  - NEWT provides real-time financial news aggregation
  - Integration plan:
    1. Add NEWT as npm package or git submodule
    2. Create NewsWidget component in Autopilot
    3. Connect to NEWT's WebSocket or REST API
    4. Display filtered news feed at bottom of dashboard
    5. Use sentiment analysis to auto-parameterize Monte Carlo drift/volatility
  - Benefits: Real-time news → automated μ/σ → zero-input simulations
- [ ] Add SHOO stock ticker
- [ ] Add S&P 500 full coverage (500 stocks)
- [ ] Add Kalshi prediction market integration
- [ ] Implement tabbed interface for multi-view dashboard
- [ ] Add news API for auto-parameterized Monte Carlo (drift/vol from sentiment)
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

## Memory Conservation (Core Goal)
- [ ] Cap all arrays properly (prices, trades, etc.)
- [ ] Implement lazy loading for S&P 500 data
- [ ] Add virtualized rendering for large lists
- [ ] Profile memory usage and optimize hot paths

## Documentation
- [ ] Create INSTRUCTIONS.md for real-world replication
- [ ] Document algorithms for white paper
- [ ] Add API rate limit handling docs
- [ ] Create deployment troubleshooting guide

## Future Phases
- [ ] C++ core modules (WebAssembly)
- [ ] Custom RTOS research
- [ ] White paper publication
- [ ] iOS/Android apps
