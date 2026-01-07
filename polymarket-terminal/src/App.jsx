import { useState, useMemo, useCallback, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, ComposedChart, ReferenceLine, BarChart, Bar, Cell } from 'recharts';
import { usePolymarket, MARKET_CATEGORIES } from './hooks/usePolymarket';
import { useLivePrices, formatLastUpdated } from './hooks/useLivePrices';
import { useStocks, useStockHistory } from './hooks/useStocks';
import { runMonteCarlo, formatPrice, calcFibTargets } from './utils/math';
import { getTheme, getProbColor } from './utils/theme';
import { defaultAssets, scenarios, horizons, horizonLabels } from './utils/assets';

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

// TLDR function for long market questions
const tldr = (question, maxLen = 50) => {
  if (!question || question.length <= maxLen) return question;
  // Smart truncation - cut at word boundary
  const truncated = question.slice(0, maxLen);
  const lastSpace = truncated.lastIndexOf(' ');
  return (lastSpace > 20 ? truncated.slice(0, lastSpace) : truncated) + '...';
};

// Glass Card Component
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
  const [asset, setAsset] = useState('silver'); // Default to silver
  const [scenario, setScenario] = useState('base');
  const [sel, setSel] = useState(0);
  const [simSeed, setSimSeed] = useState(42);
  const [showMacro, setShowMacro] = useState(false);
  const [pmCategory, setPmCategory] = useState('all');
  const [showMC, setShowMC] = useState(false);
  const [showHighProb, setShowHighProb] = useState(false); // 90%+ filter
  const [hoveredMarket, setHoveredMarket] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const t = getTheme(dark);

  // Track mouse position for tooltip
  const handleMouseMove = (e) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  // Live prices hook
  const { prices: liveAssets, lastUpdated } = useLivePrices(defaultAssets);

  // Polymarket hook
  const { markets, loading: pmLoading, error: pmError, refetch: refetchPm } = usePolymarket();

  // Stocks hook (live prices)
  const { stocks } = useStocks();

  // Map asset keys to Yahoo Finance symbols for historical data
  const assetToSymbol = { btc: 'BTC-USD', eth: 'ETH-USD', gold: 'GC=F', silver: 'SI=F', oil: 'CL=F', nas100: 'NQ=F', us500: 'ES=F' };
  const { history: priceHistory, loading: historyLoading } = useStockHistory(assetToSymbol[asset] || 'GC=F', '1y');

  // Filter polymarket by category and probability
  const filteredMarkets = useMemo(() => {
    let filtered = markets;
    if (pmCategory !== 'all') {
      filtered = filtered.filter(m =>
        m.category?.toLowerCase().includes(pmCategory) ||
        m.question?.toLowerCase().includes(pmCategory)
      );
    }
    if (showHighProb) {
      filtered = filtered.filter(m => m.probability >= 0.90 || m.probability <= 0.10);
    }
    return filtered;
  }, [markets, pmCategory, showHighProb]);

  // Monte Carlo simulation
  const runSim = useCallback((key, sc) => {
    const a = liveAssets[key];
    if (!a) return { pctData: [], probs: [], finals: [] };
    const { drift, volMult } = scenarios[sc];
    return runMonteCarlo(a.spot, a.vol, drift, volMult, a.targets, horizons, simSeed);
  }, [liveAssets, simSeed]);

  const res = useMemo(() => runSim(asset, scenario), [asset, scenario, runSim]);
  const allRes = useMemo(() =>
    Object.fromEntries(Object.keys(scenarios).map(k => [k, runSim(asset, k)])),
    [asset, runSim]
  );

  // Histogram
  const hist = useMemo(() => {
    const f = res.finals[sel];
    if (!f?.length) return [];
    const min = Math.min(...f), max = Math.max(...f), sz = (max - min) / 20 || 1;
    return Array(20).fill(0).map((_, i) => ({
      r: min + i * sz,
      c: f.filter(x => x >= min + i * sz && x < min + (i + 1) * sz).length
    }));
  }, [res.finals, sel]);

  const a = liveAssets[asset];
  const fibs = a ? calcFibTargets(a.spot, a.lo52, a.hi52) : {};
  const fmt = formatPrice;
  const pCol = (p) => getProbColor(p, t);

  const scenarioColors = {
    bull: t.green,
    base: t.accent,
    bear: t.red
  };

  return (
    <div style={{ minHeight: '100vh', background: t.bg, color: t.text, fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif' }}>

      {/* Header */}
      <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `0.5px solid ${t.border}` }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <a href="https://heyitsmejosh.com" style={{ fontSize: 11, color: t.textTertiary, textDecoration: 'none' }}>heyitsmejosh.com</a>
          <span style={{ color: t.textTertiary, margin: '0 6px' }}>/</span>
          <span style={{ fontSize: 15, fontWeight: 700 }}>stonks</span>
          <StatusBar t={t} />
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ fontSize: 10, color: t.textTertiary }}>Updated {formatLastUpdated(lastUpdated)}</span>
          <button onClick={() => setShowMacro(!showMacro)} style={{ background: showMacro ? t.accent : 'transparent', border: `1px solid ${t.border}`, borderRadius: 8, padding: '4px 10px', color: showMacro ? '#fff' : t.textSecondary, fontSize: 11, cursor: 'pointer' }}>MACRO</button>
          {markets.length > 0 && (
            <button onClick={() => {
              const randomMarket = markets[Math.floor(Math.random() * markets.length)];
              if (randomMarket?.slug) window.open(`https://polymarket.com/event/${randomMarket.slug}`, '_blank');
            }} style={{ background: 'transparent', border: 'none', fontSize: 16, cursor: 'pointer' }} title="Random bet">🎲</button>
          )}
          <button onClick={() => setDark(!dark)} style={{ background: 'transparent', border: 'none', fontSize: 16, cursor: 'pointer' }}>{dark ? '☀️' : '🌙'}</button>
        </div>
      </div>

      {/* Scrolling Ticker Tape */}
      <div style={{ overflow: 'hidden', borderBottom: `0.5px solid ${t.border}`, background: t.surface }}>
        <div style={{ display: 'flex', gap: 24, padding: '8px 0', animation: 'scroll 30s linear infinite', whiteSpace: 'nowrap' }}>
          {[...['silver', 'gold', 'btc', 'eth', 'nas100', 'us500', 'oil'], ...['silver', 'gold', 'btc', 'eth', 'nas100', 'us500', 'oil']].map((k, i) => (
            <span key={i} onClick={() => setAsset(k)} style={{ display: 'flex', gap: 6, fontSize: 12, cursor: 'pointer', opacity: asset === k ? 1 : 0.7 }}>
              <span style={{ fontWeight: 600 }}>{liveAssets[k]?.name}</span>
              <span>{fmt(liveAssets[k]?.spot || 0)}</span>
              <span style={{ color: (liveAssets[k]?.chgPct || 0) >= 0 ? t.green : t.red }}>
                {(liveAssets[k]?.chgPct || 0) >= 0 ? '▲' : '▼'}{Math.abs(liveAssets[k]?.chgPct || 0).toFixed(2)}%
              </span>
            </span>
          ))}
          {/* Stocks - Live from Yahoo Finance */}
          {Object.values(stocks).map((stk, i) => (
            <span key={`stk-${i}`} style={{ display: 'flex', gap: 6, fontSize: 12, opacity: 0.7 }}>
              <span style={{ fontWeight: 600 }}>{stk.symbol}</span>
              <span>${stk.price?.toFixed(2)}</span>
              <span style={{ color: (stk.changePercent || 0) >= 0 ? t.green : t.red }}>
                {(stk.changePercent || 0) >= 0 ? '▲' : '▼'}{Math.abs(stk.changePercent || 0).toFixed(2)}%
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* Macro Banner */}
      {showMacro && (
        <div style={{ padding: 16, background: `linear-gradient(135deg, ${t.red}20, ${t.orange}20)`, borderBottom: `0.5px solid ${t.border}` }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: t.orange, marginBottom: 8 }}>⚠️ MACRO RISK SYNTHESIS</div>
          <div style={{ fontSize: 12, lineHeight: 1.6, color: t.textSecondary }}>
            <p style={{ margin: '0 0 8px' }}><strong style={{ color: t.red }}>AI Bubble Risk:</strong> Circular funding between OpenAI ↔ Nvidia ↔ CoreWeave. $1T+ interconnected.</p>
            <p style={{ margin: '0 0 8px' }}><strong style={{ color: t.yellow }}>US Debt:</strong> $36T national debt. Interest payments exceeding defense budget.</p>
            <p style={{ margin: 0 }}><strong style={{ color: t.cyan }}>Crypto Thesis:</strong> BTC as digital gold hedge. ETF institutional flows accelerating.</p>
          </div>
        </div>
      )}

      <div style={{ padding: 16 }}>
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filteredMarkets.slice(0, 8).map(m => (
              <a
                key={m.id}
                href={`https://polymarket.com/event/${m.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none', color: 'inherit' }}
                onMouseEnter={() => setHoveredMarket(m)}
                onMouseMove={handleMouseMove}
                onMouseLeave={() => setHoveredMarket(null)}
              >
                <Card dark={dark} t={t} style={{ padding: 12, cursor: 'pointer', transition: 'transform 0.1s', ':hover': { transform: 'scale(1.01)' } }}>
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

          {/* Cursor-following tooltip */}
          {hoveredMarket && (
            <div style={{
              position: 'fixed',
              left: mousePos.x + 15,
              top: mousePos.y + 15,
              background: dark ? 'rgba(20,20,22,0.95)' : 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${t.border}`,
              borderRadius: 12,
              padding: 14,
              maxWidth: 320,
              zIndex: 1000,
              boxShadow: dark ? '0 8px 32px rgba(0,0,0,0.5)' : '0 8px 32px rgba(0,0,0,0.15)',
              pointerEvents: 'none',
            }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, lineHeight: 1.4 }}>{hoveredMarket.question}</div>
              {hoveredMarket.description && (
                <div style={{ fontSize: 11, color: t.textSecondary, marginBottom: 8, lineHeight: 1.5 }}>
                  {hoveredMarket.description.length > 200 ? hoveredMarket.description.slice(0, 200) + '...' : hoveredMarket.description}
                </div>
              )}
              <div style={{ display: 'flex', gap: 12, fontSize: 10, color: t.textTertiary }}>
                <span>24h Vol: ${((hoveredMarket.volume24h || 0) / 1000).toFixed(0)}K</span>
                <span>Liquidity: ${((hoveredMarket.liquidity || 0) / 1000).toFixed(0)}K</span>
                {hoveredMarket.change24h !== null && (
                  <span style={{ color: hoveredMarket.change24h >= 0 ? t.green : t.red }}>
                    {hoveredMarket.change24h >= 0 ? '+' : ''}{(hoveredMarket.change24h * 100).toFixed(1)}% 24h
                  </span>
                )}
              </div>
              <div style={{ fontSize: 9, color: t.cyan, marginTop: 8 }}>Click to open on Polymarket</div>
            </div>
          )}
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

          {/* Scrolling Asset Ticker */}
          <div style={{ overflow: 'hidden', marginBottom: 12, marginLeft: -16, marginRight: -16, borderTop: `0.5px solid ${t.border}`, borderBottom: `0.5px solid ${t.border}`, background: t.surface }}>
            <div style={{ display: 'flex', gap: 24, padding: '10px 0', animation: 'scroll 40s linear infinite', whiteSpace: 'nowrap' }}>
              {[...Object.entries(liveAssets), ...Object.entries(liveAssets)].map(([k, v], i) => (
                <span key={i} onClick={() => setAsset(k)} style={{
                  display: 'flex', gap: 8, alignItems: 'center', fontSize: 12, cursor: 'pointer',
                  padding: '4px 12px', borderRadius: 8,
                  background: asset === k ? `${t.accent}20` : 'transparent',
                  border: asset === k ? `1px solid ${t.accent}` : '1px solid transparent',
                }}>
                  <span style={{ fontWeight: 600, color: asset === k ? t.accent : t.text }}>{v.name}</span>
                  <span style={{ color: t.textSecondary }}>${v.spot.toLocaleString()}</span>
                  <span style={{ color: v.chgPct >= 0 ? t.green : t.red, fontWeight: 500 }}>
                    {v.chgPct >= 0 ? '▲' : '▼'}{Math.abs(v.chgPct).toFixed(2)}%
                  </span>
                </span>
              ))}
            </div>
          </div>

          {/* Compact Quote + MC Probabilities */}
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

              {/* MC Target Probabilities - sorted high to low */}
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

          {/* MC Chart */}
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

          {/* Historical Price Chart - 1 Year */}
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
          {new Date().getFullYear()} • Educational only • Not financial advice • <a href="https://github.com/nulljosh/stonks" target="_blank" rel="noopener noreferrer" style={{ color: t.textTertiary }}>GitHub</a>
        </div>
      </div>
    </div>
  );
}
