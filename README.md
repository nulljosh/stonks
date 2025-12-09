# stonks

> **Full-stack financial analysis platform** combining portfolio tracking, options screening, and AI-powered price prediction.

Inspired by [mop](https://github.com/mop-tracker/mop), enhanced with professional-grade options analysis and machine learning forecasting.

---

## Features

### Portfolio Tracking
- **Real-time market data** - Stocks, crypto, commodities, ETFs
- **Multi-market indices** - Dow, S&P 500, NASDAQ, Tokyo, HK, London
- **Color-coded P&L** - Instant visual feedback on gains/losses
- **Terminal interface** - Fast, lightweight, always-on monitoring
- **Prediction markets** - Manifold Markets integration

### Options Screening
- **Multi-strategy analysis** - Iron Condors, Butterflies, Straddles, Strangles, Spreads
- **Statistical edge detection** - IV Rank, probability of profit, expected value
- **Dual data sources** - Interactive Brokers (real-time) or yfinance (free)
- **Futures options** - ES, NQ, CL, GC and other liquid contracts
- **Smart scoring system** - 6-factor weighted analysis for trade quality
- **Risk visualization** - P&L diagrams and breakeven analysis

### AI Price Prediction
- **xLSTM neural network** - Extended LSTM with exponential gating
- **CUDA acceleration** - GPU-optimized for fast training and inference
- **Financial time-series** - Trained on ES futures and equity data
- **Matrix memory** - Associative memory for better pattern recognition
- **Production-ready** - Full training pipeline and inference API

---

## Quick Start

### Basic Setup (Portfolio Tracking)

```bash
# Install core dependencies
pip install -r requirements.txt

# Configure your portfolio
nano portfolio.json

# Run the tracker
python portfolio_tracker.py
```

### Full Setup (All Features)

```bash
# 1. Install Python dependencies (CPU only)
pip install -r requirements.txt

# 2. Optional: Install CUDA support for ML predictions (requires NVIDIA GPU)
pip install -r requirements-cuda.txt
cd fused_xlstm && pip install -e .

# 3. Start the FastAPI backend
uvicorn api.main:app --reload --port 8000

# 4. Start the React dashboard (in a new terminal)
cd frontend
npm install
npm run dev

# 5. Open your browser
# Landing page: http://localhost:5173
# Options screener: http://localhost:5173/options
# AI predictions: http://localhost:5173/predictions
# Terminal tracker: python portfolio_tracker.py
```

---

## Architecture

### Tech Stack

**Backend:**
- **FastAPI** - Modern async Python web framework
- **yfinance** - Free stock market data
- **Interactive Brokers API** - Real-time options data (optional)
- **PyTorch + CUDA** - Neural network training and inference
- **Manifold Markets API** - Prediction markets

**Frontend:**
- **Vanilla HTML/CSS/JS** - Landing page and simple views
- **React + Vite** - Complex dashboards (options screener, AI predictions)
- **Tailwind CSS** - Utility-first styling
- **Chart.js** - Data visualization

**Machine Learning:**
- **xLSTM (Extended LSTM)** - Custom CUDA kernels for financial forecasting
- **PyTorch** - Deep learning framework
- **cuDNN** - NVIDIA GPU acceleration library

### Project Structure

```
stonks/
├── api/                          # FastAPI backend
│   ├── main.py                   # Main API server
│   ├── routes/
│   │   ├── portfolio.py          # Portfolio endpoints
│   │   ├── options.py            # Options screening endpoints
│   │   └── predictions.py        # ML prediction endpoints
│   └── models/                   # Pydantic models
├── frontend/                     # React + Vanilla HTML frontend
│   ├── public/                   # Static HTML pages
│   │   ├── index.html            # Landing page
│   │   └── about.html            # About page
│   └── src/                      # React components
│       ├── components/
│       │   ├── OptionsScreener/  # Options dashboard
│       │   ├── PredictionPanel/  # AI predictions dashboard
│       │   └── Portfolio/        # Portfolio visualizer
│       └── App.jsx
├── options_screener/             # Options screening engine
│   ├── screening_engine_v2.py    # Multi-strategy screener
│   ├── ibkr_data_fetcher.py      # Interactive Brokers integration
│   └── config.py                 # Options screening config
├── fused_xlstm/                  # AI prediction engine
│   ├── stochastic_resxlstm/      # xLSTM implementation
│   │   ├── cuda/                 # Custom CUDA kernels
│   │   ├── xlstm.py              # High-level model API
│   │   └── training/             # Training scripts
│   └── setup.py                  # CUDA extension build
├── portfolio_tracker.py          # Terminal portfolio tracker
├── portfolio.json                # User portfolio config
├── config.json                   # App configuration
└── requirements.txt              # Python dependencies
```

---

## Usage

### 1. Portfolio Tracking

**Terminal interface:**
```bash
python portfolio_tracker.py
```

**Configure holdings in `portfolio.json`:**
```json
{
  "AAPL": {"shares": 10},
  "SPY": {"shares": 5},
  "BTC-USD": {"shares": 0.5}
}
```

**Example output:**
```
stonks - market tracker

Dow 46,190 (+0.72%) S&P 500 6,664 (+0.77%) NASDAQ 22,680 (+0.85%)

Ticker      Last      Change   Change%     Open      Low      High   52w Low  52w High
===========================================================================================
AAPL    $  252.29  +$  4.84  +  1.96%  $ 248.02  $ 247.27  $ 253.38  $ 169.21  $ 260.10
SPY     $  610.23  +$  2.11  +  0.35%  $ 608.45  $ 607.89  $ 611.34  $ 445.67  $ 615.89
```

---

### 2. Options Screening

**Web dashboard:**
```bash
uvicorn api.main:app --reload --port 8000
cd frontend && npm run dev
# Navigate to http://localhost:5173/options
```

**CLI:**
```bash
cd options_screener
python cli.py --symbols SPY QQQ AAPL --strategy all
```

**What it does:**
- Analyzes options chains for statistical advantages
- Calculates probability of profit using Black-Scholes
- Scores trades based on IV rank, liquidity, technical alignment
- Suggests optimal strikes and expirations

**Example suggestions:**
```
#1 | SPY - Iron Condor | Score: 78%
────────────────────────────────────────
Direction: NEUTRAL
Premium: $245 (Max profit)
Probability of profit: 82%
Risk/Reward: 1:5.2

Why this trade?
✓ High IV Rank (65%) - elevated premium
✓ 82% probability of staying in range
✓ Underlying in neutral consolidation
✓ 25 DTE - optimal time decay zone
```

**Supported strategies:**
- Iron Condors / Butterflies (neutral, high IV)
- Straddles / Strangles (volatility plays)
- Credit spreads (directional, defined risk)
- Cash-secured puts / covered calls (income)
- Long options (directional, low IV)

---

### 3. AI Price Prediction

**API endpoint:**
```bash
curl http://localhost:8000/api/predictions/forecast \
  -d '{"symbol": "ES", "timeframe": "1H", "horizon": 24}'
```

**Web dashboard:**
Navigate to `http://localhost:5173/predictions`

**What it does:**
- Trains xLSTM model on historical price data
- Forecasts future prices using learned patterns
- Provides confidence intervals and risk metrics
- GPU-accelerated for real-time inference

**Training a model:**
```bash
cd fused_xlstm
python stochastic_resxlstm/training/train_es_forecaster.py
```

**Architecture:**
- **sLSTM cells** - Fast, memory-efficient sequence processing
- **mLSTM cells** - Associative memory for complex patterns
- **Exponential gating** - Better gradient flow than standard LSTM
- **CUDA kernels** - Custom GPU acceleration (3-10x faster)

---

## Configuration

### Portfolio (`portfolio.json`)
```json
{
  "AAPL": {"shares": 10},
  "SPY": {"shares": 5}
}
```

### App Settings (`config.json`)
```json
{
  "show_prediction_markets": true,
  "prediction_market_limit": 10,
  "options_data_source": "yfinance",
  "ml_enabled": true,
  "refresh_interval": 60
}
```

### Options Screener (`options_screener/config.py`)
```python
# Data source
DATA_SOURCE = "ibkr"  # or "yfinance"

# Screening parameters
MIN_IV_RANK = 30.0
MIN_PROB_PROFIT = 0.60
MIN_DAYS_TO_EXPIRY = 7
MAX_DAYS_TO_EXPIRY = 45

# Interactive Brokers settings
IBKR_SETTINGS = IBKRSettings(
    host="127.0.0.1",
    port=7497,  # 7497=paper, 7496=live
    client_id=1
)
```

### ML Model (`fused_xlstm/configs/`)
```yaml
model:
  input_size: 128
  hidden_size: 512
  num_layers: 8
  cell_type: ['slstm', 'mlstm', 'slstm', 'mlstm']
  dropout: 0.1

training:
  learning_rate: 0.001
  batch_size: 32
  epochs: 100
```

---

## Data Sources

### Stock/Crypto Data
- **yfinance** - Free, 15-minute delayed
- **Interactive Brokers** - Real-time, requires account

### Options Data
- **yfinance** - Free, delayed, equity options only
- **Interactive Brokers** - Real-time, equity + futures options

### Prediction Markets
- **Manifold Markets API** - Free, no auth required

---

## GPU Support (Optional)

**Why GPU?**
- Train ML models 10-50x faster
- Real-time inference for AI predictions
- Required for xLSTM (custom CUDA kernels)

**Requirements:**
- NVIDIA GPU (Compute Capability 6.0+)
- CUDA Toolkit 12.0+
- cuDNN 9.0+

**Installation:**
```bash
# Install PyTorch with CUDA
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121

# Build xLSTM CUDA extension
cd fused_xlstm
pip install -e .

# Verify GPU is detected
python -c "import torch; print(torch.cuda.is_available())"
```

**Note:** CPU-only mode works fine for portfolio tracking and options screening. GPU is only needed for ML predictions.

---

## Interactive Brokers Setup (Optional)

**For real-time options data:**

1. Install TWS or IB Gateway
2. Enable API connections:
   - TWS: Edit → Global Configuration → API → Settings
   - Enable "ActiveX and Socket Clients"
   - Port: **7497** (paper) or **7496** (live)
3. Update `options_screener/config.py` with your port
4. The screener will auto-connect when started

**Test connection:**
```bash
cd options_screener
python ibkr_data_fetcher.py
```

---

## API Reference

### Portfolio Endpoints

```
GET  /api/portfolio          - Get current portfolio
POST /api/portfolio          - Update holdings
GET  /api/portfolio/value    - Get total value
GET  /api/markets            - Get market indices
```

### Options Endpoints

```
POST /api/options/screen     - Screen for opportunities
GET  /api/options/chain      - Get option chain
POST /api/options/analyze    - Analyze specific trade
GET  /api/options/strategies - List available strategies
```

### Prediction Endpoints

```
POST /api/predictions/forecast    - Generate price forecast
GET  /api/predictions/models      - List available models
POST /api/predictions/train       - Train new model
GET  /api/predictions/backtest    - Backtest predictions
```

---

## Development

### Run tests
```bash
pytest tests/
```

### Run linters
```bash
black .
ruff check .
mypy .
```

### Build frontend
```bash
cd frontend
npm run build
```

### Hot reload
```bash
# Backend
uvicorn api.main:app --reload

# Frontend
cd frontend && npm run dev
```

---

## Roadmap

**Current (v1.0):**
- Portfolio tracking (terminal + web)
- Options screening (multi-strategy)
- AI predictions (xLSTM, CUDA)
- Prediction markets integration

**Upcoming (v1.1):**
- [ ] Trade execution via IBKR
- [ ] Position monitoring and alerts
- [ ] Backtesting engine
- [ ] Portfolio Greeks aggregation
- [ ] Mobile-responsive design

**Future (v2.0):**
- [ ] Multi-user support with auth
- [ ] Real-time WebSocket updates
- [ ] Telegram/Discord notifications
- [ ] Earnings calendar integration
- [ ] Advanced ML models (Transformers, RL)

---

## Limitations & Disclaimers

**IMPORTANT**

- This tool is for **educational purposes only**
- Options and futures trading involve **substantial risk of loss**
- AI predictions are **not guaranteed** - markets are unpredictable
- Data may be **delayed** (15-20 minutes with free sources)
- Always do your own research before trading
- This is **not financial advice**

---

## Contributing

Contributions welcome! Please:
1. Fork the repo
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

---

## License

MIT License - Use freely, trade responsibly.

---

## Credits

- Portfolio tracker inspired by [mop](https://github.com/mop-tracker/mop)
- Options analysis based on statistical options theory
- xLSTM architecture from Beck et al. (2024)
- Built with FastAPI, React, PyTorch, CUDA

---

**Built for traders who want a statistical edge.**
