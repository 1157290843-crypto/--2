import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import vm from 'node:vm';

export const repoRoot = resolve(import.meta.dirname, '..');
export const sourcePath = '/Users/luogaowei/Documents/网站全部动画/第二次全量改版/02-打点计时器三维互动实验.html';
export const outputPath = resolve(repoRoot, '02A-打点计时器结构与原理-v1.html');
const approvedHash = '32a77ec92628599b924add2a3a8babc1571f45ec95c6efaff04b948e4b79d12d';

export function read02A() {
  return readFileSync(outputPath, 'utf8');
}

export function loadInlineCore(attributeName) {
  const pattern = new RegExp(`<script\\s+${attributeName}[^>]*>([\\s\\S]*?)<\\/script>`);
  const match = read02A().match(pattern);
  assert.ok(match, `missing <script ${attributeName}>`);
  return match[1];
}

function loadPrincipleCore() {
  const window = {};
  vm.runInNewContext(loadInlineCore('data-principle-core'), { window, Math, Object, Array });
  return window.TimerPrincipleCore;
}

function loadLessonCore() {
  const window = {};
  const context = { window, Math, Number, Object, Array, Set };
  vm.runInNewContext(loadInlineCore('data-principle-core'), context);
  vm.runInNewContext(loadInlineCore('data-principle-lesson-core'), context);
  return window.TimerPrincipleLesson;
}

function loadTeachingCore() {
  const window = {};
  vm.runInNewContext(loadInlineCore('data-principle-teaching-core'), { window, Object, Array, Set });
  return window.TimerPrincipleTeaching;
}

function loadStudentGuideCore() {
  const window = {};
  vm.runInNewContext(loadInlineCore('data-student-guide-core'), { window, Number, Object, Array });
  return window.StudentGuideCore;
}

test('50 Hz produces an exact 0.02 second interval', () => {
  const P = loadPrincipleCore();
  assert.equal(P.intervalForFrequency(50), 0.02);
});

test('dot crossings are independent of animation frame boundaries', () => {
  const P = loadPrincipleCore();
  assert.deepEqual(Array.from(P.dotTimesBetween(0, 0.061, 50), value => +value.toFixed(6)), [0.02, 0.04, 0.06]);
  assert.deepEqual(Array.from(P.dotTimesBetween(0.019, 0.041, 50), value => +value.toFixed(6)), [0.02, 0.04]);
});

test('machine definitions distinguish voltage and marking mechanism', () => {
  const P = loadPrincipleCore();
  assert.equal(P.MACHINES.em.power, '4~6 V 交流');
  assert.equal(P.MACHINES.em.marking, '振针与复写纸');
  assert.equal(P.MACHINES.spark.power, '220 V 交流');
  assert.equal(P.MACHINES.spark.marking, '脉冲放电与墨粉纸盘');
});

test('four playback speeds preserve the same physical dot sequence', () => {
  const L = loadLessonCore();
  assert.deepEqual(Array.from(L.PLAYBACK_SPEEDS), [0.25, 0.5, 1, 2]);
  for (const speed of L.PLAYBACK_SPEEDS) {
    const result = L.advanceClock(L.createClockState(), 0.1 / speed, speed, true);
    assert.equal(+result.physicalTime.toFixed(6), 0.1);
    assert.deepEqual(Array.from(result.dotTimes, value => +value.toFixed(6)), [0.02, 0.04, 0.06, 0.08, 0.1]);
  }
});

test('teaching camera presets stay bounded and select the intended section', () => {
  const L = loadLessonCore();
  const em = L.viewForPreset({ yaw: 0, pitch: 0, dist: 12, cut: false, machine: 'spark' }, 'emSection');
  assert.equal(em.machine, 'em');
  assert.equal(em.cut, true);
  assert.ok(em.pitch >= L.CAMERA_LIMITS.pitchMin && em.pitch <= L.CAMERA_LIMITS.pitchMax);
  const spark = L.viewForPreset(em, 'sparkSection');
  assert.equal(spark.machine, 'spark');
  assert.equal(spark.cut, true);
  assert.equal(L.viewForPreset(spark, 'missing'), null);
});

test('viewport contract keeps 1024 wide and switches 960 to one active panel', () => {
  const G = loadStudentGuideCore();
  assert.equal(G.layoutForViewport(1024, 768).kind, 'wide');
  assert.equal(G.layoutForViewport(960, 768).kind, 'narrow');
  assert.equal(G.layoutForViewport(960, 540).kind, 'short-landscape');
});

test('student guide follows five physical structure-and-principle stages', () => {
  const G = loadStudentGuideCore();
  assert.equal(G.GUIDE_STEPS.length, 5);
  assert.deepEqual(Array.from(G.GUIDE_STEPS, step => step.focus), [
    'paper-path',
    'em-drive',
    'needle-mark',
    'spark-mark',
    'shared-timing'
  ]);
});

test('student guide advances only from real signals while running', () => {
  const G = loadStudentGuideCore();
  let state = G.guideReducer(G.createGuideState(), { type: 'START' });
  assert.equal(state.status, 'running');
  assert.equal(state.step, 1);

  state = G.guideReducer(state, { type: 'PAUSE' });
  assert.equal(state.status, 'paused');
  assert.equal(G.guideReducer(state, { type: 'SIGNAL_COMPLETE' }).step, 1);

  state = G.guideReducer(state, { type: 'RESUME' });
  for (let step = 2; step <= 5; step += 1) {
    state = G.guideReducer(state, { type: 'SIGNAL_COMPLETE' });
    assert.equal(state.step, step);
    assert.equal(state.status, 'running');
  }
  state = G.guideReducer(state, { type: 'SIGNAL_COMPLETE' });
  assert.equal(state.step, 5);
  assert.equal(state.status, 'completed');
});

test('guide stages become ready only in their required real scene state', () => {
  const G = loadStudentGuideCore();
  const paperPath = { machine: 'em', camera: 'standard', powered: false, focusParts: ['tape', 'hole'] };
  assert.equal(G.sceneReadyForStep(1, paperPath), true);
  assert.equal(G.sceneReadyForStep(1, { ...paperPath, camera: 'emSection' }), false);
  assert.equal(G.sceneReadyForStep(1, { ...paperPath, focusParts: ['tape'] }), false);

  const emDrive = { machine: 'em', camera: 'emSection', powered: true, focusParts: ['coil', 'reed'] };
  assert.equal(G.sceneReadyForStep(2, emDrive), true);
  assert.equal(G.sceneReadyForStep(2, { ...emDrive, powered: false }), false);
  assert.equal(G.sceneReadyForStep(2, { ...emDrive, machine: 'spark' }), false);
});

test('manual scene controls stay locked until the guide returns to exploration', () => {
  const G = loadStudentGuideCore();
  let state = G.createGuideState();
  assert.equal(G.manualControlsEnabled(state), true);

  state = G.guideReducer(state, { type: 'START' });
  assert.equal(G.manualControlsEnabled(state), false);
  state = G.guideReducer(state, { type: 'PAUSE' });
  assert.equal(G.manualControlsEnabled(state), false);
  state = G.guideReducer(state, { type: 'EXPLORE' });
  assert.equal(G.manualControlsEnabled(state), true);
});

test('02A has five focused principle steps', () => {
  const T = loadTeachingCore();
  assert.deepEqual(Array.from(T.PRINCIPLE_STEPS, step => step.id), [1, 2, 3, 4, 5]);
  for (const step of T.PRINCIPLE_STEPS) {
    assert.ok(step.task.length > 0);
    assert.ok(step.observe.length > 0);
    assert.ok(step.focusParts.length >= 1 && step.focusParts.length <= 2);
  }
});

test('guided mode gates progress while explore mode permits direct focus', () => {
  const T = loadTeachingCore();
  const start = T.createTeachingState('guided');
  assert.equal(T.principleReducer(start, { type: 'NEXT' }).step, 1);
  const observed = T.principleReducer(start, { type: 'CONFIRM_OBSERVATION' });
  assert.equal(T.principleReducer(observed, { type: 'NEXT' }).step, 2);
  const explore = T.principleReducer(start, { type: 'SET_MODE', mode: 'explore' });
  assert.equal(T.principleReducer(explore, { type: 'SELECT_STEP', step: 4 }).step, 4);
  assert.equal(T.principleReducer(start, { type: 'SELECT_STEP', step: 4 }).step, 1);
});

test('auto mode advances only while running and remains user-pausable', () => {
  const T = loadTeachingCore();
  const auto = T.createTeachingState('auto');
  const paused = T.principleReducer(auto, { type: 'SET_RUNNING', running: false });
  assert.equal(T.principleReducer(paused, { type: 'AUTO_TICK' }).step, 1);
  const observed = T.principleReducer(auto, { type: 'AUTO_TICK' });
  assert.equal(observed.observationConfirmed, true);
  assert.equal(T.principleReducer(observed, { type: 'AUTO_TICK' }).step, 2);
});

test('the approved source remains hash locked', () => {
  const digest = createHash('sha256').update(readFileSync(sourcePath)).digest('hex');
  assert.equal(digest, approvedHash);
});

test('02A preserves the approved baseline and remains offline and silent', () => {
  const html = read02A();

  assert.doesNotMatch(html, /<script[^>]+src=/i);
  assert.doesNotMatch(html, /<link[^>]+href=/i);
  assert.doesNotMatch(html, /<audio|new Audio|speechSynthesis/i);
});
