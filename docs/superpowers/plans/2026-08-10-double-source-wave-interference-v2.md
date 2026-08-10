# 双波源干涉 v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在不覆盖原文件的前提下，生成一个用 `r₁、r₂ → Δr/λ → 加强/减弱/非极值` 教学链串起主场景、预测、单张 P 点振动图和干涉线验证的横屏平板单文件原型。

**Architecture:** v2 仍是零外部依赖的单 HTML 文件。为便于 TDD，纯物理计算和纯教学状态分别放在同文件内带 `data-wave-physics-core` 和 `data-wave-teaching-core` 的脚本块；浏览器控制器只协调 DOM、Canvas、指针交互和这两组纯状态。Node 内置测试从 HTML 提取纯脚本块执行，正式交付不增加外部模块。

**Tech Stack:** HTML5、CSS、Canvas 2D、原生 JavaScript、Node.js `node:test`、Codex in-app Browser、仅监听 `127.0.0.1` 的临时静态服务器。

## Global Constraints

- 原文件 `/Users/luogaowei/Documents/网站全部动画/16-波的叠加与干涉   双波源干涉图样.html` 保持 SHA-256 `53fc7e73ab4dfc566aed3c2c895e46e9ad883cccc21b9ec2edc540e4ef2f40a6`，不得覆盖或删除。
- 新增文件名固定为 `16-波的叠加与干涉 双波源干涉图样-v2.html`。
- 最终交付必须是单文件、零外部依赖、可离线运行、全程无声音。
- 唯一主教学目标是用 `Δr/λ` 判断 P 点是加强点、减弱点还是非极值点；P 点振动图只服务于该目标。
- 物理模型固定为同相、同频、等振幅、无距离衰减的稳态干涉场；不显示有限波前或“全区图样形成”事件。
- `d` 范围固定为 `1.5～5.0 m`、步长 `0.1 m`、默认 `3.0 m`；`λ` 范围固定为 `0.5～2.0 m`、步长 `0.1 m`、默认 `1.0 m`。
- `A=1`、`v=1.0 m/s`；`r₁`、`r₂`、`Δr`、`Δr/λ`、相位差和合振幅为系统计算量。
- 自由选点不用宽阈值强制分类；`0.02` 仅是理论线触控命中容差，命中时使用“接近”文案，不篡改精确判据。
- 宽屏必须是左参数、中主舞台、右观察的三栏；`1024px` 宽仍保持三栏；`960×540` 使用左舞台+右活动面板。
- 必须使用 `/Users/luogaowei/Documents/代码保存仓库/动画制作/docs/物理动画视觉标准-v1.md` 的品牌标题、颜色 Token、六级字号、三栏职责和响应式边界。
- 可见 DOM、Canvas 和 SVG 文字只能使用 `20px`、`16px`、`14px`、`13px`、`12px`、`11px`，不得低于 `11px`。
- 自动演示、分步引导和自由探索共用同一物理内核和教学步骤定义。
- 所有浏览器验证必须通过仅监听 `127.0.0.1` 的临时静态服务器，禁止直接自动化 `file://` 页面。

---

### Task 1: 建立受保护的 v2 基线与测试入口

**Files:**
- Create: `16-波的叠加与干涉 双波源干涉图样-v2.html`
- Create: `tests/double-source-wave-interference-v2.test.mjs`

**Interfaces:**
- Consumes: 原始 HTML 及其锁定 SHA-256。
- Produces: 未改变运行行为的 v2 基线，以及后续任务共用的 `readV2()`、`loadInlineCore(attributeName, globals)` 测试工具。

- [ ] **Step 1: 写入会因 v2 尚不存在而失败的基线测试**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import vm from 'node:vm';

export const repoRoot = resolve(import.meta.dirname, '..');
export const v2Path = resolve(repoRoot, '16-波的叠加与干涉 双波源干涉图样-v2.html');

export function readV2() {
  return readFileSync(v2Path, 'utf8');
}

export function loadInlineCore(attributeName, globals = {}) {
  const html = readV2();
  const pattern = new RegExp(`<script\\s+${attributeName}[^>]*>([\\s\\S]*?)<\\/script>`);
  const match = html.match(pattern);
  assert.ok(match, `missing <script ${attributeName}>`);
  const window = {};
  vm.runInNewContext(match[1], { window, Math, Object, Array, Set, ...globals });
  return window;
}

test('v2 starts as an offline and silent single-file artifact', () => {
  const html = readV2();
  assert.match(html, /<canvas/i);
  assert.doesNotMatch(html, /<script[^>]+src=/i);
  assert.doesNotMatch(html, /<link[^>]+href=/i);
  assert.doesNotMatch(html, /<audio|new Audio|speechSynthesis|AudioContext/i);
});
```

- [ ] **Step 2: 运行测试并确认因 v2 文件不存在而失败**

Run:

```bash
/Users/luogaowei/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/double-source-wave-interference-v2.test.mjs
```

Expected: FAIL，错误包含 `ENOENT` 和 v2 文件名。

- [ ] **Step 3: 从原文件机械复制 v2，不编辑原文件**

Run:

```bash
cp -- '/Users/luogaowei/Documents/网站全部动画/16-波的叠加与干涉   双波源干涉图样.html' '16-波的叠加与干涉 双波源干涉图样-v2.html'
shasum -a 256 '/Users/luogaowei/Documents/网站全部动画/16-波的叠加与干涉   双波源干涉图样.html' '16-波的叠加与干涉 双波源干涉图样-v2.html'
```

Expected: 两个文件均为 `53fc7e73ab4dfc566aed3c2c895e46e9ad883cccc21b9ec2edc540e4ef2f40a6`。

- [ ] **Step 4: 运行基线测试并确认通过**

Run: `/Users/luogaowei/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/double-source-wave-interference-v2.test.mjs`

Expected: PASS，1 test，0 failures。

- [ ] **Step 5: 提交受保护基线**

```bash
git add '16-波的叠加与干涉 双波源干涉图样-v2.html' tests/double-source-wave-interference-v2.test.mjs
git commit -m 'test: establish double-source interference v2 baseline'
```

### Task 2: 建立等振幅纯物理核心

**Files:**
- Modify: `16-波的叠加与干涉 双波源干涉图样-v2.html`
- Modify: `tests/double-source-wave-interference-v2.test.mjs`

**Interfaces:**
- Consumes: `d`、`lambda`、`v`、`A`、`t` 和 P 点物理坐标。
- Produces: `window.WaveInterferencePhysics`，包含 `sourcePositions`、`measureProbe`、`classifyRatio`、`resultantAmplitude`、`deriveProbeState`、`samplePointVibration`、`createViewportTransform`。

- [ ] **Step 1: 为纯物理核心写失败测试**

在测试文件加入：

```js
function loadPhysics() {
  return loadInlineCore('data-wave-physics-core').WaveInterferencePhysics;
}

test('the perpendicular bisector is exactly constructive', () => {
  const P = loadPhysics();
  const state = P.deriveProbeState({ probe: { x: 0, y: 2 }, d: 3, lambda: 1, v: 1, A: 1, t: 0 });
  assert.equal(state.r1, 2.5);
  assert.equal(state.r2, 2.5);
  assert.equal(state.pathDifference, 0);
  assert.equal(state.ratio, 0);
  assert.equal(state.exactKind, 'constructive');
  assert.equal(state.resultantAmplitude, 2);
});

test('axis points cover constructive, destructive, and intermediate states', () => {
  const P = loadPhysics();
  const strong = P.deriveProbeState({ probe: { x: 0.5, y: 0 }, d: 3, lambda: 1, v: 1, A: 1, t: 0.25 });
  const weak = P.deriveProbeState({ probe: { x: 0.25, y: 0 }, d: 3, lambda: 1, v: 1, A: 1, t: 0 });
  const middle = P.deriveProbeState({ probe: { x: 0.125, y: 0 }, d: 3, lambda: 1, v: 1, A: 1, t: 0 });
  assert.equal(strong.ratio, 1);
  assert.equal(strong.exactKind, 'constructive');
  assert.ok(Math.abs(strong.y - 2) < 1e-12);
  assert.equal(weak.ratio, 0.5);
  assert.equal(weak.exactKind, 'destructive');
  assert.ok(Math.abs(weak.y) < 1e-12);
  assert.equal(middle.ratio, 0.25);
  assert.equal(middle.exactKind, 'intermediate');
  assert.ok(Math.abs(middle.resultantAmplitude - Math.SQRT2) < 1e-12);
});

test('touch tolerance never changes the exact theoretical kind', () => {
  const P = loadPhysics();
  const near = P.classifyRatio(1.018);
  assert.equal(near.exactKind, 'intermediate');
  assert.equal(near.proximity, 'constructive');
  assert.ok(Math.abs(near.distance - 0.018) < 1e-12);
  assert.equal(P.classifyRatio(1.03).proximity, null);
  assert.equal(P.classifyRatio(1.5).exactKind, 'destructive');
});

test('vibration sampling spans two periods on a fixed amplitude scale', () => {
  const P = loadPhysics();
  const samples = P.samplePointVibration({ r1: 2, r2: 1, lambda: 1, v: 1, A: 1, sampleCount: 129, cycles: 2 });
  assert.equal(samples.points.length, 129);
  assert.equal(samples.domain.tMin, 0);
  assert.equal(samples.domain.tMax, 2);
  assert.deepEqual(JSON.parse(JSON.stringify(samples.domain.y)), [-2, 2]);
  assert.ok(samples.points.every((point) => Math.abs(point.y - (point.y1 + point.y2)) < 1e-12));
});

test('viewport transform preserves equal physical scales and round trips', () => {
  const P = loadPhysics();
  const tx = P.createViewportTransform({
    width: 800,
    height: 400,
    padding: 20,
    bounds: { xMin: -5, xMax: 5, yMin: -3, yMax: 3 }
  });
  assert.equal(tx.scale, 60);
  assert.deepEqual(JSON.parse(JSON.stringify(tx.toScreen({ x: 0, y: 0 }))), { x: 400, y: 200 });
  const point = { x: 1.25, y: -0.75 };
  const roundTrip = tx.toPhysics(tx.toScreen(point));
  assert.ok(Math.abs(roundTrip.x - point.x) < 1e-12);
  assert.ok(Math.abs(roundTrip.y - point.y) < 1e-12);
});
```

- [ ] **Step 2: 运行并确认缺少 `data-wave-physics-core` 而失败**

Run: `/Users/luogaowei/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/double-source-wave-interference-v2.test.mjs`

Expected: FAIL，错误为 `missing <script data-wave-physics-core>`。

- [ ] **Step 3: 在浏览器控制脚本之前实现纯物理核心**

脚本块使用以下公开边界：

```html
<script data-wave-physics-core>
(function (global) {
  'use strict';
  const EXACT_EPSILON = 1e-9;
  const HIT_TOLERANCE = 0.02;

  function sourcePositions(d) {
    return { s1: { x: -d / 2, y: 0 }, s2: { x: d / 2, y: 0 } };
  }

  function distance(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  function measureProbe(probe, d) {
    const sources = sourcePositions(d);
    const r1 = distance(probe, sources.s1);
    const r2 = distance(probe, sources.s2);
    return { sources, r1, r2, pathDifference: Math.abs(r1 - r2) };
  }

  function classifyRatio(ratio) {
    const nearestInteger = Math.round(ratio);
    const nearestHalf = Math.floor(ratio) + 0.5;
    const integerDistance = Math.abs(ratio - nearestInteger);
    const halfDistance = Math.abs(ratio - nearestHalf);
    if (integerDistance <= EXACT_EPSILON) return { exactKind: 'constructive', proximity: 'constructive', distance: integerDistance };
    if (halfDistance <= EXACT_EPSILON) return { exactKind: 'destructive', proximity: 'destructive', distance: halfDistance };
    if (integerDistance <= HIT_TOLERANCE) return { exactKind: 'intermediate', proximity: 'constructive', distance: integerDistance };
    if (halfDistance <= HIT_TOLERANCE) return { exactKind: 'intermediate', proximity: 'destructive', distance: halfDistance };
    return { exactKind: 'intermediate', proximity: null, distance: Math.min(integerDistance, halfDistance) };
  }

  function resultantAmplitude(ratio, A) {
    return 2 * A * Math.abs(Math.cos(Math.PI * ratio));
  }

  function deriveProbeState({ probe, d, lambda, v, A, t }) {
    const measured = measureProbe(probe, d);
    const ratio = measured.pathDifference / lambda;
    const frequency = v / lambda;
    const omega = 2 * Math.PI * frequency;
    const k = 2 * Math.PI / lambda;
    const y1 = A * Math.sin(omega * t - k * measured.r1);
    const y2 = A * Math.sin(omega * t - k * measured.r2);
    const classification = classifyRatio(ratio);
    return {
      ...measured,
      ratio,
      phaseDifference: 2 * Math.PI * ratio,
      resultantAmplitude: resultantAmplitude(ratio, A),
      exactKind: classification.exactKind,
      proximity: classification.proximity,
      y1,
      y2,
      y: y1 + y2
    };
  }

  function samplePointVibration({ r1, r2, lambda, v, A, sampleCount, cycles }) {
    const period = lambda / v;
    const tMax = cycles * period;
    const omega = 2 * Math.PI / period;
    const k = 2 * Math.PI / lambda;
    const points = [];
    for (let index = 0; index < sampleCount; index += 1) {
      const t = tMax * index / (sampleCount - 1);
      const y1 = A * Math.sin(omega * t - k * r1);
      const y2 = A * Math.sin(omega * t - k * r2);
      points.push({ t, tOverT: t / period, y1, y2, y: y1 + y2 });
    }
    return { period, domain: { tMin: 0, tMax, y: [-2 * A, 2 * A] }, points };
  }

  function createViewportTransform({ width, height, padding, bounds }) {
    const physicalWidth = bounds.xMax - bounds.xMin;
    const physicalHeight = bounds.yMax - bounds.yMin;
    const scale = Math.min(
      (width - 2 * padding) / physicalWidth,
      (height - 2 * padding) / physicalHeight
    );
    const contentWidth = physicalWidth * scale;
    const contentHeight = physicalHeight * scale;
    const left = (width - contentWidth) / 2;
    const top = (height - contentHeight) / 2;
    return {
      scale,
      toScreen(point) {
        return {
          x: left + (point.x - bounds.xMin) * scale,
          y: top + (bounds.yMax - point.y) * scale
        };
      },
      toPhysics(point) {
        return {
          x: bounds.xMin + (point.x - left) / scale,
          y: bounds.yMax - (point.y - top) / scale
        };
      }
    };
  }

  global.WaveInterferencePhysics = Object.freeze({
    sourcePositions,
    measureProbe,
    classifyRatio,
    resultantAmplitude,
    deriveProbeState,
    samplePointVibration,
    createViewportTransform
  });
})(window);
</script>
```

`deriveProbeState()` 和 `samplePointVibration()` 均只读参数，不读取 DOM。绘图层只能使用这些返回值，不重复公式。

- [ ] **Step 4: 运行物理测试并确认全部通过**

Run: `/Users/luogaowei/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/double-source-wave-interference-v2.test.mjs`

Expected: PASS，基线、典型点、容差、振动采样和坐标往返测试全部 0 failures。

- [ ] **Step 5: 提交物理核心**

```bash
git add '16-波的叠加与干涉 双波源干涉图样-v2.html' tests/double-source-wave-interference-v2.test.mjs
git commit -m 'fix: add testable equal-amplitude interference core'
```

### Task 3: 建立可测试的教学状态机

**Files:**
- Modify: `16-波的叠加与干涉 双波源干涉图样-v2.html`
- Modify: `tests/double-source-wave-interference-v2.test.mjs`

**Interfaces:**
- Consumes: 用户或物理时间动作 `SET_MODE`、`SET_STEP`、`SET_PARAMETER`、`SELECT_PROBE`、`SET_PREDICTION`、`REVEAL_RESULT`、`SET_PANEL`、`SET_PLAYING`、`SET_SPEED`、`ADVANCE_TIME`、`RESET`。
- Produces: `window.WaveInterferenceTeaching.createInitialState()`、`reduceState(state, action)`、`createActionScheduler(setTimer, clearTimer)`、`GUIDE_STEPS`。

- [ ] **Step 1: 写状态不变式和取消过期动作的失败测试**

```js
function loadTeaching() {
  return loadInlineCore('data-wave-teaching-core').WaveInterferenceTeaching;
}

test('parameter changes preserve the probe and clear stale conclusions', () => {
  const T = loadTeaching();
  let state = T.createInitialState();
  state = T.reduceState(state, { type: 'SELECT_PROBE', probe: { x: 0.5, y: 0 } });
  state = T.reduceState(state, { type: 'SET_PREDICTION', prediction: 'constructive' });
  state = T.reduceState(state, { type: 'REVEAL_RESULT' });
  state = T.reduceState(state, { type: 'SET_PARAMETER', key: 'lambda', value: 1.2 });
  assert.deepEqual(JSON.parse(JSON.stringify(state.probe)), { x: 0.5, y: 0 });
  assert.equal(state.lambda, 1.2);
  assert.equal(state.prediction, null);
  assert.equal(state.resultRevealed, false);
});

test('panel and mode changes do not reset physics or predictions', () => {
  const T = loadTeaching();
  let state = T.createInitialState();
  state = T.reduceState(state, { type: 'SELECT_PROBE', probe: { x: 0.25, y: 0 } });
  state = T.reduceState(state, { type: 'SET_PREDICTION', prediction: 'destructive' });
  const panelState = T.reduceState(state, { type: 'SET_PANEL', panel: 'observe' });
  const exploreState = T.reduceState(panelState, { type: 'SET_MODE', mode: 'explore' });
  assert.equal(exploreState.d, 3);
  assert.equal(exploreState.lambda, 1);
  assert.equal(exploreState.prediction, 'destructive');
  assert.deepEqual(JSON.parse(JSON.stringify(exploreState.probe)), { x: 0.25, y: 0 });
});

test('guide results cannot reveal before a prediction', () => {
  const T = loadTeaching();
  const state = T.createInitialState();
  const blocked = T.reduceState(state, { type: 'REVEAL_RESULT' });
  assert.equal(blocked.resultRevealed, false);
  const predicted = T.reduceState(state, { type: 'SET_PREDICTION', prediction: 'constructive' });
  assert.equal(T.reduceState(predicted, { type: 'REVEAL_RESULT' }).resultRevealed, true);
});

test('advancing time changes no geometric or teaching state', () => {
  const T = loadTeaching();
  const state = T.createInitialState();
  const advanced = T.reduceState(state, { type: 'ADVANCE_TIME', dt: 0.25 });
  assert.equal(advanced.time, 0.25);
  assert.equal(advanced.d, state.d);
  assert.equal(advanced.lambda, state.lambda);
  assert.equal(advanced.step, state.step);
  assert.deepEqual(JSON.parse(JSON.stringify(advanced.probe)), JSON.parse(JSON.stringify(state.probe)));
});

test('cancelled automatic-demo generations cannot mutate newer state', () => {
  const T = loadTeaching();
  const callbacks = [];
  const scheduler = T.createActionScheduler((fn) => { callbacks.push(fn); return callbacks.length - 1; }, () => {});
  let mutations = 0;
  scheduler.schedule(() => { mutations += 1; }, 200);
  scheduler.cancelAll();
  callbacks[0]();
  assert.equal(mutations, 0);
});
```

- [ ] **Step 2: 运行并确认缺少 `data-wave-teaching-core` 而失败**

Run: `/Users/luogaowei/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/double-source-wave-interference-v2.test.mjs`

Expected: FAIL，错误为 `missing <script data-wave-teaching-core>`。

- [ ] **Step 3: 实现不修改输入对象的教学 reducer**

```html
<script data-wave-teaching-core>
(function (global) {
  'use strict';
  const GUIDE_STEPS = Object.freeze([
    'predict', 'paths', 'difference', 'criterion', 'vibration', 'locus', 'retry'
  ]);

  function createInitialState() {
    return {
      mode: 'guide', step: 0, d: 3, lambda: 1, time: 0,
      playing: true, speed: 1, panel: 'conditions',
      probe: { x: 0.5, y: 0 }, prediction: null,
      resultRevealed: false, showCurrentLocus: false
    };
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function reduceState(state, action) {
    switch (action.type) {
      case 'SET_PARAMETER': {
        const limits = action.key === 'd' ? [1.5, 5] : [0.5, 2];
        const raw = Number(action.value);
        const value = Number.isFinite(raw) ? clamp(raw, limits[0], limits[1]) : state[action.key];
        return { ...state, [action.key]: value, prediction: null, resultRevealed: false, showCurrentLocus: false };
      }
      case 'SELECT_PROBE':
        return { ...state, probe: { ...action.probe }, prediction: null, resultRevealed: state.mode === 'explore', showCurrentLocus: false };
      case 'SET_PREDICTION':
        return { ...state, prediction: action.prediction, resultRevealed: false, showCurrentLocus: false };
      case 'REVEAL_RESULT':
        return state.mode !== 'explore' && !state.prediction ? state : { ...state, resultRevealed: true };
      case 'SET_MODE': return { ...state, mode: action.mode, resultRevealed: action.mode === 'explore' ? true : state.resultRevealed };
      case 'SET_STEP': return { ...state, step: Math.max(0, Math.min(GUIDE_STEPS.length - 1, action.step)) };
      case 'SET_PANEL': return { ...state, panel: action.panel };
      case 'SET_PLAYING': return { ...state, playing: Boolean(action.playing) };
      case 'SET_SPEED': return { ...state, speed: action.speed };
      case 'ADVANCE_TIME': return { ...state, time: state.time + Math.max(0, action.dt) };
      case 'RESET': return createInitialState();
      default: return state;
    }
  }

  function createActionScheduler(setTimer, clearTimer) {
    let generation = 0;
    const handles = new Set();
    return {
      schedule(callback, delay) {
        const scheduledGeneration = generation;
        let handle = null;
        handle = setTimer(() => {
          handles.delete(handle);
          if (scheduledGeneration === generation) callback();
        }, delay);
        handles.add(handle);
        return handle;
      },
      cancelAll() {
        generation += 1;
        handles.forEach((handle) => clearTimer(handle));
        handles.clear();
      },
      generation() {
        return generation;
      }
    };
  }

  global.WaveInterferenceTeaching = Object.freeze({ GUIDE_STEPS, createInitialState, reduceState, createActionScheduler });
})(window);
</script>
```

- [ ] **Step 4: 运行测试并确认状态边界通过**

Run: `/Users/luogaowei/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/double-source-wave-interference-v2.test.mjs`

Expected: PASS，参数变化、面板切换、模式切换、结果解锁和自动演示取消全部 0 failures。

- [ ] **Step 5: 提交教学状态核心**

```bash
git add '16-波的叠加与干涉 双波源干涉图样-v2.html' tests/double-source-wave-interference-v2.test.mjs
git commit -m 'feat: add interference teaching state core'
```

### Task 4: 替换为标准品牌、三栏和响应式外壳

**Files:**
- Modify: `16-波的叠加与干涉 双波源干涉图样-v2.html`
- Modify: `tests/double-source-wave-interference-v2.test.mjs`

**Interfaces:**
- Consumes: 视觉标准 v1 和 Task 3 的教学状态字段。
- Produces: `#headerBackSlot`、`.template-header`、`#experimentLayout`、`#controlPanel`、`#stage`、`#observePanel`、`#mobileTabs`、`#processBar`，以及全部标准 CSS Token。

- [ ] **Step 1: 写视觉标准、结构和删减边界的失败测试**

```js
test('v2 uses the authoritative brand and interface tokens', () => {
  const html = readV2();
  assert.match(html, /id="headerBackSlot"/);
  assert.match(html, /class="brand-mark"[^>]*>\s*罗\s*</);
  assert.match(html, /老罗物理 · 探究实验/);
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  for (const token of [
    '--surface-page:#f7f4ed', '--surface-raised:#fffdf8', '--border:#d8d6cf',
    '--text-strong:#14213d', '--text-muted:#5c6678', '--action:#2557d6',
    '--stage:#0b1424', '--stage-line:#263650', '--stage-text:#f4f8ff', '--stage-muted:#91a3bf',
    '--wave-positive:#f6c453', '--wave-negative:#24569d',
    '--wave-antinode:#4ade80', '--wave-node:#f8fafc'
  ]) assert.match(html.replace(/\s+/g, '').toLowerCase(), new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
});

test('v2 has the approved three-column and short-landscape structure', () => {
  const html = readV2();
  assert.match(html, /id="experimentLayout"/);
  assert.match(html, /id="controlPanel"/);
  assert.match(html, /id="stage"/);
  assert.match(html, /id="observePanel"/);
  assert.match(html, /id="mobileTabs"/);
  assert.match(html, /参数设置/);
  assert.match(html, /观察数据/);
  assert.match(html, /max-width:\s*960px/);
  assert.match(html, /max-height:\s*540px/);
  assert.match(html, /--header-height:\s*46px/);
});

test('v2 removes old competing goals and forbidden transient claims', () => {
  const html = readV2();
  assert.doesNotMatch(html, /id="chartCross"|id="chartStrip"|id="A"/);
  assert.doesNotMatch(html, /shownEvents|eventResumeAt|ampAt\s*\(|全区.*稳定干涉图样/);
  assert.doesNotMatch(html, /font-size:\s*(?:8|9|10|10\.5|12\.5|13\.5|15|17|18|19|21)px/i);
});
```

- [ ] **Step 2: 运行并确认旧外壳不符合标准而失败**

Run: `/Users/luogaowei/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/double-source-wave-interference-v2.test.mjs`

Expected: FAIL，至少报告缺少 `headerBackSlot`、缺少标准 Token 和仍存在旧图表。

- [ ] **Step 3: 使用标准模板替换 HTML 外壳与 CSS**

结构固定为：

```html
<header class="topbar template-header">
  <div id="headerBackSlot"></div>
  <div class="brand">
    <div class="brand-mark" aria-hidden="true">罗</div>
    <div class="brand-copy">
      <p class="eyebrow">老罗物理 · 探究实验</p>
      <h1>波的干涉｜用波程差判断加强与减弱</h1>
    </div>
  </div>
  <nav class="learning-modes" aria-label="学习模式">
    <button id="purposeButton" type="button">模型</button>
    <button type="button" data-mode="demo" aria-pressed="false">演示</button>
    <button type="button" data-mode="guide" aria-pressed="true">引导</button>
    <button type="button" data-mode="explore" aria-pressed="false">探索</button>
  </nav>
</header>
<main id="experimentLayout" class="experiment-layout" data-panel="conditions">
  <aside id="controlPanel" class="control-panel" role="tabpanel" aria-labelledby="conditionsTab">
    <section class="panel-section">
      <h2>实验条件</h2>
      <label class="slider-row" for="sourceDistance"><span>波源间距 d</span><output id="sourceDistanceValue" for="sourceDistance">3.0 m</output></label>
      <input id="sourceDistance" type="range" min="1.5" max="5" step="0.1" value="3" aria-label="波源间距 d">
      <label class="slider-row" for="wavelength"><span>波长 λ</span><output id="wavelengthValue" for="wavelength">1.0 m</output></label>
      <input id="wavelength" type="range" min="0.5" max="2" step="0.1" value="1" aria-label="波长 λ">
      <button id="resetParameters" type="button">恢复默认条件</button>
    </section>
    <section class="panel-section">
      <h2>典型点</h2>
      <div class="preset-grid" aria-label="典型探测点">
        <button type="button" data-probe="constructive">加强点</button>
        <button type="button" data-probe="destructive">减弱点</button>
        <button type="button" data-probe="intermediate">非极值点</button>
      </div>
    </section>
    <section id="predictionGroup" class="panel-section" aria-labelledby="predictionTitle">
      <h2 id="predictionTitle">先预测 P 点</h2>
      <div class="prediction-grid">
        <button type="button" data-prediction="constructive">加强</button>
        <button type="button" data-prediction="destructive">减弱</button>
        <button type="button" data-prediction="intermediate">非极值</button>
      </div>
      <button id="revealResult" type="button">用波程差验证</button>
    </section>
  </aside>
  <section id="stage" class="stage" aria-label="双波源干涉主场景">
    <canvas id="scene"></canvas>
  </section>
  <div id="mobileTabs" class="mobile-tabs" role="tablist" aria-label="侧栏切换">
    <button id="conditionsTab" type="button" role="tab" aria-selected="true" aria-controls="controlPanel">参数设置</button>
    <button id="observeTab" type="button" role="tab" aria-selected="false" aria-controls="observePanel">观察数据</button>
  </div>
  <aside id="observePanel" class="observe-panel" role="tabpanel" aria-labelledby="observeTab">
    <section class="panel-section current-task"><h2>当前观察</h2><p id="stepTask">判断 P 点是加强点、减弱点还是非极值点。</p></section>
    <section id="pathDifferenceChain" class="panel-section" aria-label="波程差判定链">
      <h2>波程差判定</h2>
      <p><span>r₁</span><output id="r1Value">— m</output></p>
      <p><span>r₂</span><output id="r2Value">— m</output></p>
      <p><span>Δr=|r₁-r₂|</span><output id="pathDifferenceValue">— m</output></p>
      <p><span>Δr/λ</span><output id="ratioValue">—</output></p>
    </section>
    <section id="resultCard" class="panel-section" aria-live="polite">
      <h2>预测与验证</h2>
      <p id="predictionSummary">先选择你的预测。</p>
      <p id="resultSummary">结果将在验证后显示。</p>
    </section>
    <section class="panel-section graph-card">
      <h2>P 点振动图</h2>
      <canvas id="probeGraph" aria-label="P 点振动图"></canvas>
      <p class="graph-domain">横轴 0～2T｜纵轴 -2A～2A</p>
      <p class="graph-legend">y₁(t) · y₂(t) · y(t)=y₁+y₂</p>
    </section>
  </aside>
  <footer id="processBar" class="process-bar">
    <div class="process-group" aria-label="教学步骤">
      <span class="process-label">教学步骤</span>
      <button id="previousStep" type="button">上一步</button>
      <button id="nextStep" type="button">下一步</button>
    </div>
    <div class="process-group" aria-label="物理播放">
      <span class="process-label">物理播放</span>
      <button id="playPause" type="button">暂停</button>
      <button type="button" data-speed="0.25">0.25×</button>
      <button type="button" data-speed="0.5">0.5×</button>
      <button type="button" data-speed="1" aria-pressed="true">1×</button>
      <button type="button" data-speed="2">2×</button>
    </div>
  </footer>
</main>
```

CSS 直接使用视觉标准的 Token、`grid-template-columns:clamp(220px,22vw,280px) minmax(0,1fr) clamp(240px,21vw,314px)` 和两个响应式媒查询。标题栏使用 `grid-template-columns:42px minmax(0,1fr) auto`；短横屏中模式按钮保持“模型/演示/引导/探索”四个短标签，不隐藏品牌眉题。

- [ ] **Step 4: 运行结构测试并通过首次静态预览**

Run: `/Users/luogaowei/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/double-source-wave-interference-v2.test.mjs`

Expected: PASS，标准 Token、品牌、三栏、响应式断点和删减边界全部 0 failures。通过 `127.0.0.1` 预览时，标题、左右面板和深色舞台可见，页面无横向滚动。

- [ ] **Step 5: 提交标准页面外壳**

```bash
git add '16-波的叠加与干涉 双波源干涉图样-v2.html' tests/double-source-wave-interference-v2.test.mjs
git commit -m 'feat: apply physics animation visual standard'
```

### Task 5: 实现等比例主舞台和 P 点拖动

**Files:**
- Modify: `16-波的叠加与干涉 双波源干涉图样-v2.html`
- Modify: `tests/double-source-wave-interference-v2.test.mjs`

**Interfaces:**
- Consumes: `WaveInterferencePhysics.createViewportTransform()`、`deriveProbeState()` 和 `WaveInterferenceTeaching.reduceState()`。
- Produces: `window.WaveInterferenceApp`，公开只读 `getState()`、`getDerived()`、`dispatch(action)`、`redraw()`；内部统一使用 `syncCanvas(canvas) -> { ctx, width, height, dpr }`、`readCssColor(token)`、`renderDom()`、`drawScene()`、`redraw()`，以及可点击/拖动的高 DPI 主场景。

- [ ] **Step 1: 写主控制器边界和旧物理清除的失败测试**

```js
test('the browser controller consumes the tested cores and pointer events', () => {
  const html = readV2();
  assert.match(html, /data-wave-app/);
  assert.match(html, /WaveInterferencePhysics/);
  assert.match(html, /WaveInterferenceTeaching/);
  assert.match(html, /pointerdown/);
  assert.match(html, /pointermove/);
  assert.match(html, /pointerup/);
  assert.match(html, /setPointerCapture/);
  assert.doesNotMatch(html, /function\s+ampAt\s*\(/);
});

test('scene drawing reads semantic colors from CSS tokens', () => {
  const html = readV2();
  assert.match(html, /getPropertyValue\(['"]--viz-circular['"]\)/);
  assert.match(html, /getPropertyValue\(['"]--viz-transfer['"]\)/);
  assert.match(html, /getPropertyValue\(['"]--viz-required['"]\)/);
  assert.match(html, /getPropertyValue\(['"]--wave-positive['"]\)/);
  assert.match(html, /getPropertyValue\(['"]--wave-negative['"]\)/);
  assert.doesNotMatch(html, /strokeStyle\s*=\s*['"]#(?:38bdf8|fb923c|c084fc)/i);
});
```

- [ ] **Step 2: 运行并确认缺少主控制器和指针交互而失败**

Run: `/Users/luogaowei/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/double-source-wave-interference-v2.test.mjs`

Expected: FAIL，报告缺少 `data-wave-app` 或缺少指针事件。

- [ ] **Step 3: 实现主控制器和分层绘制**

```js
const Physics = window.WaveInterferencePhysics;
const Teaching = window.WaveInterferenceTeaching;
let state = Teaching.createInitialState();
let derived = Physics.deriveProbeState({
  probe: state.probe, d: state.d, lambda: state.lambda,
  v: 1, A: 1, t: state.time
});

function dispatch(action) {
  state = Teaching.reduceState(state, action);
  derived = Physics.deriveProbeState({
    probe: state.probe, d: state.d, lambda: state.lambda,
    v: 1, A: 1, t: state.time
  });
  renderDom();
  redraw();
}
```

主舞台使用三层责任：离屏位移场、可缓存的理论线、每帧绘制的波源/P 点/波程/标注。位移场使用等振幅 `y1+y2`，正位移、负位移和零位移使用从 CSS Token 读取的题型语义色混合。视域固定为 `x∈[-5,5]`、`y∈[-3,3]`，使用 Task 2 的等比例 transform 居中。

P 点使用 Pointer Events：`pointerdown` 命中半径至少 `22 CSS px`，调用 `setPointerCapture()`；`pointermove` 通过 `toPhysics()` 更新并夹取坐标；`pointerup` 结束拖动。点击空白位置直接将 P 点移至该物理坐标。

- [ ] **Step 4: 运行测试并通过主舞台交互验证**

Run: `/Users/luogaowei/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/double-source-wave-interference-v2.test.mjs`

Expected: PASS，主控制器、指针交互和 Token 读取测试 0 failures。

浏览器验证：在 1024×768 点击中垂线任意点，`WaveInterferenceApp.getDerived()` 的 `pathDifference` 为 `0`；拖动 P 点时 `r₁`、`r₂` 连续更新，Canvas 图样不拉伸，控制台无 error。

- [ ] **Step 5: 提交主舞台和探测交互**

```bash
git add '16-波的叠加与干涉 双波源干涉图样-v2.html' tests/double-source-wave-interference-v2.test.mjs
git commit -m 'feat: add equal-scale interference probe stage'
```

### Task 6: 实现预测链、P 点振动图和干涉线验证

**Files:**
- Modify: `16-波的叠加与干涉 双波源干涉图样-v2.html`
- Modify: `tests/double-source-wave-interference-v2.test.mjs`

**Interfaces:**
- Consumes: `deriveProbeState()`、`samplePointVibration()`、`state.prediction`、`state.resultRevealed`、`state.step`。
- Produces: `#predictionGroup`、`#pathDifferenceChain`、`#resultCard`、`#probeGraph`，以及只在典型极值点解锁的当前理论线。

- [ ] **Step 1: 写预测—图像—理论线的失败结构测试**

```js
test('prediction and probe graph have explicit reveal boundaries', () => {
  const html = readV2();
  assert.match(html, /id="predictionGroup"/);
  assert.match(html, /data-prediction="constructive"/);
  assert.match(html, /data-prediction="destructive"/);
  assert.match(html, /data-prediction="intermediate"/);
  assert.match(html, /id="pathDifferenceChain"/);
  assert.match(html, /id="resultCard"/);
  assert.match(html, /id="probeGraph"/);
  assert.match(html, /samplePointVibration/);
  assert.match(html, /function\s+renderPathDifferenceChain\s*\(/);
  assert.match(html, /function\s+drawProbeGraph\s*\(/);
  assert.match(html, /function\s+drawCurrentLocus\s*\(/);
});

test('the graph contract is two periods with a fixed minus-two-A to two-A axis', () => {
  const html = readV2();
  assert.match(html, /0\s*→\s*2T|0～2T/);
  assert.match(html, /-2A/);
  assert.match(html, /2A/);
  assert.match(html, /y₁\(t\)/);
  assert.match(html, /y₂\(t\)/);
  assert.match(html, /y\(t\)=y₁\+y₂/);
  assert.match(html, /Δφ/);
});
```

- [ ] **Step 2: 运行并确认预测、振动图和结果卡尚未完成**

Run: `/Users/luogaowei/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/double-source-wave-interference-v2.test.mjs`

Expected: FAIL，报告缺少 `renderPathDifferenceChain`、`drawProbeGraph` 或 `drawCurrentLocus`。

- [ ] **Step 3: 实现右侧分步判定链和振动图**

右侧显示链使用以下函数，不从 DOM 反向读取物理值：

```js
function format(value, digits) {
  return Number.isFinite(value) ? value.toFixed(digits) : '—';
}

function renderPathDifferenceChain() {
  document.getElementById('r1Value').textContent = `${format(derived.r1, 3)} m`;
  document.getElementById('r2Value').textContent = `${format(derived.r2, 3)} m`;
  document.getElementById('pathDifferenceValue').textContent = `${format(derived.pathDifference, 3)} m`;
  document.getElementById('ratioValue').textContent = `${format(derived.ratio, 3)} λ`;
  document.getElementById('predictionSummary').textContent = state.prediction
    ? `原预测：${kindLabel(state.prediction)}`
    : '先选择你的预测。';
  document.getElementById('resultSummary').textContent = state.resultRevealed
    ? `验证：${kindLabel(derived.exactKind)}；Δφ=${format(derived.phaseDifference / Math.PI, 3)}π；A合/2A=${format(derived.resultantAmplitude / 2, 3)}`
    : '结果将在验证后显示。';
}

function kindLabel(kind) {
  return ({ constructive: '加强', destructive: '减弱', intermediate: '非极值' })[kind];
}
```

`drawProbeGraph()` 调用 Task 5 的 `syncCanvas(probeGraph)`，在非自由模式且 `resultRevealed=false` 时清空画布并绘制“完成预测后解锁”；其他情况调用：

```js
const vibration = Physics.samplePointVibration({
  r1: derived.r1,
  r2: derived.r2,
  lambda: state.lambda,
  v: 1,
  A: 1,
  sampleCount: 129,
  cycles: 2
});

function drawSeries(ctx, points, valueKey, color, lineWidth, plot) {
  ctx.beginPath();
  points.forEach((point, index) => {
    const x = plot.left + point.tOverT / 2 * plot.width;
    const y = plot.top + (2 - point[valueKey]) / 4 * plot.height;
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
}

drawSeries(graphCtx, vibration.points, 'y1', readCssColor('--viz-circular'), 1.5, plot);
drawSeries(graphCtx, vibration.points, 'y2', readCssColor('--viz-transfer'), 1.5, plot);
drawSeries(graphCtx, vibration.points, 'y', readCssColor('--viz-required'), 2.5, plot);
```

`plot` 固定将 `t/T∈[0,2]` 映射到横轴，将 `y/A∈[-2,2]` 映射到纵轴。`drawCurrentLocus()` 只在 `state.resultRevealed && derived.exactKind !== 'intermediate'` 时根据当前精确 `c=Δr` 绘制理论线：`c=0` 画 `x=0` 中垂线；`0<c<d` 取 `a=c/2`、`b=sqrt((d/2)²-a²)`，在 `y∈[-3,3]` 按 `0.05 m` 步长绘制两支 `x=±a sqrt(1+(y/b)²)` 并用视域裁切。加强线用实线，减弱线用 `[6,5]` 虚线；非极值点或 `c≥d` 直接返回，不绘制曲线。

图像采样结果在 `probe`、`d`、`lambda` 或画布尺寸改变时更新；物理动画帧只移动时间指示线，不重新采样 129 个点。

典型加强/减弱点解锁后显示经过 P 点的对应理论线；非极值点明确显示“该点不在振幅极大线或极小线上”，不伪造第三类双曲线。

- [ ] **Step 4: 运行测试并验证三类典型点**

Run: `/Users/luogaowei/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/double-source-wave-interference-v2.test.mjs`

Expected: PASS，预测结构、图像契约和全部旧测试 0 failures。

浏览器验证：

- P=`(0.5,0)` 时 `Δr/λ=1`，两细线同相，紫线振幅 `2A`；
- P=`(0.25,0)` 时 `Δr/λ=0.5`，两细线反相，紫线为零；
- P=`(0.125,0)` 时 `Δr/λ=0.25`，标记为非极值，合振幅为 `√2 A`，不显示伪造的干涉线。

- [ ] **Step 5: 提交预测和振动验证链**

```bash
git add '16-波的叠加与干涉 双波源干涉图样-v2.html' tests/double-source-wave-interference-v2.test.mjs
git commit -m 'feat: link path difference to probe vibration graph'
```

### Task 7: 接通三种学习模式和分组过程控制

**Files:**
- Modify: `16-波的叠加与干涉 双波源干涉图样-v2.html`
- Modify: `tests/double-source-wave-interference-v2.test.mjs`

**Interfaces:**
- Consumes: `GUIDE_STEPS`、`createActionScheduler()`、`dispatch(action)` 和已实现的预测/验证 UI。
- Produces: `#purposeButton`、`[data-mode="demo"]`、`[data-mode="guide"]`、`[data-mode="explore"]`、`#previousStep`、`#nextStep`、`#playPause`、四个倍速按钮，以及可取消的自动演示。

- [ ] **Step 1: 写学习入口和物理/教学控制分组的失败测试**

```js
test('learning modes and process controls are explicit and separated', () => {
  const html = readV2();
  assert.match(html, /id="purposeButton"/);
  assert.match(html, /data-mode="demo"/);
  assert.match(html, /data-mode="guide"/);
  assert.match(html, /data-mode="explore"/);
  assert.match(html, /id="previousStep"/);
  assert.match(html, /id="nextStep"/);
  assert.match(html, /id="playPause"/);
  for (const speed of ['0.25', '0.5', '1', '2']) assert.match(html, new RegExp(`data-speed="${speed.replace('.', '\\.')}`));
  assert.match(html, /教学步骤/);
  assert.match(html, /物理播放/);
  assert.match(html, /function\s+runAutoDemo\s*\(/);
  assert.match(html, /function\s+runPurposePreview\s*\(/);
  assert.match(html, /id="purposeDialog"/);
  assert.match(html, /scheduler\.cancelAll\s*\(/);
  assert.match(html, /Teaching\.GUIDE_STEPS/);
  assert.match(html, /dataset\.speed/);
  assert.doesNotMatch(html, /单步退|单步进|±0\.1s/);
});
```

- [ ] **Step 2: 运行并确认学习入口或分组控制不完整而失败**

Run: `/Users/luogaowei/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/double-source-wave-interference-v2.test.mjs`

Expected: FAIL，报告缺少 `runAutoDemo`、`scheduler.cancelAll()` 或倍速事件接线。

- [ ] **Step 3: 使用同一步骤数组实现三种模式**

- 自动演示：用 P=`(0.5,0)` 从预测、波程、波程差、判据运行到振动验证；在振动图解锁处暂停教学脚本，不暂停用于表现稳态场的物理时间；用户点击模式、重置、上一步、下一步或拖动 P 时调用 `scheduler.cancelAll()`。
- 分步引导：每步显示任务、操作位置、操作方法、观察焦点和完成条件；未做预测不能进入结果解锁。
- 自由探索：保留 P 点、`d`、`λ` 和时间，立即显示数值和振动图；保留“继续引导”入口。

“学习目的与模型”说明同相、同频、等振幅、无衰减和稳态场假设，提供 5～10 秒无声点击—波程—振动图预览，不加入长公式堆叠。

在 `</main>` 后增加以下说明对话框：

```html
<dialog id="purposeDialog" aria-labelledby="purposeTitle">
  <h2 id="purposeTitle">学习目的与模型</h2>
  <p>研究问题：怎样用 P 点到两波源的波程差判断干涉状态？</p>
  <p>模型条件：两波源同相、同频、等振幅，忽略距离衰减和边界反射，观察已建立的稳态干涉场。</p>
  <p>你可以拖动 P 点、调整 d 和 λ，再用 Δr/λ 完成预测与验证。</p>
  <div class="dialog-actions">
    <button id="purposePreview" type="button">观看 7.2 秒无声预览</button>
    <button id="closePurpose" type="button">返回实验</button>
  </div>
</dialog>
```

自动演示和主要控件按以下边界接线：

```js
const scheduler = Teaching.createActionScheduler(window.setTimeout.bind(window), window.clearTimeout.bind(window));
let purposeSnapshot = null;

function cloneState(value) {
  return JSON.parse(JSON.stringify(value));
}

function restoreState(snapshot) {
  state = cloneState(snapshot);
  derived = Physics.deriveProbeState({
    probe: state.probe, d: state.d, lambda: state.lambda,
    v: 1, A: 1, t: state.time
  });
  renderDom();
  redraw();
}

function endPurposePreview(restore) {
  scheduler.cancelAll();
  const snapshot = purposeSnapshot;
  purposeSnapshot = null;
  if (restore && snapshot) restoreState(snapshot);
}

function runPurposePreview() {
  endPurposePreview(true);
  purposeSnapshot = cloneState(state);
  dispatch({ type: 'SET_MODE', mode: 'demo' });
  dispatch({ type: 'SELECT_PROBE', probe: { x: 0.5, y: 0 } });
  scheduler.schedule(() => dispatch({ type: 'SET_STEP', step: 1 }), 1400);
  scheduler.schedule(() => dispatch({ type: 'SET_STEP', step: 2 }), 2800);
  scheduler.schedule(() => dispatch({ type: 'SET_PREDICTION', prediction: 'constructive' }), 4200);
  scheduler.schedule(() => dispatch({ type: 'REVEAL_RESULT' }), 5600);
  scheduler.schedule(() => {
    restoreState(purposeSnapshot);
    purposeSnapshot = null;
  }, 7200);
}

function runAutoDemo() {
  scheduler.cancelAll();
  dispatch({ type: 'SET_MODE', mode: 'demo' });
  dispatch({ type: 'SELECT_PROBE', probe: { x: 0.5, y: 0 } });
  scheduler.schedule(() => dispatch({ type: 'SET_PREDICTION', prediction: 'constructive' }), 800);
  scheduler.schedule(() => dispatch({ type: 'SET_STEP', step: 1 }), 1600);
  scheduler.schedule(() => dispatch({ type: 'SET_STEP', step: 2 }), 2400);
  scheduler.schedule(() => dispatch({ type: 'SET_STEP', step: 3 }), 3200);
  scheduler.schedule(() => {
    dispatch({ type: 'REVEAL_RESULT' });
    dispatch({ type: 'SET_STEP', step: 4 });
  }, 4000);
}

document.querySelectorAll('[data-mode]').forEach((button) => {
  button.addEventListener('click', () => {
    endPurposePreview(true);
    if (button.dataset.mode === 'demo') runAutoDemo();
    else {
      scheduler.cancelAll();
      dispatch({ type: 'SET_MODE', mode: button.dataset.mode });
    }
  });
});

document.querySelectorAll('[data-speed]').forEach((button) => {
  button.addEventListener('click', () => dispatch({ type: 'SET_SPEED', speed: Number(button.dataset.speed) }));
});

document.getElementById('previousStep').addEventListener('click', () => {
  scheduler.cancelAll();
  dispatch({ type: 'SET_STEP', step: state.step - 1 });
});

document.getElementById('nextStep').addEventListener('click', () => {
  scheduler.cancelAll();
  dispatch({ type: 'SET_STEP', step: state.step + 1 });
});

document.getElementById('playPause').addEventListener('click', () => {
  dispatch({ type: 'SET_PLAYING', playing: !state.playing });
});

document.getElementById('purposeButton').addEventListener('click', () => {
  document.getElementById('purposeDialog').show();
});
document.getElementById('purposePreview').addEventListener('click', runPurposePreview);
document.getElementById('closePurpose').addEventListener('click', () => {
  endPurposePreview(true);
  document.getElementById('purposeDialog').close();
});
```

`renderDom()` 使用 `Teaching.GUIDE_STEPS[state.step]` 选取当前任务文案和完成条件，模式按钮、倍速按钮和播放按钮的 `aria-pressed`/文字均由当前状态单向渲染。

- [ ] **Step 4: 运行测试并验证模式接管和倍速独立性**

Run: `/Users/luogaowei/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/double-source-wave-interference-v2.test.mjs`

Expected: PASS，模式入口、底部分组和所有旧测试 0 failures。

浏览器验证：自动演示到振动图时解锁并停在对应教学步骤；切换自由探索不重置 P 点、`d`、`λ`；从 `1×` 改为 `2×` 后 `Δr/λ`、干涉线位置和 `A合` 不变。

- [ ] **Step 5: 提交学习模式和过程控制**

```bash
git add '16-波的叠加与干涉 双波源干涉图样-v2.html' tests/double-source-wave-interference-v2.test.mjs
git commit -m 'feat: add guided interference learning flow'
```

### Task 8: 完成可访问性、平板布局和最终验证

**Files:**
- Modify: `16-波的叠加与干涉 双波源干涉图样-v2.html`
- Modify: `tests/double-source-wave-interference-v2.test.mjs`

**Interfaces:**
- Consumes: 完整 v2 页面和全部 Node 测试。
- Produces: 无控制台错误、三个主要横屏尺寸通过、键盘/降低动效可用、原文件哈希不变的交付候选版。

- [ ] **Step 1: 补全静态可访问性和文字下限测试**

```js
test('interactive controls expose accessible names and panel semantics', () => {
  const html = readV2();
  assert.match(html, /role="tablist"/);
  assert.match(html, /role="tab"/);
  assert.match(html, /role="tabpanel"/);
  assert.match(html, /aria-controls="controlPanel"/);
  assert.match(html, /aria-controls="observePanel"/);
  assert.match(html, /aria-label="波源间距 d"/);
  assert.match(html, /aria-label="波长 λ"/);
  assert.match(html, /prefers-reduced-motion:\s*reduce/);
  assert.match(html, /function\s+handleTabKey\s*\(/);
  assert.match(html, /ArrowLeft/);
  assert.match(html, /ArrowRight/);
  assert.match(html, /matchMedia\(['"]\(prefers-reduced-motion:\s*reduce\)['"]\)/);
  assert.match(html, /visibilitychange/);
});

test('the final artifact remains offline, silent, and free of forbidden font sizes', () => {
  const html = readV2();
  assert.doesNotMatch(html, /https?:\/\//i);
  assert.doesNotMatch(html, /<audio|new Audio|speechSynthesis|AudioContext/i);
  assert.doesNotMatch(html, /font-size:\s*(?:8|9|10|10\.5|12\.5|13\.5|15|17|18|19|21)px/i);
  assert.doesNotMatch(html, /transform:\s*scale\s*\(/i);
});
```

- [ ] **Step 2: 运行并确认尚未补齐的 ARIA、键盘或降低动效边界会失败**

Run: `/Users/luogaowei/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/double-source-wave-interference-v2.test.mjs`

Expected: FAIL，错误指向缺少的 `handleTabKey`、降低动效运行时处理或 `visibilitychange` 处理。

- [ ] **Step 3: 实现键盘、降低动效和响应式状态保留**

- 参数/观察标签支持点击、Enter、Space、左右方向键、Home 和 End；
- 引导模式提供三个可聚焦典型点按钮，调用与 Canvas 点击相同的 `SELECT_PROBE` 动作；
- `prefers-reduced-motion:reduce` 时默认设置 `playing=false`，保留 P 点、参数、预测、图像和步骤交互；
- 从窄屏返回宽屏时左右面板重新同时显示，但 `state.panel` 、参数和教学状态不重置；
- 页面隐藏时停止请求新的位移场动画帧，恢复可见时从当前状态继续。

标签键盘和动画生命周期使用以下实现边界：

```js
const panelTabs = Array.from(document.querySelectorAll('#mobileTabs [role="tab"]'));

function activatePanel(tab) {
  const panel = tab.getAttribute('aria-controls') === 'controlPanel' ? 'conditions' : 'observe';
  panelTabs.forEach((item) => {
    const selected = item === tab;
    item.setAttribute('aria-selected', String(selected));
    item.tabIndex = selected ? 0 : -1;
  });
  dispatch({ type: 'SET_PANEL', panel });
}

function handleTabKey(event) {
  const current = panelTabs.indexOf(event.currentTarget);
  let next = current;
  if (event.key === 'ArrowRight') next = (current + 1) % panelTabs.length;
  else if (event.key === 'ArrowLeft') next = (current - 1 + panelTabs.length) % panelTabs.length;
  else if (event.key === 'Home') next = 0;
  else if (event.key === 'End') next = panelTabs.length - 1;
  else return;
  event.preventDefault();
  panelTabs[next].focus();
  activatePanel(panelTabs[next]);
}

panelTabs.forEach((tab) => {
  tab.addEventListener('click', () => activatePanel(tab));
  tab.addEventListener('keydown', handleTabKey);
});

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
if (reducedMotion.matches) dispatch({ type: 'SET_PLAYING', playing: false });

let animationFrame = 0;
let lastFrameTime = 0;
function tick(now) {
  animationFrame = 0;
  if (!lastFrameTime) lastFrameTime = now;
  const dt = Math.min((now - lastFrameTime) / 1000, 0.05);
  lastFrameTime = now;
  if (state.playing) {
    state = Teaching.reduceState(state, { type: 'ADVANCE_TIME', dt: dt * state.speed });
    derived = Physics.deriveProbeState({
      probe: state.probe, d: state.d, lambda: state.lambda,
      v: 1, A: 1, t: state.time
    });
    redraw();
  }
  if (!document.hidden) animationFrame = requestAnimationFrame(tick);
}
function startAnimationLoop() {
  if (!animationFrame) animationFrame = requestAnimationFrame(tick);
}
function stopAnimationLoop() {
  cancelAnimationFrame(animationFrame);
  animationFrame = 0;
}
document.addEventListener('visibilitychange', () => {
  if (document.hidden) stopAnimationLoop();
  else startAnimationLoop();
});
```

`tick(now)` 不调用整体 DOM 渲染；它只通过 `ADVANCE_TIME` 更新时间、重算当前派生值并调用 `redraw()`。

- [ ] **Step 4: 运行全部 Node 测试并确认原文件哈希不变**

Run:

```bash
/Users/luogaowei/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/double-source-wave-interference-v2.test.mjs
shasum -a 256 '/Users/luogaowei/Documents/网站全部动画/16-波的叠加与干涉   双波源干涉图样.html'
```

Expected: 全部测试 PASS、0 failures；原文件 SHA-256 仍为 `53fc7e73ab4dfc566aed3c2c895e46e9ad883cccc21b9ec2edc540e4ef2f40a6`。

- [ ] **Step 5: 通过本机服务器完成三个尺寸的浏览器验收**

Run:

```bash
python3 -m http.server 18765 --bind 127.0.0.1 --directory '/Users/luogaowei/Documents/代码保存仓库/动画制作'
```

使用 Codex in-app Browser 依次设置 1180×820、1024×768、960×540，每个尺寸都检查：

1. 标题品牌始终可见，字号分别符合 `20/16/14px` 规则；
2. 1180 和 1024 宽度为三栏，主舞台是最大区域；
3. 960×540 为左舞台+右标签/活动面板，标签切换不重置 P 点；
4. 页面无横向滚动，所有可见文字计算字号不低于 `11px`；
5. P 点可点击和拖动，预测后才解锁振动图，自由探索随 P 点更新；
6. 中垂线、典型加强点、典型减弱点和非极值点数据符合 Task 2 的数值基准；
7. 切换模式、倍速、参数和面板时控制台无 error；
8. 分别截取默认页面、加强点解锁和 960×540 短横屏图片用于视觉对比。

- [ ] **Step 6: 提交验收通过的原型**

```bash
git add '16-波的叠加与干涉 双波源干涉图样-v2.html' tests/double-source-wave-interference-v2.test.mjs
git commit -m 'test: verify double-source interference v2 prototype'
```
