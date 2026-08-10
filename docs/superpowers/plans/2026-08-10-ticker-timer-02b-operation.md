# 02B 打点计时器规范操作 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 从现有综合页增量拆出一个让学生在三维场景中真正完成“固定—穿带—通电—放车—断电取带”并能根据纸带后果解释顺序的独立 HTML。

**Architecture:** 交付物是零外部依赖的单 HTML，复用原页面的三维实验台、点迹时序和三栏外壳。`data-operation-core` 内嵌脚本是唯一操作状态机和纸带后果生成器；Canvas 交互层只把场景热区和拖动转换为 reducer action，自动演示、分步引导和自由尝试不再拥有各自的定时状态。

**Tech Stack:** HTML5、CSS、Canvas 2D 三维投影、Pointer Events、原生 JavaScript、Node.js `node:test`、Codex in-app Browser、本机 `127.0.0.1` 临时静态预览。

## Global Constraints

- 原始文件 `/Users/luogaowei/Documents/网站全部动画/第二次全量改版/02-打点计时器三维互动实验.html` 保持 SHA-256 `32a77ec92628599b924add2a3a8babc1571f45ec95c6efaff04b948e4b79d12d`，不得覆盖。
- 新文件名固定为 `02B-打点计时器规范操作-v1.html`。
- 顶部标题组件的位置、布局、字体、字号层级、颜色和间距不改；仅将题名改为“打点计时器：规范实验操作”。
- 左侧控制、中央主场景、右侧观察的三栏布局、现有配色和字体体系不改。
- 本计划采用缩减方案：02B 只以电磁式打点计时器完成规范操作，不提供机型切换；电火花式的内部结构认知留在 02A。
- 核心是三维直接操作、步骤完成条件和两个顺序错误的纸带后果；不进入完整内部原理、纸带速度、加速度、逐差法或图像。
- 学生不调初速度、加速度或频率；默认 `f = 50 Hz`、`v0 = 0`、`a = 2.00 m/s²`。
- 步骤固定为五个：固定、穿带、通电、放车、断电取带。
- 必须保留的错误后果只有“先放车后通电”和“停车后未断电就取带”；其他错误只做当步即时校验。
- 自动演示、分步引导和自由尝试共用同一状态机，错误状态可恢复，不需要刷新页面。
- 播放档为 `0.25×`、`0.5×`、`1×`、`2×`；倍速不改变物理结果。
- 最终交付必须单文件、零外部依赖、离线运行、全程无声。
- 所有浏览器验证通过只监听 `127.0.0.1` 的临时静态服务器，不自动化 `file://`。
- 横屏验证尺寸为 `1180×820`、`1024×768`、`960×540`；三个尺寸都保持三栏。

---

### Task 1: 建立 02B 基线和独立测试入口

**Files:**
- Create: `02B-打点计时器规范操作-v1.html`
- Create: `tests/ticker-timer-02b.test.mjs`

**Interfaces:**
- Consumes: 锁定原始 HTML。
- Produces: 02B 基线、`read02B()` 和 `loadInlineCore(attributeName)`。

- [ ] **Step 1: 写输出文件尚不存在的失败测试**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

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
  assert.equal(createHash('sha256').update(readFileSync(sourcePath)).digest('hex'), '32a77ec92628599b924add2a3a8babc1571f45ec95c6efaff04b948e4b79d12d');
  const html = read02B();
  assert.match(html, /class="topbar template-header"/);
  assert.match(html, /class="control-panel"/);
  assert.match(html, /class="stage"/);
  assert.match(html, /class="observe-panel"/);
  assert.doesNotMatch(html, /<script[^>]+src=|<link[^>]+href=|<audio|new Audio|speechSynthesis/i);
});
```

- [ ] **Step 2: 运行并确认因 `ENOENT` 失败**

Run: `/Users/luogaowei/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/ticker-timer-02b.test.mjs`

- [ ] **Step 3: 复制原始 HTML 并校验哈希**

```bash
cp -- '/Users/luogaowei/Documents/网站全部动画/第二次全量改版/02-打点计时器三维互动实验.html' '02B-打点计时器规范操作-v1.html'
shasum -a 256 '/Users/luogaowei/Documents/网站全部动画/第二次全量改版/02-打点计时器三维互动实验.html' '02B-打点计时器规范操作-v1.html'
```

- [ ] **Step 4: 运行基线测试并确认通过**

Expected: 1 test PASS，0 failures。

- [ ] **Step 5: 提交基线**

```bash
git add '02B-打点计时器规范操作-v1.html' tests/ticker-timer-02b.test.mjs
git commit -m 'test: establish ticker timer 02B baseline'
```

### Task 2: 建立可恢复的五步操作状态机

**Files:**
- Modify: `02B-打点计时器规范操作-v1.html:653-673`
- Modify: `tests/ticker-timer-02b.test.mjs`

**Interfaces:**
- Consumes: reducer action `FIX_TIMER`、`THREAD_TAPE`、`POWER_ON`、`MARKING_STABLE`、`RELEASE_CAR`、`CAR_STOP`、`POWER_OFF`、`TAKE_TAPE`、`RECOVER_STEP`、`RESET`。
- Produces: `window.TimerOperationCore`、`createOperationState()`、`reduceOperation(state, action)`、`STEP_IDS`、`isStepComplete(state, stepId)`。

- [ ] **Step 1: 写正确流程、顺序错误和恢复的失败测试**

```js
import vm from 'node:vm';
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
```

- [ ] **Step 2: 运行并确认缺少 `data-operation-core`**

Expected: FAIL，错误包含 `missing <script data-operation-core>`。

- [ ] **Step 3: 实现唯一操作 reducer**

```js
const STEP_IDS = Object.freeze(['fix', 'thread', 'power', 'release', 'finish']);
function createOperationState() {
  return {
    phase: 'fix', fixed: false, threaded: false, powered: false, markingStable: false,
    running: false, carStopped: false, tapeRemoved: false, completed: false,
    lastError: null, errors: [], consequences: { missingStart: false, endOverprint: false }
  };
}
function reduceOperation(state, action) {
  if (action.type === 'RESET') return createOperationState();
  if (action.type === 'RECOVER_STEP') return { ...state, lastError: null, running: false, tapeRemoved: false };
  if (action.type === 'FIX_TIMER' && action.aligned) return { ...state, fixed: true, phase: 'thread' };
  if (action.type === 'THREAD_TAPE' && state.fixed && action.throughGuide && action.consumableReady) return { ...state, threaded: true, phase: 'power' };
  if (action.type === 'POWER_ON' && state.threaded) return { ...state, powered: true };
  if (action.type === 'MARKING_STABLE' && state.powered) return { ...state, markingStable: true, phase: 'release' };
  if (action.type === 'RELEASE_CAR' && (!state.powered || !state.markingStable)) {
    return { ...state, running: true, lastError: 'lateOn', errors: [...state.errors, 'lateOn'], consequences: { ...state.consequences, missingStart: true } };
  }
  if (action.type === 'RELEASE_CAR' && state.powered && state.markingStable) return { ...state, running: true, phase: 'release' };
  if (action.type === 'CAR_STOP' && state.running) return { ...state, running: false, carStopped: true, phase: 'finish' };
  if (action.type === 'POWER_OFF') return { ...state, powered: false };
  if (action.type === 'TAKE_TAPE' && state.powered) {
    return { ...state, tapeRemoved: true, lastError: 'lateOff', errors: [...state.errors, 'lateOff'], consequences: { ...state.consequences, endOverprint: true } };
  }
  if (action.type === 'TAKE_TAPE' && state.carStopped && !state.powered) return { ...state, tapeRemoved: true, completed: true };
  return state;
}
function isStepComplete(state, stepId) {
  return ({ fix: state.fixed, thread: state.threaded, power: state.markingStable, release: state.carStopped, finish: state.completed })[stepId] === true;
}
window.TimerOperationCore = Object.freeze({ STEP_IDS, createOperationState, reduceOperation, isStepComplete });
```

- [ ] **Step 4: 运行状态机测试并确认通过**

Expected: 所有 reducer 测试 PASS，0 failures。

- [ ] **Step 5: 提交操作内核**

```bash
git add '02B-打点计时器规范操作-v1.html' tests/ticker-timer-02b.test.mjs
git commit -m 'feat: add recoverable ticker timer operation state machine'
```

### Task 3: 收敛三栏界面并删除无关数据处理

**Files:**
- Modify: `02B-打点计时器规范操作-v1.html:319-477`
- Modify: `02B-打点计时器规范操作-v1.html:1524-1567`
- Modify: `tests/ticker-timer-02b.test.mjs`

**Interfaces:**
- Consumes: `TimerOperationCore.STEP_IDS`、现有三栏外壳和三维 `#cv`。
- Produces: `#operationSteps`、`#currentTask`、`#completionCondition`、`#operationReason`、`#consequenceTape`、`#recoverAction`。

- [ ] **Step 1: 写单目标界面的失败测试**

```js
test('02B preserves the approved shell and contains only operation modules', () => {
  const html = read02B();
  assert.match(html, /<h1>打点计时器：规范实验操作<\/h1>/);
  assert.match(html, /--surface-page:#f7f4ed/);
  assert.match(html, /--stage:#0b1424/);
  assert.match(html, /PingFang SC/);
  for (const id of ['operationSteps', 'currentTask', 'completionCondition', 'operationReason', 'consequenceTape', 'recoverAction']) assert.match(html, new RegExp(`id="${id}"`));
  for (const removedId of ['acc', 'v0', 'freq', 'everyFive', 'tV', 'tA']) assert.doesNotMatch(html, new RegExp(`id="${removedId}"`));
  assert.doesNotMatch(html, /两种计时器对比|纸带数据处理|逐差法/);
});
```

- [ ] **Step 2: 运行并确认旧参数和计算区使测试失败**

- [ ] **Step 3: 保留顶部、三栏、配色和字体，替换栏内内容**

左栏只放五步流程、当前任务、完成条件和学习模式；中栏保留三维实验台、当前可操作热区、标准视角和物理播放；右栏显示本步原因、即时反馈和纸带后果。删除参数滑块、实时速度/位移卡、定量纸带表和机型对照表。

倍速按钮改为 `0.25×`、`0.5×`、`1×`、`2×`，标准视角和重置保留。

- [ ] **Step 4: 运行测试并确认界面范围通过**

- [ ] **Step 5: 提交界面收敛**

```bash
git add '02B-打点计时器规范操作-v1.html' tests/ticker-timer-02b.test.mjs
git commit -m 'feat: focus 02B on hands-on experiment operation'
```

### Task 4: 将 Canvas 热区和纸带拖动接入状态机

**Files:**
- Modify: `02B-打点计时器规范操作-v1.html:1089-1215`
- Modify: `tests/ticker-timer-02b.test.mjs`

**Interfaces:**
- Consumes: `reduceOperation()` 和当前 `operationState`。
- Produces: `OPERATION_HOTSPOTS`、`availableSceneActions(state)`、`dispatchSceneAction(action)`、`#hotspotLayer`、`#gestureHint`。

- [ ] **Step 1: 写操作热区必须随步骤解锁的失败测试**

```js
test('scene actions are limited to the current operation step', () => {
  const O = loadOperationCore();
  assert.deepEqual(Array.from(O.availableSceneActions(O.createOperationState())), ['fixTimer']);
  const fixed = O.reduceOperation(O.createOperationState(), { type: 'FIX_TIMER', aligned: true });
  assert.deepEqual(Array.from(O.availableSceneActions(fixed)), ['threadTape']);
});

test('02B exposes accessible scene hotspots and gesture guidance', () => {
  const html = read02B();
  assert.match(html, /id="hotspotLayer"/);
  assert.match(html, /id="gestureHint"/);
  for (const action of ['fixTimer', 'threadTape', 'powerOn', 'releaseCar', 'powerOff', 'takeTape']) assert.match(html, new RegExp(`data-scene-action="${action}"`));
});
```

- [ ] **Step 2: 运行并确认热区接口缺失**

- [ ] **Step 3: 实现步骤限定的场景操作**

在 `TimerOperationCore` 中加入：

```js
function availableSceneActions(state) {
  if (state.phase === 'fix') return ['fixTimer'];
  if (state.phase === 'thread') return ['threadTape'];
  if (state.phase === 'power') return ['powerOn'];
  if (state.phase === 'release' && !state.running) return ['releaseCar'];
  if (state.phase === 'finish' && state.powered) return ['powerOff'];
  if (state.phase === 'finish' && !state.powered) return ['takeTape'];
  return [];
}

window.TimerOperationCore = Object.freeze({
  STEP_IDS,
  createOperationState,
  reduceOperation,
  isStepComplete,
  availableSceneActions
});
```

`#hotspotLayer` 使用绝对定位的真实 `<button>` 提供不小于 44 px 的可达触控区，并随当前相机投影更新到对应部件附近。穿带使用 Pointer Events：从纸带夹热区按下，沿标记通道拖至限位孔热区时派发 `THREAD_TAPE`；拖动期间暂停相机旋转，结束后恢复。

- [ ] **Step 4: 运行测试并在触控尺寸下完成五步操作**

Expected: Node 测试 PASS；同一手势不同时旋转相机和拖纸带；每一步只有当前可操作对象高亮。

- [ ] **Step 5: 提交直接操作层**

```bash
git add '02B-打点计时器规范操作-v1.html' tests/ticker-timer-02b.test.mjs
git commit -m 'feat: connect 3D operation hotspots to 02B workflow'
```

### Task 5: 实现两种顺序错误的确定性纸带后果

**Files:**
- Modify: `02B-打点计时器规范操作-v1.html:1217-1378`
- Modify: `tests/ticker-timer-02b.test.mjs`

**Interfaces:**
- Consumes: `operationState.consequences`、`f = 50`、`v0 = 0`、`a = 2`。
- Produces: `generateOperationTape(options)` 返回 `{ dots, missingStart, endOverprint }`，以及 `renderConsequenceTape(record)`。

- [ ] **Step 1: 写正常、起始缺失和末端重点的失败测试**

```js
test('operation tape outcomes are deterministic and physically ordered', () => {
  const O = loadOperationCore();
  const normal = O.generateOperationTape({ startDelay: 0, duration: 1.3, frequency: 50, acceleration: 2, endOverprint: false });
  const late = O.generateOperationTape({ startDelay: 0.42, duration: 1.3, frequency: 50, acceleration: 2, endOverprint: false });
  const overprint = O.generateOperationTape({ startDelay: 0, duration: 1.3, frequency: 50, acceleration: 2, endOverprint: true });
  assert.equal(normal.dots[0], 0);
  assert.ok(late.dots[0] > 0.17);
  assert.equal(late.missingStart, true);
  assert.equal(overprint.endOverprint, true);
  assert.equal(overprint.overprintPosition, overprint.dots.at(-1));
});
```

- [ ] **Step 2: 运行并确认纸带生成器尚不存在**

- [ ] **Step 3: 在操作内核实现确定性点迹生成**

```js
function generateOperationTape({ startDelay, duration, frequency, acceleration, endOverprint }) {
  const interval = 1 / frequency;
  const dots = [];
  for (let time = startDelay; time <= duration + 1e-12; time += interval) dots.push(0.5 * acceleration * time * time);
  return {
    dots,
    missingStart: startDelay > 0,
    endOverprint: Boolean(endOverprint),
    overprintPosition: endOverprint && dots.length ? dots[dots.length - 1] : null
  };
}

window.TimerOperationCore = Object.freeze({
  STEP_IDS,
  createOperationState,
  reduceOperation,
  isStepComplete,
  availableSceneActions,
  generateOperationTape
});
```

`renderConsequenceTape()` 使用固定比例，起始缺失用红色空白区和“未记录”标记，末端重点用单一深色扩展点和“原地重复打点”标记；不生成速度或加速度表。

- [ ] **Step 4: 运行测试并在浏览器分别触发两个错误**

Expected: 测试 PASS；两种后果能从画面直接辨认，“恢复本步”能回到正确操作热区。

- [ ] **Step 5: 提交错误后果模块**

```bash
git add '02B-打点计时器规范操作-v1.html' tests/ticker-timer-02b.test.mjs
git commit -m 'feat: show operation-order consequences on 02B tape'
```

### Task 6: 加入三种学习模式并完成三栏验收

**Files:**
- Modify: `02B-打点计时器规范操作-v1.html:1-317`
- Modify: `02B-打点计时器规范操作-v1.html:1379-1606`
- Modify: `tests/ticker-timer-02b.test.mjs`

**Interfaces:**
- Consumes: `TimerOperationCore`、场景热区和纸带后果。
- Produces: `#modeAuto`、`#modeGuided`、`#modeExplore`、`#continueGuide`、`data-layout-lock="three-column"` 和正式验收版。

- [ ] **Step 1: 写模式、布局锁和无声边界的失败测试**

```js
test('02B exposes three learning modes and a locked three-column layout', () => {
  const html = read02B();
  for (const id of ['modeAuto', 'modeGuided', 'modeExplore', 'continueGuide']) assert.match(html, new RegExp(`id="${id}"`));
  assert.match(html, /data-layout-lock="three-column"/);
  assert.match(html, /@media \(orientation:landscape\) and \(max-width:960px\)/);
  assert.doesNotMatch(html, /<audio|new Audio|speechSynthesis|volume|muted/i);
});
```

- [ ] **Step 2: 运行并确认模式控件和布局锁尚不完整**

- [ ] **Step 3: 实现模式协调和三栏小横屏规则**

自动演示逐个派发状态机 action，在通电和断电前自动暂停；分步引导不跳过 `isStepComplete()`；自由尝试允许触发顺序错误，但不标记为完成。为 `#experimentLayout` 添加 `data-layout-lock="three-column"`，`960×540` 使用 `216px minmax(0,1fr) 216px`，不叠放侧栏。

- [ ] **Step 4: 运行全部自动化与浏览器验收**

Run:

```bash
/Users/luogaowei/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/ticker-timer-02b.test.mjs
python3 -m http.server 4173 --bind 127.0.0.1
```

Browser checks:

1. 在三个目标尺寸检查标题、三栏、工具条和触控热区无叠压。
2. 不使用“下一步”跳过条件，用场景操作完成五步。
3. 分别触发 `lateOn` 和 `lateOff`，检查纸带后果和恢复路径。
4. 验证四个倍速下小车终点、点迹和错误后果一致。
5. 验证自动、分步、自由三种模式的状态一致性。
6. 检查控制台无未处理错误、无外部资源请求，原始 HTML 哈希未变。

Expected: Node 测试全部 PASS，所有浏览器检查通过。

- [ ] **Step 5: 提交 02B 正式验收版**

```bash
git add '02B-打点计时器规范操作-v1.html' tests/ticker-timer-02b.test.mjs
git commit -m 'feat: finish ticker timer 02B operation lesson'
```
