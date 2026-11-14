'use strict';
// Tiny static server for previewing dist/: node scripts/serve.js [port]
const http = require('http'); const fs = require('fs'); const path = require('path');
const DIST = path.join(__dirname, '..', 'dist'); const port = Number(process.argv[2]) || 8787;
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.xml': 'application/xml', '.txt': 'text/plain' };
http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p.endsWith('/')) p += 'index.html';
  let file = path.join(DIST, p);
  if (!file.startsWith(DIST)) { res.writeHead(403); return res.end(); }
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) { res.writeHead(301, { Location: p + '/' }); return res.end(); }
  if (!fs.existsSync(file)) { file = path.join(DIST, '404.html'); res.statusCode = 404; }
  res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
  fs.createReadStream(file).pipe(res);
}).listen(port, () => console.log(`Serving dist/ at http://localhost:${port}/`));
