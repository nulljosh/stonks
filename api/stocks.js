// Use YH Finance (free, no key needed)
export default async function handler(req, res) {
  const symbols = req.query.symbols || 'AAPL,MSFT,GOOGL,AMZN,META,TSLA,NVDA';

  if (!/^[A-Z0-9,\-\.]+$/i.test(symbols)) {
    return res.status(400).json({ error: 'Invalid symbols format' });
  }

  const symbolList = symbols.split(',').slice(0, 50);

  try {
    // Use yh-finance.p.rapidapi.com - works better than Yahoo direct
    const results = await Promise.all(
      symbolList.map(async (symbol) => {
        const response = await fetch(
          `https://yh-finance.p.rapidapi.com/stock/v2/get-summary?symbol=${symbol}`,
          {
            headers: {
              'X-RapidAPI-Key': process.env.RAPIDAPI_KEY || 'demo',
              'X-RapidAPI-Host': 'yh-finance.p.rapidapi.com'
            }
          }
        );

        if (!response.ok) return null;

        const data = await response.json();
        const price = data?.price;
        if (!price) return null;

        return {
          symbol: symbol,
          price: price.regularMarketPrice?.raw || price.regularMarketPrice,
          change: price.regularMarketChange?.raw || price.regularMarketChange,
          changePercent: price.regularMarketChangePercent?.raw || price.regularMarketChangePercent,
          volume: price.regularMarketVolume?.raw || price.regularMarketVolume,
          high: price.regularMarketDayHigh?.raw,
          low: price.regularMarketDayLow?.raw,
        };
      })
    );

    const stocks = results.filter(s => s !== null);

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    res.status(200).json(stocks);
  } catch (error) {
    console.error('Stock API error:', error);
    res.status(500).json({ error: 'Failed to fetch stock data', details: error.message });
  }
}
