import { useState, useEffect, useCallback } from 'react';

const DEFAULT_SYMBOLS = ['AAPL', 'GOOGL', 'PLTR', 'HOOD', 'NVDA'];

export function useStocks(symbols = DEFAULT_SYMBOLS) {
  const [stocks, setStocks] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStocks = useCallback(async () => {
    try {
      const response = await fetch(`/api/stocks?symbols=${symbols.join(',')}`);
      if (!response.ok) throw new Error('Failed to fetch stocks');

      const data = await response.json();
      const stockMap = {};
      data.forEach(s => {
        stockMap[s.symbol] = {
          symbol: s.symbol,
          price: s.price,
          change: s.change,
          changePercent: s.changePercent,
          volume: s.volume,
          high52: s.fiftyTwoWeekHigh,
          low52: s.fiftyTwoWeekLow,
        };
      });

      setStocks(stockMap);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Stock fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [symbols.join(',')]);

  useEffect(() => {
    fetchStocks();
    const interval = setInterval(fetchStocks, 60000); // Refresh every 60s
    return () => clearInterval(interval);
  }, [fetchStocks]);

  return { stocks, loading, error, refetch: fetchStocks };
}

export function useStockHistory(symbol, range = '1y') {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!symbol) return;

    setLoading(true);
    fetch(`/api/history?symbol=${symbol}&range=${range}`)
      .then(r => r.json())
      .then(data => {
        setHistory(data.history || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [symbol, range]);

  return { history, loading };
}
