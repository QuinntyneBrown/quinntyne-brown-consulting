import { chromium, expect } from '@playwright/test';
import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { readFile, writeFile, stat, mkdir } from 'node:fs/promises';
import path from 'node:path';

const run = path.resolve(process.argv[2] || '');
const videoPath = path.join(run, 'workboard-group-hours.webm');
const take = JSON.parse(await readFile(path.join(run, 'take.json'), 'utf8'));
const size = (await stat(videoPath)).size;
const reviewDir = path.join(run, 'review');
await mkdir(reviewDir, { recursive: true });
const server = createServer((req, res) => {
  if (req.url === '/video.webm') {
    const range = req.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
    const start = range ? Number(range[1]) : 0;
    const end = range?.[2] ? Math.min(Number(range[2]), size - 1) : size - 1;
    if (start >= size) {
      res.writeHead(416);
      res.end();
      return;
    }
    res.writeHead(range ? 206 : 200, {
      'Content-Type': 'video/webm',
      'Accept-Ranges': 'bytes',
      'Content-Length': end - start + 1,
      ...(range ? { 'Content-Range': `bytes ${start}-${end}/${size}` } : {}),
    });
    createReadStream(videoPath, { start, end }).pipe(res);
  } else {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(
      '<!doctype html><style>body{margin:0;background:#102a43}video{display:block;width:1280px;height:720px}</style><video src="/video.webm" muted playsinline preload="auto"></video>',
    );
  }
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
let browser;
const deadline = setTimeout(() => {
  console.error('Video review deadline exceeded');
  process.exit(1);
}, 360000);
try {
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  page.setDefaultTimeout(15000);
  await page.goto(`http://127.0.0.1:${server.address().port}/`);
  await page.waitForFunction(() => document.querySelector('video').readyState >= 2);
  const metadata = await page.evaluate(() => {
    const v = document.querySelector('video');
    return { duration: v.duration, width: v.videoWidth, height: v.videoHeight };
  });
  expect(metadata.width).toBe(1280);
  expect(metadata.height).toBe(720);
  expect(metadata.duration).toBeGreaterThan(90);
  expect(metadata.duration).toBeLessThan(240);
  async function frame(seconds, filename) {
    await page.evaluate(async (seconds) => {
      const v = document.querySelector('video');
      v.pause();
      await new Promise((resolve) => {
        v.addEventListener('seeked', resolve, { once: true });
        v.currentTime = seconds;
      });
    }, seconds);
    const data = await page.evaluate(() => {
      const v = document.querySelector('video');
      const c = document.createElement('canvas');
      c.width = v.videoWidth;
      c.height = v.videoHeight;
      c.getContext('2d').drawImage(v, 0, 0);
      return c.toDataURL('image/png').split(',')[1];
    });
    await writeFile(filename, Buffer.from(data, 'base64'));
  }
  await frame(0.1, path.join(reviewDir, 'beginning.png'));
  for (let i = 0; i < take.chapters.length; i++) {
    await frame(
      take.chapters[i].seconds + 2,
      path.join(reviewDir, `chapter-${String(i).padStart(2, '0')}.png`),
    );
  }
  await frame(metadata.duration - 1, path.join(reviewDir, 'ending.png'));
  const posterTime =
    take.chapters.find((chapter) => chapter.title === 'Keep the total exact').seconds + 3;
  await frame(posterTime, path.join(run, 'workboard-group-hours-poster.png'));
  // Decode the whole encoded file at normal speed, checking progress and retaining
  // review frames from actual playback. Human visual review is still required before promotion.
  await page.evaluate(async () => {
    const v = document.querySelector('video');
    v.currentTime = 0;
    v.playbackRate = 1;
    await v.play();
  });
  let lastTime = -1;
  let count = 0;
  const playback = [];
  while (true) {
    await page.waitForTimeout(4000);
    const state = await page.evaluate(() => {
      const v = document.querySelector('video');
      return {
        time: v.currentTime,
        ended: v.ended,
        error: v.error?.message,
        readyState: v.readyState,
      };
    });
    expect(state.error).toBeUndefined();
    expect(state.time).toBeGreaterThan(lastTime);
    lastTime = state.time;
    playback.push(state);
    await page.screenshot({
      path: path.join(reviewDir, `play-${String(count++).padStart(2, '0')}.png`),
    });
    console.log(`Playback ${state.time.toFixed(1)} / ${metadata.duration.toFixed(1)} seconds`);
    if (state.ended) break;
  }
  await writeFile(
    path.join(run, 'media.json'),
    JSON.stringify(
      { ...metadata, bytes: size, posterTime, playback, chapters: take.chapters },
      null,
      2,
    ),
  );
  console.log(
    'Full encoded-video playback completed. Inspect review frames and chapters before promotion.',
  );
} finally {
  clearTimeout(deadline);
  await browser?.close();
  await new Promise((resolve) => server.close(resolve));
}
