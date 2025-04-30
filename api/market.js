export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*"); // ou use o domínio exato em produção
  res.setHeader("Access-Control-Allow-Methods", "GET");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  const { index } = req.query;

  const mockData = {
    spx: [4500, 4510, 4490, 4520, 4550],
    nasdaq: [14800, 14820, 14750, 14900, 15000],
    dow: [40400, 40550, 40600, 40750, 40800],
    msci: [1700, 1710, 1715, 1720, 1725],
    russell: [1880, 1885, 1890, 1900, 1910]
  };

  const selected = mockData[index] || mockData['spx'];
  const labels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'];

  res.status(200).json({ labels, values: selected });
}
