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

export { read02B, loadInlineCore };
