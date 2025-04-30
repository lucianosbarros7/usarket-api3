let cachedData = null;
let lastFetch = 0;
const cacheDuration = 60000; // 1 minuto

export default async function handler(req, res) {
  const now = Date.now();
  if (!cachedData || now - lastFetch > cacheDuration) {
    try {
      const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
      const values = [4500, 4600, 4550, 4700, 4650, 4750];
      cachedData = { labels, values };
      lastFetch = now;
    } catch (error) {
      return res.status(500).json({ error: "Erro ao buscar dados." });
    }
  }

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");

  return res.status(200).json(cachedData);
}
