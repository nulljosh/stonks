# stonks

Financial platform: portfolio + options + AI predictions

## Quick Start

```bash
# Web UI (no installation required!)
open index.html                    # Browser-based portfolio tracker

# Terminal UI
pip install -r requirements.txt
python portfolio_tracker.py

# API Server
python -m uvicorn api.main:app     # localhost:8000
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

`index.html` provides a browser-based portfolio tracker with Apple Liquid Glass design:
- **Real-time market data** - Dow, S&P 500, NASDAQ, commodities, currencies
- **Live portfolio tracking** - Color-coded gains/losses
- **Prediction markets** - Manifold Markets integration
- **Light/Dark mode** - Toggle button with localStorage persistence
- **Auto-refresh** - Every 60 seconds, or press 'r' to refresh manually
- **100% vanilla JS** - No frameworks, no build process, no server needed

Just open `index.html` in any browser!

**Educational only. Not financial advice.**
