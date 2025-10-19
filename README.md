# stonks

Terminal-based stock portfolio tracker inspired by [mop](https://github.com/mop-tracker/mop).

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

- **Market Indices** - Live data for Dow, S&P 500, NASDAQ, Tokyo, HK, London, 10-Year Yield, Euro, Yen, Oil, Gold
- **Portfolio Tracking** - Real-time holdings with color-coded gains/losses
- **Mop-Style Display** - Clean terminal table with Last, Change, Change%, Open, Low, High, 52w Low/High
- **Multi-Asset** - Stocks, crypto (BTC-USD), commodities (GC=F, SLV), ETFs (IAU)

## Example Output

```
stonks - market tracker

Dow 46,190.61 (+0.72%) S&P 500 6,664.01 (+0.77%) NASDAQ 22,679.97 (+0.85%)
Tokyo 47,582.15 (-0.50%) HK 25,247.10 (-2.34%) London 9,354.60 (-0.86%)
10-Year Yield 4.007 (+0.300%) Euro $1.166 (-0.31%) Yen $150.584 (+0.12%)
Oil $57.54 (+0.07%) Gold $4189.90 (-3.78%)

Ticker         Last     Change    Change%       Open        Low       High    52w Low   52w High
================================================================================================
AAPL     $   252.29 +$    4.84 +    1.96% $   248.02 $   247.27 $   253.38 $   169.21 $   260.10
HOOD     $   129.91 $    1.53    -1.16% $   128.16 $   125.60 $   131.21 $    23.00 $   153.86
SLV      $    46.99 $    2.18    -4.43% $    48.46 $    45.88 $    48.59 $    26.19 $    49.25
```

## Configuration

Edit `portfolio.json` with your holdings:

```json
{
    "AAPL": {"shares": 0.3042},
    "HOOD": {"shares": 0.0229},
    "SLV": {"shares": 0.5251},
    "BTC-USD": {"shares": 0.5}
}
```

## Tech Stack

- Python 3
- yfinance (market data)
- colorama (terminal colors)

## Demo

[View landing page](https://nulljosh.github.io/stonks)

---

**Disclaimer:** Not financial advice. Educational purposes only.
