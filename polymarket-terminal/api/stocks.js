// Vercel serverless proxy for Yahoo Finance
export default async function handler(req, res) {
  const symbols = req.query.symbols || 'AAPL,GOOGL,PLTR,HOOD,NVDA';

  try {
    const response = await fetch(
      `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbols}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }
    );

    const data = await response.json();
    const quotes = data.quoteResponse?.result || [];

    const stocks = quotes.map(q => ({
      symbol: q.symbol,
      price: q.regularMarketPrice,
      change: q.regularMarketChange,
      changePercent: q.regularMarketChangePercent,
      volume: q.regularMarketVolume,
      high: q.regularMarketDayHigh,
      low: q.regularMarketDayLow,
      open: q.regularMarketOpen,
      prevClose: q.regularMarketPreviousClose,
      marketCap: q.marketCap,
      fiftyTwoWeekHigh: q.fiftyTwoWeekHigh,
      fiftyTwoWeekLow: q.fiftyTwoWeekLow,
    }));

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 's-maxage=60');
    res.status(200).json(stocks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
