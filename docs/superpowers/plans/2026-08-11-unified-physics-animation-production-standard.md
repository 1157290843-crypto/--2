# 物理动画统一制作规范 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将项目要求落实为精简的 `AGENTS.md`、唯一流程权威《物理动画统一制作规范 v1》和独立视觉权威《物理动画视觉标准 v1》，并用文档契约测试防止新旧口径再次冲突。

**Architecture:** `AGENTS.md` 只负责入口和项目红线；新建的统一制作规范负责学生定位、五阶段流程、物理状态、引导演示、版本与最低验收；视觉标准只负责颜色、品牌、字号、布局、公式、重点光晕和浮动引导卡。一个 Node 内置测试文件读取三份 Markdown，以规则级正向和反向断言验证职责边界、真实状态引导、公式渲染路径、光晕动效、装置品质证据和验收边界。

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
- 唯一实施路径为隔离工作树 `/Users/luogaowei/Documents/代码保存仓库/动画制作/.worktrees/unified-animation-standards` 和分支 `codex/unified-animation-standards`；只允许一个写作者在该工作树依序实施。
- 主工作区脏文件只读：不得暂存、清理、重置、checkout、stash 或覆盖。Task 3 只从其中教师已确认的第 8 节迁移行为规则，并用“引导演示”统一术语，不逐字复制旧称。
- 所有 Node 命令固定使用 `/Users/luogaowei/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node`；测试以 `fileURLToPath()` 和 `dirname()` 解析 ESM 路径，不使用 `import.meta.dirname`。
- 每次提交前只暂存任务列出的路径，并以 `git diff --cached -- <target>` 核对预期 hunk；提交后记录 SHA。最终按文件路径和 SHA 核验，不依赖全仓库“最近五条”。

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

- [ ] **Step 0: 锁定实施位置、运行时和实际基线**

只在本计划指定的隔离工作树和 `codex/unified-animation-standards` 分支执行。先记录隔离工作树状态和固定运行时版本；不要根据主工作区的未跟踪文件预设失败原因，也不要处理主工作区脏文件。

```bash
git status --short
git branch --show-current
/Users/luogaowei/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --version
```

Expected: 分支为 `codex/unified-animation-standards`；记录此隔离工作树的实际基线。若分支、工作树或运行时不符，停止执行并修正执行环境，不创建 `.nvmrc`、不使用 `npx` 下载运行时。

- [ ] **Step 1: 写入完整契约测试**

使用 `apply_patch` 创建以下文件：

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// This file lives directly in tests/; resolve its parent explicitly for ESM portability.
const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '..');
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
  assert.doesNotMatch(agents, /--focus|#9a83ff|grid-template-columns|@keyframes/);
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
  assert.match(production, /学生主动点击下一步/);
  assert.match(production, /不得通过定时器自动操作或自动跨步/);
  assert.match(production, /观察步骤[\s\S]{0,80}不显示.*替我操作/);
  assert.match(production, /替我操作[\s\S]{0,80}学生主动点击[\s\S]{0,80}当前一步/);
  assert.match(production, /学生手动操作[\s\S]{0,100}同一动作[\s\S]{0,100}唯一实验状态/);
  assert.match(production, /真实完成条件[\s\S]{0,80}解锁下一步/);
  assert.match(production, /不得.*直接写入显示结果|不得.*伪动画/);
  assert.match(production, /每个版本只进行一次完整最低验收/);
  assert.match(production, /修复后[\s\S]{0,80}定向复查[\s\S]{0,80}主流程冒烟/);
  assert.match(production, /`EDU`(?:：|\s*\|)[^\n]*单一目标[^\n]*单一观察焦点[^\n]*静音自主学习/);
  assert.match(production, /`PHY`(?:：|\s*\|)[^\n]*公式[^\n]*单位[^\n]*状态转换[^\n]*临界条件[^\n]*倍速不改变结果/);
  assert.match(production, /`GUIDE`(?:：|\s*\|)[^\n]*学生推进[^\n]*学生主动.*替我操作[^\n]*真实状态门控[^\n]*恢复状态[^\n]*安全拖动/);
  assert.match(production, /`VIS`(?:：|\s*\|)[^\n]*标题[^\n]*入口[^\n]*舞台控制条[^\n]*字号[^\n]*触控[^\n]*公式[^\n]*光影品质/);
  assert.match(production, /`RESP`(?:：|\s*\|)[^\n]*宽屏[^\n]*横屏平板[^\n]*窄屏[^\n]*短横屏/);
  for (const viewport of ['1180×820', '1024×768', '960×768', '960×540', '390×844']) {
    assert.match(production, new RegExp(viewport));
  }
  assert.match(production, /核心实验装置[\s\S]{0,120}模型[\s\S]{0,120}材质[\s\S]{0,120}光照[\s\S]{0,120}阴影[\s\S]{0,120}空间层次/);
  assert.match(production, /改版前后生成并保存同尺寸截图，人工对比并核对核心装置的模型、材质、光照、阴影和空间层次/);
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
  assert.match(visual, /\.stage\s*\{[\s\S]{0,120}position:\s*relative/);
  assert.match(visual, /scenario-focus-layer[\s\S]{0,160}position:\s*absolute/);
  assert.match(visual, /scenario-focus-layer[\s\S]{0,240}z-index/);
  assert.match(visual, /pointer-events:\s*none/);
  assert.match(visual, /prefers-reduced-motion/);
  assert.match(visual, /animation:\s*none[\s\S]{0,160}静态紫色边框/);
  assert.match(visual, /唯一通用.*循环提示动效/);
  assert.match(visual, /44×44 CSS px/);
  assert.match(visual, /通用浮动引导卡/);
  assert.doesNotMatch(visual, /自动演示/);
});

test('视觉标准 defines semantic and accessible formula output across renderers', () => {
  const visual = readStandard('visual');
  for (const required of [
    /数学除法语义[\s\S]*标准分式/,
    /普通斜杠只允许[\s\S]*单位字符串/,
    /<mfrac>/,
    /<msub>/,
    /<msup>/,
    /<msubsup>/,
    /<mover/,
    /明确底数|完整底数/,
    /变量[\s\S]*数学斜体/,
    /单位[\s\S]*正体/,
    /数值与单位[\s\S]*不换行/,
    /HTML、Canvas 和 SVG[\s\S]*11 CSS px/,
    /原生 MathML[\s\S]*层级缩放[\s\S]*不套用/,
    /max\(var\(--type-11\),\s*\.75em\)/,
    /Canvas[\s\S]*measureText\(\)/,
    /DOM 等价文本/,
    /aria-labelledby/,
    /同一物理状态/
  ]) assert.match(visual, required);
  const beforeErrorExamples = visual.split('### 9.8 错误示例')[0];
  assert.doesNotMatch(beforeErrorExamples, /v_0|r_0/);
  assert.match(visual, /### 9\.8 错误示例[\s\S]*a=Δv\/Δt[\s\S]*v_0=5m\/s/);
  assert.doesNotMatch(visual, /sub\s*,\s*\n?\s*sup\s*\{\s*font-size:\s*1em\s*;?\s*\}/);
  assert.doesNotMatch(visual, /<mi>Δv<\/mi>|<mi>Δt<\/mi>/);
});

test('the three standards have one owner per concern and no legacy prompt dependency', () => {
  const agents = readStandard('agents');
  const production = readStandard('production');
  const visual = readStandard('visual');
  assert.doesNotMatch(`${agents}\n${production}\n${visual}`, /235181b3-b39e-4217-abf1-b37333008bab/);
  assert.match(production, /## 3\. 五阶段制作流程/);
  assert.doesNotMatch(production, /--surface-page|grid-template-columns/);
});
```

- [ ] **Step 2: 运行测试并记录实际基线**

Run:

```bash
/Users/luogaowei/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/unified-animation-standards.test.mjs
```

Expected: 记录隔离工作树实际的 PASS/FAIL 与失败断言；不承诺“制作规范不存在”或其他主工作区特定状态。该基线只用来确认后续任务逐项收敛。

- [ ] **Step 3: 仅提交契约测试**

```bash
git add tests/unified-animation-standards.test.mjs
git diff --cached -- tests/unified-animation-standards.test.mjs
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
/Users/luogaowei/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test --test-name-pattern='统一制作规范' tests/unified-animation-standards.test.mjs
```

Expected: 记录针对隔离工作树实际基线的失败项；不把文件不存在预设为唯一原因。

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
- 项目只使用“引导演示”，学生主动点击下一步，系统不得通过定时器自动操作或自动跨步；观察步骤不显示`替我操作`；
- `替我操作`只能由学生主动点击，只完成当前一步；它与手动操作共用同一动作模块、唯一实验状态和物理内核，真实完成条件满足后才解锁下一步，不得第二套伪动画或直接写入显示结果；
- 关闭引导保留状态，继续引导恢复步骤和位置，上一步重建确定状态，“现在自己试试”回到确定初态进入自由探索；
- 统一页面职责只描述标题、入口、舞台、舞台底部控制和参数/观察区域，具体颜色、尺寸、公式和光晕引用视觉标准；
- 全项目无声音；性能不足时先删非核心范围，不降低核心实验装置模型、材质、光照、阴影和空间层次；改版前后生成并保存同尺寸截图，人工对比并核对核心装置的模型、材质、光照、阴影和空间层次；
- 每版只进行一次完整最低验收；修复后只定向复查受影响功能并快速走一次主流程冒烟；教师或学生人工体验后继续增量修改；
- 不批量重做旧动画，不建立账号、班级、云端档案或复杂评分系统。

在第 10 节以如下表格逐项写入最低验收，不得只列代号：

| 编号 | 最低验收内容 |
|---|---|
| `EDU` | 单一目标、单一观察焦点和静音自主学习。 |
| `PHY` | 公式、单位、状态转换、临界条件和倍速不改变结果。 |
| `GUIDE` | 学生推进、学生主动触发`替我操作`、真实状态门控、恢复状态和卡片安全拖动。 |
| `VIS` | 标题、入口、舞台控制条、字号、触控、公式及装置光影品质。 |
| `RESP` | 宽屏、横屏平板、窄屏和短横屏布局。 |

代表尺寸必须逐项列为 `1180×820`、`1024×768`、`960×768`、`960×540`、`390×844`；其中 `390×844` 只做窄屏基本可用性检查，不作为主要教学设备标准。截图留存证据须与 `VIS` 验收一并保存。

- [ ] **Step 3: 运行统一制作规范契约并确认通过**

```bash
/Users/luogaowei/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test --test-name-pattern='统一制作规范' tests/unified-animation-standards.test.mjs
```

Expected: PASS。其他涉及 `AGENTS.md` 和视觉标准的契约仍可保持失败。

- [ ] **Step 4: 检查制作规范没有视觉实现和旧口径泄漏**

```bash
if rg -n '#[0-9A-Fa-f]{6}|--surface-page|grid-template-columns|自动演示|\.codex/attachments' 'docs/物理动画统一制作规范-v1.md'; then
  exit 1
fi
```

Expected: 守卫以退出码 0 结束且无输出；任一泄漏命中即显示匹配并以退出码 1 失败。

- [ ] **Step 5: 提交统一制作规范**

```bash
git add 'docs/物理动画统一制作规范-v1.md'
git diff --cached -- 'docs/物理动画统一制作规范-v1.md'
git commit -m "docs: add unified physics animation production standard"
```

---

### Task 3: 扩展视觉标准的统一页面、公式与重点光晕

**Files:**
- Modify: `docs/物理动画视觉标准-v1.md`
- Test: `tests/unified-animation-standards.test.mjs`

**Interfaces:**
- Consumes: 主工作区教师已确认的第8节“通用浮动引导卡”行为规则（只读来源）、隔离工作树现有CSS Token和响应式模板。
- Produces: 页面外壳、入口、舞台控制条、公式和紫色重点光晕的唯一视觉权威。

- [ ] **Step 1: 只读审查并迁移教师已确认行为规则**

```bash
git -C '/Users/luogaowei/Documents/代码保存仓库/动画制作' status --short
git -C '/Users/luogaowei/Documents/代码保存仓库/动画制作' diff -- 'docs/物理动画视觉标准-v1.md'
git diff -- 'docs/物理动画视觉标准-v1.md'
```

Expected: 主工作区结果仅作为第 8 节教师已确认规则的只读证据；隔离工作树结果用于本次增量编辑。迁移默认位置、安全拖动、状态保持和可访问性等行为约束，但将旧名称统一为“引导演示”，不逐字复制原句；不得对主工作区执行 `git add`、清理或任何写入操作。

- [ ] **Step 2: 单独运行视觉标准契约并确认失败**

```bash
/Users/luogaowei/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test --test-name-pattern='视觉标准' tests/unified-animation-standards.test.mjs
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
- 光晕是与目标同步定位的舞台覆盖层：主舞台建立相对定位和明确 stacking context；光晕相对舞台绝对定位、位于场景内容之上且引导卡/模态层之下，并始终 `pointer-events: none`。
```

给出直接可复用的最小CSS示例：

```css
.stage {
  position: relative;
  isolation: isolate;
}

.scenario-focus-layer {
  position: absolute;
  z-index: 2;
  pointer-events: none;
  border: 5px solid var(--focus);
  box-shadow:
    0 0 0 4px rgba(154, 131, 255, .32),
    0 0 22px 8px rgba(154, 131, 255, .22),
    0 0 46px 18px rgba(154, 131, 255, .12);
  transform-origin: center;
  animation: focus-expand 2.8s ease-out infinite;
}

@keyframes focus-expand {
  0% {
    opacity: .88;
    transform: scale(.92);
    box-shadow: 0 0 0 2px rgba(154, 131, 255, .50), 0 0 14px 4px rgba(154, 131, 255, .32);
  }
  72%, 100% {
    opacity: 0;
    transform: scale(1.12);
    box-shadow: 0 0 0 10px rgba(154, 131, 255, .12), 0 0 52px 26px rgba(154, 131, 255, 0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .scenario-focus-layer {
    animation: none;
    opacity: 1;
    transform: none;
    /* 保留静态紫色边框和由浓到淡的光晕，仍不拦截操作。 */
  }
}
```

- [ ] **Step 6: 增加公式与上下角标章节**

在维护规则前增加：

````markdown
## 9. 公式、物理量与上下角标

### 9.1 适用范围与字号

- 本节适用于 DOM、原生 MathML、Canvas 和 SVG 中所有向学生显示的公式、物理量、角标、分式、单位和矢量符号。
- 简单行内公式的根字号不得低于 T5 `12px`；含标准分式、根式或多层脚本的核心/展示公式根字号不得低于 T2 `16px`。
- HTML、Canvas 和 SVG 手工排版的角标、分子、分母及其他可见字形不得低于 `11 CSS px`。
- 原生 MathML 内部由浏览器数学排版器产生的层级缩放不套用上一条的逐节点字号下限，但 `<math>` 根字号仍须满足本节要求，并须在代表尺寸下人工确认可读。
- 删除现有全局 `sub, sup { font-size: 1em; }`；禁止以全局角标覆盖、整体 `transform: scale()` 或公式栅格化规避字号和排版要求。

### 9.2 分式与普通斜杠

- 凡斜杠承担数学除法语义，均使用上下分子、分母和水平分数线的标准分式；MathML 使用 `<mfrac>`。
- 普通斜杠只允许作为约定单位字符串的一部分，例如 `m/s`、`m/s²`、`kg/m³`、`N/C` 和 `V/m`；这类单位保持正体，不改成上下分式。
- 同一单位字符串出现多个除法层级时，使用括号或负指数消除歧义，不写无括号的重复斜杠。
- Canvas/SVG 中的标准分式必须分别布局分子、分母和水平分数线，不能绘制 `a/b` 字符串代替。

### 9.3 变量、单位和数值

- 单字符物理变量使用数学斜体；数字、单位符号、描述性缩写和函数名使用正体。
- HTML 简单物理量使用 `<var>`；MathML 中变量、数字、运算符分别使用 `<mi>`、`<mn>`、`<mo>`，单位使用正体节点，不把多个语义 token 合并进一个 `<mi>`。
- 数值与单位之间保留一个不换行间距，数值和单位不得在行尾拆开；单位字符串内部不在斜杠两侧加空格。
- 不向学生显示带下划线或函数包装的程序式物理量文本。

### 9.4 上下角标与作用域

- 每个上标或下标必须绑定明确底数；底数可以是单个变量，也可以是整个物理量或带括号表达式。
- MathML 的单下标、单上标和配对上下标分别使用 `<msub>`、`<msup>`、`<msubsup>`；指数作用于复合量时，先用 `<mrow>` 构成完整底数，再套 `<msup>`。
- 简单 HTML 只允许 `<var>` 配合单个 `<sub>` 或 `<sup>`；同一底数同时有上下标、存在复合底数或可能产生作用域歧义时，必须改用 MathML。
- HTML 角标仅使用公式作用域规则，例如 `max(var(--type-11), .75em)`，不设置全局 `sub/sup` 字号。
- Canvas/SVG 必须把底数和脚本作为独立文本 run，显式计算宽度与基线；脚本不得靠下划线文本或 Unicode 外观冒充。

### 9.5 矢量

- 每个动画选择并坚持一种公式矢量记法，默认使用变量上方箭头；同一物理量不得混用上箭头、粗体和程序式 `vec(v)`。
- MathML 的上方矢量箭头使用 `<mover accent="true">`；带角标的矢量先构成矢量节点，再用 `<msub>`、`<msup>` 或 `<msubsup>` 绑定脚本。
- Canvas/SVG 的矢量箭头、公式、图例和可访问名称必须对应同一物理量；矢量方向不得只靠颜色传达。

### 9.6 Canvas、SVG 与可访问性

- Canvas 公式使用 `measureText()` 按 CSS 像素计算文本 run、角标、分子、分母和分数线；DPR 只调整 backing store，不改变 CSS 字号阈值。
- SVG 使用独立 `<text>/<tspan>` 或等价节点表达底数、脚本与分式，并显式设置位置和基线。
- 每个非纯装饰公式必须具有完整可访问名称或同步的 DOM 等价文本，阅读顺序表达变量、角标、运算关系和单位。
- SVG 至少使用 `<title>` 配合 `aria-labelledby`；Canvas 使用邻近或 fallback DOM 等价文本。可见公式和可访问文本必须由同一物理状态更新。
- 只有在已有等价语义文本时，视觉重复副本才可以从辅助技术树中隐藏。

### 9.7 正确示例

```html
<math display="inline" aria-label="加速度等于速度变化量除以时间变化量">
  <mi>a</mi><mo>=</mo>
  <mfrac>
    <mrow><mi mathvariant="normal">Δ</mi><mi>v</mi></mrow>
    <mrow><mi mathvariant="normal">Δ</mi><mi>t</mi></mrow>
  </mfrac>
</math>

<math aria-label="初速度矢量 v 下标 0">
  <msub>
    <mover accent="true"><mi>v</mi><mo>→</mo></mover>
    <mn>0</mn>
  </msub>
</math>

<span class="formula" role="math" aria-label="初速度 v 下标 0 等于 5 米每秒">
  <var>v</var><sub>0</sub> =
  <span class="quantity">5&nbsp;<span class="unit">m/s</span></span>
</span>
```

### 9.8 错误示例

数学除法写成 `a=Δv/Δt`；显示 `v_0=5m/s`；把 `Δv` 合并进单个 `<mi>`；在全局样式中把 `sub`/`sup` 都设为 `1em` 的等大角标；Canvas/SVG 公式没有等价语义文本。
````

同时从现行视觉标准第 3.3 节和第 6.2 节删除全局 `sub/sup` 等大字号规则；只在公式作用域示例中保留合规的 `max(var(--type-11), .75em)`。将原维护规则顺延为第10节，并更新第0节内容清单和维护日期说明。

- [ ] **Step 7: 运行视觉标准契约并确认通过**

```bash
/Users/luogaowei/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test --test-name-pattern='视觉标准' tests/unified-animation-standards.test.mjs
```

Expected: PASS。

- [ ] **Step 8: 检查视觉文档格式和旧称**

```bash
git diff --check -- 'docs/物理动画视觉标准-v1.md'
if rg -n '自动演示' 'docs/物理动画视觉标准-v1.md'; then
  exit 1
fi
rg -n -C 2 'v_0|r_0' 'docs/物理动画视觉标准-v1.md'
```

Expected: `git diff --check` 成功；旧称守卫以退出码 0 结束且无输出。第二条 `rg` 必须以退出码 0 命中，并人工确认所有上下文只位于 `### 9.8 错误示例`；它不是“出现即通过”的机械检查。Task 1 的 `beforeErrorExamples` 反向契约同时保证该标题之前没有 `v_0` 或 `r_0`。

- [ ] **Step 9: 提交视觉标准**

```bash
git add 'docs/物理动画视觉标准-v1.md'
git diff --cached -- 'docs/物理动画视觉标准-v1.md'
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
/Users/luogaowei/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test --test-name-pattern='AGENTS' tests/unified-animation-standards.test.mjs
```

Expected: FAIL，当前文件仍引用外部附件和“自动演示”。

- [ ] **Step 2: 用精简内容替换AGENTS**

使用 `apply_patch` 将文件整理为以下完整内容：

```markdown
# 项目协作约定

## 必读规范

- 每次新建、改版或修复物理动画前，完整阅读并遵守 `docs/物理动画统一制作规范-v1.md`。
- 同时完整阅读并遵守 `docs/物理动画视觉标准-v1.md`；具体视觉位置、颜色、字号、公式和动效只以该文件为准。
- 当前任务需要偏离任一规范时，先列出偏离项、教学必要性和影响，取得教师确认后再实施。

## 项目红线

- 动画直接面向高中生自主学习，兼容教师课堂演示；页面不得显示开发术语、版本信息或审批信息。
- 每个动画只设一个主教学目标，最多一个直接服务主目标的辅助目标。
- 新动画和重大改版先审查并提出二到四个有明显差异的方向与AI推荐，教师确认后制作；增量修改和明确小修复按统一制作规范缩短流程。
- 已有项目优先增量修改和模块复用；未经确认不得整体重写、改变既有视觉语言、核心交互或数据结构。
- 项目统一使用“引导演示”：步骤由学生主动推进，`替我操作`只能由学生主动点击，系统不得通过定时器自动操作或自动跨步。
- 页面外壳、入口、控制、焦点、公式、触控和响应式一律遵守视觉标准；主场景默认最多同时突出两组核心物理信息。
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
/Users/luogaowei/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test --test-name-pattern='AGENTS' tests/unified-animation-standards.test.mjs
```

Expected: PASS。

- [ ] **Step 4: 确认外部附件和旧称已移除**

```bash
if rg -n '\.codex/attachments|自动演示|235181b3-b39e-4217-abf1-b37333008bab' AGENTS.md; then
  exit 1
fi
```

Expected: 守卫以退出码 0 结束且无输出；任何旧依赖或旧称命中即显示匹配并以退出码 1 失败。

- [ ] **Step 5: 提交AGENTS入口**

```bash
git add AGENTS.md
git diff --cached -- AGENTS.md
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
/Users/luogaowei/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/unified-animation-standards.test.mjs
```

Expected: 5 tests PASS，0 FAIL（其中包含独立的公式语义与无障碍契约）。

- [ ] **Step 2: 运行现有仓库测试，确认规范改动未影响动画基线**

```bash
/Users/luogaowei/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/*.test.mjs
```

Expected: 所有现有测试PASS，0 FAIL。若现有动画测试本身与当前工作树不一致，记录原始失败证据，不为通过规范任务而修改动画文件。

- [ ] **Step 3: 检查三份规范的旧依赖、旧称和格式**

```bash
if rg -n '\.codex/attachments|235181b3-b39e-4217-abf1-b37333008bab|自动演示' AGENTS.md 'docs/物理动画统一制作规范-v1.md' 'docs/物理动画视觉标准-v1.md'; then
  exit 1
fi
git diff --check HEAD
```

Expected: 旧依赖/旧称守卫以退出码 0 结束且无输出；`git diff --check` 成功。

- [ ] **Step 4: 核对设计要求覆盖**

逐项核对并在终端记录命中位置：

```bash
rg -n '五阶段制作流程|任务审查|制作决策|模型与原型|正式制作|验证交付|学生主动点击下一步|观察步骤.*不显示|同一动作模块|唯一实验状态|真实完成条件|一次完整最低验收|定向复查|主流程冒烟|`EDU`.*单一目标.*单一观察焦点.*静音自主学习|`PHY`.*公式.*单位.*状态转换.*临界条件.*倍速不改变结果|`GUIDE`.*学生推进.*学生主动.*替我操作.*真实状态门控.*恢复状态.*安全拖动|`VIS`.*标题.*入口.*舞台控制条.*字号.*触控.*公式.*光影品质|`RESP`.*宽屏.*横屏平板.*窄屏.*短横屏|1180×820|1024×768|960×768|960×540|390×844|生成并保存同尺寸截图.*人工对比.*模型.*材质.*光照.*阴影.*空间层次' 'docs/物理动画统一制作规范-v1.md'
rg -n '引导演示与实验指南入口|主舞台底部控制条|紫色重点观察光晕|由内向外|由浓到淡|position: relative|position: absolute|z-index|pointer-events: none|prefers-reduced-motion|静态紫色边框|公式、物理量与上下角标|数学除法语义|单位字符串|<mfrac>|<msub>|<msup>|<msubsup>|<mover|11 CSS px|原生 MathML|measureText|DOM 等价文本|aria-labelledby|不换行间距' 'docs/物理动画视觉标准-v1.md'
if rg -n 'sub, sup \{ font-size: 1em; \}|<mi>Δv</mi>|<mi>Δt</mi>' 'docs/物理动画视觉标准-v1.md'; then
  exit 1
fi
```

Expected: 前两条中每个要求至少有一个清楚命中位置；最后一个守卫以退出码 0 结束且无输出。程序式文本的错误示例仍按 Task 3 Step 8 的标题边界人工复核，不能被当作正向规则。

- [ ] **Step 5: 更新设计规格状态**

使用 `apply_patch` 将设计规格顶部：

```markdown
- 状态：教师已逐节确认；实施计划已按公式、运行时、隔离工作树和迁移审查修订，待执行
```

改为：

```markdown
- 状态：教师已确认，统一规范已实施并通过文档契约验证
```

- [ ] **Step 6: 提交实施状态**

```bash
git add 'docs/superpowers/specs/2026-08-11-unified-physics-animation-production-standard-design.md'
git diff --cached -- 'docs/superpowers/specs/2026-08-11-unified-physics-animation-production-standard-design.md'
git commit -m "docs: mark unified animation standards implemented"
```

- [ ] **Step 7: 按路径和 SHA 最终核对提交与工作树**

```bash
git log --oneline -- tests/unified-animation-standards.test.mjs
git log --oneline -- 'docs/物理动画统一制作规范-v1.md'
git log --oneline -- 'docs/物理动画视觉标准-v1.md'
git log --oneline -- AGENTS.md
git log --oneline -- 'docs/superpowers/specs/2026-08-11-unified-physics-animation-production-standard-design.md'
git status --short
```

Expected: 每个目标路径的 `git log` 输出包含对应任务记录的 SHA；工作树只含本轮预期改动。不得以全仓库最近提交的排列作为正确性证据。

## Execution Handoff

实施时从当前工作树内容出发，保留教师已经加入 `AGENTS.md` 和视觉标准第8节的未提交草案。每次只暂存任务列出的文件，禁止使用重置或覆盖命令处理现有修改。
