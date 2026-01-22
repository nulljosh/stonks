// Asset metadata (prices fetched live from APIs - no hardcoded values)
export const defaultAssets = {
  // PRECIOUS METALS
  silver: { name: 'XAGUSD', full: 'Silver Spot', notes: 'COMEX paper vs physical spread. Big short squeeze thesis.' },
  gold: { name: 'XAUUSD', full: 'Gold Spot', notes: 'Central banks buying 850t/yr. De-dollarization accelerating.' },
  platinum: { name: 'XPTUSD', full: 'Platinum', notes: 'Supply deficit 7 of 11 years. Undervalued vs gold.' },
  palladium: { name: 'XPDUSD', full: 'Palladium', notes: 'Russia supply risk. EV transition headwind.' },
  copper: { name: 'COPPER', full: 'Copper HG', notes: 'Data center/EV demand. Chile strikes. Record highs.' },
  oil: { name: 'USOIL', full: 'WTI Crude', notes: 'OPEC+ cuts. Geopolitical premium.' },
  natgas: { name: 'NATGAS', full: 'Natural Gas', notes: 'AI data center power demand. LNG exports.' },
  nas100: { name: 'NAS100', full: 'NASDAQ 100', notes: 'AI concentration risk. Mag7 = 35% of index.' },
  us500: { name: 'US500', full: 'S&P 500', notes: 'Shiller PE elevated. Breadth improving.' },
  us30: { name: 'US30', full: 'Dow Jones 30', notes: 'Value rotation potential if AI unwinds.' },
  btc: { name: 'BTCUSD', full: 'Bitcoin', notes: 'ETF inflows. Halving supply shock. $200K bull target.' },
  eth: { name: 'ETHUSD', full: 'Ethereum', notes: 'Staking yield. L2 scaling. ETF potential.' },
  // MAG7 STOCKS
  aapl: { name: 'AAPL', full: 'Apple Inc', notes: 'iPhone 16 cycle. Services growth. AI integration.' },
  msft: { name: 'MSFT', full: 'Microsoft', notes: 'Azure AI dominance. OpenAI partnership. Cloud growth.' },
  googl: { name: 'GOOGL', full: 'Alphabet', notes: 'Search dominance. Gemini AI. YouTube strength.' },
  amzn: { name: 'AMZN', full: 'Amazon', notes: 'AWS margins expanding. Retail dominance. AI compute.' },
  meta: { name: 'META', full: 'Meta Platforms', notes: 'AI ad targeting. Reality Labs. Instagram/WhatsApp growth.' },
  tsla: { name: 'TSLA', full: 'Tesla', notes: 'FSD potential. Energy storage. Robotaxi narrative.' },
  nvda: { name: 'NVDA', full: 'NVIDIA', notes: 'AI chip monopoly. H100/H200 demand. Blackwell ramp.' },
  pltr: { name: 'PLTR', full: 'Palantir', notes: 'AI platform. Government contracts. AIP growth.' },
  hood: { name: 'HOOD', full: 'Robinhood', notes: 'Crypto trading. Options growth. New users.' },
  dxy: { name: 'DXY', full: 'US Dollar Index', notes: 'De-dollarization watch. Twin deficits.' },
};

// Scenario configurations for Monte Carlo
export const scenarios = {
  bull: { drift: 0.50, label: 'Bull', volMult: 1.1 },
  base: { drift: 0.25, label: 'Base', volMult: 1.0 },
  bear: { drift: 0.05, label: 'Bear', volMult: 0.9 },
};

// Time horizons (days)
export const horizons = [90, 180, 365];

// Generate date labels dynamically from today
export const getHorizonLabels = () => {
  const now = new Date();
  return horizons.map(days => {
    const date = new Date(now);
    date.setDate(date.getDate() + days);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });
};
export const horizonLabels = getHorizonLabels();
