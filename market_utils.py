"""Shared market data utilities"""
import yfinance as yf
from typing import Dict

MARKET_INDICES = {
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


def fetch_market_indices() -> Dict[str, dict]:
    """Fetch current market indices data"""
    data = {}
    for name, symbol in MARKET_INDICES.items():
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
        except Exception as e:
            data[name] = {"error": str(e)}
    return data
