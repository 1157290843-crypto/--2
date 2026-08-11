import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import vm from 'node:vm';

const repoRoot = resolve(import.meta.dirname, '..');
const sourcePath = '/Users/luogaowei/Documents/网站全部动画/第二次全量改版/02-打点计时器三维互动实验.html';
const outputPath = resolve(repoRoot, '02B-打点计时器规范操作-v1.html');

const read02B = () => readFileSync(outputPath, 'utf8');

function loadInlineCore(attributeName) {
  const match = read02B().match(new RegExp(`<script\\s+${attributeName}[^>]*>([\\s\\S]*?)<\\/script>`));
  assert.ok(match, `missing <script ${attributeName}>`);
  return match[1];
}

test('source is unchanged and 02B is an offline silent single file', () => {
  const sourceHash = createHash('sha256').update(readFileSync(sourcePath)).digest('hex');

  assert.equal(sourceHash, '32a77ec92628599b924add2a3a8babc1571f45ec95c6efaff04b948e4b79d12d');
  assert.doesNotThrow(read02B);
  const html = read02B();
  assert.doesNotMatch(html, /<script[^>]+src=|<link[^>]+href=|<audio|new Audio|speechSynthesis/i);
});

function loadOperationCore() {
  const window = {};
  vm.runInNewContext(loadInlineCore('data-operation-core'), { window, Object, Array, Math });
  return window.TimerOperationCore;
}

test('the correct five-step operation reaches completion', () => {
  const O = loadOperationCore();
  let s = O.createOperationState();
  for (const action of [
    { type: 'FIX_TIMER', aligned: true },
    { type: 'THREAD_TAPE', throughGuide: true, consumableReady: true },
    { type: 'POWER_ON' },
    { type: 'MARKING_STABLE' },
    { type: 'RELEASE_CAR' },
    { type: 'CAR_STOP' },
    { type: 'POWER_OFF' },
    { type: 'TAKE_TAPE' }
  ]) s = O.reduceOperation(s, action);
  assert.equal(s.completed, true);
  assert.deepEqual(Array.from(s.errors), []);
});

test('releasing before power records a missing-start consequence', () => {
  const O = loadOperationCore();
  const s = O.reduceOperation(O.createOperationState(), { type: 'RELEASE_CAR' });
  assert.equal(s.lastError, 'lateOn');
  assert.equal(s.consequences.missingStart, true);
  assert.equal(s.completed, false);
});

test('taking tape while powered records an end-overprint consequence', () => {
  const O = loadOperationCore();
  const stoppedPowered = { ...O.createOperationState(), phase: 'finish', powered: true, carStopped: true };
  const s = O.reduceOperation(stoppedPowered, { type: 'TAKE_TAPE' });
  assert.equal(s.lastError, 'lateOff');
  assert.equal(s.consequences.endOverprint, true);
  assert.equal(s.completed, false);
  assert.equal(O.reduceOperation(s, { type: 'RECOVER_STEP' }).phase, 'finish');
});

test('guided and explore scene actions expose the right operation choices', () => {
  const O = loadOperationCore();
  const initial = O.createOperationState();
  assert.deepEqual(Array.from(O.availableSceneActions(initial, 'guided')), ['fixTimer']);
  assert.deepEqual(Array.from(O.availableSceneActions(initial, 'explore')), ['fixTimer', 'releaseCar']);

  const fixed = O.reduceOperation(initial, { type: 'FIX_TIMER', aligned: true });
  assert.deepEqual(Array.from(O.availableSceneActions(fixed, 'guided')), ['threadTape']);

  const threaded = O.reduceOperation(fixed, { type: 'THREAD_TAPE', throughGuide: true, consumableReady: true });
  assert.deepEqual(Array.from(O.availableSceneActions(threaded, 'guided')), ['powerOn']);

  const finishingPowered = { ...threaded, phase: 'finish', powered: true, carStopped: true };
  assert.deepEqual(Array.from(O.availableSceneActions(finishingPowered, 'guided')), ['powerOff']);
  assert.deepEqual(Array.from(O.availableSceneActions(finishingPowered, 'explore')), ['powerOff', 'takeTape']);
});

test('operation tape is fixed, deterministic, and playback-speed invariant', () => {
  const O = loadOperationCore();
  const normal = O.generateOperationTape({ startDelay: 0, endOverprint: false, playbackSpeed: 0.25 });
  const late = O.generateOperationTape({ startDelay: 0.42, endOverprint: false, playbackSpeed: 1 });
  const overprint = O.generateOperationTape({ startDelay: 0, endOverprint: true, playbackSpeed: 1 });

  for (const playbackSpeed of [0.25, 0.5, 1, 2]) {
    const outcome = O.generateOperationTape({ startDelay: 0, endOverprint: false, playbackSpeed });
    assert.deepEqual(Array.from(outcome.dots), Array.from(normal.dots));
  }
  assert.equal(normal.dots[0], 0);
  assert.ok(Math.abs(normal.dots.at(-1) - 1.69) < 1e-9);
  assert.ok(late.dots[0] > 0.17);
  assert.equal(late.missingStart, true);
  assert.equal(overprint.endOverprint, true);
  assert.equal(overprint.overprintPosition, overprint.dots.at(-1));
});

test('automatic guidance uses the reducer and reaches the same completed state', () => {
  const O = loadOperationCore();
  let state = O.createOperationState();
  let guard = 0;
  while (!state.completed && guard++ < 12) {
    const action = O.nextRecommendedAction(state);
    assert.ok(action, `missing recommended action in phase ${state.phase}`);
    state = O.reduceOperation(state, action);
  }
  assert.equal(state.completed, true);
  assert.deepEqual(Array.from(state.errors), []);
  assert.equal(state.consequences.missingStart, false);
  assert.equal(state.consequences.endOverprint, false);
});

test('unrelated out-of-order actions do not create extra error types', () => {
  const O = loadOperationCore();
  let state = O.createOperationState();
  for (const action of [
    { type: 'POWER_ON' },
    { type: 'MARKING_STABLE' },
    { type: 'CAR_STOP' },
    { type: 'POWER_OFF' },
    { type: 'TAKE_TAPE' }
  ]) state = O.reduceOperation(state, action);
  assert.deepEqual(Array.from(state.errors), []);
  assert.equal(state.lastError, null);
});

export { read02B, loadInlineCore };
