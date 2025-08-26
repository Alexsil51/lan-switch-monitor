const express = require("express");
const cors = require("cors");
const ping = require("ping");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// Servir HTML, CSS e JS do front-end
app.use(express.static(path.join(__dirname, "../public")));

// Rota de teste para acessar pelo navegador
app.get("/", (req, res) => {
  res.send("API funcionando na rede!");
});

app.post("/api/ping", async (req, res) => {
  const { host } = req.body;
  if (!host) {
    return res.status(400).json({ error: "host é obrigatório" });
  }

  const result = await ping.promise.probe(host, { timeout: 2 });
  res.json({
    host,
    alive: result.alive,
    timeMs: result.time || null,
  });
});

app.post("/api/ping/bulk", async (req, res) => {
  const { hosts = [] } = req.body;
  const tasks = hosts.map(async (h) => {
    const r = await ping.promise.probe(h, { timeout: 2 });
    return { host: h, alive: r.alive, timeMs: r.time || null };
  });
  res.json({ results: await Promise.all(tasks) });
});

const PORT = 3000;
const HOST = '0.0.0.0'; // aceita conexões externas
app.listen(PORT, HOST, () => console.log(`API rodando em http://${HOST}:${PORT}`));

