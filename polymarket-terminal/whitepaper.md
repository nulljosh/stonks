# Polymarket Terminal: Quantitative Methods Whitepaper

**Version 1.0 | January 2026**

---

## Abstract

This document provides a comprehensive technical overview of the quantitative methods and algorithms implemented in the Polymarket Terminal trading simulator. The system combines Monte Carlo simulation, Black-Scholes probability estimation, and Fibonacci technical analysis to provide probabilistic forecasts for cryptocurrency, commodities, equities, and prediction markets. This whitepaper details the mathematical foundations, implementation specifics, and data sources powering the platform.

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Monte Carlo Simulation](#2-monte-carlo-simulation)
3. [Black-Scholes Probability Model](#3-black-scholes-probability-model)
4. [Fibonacci Extension Analysis](#4-fibonacci-extension-analysis)
5. [Sharpe Ratio](#5-sharpe-ratio)
6. [Data Sources and Integration](#6-data-sources-and-integration)
7. [Appendix: Mathematical Notation](#7-appendix-mathematical-notation)

---

## 1. Introduction

The Polymarket Terminal is a real-time financial dashboard that integrates prediction market data with traditional asset pricing models. The platform employs sophisticated quantitative techniques to estimate probability distributions of future asset prices, enabling users to assess risk and identify high-probability trading opportunities.

### 1.1 Core Capabilities

- **Stochastic Price Modeling**: 5,000-path Monte Carlo simulations using geometric Brownian motion
- **Analytical Probability Estimation**: Black-Scholes-derived probability calculations
- **Technical Analysis**: Fibonacci extension targets based on historical price ranges
- **Multi-Asset Coverage**: Cryptocurrencies, precious metals, energy commodities, equity indices, and prediction markets

### 1.2 Design Philosophy

The system prioritizes computational efficiency and reproducibility. Seeded random number generation ensures that simulations can be replicated for verification, while parallel data fetching minimizes latency across multiple asset classes.

---

## 2. Monte Carlo Simulation

### 2.1 Theoretical Foundation

The Monte Carlo simulation engine models asset price evolution using **Geometric Brownian Motion (GBM)**, the standard stochastic process for modeling stock prices in continuous time. GBM is defined by the stochastic differential equation:

```
dS = S(mu * dt + sigma * dW)
```

Where:
- `S` = Current asset price
- `mu` = Drift coefficient (expected return)
- `sigma` = Volatility coefficient (standard deviation of returns)
- `dt` = Time increment
- `dW` = Wiener process increment (Brownian motion)

### 2.2 Discretization Scheme

For numerical simulation, the continuous SDE is discretized using the **Euler-Maruyama method** with an exact solution for GBM. The discrete-time price evolution follows:

```
S(t+dt) = S(t) * exp((mu - 0.5 * sigma^2) * dt + sigma * sqrt(dt) * Z)
```

Where `Z ~ N(0,1)` is a standard normal random variable.

The term `(mu - 0.5 * sigma^2)` represents the **drift correction** (Ito's lemma correction) that accounts for the convexity of the exponential function, ensuring the expected value of the log-normal distribution is correct.

### 2.3 Implementation Details

#### 2.3.1 Simulation Parameters

| Parameter | Value | Description |
|-----------|-------|-------------|
| `N` | 5,000 | Number of simulation paths |
| `dt` | 1/365 | Daily time step (annualized) |
| `maxD` | Variable | Maximum horizon in days |
| `volMult` | User-defined | Volatility multiplier for scenario analysis |

#### 2.3.2 Random Number Generation

The implementation uses a **seeded pseudo-random number generator** for reproducibility:

```javascript
// Seeded random for reproducible Monte Carlo
const sRand = s => {
  const x = Math.sin(s + 1) * 10000;
  return x - Math.floor(x);
};
```

This deterministic approach allows users to regenerate identical simulation results by using the same seed value.

#### 2.3.3 Box-Muller Transform

Standard normal variates are generated using the **Box-Muller transform**, which converts uniform random variables to normally distributed ones:

```
Z = sqrt(-2 * ln(U1)) * cos(2 * pi * U2)
```

Where `U1, U2 ~ Uniform(0,1)`.

Implementation:

```javascript
// Box-Muller for normal distribution
const nRand = s => {
  const u = Math.max(0.0001, sRand(s));
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * sRand(s + 0.5));
};
```

The `Math.max(0.0001, ...)` guard prevents numerical instability from `log(0)`.

### 2.4 Path Generation Algorithm

The core simulation loop generates `N = 5,000` independent price paths:

```javascript
for (let i = 0; i < N; i++) {
  let p = spot;
  for (let d = 1; d <= maxD; d++) {
    p *= Math.exp(
      (drift - 0.5 * v * v) * dt +
      v * Math.sqrt(dt) * nRand(simSeed + i * maxD + d)
    );
  }
}
```

For visualization efficiency, only the first 50 paths are stored in full detail; all 5,000 terminal values are retained for statistical analysis.

### 2.5 Percentile Band Calculation

The simulation output includes confidence bands at the 5th, 50th, and 95th percentiles:

```javascript
const pctData = [];
for (let d = 0; d <= maxD; d += 5) {
  const ps = paths.map(x => x[Math.floor(d / 5)]?.p || spot).sort((a, b) => a - b);
  pctData.push({
    d,
    p5: ps[Math.floor(ps.length * 0.05)],   // 5th percentile (bearish)
    p50: ps[Math.floor(ps.length * 0.5)],   // 50th percentile (median)
    p95: ps[Math.floor(ps.length * 0.95)]   // 95th percentile (bullish)
  });
}
```

These bands provide a **90% confidence interval** for future price levels, with:
- **P5**: Lower bound (5% probability of falling below)
- **P50**: Median expectation
- **P95**: Upper bound (5% probability of exceeding)

### 2.6 Target Probability Estimation

For each user-defined price target, the Monte Carlo simulation estimates the probability of reaching that level:

```javascript
mc: f.filter(x => x >= tgt).length / f.length
```

This represents the **empirical probability** based on the proportion of simulated paths that exceed the target price at the specified horizon.

---

## 3. Black-Scholes Probability Model

### 3.1 Theoretical Background

The Black-Scholes model, developed by Fischer Black and Myron Scholes (1973), provides an analytical framework for option pricing under the assumption of log-normal asset returns. While the full model prices options, the terminal presents a probability-focused derivative: the **probability of finishing above a strike price**.

### 3.2 Mathematical Derivation

Under the risk-neutral measure, the probability that an asset `S` finishes above strike `K` at time `T` is given by `N(d2)`, where:

```
d2 = (ln(S/K) + (r - 0.5 * sigma^2) * T) / (sigma * sqrt(T))
```

Where:
- `S` = Current spot price
- `K` = Strike (target) price
- `r` = Risk-free interest rate
- `sigma` = Annualized volatility
- `T` = Time to expiration (in years)
- `N(.)` = Standard normal cumulative distribution function

### 3.3 Risk-Free Rate Assumption

The implementation uses a **risk-free rate of 4.5% (r = 0.045)**, reflecting approximate US Treasury yields. This rate appears in:

```javascript
bs: bsProb(spot, tgt, 0.045, v, horizons[i] / 365)
```

### 3.4 Implementation

```javascript
// Black-Scholes probability of finishing above strike
const bsProb = (S, K, r, v, T) => {
  if (T <= 0) return S > K ? 1 : 0;
  const d2 = (Math.log(S / K) + (r - 0.5 * v * v) * T) / (v * Math.sqrt(T));
  return nCDF(d2);
};
```

Edge case handling: When `T <= 0` (at or past expiration), the function returns a deterministic `1` or `0` based on whether the spot price exceeds the strike.

### 3.5 Normal CDF Approximation

Computing the exact normal CDF requires numerical integration. The implementation uses the **Abramowitz and Stegun approximation** (Handbook of Mathematical Functions, 1964):

```javascript
// Normal CDF approximation
const nCDF = x => {
  const s = x < 0 ? -1 : 1;
  const a = Math.abs(x) / 1.414;  // sqrt(2)
  const t = 1 / (1 + 0.3275911 * a);
  return 0.5 * (1 + s * (1 - ((((1.061405429 * t - 1.453152027) * t +
         1.421413741) * t - 0.284496736) * t + 0.254829592) * t *
         Math.exp(-a * a)));
};
```

This polynomial approximation achieves accuracy to approximately 7 decimal places, sufficient for financial applications.

### 3.6 Monte Carlo vs. Black-Scholes Comparison

The system calculates both Monte Carlo (`mc`) and Black-Scholes (`bs`) probabilities, allowing users to compare:

| Method | Advantages | Limitations |
|--------|------------|-------------|
| Monte Carlo | Path-dependent, handles complex payoffs | Computationally intensive |
| Black-Scholes | Analytical, fast computation | Assumes constant volatility, log-normal returns |

Convergence between the two methods validates the simulation implementation and parameter calibration.

---

## 4. Fibonacci Extension Analysis

### 4.1 Theoretical Basis

Fibonacci extensions are technical analysis tools derived from the **Fibonacci sequence**, where each number is the sum of the two preceding ones (1, 1, 2, 3, 5, 8, 13, ...). The ratios between consecutive Fibonacci numbers converge to the **golden ratio** (approximately 1.618).

These ratios are hypothesized to represent natural support and resistance levels in financial markets, based on behavioral finance theories about crowd psychology and self-fulfilling prophecy effects.

### 4.2 Extension Levels

The implementation calculates the following Fibonacci extension levels:

| Level | Ratio | Description |
|-------|-------|-------------|
| Fib 23.6% | 0.236 | Shallow retracement |
| Fib 38.2% | 0.382 | Moderate retracement |
| Fib 50.0% | 0.500 | Half-range extension |
| Fib 61.8% | 0.618 | Golden ratio retracement |
| Fib 78.6% | 0.786 | Deep retracement (sqrt of 0.618) |
| Fib 100% | 1.000 | Full range extension |
| Fib 127.2% | 1.272 | sqrt(1.618) extension |
| Fib 161.8% | 1.618 | Golden ratio extension |

### 4.3 Calculation Method

Extensions are computed using the **52-week high/low range** projected from the current spot price:

```javascript
// Fibonacci extensions calculator
const calcFibTargets = (spot, low52, high52) => {
  const range = high52 - low52;
  return {
    fib236: spot + range * 0.236,
    fib382: spot + range * 0.382,
    fib500: spot + range * 0.5,
    fib618: spot + range * 0.618,
    fib786: spot + range * 0.786,
    fib100: spot + range * 1.0,
    fib1272: spot + range * 1.272,
    fib1618: spot + range * 1.618,
  };
};
```

### 4.4 Mathematical Formulation

For each extension level `L`:

```
Target_L = Spot + (High_52 - Low_52) * L
```

This approach assumes the historical range provides a meaningful baseline for future price movements, scaled by Fibonacci ratios.

---

## 5. Sharpe Ratio

### 5.1 Definition

The **Sharpe Ratio** is a measure of risk-adjusted return, developed by William F. Sharpe (1966). It quantifies the excess return per unit of risk:

```
Sharpe Ratio = (R_p - R_f) / sigma_p
```

Where:
- `R_p` = Portfolio return
- `R_f` = Risk-free rate
- `sigma_p` = Standard deviation of portfolio returns

### 5.2 Interpretation

| Sharpe Ratio | Interpretation |
|--------------|----------------|
| < 1.0 | Suboptimal risk-adjusted returns |
| 1.0 - 2.0 | Good risk-adjusted returns |
| 2.0 - 3.0 | Very good risk-adjusted returns |
| > 3.0 | Excellent (potentially unsustainable) |

### 5.3 Implementation Status

**Note**: The Sharpe Ratio is planned for future implementation. The existing Monte Carlo framework provides the necessary statistical infrastructure:

- **Expected Return**: Mean of terminal values across simulations
- **Volatility**: Standard deviation of simulated returns
- **Risk-Free Rate**: Already defined (4.5%)

Future implementation will calculate ex-ante Sharpe Ratios for:
- Individual asset positions
- Portfolio combinations
- Strategy comparisons across prediction markets

---

## 6. Data Sources and Integration

### 6.1 Architecture Overview

The platform aggregates data from multiple sources through a unified API layer, enabling real-time price updates and historical data retrieval.

```
+-------------------+     +-------------------+     +-------------------+
|   CoinGecko API   |     |  Yahoo Finance    |     |  Polymarket API   |
|   (Crypto)        |     |  (Commodities/    |     |  (Predictions)    |
|                   |     |   Stocks)         |     |                   |
+--------+----------+     +--------+----------+     +--------+----------+
         |                         |                         |
         v                         v                         v
+------------------------------------------------------------------------+
|                         API Aggregation Layer                          |
|                    (Vercel Serverless Functions)                       |
+------------------------------------------------------------------------+
                                   |
                                   v
+------------------------------------------------------------------------+
|                       Monte Carlo Engine                               |
|                         (math.js)                                      |
+------------------------------------------------------------------------+
                                   |
                                   v
+------------------------------------------------------------------------+
|                    React Frontend Dashboard                            |
+------------------------------------------------------------------------+
```

### 6.2 CoinGecko API (Cryptocurrency)

**Endpoint**: `https://api.coingecko.com/api/v3`

**Supported Assets**:
| Asset Key | CoinGecko ID |
|-----------|--------------|
| `btc` | `bitcoin` |
| `eth` | `ethereum` |

**Data Retrieved**:
- Current USD price
- 24-hour percentage change

**Update Frequency**: Every 5 seconds

**Request Format**:
```
GET /simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true
```

### 6.3 Yahoo Finance API (Commodities and Equities)

**Endpoint**: `https://query1.finance.yahoo.com/v8/finance/chart/`

**Supported Commodities**:
| Asset Key | Yahoo Symbol | Description |
|-----------|--------------|-------------|
| `gold` | `GC=F` | Gold Futures |
| `silver` | `SI=F` | Silver Futures |
| `platinum` | `PL=F` | Platinum Futures |
| `palladium` | `PA=F` | Palladium Futures |
| `copper` | `HG=F` | Copper Futures |
| `oil` | `CL=F` | WTI Crude Oil Futures |
| `natgas` | `NG=F` | Natural Gas Futures |

**Supported Indices**:
| Asset Key | Yahoo Symbol | Description |
|-----------|--------------|-------------|
| `nas100` | `^NDX` | NASDAQ-100 |
| `us500` | `^GSPC` | S&P 500 |
| `us30` | `^DJI` | Dow Jones Industrial Average |
| `dxy` | `DX-Y.NYB` | US Dollar Index |

**Equity Data**:
- Default symbols: AAPL, GOOGL, NVDA, TSLA, COST, JPM, PLTR, HOOD
- Quote endpoint: `/v7/finance/quote`
- Historical endpoint: `/v8/finance/chart`

**Data Retrieved**:
- Regular market price
- Price change (absolute and percentage)
- 52-week high and low
- Volume and market cap (equities)

**Update Frequency**:
- Commodities/Indices: Every 5 seconds
- Stocks: Every 60 seconds

### 6.4 Polymarket API (Prediction Markets)

**Endpoint**: `/api/markets` (proxied)

**Data Retrieved**:
- Market question and description
- Category classification
- Outcome prices and probabilities
- 24-hour volume and total volume
- Liquidity metrics
- Bid/ask spread

**Update Frequency**: Every 30 seconds

**Response Transformation**:
```javascript
{
  id: market.id,
  slug: market.slug,
  question: market.question,
  probability: parseFloat(JSON.parse(market.outcomePrices)[0]),
  volume24h: parseFloat(market.volume24hr),
  liquidity: parseFloat(market.liquidity),
}
```

### 6.5 Manifold Markets API

**Endpoint**: `https://api.manifold.markets/v0`

**Data Retrieved**:
- Trending markets sorted by liquidity
- Market probability
- Volume metrics
- Close time

**Update Frequency**: Every 60 seconds

**Filter Criteria**:
- `isResolved === false`
- `closeTime > Date.now()`
- Limit: 50 markets, top 20 displayed

### 6.6 Data Caching Strategy

| Source | Cache Duration | Update Interval |
|--------|----------------|-----------------|
| CoinGecko | None | 5s |
| Yahoo Finance (commodities) | 30s (server-side) | 5s (client) |
| Yahoo Finance (stocks) | 60s (server-side) | 60s (client) |
| Polymarket | None | 30s |
| Manifold | None | 60s |

---

## 7. Appendix: Mathematical Notation

### 7.1 Stochastic Differential Equation (GBM)

```
dS_t = mu * S_t * dt + sigma * S_t * dW_t
```

**Solution**:
```
S_T = S_0 * exp((mu - sigma^2/2) * T + sigma * W_T)
```

Where `W_T ~ N(0, T)`.

### 7.2 Black-Scholes d2 Term

```
d2 = [ln(S/K) + (r - sigma^2/2) * T] / [sigma * sqrt(T)]
```

### 7.3 Normal CDF (Abramowitz & Stegun Approximation)

For `x >= 0`:
```
N(x) = 1 - (1/sqrt(2*pi)) * exp(-x^2/2) * (a1*t + a2*t^2 + a3*t^3 + a4*t^4 + a5*t^5)
```

Where `t = 1/(1 + p*x)` with `p = 0.3275911`.

Coefficients:
- `a1 = 0.254829592`
- `a2 = -0.284496736`
- `a3 = 1.421413741`
- `a4 = -1.453152027`
- `a5 = 1.061405429`

### 7.4 Fibonacci Ratios

Derived from the limit:
```
phi = lim(n->inf) F(n+1)/F(n) = (1 + sqrt(5))/2 = 1.6180339887...
```

Key ratios:
- `1/phi = 0.618...`
- `1/phi^2 = 0.382...`
- `sqrt(phi) = 1.272...`

---

## References

1. Black, F., & Scholes, M. (1973). The Pricing of Options and Corporate Liabilities. *Journal of Political Economy*, 81(3), 637-654.

2. Sharpe, W. F. (1966). Mutual Fund Performance. *Journal of Business*, 39(1), 119-138.

3. Abramowitz, M., & Stegun, I. A. (1964). *Handbook of Mathematical Functions with Formulas, Graphs, and Mathematical Tables*. National Bureau of Standards.

4. Hull, J. C. (2018). *Options, Futures, and Other Derivatives* (10th ed.). Pearson.

5. Glasserman, P. (2003). *Monte Carlo Methods in Financial Engineering*. Springer.

---

**Disclaimer**: This software is for educational and research purposes only. It does not constitute financial advice. Past performance and simulated results do not guarantee future returns. Users should conduct their own due diligence before making any investment decisions.

---

*Document generated for Polymarket Terminal v1.0*
