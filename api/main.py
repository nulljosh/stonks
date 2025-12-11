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

# CORS - restrict in production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # TODO: Set to specific origins in production
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
    from pathlib import Path

    portfolio_file = Path("portfolio.json")
    if not portfolio_file.exists():
        return {"success": False, "error": "portfolio.json not found"}

    try:
        with open(portfolio_file) as f:
            portfolio = json.load(f)
        return {"success": True, "portfolio": portfolio}
    except json.JSONDecodeError as e:
        return {"success": False, "error": f"Invalid JSON: {e}"}

@app.get("/api/markets")
async def get_market_indices():
    """Get current market indices data"""
    from market_utils import fetch_market_indices

    data = fetch_market_indices()
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
    from pathlib import Path

    index_file = Path("index.html")
    if index_file.exists():
        return index_file.read_text()
    return HTMLResponse("<h1>stonks</h1><p>Landing page not found</p>")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api.main:app", host="0.0.0.0", port=8000, reload=True)
