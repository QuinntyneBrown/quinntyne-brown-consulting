import { rmSync } from 'node:fs';
import { resolve } from 'node:path';

const database = resolve(process.cwd(), '../backend/src/Qbc.Workboard.Api/playwright.db');
for (const suffix of ['', '-shm', '-wal']) rmSync(`${database}${suffix}`, { force: true });
