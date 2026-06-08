const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn, spawnSync } = require('child_process');

const root = path.join(process.cwd(), 'Frontend', 'public');
const port = Number(process.env.FE_PORT || 5173);

function getTscPath() {
  try {
    return require.resolve('typescript/bin/tsc');
  } catch (err) {
    console.error('TypeScript не знайдено. Спочатку виконай: npm install');
    process.exit(1);
  }
}

function runTscOnce() {
  const tscPath = getTscPath();
  const result = spawnSync(process.execPath, [tscPath, '-p', 'Frontend/tsconfig.json'], {
    stdio: 'inherit',
    shell: false,
  });
  if (result.error) {
    console.error('Не вдалося запустити TypeScript:', result.error.message);
    process.exit(1);
  }
  if (result.status !== 0) process.exit(result.status || 1);
}

function runTscWatch() {
  const tscPath = getTscPath();
  const child = spawn(process.execPath, [tscPath, '-p', 'Frontend/tsconfig.json', '--watch', '--preserveWatchOutput'], {
    stdio: 'inherit',
    shell: false,
  });
  child.on('error', (err) => console.error('Помилка TypeScript watch:', err.message));
  process.on('exit', () => child.kill());
}

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

function safePath(url) {
  const parsed = new URL(url, `http://localhost:${port}`);
  let pathname = decodeURIComponent(parsed.pathname);
  if (pathname === '/') pathname = '/index.html';
  const filePath = path.normalize(path.join(root, pathname));
  if (!filePath.startsWith(root)) return null;
  return filePath;
}

runTscOnce();
runTscWatch();

const server = http.createServer((req, res) => {
  const filePath = safePath(req.url || '/');
  if (!filePath) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }
  fs.readFile(filePath, (err, data) => {
    if (err) {
      fs.readFile(path.join(root, 'index.html'), (indexErr, indexData) => {
        if (indexErr) {
          res.writeHead(404);
          res.end('Not found');
          return;
        }
        res.writeHead(200, { 'Content-Type': mime['.html'] });
        res.end(indexData);
      });
      return;
    }
    res.writeHead(200, { 'Content-Type': mime[path.extname(filePath)] || 'application/octet-stream' });
    res.end(data);
  });
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Порт ${port} уже зайнятий. Закрий попередній frontend-сервер або зміни порт FE_PORT.`);
  } else {
    console.error('Помилка frontend-сервера:', err.message);
  }
  process.exit(1);
});

server.listen(port, () => {
  console.log(`Frontend is running on http://localhost:${port}`);
});
