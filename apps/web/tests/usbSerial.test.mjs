import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parseTrainexUsbLine} from '../src/integrations/parseTrainexUsbLine.js';
import {UsbSerialConnection} from '../src/integrations/UsbSerialConnection.js';
import {
  connectUsbHardware, disconnectHardware,
  getHardwareSnapshot,
} from '../src/integrations/hardwareAdapter.js';
import {registerTrainexRuntime} from '../src/integrations/trainexClient.js';

const CONTROLS = [
  ['BUTTON DOOR_ENABLE_LEFT true (bench)', 'DOOR_ENABLE_LEFT', true],
  ['BUTTON DOORS_OPEN LEFT (bench)', 'DOORS_OPEN', 'LEFT'],
  ['BUTTON DOORS_CLOSE LEFT (bench)', 'DOORS_CLOSE', 'LEFT'],
  ['BUTTON DOOR_ENABLE_RIGHT true (bench)', 'DOOR_ENABLE_RIGHT', true],
  ['BUTTON DOORS_OPEN RIGHT (bench)', 'DOORS_OPEN', 'RIGHT'],
  ['BUTTON DOORS_CLOSE RIGHT (bench)', 'DOORS_CLOSE', 'RIGHT'],
  ['BUTTON VIGILANCE_ACKNOWLEDGE true (bench)', 'VIGILANCE_ACKNOWLEDGE', true],
];

test('parse all seven actual ESP32 bench-mode button lines', () => {
  for (const [raw, controlId, value] of CONTROLS) {
    assert.deepEqual(parseTrainexUsbLine(raw), {controlId, value});
  }
});

test('ignore startup, wrong controls, release signals, malformed JSON and garbage', () => {
  for (const line of [
    'TRAINEX 7-button hardware architecture | GPIO active LOW',
    'PIN 18 Left Enable',
    'ets Jul 29 2019 12:21:46',
    '\0\0PIN 19 Right Enable',
    'BUTTON HORN true (bench)',
    'BUTTON DOORS_OPEN BOTH (bench)',
    'BUTTON DOOR_ENABLE_LEFT false (bench)',
    'BUTTON DOORS_OPEN LEFT (offline)',
    '{"type":"state_feedback"}',
    '{invalid}',
    '{"type":"input","controlId":"HORN","value":true}',
  ]) assert.equal(parseTrainexUsbLine(line), null, line);
});

test('future JSON lines and master handle detent supported, identifiers on wire ignored', () => {
  assert.deepEqual(parseTrainexUsbLine('MASTER_HANDLE B7 (bench)'), {controlId:'MASTER_HANDLE', value:'B7'});
  assert.deepEqual(parseTrainexUsbLine('{"type":"input","controlId":"DOORS_OPEN","value":"RIGHT","sessionId":"forged","sequence":999}'), {
    controlId:'DOORS_OPEN',value:'RIGHT',
  });
  assert.equal(parseTrainexUsbLine('{"type":"input","controlId":"MASTER_HANDLE","value":"P5"}'), null);
});

function fakePort() {
  let controller;
  let opened = false;
  let closed = false;
  return {
    get opened() {return opened;},
    get closed() {return closed;},
    readable: new ReadableStream({start(c) {controller=c;}}),
    async open({baudRate}) {assert.equal(baudRate,115200);opened=true;},
    async close() {closed=true;},
    feed(text) {controller.enqueue(new TextEncoder().encode(text));},
  };
}
async function settle() {
  for (let i=0;i<12;i++) await new Promise(resolve=>setTimeout(resolve,0));
}

test('USB adapter binds messages to current TRAINEX session and ignores boot messages', async () => {
  let sessionId='active-session-1';
  let notifySession=()=>{};
  const received=[];
  const unregister=registerTrainexRuntime({
    getState(){return {speed:0}},subscribe(fn){notifySession=fn;return ()=>{}},getSessionStatus(){return 'RUNNING'},
    getSessionInfo(){return {sessionId}},
    sendCommand(e){received.push(e);return {accepted:true}},
  });
  const port=fakePort();
  const originalNavigator=Object.getOwnPropertyDescriptor(globalThis, 'navigator');
  const originalSecure=Object.getOwnPropertyDescriptor(globalThis, 'isSecureContext');
  Object.defineProperty(globalThis,'navigator',{configurable:true, value:{serial:{requestPort(){return Promise.resolve(port)}}}});
  Object.defineProperty(globalThis,'isSecureContext',{configurable:true,value:true});
  try {
    await connectUsbHardware();
    assert.equal(getHardwareSnapshot().status,'connected');
    assert.equal(getHardwareSnapshot().method,'usb-serial');
    port.feed('ets Jul 29 2019 12:21:46\r\nBUTTON DOOR_ENABLE_LEFT true (bench)\r\nBUTTON DOORS_OPEN LEFT (bench)\r\nBUTTON HORN true (bench)\r\n');
    await settle();
    assert.deepEqual(received.map(m=>[m.controlId,m.value,m.sessionId,m.sequence]), [
      ['DOOR_ENABLE_LEFT',true,sessionId,0],
      ['DOORS_OPEN','LEFT',sessionId,1],
    ]);
    assert.equal(getHardwareSnapshot().lastMessage,'DOORS_OPEN LEFT');
    sessionId='next-session';
    notifySession();
    await settle();
    assert.equal(received.length,2);
    assert.equal(getHardwareSnapshot().status,'disconnected');
    assert.equal(port.closed,true);
  } finally {
    await disconnectHardware();
    unregister();
    if(originalNavigator) Object.defineProperty(globalThis,'navigator',originalNavigator);
    else delete globalThis.navigator;
    if(originalSecure) Object.defineProperty(globalThis,'isSecureContext',originalSecure);
    else delete globalThis.isSecureContext;
  }
});

test('serial reader handles lines split across multiple USB packets', async () => {
  const port=fakePort();
  const lines=[];
  const reader=new UsbSerialConnection({
    serial:{requestPort(){return Promise.resolve(port)}},
    onLine(l){lines.push(l)}, onClosed(){},
  });
  await reader.connect();
  port.feed('BUTTON DOORS_');
  port.feed('OPEN LEFT (bench)\r\n');
  await settle();
  assert.deepEqual(lines,['BUTTON DOORS_OPEN LEFT (bench)']);
  await reader.disconnect();
  assert.equal(port.closed,true);
});
