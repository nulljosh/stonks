# TODO

## P0 - Critical
1. **Improve simulator win rate** - Currently ~70%, target 85%+
   - Tune position sizing, stop loss, momentum thresholds
   - Add volatility filtering to avoid choppy markets

2. **Record simulation runs** - Track performance analytics
   - Save win rate, time to target, best/worst assets
   - JSON storage → eventual database

## P1 - High Value
3. **Sync simulator with live prices** - Currently uses random walks
4. **Automated speed test** - Verify sub-60s target programmatically

## Completed (2026-01-25)
- [x] Restored stock API with Yahoo Finance
- [x] Fixed ticker to show live stock prices
- [x] Added drag-to-scroll + auto-scroll to ticker
- [x] Fixed dark/light mode in simulator
- [x] Added comprehensive tests for 1T target
- [x] Tuned momentum thresholds (1.0% → 0.8%)
- [x] Reduced position sizing for safety (75% → 65% at start)
- [x] Improved risk/reward ratio (1.8%/4.2% → 1.5%/4.5%)

## Completed (2026-01-24)
- [x] Fixed win condition - stops at exactly $1B/$1T
- [x] Progressive risk reduction
- [x] Trading simulator $1 → $1B working
- [x] Bundle size: 577KB → 233KB
- [x] Sub-60 second challenge
- [x] Automated testing suite
