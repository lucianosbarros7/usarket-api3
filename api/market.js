const fetch = require('node-fetch');

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

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
    const response = await fetch(url);
    const json = await response.json();
    const result = json.chart.result[0];

    const timestamps = result.timestamp;
    const values = result.indicators.quote[0].close;

    const labels = timestamps.map(ts => {
      const date = new Date(ts * 1000);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short'
      });
    });

    res.status(200).json({ labels, values });
  } catch (err) {
    console.error("Erro ao buscar dados reais:", err);
    res.status(500).json({ error: 'Erro ao buscar dados do mercado.' });
  }
};
