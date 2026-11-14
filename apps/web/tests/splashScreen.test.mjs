import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';

const read = (file) => readFile(new URL(file, import.meta.url), 'utf8');

test('splash lasts exactly 5000 milliseconds and only precedes the router', async () => {
  const splash = await read('../src/components/common/SplashScreen.jsx');
  const app = await read('../src/App.jsx');
  assert.match(splash, /SPLASH_DURATION_MS\s*=\s*5000/);
  assert.match(app, /setTimeout\(\(\) => setShowSplash\(false\), SPLASH_DURATION_MS\)/);
  assert.match(app, /showSplash\s*\?\s*<SplashScreen\s*\/?>\s*:\s*<RouterProvider/);
  assert.match(app, /clearTimeout\(timer\)/);
});

test('train SVG is local and the motion and progress use CSS', async () => {
  const splash = await read('../src/components/common/SplashScreen.jsx');
  const css = await read('../src/assets/styles/components/SplashScreen.css');
  const svg = await read('../public/images/train-side.svg');
  assert.match(splash, /src="\/images\/train-side\.svg"/);
  assert.match(css, /@keyframes trainex-splash-ride/);
  assert.match(css, /animation: trainex-splash-ride 4\.8s/);
  assert.match(css, /@keyframes trainex-splash-progress/);
  assert.match(css, /animation: trainex-splash-progress 5s/);
  assert.match(svg, /<svg\b/);
  assert.ok((await stat(new URL('../public/images/train-side.svg', import.meta.url))).size > 5000);
});

test('existing PWA pre-caches new local public assets after build', async () => {
  const swGenerator = await read('../tools/generate-service-worker.mjs');
  assert.match(swGenerator, /walk\(distDir\)/);
  assert.match(swGenerator, /cache\.addAll\(PRECACHE_URLS\)/);
});


test('five cars are connected in one traveling SVG; rails and sleepers remain motionless', async () => {
  const svg = await read('../public/images/train-side.svg');
  const css = await read('../src/assets/styles/components/SplashScreen.css');
  const splash = await read('../src/components/common/SplashScreen.jsx');
  assert.equal((svg.match(/data-splash-car=\"[1-5]\"/g) || []).length, 5);
  assert.match(svg, /id="trainex-car-5"/);
  assert.match(splash, /className="trainex-splash__train"/);
  assert.match(css, /\.trainex-splash__train\s*\{[^}]*animation:\s*trainex-splash-ride/s);
  assert.doesNotMatch(css, /trainex-splash-tracks/);
  assert.doesNotMatch(css, /\.trainex-splash__sleepers\s*\{[^}]*animation:/s);
  assert.doesNotMatch(css, /\.trainex-splash__rail\s*\{[^}]*animation:/s);
});
