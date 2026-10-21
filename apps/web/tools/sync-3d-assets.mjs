import { copyFile, mkdir, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const scriptDir = fileURLToPath(new URL('.',import.meta.url));
const root = resolve(scriptDir,'../../../'); // D:/trainex
const source = resolve(root,'models/exports/cabin/trainex_cabin.glb');
const destination = resolve(root,'apps/web/public/models/cabin/trainex_cabin.glb');
try {
  const sourceStat = await stat(source);
  if (!sourceStat.isFile() || sourceStat.size < 100) throw new Error('GLB is empty.');
  await mkdir(resolve(root,'apps/web/public/models/cabin'),{recursive:true});
  await copyFile(source,destination);
  console.log(`TRAINEX GLB copied to ${destination} (${Math.ceil(sourceStat.size / 1024)} KiB)`);
} catch (error) {
  console.error(`TRAINEX GLB sync failed: ${error.message}`);
  console.error('Export with Blender first using models/blender/scripts/export-windows.ps1.');
  process.exitCode = 1;
}
