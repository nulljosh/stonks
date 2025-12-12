# stonks

Financial platform: portfolio + options + AI predictions

## Quick Start

```bash
pip install -r requirements.txt
python portfolio_tracker.py        # Terminal UI
python -m uvicorn api.main:app     # API (localhost:8000)
open webapp.html                   # Web UI (browser-based)
```

## Config

`portfolio.json`:
```json
{"AAPL": {"shares": 10}, "SPY": {"shares": 5}}
```

## Features

- Portfolio tracking (stocks/crypto/commodities)
- Options screening (IV Rank, multi-strategy)
- AI predictions (xLSTM neural network)
- Web UI with live market data and prediction markets

## Web UI

The `webapp.html` file provides a browser-based version of the portfolio tracker:
- Real-time market indices (Dow, S&P 500, NASDAQ, commodities, currencies)
- Live portfolio tracking with color-coded gains/losses
- Manifold prediction markets integration
- Auto-refresh every 60 seconds
- Press 'r' to manually refresh

Just open `webapp.html` in any browser - no server required!

**Educational only. Not financial advice.**
