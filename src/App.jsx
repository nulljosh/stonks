import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { usePolymarket, MARKET_CATEGORIES } from './hooks/usePolymarket';
import { useLivePrices, formatLastUpdated } from './hooks/useLivePrices';
import { useStocks } from './hooks/useStocks';
import { formatPrice } from './utils/math';
import { getTheme } from './utils/theme';
import { defaultAssets } from './utils/assets';
import WeatherWidget from './components/WeatherWidget';
import Ticker from './components/Ticker';

// Trading Simulator Assets (US50 + Indices + Crypto)
// Prices updated: Jan 22, 2026
const ASSETS = {
  // Indices
  NAS100: { name: 'Nasdaq 100', price: 22950, color: '#00d4ff' },
  SP500: { name: 'S&P 500', price: 6920, color: '#ff6b6b' },
  US30: { name: 'Dow Jones', price: 48780, color: '#4ecdc4' },
  XAU: { name: 'Gold', price: 4890, color: '#FFD700' },
  XAG: { name: 'Silver', price: 94, color: '#A0A0A0' },
  // US50 - Top 50 by market cap
  AAPL: { name: 'Apple', price: 247, color: '#555' },
  MSFT: { name: 'Microsoft', price: 454, color: '#00A2ED' },
  GOOGL: { name: 'Google', price: 323, color: '#4285F4' },
  AMZN: { name: 'Amazon', price: 220, color: '#FF9900' },
  NVDA: { name: 'Nvidia', price: 185, color: '#76B900' },
  META: { name: 'Meta', price: 595, color: '#0668E1' },
  TSLA: { name: 'Tesla', price: 421, color: '#CC0000' },
  BRK: { name: 'Berkshire', price: 465, color: '#004080' },
  LLY: { name: 'Eli Lilly', price: 785, color: '#DC143C' },
  V: { name: 'Visa', price: 305, color: '#1A1F71' },
  UNH: { name: 'UnitedHealth', price: 520, color: '#002677' },
  XOM: { name: 'Exxon', price: 115, color: '#FF0000' },
  JPM: { name: 'JPMorgan', price: 245, color: '#117ACA' },
  WMT: { name: 'Walmart', price: 95, color: '#0071CE' },
  JNJ: { name: 'J&J', price: 155, color: '#D32F2F' },
  MA: { name: 'Mastercard', price: 535, color: '#EB001B' },
  PG: { name: 'P&G', price: 170, color: '#003DA5' },
  AVGO: { name: 'Broadcom', price: 230, color: '#E60000' },
  HD: { name: 'Home Depot', price: 420, color: '#F96302' },
  CVX: { name: 'Chevron', price: 165, color: '#0033A0' },
  MRK: { name: 'Merck', price: 98, color: '#0033A0' },
  COST: { name: 'Costco', price: 1020, color: '#0066B2' },
  ABBV: { name: 'AbbVie', price: 195, color: '#071D49' },
  KO: { name: 'Coca-Cola', price: 63, color: '#F40009' },
  PEP: { name: 'PepsiCo', price: 155, color: '#004B93' },
  AMD: { name: 'AMD', price: 135, color: '#ED1C24' },
  ADBE: { name: 'Adobe', price: 465, color: '#FF0000' },
  CRM: { name: 'Salesforce', price: 340, color: '#00A1E0' },
  NFLX: { name: 'Netflix', price: 895, color: '#E50914' },
  CSCO: { name: 'Cisco', price: 58, color: '#049FD9' },
  TMO: { name: 'Thermo Fisher', price: 520, color: '#00457C' },
  ORCL: { name: 'Oracle', price: 185, color: '#C74634' },
  ACN: { name: 'Accenture', price: 385, color: '#A100FF' },
  INTC: { name: 'Intel', price: 20, color: '#0071C5' },
  NKE: { name: 'Nike', price: 72, color: '#000000' },
  TXN: { name: 'Texas Instruments', price: 205, color: '#8B0000' },
  QCOM: { name: 'Qualcomm', price: 155, color: '#3253DC' },
  PM: { name: 'Philip Morris', price: 140, color: '#003DA5' },
  DHR: { name: 'Danaher', price: 245, color: '#005EB8' },
  INTU: { name: 'Intuit', price: 695, color: '#393A56' },
  UNP: { name: 'Union Pacific', price: 235, color: '#004098' },
  RTX: { name: 'Raytheon', price: 115, color: '#00205B' },
  HON: { name: 'Honeywell', price: 225, color: '#DC1E35' },
  SPGI: { name: 'S&P Global', price: 520, color: '#FF8200' },
  // Popular stocks
  COIN: { name: 'Coinbase', price: 265, color: '#0052FF' },
  PLTR: { name: 'Palantir', price: 71, color: '#9d4edd' },
  HOOD: { name: 'Robinhood', price: 38, color: '#00C805' },
  // Meme coins
  FARTCOIN: { name: 'FartCoin', price: 0.85, color: '#8B4513' },
  WIF: { name: 'dogwifhat', price: 1.92, color: '#FF69B4' },
  BONK: { name: 'Bonk', price: 0.00002, color: '#FFA500' },
  PEPE: { name: 'Pepe', price: 0.000012, color: '#00FF00' },
  DOGE: { name: 'Dogecoin', price: 0.31, color: '#C2A633' },
  SHIB: { name: 'Shiba Inu', price: 0.000021, color: '#FFA500' },
};
const SYMS = Object.keys(ASSETS);

// Keyword mappings for category filters
const categoryKeywords = {
  politics: ['trump', 'biden', 'election', 'president', 'congress', 'senate', 'republican', 'democrat', 'vote', 'governor', 'political', 'white house', 'supreme court', 'legislation', 'poll'],
  crypto: ['bitcoin', 'btc', 'ethereum', 'eth', 'crypto', 'token', 'blockchain', 'solana', 'xrp', 'dogecoin', 'altcoin', 'defi', 'nft'],
  sports: ['nfl', 'nba', 'mlb', 'nhl', 'soccer', 'football', 'basketball', 'baseball', 'hockey', 'super bowl', 'championship', 'playoffs', 'world cup', 'olympics', 'ufc', 'boxing', 'tennis', 'golf'],
  finance: ['stock', 'market', 'fed', 'interest rate', 'inflation', 'gdp', 'recession', 'earnings', 's&p', 'nasdaq', 'dow', 'treasury', 'bond', 'ipo', 'merger'],
  culture: ['oscar', 'grammy', 'emmy', 'movie', 'film', 'music', 'celebrity', 'award', 'netflix', 'spotify', 'tiktok', 'twitter', 'elon', 'kanye', 'taylor swift'],
};

// Bloomberg-style blinking indicators
const BlinkingDot = ({ color, delay = 0, speed = 2 }) => (
  <span style={{
    display: 'inline-block',
    width: 6,
    height: 6,
    borderRadius: '50%',
    backgroundColor: color,
    animation: `blink ${speed}s ease-in-out ${delay}s infinite`,
    boxShadow: `0 0 4px ${color}`,
  }} />
);

const StatusBar = ({ t }) => (
  <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 10 }}>
    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <BlinkingDot color={t.green} delay={0} speed={3} />
      <span style={{ color: t.textTertiary }}>LIVE</span>
    </span>
    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <BlinkingDot color={t.cyan} delay={0.5} speed={4} />
      <span style={{ color: t.textTertiary }}>API</span>
    </span>
    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <BlinkingDot color={t.yellow} delay={1} speed={5} />
      <span style={{ color: t.textTertiary }}>MC</span>
    </span>
  </div>
);

// Inject keyframes
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }
  @keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.1); opacity: 0.8; }
  }
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  @keyframes scroll {
    0% { transform: translate3d(0, 0, 0); }
    100% { transform: translate3d(-50%, 0, 0); }
  }
  * {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
`;
if (!document.head.querySelector('#bloomberg-animations')) {
  styleSheet.id = 'bloomberg-animations';
  document.head.appendChild(styleSheet);
}

const tldr = (question, maxLen = 50) => {
  if (!question || question.length <= maxLen) return question;
  const truncated = question.slice(0, maxLen);
  const lastSpace = truncated.lastIndexOf(' ');
  return (lastSpace > 20 ? truncated.slice(0, lastSpace) : truncated) + '...';
};

const Card = ({ children, style, onClick, dark, t }) => (
  <div onClick={onClick} style={{
    background: t.glass,
    backdropFilter: 'blur(40px) saturate(180%)',
    WebkitBackdropFilter: 'blur(40px) saturate(180%)',
    borderRadius: 20,
    border: `0.5px solid ${t.border}`,
    boxShadow: dark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 32px rgba(0,0,0,0.08)',
    cursor: onClick ? 'pointer' : 'default',
    overflow: 'hidden',
    transition: 'all 0.2s ease',
    ...style
  }}>{children}</div>
);

export default function App() {
  const [dark, setDark] = useState(true);
  const t = getTheme(dark);
  const font = '-apple-system, BlinkMacSystemFont, system-ui, sans-serif';

  // Fibonacci levels from $1 to $1B
  const FIB_LEVELS = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000, 200000, 500000, 1000000, 2000000, 5000000, 10000000, 20000000, 50000000, 100000000, 200000000, 500000000, 1000000000];

  // Trading Simulator State
  const [balance, setBalance] = useState(1);
  const [position, setPosition] = useState(null);
  const [prices, setPrices] = useState(() => Object.fromEntries(SYMS.map(s => [s, [ASSETS[s].price]])));
  const [trades, setTrades] = useState([]);
  const [running, setRunning] = useState(false);
  const [tick, setTick] = useState(0);
  const [showTrades, setShowTrades] = useState(false);
  const [lastTraded, setLastTraded] = useState(null);
  const [perfMode, setPerfMode] = useState(true);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [targetTrillion, setTargetTrillion] = useState(false);
  const trends = useRef(Object.fromEntries(SYMS.map(s => [s, 0])));
  const [tradeStats, setTradeStats] = useState({ wins: {}, losses: {} });

  // Prediction Market State
  const [asset, setAsset] = useState('silver');
  const [scenario, setScenario] = useState('base');
  const [sel, setSel] = useState(0);
  const [simSeed, setSimSeed] = useState(42);
  const [showMacro, setShowMacro] = useState(false);
  const [pmCategory, setPmCategory] = useState('all');
  const [showHighProb, setShowHighProb] = useState(false);
  const [hoveredMarket, setHoveredMarket] = useState(null);
  const [tappedMarket, setTappedMarket] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const { prices: liveAssets, lastUpdated } = useLivePrices(defaultAssets);
  const { markets, loading: pmLoading, error: pmError, refetch: refetchPm } = usePolymarket();
  const { stocks, error: stocksError } = useStocks();

  // Trading Simulator Logic
  useEffect(() => {
    const target = targetTrillion ? 1000000000000 : 1000000000;
    if (!running || balance <= 0.5 || balance >= target) return;

    const iv = setInterval(() => {
      try {
        setPrices(prev => {
          const next = {};
          SYMS.forEach(sym => {
            try {
              if (Math.random() < 0.05) trends.current[sym] = (Math.random() - 0.45) * 0.008;
              const drift = 0.0001;
              const move = drift + trends.current[sym] + (Math.random() - 0.5) * 0.012;
              const last = prev[sym][prev[sym].length - 1];
              const base = ASSETS[sym].price;

              if (typeof last !== 'number' || isNaN(last)) {
                console.error('Invalid last price for', sym, last);
                next[sym] = [base];
                return;
              }

              const newPrice = Math.max(base * 0.7, Math.min(base * 1.5, last * (1 + move)));
              const priceHistory = prev[sym].length >= 30 ? prev[sym].slice(-29) : prev[sym];
              next[sym] = [...priceHistory, newPrice];
            } catch (err) {
              console.error('Price update error for', sym, err);
              next[sym] = prev[sym] || [ASSETS[sym].price];
            }
          });
          return next;
        });

        setTick(t => t + 1);
      } catch (err) {
        console.error('Simulator tick error:', err);
      }
    }, perfMode ? 50 : 25); // Ultra-fast ticks for sub-60s challenge

    return () => clearInterval(iv);
  }, [running, balance, perfMode]);

  useEffect(() => {
    if (!position || !running) return;

    const p = prices[position.sym];
    if (!p || p.length === 0) return;

    const current = p[p.length - 1];
    const pnl = (current - position.entry) * position.size;
    const pnlPct = (current - position.entry) / position.entry;

    if (current <= position.stop) {
      setBalance(b => Math.max(0.5, b + pnl));
      setTrades(t => {
        const updated = [...t, { type: 'STOP', sym: position.sym, pnl: pnl.toFixed(2) }];
        return updated.length > 100 ? updated.slice(-100) : updated;
      });
      setTradeStats(s => ({ ...s, losses: { ...s.losses, [position.sym]: (s.losses[position.sym] || 0) + pnl } }));
      setPosition(null);
      return;
    }

    if (current >= position.target) {
      const target = targetTrillion ? 1000000000000 : 1000000000;
      const newBalance = balance + pnl;

      // Cap balance at target to prevent overshooting
      const cappedBalance = Math.min(newBalance, target);
      const cappedPnl = cappedBalance - balance;

      setBalance(cappedBalance);
      setTrades(t => {
        const updated = [...t, { type: 'WIN', sym: position.sym, pnl: cappedPnl.toFixed(2) }];
        return updated.length > 100 ? updated.slice(-100) : updated;
      });
      setTradeStats(s => ({ ...s, wins: { ...s.wins, [position.sym]: (s.wins[position.sym] || 0) + cappedPnl } }));
      setPosition(null);

      // Stop immediately if we hit target
      if (cappedBalance >= target) {
        setRunning(false);
      }
      return;
    }

    if (pnlPct > 0.02) {
      setPosition(pos => ({ ...pos, stop: Math.max(pos.stop, current * 0.97) }));
    }
  }, [tick]);

  useEffect(() => {
    const target = targetTrillion ? 1000000000000 : 1000000000;
    // Stop opening new positions if we've already won
    if (!running || position || balance <= 0.5 || balance >= target) return;

    let best = null;
    SYMS.forEach(sym => {
      if (sym === lastTraded) return;

      const p = prices[sym];
      if (p.length < 10) return;

      const current = p[p.length - 1];

      const sizePercent = balance < 2 ? 0.70 : balance < 5 ? 0.50 : balance < 10 ? 0.30 : 0.15;
      const positionSize = balance * sizePercent;

      // Allow fractional shares at low balance - skip minShares check entirely at <$2
      // At higher balance, require at least 0.01 shares (prevent dust trades)
      if (balance >= 2 && positionSize / current < 0.01) return;

      const avg = p.slice(-10).reduce((a, b) => a + b, 0) / 10;
      const strength = (current - avg) / avg;

      // Aggressive thresholds for sub-60s target
      const minStrength = balance < 2 ? 0.010 : balance < 10 ? 0.011 : balance < 100 ? 0.012 : 0.014;

      if (strength > minStrength && (!best || strength > best.strength)) {
        best = { sym, price: current, strength };
      }
    });

    if (best) {
      // Progressive risk reduction: aggressive throughout for speed
      const sizePercent = balance < 2 ? 0.75 :
                         balance < 5 ? 0.55 :
                         balance < 10 ? 0.35 :
                         balance < 100 ? 0.20 :
                         balance < 1000 ? 0.15 :
                         balance < 10000 ? 0.12 :
                         balance < 100000 ? 0.08 :
                         balance < 1000000 ? 0.05 :
                         balance < 10000000 ? 0.03 : 0.02; // 2% at $10M+
      const size = balance * sizePercent;

      // Safety check: don't open position if win would exceed target
      const target = targetTrillion ? 1000000000000 : 1000000000;
      const maxWin = size * 0.045; // 4.5% max gain
      if (balance + maxWin > target * 1.1) {
        // Would overshoot target by >10%, reduce position size
        const safeSize = (target - balance) / 0.045 * 0.8; // 80% of max safe size
        if (safeSize < size * 0.5) return; // Skip if we'd need to reduce by >50%
      }

      // Minimum position check
      if (size < 0.001) return;

      try {
        setPosition({
          sym: best.sym,
          entry: best.price,
          size,
          stop: best.price * 0.982, // 1.8% stop loss (slightly wider for speed)
          target: best.price * 1.042, // 4.2% take profit (faster exits)
        });
        setLastTraded(best.sym);
        setTrades(t => {
          const updated = [...t, { type: 'BUY', sym: best.sym, price: best.price.toFixed(2) }];
          return updated.length > 100 ? updated.slice(-100) : updated;
        });
      } catch (err) {
        console.error('Position creation failed:', err);
      }
    }
  }, [tick, running, position, balance, lastTraded, prices]);

  const reset = useCallback(() => {
    setBalance(1);
    setPosition(null);
    setPrices(Object.fromEntries(SYMS.map(s => [s, [ASSETS[s].price]])));
    setTrades([]);
    setRunning(false);
    setTick(0);
    setLastTraded(null);
    setTradeStats({ wins: {}, losses: {} });
    setStartTime(null);
    setElapsedTime(0);
    trends.current = Object.fromEntries(SYMS.map(s => [s, 0]));
  }, []);

  // Timer logic
  useEffect(() => {
    if (running && !startTime) {
      setStartTime(Date.now());
    }
    if (!running && startTime) {
      setElapsedTime(Date.now() - startTime);
    }
  }, [running, startTime]);

  useEffect(() => {
    if (!running || !startTime) return;
    const timer = setInterval(() => {
      setElapsedTime(Date.now() - startTime);
    }, 500); // Update timer less frequently (was 100ms)
    return () => clearInterval(timer);
  }, [running, startTime]);

  const pnl = balance - 1;
  const currentPrice = position ? prices[position.sym][prices[position.sym].length - 1] : 0;
  const unrealized = position ? (currentPrice - position.entry) * position.size : 0;
  const equity = balance + unrealized;
  const busted = balance <= 0.5;
  const target = targetTrillion ? 1000000000000 : 1000000000;
  const won = balance >= target;

  // Calculate biggest winner/loser
  const biggestWinner = Object.entries(tradeStats.wins).sort((a, b) => b[1] - a[1])[0];
  const biggestLoser = Object.entries(tradeStats.losses).sort((a, b) => a[1] - b[1])[0];
  const exits = trades.filter(t => t.pnl);
  const wins = exits.filter(t => parseFloat(t.pnl) > 0);
  const winRate = exits.length ? (wins.length / exits.length * 100) : 0;

  const formatNumber = (num) => {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  const formatTime = (ms) => {
    const secs = Math.floor(ms / 1000);
    const mins = Math.floor(secs / 60);
    const hours = Math.floor(mins / 60);
    if (hours > 0) return `${hours}h ${mins % 60}m`;
    if (mins > 0) return `${mins}m ${secs % 60}s`;
    return `${secs}s`;
  };

  // Calculate real-world time (each tick = 5min real trading)
  const realWorldTime = (ticks) => {
    const tradingMinutes = ticks * 5; // 5min per tick
    const tradingHours = tradingMinutes / 60;
    const tradingDays = tradingHours / 6.5; // 6.5hr trading day
    const tradingWeeks = tradingDays / 5; // 5 trading days per week
    const tradingMonths = tradingDays / 21; // ~21 trading days per month
    const tradingYears = tradingDays / 252; // 252 trading days per year

    if (tradingYears >= 1) return `${tradingYears.toFixed(1)} years`;
    if (tradingMonths >= 1) return `${tradingMonths.toFixed(1)} months`;
    if (tradingWeeks >= 1) return `${tradingWeeks.toFixed(1)} weeks`;
    if (tradingDays >= 1) return `${tradingDays.toFixed(1)} days`;
    if (tradingHours >= 1) return `${tradingHours.toFixed(1)} hours`;
    return `${tradingMinutes} minutes`;
  };

  // Chart
  const W = 320, H = 120;
  const allNorm = SYMS.flatMap(s => prices[s].map(p => (p - ASSETS[s].price) / ASSETS[s].price));
  const nMin = Math.min(...allNorm, -0.02);
  const nMax = Math.max(...allNorm, 0.02);
  const toY = v => H - ((v - nMin) / (nMax - nMin || 0.01)) * H;
  const makePath = sym => {
    return prices[sym].map((p, i) => {
      const norm = (p - ASSETS[sym].price) / ASSETS[sym].price;
      return `${i ? 'L' : 'M'} ${(i / 99) * W} ${toY(norm)}`;
    }).join(' ');
  };

  // Prediction Markets Logic
  const handleMouseMove = (e) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMarketClick = (e, market) => {
    const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isMobile && tappedMarket?.id !== market.id) {
      e.preventDefault();
      setTappedMarket(market);
      setMousePos({ x: window.innerWidth / 2 - 150, y: window.innerHeight / 2 - 100 });
    }
  };

  useEffect(() => {
    const handleOutsideClick = () => setTappedMarket(null);
    if (tappedMarket) {
      document.addEventListener('click', handleOutsideClick);
      return () => document.removeEventListener('click', handleOutsideClick);
    }
  }, [tappedMarket]);

  // Keyboard shortcuts for trading simulator
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Ignore if typing in input fields
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      // Space bar: Toggle start/stop
      if (e.code === 'Space' && !busted && !won) {
        e.preventDefault();
        setRunning(r => !r);
      }

      // R key: Reset
      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        reset();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [busted, won, reset]);

  // Memoize ticker items - use simulator ASSETS, filter meme coins
  const tickerItems = useMemo(() => {
    const memeCoins = ['FARTCOIN', 'WIF', 'BONK', 'PEPE', 'DOGE', 'SHIB'];

    return Object.entries(ASSETS)
      .filter(([symbol]) => !memeCoins.includes(symbol))
      .map(([symbol, data]) => {
        const currentPrice = prices[symbol]?.[prices[symbol].length - 1] || data.price;
        const change = ((currentPrice - data.price) / data.price) * 100;

        return {
          key: symbol,
          name: data.name,
          price: currentPrice,
          change: change,
        };
      });
  }, [prices]);

  const filteredMarkets = useMemo(() => {
    let filtered = markets;
    if (pmCategory !== 'all') {
      const keywords = categoryKeywords[pmCategory] || [];
      filtered = filtered.filter(m => {
        const text = `${m.question || ''} ${m.description || ''} ${m.category || ''}`.toLowerCase();
        return keywords.some(kw => text.includes(kw));
      });
    }
    if (showHighProb) {
      filtered = filtered.filter(m => m.probability >= 0.90 || m.probability <= 0.10);
    }
    return filtered;
  }, [markets, pmCategory, showHighProb]);

  // SIMULATIONS DISABLED - NOT NEEDED FOR POLYMARKET VIEW
  // const assetToSymbol = {
  //   btc: 'BTC-USD', eth: 'ETH-USD', gold: 'GC=F', silver: 'SI=F', oil: 'CL=F', nas100: 'NQ=F', us500: 'ES=F',
  //   aapl: 'AAPL', msft: 'MSFT', googl: 'GOOGL', amzn: 'AMZN', meta: 'META', tsla: 'TSLA', nvda: 'NVDA'
  //  };
  // const { history: priceHistory, loading: historyLoading } = useStockHistory(assetToSymbol[asset] || 'GC=F', '1y');
  //
  // const runSim = useCallback((key, sc) => {
  //   const a = liveAssets[key];
  //   if (!a) return { pctData: [], probs: [], finals: [] };
  //   const { drift, volMult } = scenarios[sc];
  //   return runMonteCarlo(a.spot, a.vol, drift, volMult, a.targets, horizons, simSeed);
  // }, [liveAssets, simSeed]);
  //
  // const res = useMemo(() => runSim(asset, scenario), [asset, scenario, runSim]);
  //
  // const a = liveAssets[asset];
  // const fmt = formatPrice;
  // const pCol = (p) => getProbColor(p, t);
  //
  // const scenarioColors = {
  //   bull: t.green,
  //   base: t.accent,
  //   bear: t.red
  // };

  return (
    <div style={{ minHeight: '100vh', background: t.bg, color: t.text, fontFamily: font }}>
      {/* Header */}
      <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `0.5px solid ${t.border}` }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 12, color: t.textSecondary }}>
            <a href="https://heyitsmejosh.com" style={{ color: t.textSecondary, textDecoration: 'none', opacity: 0.6 }}>home</a>
            <span style={{ opacity: 0.4 }}>/</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: t.text }}>bread</span>
          </div>
          <StatusBar t={t} />
          <span style={{ fontSize: 11, fontWeight: 600, color: t.textTertiary, letterSpacing: '0.5px', opacity: 0.5 }}>NOTHING EVER HAPPENS</span>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <WeatherWidget t={t} />
          <span style={{ fontSize: 10, color: t.textTertiary }}>Updated {formatLastUpdated(lastUpdated)}</span>
          {stocksError && <span style={{ fontSize: 9, color: t.red, opacity: 0.7 }}>⚠ Stock API down</span>}
          {pmError && <span style={{ fontSize: 9, color: t.red, opacity: 0.7 }}>⚠ Markets API down</span>}
          <button onClick={() => setShowMacro(!showMacro)} style={{ background: showMacro ? t.accent : 'transparent', border: `1px solid ${t.border}`, borderRadius: 8, padding: '4px 10px', color: showMacro ? '#fff' : t.textSecondary, fontSize: 11, cursor: 'pointer' }}>MACRO</button>
          <button onClick={() => setDark(!dark)} style={{ background: 'transparent', border: 'none', fontSize: 16, cursor: 'pointer' }}>{dark ? '☀️' : '🌙'}</button>
        </div>
      </div>

      {/* Macro Banner */}
      {showMacro && (
        <div style={{ padding: 16, background: `linear-gradient(135deg, ${t.red}20, ${t.orange}20)`, borderBottom: `0.5px solid ${t.border}` }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: t.orange, marginBottom: 8 }}>⚠️ MACRO RISK SYNTHESIS</div>
          <div style={{ fontSize: 12, lineHeight: 1.6, color: t.textSecondary }}>
            <p style={{ margin: '0 0 8px' }}><strong style={{ color: t.red }}>AI Bubble Risk:</strong> Circular funding between OpenAI ↔ Nvidia ↔ CoreWeave. $1T+ interconnected. Mag7 = 35% of S&P.</p>
            <p style={{ margin: '0 0 8px' }}><strong style={{ color: t.yellow }}>US Debt:</strong> $36T national debt. Interest payments exceeding defense budget. 120% debt-to-GDP ratio.</p>
            <p style={{ margin: '0 0 8px' }}><strong style={{ color: t.cyan }}>Crypto Thesis:</strong> BTC as digital gold hedge. ETF inflows $40B+ in 2025. Halving supply shock in effect.</p>
            <p style={{ margin: '0 0 8px' }}><strong style={{ color: t.green }}>Gold/Silver:</strong> Central banks bought 1,037t in 2024. De-dollarization accelerating. BRICS gold-backed currency speculation.</p>
            <p style={{ margin: 0 }}><strong style={{ color: t.textSecondary }}>Nothing Ever Happens:</strong> Markets rarely move. Stay patient. Trust the trend.</p>
          </div>
        </div>
      )}

      {/* Scrolling Ticker Tape */}
      <Ticker items={tickerItems} theme={t} />

      <div style={{ padding: 16, maxWidth: 1400, margin: '0 auto' }}>
        {/* TRADING SIMULATOR */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: t.green }}>TRADING SIMULATOR</div>
          <Card dark={dark} t={t} style={{ padding: 16 }}>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 12, color: '#666' }}>$1 → ${targetTrillion ? '1T' : '1B'} • 61 assets • Fib levels</div>
              <label style={{ fontSize: 11, color: '#666', display: 'flex', alignItems: 'center', gap: 6, cursor: running ? 'not-allowed' : 'pointer', opacity: running ? 0.5 : 1 }}>
                <input
                  type="checkbox"
                  checked={targetTrillion}
                  onChange={(e) => setTargetTrillion(e.target.checked)}
                  disabled={running}
                  style={{ cursor: running ? 'not-allowed' : 'pointer' }}
                />
                $1T target
              </label>
            </div>

            {busted && (
              <div style={{ background: '#7f1d1d', borderRadius: 12, padding: 16, marginBottom: 16, textAlign: 'center' }}>
                <div style={{ fontSize: 20 }}>💀</div>
                <div style={{ fontWeight: 600 }}>Busted at {formatNumber(balance)}</div>
                <div style={{ fontSize: 11, color: '#fca5a5', marginTop: 4 }}>Real-world: {realWorldTime(tick)}</div>
              </div>
            )}
            {won && (
              <div style={{ background: '#14532d', borderRadius: 12, padding: 16, marginBottom: 16, textAlign: 'center' }}>
                <div style={{ fontSize: 20 }}>🏆</div>
                <div style={{ fontWeight: 600 }}>${targetTrillion ? '1T' : '1B'} REACHED!</div>
                <div style={{ fontSize: 12, color: '#86efac' }}>{exits.length} trades • {winRate.toFixed(0)}% wins • {formatTime(elapsedTime)}</div>
                <div style={{ fontSize: 11, color: '#86efac', marginTop: 4 }}>Real-world: {realWorldTime(tick)} of trading</div>
                {biggestWinner && <div style={{ fontSize: 11, color: '#4ade80', marginTop: 4 }}>MVP: {biggestWinner[0]} (+{formatNumber(biggestWinner[1]).replace('$', '')})</div>}
                {biggestLoser && <div style={{ fontSize: 11, color: '#f87171', marginTop: 2 }}>Worst: {biggestLoser[0]} ({formatNumber(biggestLoser[1]).replace('$', '')})</div>}
              </div>
            )}

            {!busted && !won && (
              <div style={{ background: '#1a1a1a', borderRadius: 14, padding: 16, marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: 36, fontWeight: 700 }}>{formatNumber(equity)}</span>
                  <span style={{ fontSize: 16, color: pnl >= 0 ? '#4ade80' : '#f87171' }}>
                    {pnl >= 0 ? '+' : ''}{formatNumber(Math.abs(pnl)).replace('$', '')}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#666', marginTop: 8 }}>
                  <span>#{tick} {running && <span style={{ color: '#4ade80' }}>● live</span>}</span>
                  <span>{winRate.toFixed(0)}% wins • {exits.length} trades</span>
                </div>
                <div style={{ fontSize: 11, color: '#888', marginTop: 4 }}>
                  Time: {formatTime(elapsedTime)} {position && `• Position: ${formatNumber(position.size * position.entry).replace('$', '')} in ${position.sym}`}
                </div>
              </div>
            )}

            <div style={{ background: '#1a1a1a', borderRadius: 14, padding: 14, marginBottom: 14, minHeight: 160 }}>
              <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
                <line x1="0" y1={toY(0)} x2={W} y2={toY(0)} stroke="#333" strokeDasharray="4" />
                {SYMS.map(sym => prices[sym].length > 1 && (
                  <path
                    key={sym}
                    d={makePath(sym)}
                    fill="none"
                    stroke={ASSETS[sym].color}
                    strokeWidth={position?.sym === sym ? 2.5 : 1}
                    opacity={position ? (position.sym === sym ? 1 : 0.15) : 0.5}
                  />
                ))}
              </svg>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
                {SYMS.map(sym => (
                  <div key={sym} style={{ display: 'flex', alignItems: 'center', gap: 4, opacity: position ? (position.sym === sym ? 1 : 0.3) : 0.6 }}>
                    <div style={{ width: 6, height: 6, borderRadius: 1, background: ASSETS[sym].color }} />
                    <span style={{ fontSize: 9 }}>{sym}</span>
                  </div>
                ))}
              </div>
            </div>

            {position && (
              <div style={{ background: '#1a1a1a', borderRadius: 12, padding: 12, marginBottom: 14, display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: ASSETS[position.sym].color }}>{position.sym}</div>
                  <div style={{ fontSize: 10, color: '#666' }}>${position.entry.toFixed(2)} × {position.size}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 18, fontWeight: 600, color: unrealized >= 0 ? '#4ade80' : '#f87171' }}>
                    {unrealized >= 0 ? '+' : ''}{unrealized.toFixed(2)}
                  </div>
                  <div style={{ fontSize: 10, color: '#666' }}>SL ${position.stop.toFixed(2)}</div>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
              <button
                onClick={() => setRunning(!running)}
                disabled={busted || won}
                style={{ flex: 1, padding: 16, borderRadius: 12, border: 'none', fontSize: 16, fontWeight: 600, fontFamily: font, background: (busted || won) ? '#333' : running ? '#dc2626' : '#22c55e', color: (busted || won) ? '#666' : '#fff', cursor: (busted || won) ? 'default' : 'pointer' }}
              >
                {busted ? 'Busted' : won ? 'Won!' : running ? 'Stop' : 'Start'}
              </button>
              <button onClick={reset} style={{ padding: 16, borderRadius: 12, border: '1px solid #333', background: 'transparent', color: '#666', fontFamily: font, fontSize: 16, cursor: 'pointer' }}>↺</button>
            </div>
            <div style={{ textAlign: 'center', fontSize: 10, color: '#444', marginBottom: 14 }}>
              [Space] Start/Stop • [R] Reset
            </div>

            <div style={{ background: '#1a1a1a', borderRadius: 12, overflow: 'hidden' }}>
              <button onClick={() => setShowTrades(!showTrades)} style={{ width: '100%', padding: 12, background: 'transparent', border: 'none', display: 'flex', justifyContent: 'space-between', fontFamily: font, fontSize: 13, color: '#888', cursor: 'pointer' }}>
                <span>trades ({exits.length})</span>
                <span>{showTrades ? '−' : '+'}</span>
              </button>
              {showTrades && (
                <div style={{ padding: '0 12px 12px', maxHeight: 120, overflow: 'auto' }}>
                  {trades.length === 0 ? (
                    <div style={{ color: '#444', fontSize: 12, textAlign: 'center', padding: 8 }}>waiting...</div>
                  ) : (
                    [...trades].reverse().slice(0, 15).map((tr, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, padding: '4px 0', borderBottom: '1px solid #222' }}>
                        <span style={{ color: tr.type === 'BUY' ? '#60a5fa' : parseFloat(tr.pnl) >= 0 ? '#4ade80' : '#f87171' }}>
                          {tr.type} {tr.sym}
                        </span>
                        {tr.pnl && <span style={{ color: parseFloat(tr.pnl) >= 0 ? '#4ade80' : '#f87171' }}>{parseFloat(tr.pnl) >= 0 ? '+' : ''}{tr.pnl}</span>}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* POLYMARKET SECTION */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ flex: 1 }} />
            <button onClick={refetchPm} style={{ padding: '4px 8px', borderRadius: 8, border: `1px solid ${t.border}`, background: 'transparent', color: t.textSecondary, fontSize: 10, cursor: 'pointer' }}>↻ Refresh</button>
          </div>

          <div style={{ display: 'flex', gap: 6, marginBottom: 12, overflowX: 'auto' }}>
            {MARKET_CATEGORIES.map(cat => (
              <button key={cat.id} onClick={() => setPmCategory(cat.id)} style={{
                padding: '6px 12px', borderRadius: 16,
                border: pmCategory === cat.id ? `1.5px solid ${t.accent}` : `1px solid ${t.border}`,
                background: pmCategory === cat.id ? `${t.accent}15` : 'transparent',
                color: pmCategory === cat.id ? t.accent : t.textTertiary,
                fontSize: 11, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap'
              }}>{cat.label}</button>
            ))}
            <button onClick={() => setShowHighProb(!showHighProb)} style={{
              padding: '6px 12px', borderRadius: 16,
              border: showHighProb ? `1.5px solid ${t.green}` : `1px solid ${t.border}`,
              background: showHighProb ? `${t.green}15` : 'transparent',
              color: showHighProb ? t.green : t.textTertiary,
              fontSize: 11, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap'
            }}>90%+ Easy $</button>
          </div>

          {pmLoading && (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <div style={{
                width: 24, height: 24, margin: '0 auto',
                border: `2px solid ${t.border}`,
                borderTop: `2px solid ${t.accent}`,
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite'
              }} />
              <div style={{ color: t.textTertiary, fontSize: 12, marginTop: 12 }}>Loading markets...</div>
            </div>
          )}
          {pmError && <div style={{ textAlign: 'center', padding: 20, color: t.red, fontSize: 12 }}>Error loading markets</div>}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 480, overflowY: 'auto', paddingRight: 4 }}>
            {filteredMarkets.map(m => (
              <a
                key={m.id}
                href={`https://polymarket.com/event/${m.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none', color: 'inherit' }}
                onClick={(e) => handleMarketClick(e, m)}
                onMouseEnter={() => setHoveredMarket(m)}
                onMouseMove={handleMouseMove}
                onMouseLeave={() => setHoveredMarket(null)}
              >
                <Card dark={dark} t={t} style={{ padding: 12, cursor: 'pointer' }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    {m.image && <img src={m.image} alt="" style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover' }} />}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 2 }}>{tldr(m.question, 55)}</div>
                      <div style={{ display: 'flex', gap: 8, fontSize: 10, color: t.textTertiary }}>
                        <span>Vol: ${(m.volumeTotal / 1000000).toFixed(1)}M</span>
                        {m.endDate && <span>Ends: {new Date(m.endDate).toLocaleDateString()}</span>}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      {m.probability !== null && (
                        <div style={{ fontSize: 20, fontWeight: 700, color: m.probability > 0.5 ? t.green : t.red }}>
                          {(m.probability * 100).toFixed(0)}%
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </a>
            ))}
          </div>

          {(hoveredMarket || tappedMarket) && (() => {
            const market = tappedMarket || hoveredMarket;
            const isMobile = !!tappedMarket;
            return (
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  position: 'fixed',
                  left: isMobile ? '50%' : mousePos.x + 15,
                  top: isMobile ? '50%' : mousePos.y + 15,
                  transform: isMobile ? 'translate(-50%, -50%)' : 'none',
                  background: dark ? 'rgba(20,20,22,0.95)' : 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${t.border}`,
                  borderRadius: 12,
                  padding: 14,
                  maxWidth: 320,
                  zIndex: 1000,
                  boxShadow: dark ? '0 8px 32px rgba(0,0,0,0.5)' : '0 8px 32px rgba(0,0,0,0.15)',
                  pointerEvents: isMobile ? 'auto' : 'none',
                }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, lineHeight: 1.4 }}>{market.question}</div>
                {market.description && (
                  <div style={{ fontSize: 11, color: t.textSecondary, marginBottom: 8, lineHeight: 1.5 }}>
                    {market.description.length > 200 ? market.description.slice(0, 200) + '...' : market.description}
                  </div>
                )}
                <div style={{ display: 'flex', gap: 12, fontSize: 10, color: t.textTertiary }}>
                  <span>24h Vol: ${((market.volume24h || 0) / 1000).toFixed(0)}K</span>
                  <span>Liquidity: ${((market.liquidity || 0) / 1000).toFixed(0)}K</span>
                </div>
                {isMobile && (
                  <a
                    href={`https://polymarket.com/event/${market.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: 'block', fontSize: 11, color: t.cyan, marginTop: 10, textDecoration: 'underline' }}
                  >
                    Open on Polymarket →
                  </a>
                )}
              </div>
            );
          })()}
        </div>

        {/* NEWS SECTION - DISABLED (API BROKEN) */}
        {/* <div style={{ marginBottom: 24 }}>
          <NewsWidget dark={dark} t={t} />
        </div> */}

        {/* Footer */}
        <div style={{ textAlign: 'center', padding: '16px 0', fontSize: 10, color: t.textTertiary }}>
          &copy; 2026 &middot;{' '}
          <a href="https://github.com/nulljosh/bread" target="_blank" rel="noopener noreferrer" style={{ color: t.textSecondary, textDecoration: 'none' }}>
            GitHub
          </a>
        </div>
      </div>
    </div>
  );
}
