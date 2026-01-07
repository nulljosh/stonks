// Default asset data with institutional levels
export const defaultAssets = {
  // PRECIOUS METALS
  silver: {
    name: 'XAGUSD', full: 'Silver Spot', spot: 78.55, chg: -2.69, chgPct: -3.32,
    vol: 0.42, hi52: 85, lo52: 22,
    support: [70, 65, 60],
    resistance: [85, 100, 130],
    targets: [100, 130, 200],
    notes: 'COMEX paper vs physical spread. Japan spot: $130+. Big short squeeze thesis.'
  },
  gold: {
    name: 'XAUUSD', full: 'Gold Spot', spot: 2680, chg: 15.2, chgPct: 0.57,
    vol: 0.22, hi52: 2800, lo52: 1900,
    support: [2600, 2500, 2400],
    resistance: [2800, 3000, 3500],
    targets: [3000, 3500, 5000],
    notes: 'Central banks buying 850t/yr. De-dollarization accelerating. $5000 bull target.'
  },
  platinum: {
    name: 'XPTUSD', full: 'Platinum', spot: 980, chg: 5.2, chgPct: 0.53,
    vol: 0.32, hi52: 1100, lo52: 850,
    support: [950, 900, 850],
    resistance: [1050, 1100, 1200],
    targets: [1100, 1300, 1500],
    notes: 'Supply deficit 7 of 11 years. Undervalued vs gold.'
  },
  palladium: {
    name: 'XPDUSD', full: 'Palladium', spot: 1050, chg: -15.0, chgPct: -1.41,
    vol: 0.38, hi52: 1500, lo52: 900,
    support: [1000, 950, 900],
    resistance: [1150, 1300, 1500],
    targets: [1300, 1600, 2000],
    notes: 'Russia supply risk. EV transition headwind.'
  },
  // BASE METALS
  copper: {
    name: 'COPPER', full: 'Copper HG', spot: 4.25, chg: 0.05, chgPct: 1.19,
    vol: 0.28, hi52: 5.20, lo52: 3.50,
    support: [4.00, 3.80, 3.50],
    resistance: [4.50, 5.00, 5.50],
    targets: [5.00, 6.00, 7.50],
    notes: 'Data center/EV demand. Chile strikes. Record highs.'
  },
  // ENERGY
  oil: {
    name: 'USOIL', full: 'WTI Crude', spot: 72.50, chg: -0.85, chgPct: -1.16,
    vol: 0.35, hi52: 95, lo52: 65,
    support: [70, 67, 65],
    resistance: [78, 85, 95],
    targets: [85, 100, 120],
    notes: 'OPEC+ cuts. Geopolitical premium.'
  },
  natgas: {
    name: 'NATGAS', full: 'Natural Gas', spot: 2.85, chg: -0.08, chgPct: -2.73,
    vol: 0.55, hi52: 4.00, lo52: 1.80,
    support: [2.50, 2.20, 2.00],
    resistance: [3.20, 3.80, 4.50],
    targets: [4.00, 5.50, 7.00],
    notes: 'AI data center power demand. LNG exports.'
  },
  // US INDICES
  nas100: {
    name: 'NAS100', full: 'NASDAQ 100', spot: 21500, chg: 85, chgPct: 0.40,
    vol: 0.22, hi52: 22000, lo52: 14500,
    support: [21000, 20000, 19000],
    resistance: [22000, 23500, 25000],
    targets: [23000, 25000, 30000],
    notes: 'AI concentration risk. Mag7 = 35% of index.'
  },
  us500: {
    name: 'US500', full: 'S&P 500', spot: 6050, chg: -12.5, chgPct: -0.21,
    vol: 0.18, hi52: 6200, lo52: 4100,
    support: [5900, 5700, 5500],
    resistance: [6200, 6500, 7000],
    targets: [6500, 7000, 8000],
    notes: 'Shiller PE elevated. Breadth improving.'
  },
  us30: {
    name: 'US30', full: 'Dow Jones 30', spot: 44500, chg: -125, chgPct: -0.28,
    vol: 0.16, hi52: 45500, lo52: 33000,
    support: [43500, 42000, 40000],
    resistance: [45500, 48000, 50000],
    targets: [48000, 52000, 58000],
    notes: 'Value rotation potential if AI unwinds.'
  },
  // CRYPTO
  btc: {
    name: 'BTCUSD', full: 'Bitcoin', spot: 98500, chg: 1250, chgPct: 1.29,
    vol: 0.65, hi52: 108000, lo52: 38000,
    support: [95000, 90000, 85000],
    resistance: [100000, 108000, 120000],
    targets: [120000, 150000, 200000],
    notes: 'ETF inflows. Halving supply shock. $200K bull target.'
  },
  eth: {
    name: 'ETHUSD', full: 'Ethereum', spot: 3450, chg: 65, chgPct: 1.92,
    vol: 0.70, hi52: 4100, lo52: 2100,
    support: [3200, 3000, 2800],
    resistance: [3800, 4100, 5000],
    targets: [4500, 6000, 10000],
    notes: 'Staking yield. L2 scaling. ETF potential.'
  },
  // MACRO
  dxy: {
    name: 'DXY', full: 'US Dollar Index', spot: 104.5, chg: -0.25, chgPct: -0.24,
    vol: 0.10, hi52: 110, lo52: 100,
    support: [103, 101, 100],
    resistance: [106, 108, 110],
    targets: [100, 95, 90],
    notes: 'De-dollarization watch. Twin deficits.'
  },
};

// Scenario configurations
export const scenarios = {
  bull: { drift: 0.50, label: 'Bull', volMult: 1.1 },
  base: { drift: 0.25, label: 'Base', volMult: 1.0 },
  bear: { drift: 0.05, label: 'Bear', volMult: 0.9 },
};

// Time horizons (days)
export const horizons = [90, 180, 365];
export const horizonLabels = ['Q1', 'H1', 'FY'];
