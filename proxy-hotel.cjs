
const http = require("http");
const httpProxy = require("http-proxy");

const proxy = httpProxy.createProxyServer({
  target: "http://127.0.0.1:8000",
  changeOrigin: true,
});

proxy.on("error", (error, req, res) => {
  console.error("Error al conectar con Django:", error.message);

  if (!res.headersSent) {
    res.writeHead(502, {
      "Content-Type": "application/json",
    });
  }

  if (!res.writableEnded) {
    res.end(
      JSON.stringify({
        error: "No se pudo conectar con Django.",
      })
    );
  }
});

const servidor = http.createServer((req, res) => {
  proxy.web(req, res);
});

servidor.listen(8082, "0.0.0.0", () => {
  console.log("Proxy hotel funcionando en puerto 8082");
  console.log("Destino Django: http://127.0.0.1:8000");
});
