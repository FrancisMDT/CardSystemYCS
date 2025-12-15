const { createServer } = require("https");
const { parse } = require("url");
const next = require("next");
const fs = require("fs");
const path = require("path");

const dev = true;
const app = next({ dev });
const handle = app.getRequestHandler();

const httpsOptions = {
  key: fs.readFileSync(path.join(__dirname, "certs/192.168.0.94+1-key.pem")),
  cert: fs.readFileSync(path.join(__dirname, "certs/192.168.0.94+1.pem")),
};

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(3001, "0.0.0.0", () => {
    console.log("> Next.js dev server running on https://192.168.0.94:3001");
  });
});
