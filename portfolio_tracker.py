#!/usr/bin/env python3
"""
Portfolio Tracker & Stock Screener
Run at market open/close to track portfolio and find opportunities
"""

import requests
from bs4 import BeautifulSoup
import yfinance as yf
import pandas as pd
from datetime import datetime
import json
import os
from typing import Dict, List, Tuple
from colorama import Fore, Style, init

# Initialize colorama for colored terminal output
init(autoreset=True)

class PortfolioTracker:
    def __init__(self, config_file='config.json'):
        self.config_file = config_file
        self.config = self.load_config()
        self.portfolio = {}
        self.market_data = {}

    def load_config(self) -> dict:
        """Load configuration from JSON file"""
        if os.path.exists(self.config_file):
            with open(self.config_file, 'r') as f:
                return json.load(f)
        else:
            # Default configuration
            default_config = {
                "portfolio_url": "https://heyitsmejosh.com/marlin",
                "watchlist": [],
                "alerts": {},
                "screener_criteria": {
                    "min_volume": 1000000,
                    "max_pe": 50,
                    "min_market_cap": 1000000000
                },
                "sectors_to_watch": ["Technology", "Healthcare", "Energy"],
                "notification_email": ""
            }
            with open(self.config_file, 'w') as f:
                json.dump(default_config, f, indent=4)
            return default_config

    def save_config(self):
        """Save current configuration"""
        with open(self.config_file, 'w') as f:
            json.dump(self.config, f, indent=4)

    def scrape_portfolio(self) -> Dict[str, dict]:
        """Scrape portfolio from user's website"""
        try:
            url = self.config['portfolio_url']
            response = requests.get(url, timeout=10)
            response.raise_for_status()

            soup = BeautifulSoup(response.content, 'html.parser')

            # Look for portfolio tracker table/column
            # This is a generic scraper - may need adjustment based on actual site structure
            portfolio = {}

            # Try to find tables
            tables = soup.find_all('table')
            for table in tables:
                rows = table.find_all('tr')
                for row in rows[1:]:  # Skip header
                    cols = row.find_all('td')
                    if len(cols) >= 2:
                        ticker = cols[0].text.strip().upper()
                        try:
                            shares = float(cols[1].text.strip().replace(',', ''))
                            portfolio[ticker] = {'shares': shares}
                        except (ValueError, IndexError):
                            continue

            if not portfolio:
                print(f"{Fore.YELLOW}Warning: Could not parse portfolio from website")
                print(f"{Fore.YELLOW}Using manual entry mode...")
                return self.manual_portfolio_entry()

            return portfolio

        except Exception as e:
            print(f"{Fore.RED}Error scraping portfolio: {e}")
            print(f"{Fore.YELLOW}Using manual entry mode...")
            return self.manual_portfolio_entry()

    def manual_portfolio_entry(self) -> Dict[str, dict]:
        """Fallback: load portfolio from portfolio.json file"""
        portfolio_file = 'portfolio.json'

        if os.path.exists(portfolio_file):
            print(f"{Fore.YELLOW}Loading portfolio from {portfolio_file}")
            try:
                with open(portfolio_file, 'r') as f:
                    portfolio = json.load(f)
                print(f"{Fore.GREEN}Loaded {len(portfolio)} positions from file")
                return portfolio
            except Exception as e:
                print(f"{Fore.RED}Error loading portfolio file: {e}")

        print(f"{Fore.YELLOW}No portfolio.json found. Using demo portfolio...")
        # Demo portfolio
        return {
            "AAPL": {"shares": 10},
            "NVDA": {"shares": 5},
            "AVGO": {"shares": 3}
        }

    def fetch_market_data(self, tickers: List[str]) -> Dict[str, dict]:
        """Fetch current market data for tickers"""
        market_data = {}

        for ticker in tickers:
            try:
                stock = yf.Ticker(ticker)
                info = stock.info
                hist = stock.history(period='1d')

                if not hist.empty:
                    current_price = hist['Close'].iloc[-1]
                else:
                    current_price = info.get('currentPrice', 0)

                market_data[ticker] = {
                    'price': current_price,
                    'previous_close': info.get('previousClose', current_price),
                    'market_cap': info.get('marketCap', 0),
                    'pe_ratio': info.get('trailingPE', 0),
                    'volume': info.get('volume', 0),
                    'sector': info.get('sector', 'Unknown'),
                    '52w_high': info.get('fiftyTwoWeekHigh', 0),
                    '52w_low': info.get('fiftyTwoWeekLow', 0),
                }
            except Exception as e:
                print(f"{Fore.RED}Error fetching data for {ticker}: {e}")
                market_data[ticker] = {'price': 0, 'error': str(e)}

        return market_data

    def analyze_portfolio(self) -> pd.DataFrame:
        """Analyze portfolio holdings"""
        tickers = list(self.portfolio.keys())
        self.market_data = self.fetch_market_data(tickers)

        rows = []
        total_value = 0

        for ticker, holding in self.portfolio.items():
            if ticker in self.market_data and 'error' not in self.market_data[ticker]:
                data = self.market_data[ticker]
                shares = holding['shares']
                value = shares * data['price']
                total_value += value

                change = ((data['price'] - data['previous_close']) / data['previous_close']) * 100

                rows.append({
                    'Ticker': ticker,
                    'Shares': shares,
                    'Price': f"${data['price']:.2f}",
                    'Value': f"${value:,.2f}",
                    'Change%': f"{change:+.2f}%",
                    'Sector': data['sector'],
                    'PE': f"{data['pe_ratio']:.2f}" if data['pe_ratio'] else 'N/A'
                })

        # Add allocation percentages
        for row in rows:
            value = float(row['Value'].replace('$', '').replace(',', ''))
            allocation = (value / total_value) * 100 if total_value > 0 else 0
            row['Allocation%'] = f"{allocation:.1f}%"

        df = pd.DataFrame(rows)
        return df, total_value

    def display_portfolio(self, df: pd.DataFrame, total_value: float):
        """Display portfolio analysis"""
        print(f"\n{Fore.CYAN}{'='*80}")
        print(f"{Fore.CYAN}PORTFOLIO ANALYSIS - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"{Fore.CYAN}{'='*80}\n")

        print(df.to_string(index=False))

        print(f"\n{Fore.GREEN}Total Portfolio Value: ${total_value:,.2f}")

        # Sector breakdown
        if not df.empty:
            print(f"\n{Fore.YELLOW}Sector Allocation:")
            sector_values = {}
            for _, row in df.iterrows():
                sector = row['Sector']
                value = float(row['Value'].replace('$', '').replace(',', ''))
                sector_values[sector] = sector_values.get(sector, 0) + value

            for sector, value in sorted(sector_values.items(), key=lambda x: x[1], reverse=True):
                pct = (value / total_value) * 100
                print(f"  {sector}: ${value:,.2f} ({pct:.1f}%)")

    def check_alerts(self):
        """Check if any price alerts have been triggered"""
        alerts = self.config.get('alerts', {})
        triggered = []

        for ticker, targets in alerts.items():
            if ticker in self.market_data:
                current_price = self.market_data[ticker]['price']

                if 'above' in targets and current_price >= targets['above']:
                    triggered.append(f"{ticker} is above ${targets['above']:.2f} (now ${current_price:.2f})")

                if 'below' in targets and current_price <= targets['below']:
                    triggered.append(f"{ticker} is below ${targets['below']:.2f} (now ${current_price:.2f})")

        if triggered:
            print(f"\n{Fore.RED}{'='*80}")
            print(f"{Fore.RED}PRICE ALERTS TRIGGERED!")
            print(f"{Fore.RED}{'='*80}")
            for alert in triggered:
                print(f"{Fore.YELLOW}{alert}")

    def screen_stocks(self, universe: List[str] = None) -> pd.DataFrame:
        """Screen stocks based on criteria"""
        if universe is None:
            # Default universe: S&P 500 or user watchlist
            universe = self.config.get('watchlist', [])
            if not universe:
                print(f"{Fore.YELLOW}No watchlist defined. Add tickers to config.json")
                return pd.DataFrame()

        criteria = self.config['screener_criteria']
        market_data = self.fetch_market_data(universe)

        matches = []
        for ticker, data in market_data.items():
            if 'error' in data:
                continue

            # Apply screening criteria
            if data['volume'] < criteria.get('min_volume', 0):
                continue
            if data['pe_ratio'] and data['pe_ratio'] > criteria.get('max_pe', float('inf')):
                continue
            if data['market_cap'] < criteria.get('min_market_cap', 0):
                continue

            # Calculate distance from 52w high
            distance_from_high = ((data['52w_high'] - data['price']) / data['52w_high']) * 100 if data['52w_high'] else 0

            matches.append({
                'Ticker': ticker,
                'Price': f"${data['price']:.2f}",
                'PE': f"{data['pe_ratio']:.2f}" if data['pe_ratio'] else 'N/A',
                'Volume': f"{data['volume']:,}",
                'Sector': data['sector'],
                'From_52w_High': f"-{distance_from_high:.1f}%"
            })

        df = pd.DataFrame(matches)
        return df

    def display_screener_results(self, df: pd.DataFrame):
        """Display stock screener results"""
        if df.empty:
            print(f"\n{Fore.YELLOW}No stocks match screening criteria")
            return

        print(f"\n{Fore.CYAN}{'='*80}")
        print(f"{Fore.CYAN}STOCK SCREENER RESULTS")
        print(f"{Fore.CYAN}{'='*80}\n")
        print(df.to_string(index=False))

    def run(self):
        """Main execution flow"""
        print(f"{Fore.MAGENTA}")
        print("╔════════════════════════════════════════════════════════════╗")
        print("║        Portfolio Tracker & Stock Screener v1.0             ║")
        print("╚════════════════════════════════════════════════════════════╝")
        print(Style.RESET_ALL)

        # 1. Load portfolio
        print(f"\n{Fore.CYAN}[1/4] Loading portfolio...")
        self.portfolio = self.scrape_portfolio()

        if not self.portfolio:
            print(f"{Fore.RED}No portfolio data available. Exiting.")
            return

        # 2. Analyze portfolio
        print(f"\n{Fore.CYAN}[2/4] Analyzing portfolio...")
        df, total_value = self.analyze_portfolio()
        self.display_portfolio(df, total_value)

        # 3. Check alerts
        print(f"\n{Fore.CYAN}[3/4] Checking price alerts...")
        self.check_alerts()

        # 4. Run screener
        print(f"\n{Fore.CYAN}[4/4] Running stock screener...")
        screener_df = self.screen_stocks()
        self.display_screener_results(screener_df)

        print(f"\n{Fore.GREEN}Analysis complete!")


def main():
    tracker = PortfolioTracker()
    tracker.run()


if __name__ == "__main__":
    main()
