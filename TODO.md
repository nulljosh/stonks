# Bread (Autopilot) TODO - Prioritized

**Last Updated:** 2026-01-24

## P0 - CRITICAL (Fix First)

### 1. Trading Algorithm Performance ⚠️ PARTIAL FIX
**Problem:** Was stuck at $1 for 100+ trades. Now escapes but slow ($1 → $7 in 300 trades / 1.5min)

**Fix Applied (2026-01-24):**
- [x] Removed price filter blocking normal stocks at $1 (was only allowing 4 microcap coins)
- [x] Allow fractional shares at <$2 balance
- [x] Restored 300ms tick rate (perfMode default true)
- [x] Fixed 10-bar history requirement
- [x] Added MAG7 + stocks to scrolling ticker

**Current Status:** ✅ WORKING! $1 → $35 on 300 trades (3,400% gain in 1.5min)

**Remaining Issue:** Simulator uses random price data, not live prices
- Trading simulator: Random walks around hardcoded base prices (ASSETS object)
- Scrolling ticker: Real live prices from APIs (Yahoo Finance, CoinGecko)
- **Inconsistency:** They don't match!

**Next Steps:**
- [ ] Replace simulator's random price generation with live API data
- [ ] Sync simulator ASSETS with live prices every 5 seconds
- [ ] Use historical volatility for realistic price movements
- [ ] Backtest against real 2025 data for validation

---

## P1 - HIGH (After P0 Fixed)

### 2. News Widget Not Loading on Vercel
**Problem:** Works locally, fails in production

**Debug Steps:**
- [ ] Check Vercel build logs for errors
- [ ] Test API endpoint directly (is NEWT API accessible from Vercel?)
- [ ] Check CORS / environment variables
- [ ] Add error boundary with fallback UI

**Quick Win:** Add "News unavailable" fallback so it doesn't break the UI

### 3. Polymarket API Connection Issues
**Problem:** API calls failing (rate limits? auth?)

**Debug:**
- [ ] Check rate limit headers in response
- [ ] Verify API key is set in Vercel env vars
- [ ] Add exponential backoff retry logic
- [ ] Implement caching (5min TTL minimum)

### 4. Bundle Splitting (577KB → <200KB)
**Current:** 577KB main bundle
**Target:** <200KB

**Strategy:**
- [ ] Code-split Recharts (lazy load charts)
- [ ] Split API modules (only load what's needed)
- [ ] Use dynamic imports for heavy components
- [ ] Run `npm run build` and analyze bundle
- [ ] Consider removing unused dependencies

**Quick Wins:**
- Lazy load chart library (biggest offender)
- Remove dead code

---

## P2 - MEDIUM (Nice to Have)

### 5. Add SHOO Stock Ticker
- [ ] Add to `src/utils/assets.js`
- [ ] Test with Yahoo Finance API
- [ ] Verify Monte Carlo integration

### 6. ROI Metrics Display
- [ ] Calculate: `(current_balance - initial_balance) / initial_balance * 100`
- [ ] Show win rate, total trades, avg profit/loss
- [ ] Add time-weighted return

### 7. Incremental Code Generation
**Problem:** Token exhaustion on large refactors

**Solution:**
- Break changes into smaller commits
- Use TODO comments for multi-step work
- Claude should ask "continue?" before large changes

---

## P3 - DOCS & CLEANUP (Deferred)

- [ ] Add ToC to CLAUDE.md
- [ ] Mark skills as [Implemented] or [Planned]
- [ ] Add priorities to IDEA.md
- [ ] Update README.md dates (stonks → bread references)
- [ ] Verify STATE_MACHINES.md matches current code

---

## Known Issues (Not Blocking)

### Performance
- Simulator crashes after 5-10 seconds on old hardware (perf mode helps)
- Bundle size: 577KB (working on it in P1)
- Polling-based updates (WebSocket feeds planned)

### Limitations
- No real broker integration (simulation only)
- API rate limits: Yahoo Finance ~2K/hr, Polymarket ~10/sec

### Error Handling (Already Good ✓)
- ✓ API failures: graceful degradation
- ✓ Network issues: auto-retry with backoff
- ✓ Invalid tickers: validation + error messages
- ✓ Browser support: Chrome/Edge/Safari/Firefox

---

## Future / Icebox

### Features (Not Prioritized)
- [ ] Add S&P 500 full coverage (500 stocks)
- [ ] Kalshi integration
- [ ] Tabbed interface
- [ ] Sentiment analysis auto-params
- [ ] Black-Scholes options pricing
- [ ] TradingView webhook integration
- [ ] cTrader API docs
- [ ] Wealthsimple/broker strategies

### Performance Optimizations (Future)
- [ ] WebSocket feeds (replace polling)
- [ ] Binary payloads (compress API responses)
- [ ] Vectorized math (SIMD Monte Carlo)

### Long-Term Vision
- [ ] C++ core → WebAssembly
- [ ] Custom RTOS research
- [ ] White paper publication
- [ ] iOS/Android apps

### Statistical Arbitrage (Research Phase)
**Vision:** Renaissance Tech-inspired stat arb across 50K+ instruments

**Key Metrics:**
- 10K instruments
- 1K trades/day
- 12%+ annual return
- <1ms latency
- Raspberry Pi 5 deployment

See `STRATEGY.md` for full plan (not started yet)

---

## Completed (Recent Sessions)

### 2026-01-11
- [x] Two-phase trading approach (0.8% → 1.5% thresholds)
- [x] Restored 60%+ win rate logic from cb4c5de
- [x] Micro-cap trading only when balance < $1.20
- [x] Tight 1.5% SL / 4.5% TP ratio (3:1 R/R)

### 2026-01-10
- [x] Performance mode (300ms ticks) - fixed crashes
- [x] Horizontal ticker rendering
- [x] Error logging + 26 test cases
- [x] Win rate: 36% → 54%
- [x] Fix $1 escape issue
- [x] Fix $0.00 BONK position sizing
- [x] Order placement logic
- [x] Prevent expensive stocks wiping accounts
- [x] NEWT news widget integration
- [x] Weather widget
- [x] C core prototype (2.5M ticks/sec, 10KB memory)
- [x] Memory optimizations
- [x] GitHub link + breadcrumbs
- [x] Whitepaper v1.1 with C benchmarks

---

## Next Session Action Plan

**Start Here:**
1. Fix P0 trading algorithm (review `cb4c5de` diff)
2. Test thoroughly until $1 escape works
3. Then tackle P1 (news widget + Polymarket + bundle size)

**Don't:**
- Don't jump to features before core trading works
- Don't refactor docs until algorithm is solid
- Don't optimize what isn't broken

**Session Budget:**
- Allocate 60% to P0 (trading fix)
- Allocate 30% to P1 (news/API/bundle)
- Allocate 10% to testing/verification
