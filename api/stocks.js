// Vercel serverless proxy for Yahoo Finance
export default async function handler(req, res) {
  // Input validation
  const symbols = req.query.symbols || 'AAPL,MSFT,GOOGL,AMZN,META,TSLA,NVDA,COST,JPM,PLTR,HOOD';

  // Validate symbols format (alphanumeric and commas only)
  if (!/^[A-Z0-9,\-\.]+$/i.test(symbols)) {
    return res.status(400).json({
      error: 'Invalid symbols format',
      details: 'Symbols must contain only letters, numbers, hyphens, dots, and commas'
    });
  }

  // Limit number of symbols to prevent abuse
  const symbolList = symbols.split(',');
  if (symbolList.length > 50) {
    return res.status(400).json({
      error: 'Too many symbols',
      details: 'Maximum 50 symbols allowed per request'
    });
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const response = await fetch(
      `https://query2.finance.yahoo.com/v7/finance/quote?symbols=${symbols}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'application/json',
          'Accept-Language': 'en-US,en;q=0.9'
        },
        signal: controller.signal
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Yahoo Finance API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    // Check if response has the expected structure
    if (!data.quoteResponse) {
      throw new Error('Invalid response format from Yahoo Finance API');
    }

    const quotes = data.quoteResponse.result || [];

    // Filter out invalid quotes and map to our format
    const stocks = quotes
      .filter(q => q && q.symbol && q.regularMarketPrice !== undefined)
      .map(q => ({
        symbol: q.symbol,
        price: q.regularMarketPrice ?? null,
        change: q.regularMarketChange ?? null,
        changePercent: q.regularMarketChangePercent ?? null,
        volume: q.regularMarketVolume ?? null,
        high: q.regularMarketDayHigh ?? null,
        low: q.regularMarketDayLow ?? null,
        open: q.regularMarketOpen ?? null,
        prevClose: q.regularMarketPreviousClose ?? null,
        marketCap: q.marketCap ?? null,
        fiftyTwoWeekHigh: q.fiftyTwoWeekHigh ?? null,
        fiftyTwoWeekLow: q.fiftyTwoWeekLow ?? null,
      }));

    // Log if we got fewer results than expected
    if (stocks.length < symbolList.length) {
      console.warn(`Expected ${symbolList.length} stocks, got ${stocks.length}`);
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    res.status(200).json(stocks);
  } catch (error) {
    console.error('Stock API error:', error);

    // Handle specific error types
    if (error.name === 'AbortError') {
      return res.status(504).json({
        error: 'Request timeout',
        details: 'Yahoo Finance API did not respond in time'
      });
    }

    res.status(500).json({
      error: 'Failed to fetch stock data',
      details: error.message
    });
  }
}
