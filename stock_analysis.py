#!/usr/bin/env python3
"""
Advanced stock analysis: Monte Carlo, Black-Scholes, Technical indicators
"""

import yfinance as yf
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from scipy.stats import norm

def tldr_methods():
    """TL;DR of analysis methods"""
    print("=" * 80)
    print("TL;DR: ANALYSIS METHODS")
    print("=" * 80)
    print("""
📊 MONTE CARLO SIMULATION
   - Runs 10,000+ random price paths based on historical volatility
   - Shows probability distribution of future prices
   - Like simulating thousands of parallel universes for the stock

📈 BLACK-SCHOLES MODEL
   - Nobel Prize-winning options pricing formula
   - Calculates theoretical option prices
   - Uses: stock price, strike, time, volatility, risk-free rate
   - Originally for options, but shows implied volatility

📉 SHARPE RATIO
   - Risk-adjusted returns (return per unit of risk)
   - Higher = better risk/reward
   - >1 is good, >2 is very good, >3 is excellent

📊 VOLATILITY (Standard Deviation)
   - How much the stock bounces around
   - Higher = more risky/opportunity
   - Annualized percentage
    """)
    print("=" * 80)
    print()

def get_stock_data(ticker, period='1y'):
    """Fetch stock data"""
    try:
        stock = yf.Ticker(ticker)
        data = stock.history(period=period)
        return data
    except Exception as e:
        print(f"Error fetching {ticker}: {e}")
        return None

def calculate_returns(data):
    """Calculate daily returns"""
    returns = data['Close'].pct_change().dropna()
    return returns

def monte_carlo_simulation(current_price, returns, days=252, simulations=10000):
    """
    Monte Carlo simulation for stock price prediction

    Args:
        current_price: Current stock price
        returns: Historical daily returns
        days: Trading days to simulate (252 = 1 year)
        simulations: Number of simulation runs
    """
    mu = returns.mean()
    sigma = returns.std()

    # Generate random price paths
    results = []
    for _ in range(simulations):
        daily_returns = np.random.normal(mu, sigma, days)
        price_path = current_price * (1 + daily_returns).cumprod()
        results.append(price_path[-1])

    results = np.array(results)

    return {
        'mean': np.mean(results),
        'median': np.median(results),
        'std': np.std(results),
        'percentile_5': np.percentile(results, 5),
        'percentile_25': np.percentile(results, 25),
        'percentile_75': np.percentile(results, 75),
        'percentile_95': np.percentile(results, 95),
        'prob_profit': np.sum(results > current_price) / simulations * 100
    }

def black_scholes_call(S, K, T, r, sigma):
    """
    Black-Scholes formula for European call option

    S: Current stock price
    K: Strike price
    T: Time to expiration (years)
    r: Risk-free rate
    sigma: Volatility (annualized)
    """
    d1 = (np.log(S / K) + (r + 0.5 * sigma**2) * T) / (sigma * np.sqrt(T))
    d2 = d1 - sigma * np.sqrt(T)

    call_price = S * norm.cdf(d1) - K * np.exp(-r * T) * norm.cdf(d2)
    return call_price

def calculate_sharpe_ratio(returns, risk_free_rate=0.045):
    """Calculate Sharpe ratio (annualized)"""
    excess_returns = returns - risk_free_rate / 252  # Daily risk-free rate
    sharpe = np.sqrt(252) * excess_returns.mean() / excess_returns.std()
    return sharpe

def analyze_stock(ticker):
    """Complete stock analysis"""
    print(f"\n{'=' * 80}")
    print(f"📊 ANALYZING: {ticker}")
    print(f"{'=' * 80}")

    # Fetch data
    data = get_stock_data(ticker)
    if data is None or data.empty:
        print(f"❌ Could not fetch data for {ticker}")
        return

    current_price = data['Close'].iloc[-1]
    returns = calculate_returns(data)

    # Basic stats
    print(f"\n💰 CURRENT PRICE: ${current_price:.2f}")
    print(f"📅 52-Week High: ${data['High'].max():.2f}")
    print(f"📅 52-Week Low: ${data['Low'].min():.2f}")

    # Volatility
    annual_volatility = returns.std() * np.sqrt(252) * 100
    print(f"\n📉 VOLATILITY (Annualized): {annual_volatility:.2f}%")

    # Sharpe Ratio
    sharpe = calculate_sharpe_ratio(returns)
    print(f"📈 SHARPE RATIO: {sharpe:.2f}", end=" ")
    if sharpe > 2:
        print("(🚀 EXCELLENT)")
    elif sharpe > 1:
        print("(✅ GOOD)")
    elif sharpe > 0:
        print("(⚠️  MODERATE)")
    else:
        print("(❌ POOR)")

    # Monte Carlo Simulation (1 year forward)
    print(f"\n🎲 MONTE CARLO SIMULATION (1 Year, 10,000 runs)")
    mc_results = monte_carlo_simulation(current_price, returns)

    print(f"   Expected Price (Mean): ${mc_results['mean']:.2f}")
    print(f"   Median Price: ${mc_results['median']:.2f}")
    print(f"   5th Percentile (Bear): ${mc_results['percentile_5']:.2f}")
    print(f"   95th Percentile (Bull): ${mc_results['percentile_95']:.2f}")
    print(f"   Probability of Profit: {mc_results['prob_profit']:.1f}%")

    upside = ((mc_results['median'] - current_price) / current_price) * 100
    print(f"   Expected Return: {upside:+.2f}%")

    # Black-Scholes for ATM call option (1 year)
    strike = current_price
    T = 1.0  # 1 year
    r = 0.045  # Risk-free rate (approximate)
    sigma = annual_volatility / 100  # Convert to decimal

    call_price = black_scholes_call(current_price, strike, T, r, sigma)
    print(f"\n💼 BLACK-SCHOLES ATM CALL (1Y, Strike=${strike:.2f})")
    print(f"   Theoretical Price: ${call_price:.2f}")
    print(f"   Implied Premium: {(call_price/current_price)*100:.2f}%")

    # Performance metrics
    ytd_return = ((current_price - data['Close'].iloc[0]) / data['Close'].iloc[0]) * 100
    print(f"\n📊 PERFORMANCE")
    print(f"   YTD Return: {ytd_return:+.2f}%")
    print(f"   Daily Avg Return: {returns.mean()*100:.3f}%")

    return {
        'ticker': ticker,
        'price': current_price,
        'volatility': annual_volatility,
        'sharpe': sharpe,
        'mc_median': mc_results['median'],
        'expected_return': upside,
        'prob_profit': mc_results['prob_profit']
    }

def main():
    """Run analysis on all stocks"""
    import sys

    tldr_methods()

    # Check for command-line arguments
    if len(sys.argv) > 1:
        tickers = sys.argv[1:]
        print(f"📋 Analyzing custom tickers: {', '.join(tickers)}\n")
    else:
        tickers = ['TD', 'ATZ.TO', 'RY', 'HOOD', 'PLTR']
        print(f"📋 Analyzing default portfolio: {', '.join(tickers)}\n")

    results = []
    for ticker in tickers:
        result = analyze_stock(ticker)
        if result:
            results.append(result)

    # Summary comparison
    print(f"\n{'=' * 80}")
    print("🏆 COMPARATIVE SUMMARY")
    print(f"{'=' * 80}")
    print(f"{'Ticker':<10} {'Price':<12} {'Volatility':<12} {'Sharpe':<10} {'Expected 1Y':<15} {'Win %':<10}")
    print("-" * 80)

    for r in results:
        print(f"{r['ticker']:<10} ${r['price']:<11.2f} {r['volatility']:<11.2f}% {r['sharpe']:<10.2f} {r['expected_return']:+.2f}%{'':<8} {r['prob_profit']:.1f}%")

    print("\n🎯 RECOMMENDATIONS:")

    # Best Sharpe
    best_sharpe = max(results, key=lambda x: x['sharpe'])
    print(f"   Best Risk/Reward: {best_sharpe['ticker']} (Sharpe: {best_sharpe['sharpe']:.2f})")

    # Highest expected return
    best_return = max(results, key=lambda x: x['expected_return'])
    print(f"   Highest Expected Return: {best_return['ticker']} ({best_return['expected_return']:+.2f}%)")

    # Most volatile
    most_volatile = max(results, key=lambda x: x['volatility'])
    print(f"   Most Volatile (High Risk/Reward): {most_volatile['ticker']} ({most_volatile['volatility']:.2f}%)")

    print(f"\n{'=' * 80}")
    print("⚠️  DISCLAIMER: For educational purposes only. Not financial advice!")
    print(f"{'=' * 80}\n")

if __name__ == "__main__":
    main()
