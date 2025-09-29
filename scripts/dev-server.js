#!/usr/bin/env node
const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const rootDir = path.resolve(__dirname, '..');
const port = Number(process.env.PORT || 4173);

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8'
};

function resolvePath(requestPath) {
  let relativePath = decodeURIComponent(requestPath.split('?')[0]);
  if (relativePath.endsWith('/')) {
    relativePath = path.join(relativePath, 'index.html');
  }
  const resolved = path.join(rootDir, relativePath);
  if (!resolved.startsWith(rootDir)) {
    return null;
  }
  return resolved;
}

function sendFile(res, filePath) {
  fs.stat(filePath, (statErr, stats) => {
    if (statErr || !stats.isFile()) {
      sendNotFound(res);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const mime = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': mime,
      'Content-Length': stats.size,
      'Cache-Control': 'no-cache'
    });

    const stream = fs.createReadStream(filePath);
    stream.on('error', () => sendServerError(res));
    stream.pipe(res);
  });
}

function sendNotFound(res) {
  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Not found');
}

function sendServerError(res) {
  if (res.headersSent) {
    res.end();
    return;
  }
  res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Server error');
}

const server = http.createServer((req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const filePath = resolvePath(url.pathname);
    if (!filePath) {
      sendNotFound(res);
      return;
    }
    fs.access(filePath, fs.constants.F_OK, err => {
      if (err) {
        sendNotFound(res);
        return;
      }
      sendFile(res, filePath);
    });
  } catch (error) {
    sendServerError(res);
  }
});

server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Static server running at http://127.0.0.1:${port}`);
});
