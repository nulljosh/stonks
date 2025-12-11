# stonks

Financial platform: portfolio + options + AI predictions

## Quick Start

```bash
pip install -r requirements.txt
python portfolio_tracker.py        # Terminal UI
python -m uvicorn api.main:app     # API (localhost:8000)
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

**Educational only. Not financial advice.**
