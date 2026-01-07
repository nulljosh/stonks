export default async function handler(req, res) {
  try {
    // Fetch crypto from CoinGecko
    const cryptoRes = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,gold,silver&vs_currencies=usd&include_24hr_change=true'
    );
    const crypto = await cryptoRes.json();

    // Fetch commodities/indices from a free source
    const prices = {
      btc: { spot: crypto.bitcoin?.usd, chgPct: crypto.bitcoin?.usd_24h_change },
      eth: { spot: crypto.ethereum?.usd, chgPct: crypto.ethereum?.usd_24h_change },
    };

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json(prices);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch prices' });
  }
}
