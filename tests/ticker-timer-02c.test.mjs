import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import vm from 'node:vm';

const repoRoot = resolve(import.meta.dirname, '..');
const sourcePath = '/Users/luogaowei/Documents/网站全部动画/第二次全量改版/02-打点计时器三维互动实验.html';
const outputPath = resolve(repoRoot, '02C-纸带数据处理-v1.html');

export const read02C = () => readFileSync(outputPath, 'utf8');

export function loadInlineCore(attributeName) {
  const match = read02C().match(
    new RegExp(`<script\\s+${attributeName}[^>]*>([\\s\\S]*?)<\\/script>`),
  );
  assert.ok(match, `missing <script ${attributeName}>`);
  return match[1];
}

function loadDifferenceCore() {
  const window = {};
  vm.runInNewContext(loadInlineCore('data-successive-difference-core'), { window, Object, Array, Math });
  return window.SuccessiveDifferenceCore;
}

function loadLessonRuntime() {
  const window = {};
  const context = { window, Object, Array, Math, Number };
  vm.runInNewContext(loadInlineCore('data-successive-difference-core'), context);
  vm.runInNewContext(loadInlineCore('data-successive-difference-teaching-core'), context);
  vm.runInNewContext(loadInlineCore('data-successive-difference-view-core'), context);
  return {
    difference: window.SuccessiveDifferenceCore,
    teaching: window.SuccessiveDifferenceTeaching,
    view: window.SuccessiveDifferenceLesson,
  };
}

test('protects the locked source and keeps 02C offline, silent, and self-contained', () => {
  const sourceHash = createHash('sha256')
    .update(readFileSync(sourcePath))
    .digest('hex');
  assert.equal(sourceHash, '32a77ec92628599b924add2a3a8babc1571f45ec95c6efaff04b948e4b79d12d');

  const html = read02C();
  assert.doesNotMatch(html, /<script[^>]+src=|<link[^>]+href=/i);
  assert.doesNotMatch(html, /<audio|new Audio|speechSynthesis/i);
});

test('fixed ideal tape has the approved six segment lengths', () => {
  const D = loadDifferenceCore();
  const positions = D.generatePositions(D.CONFIG);
  const segmentsCm = D.segmentDisplacements(positions).map(value => +(value * 100).toFixed(10));
  assert.deepEqual(Array.from(segmentsCm), [3, 5, 7, 9, 11, 13]);
});

test('all three successive differences and both averages equal 2 m/s squared', () => {
  const D = loadDifferenceCore();
  const segments = D.segmentDisplacements(D.generatePositions(D.CONFIG));
  const result = D.analyzeSuccessiveDifferences(segments, D.CONFIG.interval);
  assert.deepEqual(Array.from(result.groupAccelerations, value => +value.toFixed(12)), [2, 2, 2]);
  assert.equal(+result.average.toFixed(12), 2);
  assert.equal(+result.combined.toFixed(12), 2);
});

test('pairings use every segment exactly once on each side', () => {
  const D = loadDifferenceCore();
  assert.deepEqual(JSON.parse(JSON.stringify(D.PAIRINGS)), [[0, 3], [1, 4], [2, 5]]);
});

test('the teaching flow contains seven focused steps', () => {
  const { teaching: T } = loadLessonRuntime();
  assert.deepEqual(Array.from(T.DIFFERENCE_STEPS, step => step.id), [1, 2, 3, 4, 5, 6, 7]);
  for (const step of T.DIFFERENCE_STEPS) assert.ok(step.observe.length > 0);
});

test('pairing answers must be completed in the approved order', () => {
  const { teaching: T } = loadLessonRuntime();
  let state = T.createDifferenceState();
  state = T.differenceReducer(state, { type: 'CONFIRM_INTERVAL' });
  state = T.differenceReducer(state, { type: 'CONFIRM_SEGMENTS' });
  const blocked = T.differenceReducer(state, { type: 'SUBMIT_GROUP', index: 1, value: 2 });
  assert.equal(blocked.activePair, 0);
  const first = T.differenceReducer(state, { type: 'SUBMIT_GROUP', index: 0, value: 2 });
  assert.equal(first.activePair, 1);
  assert.equal(first.groupAnswers[0], 2);
});

test('only a correct average completes the method', () => {
  const { teaching: T } = loadLessonRuntime();
  const ready = { ...T.createDifferenceState(), intervalConfirmed: true, segmentsConfirmed: true, activePair: 3, groupAnswers: [2, 2, 2] };
  assert.equal(T.differenceReducer(ready, { type: 'SUBMIT_AVERAGE', value: 1.9 }).completed, false);
  assert.equal(T.differenceReducer(ready, { type: 'SUBMIT_AVERAGE', value: 2 }).completed, true);
});

test('automatic mode follows the same reducer path and reset restores step one', () => {
  const { teaching: T } = loadLessonRuntime();
  let state = T.differenceReducer(T.createDifferenceState(), { type: 'SET_MODE', mode: 'auto' });
  for (let index = 0; index < 6; index += 1) {
    state = T.differenceReducer(state, T.nextAutomaticAction(state));
  }
  assert.equal(state.completed, true);
  assert.deepEqual(Array.from(state.groupAnswers), [2, 2, 2]);
  assert.equal(state.averageAnswer, 2);
  const reset = T.differenceReducer(state, { type: 'RESET' });
  assert.equal(reset.step, 1);
  assert.equal(reset.mode, 'guided');
  assert.deepEqual(Array.from(reset.groupAnswers), [null, null, null]);
});

test('free segment inspection is available only in explore mode', () => {
  const { teaching: T } = loadLessonRuntime();
  const guided = T.differenceReducer(T.createDifferenceState(), { type: 'SELECT_SEGMENT', index: 4 });
  assert.equal(guided.selectedSegment, null);
  const explore = T.differenceReducer(
    T.differenceReducer(T.createDifferenceState(), { type: 'SET_MODE', mode: 'explore' }),
    { type: 'SELECT_SEGMENT', index: 4 },
  );
  assert.equal(explore.selectedSegment, 4);
});

test('lesson view derives fixed tape, pair denominator, and final results from the cores', () => {
  const { teaching: T, view: V } = loadLessonRuntime();
  const initial = V.createLessonView(T.createDifferenceState());
  assert.deepEqual(Array.from(initial.segmentsCm), [3, 5, 7, 9, 11, 13]);
  assert.deepEqual(Array.from(initial.pointLabels), ['A', 'B', 'C', 'D', 'E', 'F', 'G']);
  assert.equal(initial.interval, 0.1);
  assert.equal(initial.denominator, 0.03);
  assert.deepEqual(Array.from(initial.activePair), [0, 3]);

  const complete = {
    ...T.createDifferenceState(),
    intervalConfirmed: true,
    segmentsConfirmed: true,
    activePair: 3,
    groupAnswers: [2, 2, 2],
    averageAnswer: 2,
    completed: true,
    step: 7,
  };
  const finalView = V.createLessonView(complete);
  assert.deepEqual(Array.from(finalView.groupAccelerations), [2, 2, 2]);
  assert.equal(finalView.average, 2);
  assert.equal(finalView.combined, 2);
});
