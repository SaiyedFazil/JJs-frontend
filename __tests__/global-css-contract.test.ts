import fs from 'fs';
import path from 'path';

const CSS = fs.readFileSync(
  path.resolve(__dirname, '../src/global.css'),
  'utf8',
);

/** Reads a custom property's declared value, e.g. varValue('--ink-900'). */
function varValue(name: string): string | null {
  const m = CSS.match(
    new RegExp(`${name.replace(/-/g, '\\-')}\\s*:\\s*([^;]+);`),
  );
  return m ? m[1].trim() : null;
}

describe('global.css — PDF palette', () => {
  // Section 01 of the design system PDF, verbatim.
  const SWATCHES: Record<string, string> = {
    '--ink-900': '#14100d',
    '--ink-800': '#211811',
    '--ink-700': '#2e241b',
    '--ink-600': '#4a3d30',
    '--ember-500': '#ec5b13',
    '--ember-600': '#cd4a0a',
    '--saffron-400': '#f6a623',
    '--ember-50': '#fbe7d6',
    '--cream-50': '#fbf7f1',
    '--surface-0': '#ffffff',
    '--sand-100': '#f3ece1',
    '--border-warm': '#e7ddcc',
    '--muted-warm': '#8a7d6c',
    '--veg': '#147d3a',
    '--non-veg': '#9e2a1b',
    '--chili': '#c22a1b',
    '--warning-amber': '#e08a00',
    '--info-teal': '#0e7c86',
  };

  it.each(Object.entries(SWATCHES))('%s is %s', (name, expected) => {
    expect(varValue(name)?.toLowerCase()).toBe(expected);
  });
});

describe('global.css — HeroUI Native contract is overridden', () => {
  // Every variable heroui-native components read. Overriding these is what
  // rethemes the library without per-component wrappers.
  const HEROUI_VARS = [
    '--background',
    '--foreground',
    '--surface',
    '--surface-foreground',
    '--surface-secondary',
    '--surface-tertiary',
    '--overlay',
    '--overlay-foreground',
    '--backdrop',
    '--muted',
    '--default',
    '--default-foreground',
    '--accent',
    '--accent-foreground',
    '--field-background',
    '--field-foreground',
    '--field-placeholder',
    '--field-border',
    '--success',
    '--warning',
    '--danger',
    '--border',
    '--separator',
    '--focus',
    '--link',
    '--radius',
  ];

  it.each(HEROUI_VARS)('%s is defined', name => {
    expect(varValue(name)).not.toBeNull();
  });
});

describe('global.css — no legacy palette survives', () => {
  const RETIRED = ['#170c79', '#8e05c2', '#efe3ca', '#3e065f', '#56b6c6'];

  it.each(RETIRED)('%s is gone', hex => {
    expect(CSS.toLowerCase()).not.toContain(hex);
  });

  it('declares no -dark token variants', () => {
    expect(CSS).not.toMatch(/--[a-z-]+-dark\s*:/);
  });
});

describe('global.css — type scale', () => {
  const STEPS = ['display', 'h1', 'h2', 'title', 'item', 'body', 'caption'];

  it.each(STEPS)('--text-%s has a size and a line height', step => {
    expect(varValue(`--text-${step}`)).not.toBeNull();
    expect(varValue(`--text-${step}--line-height`)).not.toBeNull();
  });

  const FAMILIES = [
    '--font-bricolage-400',
    '--font-bricolage-600',
    '--font-bricolage-700',
    '--font-bricolage-800',
    '--font-jakarta-400',
    '--font-jakarta-500',
    '--font-jakarta-600',
    '--font-jakarta-700',
    '--font-jakarta-800',
  ];

  it.each(FAMILIES)('%s is defined', name => {
    expect(varValue(name)).not.toBeNull();
  });
});
