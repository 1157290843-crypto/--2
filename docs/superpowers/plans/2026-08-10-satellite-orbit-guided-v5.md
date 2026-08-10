# 卫星变轨交互实验 v5 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在完整保留 v4 的前提下，新增一个带“学习目的与模型”、十步学习引导、准确二次点火闭环、极端参数保护和正式 Canvas 视觉的 v5 单文件互动实验。

**Architecture:** v5 仍是零外部依赖的单 HTML 文件，继续以 `S = { r, v, t }` 为唯一物理事实源。为便于 TDD，把纯物理计算和纯教学状态分别放进同文件内带 `data-physics-core`、`data-teaching-core` 的脚本块；浏览器主控制器只负责 DOM、Canvas、计时器和两类状态的协调。Node 内置测试从 HTML 中提取这两个纯脚本块执行，不要求为正式交付增加外部模块。

**Tech Stack:** HTML5、CSS、Canvas 2D、原生 JavaScript、Node.js `node:test`、Codex in-app Browser、本机 `127.0.0.1` 临时静态预览。

## Global Constraints

- 原始文件 `/Users/luogaowei/Documents/网站全部动画/第二次全量改版/01-天体运动与卫星变轨模型-高级重构版-v4.html` 保持 SHA-256 `623311453e27e39531fe35abfd117187ba95157fa8fad6cdbaf7c22af1b3a5e6`，不得覆盖。
- 新增文件名固定为 `01-天体运动与卫星变轨模型-高级重构版-v5.html`。
- 顶部大标题及品牌视觉语言、现有三栏整体布局、页面配色体系、字体与字号体系不得擅自改变。
- 保留 2D 俯视轨道模型和核心物理状态 `S = { r, v, t }`；教学状态不得侵入 `S`。
- 最终交付必须是单文件、零外部依赖、离线运行、全程无声音。
- 正式学习流程固定为步骤 1 至步骤 10；步骤 0 只作为“学习目的与模型”说明入口，不计入十步。
- 每个教学步骤只有一个主要观察焦点；主场景默认最多同时突出两组核心物理信息。
- 椭圆转移过程中只有万有引力是实际受力；`mv²/r` 仅能在圆轨道或点火瞬间作为有适用条件的比较量。
- 圆化成功容差固定为 `|v_r| <= 1e-3 km/s` 且 `e <= 1e-3`。
- 模型同步轨道半径固定使用 `42164 km`，由起点和目标半径实时计算内部全精度脉冲；显示值可舍入，物理状态不得使用显示舍入值。
- 所有浏览器验证统一通过仅监听 `127.0.0.1` 的临时静态服务器；禁止直接自动化 `file://`。
- 自动化、模板、重置和学生接管必须共享可取消的动作代次；旧回调不得污染新状态。
- 自动演示只把升轨作为默认主线；降轨与理想化平面同步轨道模型留在自由探索中验证。

---

### Task 1: 建立受保护的 v5 基线与测试入口

**Files:**
- Create: `01-天体运动与卫星变轨模型-高级重构版-v5.html`
- Create: `tests/satellite-orbit-v5.test.mjs`

**Interfaces:**
- Consumes: v4 单文件和锁定的 SHA-256。
- Produces: 未改变运行行为的 v5 基线，以及后续任务共同使用的 HTML 读取与脚本提取测试工具。

- [ ] **Step 1: 写入会因 v5 尚不存在而失败的结构测试**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export const repoRoot = resolve(import.meta.dirname, '..');
export const v5Path = resolve(repoRoot, '01-天体运动与卫星变轨模型-高级重构版-v5.html');

export function readV5() {
  return readFileSync(v5Path, 'utf8');
}

export function loadInlineCore(attributeName) {
  const html = readV5();
  const pattern = new RegExp(`<script\\s+${attributeName}[^>]*>([\\s\\S]*?)<\\/script>`);
  const match = html.match(pattern);
  assert.ok(match, `missing <script ${attributeName}>`);
  return match[1];
}

test('v5 preserves the approved header and offline single-file boundary', () => {
  const html = readV5();
  assert.match(html, /老罗物理 · 探究实验/);
  assert.match(html, /卫星变轨｜从圆轨道到新圆轨道/);
  assert.doesNotMatch(html, /<script[^>]+src=/i);
  assert.doesNotMatch(html, /<link[^>]+href=/i);
  assert.doesNotMatch(html, /<audio|new Audio|speechSynthesis/i);
});
```

- [ ] **Step 2: 运行测试并确认因 v5 文件不存在而失败**

Run:

```bash
/Users/luogaowei/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/satellite-orbit-v5.test.mjs
```

Expected: FAIL，错误包含 `ENOENT` 和 v5 文件名。

- [ ] **Step 3: 从 v4 机械复制出 v5 基线，不编辑 v4**

Run:

```bash
cp -- '/Users/luogaowei/Documents/网站全部动画/第二次全量改版/01-天体运动与卫星变轨模型-高级重构版-v4.html' '01-天体运动与卫星变轨模型-高级重构版-v5.html'
shasum -a 256 '/Users/luogaowei/Documents/网站全部动画/第二次全量改版/01-天体运动与卫星变轨模型-高级重构版-v4.html' '01-天体运动与卫星变轨模型-高级重构版-v5.html'
```

Expected: 两个文件均为 `623311453e27e39531fe35abfd117187ba95157fa8fad6cdbaf7c22af1b3a5e6`。

- [ ] **Step 4: 运行结构测试并确认通过**

Run: `/Users/luogaowei/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/satellite-orbit-v5.test.mjs`

Expected: PASS，1 test，0 failures。

- [ ] **Step 5: 提交基线**

```bash
git add '01-天体运动与卫星变轨模型-高级重构版-v5.html' tests/satellite-orbit-v5.test.mjs
git commit -m 'test: establish satellite orbit v5 baseline'
```

### Task 2: 提取并验证纯物理核心

**Files:**
- Modify: `01-天体运动与卫星变轨模型-高级重构版-v5.html:751`
- Modify: `tests/satellite-orbit-v5.test.mjs`

**Interfaces:**
- Consumes: `S = { r, v, t }`，单位为 km、s。
- Produces: `window.SatellitePhysics`，包含 `GM`、`RE`、`circleParams`、`orbitalElements`、`hohmannTransfer`、`classifyOrbitForPropagation`、`planFrameIntegration`、`radialVelocity`、`locateApsisCrossing`、`createBurnPreview`、`applyTangentialImpulse`、`circularizationImpulseAt`、`verifyCircularOrbit`、`forcePresentationModel`。

- [ ] **Step 1: 为纯脚本执行器和关键物理值写失败测试**

在测试文件中加入：

```js
import vm from 'node:vm';

function loadPhysics() {
  const window = {};
  vm.runInNewContext(loadInlineCore('data-physics-core'), { window, Math, Object });
  return window.SatellitePhysics;
}

test('circle parameters at 42164 km are exact for this model', () => {
  const P = loadPhysics();
  const c = P.circleParams(42164);
  assert.ok(Math.abs(c.v - 3.074666284128) < 1e-12);
  assert.ok(Math.abs(c.w - 7.2921598618e-5) < 1e-15);
  assert.ok(Math.abs(c.T - 86163.570551) < 1e-6);
});

test('the synchronous preset derives both burns from the two radii', () => {
  const P = loadPhysics();
  const transfer = P.hohmannTransfer(6671, 42164);
  assert.ok(Math.abs(transfer.dv1 - 2.427769316495) < 1e-12);
  assert.ok(Math.abs(transfer.dv2 - 1.467566444832) < 1e-12);
  assert.ok(Math.abs(transfer.e - 0.726794307362) < 1e-12);
  assert.ok(Math.abs(transfer.timeToTargetApsis - 18985.969524) < 1e-6);
});

test('near-parabolic bound orbit is preview-only', () => {
  const P = loadPhysics();
  const state = { r: { x: 6671, y: 0 }, v: { x: 0, y: -10.931716886208 }, t: 0 };
  const el = P.orbitalElements(state);
  const classification = P.classifyOrbitForPropagation(el);
  assert.equal(classification.kind, 'nearEscape');
  assert.equal(classification.canPropagate, false);
  assert.ok(el.e > 0.999999 && el.e < 1);
  assert.ok(el.T > 2e13);
});

test('frame integration has a hard substep budget', () => {
  const P = loadPhysics();
  assert.deepEqual(
    JSON.parse(JSON.stringify(P.planFrameIntegration(10000, { maxSubstepSeconds: 2, maxSubsteps: 120 }))),
    { substeps: 120, h: 2, executedDt: 240, droppedDt: 9760, truncated: true }
  );
  const normal = P.planFrameIntegration(5, { maxSubstepSeconds: 2, maxSubsteps: 120 });
  assert.equal(normal.substeps, 3);
  assert.ok(Math.abs(normal.h - 5 / 3) < 1e-15);
  assert.equal(normal.executedDt, 5);
  assert.equal(normal.droppedDt, 0);
  assert.equal(normal.truncated, false);
});

test('gravity acceleration does not depend on circular-force comparison', () => {
  const P = loadPhysics();
  const slow = P.gravityAcceleration({ x: 10000, y: 0 });
  const fast = P.gravityAcceleration({ x: 10000, y: 0 });
  assert.deepEqual(slow, fast);
  assert.ok(Math.abs(slow.x + 0.003986004418) < 1e-15);
  assert.equal(slow.y, 0);
});
```

- [ ] **Step 2: 运行并确认缺少 `data-physics-core` 而失败**

Run: `/Users/luogaowei/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/satellite-orbit-v5.test.mjs`

Expected: FAIL，错误为 `missing <script data-physics-core>`。

- [ ] **Step 3: 在主脚本前加入物理核心并让旧控制器复用它**

物理核心使用以下常量和边界：

```js
const GM = 398600.4418;
const RE = 6371;
const LIMITS = Object.freeze({
  maxSubstepSeconds: 2,
  maxSubsteps: 120,
  maxTransferRadius: 200000,
  maxTransferPeriod: 30 * 86400
});
const CIRCULAR_TOLERANCE = Object.freeze({ radialVelocity: 1e-3, eccentricity: 1e-3 });
```

`planFrameIntegration()` 必须先算 `requestedSubsteps = ceil(requestedDt / maxSubstepSeconds)`，再用 `maxSubsteps` 截断；`executedDt = min(requestedDt, maxSubstepSeconds * maxSubsteps)`，`S.t` 后续只增加 `executedDt`。`hohmannTransfer()` 必须用两半径实时计算，不读取滑杆显示字符串。主控制器删除重复的 `GM/RE/circleParams/elements/accel` 实现并改用 `window.SatellitePhysics`。

- [ ] **Step 4: 运行测试并确认关键物理基准通过**

Run: `/Users/luogaowei/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/satellite-orbit-v5.test.mjs`

Expected: PASS，所有结构和物理测试 0 failures。

- [ ] **Step 5: 提交物理核心**

```bash
git add '01-天体运动与卫星变轨模型-高级重构版-v5.html' tests/satellite-orbit-v5.test.mjs
git commit -m 'fix: add bounded and testable satellite physics core'
```

### Task 3: 修复预览锁、定时竞态与传播预算

**Files:**
- Modify: `01-天体运动与卫星变轨模型-高级重构版-v5.html:781-1015`
- Modify: `01-天体运动与卫星变轨模型-高级重构版-v5.html:1322-1455`
- Modify: `tests/satellite-orbit-v5.test.mjs`

**Interfaces:**
- Consumes: `SatellitePhysics.createBurnPreview()`、`planFrameIntegration()`。
- Produces: `window.SatelliteTeachingCore.createActionScheduler()`、不可变 `previewSnapshot` 和统一的 `invalidatePreview(reason)`。

- [ ] **Step 1: 写预览和动作代次的失败测试**

```js
function loadTeachingCore() {
  const window = {};
  vm.runInNewContext(loadInlineCore('data-teaching-core'), { window, Object, Array, Set });
  return window.SatelliteTeachingCore;
}

test('preview is read-only and captures the ignition state', () => {
  const P = loadPhysics();
  const state = { r: { x: 6971, y: 0 }, v: { x: 0, y: -7.561733136873 }, t: 123 };
  const before = JSON.stringify(state);
  const preview = P.createBurnPreview(state, 1.6);
  assert.equal(JSON.stringify(state), before);
  assert.equal(JSON.stringify(preview.lockedState), JSON.stringify(state));
  assert.ok(Math.abs(preview.elements.rp - 6971) < 1e-6);
  assert.ok(Math.abs(preview.elements.ra - 19233.523639) < 1e-6);
  assert.ok(Math.abs(preview.elements.e - 0.467954457322) < 1e-12);
});

test('cancelled action generations cannot mutate newer state', () => {
  const T = loadTeachingCore();
  const callbacks = [];
  const scheduler = T.createActionScheduler((fn) => { callbacks.push(fn); return callbacks.length; }, () => {});
  let mutations = 0;
  scheduler.schedule(() => { mutations += 1; }, 400);
  scheduler.cancelAll();
  callbacks[0]();
  assert.equal(mutations, 0);
});

test('an invalid preview cannot execute a first burn', () => {
  const T = loadTeachingCore();
  const preview = { generation: 6, lockedState: { r: { x: 6971, y: 0 }, v: { x: 0, y: -7.56 }, t: 0 } };
  assert.equal(T.canExecutePreview(preview, 7), false);
  assert.equal(T.canExecutePreview(preview, 6), true);
});
```

- [ ] **Step 2: 运行并确认缺少教学核心而失败**

Expected: FAIL，错误为 `missing <script data-teaching-core>`。

- [ ] **Step 3: 实现可取消动作管理器和预览执行门控**

`createActionScheduler()` 固定接口：

```js
function createActionScheduler(setTimer = setTimeout, clearTimer = clearTimeout) {
  let generation = 0;
  const handles = new Set();
  function cancelAll() {
    generation += 1;
    handles.forEach(clearTimer);
    handles.clear();
    return generation;
  }
  function schedule(action, delayMs) {
    const ownGeneration = generation;
    const handle = setTimer(() => {
      handles.delete(handle);
      if (ownGeneration === generation) action();
    }, delayMs);
    handles.add(handle);
    return handle;
  }
  return { schedule, cancelAll, generation: () => generation };
}
```

主控制器规则：

- `buildPreview()` 保存冻结的 `lockedState`、`candidateState`、轨道根数和动作代次，并暂停；
- 恢复播放、重置、修改 `r0/dv/方向`、切换模板都调用 `invalidatePreview()`；
- `executeBurn` 仅把 `previewSnapshot.candidateState.v` 应用到当前位置完全匹配的真实 `S`；失效预览为 no-op；
- 三个模板和 URL demo 全部改用动作管理器；
- `stepSim()` 每个动画帧最多 120 个 2 秒子步，截断时只增加 `executedDt`；
- `event.repeat` 为真时忽略 Canvas 的 Space、Enter、P。

- [ ] **Step 4: 运行测试并检查 v4 未改变**

Run:

```bash
/Users/luogaowei/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/satellite-orbit-v5.test.mjs
shasum -a 256 '/Users/luogaowei/Documents/网站全部动画/第二次全量改版/01-天体运动与卫星变轨模型-高级重构版-v4.html'
```

Expected: 测试全部 PASS；v4 哈希仍为锁定值。

- [ ] **Step 5: 提交交互安全修复**

```bash
git add '01-天体运动与卫星变轨模型-高级重构版-v5.html' tests/satellite-orbit-v5.test.mjs
git commit -m 'fix: lock previews and cancel stale animation actions'
```

### Task 4: 加入说明卡与十步教学状态机

**Files:**
- Modify: `01-天体运动与卫星变轨模型-高级重构版-v5.html:596-748`
- Modify: `01-天体运动与卫星变轨模型-高级重构版-v5.html:781-849`
- Modify: `tests/satellite-orbit-v5.test.mjs`

**Interfaces:**
- Consumes: 现有左侧参数控件、中央 Canvas、右侧观察面板和 `SatelliteTeachingCore`。
- Produces: `GUIDE_STEPS`、`createTeachingState()`、`guideReducer()`、`#learningOverlay`、`#openLearningPurpose`、`#guideCard`。

- [ ] **Step 1: 写十步完整性和推进门控失败测试**

```js
test('the guide has exactly ten focused learning steps', () => {
  const T = loadTeachingCore();
  assert.deepEqual(Array.from(T.GUIDE_STEPS, step => step.id), [1,2,3,4,5,6,7,8,9,10]);
  for (const step of T.GUIDE_STEPS) {
    assert.ok(step.title.length > 0);
    assert.ok(step.task.length > 0);
    assert.ok(step.why.length > 0);
    assert.ok(step.observe.length > 0);
    assert.ok(step.completion.length > 0);
    assert.ok(step.focus.length >= 1 && step.focus.length <= 2);
  }
});

test('an incomplete guided step cannot advance', () => {
  const T = loadTeachingCore();
  const start = T.createTeachingState('guided');
  const blocked = T.guideReducer({ ...start, step: 1 }, { type: 'NEXT' });
  assert.equal(blocked.step, 1);
  const predicted = T.guideReducer(blocked, { type: 'PREDICT', value: 'pro-rise' });
  assert.equal(predicted.completed[1], true);
  assert.equal(T.guideReducer(predicted, { type: 'NEXT' }).step, 2);
});

test('switching to free exploration preserves prediction and completed progress', () => {
  const T = loadTeachingCore();
  const guided = T.guideReducer(T.createTeachingState('guided'), { type: 'PREDICT', value: 'pro-rise' });
  const free = T.guideReducer(guided, { type: 'SET_MODE', mode: 'free' });
  assert.equal(free.prediction, 'pro-rise');
  assert.equal(free.completed[1], true);
  assert.equal(free.mode, 'free');
});

test('pausing or taking over the auto demo preserves its current guide step', () => {
  const T = loadTeachingCore();
  const running = T.guideReducer(T.createTeachingState('guided'), { type: 'AUTO_DEMO_START' });
  const atStepThree = { ...running, step: 3, autoDemo: { active: true, paused: false, cursor: 3 } };
  const paused = T.guideReducer(atStepThree, { type: 'AUTO_DEMO_PAUSE' });
  assert.equal(paused.step, 3);
  assert.equal(paused.autoDemo.paused, true);
  const takeover = T.guideReducer(paused, { type: 'AUTO_DEMO_TAKEOVER' });
  assert.equal(takeover.step, 3);
  assert.equal(takeover.autoDemo.active, false);
});
```

- [ ] **Step 2: 运行并确认步骤数据和 reducer 尚不存在**

Expected: FAIL，错误指出 `GUIDE_STEPS` 或 `createTeachingState` 未定义。

- [ ] **Step 3: 添加步骤 0 说明卡和十步数据**

说明卡固定文案：

- 核心问题：`切向加速或减速后，卫星的轨道为什么会改变？`
- 研究对象：`一颗绕地球运动的卫星。`
- 理想化条件：`只考虑地球引力、平面运动和瞬时切向点火；忽略空气阻力、地球非球形和其他天体。`
- 你将操作：`初始圆轨道半径、点火方向和速度增量 Δv。`
- 学完能够：`识别转移椭圆、远近地点，并完成第二次圆化点火。`
- 按钮：`开始分步引导`、`直接自由探索`。

十步标题固定为：`作出预测`、`设置初始圆轨道`、`设计第一次点火`、`预览目标轨道`、`执行第一次点火`、`观察转移过程`、`判断第二次点火`、`完成圆化`、`对比并形成结论`、`验证一下`。每步数据必须包含 `task/why/observe/completion/focus`；`focus` 只能从 `orbit/speed/force/comparison` 中选 1–2 个。

DOM 插入点固定：

- `#learningOverlay` 放在 `#stage` 内、`#centerMsg` 后；
- `#openLearningPurpose` 放在左侧 `.workflow` 后；
- `#guideCard` 作为 `#observePanel` 第一个子节点；
- 顶部 `<header>` 不修改；中央工具栏不加入教学“下一步”。

说明卡使用 `role="dialog" aria-modal="true" aria-labelledby="learningOverlayTitle"`；打开后暂停并保存原播放状态，把焦点限制在说明卡内并使背景控件 inert；关闭后按选择进入 guided/free，解除 inert；Esc 等价进入自由探索并把焦点还给触发按钮。

说明卡打开后的约 6 秒无声预览必须复用动作管理器：依次高亮 `r0`、点火方向/`dv`、`previewBurn`，然后只调用只读预览生成路径展示白色虚线；结束时清除预览并恢复说明卡初始状态。关闭说明卡、切入自由探索或学生主动操作都会取消这组延迟动作；预览期间不得调用第一次或第二次点火，也不得展示最终结论。

- [ ] **Step 4: 连接现有控件与步骤完成条件**

完成条件映射固定为：预测选择；合法初始圆轨道；方向和 `dv` 确认；可传播椭圆预览；第一次点火成功；到达目标拱点；正确判断第二次方向；真实状态通过圆化容差；查看前后对比；正确作答或跳过验证。

引导模式下隐藏一键模板和自动圆化 checkbox；自由探索中保留。退出和继续引导只改变教学状态，不重置 `S`。右侧卡固定显示“步骤 x / 10、任务、为什么、重点观察、完成条件、上一步、下一步、提示一下、帮我完成、退出引导”。现有三段 workflow 改为“预测与设置 / 执行与观察 / 圆化与结论”，步骤 9 完成后第三段进入 done。

自动演示复用同一套物理动作和十步完成事件，不另建一套结论。教学状态中固定保存 `autoDemo = { active, paused, cursor }`；提供 `startAutoDemo()`、`pauseAutoDemo()`、`resumeAutoDemo()`、`exitAutoDemo()`、`takeOverAutoDemo()`。暂停时取消当前代次并保留 cursor；继续时从 cursor 重新调度；退出或学生操作时取消动作且不重置 `S`。自由探索中的“低轨→高轨”入口改为默认升轨自动演示；降轨和同步只作为自由探索预设。

- [ ] **Step 5: 运行测试并提交引导骨架**

Run: `/Users/luogaowei/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/satellite-orbit-v5.test.mjs`

Expected: 全部 PASS。

```bash
git add '01-天体运动与卫星变轨模型-高级重构版-v5.html' tests/satellite-orbit-v5.test.mjs
git commit -m 'feat: add satellite orbit guided learning flow'
```

### Task 5: 在准确拱点暂停并完成手动二次圆化

**Files:**
- Modify: `01-天体运动与卫星变轨模型-高级重构版-v5.html:919-1005`
- Modify: `01-天体运动与卫星变轨模型-高级重构版-v5.html:1227-1305`
- Modify: `tests/satellite-orbit-v5.test.mjs`

**Interfaces:**
- Consumes: `locateApsisCrossing()`、`circularizationImpulseAt()`、`verifyCircularOrbit()` 和步骤 6–10。
- Produces: `onGuidedApsis()`、`answerSecondBurn()`、`circularizeAtCurrentApsis()`，以及由真实 `S` 生成的对比和验证结果。

- [ ] **Step 1: 写准确拱点和圆化验证失败测试**

```js
test('apoapsis is located inside the crossing substep', () => {
  const P = loadPhysics();
  const before = { r: { x: 10000, y: 0 }, v: { x: 0.02, y: 6 }, t: 10 };
  const after = { r: { x: 10001, y: 0 }, v: { x: -0.01, y: 6 }, t: 12 };
  const hit = P.locateApsisCrossing(before, after, 'apo');
  assert.equal(hit.kind, 'apo');
  assert.ok(Math.abs(hit.fraction - 2 / 3) < 1e-12);
  assert.ok(Math.abs(hit.stateAtApsis.t - 11.333333333333) < 1e-9);
  assert.ok(Math.abs(hit.stateAtApsis.r.x - 10000.666666667) < 1e-9);
  assert.ok(Math.abs(P.radialVelocity(hit.stateAtApsis)) < 1e-12);
  assert.equal(P.locateApsisCrossing(before, after, 'peri'), null);
});

test('a correct second burn circularizes the actual state', () => {
  const P = loadPhysics();
  const state = { r: { x: -42164, y: 0 }, v: { x: 0, y: 1.607099839295 }, t: 18985.969524 };
  const result = P.circularizationImpulseAt(state);
  assert.ok(Math.abs(result.signedDv - 1.467566444832) < 1e-12);
  assert.ok(Math.abs(Math.hypot(result.nextState.v.x, result.nextState.v.y) - 3.074666284128) < 1e-12);
  assert.equal(P.verifyCircularOrbit(result.nextState), true);
});

test('a partial second burn cannot claim circularization', () => {
  const P = loadPhysics();
  const start = { r: { x: -42164, y: 0 }, v: { x: 0, y: 1.607099839295 }, t: 18985.969524 };
  const partial = P.applyTangentialImpulse(start, 0.9 * 1.467566444832);
  const el = P.orbitalElements(partial);
  assert.ok(Math.abs(Math.hypot(partial.v.x, partial.v.y) - 2.927909639644) < 1e-12);
  assert.ok(Math.abs(el.e - 0.093183595590) < 1e-12);
  assert.equal(P.verifyCircularOrbit(partial), false);
});
```

- [ ] **Step 2: 运行并确认拱点函数或精确结果尚未满足**

Expected: FAIL，原因是 `locateApsisCrossing`/`circularizationImpulseAt` 缺失或结果不符。

- [ ] **Step 3: 把拱点检测移入每个 Verlet 子步**

每个子步保存 `before` 和 `after`；只有升轨的 `apo` 或降轨的 `peri` 才调用 `locateApsisCrossing()`。命中后立即把 `S` 设为 `stateAtApsis`、`setPlayback(false)`、保持 `phase='transfer'`、设置 `awaitingSecondBurn=true`，然后进入步骤 7；在学生确认前不得改变速度。

转移进度进入目标拱点前最后 8% 时，把物理有效倍速临时限制为 0.25×，但保留学生原先选择的倍速；命中拱点后暂停，重置或离开转移阶段后解除临时限制。该慢放只影响物理时间推进，不推进教学步骤。

步骤 7 错答只显示“再看此处的当地圆轨道速度，再试一次。”；“提示一下”只显示“比较当前速度与当地圆轨道速度：不足就加速，过大就减速。”；只有“帮我完成”代填正确方向并标记 `usedAssist=true`。

- [ ] **Step 4: 用真实状态执行并验证第二次点火**

`circularizeAtCurrentApsis()` 必须用当前 `S` 计算切向圆轨道速度，施加全精度脉冲，再从更新后的 `S` 计算 `v_r/e`。只有同时满足全局容差才把 `phase` 改为 `circle`、推入 `circles`、显示“圆化成功”、填充步骤 9 对比卡；失败则保持未完成并给出重置入口。

步骤 9 回显步骤 1 预测和真实的 `r/v/T`；步骤 10 默认折叠，题目固定为“卫星在转移椭圆的远地点，要圆化到更高圆轨道，应顺行加速还是逆行减速？”，正确答案为“顺行加速”，并提供“跳过验证”。

- [ ] **Step 5: 运行测试并提交二次点火闭环**

Run: `/Users/luogaowei/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/satellite-orbit-v5.test.mjs`

Expected: 全部 PASS。

```bash
git add '01-天体运动与卫星变轨模型-高级重构版-v5.html' tests/satellite-orbit-v5.test.mjs
git commit -m 'fix: pause at apsis and verify manual circularization'
```

### Task 6: 升级观察语义、Canvas 正式感和触控可达性

**Files:**
- Modify: `01-天体运动与卫星变轨模型-高级重构版-v5.html:7-577`
- Modify: `01-天体运动与卫星变轨模型-高级重构版-v5.html:1047-1224`
- Modify: `01-天体运动与卫星变轨模型-高级重构版-v5.html:1458-1534`
- Modify: `tests/satellite-orbit-v5.test.mjs`

**Interfaces:**
- Consumes: 当前教学步骤、`forcePresentationModel()`、现有视觉 token。
- Produces: 步骤驱动观察焦点、正式 2.5D 地球/可识别卫星、动态图例、安全标签、44×44 触控层和完整键盘/弹层语义。

- [ ] **Step 1: 写受力语义与关键无障碍结构失败测试**

```js
test('transfer presentation exposes gravity as the only real force', () => {
  const P = loadPhysics();
  const model = P.forcePresentationModel({
    phase: 'transfer',
    isBurnInstant: false,
    state: { r: { x: 10000, y: 0 }, v: { x: 0, y: 6 }, t: 0 },
    mass: 1000
  });
  assert.deepEqual(Array.from(model.realForces, force => force.id), ['gravity']);
  assert.deepEqual(Array.from(model.comparisons), []);
});

test('the learning dialog and guide controls have stable accessible hooks', () => {
  const html = readV5();
  assert.match(html, /id="learningOverlay"[^>]+role="dialog"[^>]+aria-modal="true"/);
  assert.match(html, /id="openLearningPurpose"[^>]+aria-controls="learningOverlay"/);
  assert.match(html, /id="guideCard"/);
  assert.match(html, /:focus-visible/);
  assert.doesNotMatch(html, /📖|💡|💥|🚀/);
});
```

- [ ] **Step 2: 运行并确认转移受力或无障碍结构测试失败**

Expected: FAIL；v4 基线仍持续展示 `F需`、比值或 emoji，且缺少完整 dialog 控制关系。

- [ ] **Step 3: 实现步骤驱动的视觉焦点和受力表达**

默认观察不再是“全部”：步骤 2 为 `orbit+force`，步骤 4 为 `orbit`，步骤 5 为 `orbit+speed` 并仅短暂显示空心/虚线比较箭头，步骤 6 为 `orbit+speed`，步骤 7 为 `speed`，步骤 9 为 `comparison`。自由探索保留手动“全部”。转移阶段删除持续的 `F需` 箭头和 `F需/F引` 比值；图例在预览时显示“目标轨道预览 · 白色虚线”，执行后替换为“转移轨道 · 橙色实线”。

- [ ] **Step 4: 增量提升 Canvas 正式品质，不改变页面视觉语言**

保持固定俯视构图和现有配色：地球增加克制的昼夜层、低对比表面纹理和薄大气辉光；删除外侧无说明粉红虚线；卫星绘制主体、两片太阳翼、切向朝向和中心质点；拱点用 `apsis` 色空心菱形/环；标签增加同一暗色底板、描边、引导线和 Canvas 安全区约束。初始圆轨道不绘制长尾迹，第一次点火清空旧尾迹，转移期只保留短尾迹。`updateView()` 改为状态感知镜头：低轨不再被 `RE*3.5` 固定下限压小，转移/高轨才平滑拉远；拟合范围同时包含拱点标签、矢量和 HUD/工具栏安全边距；Canvas DPR 上限为 2。

HUD 改为“当前阶段 + 本步重点观察量”，不重复右栏的高度/速度全套数据；Toast 固定为一行事件结论，详细数值进入现有卡片。移除可见 emoji，并把 `STEP/LIVE/TARGET` 等混合标签统一为简洁中文；不进行与本轮功能无关的整体 CSS 重写。

- [ ] **Step 5: 补齐触控、键盘和减弱动态**

可见尺寸保持现状，但所有操作的真实命中矩形不小于 44×44px，邻近命中区不重叠；为 `summary/button/range/tab/dialog/observe popover` 增加可见 `:focus-visible`。观察菜单补 `aria-expanded/aria-controls`、Esc 和外点关闭；移动标签补 `aria-controls` 和 tabpanel 关系。`prefers-reduced-motion` 必须成为持久状态，重置和两次点火不得重新强制播放或恢复循环动画。

- [ ] **Step 6: 运行测试并提交视觉与可达性增量**

Run: `/Users/luogaowei/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/satellite-orbit-v5.test.mjs`

Expected: 全部 PASS。

```bash
git add '01-天体运动与卫星变轨模型-高级重构版-v5.html' tests/satellite-orbit-v5.test.mjs
git commit -m 'feat: focus orbit visuals and tablet interaction'
```

### Task 7: 用本机预览完成全流程验收并交付

**Files:**
- Create: `docs/superpowers/acceptance/2026-08-10-satellite-orbit-v5.md`
- Create: `artifacts/v5-qa/` 下的关键状态截图和对应 JSON 状态记录
- Verify: `01-天体运动与卫星变轨模型-高级重构版-v5.html`
- Publish: `/Users/luogaowei/Documents/网站全部动画/第二次全量改版/01-天体运动与卫星变轨模型-高级重构版-v5.html`

**Interfaces:**
- Consumes: 完整 v5、Node 测试、本机 Browser。
- Produces: 可复核的物理/教学/视觉验收记录、关键截图、外部目录中的最终 v5 副本。

- [ ] **Step 1: 运行完整自动化测试和静态检查**

```bash
/Users/luogaowei/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/satellite-orbit-v5.test.mjs
shasum -a 256 '/Users/luogaowei/Documents/网站全部动画/第二次全量改版/01-天体运动与卫星变轨模型-高级重构版-v4.html'
git diff --check
```

Expected: Node 测试 0 failures；v4 哈希为锁定值；diff check 无输出。

- [ ] **Step 2: 启动仅监听本机的临时预览**

```bash
python3 -m http.server 8765 --bind 127.0.0.1 --directory '/Users/luogaowei/Documents/代码保存仓库/动画制作'
```

打开：

`http://127.0.0.1:8765/01-%E5%A4%A9%E4%BD%93%E8%BF%90%E5%8A%A8%E4%B8%8E%E5%8D%AB%E6%98%9F%E5%8F%98%E8%BD%A8%E6%A8%A1%E5%9E%8B-%E9%AB%98%E7%BA%A7%E9%87%8D%E6%9E%84%E7%89%88-v5.html`

- [ ] **Step 3: 执行主引导和边界交互矩阵**

必测视口：`1194×834`、`1024×768`、`1024×540`、`390×844`。主流程必须覆盖说明卡、步骤 1 预测、步骤 4 锁定预览、步骤 5 第一次点火、步骤 7 远地点暂停/错答/提示/帮我完成、步骤 8 真实圆化、步骤 9 对比、步骤 10 验证、退出后继续引导。自由探索另测降轨、理想化同步预设、近抛物线、撞地、逃逸、重置、模板取消、连续点击和四档倍速结果一致。

每个视口断言 `document.documentElement.scrollWidth <= innerWidth`；关键触控目标实际命中区 `>=44×44`；隐藏面板不进入 Tab 顺序；预览前后 `S` 不变；点火瞬间 `r/t` 不变；拱点暂停 `|v_r|<=1e-3`；圆化后 `e<=1e-3`。

- [ ] **Step 4: 保存关键截图和状态 JSON**

1194×834 必存：`intro`、`initial-circle`、`preview-locked`、`first-burn`、`apoapsis-paused`、`circularized`、`quiz`、`near-escape-warning`。1024×768、1024×540、390×844 至少保存 `intro/preview/apsis/circularized`。命名格式固定为：

`<viewport>__<flow>__s<step>__<state>__dpr<dpr>.png`

同名 `.json` 记录教学步骤、phase、`r/v/e/v_r`、播放状态、动作代次、每帧子步数、DPR 和 viewport。

- [ ] **Step 5: 编写验收记录**

验收记录必须逐项写出：Node 测试数量与结果；v4 哈希；升轨/降轨/同步轨道物理结果；四档倍速差异；引导十步完成条件；预览与动作取消；桌面/平板/窄屏无裁切；44×44；键盘与 reduced-motion；截图清单；任何仍未通过或待补验项。不得用静态源码检查替代像素级结论。

- [ ] **Step 6: 发布到 v4 同目录并复验内容一致**

发布前先只读检查目标是否已存在；若存在则停止并请教师确认，不覆盖未知文件。目标不存在时，复制 v5 并比较 SHA-256：

```bash
test ! -e '/Users/luogaowei/Documents/网站全部动画/第二次全量改版/01-天体运动与卫星变轨模型-高级重构版-v5.html'
cp -- '01-天体运动与卫星变轨模型-高级重构版-v5.html' '/Users/luogaowei/Documents/网站全部动画/第二次全量改版/01-天体运动与卫星变轨模型-高级重构版-v5.html'
shasum -a 256 '01-天体运动与卫星变轨模型-高级重构版-v5.html' '/Users/luogaowei/Documents/网站全部动画/第二次全量改版/01-天体运动与卫星变轨模型-高级重构版-v5.html'
```

Expected: 两个 v5 哈希完全一致；v4 哈希仍为锁定值。

- [ ] **Step 7: 提交验收记录和最终版本**

```bash
git add '01-天体运动与卫星变轨模型-高级重构版-v5.html' tests/satellite-orbit-v5.test.mjs docs/superpowers/acceptance artifacts/v5-qa
git commit -m 'test: verify satellite orbit v5 guided experience'
```
