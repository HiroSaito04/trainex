import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (file) => readFile(new URL(file, import.meta.url), 'utf8');

test('splash styles follow TRAINEX light/dark theme', async () => {
  const css = await read('../src/assets/styles/components/SplashScreen.css');
  assert.match(css, /:root\[data-theme="dark"\] \.trainex-splash/);
  assert.match(css, /var\(--splash-bg-start\)/);
  assert.match(css, /var\(--splash-ink\)/);
  assert.doesNotMatch(css, /filter:\s*blur\(|backdrop-filter\s*:/);
});

test('saved theme overrides OS appearance; system setting is fallback', async () => {
  const js = await read('../src/context/useTheme.js');
  assert.match(js, /localStorage\.getItem\(STORAGE_KEY\)/);
  assert.match(js, /prefers-color-scheme: dark/);
  assert.match(js, /savedTheme \?\? getSystemTheme\(\)/);
  assert.match(js, /followsSystemTheme = false/);
  assert.match(js, /addEventListener\("change", onSystemThemeChange\)/);
  assert.match(js, /document\.documentElement\.dataset\.theme = theme/);
});

test('train motion and stationary track are unaffected', async () => {
  const css = await read('../src/assets/styles/components/SplashScreen.css');
  assert.match(css, /animation: trainex-splash-ride 4\.8s linear both/);
  assert.match(css, /animation: trainex-splash-progress 5s linear forwards/);
  assert.match(css, /\.trainex-splash__track\s*\{/);
  assert.doesNotMatch(css.match(/\.trainex-splash__track\s*\{[^}]*\}/s)?.[0] ?? '', /animation:/);
});
