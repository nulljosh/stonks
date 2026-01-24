# Bread Trading Strategy: Simulator → Reality

**Goal:** Turn momentum algorithm into profitable automated trading system

**Realistic Target:** $100 → $1,000 over 6-12 months (10x return = 900% annual)

---

## Phase 1: Backtest (Prove It Works) - 1 Week

### Objective
Replay historical data through simulator to measure real-world performance.

### Implementation
```javascript
// api/backtest.js
export async function backtest(symbol, startDate, endDate) {
  // 1. Download 1-min candles from Yahoo Finance
  const candles = await fetchHistoricalData(symbol, '1m', startDate, endDate);

  // 2. Replay through simulator logic
  let balance = 100;
  let trades = [];

  for (let i = 10; i < candles.length; i++) {
    const current = candles[i].close;
    const avg = candles.slice(i-10, i).reduce((a,b) => a + b.close, 0) / 10;
    const strength = (current - avg) / avg;

    if (strength > 0.010) { // 1.0% momentum threshold
      // Calculate position with dynamic sizing
      const positionSize = balance * getPositionSize(balance);
      const entry = current;
      const stopLoss = entry * 0.982;
      const takeProfit = entry * 1.042;

      // Fast-forward to exit
      const exit = findExit(candles, i, stopLoss, takeProfit);
      const pnl = (exit.price - entry) * positionSize / entry;

      balance += pnl;
      trades.push({ symbol, entry, exit: exit.price, pnl, date: candles[i].date });
    }
  }

  return {
    finalBalance: balance,
    trades,
    winRate: trades.filter(t => t.pnl > 0).length / trades.length,
    sharpeRatio: calculateSharpe(trades),
    maxDrawdown: calculateMaxDrawdown(trades)
  };
}
```

### Success Criteria
- **Win Rate:** >55% (anything lower = strategy doesn't work)
- **Sharpe Ratio:** >1.5 (risk-adjusted returns)
- **Max Drawdown:** <30% (avoid blowing up)

### Data Sources
- Yahoo Finance API (free, 1-min candles)
- Binance API (crypto, millisecond precision)
- Alpha Vantage (stocks, intraday)

### Test Period
- 2025 full year (252 trading days)
- Multiple market conditions (bull, bear, sideways)
- 10+ symbols (TSLA, NVDA, BTC, ETH, etc.)

---

## Phase 2: Live Data Integration - 3 Days

### Objective
Replace simulator random walks with real-time market data.

### Implementation
```javascript
// src/App.jsx - Replace price generation
useEffect(() => {
  if (!running) return;

  const interval = setInterval(async () => {
    // OLD: const newPrice = last * (1 + randomMove)

    // NEW: Fetch live prices
    const livePrices = await fetch('/api/live-prices').then(r => r.json());

    setPrices(prev => {
      const next = {};
      SYMS.forEach(sym => {
        next[sym] = [...prev[sym].slice(-29), livePrices[sym]];
      });
      return next;
    });

    setTick(t => t + 1);
  }, 50); // Still 50ms ticks

  return () => clearInterval(interval);
}, [running]);
```

### API Setup
```javascript
// api/live-prices.js
export default async function handler(req, res) {
  const prices = {};

  // Crypto (CoinGecko)
  const crypto = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd');
  const cryptoData = await crypto.json();
  prices.BTC = cryptoData.bitcoin.usd;
  prices.ETH = cryptoData.ethereum.usd;

  // Stocks (Yahoo Finance via yfinance)
  const stocks = await fetch(`/api/stocks?symbols=${STOCK_SYMBOLS.join(',')}`);
  const stockData = await stocks.json();
  stockData.forEach(s => prices[s.symbol] = s.price);

  res.json(prices);
}
```

### Testing
Run simulator for 1 week with live data:
- Does it find trades?
- What's the theoretical win rate?
- Compare to backtest results

---

## Phase 3: Paper Trading - 30 Days

### Objective
Test with realistic execution (slippage, fees, latency) but fake money.

### Broker: Alpaca (Free Paper Trading)
```javascript
// api/paper-trade.js
import Alpaca from '@alpacahq/alpaca-trade-api';

const alpaca = new Alpaca({
  keyId: process.env.ALPACA_KEY,
  secretKey: process.env.ALPACA_SECRET,
  paper: true // Paper trading mode
});

export async function executeTrade(symbol, side, qty) {
  try {
    const order = await alpaca.createOrder({
      symbol,
      qty,
      side, // 'buy' or 'sell'
      type: 'market',
      time_in_force: 'gtc'
    });

    // Wait for fill (simulate latency)
    await new Promise(resolve => setTimeout(resolve, 200));

    const filled = await alpaca.getOrder(order.id);

    return {
      fillPrice: parseFloat(filled.filled_avg_price),
      slippage: Math.abs(filled.filled_avg_price - order.limit_price) / order.limit_price
    };
  } catch (err) {
    console.error('Trade failed:', err);
    return null;
  }
}
```

### Realistic Modeling
```javascript
// Add slippage, fees, latency
function calculateRealPnL(entry, exit, size) {
  const slippage = 0.0005; // 0.05% slippage
  const fees = 0.0001; // $0.01 per share (Alpaca)

  const entryPrice = entry * (1 + slippage);
  const exitPrice = exit * (1 - slippage);
  const netPnl = (exitPrice - entryPrice) * size - (fees * size * 2);

  return netPnl;
}
```

### Monitoring Dashboard
```javascript
// Real-time P&L tracking
const paperStats = {
  startBalance: 100,
  currentBalance: 143.50,
  totalTrades: 47,
  wins: 29,
  losses: 18,
  winRate: 0.617, // 61.7%
  avgWin: 5.20,
  avgLoss: -3.10,
  sharpe: 1.82,
  maxDrawdown: 0.15 // 15%
};
```

### Success Criteria
- **Win Rate:** >55% (same as backtest)
- **Sharpe Ratio:** >1.5
- **Max Drawdown:** <20%
- **No Code Crashes:** Run 30 days without intervention

---

## Phase 4: Micro Real Money - 90 Days

### Objective
Prove profitability with actual capital.

### Capital Allocation
```
Week 1-4:   $100 (learning, expect losses)
Week 5-8:   $200 (if profitable)
Week 9-12:  $500 (if still profitable)
Month 4+:   $1,000+ (scale cautiously)
```

### Risk Management
```javascript
const RISK_LIMITS = {
  maxPositionSize: 0.20, // Max 20% of capital per trade
  maxDailyLoss: 0.05, // Stop trading if down 5% in a day
  maxDrawdown: 0.25, // Emergency kill switch at 25% drawdown
  minBalance: 50 // Stop if balance < $50
};

function checkRiskLimits(balance, currentPnL, maxBalance) {
  const drawdown = (maxBalance - balance) / maxBalance;

  if (balance < RISK_LIMITS.minBalance) {
    console.error('BUST: Balance below minimum');
    return 'STOP';
  }

  if (drawdown > RISK_LIMITS.maxDrawdown) {
    console.error('DRAWDOWN LIMIT: Emergency stop');
    return 'STOP';
  }

  if (currentPnL < -balance * RISK_LIMITS.maxDailyLoss) {
    console.error('DAILY LOSS LIMIT: Pausing until tomorrow');
    return 'PAUSE';
  }

  return 'OK';
}
```

### Broker Setup
**Alpaca** (Recommended)
- Minimum: $0 (but start with $100)
- Commission: Free for stocks, $0.01/share crypto
- API: REST + WebSocket
- Fractional shares: Yes

**Interactive Brokers** (Advanced)
- Minimum: $100
- Commission: $0.005/share
- API: TWS (complex but powerful)
- Fractional shares: No

### Monitoring (24/7)
```javascript
// Telegram bot for alerts
async function sendAlert(message) {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text: `🚨 Bread Bot Alert\n\n${message}`
    })
  });
}

// Example alerts
sendAlert('✅ Trade opened: TSLA @ $421.50, size $20');
sendAlert('❌ Stop loss hit: -$1.20 (-6%)');
sendAlert('🎯 Take profit: +$2.80 (+14%)');
sendAlert('⚠️ Daily loss limit reached: -$5 (-5%)');
```

---

## Phase 5: TradingView Integration - Ongoing

### Objective
Combine Bread momentum algo with TradingView charting for manual confirmation.

### Webhook Setup
```javascript
// api/tradingview-webhook.js
export default async function handler(req, res) {
  const { symbol, action, price, strategy } = req.body;

  // Verify webhook signature
  if (!verifySignature(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Execute trade via Alpaca
  if (action === 'buy') {
    const balance = await getBalance();
    const size = calculatePositionSize(balance, price);

    await executeTrade(symbol, 'buy', size);

    res.json({ success: true, message: `Bought ${size} shares of ${symbol}` });
  }
}
```

### TradingView Alert
```
Strategy: Bread Momentum v1.2
Condition: Close > SMA(10) * 1.01
Message:
{
  "symbol": "{{ticker}}",
  "action": "buy",
  "price": {{close}},
  "strategy": "momentum_1pct"
}
```

### Webhook URL
`https://bread-m0zrli7pf-nulljosh-9577s-projects.vercel.app/api/tradingview-webhook`

---

## Phase 6: Raspberry Pi Deployment - Future

### Hardware
- Raspberry Pi 5 (8GB) - $60
- 128x64 OLED display - $15
- Case + cooling - $20
- Total: $95

### Software Stack
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install nodejs

# Clone Bread repo
git clone https://github.com/nulljosh/bread
cd bread
npm install

# Install PM2 (process manager)
npm install -g pm2

# Start bot
pm2 start npm --name bread -- run trade
pm2 save
pm2 startup
```

### OLED Display Code
```javascript
// pi/display.js
import i2c from 'i2c-bus';
import Oled from 'oled-i2c-bus';

const opts = {
  width: 128,
  height: 64,
  address: 0x3C
};

const oled = new Oled(i2c.openSync(1), opts);
oled.clearDisplay();

function updateDisplay(stats) {
  oled.clearDisplay();
  oled.setCursor(0, 0);
  oled.writeString('BREAD BOT v1.2', 1, true);
  oled.setCursor(0, 12);
  oled.writeString(`Balance: $${stats.balance.toFixed(2)}`, 1, false);
  oled.setCursor(0, 24);
  oled.writeString(`P&L: ${stats.pnl > 0 ? '+' : ''}$${stats.pnl.toFixed(2)}`, 1, false);
  oled.setCursor(0, 36);
  oled.writeString(`Win Rate: ${(stats.winRate * 100).toFixed(0)}%`, 1, false);
  oled.setCursor(0, 48);
  oled.writeString(`Position: ${stats.position || 'NONE'}`, 1, false);
}

// Update every second
setInterval(() => {
  const stats = getStats();
  updateDisplay(stats);
}, 1000);
```

### Monitoring
```bash
# SSH into Pi
ssh pi@raspberrypi.local

# Check bot status
pm2 status

# View logs
pm2 logs bread

# Restart if needed
pm2 restart bread
```

---

## The Math: Can We Really Make Money?

### Scenario 1: Conservative (Realistic)
```
Starting Capital: $100
Win Rate: 55%
Avg Win: +4.2%
Avg Loss: -1.8%
Trades per Week: 10

Expected Value per Trade:
EV = (0.55 × 4.2%) + (0.45 × -1.8%) = 2.31% - 0.81% = 1.5%

Weekly Return: 10 trades × 1.5% = 15%
Monthly Return: 60% (compounded)
Annual Return: ~1,200% ($100 → $1,300 in 1 year)
```

### Scenario 2: Optimistic (Best Case)
```
Starting Capital: $100
Win Rate: 65%
Avg Win: +4.5%
Avg Loss: -1.5%
Trades per Week: 15

Expected Value per Trade:
EV = (0.65 × 4.5%) + (0.35 × -1.5%) = 2.93% - 0.53% = 2.4%

Weekly Return: 15 trades × 2.4% = 36%
Monthly Return: ~150%
Annual Return: ~10,000% ($100 → $10,000 in 1 year)
```

### Scenario 3: Reality Check (What Actually Happens)
```
Starting Capital: $100
Win Rate: 52% (slightly better than random)
Avg Win: +3.8%
Avg Loss: -2.2%
Trades per Week: 8
Slippage/Fees: -0.5% per round trip

Expected Value per Trade:
EV = (0.52 × 3.8%) + (0.48 × -2.2%) - 0.5% = 1.98% - 1.06% - 0.5% = 0.42%

Weekly Return: 8 trades × 0.42% = 3.4%
Monthly Return: 14%
Annual Return: ~400% ($100 → $500 in 1 year)
```

**Realistic Target:** $100 → $500 first year (400% return)

If you can do that consistently, scale to $1,000 → $5,000 next year.

---

## Risk Mitigation

### Position Sizing (Kelly Criterion)
```javascript
// Optimal bet size to maximize long-term growth
function kellySize(winRate, avgWin, avgLoss) {
  const p = winRate;
  const b = avgWin / Math.abs(avgLoss); // Win/loss ratio

  const kelly = (p * b - (1 - p)) / b;

  // Use fractional Kelly (25% of optimal) to reduce risk
  return kelly * 0.25;
}

// Example:
// Win rate: 55%, Avg win: 4.2%, Avg loss: 1.8%
// b = 4.2 / 1.8 = 2.33
// kelly = (0.55 * 2.33 - 0.45) / 2.33 = 0.35 (35% of capital)
// Fractional: 0.35 * 0.25 = 8.75% per trade (safe)
```

### Stop Loss Evolution
```javascript
// Tighten stops as balance grows
function getStopLoss(balance, entryPrice) {
  if (balance < 200) return entryPrice * 0.982; // 1.8% SL
  if (balance < 1000) return entryPrice * 0.985; // 1.5% SL
  if (balance < 5000) return entryPrice * 0.988; // 1.2% SL
  return entryPrice * 0.990; // 1.0% SL (capital preservation mode)
}
```

### Circuit Breakers
```javascript
const CIRCUIT_BREAKERS = {
  maxConsecutiveLosses: 3, // Stop after 3 losses in a row
  maxDailyTrades: 20, // Prevent overtrading
  minTimeBetweenTrades: 300000, // 5 minutes (prevent revenge trading)
};

function shouldTrade(history) {
  const recentLosses = history.slice(-3).filter(t => t.pnl < 0).length;
  if (recentLosses >= 3) {
    console.log('Circuit breaker: 3 consecutive losses');
    return false;
  }

  const todayTrades = history.filter(t => isToday(t.date)).length;
  if (todayTrades >= 20) {
    console.log('Circuit breaker: Daily trade limit');
    return false;
  }

  const lastTrade = history[history.length - 1];
  if (Date.now() - lastTrade.timestamp < 300000) {
    console.log('Circuit breaker: Too soon since last trade');
    return false;
  }

  return true;
}
```

---

## Why This Could Actually Work

### Edge #1: Speed
- Most retail traders react to price moves in seconds/minutes
- Bread reacts in 50ms (milliseconds)
- HFT firms are faster (microseconds) but trade different strategies

### Edge #2: 24/7 Uptime
- Human traders sleep, get distracted
- Bread runs 24/7 on Pi, never misses opportunities
- Crypto markets never close

### Edge #3: Emotional Discipline
- Humans revenge trade, overtrade, panic sell
- Bread follows rules 100% consistently
- No fear, no greed, just math

### Edge #4: Small Capital
- Can trade illiquid memecoins (BONK, WIF) without moving market
- $100 positions don't trigger institutional radar
- Slippage negligible on small size

### Edge #5: Momentum Works (Sometimes)
- Bull markets: Momentum prints (2024 crypto rally)
- Bear markets: Momentum fails (2022 crash)
- Key: Know when to turn it off

---

## Why This Could Fail

### Risk #1: Overfitting
- Works on past data, fails on new data
- 2025 ≠ 2026 market conditions
- Mitigation: Test on out-of-sample data

### Risk #2: Regime Change
- Bull → Bear: Momentum gets crushed
- Low Vol → High Vol: Stops get hit constantly
- Mitigation: Adaptive thresholds based on VIX

### Risk #3: Fees/Slippage Eat Profits
- $0.01/share × 100 shares = $1 fee
- On $100 position, that's 1% gone
- Need >2% edge just to break even
- Mitigation: Trade higher priced stocks (less fee %)

### Risk #4: API Downtime
- Broker API goes down during critical trade
- Data feed lags, executes at wrong price
- Mitigation: Multiple data sources, circuit breakers

### Risk #5: Black Swan Events
- Flash crash wipes account before stop loss executes
- Exchange halts trading, can't exit
- Mitigation: Never risk more than you can afford to lose

---

## Action Plan (Next 90 Days)

### Week 1-2: Backtest
- [ ] Download 1yr historical data (10 symbols)
- [ ] Implement backtest function
- [ ] Run simulations, measure win rate
- [ ] Decision: If <55%, pivot strategy

### Week 3: Live Data Integration
- [ ] Replace random walks with live prices
- [ ] Test with CoinGecko + Yahoo Finance
- [ ] Monitor for 1 week theoretical performance

### Week 4-8: Paper Trading
- [ ] Open Alpaca paper account
- [ ] Integrate API, execute fake trades
- [ ] Run 30 days, measure:
  - Win rate
  - Sharpe ratio
  - Max drawdown
- [ ] Decision: If unprofitable, stop here

### Week 9-12: Micro Real Money ($100)
- [ ] Fund Alpaca account with $100
- [ ] Start trading (max $20/position)
- [ ] Monitor daily, tweak parameters
- [ ] Goal: End with >$120 (20% gain)

### Month 4+: Scale or Pivot
- If profitable: Add $200, continue
- If losing: Stop, analyze why
- If breakeven: Need bigger edge (add features)

---

## Conclusion

**Can we turn $1 → $1B?** No.

**Can we turn $100 → $1,000?** Maybe (if everything goes right).

**Can we print thousands?** Yes, if:
1. Backtest shows >55% win rate
2. Paper trading confirms profitability
3. Real money test doesn't blow up
4. Market conditions favorable (bull market)
5. Discipline maintained (no revenge trading)

**Expected Outcome:**
- 70% chance: Lose some money, learn a lot
- 20% chance: Break even, gain experience
- 10% chance: Make consistent profit (15-25% annual)

**But:** Even 10% chance at asymmetric upside (5x return) is worth pursuing with small capital.

If Fed keeps printing, assets go up. Bread rides the wave. 🌊

---

**Next Step:** Phase 1 Backtest. Let's prove the math.
