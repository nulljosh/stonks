import { useState, useEffect, useCallback, useRef } from 'react';

// MAG7 (Magnificent 7) + Popular stocks
const DEFAULT_SYMBOLS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'TSLA', 'NVDA', 'COST', 'JPM', 'PLTR', 'HOOD'];

// Retry helper with exponential backoff
const fetchWithRetry = async (url, maxRetries = 3, baseDelay = 1000) => {
  let lastError;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const response = await fetch(url, { signal: controller.signal });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (err) {
      lastError = err;
      console.warn(`Fetch attempt ${i + 1}/${maxRetries} failed:`, err.message);

      // Don't retry on certain errors
      if (err.message.includes('400') || err.message.includes('Invalid')) {
        throw err;
      }

      // Wait before retrying (exponential backoff)
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, baseDelay * Math.pow(2, i)));
      }
    }
  }

  throw lastError;
};

export function useStocks(symbols = DEFAULT_SYMBOLS) {
  const [stocks, setStocks] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const retryCountRef = useRef(0);

  const fetchStocks = useCallback(async () => {
    try {
      // Validate symbols
      if (!Array.isArray(symbols) || symbols.length === 0) {
        throw new Error('Invalid symbols: must be a non-empty array');
      }

      const data = await fetchWithRetry(`/api/stocks?symbols=${symbols.join(',')}`);

      // Validate response
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format: expected array');
      }

      // Map to stock objects with validation
      const stockMap = {};
      data.forEach(s => {
        if (s && s.symbol && typeof s.price === 'number') {
          stockMap[s.symbol] = {
            symbol: s.symbol,
            price: s.price,
            change: s.change ?? 0,
            changePercent: s.changePercent ?? 0,
            volume: s.volume ?? 0,
            high52: s.fiftyTwoWeekHigh ?? s.price,
            low52: s.fiftyTwoWeekLow ?? s.price,
          };
        }
      });

      // Check if we got any valid data
      if (Object.keys(stockMap).length === 0) {
        throw new Error('No valid stock data received');
      }

      setStocks(stockMap);
      setError(null);
      retryCountRef.current = 0; // Reset retry count on success
    } catch (err) {
      setError(err.message);
      console.error('Stock fetch error:', err);
      retryCountRef.current += 1;

      // Keep old data on error (don't clear stocks)
      // This prevents UI from breaking if there's a temporary failure
    } finally {
      setLoading(false);
    }
  }, [symbols.join(',')]);

  useEffect(() => {
    fetchStocks();
    const interval = setInterval(fetchStocks, 60000); // Refresh every 60s
    return () => clearInterval(interval);
  }, [fetchStocks]);

  return {
    stocks,
    loading,
    error,
    refetch: fetchStocks,
    retryCount: retryCountRef.current
  };
}

export function useStockHistory(symbol, range = '1y') {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!symbol) {
      setLoading(false);
      return;
    }

    const fetchHistory = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchWithRetry(`/api/history?symbol=${encodeURIComponent(symbol)}&range=${range}`);

        // Validate response
        if (!data || !Array.isArray(data.history)) {
          throw new Error('Invalid history data format');
        }

        setHistory(data.history);
      } catch (err) {
        console.error('History fetch error:', err);
        setError(err.message);
        // Keep old data on error
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [symbol, range]);

  return { history, loading, error };
}
