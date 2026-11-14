import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../src/context/useTheme.js', import.meta.url), 'utf8');

function createMockBrowser(saved, initialSystemDark) {
  let systemDark = initialSystemDark;
  let onChange = null;
  const savedWrites = [];
  const document = { documentElement: { dataset: {} } };
  const media = {
    get matches() { return systemDark; },
    addEventListener(type, callback) { if (type === 'change') onChange = callback; },
  };
  const window = {
    localStorage: {
      getItem() { return saved; },
      setItem(key, value) { savedWrites.push([key, value]); },
    },
    matchMedia(query) {
      assert.equal(query, '(prefers-color-scheme: dark)');
      return media;
    },
  };
  const executable = source
    .replace(/import\s*\{\s*useSyncExternalStore\s*\}\s*from\s*"react";/, 'const useSyncExternalStore = () => undefined;')
    .replaceAll('export function ', 'function ')
    + '\n;globalThis.__testTheme = {setTheme, getTheme: () => theme};';
  const context = {window, document, Set};
  vm.runInNewContext(executable, context);
  return {
    get theme() { return document.documentElement.dataset.theme; },
    setTheme: context.__testTheme.setTheme,
    savedWrites,
    changeSystem(dark) { systemDark = dark; onChange?.(); },
  };
}

test('no saved preference: initial OS preference and later changes control the site theme', () => {
  const app = createMockBrowser(null, true);
  assert.equal(app.theme, 'dark');
  app.changeSystem(false);
  assert.equal(app.theme, 'light');
  app.changeSystem(true);
  assert.equal(app.theme, 'dark');
  assert.equal(app.savedWrites.length, 0);
});

test('saved user choice is respected regardless of system changes', () => {
  const app = createMockBrowser('light', true);
  assert.equal(app.theme, 'light');
  app.changeSystem(false);
  app.changeSystem(true);
  assert.equal(app.theme, 'light');
});

test('navbar theme choice overrides OS preference and persists', () => {
  const app = createMockBrowser(null, false);
  assert.equal(app.theme, 'light');
  app.setTheme('dark');
  app.changeSystem(false);
  assert.equal(app.theme, 'dark');
  assert.deepEqual(app.savedWrites[0], ['trainex-theme','dark']);
});
