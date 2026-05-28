import fs from 'fs';
import path from 'path';
import { describe, expect, test } from 'vitest';

describe('workspace hygiene', () => {
  test('ignores local agent worktrees', () => {
    const gitignore = fs.readFileSync(path.join(process.cwd(), '.gitignore'), 'utf8');
    expect(gitignore.split(/\r?\n/)).toContain('.claude/');
  });
});
