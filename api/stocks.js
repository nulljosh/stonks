// Disabled - ticker uses simulator data now
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).json([]);
}
