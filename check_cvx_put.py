#!/usr/bin/env python3
"""Quick CVX put option calculator"""

import yfinance as yf

def check_put_option(strike=149, target_prices=[140, 145, 149, 150]):
    """Calculate P&L for CVX put option at different prices"""

    # Get current CVX price
    cvx = yf.Ticker("CVX")
    current_price = cvx.history(period="1d")['Close'].iloc[-1]

    print(f"\nCVX Current Price: ${current_price:.2f}")
    print(f"Put Strike: ${strike}")
    print(f"\nProfit/Loss scenarios (excluding premium paid):\n")
    print(f"{'Stock Price':<15} {'Put Value':<15} {'P&L':<15}")
    print("=" * 45)

    for price in target_prices:
        if price < strike:
            # In the money
            put_value = strike - price
            pnl_per_contract = put_value * 100
            print(f"${price:<14.2f} ${put_value:<14.2f} ${pnl_per_contract:>14,.2f} ✓")
        else:
            # Out of the money
            put_value = 0
            print(f"${price:<14.2f} ${put_value:<14.2f} ${'0.00':>14} ✗")

    print("\n" + "=" * 45)
    print(f"\nBreakeven: ${strike:.2f} (excluding premium)")
    print(f"Max profit: Unlimited (as stock goes to $0)")
    print(f"Max loss: Premium paid\n")

    # Calculate current intrinsic value
    if current_price < strike:
        intrinsic = strike - current_price
        print(f"Current intrinsic value: ${intrinsic:.2f} per share (${intrinsic * 100:.2f} per contract)")
    else:
        print(f"Currently out of the money by ${current_price - strike:.2f}")

if __name__ == "__main__":
    check_put_option()
