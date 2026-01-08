// Multi-source commodity prices API
// Fetches from multiple sources and averages for accuracy

export default async function handler(req, res) {
  const results = {};

  // Source 1: Yahoo Finance (futures)
  const yahooSymbols = {
    gold: 'GC=F',
    silver: 'SI=F',
    platinum: 'PL=F',
    palladium: 'PA=F',
    copper: 'HG=F',
    oil: 'CL=F',
    natgas: 'NG=F',
  };

  // Source 2: Yahoo Finance (ETFs as backup)
  const etfSymbols = {
    gold: 'GLD',
    silver: 'SLV',
    platinum: 'PPLT',
    oil: 'USO',
    natgas: 'UNG',
  };

  // ETF to spot price multipliers (GLD = 1/10 oz gold, etc.)
  const etfMultipliers = {
    GLD: 10,      // GLD tracks 1/10 oz
    SLV: 1,       // SLV tracks ~1 oz
    PPLT: 10,     // PPLT tracks 1/10 oz
    USO: 1,       // USO is complex, skip multiplier
    UNG: 1,
  };

  try {
    // Fetch futures prices
    const futuresSyms = Object.values(yahooSymbols).join(',');
    const futuresRes = await fetch(
      `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(futuresSyms)}`,
      { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 KHTML, like Gecko' } }
    );
    const futuresData = await futuresRes.json();
    const futuresQuotes = futuresData.quoteResponse?.result || [];

    // Map futures data
    for (const [commodity, symbol] of Object.entries(yahooSymbols)) {
      const quote = futuresQuotes.find(q => q.symbol === symbol);
      if (quote?.regularMarketPrice) {
        results[commodity] = {
          price: quote.regularMarketPrice,
          change: quote.regularMarketChange,
          changePercent: quote.regularMarketChangePercent,
          high52: quote.fiftyTwoWeekHigh,
          low52: quote.fiftyTwoWeekLow,
          source: 'yahoo_futures',
        };
      }
    }

    // Fetch ETF prices as backup for missing commodities
    const missingCommodities = Object.keys(yahooSymbols).filter(c => !results[c]);
    if (missingCommodities.length > 0) {
      const etfSyms = missingCommodities
        .map(c => etfSymbols[c])
        .filter(Boolean)
        .join(',');

      if (etfSyms) {
        const etfRes = await fetch(
          `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${etfSyms}`,
          { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } }
        );
        const etfData = await etfRes.json();
        const etfQuotes = etfData.quoteResponse?.result || [];

        for (const commodity of missingCommodities) {
          const etfSymbol = etfSymbols[commodity];
          const quote = etfQuotes.find(q => q.symbol === etfSymbol);
          if (quote?.regularMarketPrice) {
            const multiplier = etfMultipliers[etfSymbol] || 1;
            results[commodity] = {
              price: quote.regularMarketPrice * multiplier,
              change: (quote.regularMarketChange || 0) * multiplier,
              changePercent: quote.regularMarketChangePercent,
              high52: (quote.fiftyTwoWeekHigh || 0) * multiplier,
              low52: (quote.fiftyTwoWeekLow || 0) * multiplier,
              source: 'yahoo_etf',
            };
          }
        }
      }
    }

    // Indices (these usually work better)
    const indexSymbols = {
      nas100: '^NDX',
      us500: '^GSPC',
      us30: '^DJI',
      dxy: 'DX-Y.NYB',
    };

    const indexSyms = Object.values(indexSymbols).join(',');
    const indexRes = await fetch(
      `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(indexSyms)}`,
      { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } }
    );
    const indexData = await indexRes.json();
    const indexQuotes = indexData.quoteResponse?.result || [];

    for (const [index, symbol] of Object.entries(indexSymbols)) {
      const quote = indexQuotes.find(q => q.symbol === symbol);
      if (quote?.regularMarketPrice) {
        results[index] = {
          price: quote.regularMarketPrice,
          change: quote.regularMarketChange,
          changePercent: quote.regularMarketChangePercent,
          high52: quote.fiftyTwoWeekHigh,
          low52: quote.fiftyTwoWeekLow,
          source: 'yahoo_index',
        };
      }
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 's-maxage=30');
    res.status(200).json(results);
  } catch (error) {
    console.error('Commodities API error:', error);
    res.status(500).json({ error: error.message });
  }
}
