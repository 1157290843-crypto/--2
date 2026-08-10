# 02A 打点计时器结构与原理 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 从现有综合页增量拆出一个只讲解两种打点计时器内部结构、打点原理与 `T = 1/f` 的独立三维 HTML。

**Architecture:** 交付物仍为零外部依赖的单 HTML，复用原页面的 Canvas 三维渲染、机型几何和三栏外壳。纯打点时序与教学状态分别放入 `data-principle-core` 和 `data-principle-teaching-core` 内嵌脚本，Node 内置测试从 HTML 中提取它们做纯逻辑校验，浏览器仅负责 DOM、Canvas 和触控协调。

**Tech Stack:** HTML5、CSS、Canvas 2D 三维投影、原生 JavaScript、Node.js `node:test`、Codex in-app Browser、本机 `127.0.0.1` 临时静态预览。

## Global Constraints

- 原始文件 `/Users/luogaowei/Documents/网站全部动画/第二次全量改版/02-打点计时器三维互动实验.html` 保持 SHA-256 `32a77ec92628599b924add2a3a8babc1571f45ec95c6efaff04b948e4b79d12d`，不得覆盖。
- 新文件名固定为 `02A-打点计时器结构与原理-v1.html`。
- 顶部标题组件的位置、布局、字体、字号层级、颜色和间距不改；仅将题名改为“打点计时器：结构与工作原理”。
- 左侧控制、中央主场景、右侧观察的三栏宏观布局不改。
- 现有暖白页面、深蓝主场景、蓝橙强调色和字体体系不改。
- 电磁式和电火花式三维内部结构、剖面、部件点击和立体质感为锁定核心质量。
- 本文件只有“结构如何形成周期点迹”一个主观察关系；不加入规范操作训练、速度、加速度、纸带定量计算或函数图像。
- 电源频率固定为 `50 Hz`，打点间隔为 `0.02 s`；学生不调节市电频率。
- 播放档为 `0.25×`、`0.5×`、`1×`、`2×`；倍速不改变物理打点时刻。
- 最终交付必须单文件、零外部依赖、离线运行、全程无声。
- 所有浏览器验证通过只监听 `127.0.0.1` 的临时静态服务器，不自动化 `file://`。
- 横屏验证尺寸为 `1180×820`、`1024×768`、`960×540`；三个尺寸都保持三栏。

---

### Task 1: 建立受保护的 02A 基线和测试入口

**Files:**
- Create: `02A-打点计时器结构与原理-v1.html`
- Create: `tests/ticker-timer-02a.test.mjs`

**Interfaces:**
- Consumes: 锁定 SHA-256 的原始综合 HTML。
- Produces: 尚未改变行为的 02A 基线，以及 `read02A()`、`loadInlineCore(attributeName)` 测试工具。

- [ ] **Step 1: 写入因 02A 尚不存在而失败的结构测试**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export const repoRoot = resolve(import.meta.dirname, '..');
export const sourcePath = '/Users/luogaowei/Documents/网站全部动画/第二次全量改版/02-打点计时器三维互动实验.html';
export const outputPath = resolve(repoRoot, '02A-打点计时器结构与原理-v1.html');

export function read02A() {
  return readFileSync(outputPath, 'utf8');
}

export function loadInlineCore(attributeName) {
  const pattern = new RegExp(`<script\\s+${attributeName}[^>]*>([\\s\\S]*?)<\\/script>`);
  const match = read02A().match(pattern);
  assert.ok(match, `missing <script ${attributeName}>`);
  return match[1];
}

test('the approved source remains hash locked', () => {
  const digest = createHash('sha256').update(readFileSync(sourcePath)).digest('hex');
  assert.equal(digest, '32a77ec92628599b924add2a3a8babc1571f45ec95c6efaff04b948e4b79d12d');
});

test('02A is offline, silent, and preserves the approved shell', () => {
  const html = read02A();
  assert.match(html, /class="topbar template-header"/);
  assert.match(html, /class="control-panel"/);
  assert.match(html, /class="stage"/);
  assert.match(html, /class="observe-panel"/);
  assert.doesNotMatch(html, /<script[^>]+src=/i);
  assert.doesNotMatch(html, /<link[^>]+href=/i);
  assert.doesNotMatch(html, /<audio|new Audio|speechSynthesis/i);
});
```

- [ ] **Step 2: 运行测试并确认因输出文件不存在而失败**

Run:

```bash
/Users/luogaowei/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/ticker-timer-02a.test.mjs
```

Expected: 源文件哈希测试 PASS，02A 结构测试因 `ENOENT` FAIL。

- [ ] **Step 3: 机械复制原始 HTML 为 02A 基线**

```bash
cp -- '/Users/luogaowei/Documents/网站全部动画/第二次全量改版/02-打点计时器三维互动实验.html' '02A-打点计时器结构与原理-v1.html'
shasum -a 256 '/Users/luogaowei/Documents/网站全部动画/第二次全量改版/02-打点计时器三维互动实验.html' '02A-打点计时器结构与原理-v1.html'
```

Expected: 两个文件均为锁定哈希。

- [ ] **Step 4: 运行基线测试并确认通过**

Run: `/Users/luogaowei/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/ticker-timer-02a.test.mjs`

Expected: 2 tests PASS，0 failures。

- [ ] **Step 5: 提交基线**

```bash
git add '02A-打点计时器结构与原理-v1.html' tests/ticker-timer-02a.test.mjs
git commit -m 'test: establish ticker timer 02A baseline'
```

### Task 2: 提取可测试的打点原理内核

**Files:**
- Modify: `02A-打点计时器结构与原理-v1.html:653-673`
- Modify: `02A-打点计时器结构与原理-v1.html:1217-1268`
- Modify: `tests/ticker-timer-02a.test.mjs`

**Interfaces:**
- Consumes: 机型 id `em | spark`、固定频率 `50 Hz`、观看时间段。
- Produces: `window.TimerPrincipleCore` 的 `MACHINES`、`intervalForFrequency(frequency)`、`dotTimesBetween(startTime, endTime, frequency)`、`advancePhase(phase, elapsedSeconds, frequency)`。

- [ ] **Step 1: 写打点时序和机型语义的失败测试**

```js
import vm from 'node:vm';

function loadPrincipleCore() {
  const window = {};
  vm.runInNewContext(loadInlineCore('data-principle-core'), { window, Math, Object, Array });
  return window.TimerPrincipleCore;
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
```

- [ ] **Step 2: 运行并确认缺少原理内核而失败**

Expected: FAIL，错误包含 `missing <script data-principle-core>`。

- [ ] **Step 3: 在主控制器之前实现原理内核**

```js
<script data-principle-core>
(function () {
  const MACHINES = Object.freeze({
    em: Object.freeze({ id: 'em', power: '4~6 V 交流', marking: '振针与复写纸', tapeDrag: '较大' }),
    spark: Object.freeze({ id: 'spark', power: '220 V 交流', marking: '脉冲放电与墨粉纸盘', tapeDrag: '较小' })
  });
  function intervalForFrequency(frequency) {
    if (!Number.isFinite(frequency) || frequency <= 0) throw new RangeError('frequency must be positive');
    return 1 / frequency;
  }
  function dotTimesBetween(startTime, endTime, frequency) {
    if (endTime < startTime) throw new RangeError('endTime must not precede startTime');
    const interval = intervalForFrequency(frequency);
    const firstIndex = Math.floor((startTime + 1e-12) / interval) + 1;
    const lastIndex = Math.floor((endTime + 1e-12) / interval);
    const times = [];
    for (let index = firstIndex; index <= lastIndex; index += 1) times.push(index * interval);
    return times;
  }
  function advancePhase(phase, elapsedSeconds, frequency) {
    return phase + elapsedSeconds * frequency;
  }
  window.TimerPrincipleCore = Object.freeze({ MACHINES, intervalForFrequency, dotTimesBetween, advancePhase });
})();
</script>
```

主控制器将频率锁定为 `50`，用 `dotTimesBetween(previousTime, nextTime, 50)` 驱动点迹，不再从滑块读频率。

- [ ] **Step 4: 运行测试并确认原理基准通过**

Expected: 所有原理测试 PASS，0 failures。

- [ ] **Step 5: 提交原理内核**

```bash
git add '02A-打点计时器结构与原理-v1.html' tests/ticker-timer-02a.test.mjs
git commit -m 'feat: add testable ticker timer principle core'
```

### Task 3: 将综合页收敛为结构与原理三栏界面

**Files:**
- Modify: `02A-打点计时器结构与原理-v1.html:319-477`
- Modify: `02A-打点计时器结构与原理-v1.html:1524-1549`
- Modify: `tests/ticker-timer-02a.test.mjs`

**Interfaces:**
- Consumes: `TimerPrincipleCore.MACHINES`、现有 `#cv` 三维场景、标题和三栏 CSS。
- Produces: `#machineSelect`、`#principleSteps`、`#powerToggle`、`#focusCard`、`#principleChain`，以及题名收敛后的单目标页面。

- [ ] **Step 1: 写界面范围的失败测试**

```js
test('02A keeps the approved title shell, colors, fonts, and three columns', () => {
  const html = read02A();
  assert.match(html, /<h1>打点计时器：结构与工作原理<\/h1>/);
  assert.match(html, /--surface-page:#f7f4ed/);
  assert.match(html, /--stage:#0b1424/);
  assert.match(html, /--action:#2557d6/);
  assert.match(html, /PingFang SC/);
  assert.match(html, /grid-template-columns:/);
});

test('02A contains only principle controls', () => {
  const html = read02A();
  for (const id of ['machineSelect', 'principleSteps', 'powerToggle', 'focusCard', 'principleChain']) {
    assert.match(html, new RegExp(`id="${id}"`));
  }
  for (const removedId of ['acc', 'v0', 'freq', 'everyFive', 'tapeCv']) {
    assert.doesNotMatch(html, new RegExp(`id="${removedId}"`));
  }
  assert.doesNotMatch(html, /纸带数据处理|小车运动参数|验证一下：常见错误操作/);
});
```

- [ ] **Step 2: 运行并确认旧综合界面使范围测试失败**

Expected: FAIL，旧标题、旧参数和旧纸带区仍存在。

- [ ] **Step 3: 保留外壳样式并替换三栏内容**

标题区保留 `.topbar.template-header > #headerBackSlot + .brand`、`.brand-mark`、`.eyebrow`、`h1` 的 DOM 顺序和全部 CSS。左栏只放机型、五步原理导航和通电；中栏保留 `#cv`、剖面、部件标注和底部播放组；右栏只放当前部件、当前作用和原理链。删除旧步骤操作、小车参数、错误演示、纸带计算和对照表的 DOM 与绑定。

底部倍速按钮精确使用：

```html
<button type="button" data-speed="0.25" aria-pressed="false">0.25×</button>
<button type="button" data-speed="0.5" aria-pressed="false">0.5×</button>
<button type="button" data-speed="1" class="active" aria-pressed="true">1×</button>
<button type="button" data-speed="2" aria-pressed="false">2×</button>
```

- [ ] **Step 4: 运行结构和原理测试**

Expected: 所有测试 PASS，页面不再出现纸带定量计算或小车参数。

- [ ] **Step 5: 提交界面收敛**

```bash
git add '02A-打点计时器结构与原理-v1.html' tests/ticker-timer-02a.test.mjs
git commit -m 'feat: focus 02A on timer structure and principle'
```

### Task 4: 建立正式剖面、视角预设和原理聚焦

**Files:**
- Modify: `02A-打点计时器结构与原理-v1.html:488-1088`
- Modify: `tests/ticker-timer-02a.test.mjs`

**Interfaces:**
- Consumes: 现有 `buildTimer()`、`PARTS`、`cam`、`S.cut`、`S.picked`。
- Produces: `CAMERA_PRESETS`、`applyCameraPreset(id)`、`setPrincipleFocus(partIds)`、`#standardView`、`#emSectionView`、`#sparkSectionView`、`#tapeAxisView`。

- [ ] **Step 1: 写视角和部件覆盖的失败测试**

```js
test('02A exposes four bounded teaching camera presets', () => {
  const html = read02A();
  for (const id of ['standardView', 'emSectionView', 'sparkSectionView', 'tapeAxisView']) {
    assert.match(html, new RegExp(`id="${id}"`));
  }
  assert.match(html, /const CAMERA_PRESETS = Object\.freeze/);
  assert.match(html, /pitchMin:/);
  assert.match(html, /pitchMax:/);
});

test('all required internal parts remain represented', () => {
  const html = read02A();
  for (const part of ['coil', 'magnet', 'reed', 'carbon', 'tape', 'hole', 'spark', 'disc', 'hv']) {
    assert.match(html, new RegExp(`${part}:\\{n:`));
  }
});
```

- [ ] **Step 2: 运行并确认新视角接口尚不存在**

Expected: FAIL，缺少四个视角控件和 `CAMERA_PRESETS`。

- [ ] **Step 3: 实现有限旋转、剖面视角和焦点弱化**

```js
const CAMERA_PRESETS = Object.freeze({
  standard: Object.freeze({ yaw: -0.58, pitch: -0.38, dist: 13.5, cut: false }),
  emSection: Object.freeze({ yaw: -0.18, pitch: -0.18, dist: 9.6, cut: true, machine: 'em' }),
  sparkSection: Object.freeze({ yaw: -0.12, pitch: -0.22, dist: 9.8, cut: true, machine: 'spark' }),
  tapeAxis: Object.freeze({ yaw: 0, pitch: -0.12, dist: 14.2, cut: false })
});
const CAMERA_LIMITS = Object.freeze({ pitchMin: -1.05, pitchMax: 0.25, yawSpan: Math.PI * 0.72 });
function applyCameraPreset(id) {
  const preset = CAMERA_PRESETS[id];
  if (!preset) return false;
  if (preset.machine) S.machine = preset.machine;
  cam.yaw = preset.yaw;
  cam.pitch = preset.pitch;
  cam.dist = preset.dist;
  S.cut = preset.cut;
  updateMachineCard();
  return true;
}
function setPrincipleFocus(partIds) {
  S.focusParts = new Set(partIds);
}
```

`litColor()` 保持当前材质与光照，对不在 `S.focusParts` 中的可拾取面片降低饱和度和 alpha，不删除几何。外壳剖面使用现有 `S.cut` 透明策略，不使用全屏零件爆炸。

- [ ] **Step 4: 运行测试并用浏览器检查四个视角**

Run tests，再通过 `127.0.0.1` 预览依次点击标准、电磁剖面、电火花剖面、沿纸带方向。

Expected: 结构测试 PASS；每个视角都能看清对应部件，标签不被画布边缘裁切。

- [ ] **Step 5: 提交视角和剖面聚焦**

```bash
git add '02A-打点计时器结构与原理-v1.html' tests/ticker-timer-02a.test.mjs
git commit -m 'feat: add focused section views to ticker timer 02A'
```

### Task 5: 加入五步原理脚本和三种学习模式

**Files:**
- Modify: `02A-打点计时器结构与原理-v1.html:319-477`
- Modify: `02A-打点计时器结构与原理-v1.html:1217-1606`
- Modify: `tests/ticker-timer-02a.test.mjs`

**Interfaces:**
- Consumes: `TimerPrincipleCore`、`applyCameraPreset(id)`、`setPrincipleFocus(partIds)`。
- Produces: `window.TimerPrincipleTeaching`、`PRINCIPLE_STEPS`、`createTeachingState(mode)`、`principleReducer(state, action)`、`#modeAuto`、`#modeGuided`、`#modeExplore`。

- [ ] **Step 1: 写五步脚本和步骤门控的失败测试**

```js
function loadTeachingCore() {
  const window = {};
  vm.runInNewContext(loadInlineCore('data-principle-teaching-core'), { window, Object, Array, Set });
  return window.TimerPrincipleTeaching;
}

test('02A has five focused principle steps', () => {
  const T = loadTeachingCore();
  assert.deepEqual(Array.from(T.PRINCIPLE_STEPS, step => step.id), [1, 2, 3, 4, 5]);
  for (const step of T.PRINCIPLE_STEPS) {
    assert.ok(step.task.length > 0);
    assert.ok(step.observe.length > 0);
    assert.ok(step.focusParts.length >= 1 && step.focusParts.length <= 2);
  }
});

test('guided mode cannot advance before the current observation is confirmed', () => {
  const T = loadTeachingCore();
  const start = T.createTeachingState('guided');
  assert.equal(T.principleReducer(start, { type: 'NEXT' }).step, 1);
  const observed = T.principleReducer(start, { type: 'CONFIRM_OBSERVATION' });
  assert.equal(T.principleReducer(observed, { type: 'NEXT' }).step, 2);
});
```

- [ ] **Step 2: 运行并确认教学内核缺失**

Expected: FAIL，错误包含 `missing <script data-principle-teaching-core>`。

- [ ] **Step 3: 实现教学脚本和模式共用状态**

```js
const PRINCIPLE_STEPS = Object.freeze([
  Object.freeze({ id: 1, task: '找到纸带通道和打点位置', observe: '纸带必须经过打点位置', machine: 'em', camera: 'standard', focusParts: ['tape', 'hole'] }),
  Object.freeze({ id: 2, task: '观察电磁式内部结构', observe: '电磁状态变化驱动振动部件', machine: 'em', camera: 'emSection', focusParts: ['coil', 'reed'] }),
  Object.freeze({ id: 3, task: '慢放一次振针打点', observe: '一次振针下压形成一个点', machine: 'em', camera: 'emSection', focusParts: ['reed', 'carbon'] }),
  Object.freeze({ id: 4, task: '观察电火花式放电', observe: '脉冲放电通过墨粉纸盘形成点迹', machine: 'spark', camera: 'sparkSection', focusParts: ['spark', 'disc'] }),
  Object.freeze({ id: 5, task: '比较两种打点方式', observe: '结构不同，50 Hz 时打点间隔均为 0.02 s', machine: 'both', camera: 'standard', focusParts: ['reed', 'spark'] })
]);
function createTeachingState(mode = 'guided') {
  return { mode, step: 1, observationConfirmed: false, completed: [], running: false };
}
function principleReducer(state, action) {
  if (action.type === 'CONFIRM_OBSERVATION') return { ...state, observationConfirmed: true };
  if (action.type === 'NEXT' && state.observationConfirmed && state.step < PRINCIPLE_STEPS.length) {
    return { ...state, step: state.step + 1, observationConfirmed: false, completed: [...state.completed, state.step] };
  }
  if (action.type === 'SET_MODE') return { ...state, mode: action.mode };
  if (action.type === 'RESET') return createTeachingState(state.mode);
  return state;
}
window.TimerPrincipleTeaching = Object.freeze({ PRINCIPLE_STEPS, createTeachingState, principleReducer });
```

自动演示只自动发送同样的 reducer action；分步引导等待学生确认观察；自由探索解锁所有机型、剖面和视角，但保留“继续引导”。

- [ ] **Step 4: 运行测试并在浏览器完成三种模式的烟雾测试**

Expected: Node 测试 PASS；自动演示能暂停并接管；分步模式不跳过当前观察；自由探索可返回引导。

- [ ] **Step 5: 提交教学模式**

```bash
git add '02A-打点计时器结构与原理-v1.html' tests/ticker-timer-02a.test.mjs
git commit -m 'feat: add guided principle workflow to ticker timer 02A'
```

### Task 6: 完成三栏响应式、可达性和最终验收

**Files:**
- Modify: `02A-打点计时器结构与原理-v1.html:1-317`
- Modify: `tests/ticker-timer-02a.test.mjs`

**Interfaces:**
- Consumes: 完成的 02A DOM、原理内核、教学脚本和四个视角。
- Produces: 在三个目标横屏尺寸下保持三栏、可触控、无报错的正式 02A。

- [ ] **Step 1: 补充响应式和无声边界的失败测试**

```js
test('02A locks three columns and exposes accessible primary controls', () => {
  const html = read02A();
  assert.match(html, /data-layout-lock="three-column"/);
  assert.match(html, /@media \(orientation:landscape\) and \(max-width:960px\)/);
  for (const label of ['标准视角', '播放', '暂停', '机型选择', '学习模式']) assert.match(html, new RegExp(`aria-label="[^"]*${label}`));
  assert.doesNotMatch(html, /<audio|new Audio|speechSynthesis|volume|muted/i);
});
```

- [ ] **Step 2: 运行并确认布局锁和 ARIA 尚不完整**

Expected: FAIL，缺少 `data-layout-lock` 或某个主控件的语义标签。

- [ ] **Step 3: 保留三栏并修复小横屏**

为 `#experimentLayout` 增加 `data-layout-lock="three-column"`。`960×540` 规则固定使用 `grid-template-columns:216px minmax(0,1fr) 216px`，两侧栏各自内部滚动，不将左右栏叠到同一网格。底部工具条使用紧凑间距，但主按钮触控高度不低于 44 px。不改动现有字体令牌。

- [ ] **Step 4: 运行全部自动化与浏览器验收**

Run:

```bash
/Users/luogaowei/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/ticker-timer-02a.test.mjs
python3 -m http.server 4173 --bind 127.0.0.1
```

Browser checks:

1. 在 `1180×820`、`1024×768`、`960×540` 分别打开 02A，确认三栏、标题区、工具条和主场景无叠压。
2. 切换两种机型和四个视角，确认内部结构、标签和剖面正确。
3. 在四个倍速档完成一次打点，确认间隔仍为 `0.02 s`。
4. 完成自动、分步和自由三种模式，确认一步只高亮一组原理关系。
5. 检查控制台无未处理错误，网络面板无外部资源请求。
6. 重新计算原始 HTML SHA-256，确认仍为锁定值。

Expected: Node 测试全部 PASS；所有浏览器检查通过。

- [ ] **Step 5: 提交 02A 正式验收版**

```bash
git add '02A-打点计时器结构与原理-v1.html' tests/ticker-timer-02a.test.mjs
git commit -m 'feat: finish ticker timer 02A structure lesson'
```
