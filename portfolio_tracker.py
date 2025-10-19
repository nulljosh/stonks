#!/usr/bin/env python3
"""
stonks - Terminal-based stock portfolio tracker
Inspired by mop: stock market tracker for hackers
"""

import yfinance as yf
import pandas as pd
from datetime import datetime
import json
import os
import sys
from typing import Dict, List
from colorama import Fore, Style, init

# Initialize colorama
init(autoreset=True)

class StonksTracker:
    def __init__(self, config_file='config.json'):
        self.config_file = config_file
        self.config = self.load_config()
        self.portfolio = {}
        self.market_data = {}
        self.indices_data = {}

    def load_config(self) -> dict:
        """Load configuration from JSON file"""
        if os.path.exists(self.config_file):
            with open(self.config_file, 'r') as f:
                return json.load(f)
        return {
            "watchlist": ["AAPL", "NVDA", "MSFT"],
            "alerts": {},
            "screener_criteria": {
                "min_volume": 1000000,
                "max_pe": 50,
                "min_market_cap": 10000000000
            }
        }

    def load_portfolio(self) -> Dict[str, dict]:
        """Load portfolio from portfolio.json"""
        portfolio_file = 'portfolio.json'

        if os.path.exists(portfolio_file):
            try:
                with open(portfolio_file, 'r') as f:
                    return json.load(f)
            except Exception as e:
                print(f"{Fore.RED}Error loading portfolio: {e}")

        return {
            "AAPL": {"shares": 0.01},
            "NVDA": {"shares": 0.01}
        }

    def fetch_indices(self):
        """Fetch major market indices - mop style"""
        indices = {
            '^DJI': 'Dow',
            '^GSPC': 'S&P 500',
            '^IXIC': 'NASDAQ',
            '^N225': 'Tokyo',
            '^HSI': 'HK',
            '^FTSE': 'London',
            '^TNX': '10-Year Yield',
            'EURUSD=X': 'Euro',
            'JPY=X': 'Yen',
            'CL=F': 'Oil',
            'GC=F': 'Gold'
        }

        self.indices_data = {}
        for symbol, name in indices.items():
            try:
                ticker = yf.Ticker(symbol)
                hist = ticker.history(period='1d')

                if not hist.empty:
                    current = hist['Close'].iloc[-1]
                    previous = hist['Open'].iloc[0] if len(hist) > 0 else current
                    change = current - previous
                    change_pct = (change / previous) * 100 if previous != 0 else 0

                    self.indices_data[name] = {
                        'value': current,
                        'change': change,
                        'change_pct': change_pct
                    }
            except Exception:
                continue

    def display_indices(self):
        """Display market indices - mop style top bar"""
        if not self.indices_data:
            return

        parts = []
        for name, data in self.indices_data.items():
            value = data['value']
            change = data['change']
            change_pct = data['change_pct']

            # Color code based on change
            color = Fore.GREEN if change >= 0 else Fore.RED
            sign = '+' if change >= 0 else ''

            # Format differently for currencies and commodities
            if name in ['Euro', 'Yen']:
                parts.append(f"{name} ${value:.3f} ({color}{sign}{change_pct:.2f}%{Style.RESET_ALL})")
            elif name == '10-Year Yield':
                parts.append(f"{name} {value:.3f} ({color}{sign}{change_pct:.3f}%{Style.RESET_ALL})")
            elif name in ['Oil', 'Gold']:
                parts.append(f"{name} ${value:.2f} ({color}{sign}{change_pct:.2f}%{Style.RESET_ALL})")
            else:
                parts.append(f"{name} {value:,.2f} ({color}{sign}{change_pct:.2f}%{Style.RESET_ALL})")

        # Print indices in rows
        print()
        idx = 0
        while idx < len(parts):
            print(' '.join(parts[idx:idx+3]))
            idx += 3
        print()

    def fetch_market_data(self, tickers: List[str]) -> Dict[str, dict]:
        """Fetch market data for tickers"""
        market_data = {}

        for ticker in tickers:
            try:
                stock = yf.Ticker(ticker)
                info = stock.info
                hist = stock.history(period='5d')

                if not hist.empty:
                    current_price = hist['Close'].iloc[-1]
                    open_price = hist['Open'].iloc[-1]
                    low_price = hist['Low'].iloc[-1]
                    high_price = hist['High'].iloc[-1]
                    previous_close = info.get('previousClose', current_price)
                else:
                    current_price = info.get('currentPrice', 0)
                    open_price = current_price
                    low_price = current_price
                    high_price = current_price
                    previous_close = current_price

                market_data[ticker] = {
                    'last': current_price,
                    'open': open_price,
                    'low': low_price,
                    'high': high_price,
                    'previous_close': previous_close,
                    'change': current_price - previous_close,
                    'change_pct': ((current_price - previous_close) / previous_close * 100) if previous_close != 0 else 0,
                    'volume': info.get('volume', 0),
                    '52w_low': info.get('fiftyTwoWeekLow', 0),
                    '52w_high': info.get('fiftyTwoWeekHigh', 0),
                }
            except Exception as e:
                market_data[ticker] = {'error': str(e)}

        return market_data

    def display_portfolio_table(self):
        """Display portfolio in mop-style table"""
        tickers = list(self.portfolio.keys())
        self.market_data = self.fetch_market_data(tickers)

        # Header
        header = f"{'Ticker':<8} {'Last':>10} {'Change':>10} {'Change%':>10} {'Open':>10} {'Low':>10} {'High':>10} {'52w Low':>10} {'52w High':>10}"
        print(Fore.CYAN + header)
        print(Fore.CYAN + '=' * len(header))

        for ticker in tickers:
            if ticker not in self.market_data or 'error' in self.market_data[ticker]:
                continue

            data = self.market_data[ticker]

            # Color code based on change
            if data['change'] > 0:
                color = Fore.GREEN
                sign = '+'
            elif data['change'] < 0:
                color = Fore.RED
                sign = ''
            else:
                color = Fore.WHITE
                sign = ' '

            # Format row
            row = (
                f"{color}{ticker:<8} "
                f"${data['last']:>9.2f} "
                f"{sign}${abs(data['change']):>8.2f} "
                f"{sign}{data['change_pct']:>8.2f}% "
                f"${data['open']:>9.2f} "
                f"${data['low']:>9.2f} "
                f"${data['high']:>9.2f} "
                f"${data['52w_low']:>9.2f} "
                f"${data['52w_high']:>9.2f}"
                f"{Style.RESET_ALL}"
            )
            print(row)

    def run(self):
        """Main execution"""
        # Clear screen
        os.system('clear' if os.name != 'nt' else 'cls')

        # Load portfolio
        self.portfolio = self.load_portfolio()

        if not self.portfolio:
            print(f"{Fore.RED}No portfolio loaded")
            return

        # Fetch and display indices
        print(f"{Fore.MAGENTA}stonks - market tracker{Style.RESET_ALL}")
        self.fetch_indices()
        self.display_indices()

        # Display portfolio table
        self.display_portfolio_table()

        print(f"\n{Fore.YELLOW}Press 'q' to quit, 'r' to refresh")


def main():
    tracker = StonksTracker()
    tracker.run()


if __name__ == "__main__":
    main()
