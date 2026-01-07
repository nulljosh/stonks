import { useState, useEffect, useCallback } from 'react';

// Free APIs for live prices
const COINGECKO_API = 'https://api.coingecko.com/api/v3';

// Asset mappings for different APIs
const CRYPTO_IDS = {
  btc: 'bitcoin',
  eth: 'ethereum',
};

const YAHOO_SYMBOLS = {
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

export function useLivePrices(initialAssets) {
  const [prices, setPrices] = useState(initialAssets);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchCryptoPrices = useCallback(async () => {
    try {
      const ids = Object.values(CRYPTO_IDS).join(',');
      const response = await fetch(
        `${COINGECKO_API}/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`
      );
      if (!response.ok) throw new Error('CoinGecko API error');
      const data = await response.json();

      return {
        btc: {
          spot: data.bitcoin?.usd || prices.btc.spot,
          chgPct: data.bitcoin?.usd_24h_change || 0,
        },
        eth: {
          spot: data.ethereum?.usd || prices.eth.spot,
          chgPct: data.ethereum?.usd_24h_change || 0,
        },
      };
    } catch (err) {
      console.error('Crypto price fetch error:', err);
      return null;
    }
  }, [prices]);

  const fetchAllPrices = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch crypto prices
      const cryptoPrices = await fetchCryptoPrices();

      if (cryptoPrices) {
        setPrices(prev => ({
          ...prev,
          btc: {
            ...prev.btc,
            spot: cryptoPrices.btc.spot,
            chgPct: cryptoPrices.btc.chgPct,
            chg: cryptoPrices.btc.spot * (cryptoPrices.btc.chgPct / 100),
          },
          eth: {
            ...prev.eth,
            spot: cryptoPrices.eth.spot,
            chgPct: cryptoPrices.eth.chgPct,
            chg: cryptoPrices.eth.spot * (cryptoPrices.eth.chgPct / 100),
          },
        }));
      }

      setLastUpdated(new Date());
    } catch (err) {
      console.error('Price fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchCryptoPrices]);

  // Fetch on mount and every 60 seconds
  useEffect(() => {
    fetchAllPrices();
    const interval = setInterval(fetchAllPrices, 60000);
    return () => clearInterval(interval);
  }, [fetchAllPrices]);

  return {
    prices,
    loading,
    lastUpdated,
    refetch: fetchAllPrices,
  };
}

// Format relative time
export function formatLastUpdated(date) {
  if (!date) return 'Never';
  const seconds = Math.floor((new Date() - date) / 1000);
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  return `${Math.floor(seconds / 3600)}h ago`;
}
