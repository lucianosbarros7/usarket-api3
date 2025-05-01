const fetch = require('node-fetch');
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 300 }); // cache de 5 minutos

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "no-store");

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { index } = req.query;
  const SYMBOLS = {
    spx: "^GSPC",
    nasdaq: "^IXIC",
    dow: "^DJI",
    msci: "URTH",
    russell: "^RUT"
  };

  const symbol = SYMBOLS[index] || SYMBOLS['spx'];
  const cacheKey = `market-${symbol}`;

  // 🔁 Retorna do cache se disponível
  if (cache.has(cacheKey)) {
    console.log("🔁 Cache HIT:", symbol);
    return res.status(200).json(cache.get(cacheKey));
  }

  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=1d&interval=5m`;

  try {
    const response = await fetch(url);
    const json = await response.json();
    const result = json.chart?.result?.[0];

    if (!result || !result.timestamp || !result.indicators?.quote?.[0]?.close) {
      throw new Error("Dados incompletos ou inválidos.");
    }

    const timestamps = result.timestamp;
    const values = result.indicators.quote[0].close;

    const filtered = timestamps.map((ts, i) => {
      const v = values[i];
      return v != null && !isNaN(v) ? { ts, v } : null;
    }).filter(Boolean);

    const labels = filtered.map(item => {
      const date = new Date(item.ts * 1000);
      return date.toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' });
    });

    const cleanedValues = filtered.map(item => item.v);

    const responseData = { labels, values: cleanedValues };

    // 💾 Salva no cache
    cache.set(cacheKey, responseData);

    console.log("✅ Cache SET:", symbol);
    res.status(200).json(responseData);
  } catch (err) {
    console.error("❌ Erro ao buscar dados:", err);
    res.status(500).json({ error: 'Erro ao buscar dados do mercado.' });
  }
};
