const fetch = require('node-fetch');

let cache = {};
const CACHE_TTL = 1000 * 60 * 30; // 30 minutos

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { index } = req.query;

  const SYMBOLS = {
    spx: "^GSPC",
    nasdaq: "^IXIC",
    dow: "^DJI",
    msci: "URTH",
    russell: "^RUT"
  };

  const symbol = SYMBOLS[index];
  if (!symbol) {
    return res.status(400).json({ error: 'Index inválido.' });
  }

  const now = Date.now();
  if (cache[index] && now - cache[index].timestamp < CACHE_TTL) {
    return res.status(200).json(cache[index].data);
  }

  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=30d&interval=1d`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Yahoo API error: ${response.status}`);

    const json = await response.json();
    const result = json.chart?.result?.[0];

    if (!result) throw new Error('Formato inválido da resposta');

    const timestamps = result.timestamp;
    const values = result.indicators.quote[0].close;

    const filtered = timestamps.map((ts, i) => {
      const v = values[i];
      return v != null && !isNaN(v) ? { ts, v } : null;
    }).filter(Boolean);

    const labels = filtered.map(item => {
      const date = new Date(item.ts * 1000);
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    });

    const cleanedValues = filtered.map(item => item.v);

    const data = { labels, values: cleanedValues };
    cache[index] = { data, timestamp: now };

    res.status(200).json(data);
  } catch (err) {
    console.error("Erro API:", err);
    res.status(500).json({ error: 'Erro ao buscar dados de mercado.' });
  }
};
