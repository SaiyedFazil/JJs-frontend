import fs from 'fs';
import path from 'path';

/**
 * Architecture guard for the src/ layout.
 * Spec: docs/superpowers/specs/2026-09-27-src-structure-design.md
 *
 * The folder structure is a contract: where a file lives says what it may
 * depend on. tsc proves imports resolve; this proves they point the right
 * way, that each shared value has exactly one home, and that retired
 * locations stay retired when older branches are merged in.
 */
const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const TESTS = path.join(ROOT, '__tests__');
const SELF = path.basename(__filename);

/** Locations (relative to src/) the restructure retired. Nothing may reappear there. */
const RETIRED_PATHS: string[] = [
  'types/menu.ts',
  'features/profile/avatars.ts',
  'api',
  'services',
  'utils',
  'hooks/useAppToast.tsx',
  'components/navigation',
  'components/common',
];

/** Locations (relative to src/) the structure promises. */
const REQUIRED_PATHS: string[] = [
  'types/menu.types.ts',
  'types/user.types.ts',
  'types/navigation.types.ts',
  'constants/avatars.ts',
  'constants/layout.ts',
  'lib/validation.ts',
  'lib/api/api-client.ts',
  'lib/api/endpoints.ts',
  'lib/api/auth/auth-api.ts',
  'lib/api/user/user-api.ts',
  'lib/storage.ts',
  'hooks/use-app-toast.ts',
  'components/layout/CustomTabBar.tsx',
  'components/custom/PlaceholderScreen.tsx',
  'components/providers/AppProviders.tsx',
];

/** Import specifiers that point at retired locations, however they are spelled. */
const RETIRED_IMPORTS: RegExp[] = [
  /['"][^'"]*types\/menu['"]/,
  /['"][^'"]*features\/profile\/avatars['"]/,
  /['"]\.\.\/avatars['"]/,
  /import type \{ ProfileStackParamList \} from ['"][^'"]*ProfileNavigator['"]/,
  /['"]@\/(?:api|services|utils)\//,
  /['"][^'"]*src\/(?:api|services|utils)\//,
  /['"]@\/hooks\/useAppToast['"]/,
  /['"][^'"]*components\/(?:navigation|common)\//,
];

/** Values and types that must be defined in exactly one file. */
const SINGLE_SOURCE: { what: string; needle: string | RegExp; file: string }[] =
  [
    {
      what: 'the email regex',
      needle: String.raw`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`,
      file: 'lib/validation.ts',
    },
    {
      what: 'TAB_BAR_HEIGHT',
      needle: 'export const TAB_BAR_HEIGHT',
      file: 'constants/layout.ts',
    },
    {
      what: 'StoredUserProfile',
      needle: /interface StoredUserProfile\s*\{/,
      file: 'types/user.types.ts',
    },
    {
      what: 'UserProfile',
      needle: /interface UserProfile\s*\{/,
      file: 'types/user.types.ts',
    },
    {
      what: 'UpdateProfilePayload',
      needle: /interface UpdateProfilePayload\s*\{/,
      file: 'types/user.types.ts',
    },
    {
      what: 'AVATARS',
      needle: /export const AVATARS\b/,
      file: 'constants/avatars.ts',
    },
    {
      what: 'AuthStackParamList',
      needle: /type AuthStackParamList\s*=/,
      file: 'types/navigation.types.ts',
    },
    {
      what: 'ProfileStackParamList',
      needle: /type ProfileStackParamList\s*=/,
      file: 'types/navigation.types.ts',
    },
    {
      what: 'MainTabParamList',
      needle: /type MainTabParamList\s*=/,
      file: 'types/navigation.types.ts',
    },
  ];

/** What each layer (a folder prefix relative to src/) must never import. */
const LAYER_RULES: { layer: string; forbidden: RegExp; why: string }[] = [
  {
    layer: 'store/',
    forbidden: /from\s+['"]@\/(?:app|components|features)\//,
    why: 'stores hold state; UI depends on them, never the reverse',
  },
  {
    layer: 'types/',
    forbidden: /from\s+['"]@\/(?!types\/)/,
    why: 'types are leaves: they may only import other types',
  },
  {
    layer: 'constants/',
    forbidden: /from\s+['"]@\//,
    why: 'constants are leaves',
  },
  {
    layer: 'components/ui/',
    forbidden: /from\s+['"]@\/(?!types\/|constants\/)/,
    why: 'the design-system kit knows nothing about screens, stores or the API',
  },
  {
    layer: 'lib/',
    forbidden: /from\s+['"]@\/(?:app|components|features|store|hooks)\//,
    why: 'lib is infrastructure: it must not reach up into UI or state',
  },
];

/** Identifiers retired by a rename. */
const RETIRED_IDENTIFIERS: RegExp[] = [/\bAuthService\b/, /\bUserService\b/];

function collect(dir: string, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (entry.name === 'assets' || entry.name === 'node_modules') continue;
      collect(path.join(dir, entry.name), out);
      continue;
    }
    if (/\.tsx?$/.test(entry.name)) out.push(path.join(dir, entry.name));
  }
  return out;
}

/** src/**\/*.ts(x) plus the root App.tsx, as paths relative to src/. */
function sourceFiles(): { rel: string; abs: string }[] {
  const files = collect(SRC).map(abs => ({
    rel: path.relative(SRC, abs).split(path.sep).join('/'),
    abs,
  }));
  files.push({ rel: '../App.tsx', abs: path.join(ROOT, 'App.tsx') });
  return files;
}

/** Source files plus every other test (tests import src/ by relative path). */
function importingFiles(): { rel: string; abs: string }[] {
  const tests = fs
    .readdirSync(TESTS)
    .filter(f => /\.tsx?$/.test(f) && f !== SELF)
    .map(f => ({ rel: `../__tests__/${f}`, abs: path.join(TESTS, f) }));
  return [...sourceFiles(), ...tests];
}

function hits(abs: string, pattern: RegExp): string[] {
  return fs
    .readFileSync(abs, 'utf8')
    .split('\n')
    .map((line, i) => ({ line, n: i + 1 }))
    .filter(({ line }) => pattern.test(line))
    .map(({ line, n }) => `${n}: ${line.trim()}`);
}

describe('src/ structure', () => {
  it.each(RETIRED_PATHS)('src/%s is retired', rel => {
    expect(fs.existsSync(path.join(SRC, rel))).toBe(false);
  });

  it.each(REQUIRED_PATHS)('src/%s exists', rel => {
    expect(fs.existsSync(path.join(SRC, rel))).toBe(true);
  });

  it.each(RETIRED_IMPORTS)('nothing imports a retired path (%s)', pattern => {
    const offenders = importingFiles().flatMap(({ rel, abs }) =>
      hits(abs, pattern).map(h => `${rel}:${h}`),
    );
    expect(offenders).toEqual([]);
  });

  it.each(SINGLE_SOURCE)(
    '$what is defined only in src/$file',
    ({ needle, file }) => {
      const owners = sourceFiles()
        .filter(({ abs }) => {
          const src = fs.readFileSync(abs, 'utf8');
          return typeof needle === 'string'
            ? src.includes(needle)
            : needle.test(src);
        })
        .map(({ rel }) => rel);
      expect(owners).toEqual([file]);
    },
  );

  it.each(LAYER_RULES)(
    '$layer respects its layer ($why)',
    ({ layer, forbidden }) => {
      const offenders = sourceFiles()
        .filter(({ rel }) => rel.startsWith(layer))
        .flatMap(({ rel, abs }) =>
          hits(abs, forbidden).map(h => `${rel}:${h}`),
        );
      expect(offenders).toEqual([]);
    },
  );

  it.each(RETIRED_IDENTIFIERS)(
    'no source uses the retired name %s',
    pattern => {
      const offenders = importingFiles().flatMap(({ rel, abs }) =>
        hits(abs, pattern).map(h => `${rel}:${h}`),
      );
      expect(offenders).toEqual([]);
    },
  );

  it('only lib/api/ talks to the HTTP client directly', () => {
    const offenders = sourceFiles()
      .filter(({ rel }) => !rel.startsWith('lib/api/'))
      .flatMap(({ rel, abs }) =>
        hits(abs, /from\s+['"][^'"]*api-client['"]/).map(h => `${rel}:${h}`),
      );
    expect(offenders).toEqual([]);
  });

  it('hook files are named use-kebab-case.ts', () => {
    const offenders = sourceFiles()
      .filter(({ rel }) => /(^|\/)hooks\//.test(rel))
      .map(({ rel }) => rel)
      .filter(rel => !/^use-[a-z0-9-]+\.ts$/.test(path.posix.basename(rel)));
    expect(offenders).toEqual([]);
  });

  it('only the routing layer (src/app/) imports navigators from @/app', () => {
    const offenders = sourceFiles()
      .filter(({ rel }) => !rel.startsWith('app/'))
      .flatMap(({ rel, abs }) =>
        hits(abs, /from\s+['"]@\/app\//).map(h => `${rel}:${h}`),
      );
    expect(offenders).toEqual([]);
  });
});
