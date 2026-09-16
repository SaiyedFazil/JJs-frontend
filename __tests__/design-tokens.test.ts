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

/**
 * Lottie files are the one place a colour legitimately lives outside
 * global.css, because the animation format bakes them in — so SKIP_DIRS
 * excludes src/assets and nothing else checks them.
 *
 * They still have to match the design system. A Lottie carries colour in two
 * unrelated shapes: shape fills and strokes use `c.k` as normalised RGBA, while
 * solid layers use a plain `sc` hex string. Missing the second kind is exactly
 * how a full-screen navy background survived the first splash retheme.
 */
describe('Lottie animations use design system colors', () => {
  const ANIMATIONS = path.join(SRC, 'assets', 'animations');

  /** Every colour in the file, from both representations, as lowercase hex. */
  function lottieColors(abs: string): string[] {
    const found = new Set<string>();
    const toHex = (c: number[]) =>
      '#' +
      c
        .slice(0, 3)
        .map(x =>
          Math.round(x * 255)
            .toString(16)
            .padStart(2, '0'),
        )
        .join('');

    (function walk(node: unknown) {
      if (Array.isArray(node)) return node.forEach(walk);
      if (!node || typeof node !== 'object') return;
      const o = node as Record<string, any>;

      // Shape fills and strokes: normalised RGBA in c.k
      if (
        (o.ty === 'fl' || o.ty === 'st') &&
        Array.isArray(o.c?.k) &&
        o.c.k.every((x: unknown) => typeof x === 'number')
      ) {
        found.add(toHex(o.c.k));
      }
      // Solid layers: a plain hex string in sc
      if (o.ty === 1 && typeof o.sc === 'string') {
        found.add(o.sc.toLowerCase());
      }

      Object.values(o).forEach(walk);
    })(JSON.parse(fs.readFileSync(abs, 'utf8')));

    return [...found];
  }

  /**
   * Ink 900 and Cream 50 (the PDF's hero surface pairing), plus Surface 0 —
   * all three are raw palette entries in global.css.
   */
  const ALLOWED = new Set(['#14100d', '#fbf7f1', '#ffffff']);

  const animations = fs.existsSync(ANIMATIONS)
    ? fs.readdirSync(ANIMATIONS).filter(f => f.endsWith('.json'))
    : [];

  it('finds animations to check', () => {
    expect(animations.length).toBeGreaterThan(0);
  });

  it.each(animations)('%s uses only design system colors', file => {
    const offenders = lottieColors(path.join(ANIMATIONS, file)).filter(
      hex => !ALLOWED.has(hex),
    );
    expect(offenders).toEqual([]);
  });
});

/**
 * The hex guard above cannot catch a *stale token reference*: `text-primary`
 * survived the old palette's deletion as a string, and Tailwind would emit no
 * rule for it, so the text silently renders unstyled rather than wrong.
 *
 * This is the static equivalent of changing --ember-500 in global.css and
 * checking that the whole app moves: if every color utility in the source
 * resolves to a token, then the token layer really does drive everything.
 */
describe('every color utility resolves to a token in global.css', () => {
  /** Suffixes that are not colors: the type scale, plus Tailwind keywords. */
  const NON_COLOR = new Set([
    // type scale (text-*)
    'display',
    'h1',
    'h2',
    'title',
    'item',
    'body',
    'caption',
    'fine',
    // alignment and border-side utilities the pattern also matches
    'center',
    'left',
    'right',
    'justify',
    'transparent',
    'current',
    'b',
    't',
    'l',
    'r',
    'x',
    'y',
    // border-style keywords the pattern also matches
    'solid',
    'dashed',
    'dotted',
    'double',
    'none',
    'hidden',
  ]);

  const definedTokens = (): Set<string> => {
    const css = fs.readFileSync(path.join(SRC, 'global.css'), 'utf8');
    const out = new Set<string>();
    for (const m of css.matchAll(/--color-([a-z0-9-]+)\s*:/g)) out.add(m[1]);
    return out;
  };

  const usedUtilities = (): Map<string, string> => {
    const out = new Map<string, string>();
    for (const { rel, abs } of sourceFiles()) {
      const src = fs.readFileSync(abs, 'utf8');
      for (const m of src.matchAll(/\b(?:bg|text|border)-([a-z][a-z0-9-]*)/g)) {
        if (!out.has(m[1])) out.set(m[1], rel);
      }
    }
    return out;
  };

  it('defines the tokens the app actually uses', () => {
    const tokens = definedTokens();
    const unresolved = [...usedUtilities().entries()]
      .filter(([name]) => !NON_COLOR.has(name) && !tokens.has(name))
      .map(([name, rel]) => `${name} (first seen in ${rel})`);

    expect(unresolved).toEqual([]);
  });
});
