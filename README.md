# stonks

Real-time portfolio tracking meets HFT-style analysis.

## Quick Start

```bash
# Install dependencies
pip3 install -r requirements.txt

# Edit your portfolio
nano portfolio.json

# Run the tracker
python3 portfolio_tracker.py
```

## Features

- **Portfolio Tracking** - Real-time holdings analysis with sector breakdown
- **HFT-Style Streaming** - Live price updates with volatility detection
- **Price Alerts** - Custom notifications when stocks hit targets
- **Stock Screener** - Filter by volume, P/E, market cap
- **Technical Indicators** - RSI, MACD, momentum analysis
- **Multi-Asset** - Stocks, crypto (BTC-USD), commodities (GC=F)

## Configuration

Edit `config.json` to customize:

```json
{
    "watchlist": ["AAPL", "NVDA", "BTC-USD"],
    "alerts": {
        "AAPL": {"above": 260, "below": 240}
    },
    "screener_criteria": {
        "min_volume": 1000000,
        "max_pe": 50
    }
}
```

Edit `portfolio.json` with your holdings:

```json
{
    "AAPL": {"shares": 0.3042},
    "BTC-USD": {"shares": 0.5}
}
```

## Tech Stack

- Python 3
- yfinance (market data)
- pandas (analysis)
- colorama (terminal colors)

## Demo

[View live demo page](https://nulljosh.github.io/stonks)

---

**Disclaimer:** Not financial advice. Educational purposes only.
