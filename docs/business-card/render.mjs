#!/usr/bin/env node
// Renders business-card.html to business-card.pdf, front.png, and back.png with a local
// Chromium driven over the DevTools protocol. Needs Node 22 or later and nothing from npm.
//
//   node render.mjs                  finds Chrome, Edge, or a Playwright Chromium on this machine
//   node render.mjs --chrome <path>  uses that browser
//   CHROME_PATH=<path> node render.mjs
//
// The PDF has one page per side at 3.75 × 2.25 in (trim plus bleed) with Archivo embedded.
// The PNGs are the same bleed area at 300 dpi. Archivo comes from Google Fonts, so the first
// render on a machine needs network access.

import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const pageUrl = pathToFileURL(join(here, 'business-card.html')).href;

// Bleed size in CSS pixels (96 per inch), and the scale that turns it into a 300 dpi bitmap.
const BLEED_W_PX = 360;
const BLEED_H_PX = 216;
const BLEED_W_IN = 3.75;
const BLEED_H_IN = 2.25;
const PNG_SCALE = 300 / 96;

function findChrome() {
  const flag = process.argv.indexOf('--chrome');
  const explicit = flag >= 0 ? process.argv[flag + 1] : process.env.CHROME_PATH;
  if (explicit) {
    if (!existsSync(explicit)) throw new Error(`No browser at ${explicit}`);
    return explicit;
  }

  const candidates = [];
  const playwright =
    process.platform === 'win32' ? join(process.env.LOCALAPPDATA ?? '', 'ms-playwright')
    : process.platform === 'darwin' ? join(process.env.HOME ?? '', 'Library/Caches/ms-playwright')
    : join(process.env.HOME ?? '', '.cache/ms-playwright');
  if (existsSync(playwright)) {
    // Newest build first. The headless shell is preferred: it is built for this job and
    // starts without the browser UI that the full build brings up even when headless.
    const builds = readdirSync(playwright)
      .map(name => name.match(/^(chromium_headless_shell|chromium)-(\d+)$/))
      .filter(Boolean)
      .sort((a, b) => Number(b[2]) - Number(a[2]) || (a[1] === 'chromium' ? 1 : -1));
    for (const [build, kind] of builds) {
      if (kind === 'chromium_headless_shell') {
        candidates.push(
          join(playwright, build, 'chrome-headless-shell-win64', 'chrome-headless-shell.exe'),
          join(playwright, build, 'chrome-headless-shell-linux64', 'chrome-headless-shell'),
          join(playwright, build, 'chrome-headless-shell-mac-arm64', 'chrome-headless-shell'),
          join(playwright, build, 'chrome-headless-shell-mac-x64', 'chrome-headless-shell'),
        );
      } else {
        candidates.push(
          join(playwright, build, 'chrome-win64', 'chrome.exe'),
          join(playwright, build, 'chrome-win', 'chrome.exe'),
          join(playwright, build, 'chrome-linux', 'chrome'),
          join(playwright, build, 'chrome-mac', 'Chromium.app', 'Contents', 'MacOS', 'Chromium'),
        );
      }
    }
  }
  candidates.push(
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    join(process.env.LOCALAPPDATA ?? '', 'Google/Chrome/Application/chrome.exe'),
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
  );

  const found = candidates.find(path => existsSync(path));
  if (!found) throw new Error('No Chrome or Chromium found. Pass --chrome <path> or set CHROME_PATH.');
  return found;
}

function launch(chrome) {
  const profile = mkdtempSync(join(tmpdir(), 'qbc-card-'));
  const child = spawn(chrome, [
    '--headless',
    '--remote-debugging-port=0',
    '--remote-allow-origins=*',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-gpu',
    '--hide-scrollbars',
    // The full browser build starts sync, translation, and other background services
    // even when headless, and its first page crashed under them. The headless shell
    // ignores these flags.
    '--disable-background-networking',
    '--disable-sync',
    '--disable-features=Translate,OptimizationHints,MediaRouter',
    `--user-data-dir=${profile}`,
    'about:blank',
  ], { stdio: ['ignore', 'pipe', 'pipe'] });

  const ready = new Promise((resolve, reject) => {
    let text = '';
    const onData = chunk => {
      text += chunk;
      const match = text.match(/DevTools listening on (ws:\/\/\S+)/);
      if (match) resolve(match[1]);
    };
    child.stderr.on('data', onData);
    child.stdout.on('data', onData);
    child.on('exit', code => reject(new Error(`The browser exited early with code ${code}\n${text}`)));
    setTimeout(() => reject(new Error(`The browser did not start within 20 s\n${text}`)), 20_000).unref();
  });

  const stop = async () => {
    try { child.kill(); } catch { /* already gone */ }
    await new Promise(resolve => setTimeout(resolve, 500));
    try { rmSync(profile, { recursive: true, force: true }); } catch { /* still locked; the OS temp dir will take it */ }
  };

  return { ready, stop };
}

class Cdp {
  static connect(url) {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(url);
      ws.addEventListener('open', () => resolve(new Cdp(ws)));
      ws.addEventListener('error', () => reject(new Error(`Could not connect to ${url}`)));
    });
  }

  constructor(ws) {
    this.ws = ws;
    this.nextId = 0;
    this.pending = new Map();
    this.listeners = new Map();
    ws.addEventListener('message', event => {
      const message = JSON.parse(event.data);
      if (message.id) {
        const call = this.pending.get(message.id);
        this.pending.delete(message.id);
        if (message.error) call.reject(new Error(`${message.error.message} (${message.error.code})`));
        else call.resolve(message.result);
      } else if (message.method) {
        for (const listener of this.listeners.get(message.method) ?? []) listener(message.params);
      }
    });
  }

  send(method, params = {}) {
    const id = ++this.nextId;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => this.pending.set(id, { resolve, reject }));
  }

  once(method) {
    return new Promise(resolve => {
      const listener = params => {
        this.listeners.get(method).delete(listener);
        resolve(params);
      };
      if (!this.listeners.has(method)) this.listeners.set(method, new Set());
      this.listeners.get(method).add(listener);
    });
  }

  close() { this.ws.close(); }
}

async function open(cdp, url) {
  await cdp.send('Page.enable');
  const loaded = cdp.once('Page.loadEventFired');
  await cdp.send('Page.navigate', { url });
  await loaded;
  const { result } = await cdp.send('Runtime.evaluate', {
    expression: `document.fonts.ready.then(() =>
      [...document.fonts].some(face => face.family.includes('Archivo') && face.status === 'loaded'))`,
    awaitPromise: true,
    returnByValue: true,
  });
  if (!result.value) console.warn('warning: Archivo did not load, so this render uses the fallback font.');
}

async function renderPng(cdp, side, file) {
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: BLEED_W_PX, height: BLEED_H_PX, deviceScaleFactor: PNG_SCALE, mobile: false,
  });
  await open(cdp, `${pageUrl}?side=${side}`);
  const { data } = await cdp.send('Page.captureScreenshot', {
    format: 'png',
    clip: { x: 0, y: 0, width: BLEED_W_PX, height: BLEED_H_PX, scale: 1 },
  });
  writeFileSync(file, Buffer.from(data, 'base64'));
}

async function renderPdf(cdp, file) {
  await cdp.send('Emulation.clearDeviceMetricsOverride');
  await open(cdp, pageUrl);
  const { data } = await cdp.send('Page.printToPDF', {
    printBackground: true,
    preferCSSPageSize: true,
    paperWidth: BLEED_W_IN,
    paperHeight: BLEED_H_IN,
    marginTop: 0, marginBottom: 0, marginLeft: 0, marginRight: 0,
    displayHeaderFooter: false,
  });
  writeFileSync(file, Buffer.from(data, 'base64'));
}

const chrome = findChrome();
console.log(`Rendering with ${chrome}`);
const browser = launch(chrome);
try {
  const port = new URL(await browser.ready).port;
  const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  const page = targets.find(target => target.type === 'page');
  if (!page) throw new Error('The browser opened no page target.');

  const cdp = await Cdp.connect(page.webSocketDebuggerUrl);
  try {
    await renderPng(cdp, 'front', join(here, 'front.png'));
    await renderPng(cdp, 'back', join(here, 'back.png'));
    await renderPdf(cdp, join(here, 'business-card.pdf'));
  } finally {
    cdp.close();
  }
  console.log('Wrote front.png, back.png, and business-card.pdf');
} finally {
  await browser.stop();
}
