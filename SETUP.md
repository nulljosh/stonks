# Stonks Platform - Setup Guide

Quick guide to get the unified stonks platform running.

## Prerequisites

- Python 3.9+
- pip
- (Optional) Node.js and npm for React dashboards
- (Optional) NVIDIA GPU with CUDA for AI predictions

## Installation

### 1. Clone and Install Dependencies

```bash
git clone https://github.com/nulljosh/stonks.git
cd stonks

# Install Python dependencies
pip install -r requirements.txt
```

### 2. Configure Your Portfolio

Edit `portfolio.json` with your holdings:

```json
{
    "AAPL": {"shares": 10},
    "SPY": {"shares": 5},
    "BTC-USD": {"shares": 0.5}
}
```

### 3. Start the Backend

```bash
# Start the unified FastAPI backend
uvicorn api.main:app --reload --port 8000
```

The API will be available at:
- Landing page: http://localhost:8000/index
- API docs: http://localhost:8000/docs
- Options API: http://localhost:8000/api/options/docs

### 4. Run Portfolio Tracker (Terminal)

```bash
# In a new terminal
python portfolio_tracker.py
```

This shows your holdings with real-time P&L in the terminal.

### 5. Optional: Options Screener React Dashboard

```bash
cd options_screener/frontend
npm install
npm run dev
```

Dashboard available at http://localhost:5173

## Usage

### Portfolio Tracking

**Terminal interface:**
```bash
python portfolio_tracker.py
```

**API:**
```bash
curl http://localhost:8000/api/portfolio
curl http://localhost:8000/api/markets
```

### Options Screening

**API:**
```bash
# Health check
curl http://localhost:8000/api/options/health

# Screen a ticker
curl http://localhost:8000/api/options/screen/SPY

# Auto-scan watchlist
curl -X POST http://localhost:8000/api/options/auto-scan
```

**Web dashboard:**
Navigate to http://localhost:8000/api/options/docs for interactive API exploration.

### AI Predictions (Coming Soon)

```bash
curl http://localhost:8000/api/predictions/forecast
```

## Configuration

### App Settings (`config.json`)
```json
{
    "show_prediction_markets": true,
    "prediction_market_limit": 10,
    "options_data_source": "yfinance",
    "refresh_interval": 60
}
```

### Options Screener (`options_screener/config.py`)
```python
# Data source
DATA_SOURCE = "yfinance"  # or "ibkr"

# Screening parameters
MIN_IV_RANK = 30.0
MIN_PROB_PROFIT = 0.60
MIN_DAYS_TO_EXPIRY = 7
MAX_DAYS_TO_EXPIRY = 45
```

## Interactive Brokers Setup (Optional)

For real-time options data:

1. Install TWS or IB Gateway
2. Enable API connections (port 7497 for paper, 7496 for live)
3. Update `options_screener/config.py`:
   ```python
   DATA_SOURCE = "ibkr"
   IBKR_HOST = "127.0.0.1"
   IBKR_PORT = 7497
   ```

## GPU Support (Optional)

For AI predictions with xLSTM:

```bash
# Install PyTorch with CUDA
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121

# Build xLSTM CUDA extension
cd fused_xlstm
pip install -e .

# Verify GPU
python -c "import torch; print(torch.cuda.is_available())"
```

## Troubleshooting

### Import Errors

Make sure you're in the project root directory and dependencies are installed:
```bash
cd /path/to/stonks
pip install -r requirements.txt
```

### API Not Starting

Check if port 8000 is already in use:
```bash
lsof -i :8000
```

### IBKR Connection Issues

1. Ensure TWS/IB Gateway is running
2. Check API settings are enabled
3. Verify port number (7497 paper, 7496 live)
4. Try restarting TWS/Gateway

### Data Not Loading

yfinance may have rate limits. Wait a minute and try again, or consider using IBKR for real-time data.

## Development

### Run tests
```bash
pytest tests/
```

### Hot reload backend
```bash
uvicorn api.main:app --reload
```

### Hot reload React frontend
```bash
cd options_screener/frontend
npm run dev
```

## Project Structure

```
stonks/
├── api/                    # Unified FastAPI backend
│   └── main.py             # Main API server
├── frontend/               # Landing pages
│   └── index.html          # Main landing page
├── options_screener/       # Options screening engine
│   ├── api/                # Options FastAPI endpoints
│   ├── frontend/           # React dashboard
│   └── screening_engine_v2.py
├── fused_xlstm/            # AI prediction engine
│   └── stochastic_resxlstm/
├── portfolio_tracker.py    # Terminal portfolio tracker
├── portfolio.json          # Your holdings
├── config.json             # App configuration
└── requirements.txt        # Python dependencies
```

## Next Steps

1. Configure your `portfolio.json`
2. Start the API: `uvicorn api.main:app --reload --port 8000`
3. Run the terminal tracker: `python portfolio_tracker.py`
4. Explore the API docs: http://localhost:8000/docs
5. Try the options screener: http://localhost:8000/api/options/docs

## Support

- GitHub Issues: https://github.com/nulljosh/stonks/issues
- README: See README.md for detailed feature documentation

---

**Disclaimer:** This tool is for educational purposes only. Options and futures trading involve substantial risk of loss. Not financial advice.
