# TODO

## P0 - Critical (Do Next)
1. **Sync simulator with live prices** ⚡
   - Why: Biggest UX inconsistency (simulator uses random walks, ticker shows real data)
   - Impact: Makes simulator actually useful for real market conditions
   - Effort: Medium (integrate useLivePrices into simulator logic)

## P1 - High Value
2. **Run automated speed test** 🧪
   - Why: Verify sub-60s target programmatically
   - Impact: Confidence in performance claims
   - Effort: 1 command (`npm run test:speed`)

## P2 - Nice to Have
3. **Fix localhost API proxies** 🔧
   - Why: Better dev experience
   - Impact: Low (Vercel works fine, this is dev-only)
   - Effort: Already documented in CLAUDE.md, not urgent

## Completed (2026-01-24)
- [x] Fixed win condition - stops at exactly $1B/$1T
- [x] Progressive risk reduction (1% position size at $10M+)
- [x] Trading simulator $1 → $1B working
- [x] Bundle size: 577KB → 233KB
- [x] Sub-60 second challenge
- [x] Automated testing suite
- [x] 83% win rate achieved
