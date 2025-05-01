const fetch = require('node-fetch');

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "no-store"); // 🚫 Impede cache de resposta

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { index } = req.query;

  const SYMBOLS = {
    spx: "^GSPC",
    nasdaq: "^IXIC",
    dow: "^DJI",
    msci: "URTH",
    russell: "^RUT"
  };

  const symbol = SYMBOLS[index] || SYMBOLS['spx'];
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=30d&interval=1d`;

  try {
    const response = await fetch(url, { headers: { 'Cache-Control': 'no-cache' } }); // <-- Refresca upstream também

    if (!response.ok) {
      throw new Error(`Yahoo API error: ${response.status}`);
    }

    const json = await response.json();

    if (!json.chart || !json.chart.result || !json.chart.result[0]) {
      throw new Error('Resposta inválida da API do Yahoo Finance');
    }

    const result = json.chart.result[0];
    const timestamps = result.timestamp;
    const values = result.indicators.quote[0].close;

    const filtered = timestamps.map((ts, i) => {
      const v = values[i];
      return v != null && !isNaN(v) ? { ts, v } : null;
    }).filter(Boolean);

    const labels = filtered.map(item => {
      const date = new Date(item.ts * 1000);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short'
      });
    });

    const cleanedValues = filtered.map(item => item.v);

    res.status(200).json({ labels, values: cleanedValues });

  } catch (err) {
    console.error("Erro ao buscar dados reais:", err);
    res.status(500).json({ error: 'Erro ao buscar dados do mercado.' });
  }
};
