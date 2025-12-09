"""
Unified Stonks Platform API
===========================
FastAPI backend serving all features: portfolio, options screening, AI predictions.

Run with:
    uvicorn api.main:app --reload --port 8000
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
import os

app = FastAPI(
    title="Stonks Platform API",
    description="Unified API for portfolio tracking, options screening, and AI price predictions",
    version="1.0.0",
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount options screener API routes
from options_screener.api import main as options_api
app.mount("/api/options", options_api.app)

# Portfolio endpoints
@app.get("/api/portfolio")
async def get_portfolio():
    """Get current portfolio holdings and P&L"""
    import json
    try:
        with open("portfolio.json", "r") as f:
            portfolio = json.load(f)
        return {"success": True, "portfolio": portfolio}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.get("/api/markets")
async def get_market_indices():
    """Get current market indices data"""
    import yfinance as yf

    indices = {
        "dow": "^DJI",
        "sp500": "^GSPC",
        "nasdaq": "^IXIC",
        "tokyo": "^N225",
        "hong_kong": "^HSI",
        "london": "^FTSE",
        "ten_year": "^TNX",
        "euro": "EURUSD=X",
        "yen": "JPY=X",
        "oil": "CL=F",
        "gold": "GC=F",
    }

    data = {}
    for name, symbol in indices.items():
        try:
            ticker = yf.Ticker(symbol)
            info = ticker.history(period="1d")
            if not info.empty:
                current = info['Close'].iloc[-1]
                open_price = info['Open'].iloc[-1]
                change = current - open_price
                change_pct = (change / open_price) * 100
                data[name] = {
                    "symbol": symbol,
                    "price": round(current, 2),
                    "change": round(change, 2),
                    "change_percent": round(change_pct, 2)
                }
        except:
            data[name] = None

    return {"success": True, "data": data}

@app.get("/api/predictions/forecast")
async def get_price_forecast():
    """Get AI price forecast (placeholder for xLSTM integration)"""
    return {
        "success": False,
        "message": "AI predictions coming soon - xLSTM model integration in progress"
    }

# Root endpoint
@app.get("/")
async def root():
    """API root"""
    return {
        "name": "Stonks Platform API",
        "version": "1.0.0",
        "endpoints": {
            "portfolio": "/api/portfolio",
            "markets": "/api/markets",
            "options": "/api/options",
            "predictions": "/api/predictions",
            "docs": "/docs"
        }
    }

# Serve landing page
@app.get("/index", response_class=HTMLResponse)
async def serve_landing():
    """Serve the landing page"""
    try:
        with open("index.html", "r") as f:
            return f.read()
    except:
        return HTMLResponse("<h1>stonks</h1><p>Landing page not found</p>")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api.main:app", host="0.0.0.0", port=8000, reload=True)
