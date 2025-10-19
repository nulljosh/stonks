# Portfolio Tracker & Stock Screener

A Python tool to track your portfolio, check price alerts, and screen stocks based on your criteria.

## Setup

1. Install dependencies:
```bash
pip3 install -r requirements.txt
```

2. Configure your settings in `config.json`:
   - `portfolio_url`: Your portfolio website (currently set to heyitsmejosh.com/marlin)
   - `watchlist`: Stocks to screen
   - `alerts`: Price alerts (above/below triggers)
   - `screener_criteria`: Filtering criteria for stock screening

## Usage

Run at market open (9:30 AM ET):
```bash
python3 portfolio_tracker.py
```

Run at market close (4:00 PM ET):
```bash
python3 portfolio_tracker.py
```

Or set up cron jobs to run automatically:
```bash
# Edit crontab
crontab -e

# Add these lines (adjust times for your timezone):
30 9 * * 1-5 cd /Users/joshua/Documents/Videos && python3 portfolio_tracker.py >> tracker.log 2>&1
0 16 * * 1-5 cd /Users/joshua/Documents/Videos && python3 portfolio_tracker.py >> tracker.log 2>&1
```

## Features

### Portfolio Tracking
- Scrapes your portfolio from heyitsmejosh.com/marlin
- Shows current value, allocation, and performance
- Displays sector breakdown
- Calculates total portfolio value

### Price Alerts
- Set price targets (above/below)
- Get notified when triggered
- Works for stocks, crypto (BTC-USD, ETH-USD), commodities (GC=F for gold)

### Stock Screener
- Filter by volume, P/E ratio, market cap
- See distance from 52-week highs
- Customize criteria in config.json

## Configuration Examples

### Add Price Alert
```json
"alerts": {
    "AAPL": {
        "above": 260,
        "below": 240
    }
}
```

### Customize Screener
```json
"screener_criteria": {
    "min_volume": 1000000,
    "max_pe": 50,
    "min_market_cap": 10000000000
}
```

### Add to Watchlist
```json
"watchlist": [
    "AAPL",
    "NVDA",
    "BTC-USD",
    "ETH-USD"
]
```

## Supported Tickers

- Stocks: AAPL, NVDA, TSLA, etc.
- Crypto: BTC-USD, ETH-USD
- Commodities: GC=F (Gold), SI=F (Silver)
- ETFs: GLD, SLV, SPY, QQQ

## Notes

- If website scraping fails, you'll be prompted to manually enter your portfolio
- All data comes from Yahoo Finance via yfinance
- No buy/sell recommendations are provided - this is purely informational
