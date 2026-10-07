import { readFile, copyFile, mkdir, rename, stat, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const run = path.resolve(process.argv[2] || '');
if (!process.argv.includes('--reviewed'))
  throw new Error(
    'Review encoded playback, caption readability, chapters and outcomes before passing --reviewed.',
  );
const repo = fileURLToPath(new URL('../../../', import.meta.url));
const final = path.join(repo, 'docs/demo');
const media = JSON.parse(await readFile(path.join(run, 'media.json'), 'utf8'));
const take = JSON.parse(await readFile(path.join(run, 'take.json'), 'utf8'));
if (!media.playback.at(-1)?.ended || take.assertions.finalHours !== 13.5)
  throw new Error('Playback or workflow verification missing.');
const stem = 'workboard-group-hours';
const names = [
  `${stem}.webm`,
  `${stem}-poster.png`,
  `${stem}.chapters.json`,
  `${stem}.vtt`,
  'README.md',
];
const time = (seconds) => new Date(Math.round(seconds * 1000)).toISOString().slice(11, 23);
await writeFile(
  path.join(run, `${stem}.chapters.json`),
  JSON.stringify(
    {
      ...media,
      playback: undefined,
      revision: take.revision,
      chapters: media.chapters,
      assertions: take.assertions,
    },
    null,
    2,
  ),
);
await writeFile(
  path.join(run, `${stem}.vtt`),
  'WEBVTT\n\n' +
    take.captions
      .map((c, i) => `${i + 1}\n${time(c.start)} --> ${time(c.end)}\n${c.title}\n${c.body}\n`)
      .join('\n'),
);
await mkdir(final, { recursive: true });
const readme = await readFile(path.join(final, 'README.md'), 'utf8');
const markers =
  /<!-- group-hours-measurements:start -->[\s\S]*?<!-- group-hours-measurements:end -->/;
if (!markers.test(readme))
  throw new Error('README measurement markers missing; refusing to overwrite manual text.');
const stamp = (seconds) =>
  `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
const block = [
  '<!-- group-hours-measurements:start -->',
  `**Measured video:** ${media.duration.toFixed(2)} seconds (${stamp(media.duration)}), ${media.width} × ${media.height}, ${(media.bytes / 1048576).toFixed(2)} MiB (${media.bytes.toLocaleString('en-US')} bytes).`,
  '',
  `The [poster](${stem}-poster.png) is a decoded frame at ${media.posterTime.toFixed(2)} seconds. Full normal-speed browser playback completed without media errors. All chapters, captions, important outcomes, the beginning and ending were visually reviewed.`,
  '',
  '| Time | Verified workflow |',
  '| --- | --- |',
  ...media.chapters.map((chapter) => `| ${stamp(chapter.seconds)} | ${chapter.title} |`),
  '',
  'Chapter events were measured from capture start and checked against the encoded playback. The subsecond page load at the beginning is retained as part of the continuous take.',
  '<!-- group-hours-measurements:end -->',
].join('\n');
await writeFile(path.join(run, 'README.md'), readme.replace(markers, block));
const backup = path.join(run, 'promotion-backup');
await mkdir(backup, { recursive: true });
const existed = new Set();
const promoted = [];
try {
  for (const name of names) {
    try {
      await stat(path.join(final, name));
      existed.add(name);
      await copyFile(path.join(final, name), path.join(backup, name));
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
    await copyFile(path.join(run, name), path.join(final, `${name}.staged`));
  }
  for (const name of names) {
    await rename(path.join(final, `${name}.staged`), path.join(final, name));
    promoted.push(name);
  }
} catch (error) {
  for (const name of promoted) {
    if (existed.has(name)) await copyFile(path.join(backup, name), path.join(final, name));
    else await rm(path.join(final, name), { force: true });
  }
  throw error;
} finally {
  for (const name of names) await rm(path.join(final, `${name}.staged`), { force: true });
}
console.log(`Promoted verified recording to ${final}`);
