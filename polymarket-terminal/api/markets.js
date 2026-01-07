export default async function handler(req, res) {
  try {
    const response = await fetch(
      'https://gamma-api.polymarket.com/markets?closed=false&limit=50&order=volume24hr&ascending=false'
    );
    const data = await response.json();
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch markets' });
  }
}
