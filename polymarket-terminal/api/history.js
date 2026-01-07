// Vercel serverless proxy for Yahoo Finance historical data
export default async function handler(req, res) {
  const symbol = req.query.symbol || 'AAPL';
  const range = req.query.range || '1y'; // 1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, max
  const interval = req.query.interval || '1d'; // 1m, 5m, 15m, 1d, 1wk, 1mo

  try {
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=${range}&interval=${interval}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }
    );

    const data = await response.json();
    const result = data.chart?.result?.[0];

    if (!result) {
      return res.status(404).json({ error: 'No data found' });
    }

    const timestamps = result.timestamp || [];
    const quotes = result.indicators?.quote?.[0] || {};

    const history = timestamps.map((t, i) => ({
      date: new Date(t * 1000).toISOString().split('T')[0],
      open: quotes.open?.[i],
      high: quotes.high?.[i],
      low: quotes.low?.[i],
      close: quotes.close?.[i],
      volume: quotes.volume?.[i],
    })).filter(h => h.close !== null);

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 's-maxage=3600'); // Cache for 1 hour
    res.status(200).json({
      symbol,
      currency: result.meta?.currency,
      history
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
