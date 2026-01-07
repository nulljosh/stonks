import { useState, useEffect, useCallback } from 'react';

// Use local proxy to avoid CORS
const POLYMARKET_API = '/api';

export function usePolymarket() {
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMarkets = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch active markets sorted by volume
      const response = await fetch(`${POLYMARKET_API}/markets`);

      if (!response.ok) throw new Error('Failed to fetch markets');

      const data = await response.json();

      // Transform to our format
      const transformed = data.map(m => ({
        id: m.id,
        slug: m.slug,
        question: m.question,
        description: m.description,
        category: m.category || 'General',
        endDate: m.endDate,
        volume24h: parseFloat(m.volume24hr) || 0,
        volumeTotal: parseFloat(m.volume) || 0,
        liquidity: parseFloat(m.liquidity) || 0,
        outcomes: m.outcomes || [],
        // Best bid/ask prices
        bestBid: m.bestBid ? parseFloat(m.bestBid) : null,
        bestAsk: m.bestAsk ? parseFloat(m.bestAsk) : null,
        // Current probability (YES price)
        probability: m.outcomePrices ? parseFloat(JSON.parse(m.outcomePrices)[0]) : null,
        // 24h change
        change24h: m.change24hr ? parseFloat(m.change24hr) : null,
        image: m.image,
        active: m.active,
      }));

      setMarkets(transformed);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Polymarket fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount and every 30 seconds
  useEffect(() => {
    fetchMarkets();
    const interval = setInterval(fetchMarkets, 30000);
    return () => clearInterval(interval);
  }, [fetchMarkets]);

  // Search markets by query
  const searchMarkets = useCallback(async (query) => {
    try {
      const response = await fetch(
        `${POLYMARKET_API}/markets?closed=false&limit=20&title_contains=${encodeURIComponent(query)}`
      );
      if (!response.ok) throw new Error('Search failed');
      return await response.json();
    } catch (err) {
      console.error('Search error:', err);
      return [];
    }
  }, []);

  // Get single market details
  const getMarket = useCallback(async (slug) => {
    try {
      const response = await fetch(`${POLYMARKET_API}/markets/${slug}`);
      if (!response.ok) throw new Error('Market not found');
      return await response.json();
    } catch (err) {
      console.error('Get market error:', err);
      return null;
    }
  }, []);

  return {
    markets,
    loading,
    error,
    refetch: fetchMarkets,
    searchMarkets,
    getMarket,
  };
}

// Category filters for common market types
export const MARKET_CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'politics', label: 'Politics' },
  { id: 'crypto', label: 'Crypto' },
  { id: 'sports', label: 'Sports' },
  { id: 'finance', label: 'Finance' },
  { id: 'culture', label: 'Culture' },
];
