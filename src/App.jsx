import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, ComposedChart, ReferenceLine, BarChart, Bar, Cell } from 'recharts';
import { usePolymarket, MARKET_CATEGORIES } from './hooks/usePolymarket';
import { useLivePrices, formatLastUpdated } from './hooks/useLivePrices';
import { useStocks, useStockHistory } from './hooks/useStocks';
import { runMonteCarlo, formatPrice, calcFibTargets } from './utils/math';
import { getTheme, getProbColor } from './utils/theme';
import { defaultAssets, scenarios, horizons, horizonLabels } from './utils/assets';

// Trading Simulator Assets
const ASSETS = {
  NAS100: { name: 'Nasdaq 100', price: 21500, color: '#00d4ff' },
  SP500: { name: 'S&P 500', price: 6000, color: '#ff6b6b' },
  US30: { name: 'Dow Jones', price: 43800, color: '#4ecdc4' },
  XAU: { name: 'Gold', price: 2650, color: '#FFD700' },
  XAG: { name: 'Silver', price: 31, color: '#A0A0A0' },
  AAPL: { name: 'Apple', price: 243, color: '#555' },
  MSFT: { name: 'Microsoft', price: 418, color: '#00A2ED' },
  GOOGL: { name: 'Google', price: 192, color: '#4285F4' },
  NVDA: { name: 'Nvidia', price: 140, color: '#76B900' },
  TSLA: { name: 'Tesla', price: 380, color: '#CC0000' },
  META: { name: 'Meta', price: 595, color: '#0668E1' },
  COIN: { name: 'Coinbase', price: 265, color: '#0052FF' },
  PLTR: { name: 'Palantir', price: 71, color: '#9d4edd' },
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
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
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
    ...style
  }}>{children}</div>
);

export default function App() {
  const [dark, setDark] = useState(true);
  const t = getTheme(dark);
  const font = '-apple-system, BlinkMacSystemFont, system-ui, sans-serif';

  // Trading Simulator State
  const [balance, setBalance] = useState(100);
  const [position, setPosition] = useState(null);
  const [prices, setPrices] = useState(() => Object.fromEntries(SYMS.map(s => [s, [ASSETS[s].price]])));
  const [trades, setTrades] = useState([]);
  const [running, setRunning] = useState(false);
  const [tick, setTick] = useState(0);
  const [showTrades, setShowTrades] = useState(false);
  const [lastTraded, setLastTraded] = useState(null);
  const [perfMode, setPerfMode] = useState(false); // Performance mode for older hardware
  const trends = useRef(Object.fromEntries(SYMS.map(s => [s, 0])));

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
  const { stocks } = useStocks();

  // Trading Simulator Logic
  useEffect(() => {
    if (!running || balance <= 10 || balance >= 10000) return;

    const iv = setInterval(() => {
      setPrices(prev => {
        const next = {};
        SYMS.forEach(sym => {
          if (Math.random() < 0.05) trends.current[sym] = (Math.random() - 0.45) * 0.008;
          const drift = 0.0001;
          const move = drift + trends.current[sym] + (Math.random() - 0.5) * 0.012;
          const last = prev[sym][prev[sym].length - 1];
          const base = ASSETS[sym].price;
          const newPrice = Math.max(base * 0.7, Math.min(base * 1.5, last * (1 + move)));
          // Keep only last 50 prices to reduce memory
          const priceHistory = prev[sym].length >= 50 ? prev[sym].slice(-49) : prev[sym];
          next[sym] = [...priceHistory, newPrice];
        });
        return next;
      });

      setTick(t => t + 1);
    }, perfMode ? 250 : 100); // 250ms for old hardware, 100ms normal

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
      setBalance(b => Math.max(10, b + pnl));
      setTrades(t => [...t, { type: 'STOP', sym: position.sym, pnl: pnl.toFixed(2) }]);
      setPosition(null);
      return;
    }

    if (current >= position.target) {
      setBalance(b => b + pnl);
      setTrades(t => [...t, { type: 'WIN', sym: position.sym, pnl: pnl.toFixed(2) }]);
      setPosition(null);
      return;
    }

    if (pnlPct > 0.02) {
      setPosition(pos => ({ ...pos, stop: Math.max(pos.stop, current * 0.97) }));
    }
  }, [tick, position, running, prices]);

  useEffect(() => {
    if (!running || position || balance <= 10 || balance >= 10000) return;

    let best = null;
    SYMS.forEach(sym => {
      if (sym === lastTraded) return;
      const p = prices[sym];
      if (p.length < 10) return;
      const avg = p.slice(-10).reduce((a, b) => a + b, 0) / 10;
      const current = p[p.length - 1];
      const strength = (current - avg) / avg;
      if (strength > 0.001 && (!best || strength > best.strength)) {
        best = { sym, price: current, strength };
      }
    });

    if (best) {
      const size = Math.floor(balance * 0.08);
      setPosition({
        sym: best.sym,
        entry: best.price,
        size,
        stop: best.price * 0.965,
        target: best.price * 1.07,
      });
      setLastTraded(best.sym);
      setTrades(t => [...t, { type: 'BUY', sym: best.sym, price: best.price.toFixed(2) }]);
    }
  }, [tick, running, position, balance, lastTraded, prices]);

  const reset = useCallback(() => {
    setBalance(100);
    setPosition(null);
    setPrices(Object.fromEntries(SYMS.map(s => [s, [ASSETS[s].price]])));
    setTrades([]);
    setRunning(false);
    setTick(0);
    setLastTraded(null);
    trends.current = Object.fromEntries(SYMS.map(s => [s, 0]));
  }, []);

  const pnl = balance - 100;
  const currentPrice = position ? prices[position.sym][prices[position.sym].length - 1] : 0;
  const unrealized = position ? (currentPrice - position.entry) * position.size : 0;
  const equity = balance + unrealized;
  const busted = balance <= 10;
  const won = balance >= 10000;
  const exits = trades.filter(t => t.pnl);
  const wins = exits.filter(t => parseFloat(t.pnl) > 0);
  const winRate = exits.length ? (wins.length / exits.length * 100) : 0;

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

  const assetToSymbol = {
    btc: 'BTC-USD', eth: 'ETH-USD', gold: 'GC=F', silver: 'SI=F', oil: 'CL=F', nas100: 'NQ=F', us500: 'ES=F',
    aapl: 'AAPL', msft: 'MSFT', googl: 'GOOGL', amzn: 'AMZN', meta: 'META', tsla: 'TSLA', nvda: 'NVDA'
  };
  const { history: priceHistory, loading: historyLoading } = useStockHistory(assetToSymbol[asset] || 'GC=F', '1y');

  const runSim = useCallback((key, sc) => {
    const a = liveAssets[key];
    if (!a) return { pctData: [], probs: [], finals: [] };
    const { drift, volMult } = scenarios[sc];
    return runMonteCarlo(a.spot, a.vol, drift, volMult, a.targets, horizons, simSeed);
  }, [liveAssets, simSeed]);

  const res = useMemo(() => runSim(asset, scenario), [asset, scenario, runSim]);

  const a = liveAssets[asset];
  const fmt = formatPrice;
  const pCol = (p) => getProbColor(p, t);

  const scenarioColors = {
    bull: t.green,
    base: t.accent,
    bear: t.red
  };

  return (
    <div style={{ minHeight: '100vh', background: t.bg, color: t.text, fontFamily: font }}>
      {/* Header */}
      <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `0.5px solid ${t.border}` }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <span style={{ fontSize: 15, fontWeight: 700 }}>autopilot</span>
          <StatusBar t={t} />
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ fontSize: 10, color: t.textTertiary }}>Updated {formatLastUpdated(lastUpdated)}</span>
          <button onClick={() => setPerfMode(!perfMode)} style={{ background: perfMode ? t.green : 'transparent', border: `1px solid ${t.border}`, borderRadius: 8, padding: '4px 10px', color: perfMode ? '#fff' : t.textSecondary, fontSize: 11, cursor: 'pointer' }} title="Slow mode for older hardware">⚡{perfMode && ' SLOW'}</button>
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

      <div style={{ padding: 16 }}>
        {/* TRADING SIMULATOR - MAIN UI */}
        <div style={{ marginBottom: 24 }}>
          <Card dark={dark} t={t} style={{ padding: 16 }}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-1px', marginBottom: 4 }}>Trading Simulator</div>
              <div style={{ fontSize: 12, color: '#666' }}>$100 → $10K • 13 assets</div>
            </div>

            {busted && (
              <div style={{ background: '#7f1d1d', borderRadius: 12, padding: 16, marginBottom: 16, textAlign: 'center' }}>
                <div style={{ fontSize: 20 }}>💀</div>
                <div style={{ fontWeight: 600 }}>Busted at ${balance.toFixed(0)}</div>
              </div>
            )}
            {won && (
              <div style={{ background: '#14532d', borderRadius: 12, padding: 16, marginBottom: 16, textAlign: 'center' }}>
                <div style={{ fontSize: 20 }}>🏆</div>
                <div style={{ fontWeight: 600 }}>${balance.toLocaleString()} reached!</div>
                <div style={{ fontSize: 12, color: '#86efac' }}>{exits.length} trades • {winRate.toFixed(0)}% wins</div>
              </div>
            )}

            {!busted && !won && (
              <div style={{ background: '#1a1a1a', borderRadius: 14, padding: 16, marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: 36, fontWeight: 700 }}>${equity.toFixed(0)}</span>
                  <span style={{ fontSize: 16, color: pnl >= 0 ? '#4ade80' : '#f87171' }}>
                    {pnl >= 0 ? '+' : ''}{pnl.toFixed(0)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#666', marginTop: 8 }}>
                  <span>#{tick} {running && <span style={{ color: '#4ade80' }}>● live</span>}</span>
                  <span>{winRate.toFixed(0)}% wins • {exits.length} trades</span>
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
            <span style={{ fontSize: 14, fontWeight: 700, color: t.purple }}>PREDICTION MARKETS</span>
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

        {/* MC ASSET ANALYSIS SECTION */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: t.cyan }}>MONTE CARLO ANALYSIS</span>
            <div style={{ display: 'flex', gap: 4 }}>
              {Object.entries(scenarios).map(([k, v]) => (
                <button key={k} onClick={() => setScenario(k)} style={{
                  padding: '4px 10px', borderRadius: 8,
                  border: scenario === k ? `1.5px solid ${scenarioColors[k]}` : `1px solid ${t.border}`,
                  background: scenario === k ? `${scenarioColors[k]}15` : 'transparent',
                  color: scenario === k ? scenarioColors[k] : t.textTertiary,
                  fontSize: 10, fontWeight: 600, cursor: 'pointer'
                }}>{v.label}</button>
              ))}
            </div>
          </div>

          {a && (
            <Card dark={dark} t={t} style={{ padding: 16, marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 10, color: t.textTertiary, textTransform: 'uppercase', letterSpacing: 1 }}>{a.full}</div>
                  <div style={{ fontSize: 28, fontWeight: 700, marginTop: 2 }}>${fmt(a.spot)}</div>
                  <div style={{ fontSize: 12, color: a.chgPct >= 0 ? t.green : t.red }}>
                    {a.chgPct >= 0 ? '▲' : '▼'} {a.chgPct >= 0 ? '+' : ''}{a.chgPct.toFixed(2)}%
                  </div>
                </div>
                <div style={{ textAlign: 'right', fontSize: 10, color: t.textTertiary }}>
                  <div>52W: ${fmt(a.lo52)} — ${fmt(a.hi52)}</div>
                  <div style={{ marginTop: 4, color: t.yellow }}>Vol: {(a.vol * 100).toFixed(0)}%</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                {[...res.probs].sort((a, b) => b.mc - a.mc).map((p, i) => (
                  <div key={i} style={{ flex: 1, padding: 10, background: t.surface, borderRadius: 10, textAlign: 'center' }}>
                    <div style={{ fontSize: 10, color: t.textTertiary }}>${fmt(p.tgt)}</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: pCol(p.mc) }}>{(p.mc * 100).toFixed(0)}%</div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <Card dark={dark} t={t} style={{ padding: 12, marginBottom: 12 }}>
            <div style={{ fontSize: 10, color: t.textTertiary, marginBottom: 8 }}>MONTE CARLO PROJECTION</div>
            <ResponsiveContainer width="100%" height={140}>
              <ComposedChart data={res.pctData} margin={{ top: 5, right: 5, bottom: 5, left: -15 }}>
                <defs>
                  <linearGradient id="band" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={t.accent} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={t.accent} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="d" stroke={t.textTertiary} tick={{ fontSize: 9, fill: t.textTertiary }} tickFormatter={d => d === 0 ? 'Now' : `${Math.round(d / 30)}m`} />
                <YAxis stroke={t.textTertiary} tick={{ fontSize: 9, fill: t.textTertiary }} tickFormatter={fmt} domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ background: t.glass, border: `0.5px solid ${t.border}`, borderRadius: 8, fontSize: 11 }} formatter={v => [`${fmt(v)}`, '']} />
                <Area type="monotone" dataKey="p95" stroke="none" fill="url(#band)" />
                <Area type="monotone" dataKey="p5" stroke="none" fill={t.bg} />
                <Line type="monotone" dataKey="p5" stroke={t.textTertiary} strokeWidth={1} strokeDasharray="3 3" dot={false} />
                <Line type="monotone" dataKey="p50" stroke={t.accent} strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="p95" stroke={t.textTertiary} strokeWidth={1} strokeDasharray="3 3" dot={false} />
                {a?.targets.map((tgt, i) => <ReferenceLine key={tgt} y={tgt} stroke={[t.green, t.yellow, t.red][i]} strokeDasharray="4 4" strokeWidth={1.5} />)}
              </ComposedChart>
            </ResponsiveContainer>
          </Card>

          <Card dark={dark} t={t} style={{ padding: 12 }}>
            <div style={{ fontSize: 10, color: t.textTertiary, marginBottom: 8 }}>1 YEAR HISTORICAL</div>
            {historyLoading ? (
              <div style={{ height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 20, height: 20, border: `2px solid ${t.border}`, borderTop: `2px solid ${t.accent}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={140}>
                <ComposedChart data={priceHistory} margin={{ top: 5, right: 5, bottom: 5, left: -15 }}>
                  <defs>
                    <linearGradient id="histGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={t.cyan} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={t.cyan} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke={t.textTertiary} tick={{ fontSize: 9, fill: t.textTertiary }} tickFormatter={d => d?.slice(5, 7)} interval={Math.floor(priceHistory.length / 6)} />
                  <YAxis stroke={t.textTertiary} tick={{ fontSize: 9, fill: t.textTertiary }} tickFormatter={fmt} domain={['auto', 'auto']} />
                  <Tooltip contentStyle={{ background: t.glass, border: `0.5px solid ${t.border}`, borderRadius: 8, fontSize: 11 }} formatter={v => [`$${v?.toFixed(2)}`, 'Price']} labelFormatter={l => l} />
                  <Area type="monotone" dataKey="close" stroke={t.cyan} strokeWidth={1.5} fill="url(#histGrad)" dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </Card>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', padding: '16px 0', fontSize: 10, color: t.textTertiary }}>
          {new Date().getFullYear()} • Educational only • Not financial advice
        </div>
      </div>
    </div>
  );
}
