// Multi-source commodity prices API
// Uses Yahoo Finance chart endpoint (more reliable than quote endpoint)

export default async function handler(req, res) {
  const results = {};

  const symbols = {
    gold: 'GC=F',
    silver: 'SI=F',
    platinum: 'PL=F',
    palladium: 'PA=F',
    copper: 'HG=F',
    oil: 'CL=F',
    natgas: 'NG=F',
    nas100: '^NDX',
    us500: '^GSPC',
    us30: '^DJI',
    dxy: 'DX-Y.NYB',
  };

  try {
    // Fetch each symbol using chart endpoint (more reliable)
    const fetches = Object.entries(symbols).map(async ([key, symbol]) => {
      try {
        const response = await fetch(
          `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=5d`,
          { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } }
        );
        const data = await response.json();
        const meta = data.chart?.result?.[0]?.meta;
        const quotes = data.chart?.result?.[0]?.indicators?.quote?.[0];

        if (meta?.regularMarketPrice) {
          // Calculate change from previous close
          const prevClose = meta.chartPreviousClose || meta.previousClose;
          const price = meta.regularMarketPrice;
          const change = prevClose ? price - prevClose : 0;
          const changePercent = prevClose ? ((price - prevClose) / prevClose) * 100 : 0;

          results[key] = {
            price,
            change,
            changePercent,
            high52: meta.fiftyTwoWeekHigh,
            low52: meta.fiftyTwoWeekLow,
            source: 'yahoo_chart',
          };
        }
      } catch (err) {
        console.error(`Error fetching ${key}:`, err.message);
      }
    });

    await Promise.all(fetches);

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 's-maxage=30');
    res.status(200).json(results);
  } catch (error) {
    console.error('Commodities API error:', error);
    res.status(500).json({ error: error.message });
  }
}
