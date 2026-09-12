import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');

/**
 * Files exempt from the hardcoded-styling checks.
 *
 * This is EMPTY and must stay empty — the Design System v1.0 migration is
 * complete. If a new file needs a color, the color belongs in src/global.css
 * as a token; adding an entry here is not the fix.
 */
const ALLOWLIST: string[] = [];

/** Directories and files the guard never inspects. */
const SKIP_DIRS = ['assets', 'node_modules'];
const SKIP_FILES = ['global.css', 'uniwind-types.d.ts', 'env.d.ts'];

/**
 * Empty, and must stay empty: nothing may import the deleted theme modules.
 */
const DEAD_IMPORT_ALLOWLIST: string[] = [];

const HEX = /#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{1,5})?\b/;
const DARK_VARIANT = /(?:^|["'`\s{])dark:/;

/**
 * Matches any import of the deleted theme modules regardless of how the path
 * is spelled — '@/store/theme.store', './src/store/theme.store',
 * '../../theme', '@/theme/index'.
 */
const DEAD_IMPORT =
  /from\s+['"](?:[^'"]*\/)?(?:store\/theme\.store|theme(?:\/index)?)['"]/;

function collect(dir: string, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.includes(entry.name)) continue;
      collect(path.join(dir, entry.name), out);
      continue;
    }
    if (!/\.tsx?$/.test(entry.name)) continue;
    if (SKIP_FILES.includes(entry.name)) continue;
    out.push(path.join(dir, entry.name));
  }
  return out;
}

/** Source files under src/, plus App.tsx, as paths relative to src/. */
function sourceFiles(): { rel: string; abs: string }[] {
  const files = collect(SRC).map(abs => ({
    rel: path.relative(SRC, abs).split(path.sep).join('/'),
    abs,
  }));
  files.push({ rel: '../App.tsx', abs: path.join(ROOT, 'App.tsx') });
  return files;
}

/** Returns "line-number: line-content" for each line matching pattern. */
function offendingLines(abs: string, pattern: RegExp): string[] {
  return fs
    .readFileSync(abs, 'utf8')
    .split('\n')
    .map((line, i) => ({ line, n: i + 1 }))
    .filter(({ line }) => pattern.test(line))
    .map(({ line, n }) => `${n}: ${line.trim()}`);
}

describe('design token guard', () => {
  const files = sourceFiles();
  const guarded = files.filter(f => !ALLOWLIST.includes(f.rel));

  it('finds source files to check', () => {
    expect(files.length).toBeGreaterThan(10);
  });

  it.each(guarded)('$rel has no hardcoded hex color', ({ rel, abs }) => {
    // Compared as a string so a failure prints the offending line, not just "[]".
    const hits = offendingLines(abs, HEX);
    expect(`${rel}: ${hits.join(' | ')}`).toBe(`${rel}: `);
  });

  it.each(guarded)('$rel has no dark: variant', ({ rel, abs }) => {
    const hits = offendingLines(abs, DARK_VARIANT);
    expect(`${rel}: ${hits.join(' | ')}`).toBe(`${rel}: `);
  });

  it.each(files.filter(f => !DEAD_IMPORT_ALLOWLIST.includes(f.rel)))(
    '$rel does not import a deleted theme module',
    ({ rel, abs }) => {
      const hits = offendingLines(abs, DEAD_IMPORT);
      expect(`${rel}: ${hits.join(' | ')}`).toBe(`${rel}: `);
    },
  );

  it('allowlist is empty — the migration is complete', () => {
    expect(ALLOWLIST).toEqual([]);
  });

  it('dead-import allowlist is empty', () => {
    expect(DEAD_IMPORT_ALLOWLIST).toEqual([]);
  });

  it('allowlist only names files that exist', () => {
    const missing = ALLOWLIST.filter(
      rel => !fs.existsSync(path.join(SRC, rel)),
    );
    expect(missing).toEqual([]);
  });
});
