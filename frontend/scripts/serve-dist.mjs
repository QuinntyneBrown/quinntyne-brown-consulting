import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Serves the built application to the acceptance suite. The suite reads the product the way a
 * visitor does, so it is pointed at the bundle that gets deployed rather than at the development
 * server, which compiles each route on demand and does not publish what the deployed bundle ships.
 */
const root = resolve(fileURLToPath(new URL('../dist/qbc-workboard/browser/', import.meta.url)));
const port = Number(process.env.QBC_SERVE_PORT ?? 4200);
const host = process.env.QBC_SERVE_HOST ?? '127.0.0.1';
const index = join(root, 'index.html');

/**
 * Module scripts and module workers are refused unless they arrive as JavaScript, and the brief
 * editor loads both, so a served file states its type rather than falling back to bytes.
 */
const contentTypes = {
  '.css': 'text/css',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.map': 'application/json',
  '.mjs': 'text/javascript',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ttf': 'font/ttf',
  '.webmanifest': 'application/manifest+json',
  '.woff2': 'font/woff2',
};

if (!existsSync(index)) {
  console.error(
    `No build was found at ${root}\nRun "npm run build" before the acceptance suite, so it reads the bundle that gets deployed.`,
  );
  process.exit(1);
}

function fileFor(pathname) {
  const requested = resolve(root, `.${pathname}`);
  // A request that climbs out of the build is refused rather than served.
  if (requested !== root && !requested.startsWith(root + sep)) return null;
  if (existsSync(requested) && statSync(requested).isFile()) return requested;
  // Addresses the product routes itself carry no extension and are answered by the shell. An
  // asset that names a file and is missing is reported as missing: answering it with the shell
  // would fail the browser's type check instead, which reads as a timeout rather than a 404.
  return extname(requested) === '' ? index : null;
}

createServer((request, response) => {
  const { pathname } = new URL(request.url ?? '/', `http://${host}:${port}`);
  const file = fileFor(decodeURIComponent(pathname));

  if (file === null) {
    response.writeHead(404, { 'content-type': 'text/plain' });
    response.end(`Not found: ${pathname}`);
    return;
  }

  response.writeHead(200, {
    'content-type': contentTypes[extname(file)] ?? 'application/octet-stream',
    'cache-control': 'no-store',
  });
  createReadStream(file).pipe(response);
}).listen(port, host, () => console.log(`Serving the build on http://${host}:${port}`));
