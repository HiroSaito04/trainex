import {readFile,copyFile,mkdir} from 'node:fs/promises';
import {resolve,dirname,relative} from 'node:path';
import {fileURLToPath} from 'node:url';

const here=dirname(fileURLToPath(import.meta.url));
const root=resolve(here,'../../..');
const source=resolve(root,'models/exports/2d/trainex-driver-cab.svg');
const destination=resolve(root,'apps/web/public/models/2d/trainex-driver-cab.svg');
try{
  const data=await readFile(source);
  const text=data.toString('utf8');
  if(!/<svg(?:\s|>)/i.test(text) || !/viewBox=["']\s*[-\d.]+[\s,]+[-\d.]+[\s,]+[\d.]+[\s,]+[\d.]+["']/i.test(text)){
    throw new Error('Expected a valid SVG with a viewBox.');
  }
  await mkdir(dirname(destination),{recursive:true});
  await copyFile(source,destination);
  console.log(`Copied SVG unchanged: ${relative(root,source)} -> ${relative(root,destination)}`);
}catch(error){
  console.error(`2D asset sync failed: ${error.message}`);
  process.exitCode=1;
}
