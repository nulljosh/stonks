# stonks

Financial analysis platform: portfolio tracking + options screening + AI predictions

## Quick Start

```bash
pip install -r requirements.txt
python portfolio_tracker.py                    # Terminal tracker
uvicorn api.main:app --reload --port 8000     # Start API
```

## Features

- **Portfolio Tracking**: Real-time stocks/crypto/commodities with P&L
- **Options Screening**: Multi-strategy analysis with IV Rank and probability scoring
- **AI Predictions**: xLSTM neural network for price forecasting (CUDA-accelerated)

## Config

`portfolio.json`:
```json
{"AAPL": {"shares": 10}, "SPY": {"shares": 5}}
```

## Tech

FastAPI · Python · PyTorch · React · yfinance · Interactive Brokers

## Docs

- API: http://localhost:8000/docs
- Setup: See SETUP.md
- Options API: http://localhost:8000/api/options/docs

**Educational purposes only. Not financial advice.**
