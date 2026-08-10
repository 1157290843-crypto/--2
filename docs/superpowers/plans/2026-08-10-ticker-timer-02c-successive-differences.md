# 02C 纸带逐差法数据处理 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 从现有综合页增量拆出一个只使用理想化纸带、通过三组错位配对和平均值教会学生用逐差法求加速度的独立 HTML。

**Architecture:** 交付物是零外部依赖的单 HTML，保留原页面的顶部标题、三栏宏观布局、配色和字体，但中央场景改为固定比例纸带 Canvas。`data-successive-difference-core` 内嵌脚本负责唯一理想数据集、六段位移和三组逐差计算；`data-successive-difference-teaching-core` 管理分步配对和作答门控。页面不加载三维机型、小车、物理播放或随机数。

**Tech Stack:** HTML5、CSS、Canvas 2D、原生 JavaScript、Node.js `node:test`、Codex in-app Browser、本机 `127.0.0.1` 临时静态预览。

## Global Constraints

- 原始文件 `/Users/luogaowei/Documents/网站全部动画/第二次全量改版/02-打点计时器三维互动实验.html` 保持 SHA-256 `32a77ec92628599b924add2a3a8babc1571f45ec95c6efaff04b948e4b79d12d`，不得覆盖。
- 新文件名固定为 `02C-纸带数据处理-v1.html`。
- 顶部标题组件的位置、布局、字体、字号层级、颜色和间距不改；仅将题名改为“打点计时器：纸带数据处理”。
- 左侧控制、中央主场景、右侧观察的三栏布局、现有暖白/深蓝/蓝橙配色和字体体系不改。
- 本文件只有“用逐差法求理想化纸带的加速度”一个教学目标，不设辅助目标。
- 不加入机型切换、纸带阻力、随机数、测量误差、瞬时速度、2.5D 小车、时间游标、函数图像或回归拟合。
- 学生不调物理参数；固定 `f = 50 Hz`、`k = 5`、`T' = 0.10 s`、`v0 = 0.20 m/s`、`a = 2.00 m/s²`。
- 固定理想位移为 `s1..s6 = 3.0, 5.0, 7.0, 9.0, 11.0, 13.0 cm`。
- 三组配对固定为 `s1↔s4`、`s2↔s5`、`s3↔s6`，每组分母为 `3T'²`，结果均为 `2.00 m/s²`。
- 平均式和合并式均必须给出 `2.00 m/s²`，不用显示舍入值反向驱动物理数据。
- C 没有物理播放和倍速；底部只有教学上一步、下一步和重置。
- 最终交付必须单文件、零外部依赖、离线运行、全程无声。
- 所有浏览器验证通过只监听 `127.0.0.1` 的临时静态服务器，不自动化 `file://`。
- 横屏验证尺寸为 `1180×820`、`1024×768`、`960×540`；三个尺寸都保持三栏。

---

### Task 1: 建立 02C 基线和独立测试入口

**Files:**
- Create: `02C-纸带数据处理-v1.html`
- Create: `tests/ticker-timer-02c.test.mjs`

**Interfaces:**
- Consumes: 锁定原始 HTML。
- Produces: 02C 基线、`read02C()` 和 `loadInlineCore(attributeName)`。

- [ ] **Step 1: 写输出文件尚不存在的失败测试**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const repoRoot = resolve(import.meta.dirname, '..');
const sourcePath = '/Users/luogaowei/Documents/网站全部动画/第二次全量改版/02-打点计时器三维互动实验.html';
const outputPath = resolve(repoRoot, '02C-纸带数据处理-v1.html');
const read02C = () => readFileSync(outputPath, 'utf8');
function loadInlineCore(attributeName) {
  const match = read02C().match(new RegExp(`<script\\s+${attributeName}[^>]*>([\\s\\S]*?)<\\/script>`));
  assert.ok(match, `missing <script ${attributeName}>`);
  return match[1];
}

test('source is unchanged and 02C is an offline silent single file', () => {
  assert.equal(createHash('sha256').update(readFileSync(sourcePath)).digest('hex'), '32a77ec92628599b924add2a3a8babc1571f45ec95c6efaff04b948e4b79d12d');
  const html = read02C();
  assert.match(html, /class="topbar template-header"/);
  assert.match(html, /class="control-panel"/);
  assert.match(html, /class="stage"/);
  assert.match(html, /class="observe-panel"/);
  assert.doesNotMatch(html, /<script[^>]+src=|<link[^>]+href=|<audio|new Audio|speechSynthesis/i);
});
```

- [ ] **Step 2: 运行并确认因 `ENOENT` 失败**

Run: `/Users/luogaowei/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/ticker-timer-02c.test.mjs`

- [ ] **Step 3: 复制原始 HTML 并校验哈希**

```bash
cp -- '/Users/luogaowei/Documents/网站全部动画/第二次全量改版/02-打点计时器三维互动实验.html' '02C-纸带数据处理-v1.html'
shasum -a 256 '/Users/luogaowei/Documents/网站全部动画/第二次全量改版/02-打点计时器三维互动实验.html' '02C-纸带数据处理-v1.html'
```

- [ ] **Step 4: 运行基线测试并确认通过**

Expected: 1 test PASS，0 failures。

- [ ] **Step 5: 提交基线**

```bash
git add '02C-纸带数据处理-v1.html' tests/ticker-timer-02c.test.mjs
git commit -m 'test: establish ticker timer 02C baseline'
```

### Task 2: 实现纯理想逐差法计算内核

**Files:**
- Modify: `02C-纸带数据处理-v1.html:653-673`
- Modify: `tests/ticker-timer-02c.test.mjs`

**Interfaces:**
- Consumes: 固定 `CONFIG`。
- Produces: `window.SuccessiveDifferenceCore`、`CONFIG`、`generatePositions(config)`、`segmentDisplacements(positions)`、`analyzeSuccessiveDifferences(segments, interval)`、`PAIRINGS`。

- [ ] **Step 1: 写固定纸带、三组逐差和合并式的失败测试**

```js
import vm from 'node:vm';
function loadDifferenceCore() {
  const window = {};
  vm.runInNewContext(loadInlineCore('data-successive-difference-core'), { window, Object, Array, Math });
  return window.SuccessiveDifferenceCore;
}

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
```

- [ ] **Step 2: 运行并确认缺少逐差内核**

Expected: FAIL，错误包含 `missing <script data-successive-difference-core>`。

- [ ] **Step 3: 实现固定、无随机项的计算内核**

```js
<script data-successive-difference-core>
(function () {
  const CONFIG = Object.freeze({ frequency: 50, intervalCount: 5, interval: 0.1, initialVelocity: 0.2, acceleration: 2, pointCount: 7 });
  const PAIRINGS = Object.freeze([Object.freeze([0, 3]), Object.freeze([1, 4]), Object.freeze([2, 5])]);
  function generatePositions(config) {
    return Array.from({ length: config.pointCount }, (_, index) => {
      const time = index * config.interval;
      return config.initialVelocity * time + 0.5 * config.acceleration * time * time;
    });
  }
  function segmentDisplacements(positions) {
    return positions.slice(1).map((position, index) => position - positions[index]);
  }
  function analyzeSuccessiveDifferences(segments, interval) {
    if (segments.length !== 6) throw new RangeError('six segments are required');
    const denominator = 3 * interval * interval;
    const groupAccelerations = PAIRINGS.map(([left, right]) => (segments[right] - segments[left]) / denominator);
    const average = groupAccelerations.reduce((sum, value) => sum + value, 0) / groupAccelerations.length;
    const combined = ((segments[3] + segments[4] + segments[5]) - (segments[0] + segments[1] + segments[2])) / (9 * interval * interval);
    return { groupAccelerations, average, combined };
  }
  window.SuccessiveDifferenceCore = Object.freeze({ CONFIG, PAIRINGS, generatePositions, segmentDisplacements, analyzeSuccessiveDifferences });
})();
</script>
```

- [ ] **Step 4: 运行测试并确认全部数值基准通过**

Expected: 位移、三个分组、平均值和合并式测试全部 PASS。

- [ ] **Step 5: 提交逐差计算内核**

```bash
git add '02C-纸带数据处理-v1.html' tests/ticker-timer-02c.test.mjs
git commit -m 'feat: add ideal successive-difference calculation core'
```

### Task 3: 将三栏界面收敛为纸带逐差工作台

**Files:**
- Modify: `02C-纸带数据处理-v1.html:319-477`
- Modify: `02C-纸带数据处理-v1.html:488-1215`
- Modify: `tests/ticker-timer-02c.test.mjs`

**Interfaces:**
- Consumes: 现有顶部、三栏 CSS 和配色/字体令牌；`SuccessiveDifferenceCore`。
- Produces: `#fixedConditions`、`#differenceSteps`、`#tapeCanvas`、`#segmentValues`、`#currentPair`、`#formulaWorkbench`、`#groupResults`、`#combinedFormula`。

- [ ] **Step 1: 写单目标范围和三栏外壳的失败测试**

```js
test('02C preserves the approved shell and contains only successive-difference modules', () => {
  const html = read02C();
  assert.match(html, /<h1>打点计时器：纸带数据处理<\/h1>/);
  assert.match(html, /--surface-page:#f7f4ed/);
  assert.match(html, /--stage:#0b1424/);
  assert.match(html, /PingFang SC/);
  for (const id of ['fixedConditions', 'differenceSteps', 'tapeCanvas', 'segmentValues', 'currentPair', 'formulaWorkbench', 'groupResults', 'combinedFormula']) assert.match(html, new RegExp(`id="${id}"`));
  for (const removedId of ['machineSelect', 'acc', 'v0', 'freq', 'playPause', 'cutToggle']) assert.doesNotMatch(html, new RegExp(`id="${removedId}"`));
  assert.doesNotMatch(html, /function buildTimer|function buildCar|Math\.random|data-speed=/);
});
```

- [ ] **Step 2: 运行并确认旧三维、机型和播放模块使测试失败**

- [ ] **Step 3: 保留外壳视觉并替换三栏内容**

标题 DOM 顺序和所有字体、配色令牌保留。左栏放固定条件和七步学习流程；中栏的 `.stage` 外观保留，内部用 `#tapeCanvas` 绘制毫米刻度、A–G 七点和六段位移；右栏放当前配对、公式、输入和已完成结果。删除三维几何、相机、机型切换、物理播放、参数滑块、小车和原纸带速度/加速度表。

`#tapeCanvas` 按 CSS 宽度与最大 DPR 2 绘制；所有点位由 `generatePositions()` 派生，不在绘制代码中另外写一份数值。

- [ ] **Step 4: 运行结构和数值测试**

Expected: 测试 PASS；HTML 中无三维渲染入口、机型控件、随机数或倍速。

- [ ] **Step 5: 提交纸带工作台外壳**

```bash
git add '02C-纸带数据处理-v1.html' tests/ticker-timer-02c.test.mjs
git commit -m 'feat: focus 02C on the successive-difference workspace'
```

### Task 4: 实现七点选择和三组逐差作答门控

**Files:**
- Modify: `02C-纸带数据处理-v1.html:488-1215`
- Modify: `tests/ticker-timer-02c.test.mjs`

**Interfaces:**
- Consumes: `SuccessiveDifferenceCore.PAIRINGS` 和精确计算结果。
- Produces: `window.SuccessiveDifferenceTeaching`、`createDifferenceState()`、`differenceReducer(state, action)`、`DIFFERENCE_STEPS`。

- [ ] **Step 1: 写步骤完整性、配对顺序和错误作答的失败测试**

```js
function loadTeachingCore() {
  const window = {};
  vm.runInNewContext(loadInlineCore('data-successive-difference-teaching-core'), { window, Object, Array, Math });
  return window.SuccessiveDifferenceTeaching;
}

test('the teaching flow contains seven focused steps', () => {
  const T = loadTeachingCore();
  assert.deepEqual(Array.from(T.DIFFERENCE_STEPS, step => step.id), [1, 2, 3, 4, 5, 6, 7]);
  for (const step of T.DIFFERENCE_STEPS) assert.ok(step.observe.length > 0);
});

test('pairing answers must be completed in the approved order', () => {
  const T = loadTeachingCore();
  let s = T.createDifferenceState();
  s = T.differenceReducer(s, { type: 'CONFIRM_INTERVAL' });
  s = T.differenceReducer(s, { type: 'CONFIRM_SEGMENTS' });
  const blocked = T.differenceReducer(s, { type: 'SUBMIT_GROUP', index: 1, value: 2 });
  assert.equal(blocked.activePair, 0);
  const first = T.differenceReducer(s, { type: 'SUBMIT_GROUP', index: 0, value: 2 });
  assert.equal(first.activePair, 1);
  assert.equal(first.groupAnswers[0], 2);
});

test('only a correct average completes the method', () => {
  const T = loadTeachingCore();
  const ready = { ...T.createDifferenceState(), intervalConfirmed: true, segmentsConfirmed: true, activePair: 3, groupAnswers: [2, 2, 2] };
  assert.equal(T.differenceReducer(ready, { type: 'SUBMIT_AVERAGE', value: 1.9 }).completed, false);
  assert.equal(T.differenceReducer(ready, { type: 'SUBMIT_AVERAGE', value: 2 }).completed, true);
});
```

- [ ] **Step 2: 运行并确认教学内核缺失**

Expected: FAIL，错误包含 `missing <script data-successive-difference-teaching-core>`。

- [ ] **Step 3: 实现逐差学习 reducer**

```js
const DIFFERENCE_STEPS = Object.freeze([
  Object.freeze({ id: 1, observe: '确认 T′ = 5 / 50 = 0.10 s' }),
  Object.freeze({ id: 2, observe: '读取 A–G 七点间的六段位移' }),
  Object.freeze({ id: 3, observe: '配对 s₁ 与 s₄' }),
  Object.freeze({ id: 4, observe: '配对 s₂ 与 s₅' }),
  Object.freeze({ id: 5, observe: '配对 s₃ 与 s₆' }),
  Object.freeze({ id: 6, observe: '对 a₁、a₂、a₃ 取平均' }),
  Object.freeze({ id: 7, observe: '验证合并式与分组平均一致' })
]);
function createDifferenceState() {
  return { step: 1, intervalConfirmed: false, segmentsConfirmed: false, activePair: 0, groupAnswers: [null, null, null], averageAnswer: null, completed: false };
}
function isTwo(value) { return Number.isFinite(Number(value)) && Math.abs(Number(value) - 2) <= 0.005; }
function differenceReducer(state, action) {
  if (action.type === 'RESET') return createDifferenceState();
  if (action.type === 'CONFIRM_INTERVAL') return { ...state, intervalConfirmed: true, step: 2 };
  if (action.type === 'CONFIRM_SEGMENTS' && state.intervalConfirmed) return { ...state, segmentsConfirmed: true, step: 3 };
  if (action.type === 'SUBMIT_GROUP' && state.segmentsConfirmed && action.index === state.activePair && isTwo(action.value)) {
    const answers = state.groupAnswers.slice();
    answers[action.index] = Number(action.value);
    const nextPair = state.activePair + 1;
    return { ...state, groupAnswers: answers, activePair: nextPair, step: Math.min(6, 3 + nextPair) };
  }
  if (action.type === 'SUBMIT_AVERAGE' && state.activePair === 3 && isTwo(action.value)) return { ...state, averageAnswer: Number(action.value), completed: true, step: 7 };
  return state;
}
window.SuccessiveDifferenceTeaching = Object.freeze({ DIFFERENCE_STEPS, createDifferenceState, differenceReducer });
```

页面只高亮 `activePair` 对应的两段位移，其余位移降低饱和度；右栏只显示当前一组分子、固定分母 `3T'²` 和当前作答。

- [ ] **Step 4: 运行测试并在浏览器完成七步作答**

Expected: Node 测试 PASS；错序配对和错误数值不推进；正确答案逐步解锁下一组。

- [ ] **Step 5: 提交逐差作答状态机**

```bash
git add '02C-纸带数据处理-v1.html' tests/ticker-timer-02c.test.mjs
git commit -m 'feat: add guided successive-difference pairing workflow'
```

### Task 5: 完成公式联动、分步自动演示和无声反馈

**Files:**
- Modify: `02C-纸带数据处理-v1.html:1217-1606`
- Modify: `tests/ticker-timer-02c.test.mjs`

**Interfaces:**
- Consumes: `SuccessiveDifferenceCore`、`SuccessiveDifferenceTeaching`、`#tapeCanvas`。
- Produces: `renderTape(state)`、`renderFormula(state)`、`#modeAuto`、`#modeGuided`、`#modeExplore`、`#previousTeachingStep`、`#nextTeachingStep`、`#resetLesson`。

- [ ] **Step 1: 写学习模式、底部控制和范围约束测试**

```js
test('02C exposes teaching controls but no physics playback', () => {
  const html = read02C();
  for (const id of ['modeAuto', 'modeGuided', 'modeExplore', 'previousTeachingStep', 'nextTeachingStep', 'resetLesson']) assert.match(html, new RegExp(`id="${id}"`));
  assert.doesNotMatch(html, /data-speed=|id="playPause"|播放倍速|时间游标/);
});

test('02C contains no random or resistance model', () => {
  const html = read02C();
  assert.doesNotMatch(html, /Math\.random|f_tape|tapeDrag|纸带阻力|机型比较/);
});
```

- [ ] **Step 2: 运行并确认新学习控件尚不完整**

- [ ] **Step 3: 用同一 reducer 驱动三种学习模式**

分步模式等待学生确认时间间隔、位移和输入数值；自动演示依次派发同样的 reducer action，在每组配对后暂停并显示简短观察句；自由模式可点击任一位移查看数值，但逐差验证仍使用固定三组。`renderFormula()` 从内核结果读取数值，统一展示 `cm→m`、`3T'²`、分组结果、平均值和合并式。

- [ ] **Step 4: 运行测试并验证自动、分步和自由模式**

Expected: 三种模式不生成新数据；任何时候重置都恢复固定七点纸带和第一步。

- [ ] **Step 5: 提交公式联动和学习模式**

```bash
git add '02C-纸带数据处理-v1.html' tests/ticker-timer-02c.test.mjs
git commit -m 'feat: add focused learning modes to ticker timer 02C'
```

### Task 6: 完成三栏响应式、可达性和最终验收

**Files:**
- Modify: `02C-纸带数据处理-v1.html:1-317`
- Modify: `tests/ticker-timer-02c.test.mjs`

**Interfaces:**
- Consumes: 完成的理想纸带内核、教学 reducer 和三栏 DOM。
- Produces: `data-layout-lock="three-column"` 和在三个目标横屏尺寸下可操作的正式 02C。

- [ ] **Step 1: 写三栏布局锁、字体/配色保留和可达性测试**

```js
test('02C locks the approved three-column visual system', () => {
  const html = read02C();
  assert.match(html, /data-layout-lock="three-column"/);
  assert.match(html, /@media \(orientation:landscape\) and \(max-width:960px\)/);
  assert.match(html, /--surface-page:#f7f4ed/);
  assert.match(html, /--action:#2557d6/);
  assert.match(html, /--prograde:#e66d26/);
  assert.match(html, /PingFang SC/);
  assert.match(html, /aria-label="理想化匀加速纸带/);
});
```

- [ ] **Step 2: 运行并确认布局锁和纸带语义尚不完整**

- [ ] **Step 3: 保持三栏并修复小横屏**

为 `#experimentLayout` 增加 `data-layout-lock="three-column"`。`960×540` 使用 `grid-template-columns:216px minmax(0,1fr) 216px`，中栏 Canvas 不低于 480 px 可视宽度，两侧栏内部滚动。底部三个教学按钮触控高度不低于 44 px，不改动现有字体令牌。Canvas 使用额外文本表格为键盘和辅助技术提供 A–G 和 `s1`–`s6` 的等价信息。

- [ ] **Step 4: 运行全部自动化与浏览器验收**

Run:

```bash
/Users/luogaowei/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/ticker-timer-02c.test.mjs
python3 -m http.server 4173 --bind 127.0.0.1
```

Browser checks:

1. 在三个目标尺寸检查标题、三栏、纸带和底部教学控制无叠压。
2. 确认纸带固定显示 A–G、`3,5,7,9,11,13 cm` 和 `T' = 0.10 s`。
3. 依次完成三组配对，检查当前高亮、公式、单位和输入一致。
4. 确认 `a1 = a2 = a3 = 2.00 m/s²`，平均式和合并式均为 `2.00 m/s²`。
5. 重复重置和三种学习模式，确认数据永远不变，不出现机型、阻力、速度、小车、随机误差或图像模块。
6. 检查控制台无未处理错误、无外部资源请求，原始 HTML 哈希未变。

Expected: Node 测试全部 PASS，所有浏览器检查通过。

- [ ] **Step 5: 提交 02C 正式验收版**

```bash
git add '02C-纸带数据处理-v1.html' tests/ticker-timer-02c.test.mjs
git commit -m 'feat: finish ticker timer 02C successive-difference lesson'
```
