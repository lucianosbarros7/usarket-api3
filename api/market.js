<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Teste Gráfico Real</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    body {
      font-family: Arial, sans-serif;
      padding: 20px;
      background: #f5f5f5;
    }
    .market-box {
      background: #ffffff;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
      max-width: 1000px;
      margin: auto;
    }
    #market-indicators {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      margin-bottom: 16px;
    }
    #market-indicators > div {
      flex: 1;
      min-width: 110px;
      background: #F8F9FA;
      padding: 10px;
      border-radius: 8px;
      text-align: center;
      cursor: pointer;
      margin: 4px;
      transition: background 0.3s ease;
    }
    #market-indicators > div:hover {
      background: #e0e0e0;
    }
  </style>
</head>
<body>
  <div class="market-box">
    <h2>US Market Overview</h2>
    <div id="market-indicators"></div>
    <div id="market-chart-container" style="height: 300px; position: relative;"><canvas id="marketChart"></canvas></div>
  </div>

  <script>
    let chart;

    function renderChart(data, label) {
      const canvas = document.getElementById("marketChart");
      const ctx = canvas.getContext("2d");
      if (chart) chart.destroy();

      chart = new Chart(ctx, {
        type: "line",
        data: {
          labels: data.labels,
          datasets: [{
            label: label || "Index Value",
            data: data.values,
            borderColor: "#1E73E8",
            backgroundColor: "rgba(30, 115, 232, 0.08)",
            fill: true,
            tension: 0.4,
            pointRadius: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: {
              ticks: {
                callback: value => "$" + value.toLocaleString("en-US")
              }
            }
          }
        }
      });
    }

    async function loadChart(key, label) {
      try {
        const response = await fetch(`https://usarket-api3.vercel.app/api/market?index=${key}&_=${Date.now()}`);
        const result = await response.json();

        if (!result || !result.labels || !result.values) {
          throw new Error("Dados da API ausentes ou mal formatados.");
        }

        const filtered = result.labels.map((label, i) => {
          const v = result.values[i];
          return (v != null && !isNaN(v)) ? { label, v } : null;
        }).filter(Boolean);

        const labels = filtered.map(item => item.label);
        const values = filtered.map(item => item.v);

        console.log("🔁 Atualizando gráfico com:", label);
        console.table({ labels, values });

        renderChart({ labels, values }, label);
      } catch (err) {
        console.error("Erro ao carregar gráfico:", err);
      }
    }

    const indicators = [
      { name: "S&P 500", key: "spx" },
      { name: "Nasdaq 100", key: "nasdaq" },
      { name: "Dow Jones", key: "dow" },
      { name: "MSCI Index", key: "msci" },
      { name: "Russell 2000", key: "russell" }
    ];

    document.addEventListener("DOMContentLoaded", () => {
      const container = document.getElementById("market-indicators");
      indicators.forEach((item, index) => {
        const el = document.createElement("div");
        el.innerHTML = `<strong>${item.name}</strong>`;
        el.onclick = () => loadChart(item.key, item.name);
        container.appendChild(el);
        if (index === 0) loadChart(item.key, item.name);
      });
    });
  </script>
</body>
</html>
