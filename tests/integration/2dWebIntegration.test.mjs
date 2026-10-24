import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=path=>readFileSync(new URL(path,import.meta.url),'utf8');
test('web integration binds to central runtime and standard React snapshot',()=>{
 const code=read('../../apps/web/src/components/simulation/Trainex2DConnected.jsx');
 for(const fragment of ['useSyncExternalStore','subscribeTrainex','getTrainexSnapshot','sendTrainexInput','@trainex/simulator-2d']) assert.ok(code.includes(fragment));
});
test('2D page uses shared route component without altering main router',()=>{
 const code=read('../../apps/web/src/pages/Simulator2DPage.jsx');
 assert.match(code,/Trainex2DConnected/);assert.match(code,/PageHeader/);
});
