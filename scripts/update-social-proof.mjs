#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MIN = 1053;
const MAX = 1297;

// Deterministic from the Monday of the current ISO week.
// → same result all week, changes Sunday 23:59 → Monday 00:00.
function getWeeklyCount() {
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  monday.setHours(0, 0, 0, 0);
  const seed = Math.floor(monday.getTime() / 86400000); // days since epoch
  const rand = ((seed * 1664525 + 1013904223) >>> 0) / 0xffffffff; // LCG
  return Math.round(MIN + rand * (MAX - MIN));
}

const count = getWeeklyCount();
const formatted = count.toLocaleString('en-US');

const filePath = resolve(__dirname, '../app/siteCopy.mjs');
const src = readFileSync(filePath, 'utf8');
const updated = src.replace(
  /socialProofCount:\s*'[\d,]+'/,
  `socialProofCount: '${formatted}'`,
);

if (updated === src) {
  console.log(`No change — already: ${formatted}`);
} else {
  writeFileSync(filePath, updated, 'utf8');
  console.log(`✓ socialProofCount updated → ${formatted}`);
}
