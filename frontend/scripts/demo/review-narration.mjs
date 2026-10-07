import { chromium } from '@playwright/test';
import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

const run = path.resolve(process.argv[2]);
const filename = path.join(run, 'workboard-group-hours-narrated.webm');
const reportFile = path.join(run, 'workboard-group-hours-narrated.verification.json');
const report = JSON.parse(await readFile(reportFile, 'utf8'));
const size = (await stat(filename)).size;
const server = createServer((req, res) => {
  if (req.url !== '/video') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('<video src="/video" preload="auto" style="width:1280px;height:720px"></video>');
    return;
  }
  const range = req.headers.range?.match(/bytes=(\d+)-(\d*)/);
  const start = range ? Number(range[1]) : 0;
  const end = range?.[2] ? Math.min(Number(range[2]), size - 1) : size - 1;
  res.writeHead(range ? 206 : 200, {
    'Content-Type': 'video/webm',
    'Content-Length': end - start + 1,
    'Accept-Ranges': 'bytes',
    ...(range ? { 'Content-Range': `bytes ${start}-${end}/${size}` } : {}),
  });
  createReadStream(filename, { start, end }).pipe(res);
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
let browser;
const deadline = setTimeout(async () => {
  console.error('Narration playback exceeded 150 seconds.');
  process.exitCode = 1;
  await browser?.close();
}, 150000);
try {
  browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto(`http://127.0.0.1:${server.address().port}`);
  await page.waitForFunction(() => document.querySelector('video').readyState >= 2);
  const playback = await page.evaluate(async (segments) => {
    const video = document.querySelector('video');
    const audio = new AudioContext();
    const input = audio.createMediaElementSource(video);
    const analyser = audio.createAnalyser();
    analyser.fftSize = 2048;
    const silentOutput = audio.createGain();
    silentOutput.gain.value = 0;
    input.connect(analyser);
    analyser.connect(silentOutput);
    silentOutput.connect(audio.destination);
    await audio.resume();
    const peaks = segments.map(() => 0);
    const values = new Float32Array(analyser.fftSize);
    const timer = setInterval(() => {
      analyser.getFloatTimeDomainData(values);
      const rms = Math.sqrt(values.reduce((sum, x) => sum + x * x, 0) / values.length);
      segments.forEach((segment, i) => {
        if (video.currentTime >= segment.start && video.currentTime <= segment.end)
          peaks[i] = Math.max(peaks[i], rms);
      });
    }, 100);
    const finished = new Promise((resolve, reject) => {
      video.onended = resolve;
      video.onerror = () => reject(new Error(video.error?.message || 'Video playback failed'));
    });
    await video.play();
    await finished;
    clearInterval(timer);
    const result = {
      duration: video.duration,
      width: video.videoWidth,
      height: video.videoHeight,
      ended: video.ended,
      segmentRmsPeaks: peaks,
      decodedAudioBytes: video.webkitAudioDecodedByteCount,
    };
    await audio.close();
    return result;
  }, report.segments);
  if (
    !playback.ended ||
    playback.width !== 1280 ||
    playback.height !== 720 ||
    playback.segmentRmsPeaks.some((rms) => rms < 0.01)
  )
    throw new Error('Playback or audible speech check failed');
  report.browserPlayback = playback;
  await writeFile(reportFile, JSON.stringify(report, null, 2) + '\n');
  console.log(
    'Full narrated playback passed: audio present in all 13 scenes, 1280 × 720, no playback errors.',
  );
} finally {
  clearTimeout(deadline);
  await browser?.close();
  await new Promise((resolve) => server.close(resolve));
}
