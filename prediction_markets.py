#!/usr/bin/env python3
"""
Prediction Markets Module for stonks
Fetches data from Manifold Markets API
"""

import requests
import json
from typing import Dict, List, Optional
from datetime import datetime
from colorama import Fore, Style

class PredictionMarketsTracker:
    """Fetch and manage prediction market data from Manifold Markets"""

    BASE_URL = "https://api.manifold.markets/v0"

    def __init__(self):
        self.markets = {}
        self.categories = []

    def fetch_markets(self, limit: int = 20, sort: str = 'last-bet-time') -> List[Dict]:
        """
        Fetch prediction markets from Manifold Markets API

        Args:
            limit: Number of markets to fetch (default 20)
            sort: Sort by 'created-time', 'updated-time', 'last-bet-time' (default)

        Returns:
            List of market dictionaries
        """
        try:
            params = {
                'limit': limit,
                'sort': sort
            }
            response = requests.get(f"{self.BASE_URL}/markets", params=params, timeout=10)
            response.raise_for_status()

            markets = response.json()
            self.markets = {m['id']: m for m in markets}
            return markets

        except requests.exceptions.RequestException as e:
            print(f"{Fore.RED}Error fetching markets: {e}{Style.RESET_ALL}")
            return []

    def fetch_markets_by_category(self, category: str, limit: int = 10) -> List[Dict]:
        """
        Fetch markets by category/group

        Args:
            category: Category name (e.g., 'politics', 'sports', 'crypto')
            limit: Number of markets to fetch

        Returns:
            List of market dictionaries for the category
        """
        try:
            # Manifold uses 'group' parameter for categories
            params = {
                'group': category,
                'limit': limit,
                'sort': 'last-bet-time'
            }
            response = requests.get(f"{self.BASE_URL}/markets", params=params, timeout=10)
            response.raise_for_status()

            return response.json()

        except requests.exceptions.RequestException as e:
            print(f"{Fore.RED}Error fetching category markets: {e}{Style.RESET_ALL}")
            return []

    def fetch_market(self, market_id: str) -> Optional[Dict]:
        """Fetch a specific market by ID"""
        try:
            response = requests.get(f"{self.BASE_URL}/market/{market_id}", timeout=10)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"{Fore.RED}Error fetching market {market_id}: {e}{Style.RESET_ALL}")
            return None

    def format_market_data(self, market: Dict) -> Dict:
        """
        Format market data for display

        Returns dictionary with key fields for display
        """
        # Extract probability (YES probability for binary markets)
        probability = market.get('probability', 0)

        # Get market resolution status
        status = 'Open'
        if market.get('isResolved'):
            status = 'Resolved'
            probability = 100 if market.get('resolution') == 'YES' else 0
        elif market.get('state') == 'CLOSED':
            status = 'Closed'

        # Format volume
        volume = market.get('volume', 0)
        volume_str = f"${volume:,.0f}" if volume > 0 else "$0"

        # Get market close time
        close_time = market.get('closeTime')
        days_until_close = 'N/A'
        if close_time:
            close_dt = datetime.fromtimestamp(close_time / 1000)
            now = datetime.now()
            days_left = (close_dt - now).days
            days_until_close = f"{days_left}d"

        return {
            'id': market.get('id', ''),
            'question': market.get('question', ''),
            'probability': probability,
            'probability_yes': probability,  # For binary markets
            'status': status,
            'volume': volume,
            'volume_str': volume_str,
            'close_date': close_time,
            'days_until_close': days_until_close,
            'creator': market.get('creatorName', 'Unknown'),
            'contracts': market.get('contracts', []),
            'is_resolved': market.get('isResolved', False),
        }

    def display_markets_table(self, markets: List[Dict], max_rows: int = 10):
        """Display markets in table format"""
        if not markets:
            print(f"{Fore.YELLOW}No markets found{Style.RESET_ALL}")
            return

        # Limit rows for display
        markets = markets[:max_rows]

        # Header
        header = f"{'Question':<50} {'YES Prob':>10} {'Status':>10} {'Volume':>12} {'Close':>8}"
        print(f"{Fore.CYAN}{header}{Style.RESET_ALL}")
        print(f"{Fore.CYAN}{'=' * len(header)}{Style.RESET_ALL}")

        for market in markets:
            formatted = self.format_market_data(market)

            # Color code based on probability
            prob = formatted['probability_yes']
            if prob > 60:
                color = Fore.GREEN
            elif prob < 40:
                color = Fore.RED
            else:
                color = Fore.YELLOW

            # Truncate question if too long
            question = formatted['question']
            if len(question) > 50:
                question = question[:47] + "..."

            # Format row
            row = (
                f"{color}{question:<50} "
                f"{prob:>9.1f}% "
                f"{formatted['status']:>10} "
                f"{formatted['volume_str']:>12} "
                f"{formatted['days_until_close']:>8}"
                f"{Style.RESET_ALL}"
            )
            print(row)

    def get_trending_markets(self, limit: int = 20) -> List[Dict]:
        """Get trending/recent markets"""
        return self.fetch_markets(limit=limit, sort='last-bet-time')

    def get_recent_markets(self, limit: int = 20) -> List[Dict]:
        """Get recently created markets"""
        return self.fetch_markets(limit=limit, sort='created-time')
