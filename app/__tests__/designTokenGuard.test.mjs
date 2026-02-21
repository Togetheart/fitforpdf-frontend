import assert from 'node:assert/strict';
import test from 'node:test';
import { readdir, readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';

const COMPONENTS_DIR = join(import.meta.dirname, '..', 'components');
const PAGES = [
  join(import.meta.dirname, '..', 'page.jsx'),
  join(import.meta.dirname, '..', 'pricing', 'page.jsx'),
  join(import.meta.dirname, '..', 'privacy', 'page.jsx'),
  join(import.meta.dirname, '..', 'success', 'page.js'),
];

// Hex colors that should never appear — brand accent must use Tailwind tokens
const BANNED_HEX = /#(?:D92D2A|d92d2a|B92524|b92524|B62622|b62622|DC2626|dc2626|B91C1C|b91c1c|0071E3|0071e3|005BBB|005bbb)\b/g;

// Tailwind !important overrides are a code smell — tokens should be used instead
const BANNED_IMPORTANT = /!(bg|text|border)-/g;

// White (#FFF, #FFFFFF, #fff, #ffffff) is allowed — it's a universal constant
const ALLOWED_HEX = /^#(?:fff|ffffff|FFF|FFFFFF|000|000000)$/i;

async function collectFiles(dir, extensions = ['.jsx', '.js', '.mjs']) {
  const entries = await readdir(dir, { withFileTypes: true, recursive: true });
  return entries
    .filter((e) => e.isFile() && extensions.includes(extname(e.name)))
    .map((e) => join(e.parentPath || dir, e.name));
}

async function scanFiles(files) {
  const hexViolations = [];
  const importantViolations = [];

  for (const filePath of files) {
    const content = await readFile(filePath, 'utf-8');
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNum = i + 1;

      // Check banned hex
      let match;
      BANNED_HEX.lastIndex = 0;
      while ((match = BANNED_HEX.exec(line)) !== null) {
        if (!ALLOWED_HEX.test(match[0])) {
          hexViolations.push({ file: filePath, line: lineNum, match: match[0], context: line.trim() });
        }
      }

      // Check !important overrides
      BANNED_IMPORTANT.lastIndex = 0;
      while ((match = BANNED_IMPORTANT.exec(line)) !== null) {
        importantViolations.push({ file: filePath, line: lineNum, match: match[0], context: line.trim() });
      }
    }
  }

  return { hexViolations, importantViolations };
}

test('components must not contain hardcoded accent hex colors', async () => {
  const componentFiles = await collectFiles(COMPONENTS_DIR);
  const { hexViolations } = await scanFiles(componentFiles);

  if (hexViolations.length > 0) {
    const details = hexViolations
      .map((v) => `  ${v.file}:${v.line} — ${v.match}\n    ${v.context}`)
      .join('\n');
    assert.fail(`Found ${hexViolations.length} hardcoded accent hex color(s) in components:\n${details}\n\nUse Tailwind accent tokens (bg-accent, text-accent, border-accent) instead.`);
  }
});

test('components must not use Tailwind !important overrides', async () => {
  const componentFiles = await collectFiles(COMPONENTS_DIR);
  const { importantViolations } = await scanFiles(componentFiles);

  if (importantViolations.length > 0) {
    const details = importantViolations
      .map((v) => `  ${v.file}:${v.line} — ${v.match}\n    ${v.context}`)
      .join('\n');
    assert.fail(`Found ${importantViolations.length} Tailwind !important override(s) in components:\n${details}\n\nUse proper token variants instead of !important.`);
  }
});

test('page files must not contain hardcoded accent hex colors', async () => {
  const existingPages = [];
  for (const p of PAGES) {
    try {
      await readFile(p, 'utf-8');
      existingPages.push(p);
    } catch {
      // skip missing pages
    }
  }

  const { hexViolations } = await scanFiles(existingPages);

  if (hexViolations.length > 0) {
    const details = hexViolations
      .map((v) => `  ${v.file}:${v.line} — ${v.match}\n    ${v.context}`)
      .join('\n');
    assert.fail(`Found ${hexViolations.length} hardcoded accent hex color(s) in pages:\n${details}\n\nUse Tailwind accent tokens instead.`);
  }
});

test('page files must not use Tailwind !important overrides', async () => {
  const existingPages = [];
  for (const p of PAGES) {
    try {
      await readFile(p, 'utf-8');
      existingPages.push(p);
    } catch {
      // skip missing pages
    }
  }

  const { importantViolations } = await scanFiles(existingPages);

  if (importantViolations.length > 0) {
    const details = importantViolations
      .map((v) => `  ${v.file}:${v.line} — ${v.match}\n    ${v.context}`)
      .join('\n');
    assert.fail(`Found ${importantViolations.length} Tailwind !important override(s) in pages:\n${details}\n\nUse proper token variants instead of !important.`);
  }
});
