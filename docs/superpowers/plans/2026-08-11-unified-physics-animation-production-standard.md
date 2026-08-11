# 物理动画统一制作规范 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将项目要求落实为精简的 `AGENTS.md`、唯一流程权威《物理动画统一制作规范 v1》和独立视觉权威《物理动画视觉标准 v1》，并用文档契约测试防止新旧口径再次冲突。

**Architecture:** `AGENTS.md` 只负责入口和项目红线；新建的统一制作规范负责学生定位、五阶段流程、物理状态、引导演示、版本与最低验收；视觉标准只负责颜色、品牌、字号、布局、公式、重点光晕和浮动引导卡。一个 Node 内置测试文件读取三份 Markdown，验证必备规则、禁止旧外部提示词和“自动演示”旧名称，并检查职责边界。

**Tech Stack:** Markdown、Node.js 内置 `node:test`/`node:assert`、Git；不新增第三方依赖。

## Global Constraints

- 最终动画直接面向高中生独立自主学习，兼容教师课堂演示。
- 每个动画只设一个主教学目标，最多一个直接服务主目标的辅助目标。
- 项目统一使用“引导演示”，系统不得通过定时器自动操作或自动跨步。
- `替我操作`只能由学生主动点击，并与学生手动操作使用同一套真实物理逻辑。
- 全项目无声音，不加入或预留音频资源、控件与接口。
- 页面外壳和教学组件统一；题型专属物理场景可保留必要材质、真实颜色和空间环境。
- 需要速度控制时，播放、暂停和倍速控件位于主舞台内部最下方；引导演示和实验指南入口位于主舞台上方。
- 紫色重点光晕是唯一通用循环提示动效，由内向外、由浓到淡，并自动响应 `prefers-reduced-motion`。
- 核心实验装置的模型、材质、光照、阴影和空间层次不得发生可感知降级。
- 验收采用一次最低验收；修复后只定向复查受影响功能并快速冒烟主流程。
- 旧动画不批量重做，只在后续改版或修复时增量迁移。
- 当前工作树中的 `AGENTS.md` 和 `docs/物理动画视觉标准-v1.md` 已有教师草案改动，必须以当前内容为基线增量编辑，不得回退或覆盖。

---

## File Structure

- Create: `tests/unified-animation-standards.test.mjs` — 三份规范的跨文件契约测试。
- Create: `docs/物理动画统一制作规范-v1.md` — 教学、流程、物理状态、引导演示、版本和验收的唯一权威。
- Modify: `docs/物理动画视觉标准-v1.md` — 保留现有颜色、品牌、字号、三栏、响应式和浮动引导卡，增加统一入口、舞台底部控制条、公式排版和紫色重点光晕。
- Modify: `AGENTS.md` — 删除外部附件依赖，改为两份仓库内必读规范和简短项目红线。
- Modify at final status only: `docs/superpowers/specs/2026-08-11-unified-physics-animation-production-standard-design.md` — 将状态更新为“教师已确认，规范已实施”。

---

### Task 1: 建立三份规范的契约测试

**Files:**
- Create: `tests/unified-animation-standards.test.mjs`

**Interfaces:**
- Consumes: 仓库根目录、`AGENTS.md`、`docs/物理动画统一制作规范-v1.md`、`docs/物理动画视觉标准-v1.md`。
- Produces: `readStandard(name: string): string` 测试助手和四组跨文件契约，供后续任务逐项转绿。

- [ ] **Step 1: 写入完整契约测试**

使用 `apply_patch` 创建以下文件：

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const repoRoot = resolve(import.meta.dirname, '..');
const paths = {
  agents: resolve(repoRoot, 'AGENTS.md'),
  production: resolve(repoRoot, 'docs/物理动画统一制作规范-v1.md'),
  visual: resolve(repoRoot, 'docs/物理动画视觉标准-v1.md')
};

function readStandard(name) {
  const path = paths[name];
  assert.equal(existsSync(path), true, `missing standard: ${path}`);
  return readFileSync(path, 'utf8');
}

test('AGENTS points to the two in-repo authorities and keeps only project red lines', () => {
  const agents = readStandard('agents');
  assert.match(agents, /docs\/物理动画统一制作规范-v1\.md/);
  assert.match(agents, /docs\/物理动画视觉标准-v1\.md/);
  assert.match(agents, /学生.*自主学习/);
  assert.match(agents, /引导演示/);
  assert.match(agents, /替我操作/);
  assert.match(agents, /全项目无声音/);
  assert.match(agents, /目标文件/);
  assert.match(agents, /锁定元素/);
  assert.match(agents, /127\.0\.0\.1/);
  assert.match(agents, /file:\/\//);
  assert.doesNotMatch(agents, /\.codex\/attachments/);
  assert.doesNotMatch(agents, /自动演示/);
});

test('统一制作规范 contains the five-stage, risk-routed student workflow', () => {
  const production = readStandard('production');
  for (const heading of ['任务审查', '制作决策', '模型与原型', '正式制作', '验证交付']) {
    assert.match(production, new RegExp(`### .*${heading}`));
  }
  assert.match(production, /新动画或重大改版/);
  assert.match(production, /已有动画增量修改/);
  assert.match(production, /明确小修复/);
  assert.match(production, /一个主教学目标/);
  assert.match(production, /学生主动/);
  assert.match(production, /系统不得通过定时器/);
  assert.match(production, /替我操作/);
  assert.match(production, /同一套真实物理/);
  assert.match(production, /一次最低验收/);
  assert.match(production, /定向复查/);
  assert.match(production, /核心实验装置/);
  assert.match(production, /光照/);
  assert.match(production, /阴影/);
  assert.doesNotMatch(production, /自动演示/);
  assert.doesNotMatch(production, /\.codex\/attachments/);
  assert.doesNotMatch(production, /#[0-9a-f]{6}/i);
});

test('视觉标准 owns the page shell, formula, focus glow and guide-card details', () => {
  const visual = readStandard('visual');
  assert.match(visual, /--focus:\s*#9a83ff/i);
  assert.match(visual, /引导演示与实验指南入口/);
  assert.match(visual, /主舞台底部控制条/);
  assert.match(visual, /紫色重点观察光晕/);
  assert.match(visual, /由内向外/);
  assert.match(visual, /由浓到淡/);
  assert.match(visual, /pointer-events:\s*none/);
  assert.match(visual, /prefers-reduced-motion/);
  assert.match(visual, /唯一通用.*循环提示动效/);
  assert.match(visual, /公式与上下角标/);
  assert.match(visual, /<mfrac>/);
  assert.match(visual, /<sub>/);
  assert.match(visual, /44×44 CSS px/);
  assert.match(visual, /通用浮动引导卡/);
  assert.doesNotMatch(visual, /自动演示/);
});

test('the three standards have one owner per concern and no legacy prompt dependency', () => {
  const agents = readStandard('agents');
  const production = readStandard('production');
  const visual = readStandard('visual');
  assert.doesNotMatch(`${agents}\n${production}\n${visual}`, /235181b3-b39e-4217-abf1-b37333008bab/);
  assert.match(production, /## 3\. 五阶段制作流程/);
  assert.equal((visual.match(/--surface-page/g) || []).length >= 2, true);
  assert.doesNotMatch(production, /--surface-page|grid-template-columns/);
});
```

- [ ] **Step 2: 运行测试并确认按预期失败**

Run:

```bash
node --test tests/unified-animation-standards.test.mjs
```

Expected: FAIL。统一制作规范尚不存在，`AGENTS.md` 仍引用外部附件，视觉标准尚缺入口、公式和 `--focus` 契约。

- [ ] **Step 3: 仅提交契约测试**

```bash
git add tests/unified-animation-standards.test.mjs
git commit -m "test: define unified animation standard contracts"
```

---

### Task 2: 创建唯一流程权威《物理动画统一制作规范 v1》

**Files:**
- Create: `docs/物理动画统一制作规范-v1.md`
- Test: `tests/unified-animation-standards.test.mjs`

**Interfaces:**
- Consumes: 已确认设计 `docs/superpowers/specs/2026-08-11-unified-physics-animation-production-standard-design.md` 和视觉标准文件路径。
- Produces: 供 `AGENTS.md` 必读、供所有新建/改版/修复任务执行的唯一制作流程权威；不包含具体色值或CSS实现。

- [ ] **Step 1: 单独运行统一制作规范契约并确认失败**

```bash
node --test --test-name-pattern='统一制作规范' tests/unified-animation-standards.test.mjs
```

Expected: FAIL，提示缺少 `docs/物理动画统一制作规范-v1.md`。

- [ ] **Step 2: 创建统一制作规范的固定结构**

使用 `apply_patch` 创建文档，按以下完整章节顺序编写，不复制视觉标准中的色值和CSS：

```markdown
# 物理动画统一制作规范 v1

## 0. 标准身份、适用范围与权威顺序
## 1. 学生产品定位
## 2. 启动信息与任务风险分级
## 3. 五阶段制作流程
### 阶段一：任务审查
### 阶段二：制作决策
### 阶段三：模型与原型
### 阶段四：正式制作
### 阶段五：验证交付
## 4. 教学目标、功能预算与主动做减法
## 5. 物理模型、参数分类与唯一实验状态
## 6. 2D、2.5D、3D与核心视觉品质
## 7. 学生主导的引导演示
### 7.1 学生主动推进
### 7.2 观察步骤与操作步骤
### 7.3 替我操作
### 7.4 关闭、继续、上一步与自由探索
## 8. 页面信息职责与视觉标准引用
## 9. 已有项目、版本与例外审批
## 10. 一次最低验收、人工反馈与交付
## 11. 明确不做
## 12. 标准维护
```

各章节必须落实以下精确口径：

- 学生在完全静音、没有教师讲解时知道研究什么、从哪里开始、做什么、看哪里和形成什么结论；
- 教师必须提供目标文件、锁定元素、本轮唯一主目标和修改边界；未指定版本策略时保留原文件并生成递增版本；
- 新动画/重大改版完整走五阶段，增量修改缩短流程，明确小修复只定位、最小修改和定向验证；
- 《制作决策单》合并原教学诊断、选择建议单、设计卡和功能表；只有新动画或重新选择教学方向的重大改版需要二到四个方案；
- 默认预算为一个主目标、最多一个辅助目标、三个左右核心功能、二到四个参数、每步一个观察焦点、最多两组高亮信息、默认零到一张主图；
- 物理内核、唯一实验状态、教学脚本、显示模块、动作模块和页面外壳逻辑分离；
- 学生手动操作和`替我操作`通过同一动作进入唯一实验状态，再由物理内核计算并同步全部显示；
- 项目只使用“引导演示”，学生主动点击下一步，系统不得通过定时器自动操作或跨步；
- `替我操作`只能由学生主动点击，只完成当前一步，真实条件满足后才解锁下一步；
- 关闭引导保留状态，继续引导恢复步骤和位置，上一步重建确定状态，“现在自己试试”回到确定初态进入自由探索；
- 统一页面职责只描述标题、入口、舞台、舞台底部控制和参数/观察区域，具体颜色、尺寸、公式和光晕引用视觉标准；
- 全项目无声音；性能不足时先删非核心范围，不降低核心实验装置模型、材质、光照、阴影和空间层次；
- 每版只进行一次最低验收，修复后只定向复查并快速冒烟；教师或学生人工体验后继续增量修改；
- 不批量重做旧动画，不建立账号、班级、云端档案或复杂评分系统。

- [ ] **Step 3: 运行统一制作规范契约并确认通过**

```bash
node --test --test-name-pattern='统一制作规范' tests/unified-animation-standards.test.mjs
```

Expected: PASS。其他涉及 `AGENTS.md` 和视觉标准的契约仍可保持失败。

- [ ] **Step 4: 检查制作规范没有视觉实现和旧口径泄漏**

```bash
rg -n '#[0-9A-Fa-f]{6}|--surface-page|grid-template-columns|自动演示|\.codex/attachments' 'docs/物理动画统一制作规范-v1.md'
```

Expected: 无输出。

- [ ] **Step 5: 提交统一制作规范**

```bash
git add 'docs/物理动画统一制作规范-v1.md'
git commit -m "docs: add unified physics animation production standard"
```

---

### Task 3: 扩展视觉标准的统一页面、公式与重点光晕

**Files:**
- Modify: `docs/物理动画视觉标准-v1.md`
- Test: `tests/unified-animation-standards.test.mjs`

**Interfaces:**
- Consumes: 当前未提交的第8节“通用浮动引导卡”、现有CSS Token和响应式模板。
- Produces: 页面外壳、入口、舞台控制条、公式和紫色重点光晕的唯一视觉权威。

- [ ] **Step 1: 保存并检查当前教师草案差异**

```bash
git diff -- 'docs/物理动画视觉标准-v1.md'
```

Expected: 可见当前第8节“通用浮动引导卡”新增内容。后续编辑必须保留其默认位置、安全拖动、状态保持和可访问性要求。

- [ ] **Step 2: 单独运行视觉标准契约并确认失败**

```bash
node --test --test-name-pattern='视觉标准' tests/unified-animation-standards.test.mjs
```

Expected: FAIL，缺少 `--focus`、入口、舞台底部控制条、公式章节和重点光晕完整口径。

- [ ] **Step 3: 增加关注色Token**

在颜色标准中增加：

```markdown
### 1.5 教学关注色

| Token | 色值 | 用途 |
|---|---:|---|
| `--focus` | `#9A83FF` | 引导演示中的当前唯一重点边框和光晕 |

- 关注紫只用于当前步骤的教学焦点，不作为普通按钮、成功、警告或装饰色。
- 中心边框最浓，向外的多层光晕逐层降低不透明度。
```

并在 `:root` Token 模板中加入：

```css
--focus: #9a83ff;
```

- [ ] **Step 4: 增加主舞台上方入口和底部控制条**

在标题/布局章节中增加以下两个小节：

```markdown
### 2.4 引导演示与实验指南入口

- 入口区位于统一标题栏下方、主舞台上方，不进入标题栏、左右侧栏或浮动引导卡。
- 一个动画可以有一个或多个引导演示情境入口，数量由唯一主教学目标决定；实验指南与情境入口同层。
- 入口按钮统一高度、圆角、边框、间距和选中语义，主要触控目标不小于 `44×44 CSS px`。
- 当前情境使用主操作蓝选中态；实验指南打开状态通过可见样式和 `aria-expanded` 表达。
```

```markdown
### 4.3 主舞台底部控制条

- 需要物理时间控制的动画，把播放、暂停、`0.25×`、`0.5×`、`1×`、`2×`、必要观察范围和重置统一放在主舞台内部最下方。
- 控制条不得进入左侧参数栏、右侧观察栏、标题栏或浮动引导卡。
- 播放倍速的选中态清楚，控制条不得遮挡本步主要观察对象。
- 不需要物理时间控制的动画不为形式统一而增加空控制条。
```

- [ ] **Step 5: 将第8节统一改称引导演示并增加重点光晕**

把第8节开头的“自动演示”旧称替换为“引导演示”，保留其余已确认拖动规则。新增：

```markdown
### 8.6 紫色重点观察光晕

- 每一步原则上只显示一个联合重点区域，不给多个零散对象分别套框。
- 使用 `--focus`：中心边框最浓，向外形成多层由浓到淡的紫色光晕。
- 光晕采用柔和呼吸变化，由内向外扩散，不使用生硬开关式闪烁。
- 光晕保持到本步完成或切换步骤，并设置 `pointer-events: none`，不得阻断学生操作。
- 不增加“重点观察”悬浮标签；引导卡中的“重点看”承担文字说明。
- 除必要物理运动外，紫色重点光晕是项目唯一通用的循环提示动效。
- 页面不设置“减少动态效果”按钮；在 `prefers-reduced-motion: reduce` 下取消呼吸扩散，保留静态紫色边框和渐淡光晕。
```

给出直接可复用的最小CSS示例：

```css
.scenario-focus-layer {
  position: fixed;
  pointer-events: none;
  border: 5px solid var(--focus);
  box-shadow:
    0 0 0 4px rgba(154, 131, 255, .32),
    0 0 22px 8px rgba(154, 131, 255, .22),
    0 0 46px 18px rgba(154, 131, 255, .12);
  animation: focus-breathe 2.8s ease-in-out infinite;
}

@keyframes focus-breathe {
  0%, 100% { opacity: .72; }
  50% { opacity: 1; }
}

@media (prefers-reduced-motion: reduce) {
  .scenario-focus-layer { animation: none; opacity: 1; }
}
```

- [ ] **Step 6: 增加公式与上下角标章节**

在维护规则前增加：

````markdown
## 9. 公式与上下角标

### 9.1 排版规则

- 核心分式使用标准上下分子、分母和水平分数线，不向学生显示普通 `a/b`。
- 复杂公式优先使用原生 MathML；简单物理量可使用 `<var>` 配合 `<sub>`、`<sup>`。
- Canvas/SVG 中的上下角标必须显式计算基线；不能显示 `v_0`、`r_0` 等程序式文本。
- 变量使用数学斜体，单位使用正体；数值与单位之间保留适当间距。
- 上下角标归属清楚、位置正确且可读；不能缩小到 `11px` 以下。
- 同一动画中的矢量符号保持统一。

### 9.2 正确示例

```html
<math aria-label="加速度等于速度变化量除以时间变化量">
  <mi>a</mi><mo>=</mo>
  <mfrac><mrow><mi>Δv</mi></mrow><mrow><mi>Δt</mi></mrow></mfrac>
</math>

<span><var>v</var><sub>0</sub> = 5 m/s</span>
```

错误示例：`a=Δv/Δt`、`v_0=5m/s`、通过整体缩放把角标压小。
````

将原维护规则顺延为第10节，并更新第0节内容清单和维护日期说明。

- [ ] **Step 7: 运行视觉标准契约并确认通过**

```bash
node --test --test-name-pattern='视觉标准' tests/unified-animation-standards.test.mjs
```

Expected: PASS。

- [ ] **Step 8: 检查视觉文档格式和旧称**

```bash
git diff --check -- 'docs/物理动画视觉标准-v1.md'
rg -n '自动演示|v_0|r_0' 'docs/物理动画视觉标准-v1.md'
```

Expected: `git diff --check` 成功；`rg` 只允许在“错误示例”代码文本中出现 `v_0`、`r_0`，不得出现“自动演示”。

- [ ] **Step 9: 提交视觉标准**

```bash
git add 'docs/物理动画视觉标准-v1.md'
git commit -m "docs: unify animation visual and guidance language"
```

---

### Task 4: 精简 `AGENTS.md` 并切换到两份仓库内规范

**Files:**
- Modify: `AGENTS.md`
- Test: `tests/unified-animation-standards.test.mjs`

**Interfaces:**
- Consumes: `docs/物理动画统一制作规范-v1.md`、`docs/物理动画视觉标准-v1.md`。
- Produces: 所有Codex进入仓库时读取的简短入口和不可突破红线。

- [ ] **Step 1: 单独运行AGENTS契约并确认失败**

```bash
node --test --test-name-pattern='AGENTS' tests/unified-animation-standards.test.mjs
```

Expected: FAIL，当前文件仍引用外部附件和“自动演示”。

- [ ] **Step 2: 用精简内容替换AGENTS**

使用 `apply_patch` 将文件整理为以下完整内容：

```markdown
# 项目协作约定

## 必读规范

- 每次新建、改版或修复物理动画前，完整阅读并遵守 `docs/物理动画统一制作规范-v1.md`。
- 同时完整阅读并遵守 `docs/物理动画视觉标准-v1.md`；颜色语义、品牌标题、六级字号、三栏职责、响应式、公式排版、引导卡和重点光晕默认不得偏离。
- 当前任务需要偏离任一规范时，先列出偏离项、教学必要性和影响，取得教师确认后再实施。

## 项目红线

- 动画直接面向高中生自主学习，兼容教师课堂演示；页面不得显示开发术语、版本信息或审批信息。
- 每个动画只设一个主教学目标，最多一个直接服务主目标的辅助目标。
- 新动画和重大改版先审查并提出二到四个有明显差异的方向与AI推荐，教师确认后制作；增量修改和明确小修复按统一制作规范缩短流程。
- 已有项目优先增量修改和模块复用；未经确认不得整体重写、改变既有视觉语言、核心交互或数据结构。
- 项目统一使用“引导演示”：步骤由学生主动推进，`替我操作`只能由学生主动点击，系统不得通过定时器自动操作或自动跨步。
- 引导演示和实验指南入口位于主舞台上方；需要速度控制时，播放、暂停和倍速位于主舞台内部最下方。
- 引导时每一步只设一个主要观察焦点，使用视觉标准规定的紫色渐淡呼吸光晕；主场景默认最多同时突出两组核心物理信息。
- 核心实验装置的模型、材质、光照、阴影和空间层次不得因功能、布局或性能优化发生可感知降级。
- 全项目无声音，不加入或预留音频资源、控件与接口。
- 新任务由教师指出目标文件、锁定元素、本轮教学目标和修改边界；未说明版本策略时，保留原文件并生成递增版本。

## 本地网页预览

- 本地HTML动画统一通过仅监听 `127.0.0.1` 的临时静态服务器进行浏览器验证与截图。
- 不自动化 `file://` 页面。
- 临时预览只访问本机文件，不上传项目内容；验证后按需停止临时服务器。
```

- [ ] **Step 3: 运行AGENTS契约并确认通过**

```bash
node --test --test-name-pattern='AGENTS' tests/unified-animation-standards.test.mjs
```

Expected: PASS。

- [ ] **Step 4: 确认外部附件和旧称已移除**

```bash
rg -n '\.codex/attachments|自动演示|235181b3-b39e-4217-abf1-b37333008bab' AGENTS.md
```

Expected: 无输出。

- [ ] **Step 5: 提交AGENTS入口**

```bash
git add AGENTS.md
git commit -m "docs: point agents to unified animation standards"
```

---

### Task 5: 全量验证、规格状态更新和交付

**Files:**
- Modify: `docs/superpowers/specs/2026-08-11-unified-physics-animation-production-standard-design.md`
- Verify: `AGENTS.md`
- Verify: `docs/物理动画统一制作规范-v1.md`
- Verify: `docs/物理动画视觉标准-v1.md`
- Test: `tests/unified-animation-standards.test.mjs`

**Interfaces:**
- Consumes: Tasks 1–4的三份规范和契约测试。
- Produces: 已验证的统一规范体系和实施完成状态。

- [ ] **Step 1: 运行完整规范契约**

```bash
node --test tests/unified-animation-standards.test.mjs
```

Expected: 4 tests PASS，0 FAIL。

- [ ] **Step 2: 运行现有仓库测试，确认规范改动未影响动画基线**

```bash
node --test tests/*.test.mjs
```

Expected: 所有现有测试PASS，0 FAIL。若现有动画测试本身与当前工作树不一致，记录原始失败证据，不为通过规范任务而修改动画文件。

- [ ] **Step 3: 检查三份规范的旧依赖、旧称和格式**

```bash
rg -n '\.codex/attachments|235181b3-b39e-4217-abf1-b37333008bab|自动演示' AGENTS.md 'docs/物理动画统一制作规范-v1.md' 'docs/物理动画视觉标准-v1.md'
git diff --check HEAD
```

Expected: `rg` 无输出；`git diff --check` 成功。

- [ ] **Step 4: 核对设计要求覆盖**

逐项核对并在终端记录命中位置：

```bash
rg -n '五阶段制作流程|任务审查|制作决策|模型与原型|正式制作|验证交付|引导演示|替我操作|一次最低验收|定向复查|核心实验装置' 'docs/物理动画统一制作规范-v1.md'
rg -n '引导演示与实验指南入口|主舞台底部控制条|紫色重点观察光晕|由内向外|由浓到淡|prefers-reduced-motion|公式与上下角标|<mfrac>|<sub>' 'docs/物理动画视觉标准-v1.md'
```

Expected: 每个要求至少有一个清楚命中位置。

- [ ] **Step 5: 更新设计规格状态**

使用 `apply_patch` 将设计规格顶部：

```markdown
- 状态：教师已逐节确认，待书面规格复核
```

改为：

```markdown
- 状态：教师已确认，统一规范已实施并通过文档契约验证
```

- [ ] **Step 6: 提交实施状态**

```bash
git add 'docs/superpowers/specs/2026-08-11-unified-physics-animation-production-standard-design.md'
git commit -m "docs: mark unified animation standards implemented"
```

- [ ] **Step 7: 最终检查提交和工作树**

```bash
git log -5 --oneline --decorate
git status --short
```

Expected: 最近提交依次包含契约测试、统一制作规范、视觉标准、AGENTS入口和实施状态；工作树不包含本计划之外的新改动。

## Execution Handoff

实施时从当前工作树内容出发，保留教师已经加入 `AGENTS.md` 和视觉标准第8节的未提交草案。每次只暂存任务列出的文件，禁止使用重置或覆盖命令处理现有修改。
