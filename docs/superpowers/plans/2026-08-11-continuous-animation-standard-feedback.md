# Continuous Animation Standard Feedback Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让所有后续动画强制遵守 `main` 中的统一标准，同时建立“默认只改当前动画、教师明确确认后才升级全项目标准”的持续反馈闭环。

**Architecture:** `AGENTS.md` 只新增反馈范围红线；`docs/物理动画统一制作规范-v1.md` 是反馈状态、标准升级和验证流程的唯一详细权威；现有 Node 文档契约防止范围判定与生效条件回退。全部内容在现有 `codex/unified-animation-standards` 分支和 PR #1 中完成，通过后合并远端 `main`，再以命名 stash 保护本地主工作区两份旧草案并快进同步。

**Tech Stack:** Markdown、Node.js `node:test`、Git、GitHub CLI、现有 Git worktree。

## Global Constraints

- 教师反馈未明确推广时，默认只修改当前动画。
- 只有教师明确表达“以后都这样”“升级为项目标准”或同等含义，才进入全项目标准候选。
- 标准候选先在当前动画验证；教师确认效果后才形成正式条文。
- 新规则只有在权威文件、契约测试、版本记录和 PR 全部完成并合并进 `main` 后才正式生效。
- 每轮当前动画调整只做定向复查和一次主流程冒烟，不重复完整最低验收。
- 标准升级不触发旧动画批量迁移；旧动画再次修改时才应用最新版。
- `AGENTS.md` 只保留入口和红线；本轮不修改 `docs/物理动画视觉标准-v1.md`。
- 固定 Node 运行时：`/Users/luogaowei/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node`。
- 唯一写入工作树：`/Users/luogaowei/Documents/代码保存仓库/动画制作/.worktrees/unified-animation-standards`，分支 `codex/unified-animation-standards`。
- 主工作区 `/Users/luogaowei/Documents/代码保存仓库/动画制作` 的未提交文件不得清理、重置或覆盖。
- 本地同步前只将两份重叠的已跟踪草案放入命名 stash；未跟踪文档和 `outputs/` 原地保留；stash 不自动删除。

---

### Task 1: 建立持续反馈与标准升级契约

**Files:**
- Modify: `tests/unified-animation-standards.test.mjs`

**Interfaces:**
- Consumes: 现有 `readStandard()`、`paths.agents`、`paths.production` 和五项统一规范契约。
- Produces: `feedbackSection` 文档片段契约；Tasks 2–3 必须使其与 AGENTS 反馈红线转绿。

- [ ] **Step 1: 在 AGENTS 契约中加入反馈范围红线**

在 `AGENTS points to the two in-repo authorities and keeps only project red lines` 测试中加入：

```js
assert.match(agents, /教师反馈[^\n]*默认[^\n]*当前动画/);
assert.match(agents, /明确[^\n]*以后都这样[^\n]*项目标准/);
```

- [ ] **Step 2: 在统一制作规范契约中加入反馈状态与生效条件**

在统一制作规范测试读取 `production` 后加入：

```js
const feedbackSection = production
  .split('## 11. 教师持续反馈与标准升级')[1]
  ?.split('## 12. 明确不做')[0] ?? '';

assert.match(feedbackSection, /未明确[^\n]*默认[^\n]*当前动画/);
assert.match(feedbackSection, /以后都这样[^\n]*标准候选/);
assert.match(feedbackSection, /当前动画[^\n]*验证/);
assert.match(feedbackSection, /教师确认[^\n]*正式条文/);
assert.match(feedbackSection, /不重复[^\n]*完整最低验收/);
assert.match(feedbackSection, /定向复查[^\n]*主流程冒烟/);
assert.match(feedbackSection, /同尺寸[^\n]*前后截图/);
assert.match(feedbackSection, /还需要[^\n]*截图[^\n]*想法/);
assert.match(feedbackSection, /教师最新明确确认[^\n]*旧规则/);
assert.match(feedbackSection, /项目红线[^\n]*冲突[^\n]*明确确认/);
assert.match(feedbackSection, /合并[^\n]*main[^\n]*正式生效/);
assert.match(feedbackSection, /不[^\n]*批量[^\n]*旧动画/);
assert.match(production, /^# 物理动画统一制作规范 v1\.1$/m);
assert.match(production, /本文当前版本为 v1\.1/);
```

- [ ] **Step 3: 运行定向测试并确认 RED**

```bash
/Users/luogaowei/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test --test-name-pattern='AGENTS|统一制作规范' tests/unified-animation-standards.test.mjs
```

Expected: 两项定向测试失败。AGENTS 缺少反馈红线；统一制作规范缺少第 11 节和 `v1.1`；不得出现语法或运行时错误。

- [ ] **Step 4: 检查测试语法和差异**

```bash
/Users/luogaowei/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --check tests/unified-animation-standards.test.mjs
git diff --check
git diff -- tests/unified-animation-standards.test.mjs
```

Expected: 语法和格式通过；差异只包含反馈契约。

- [ ] **Step 5: 提交失败契约**

```bash
git add tests/unified-animation-standards.test.mjs
git diff --cached --check
git diff --cached -- tests/unified-animation-standards.test.mjs
git commit -m "test: define continuous animation feedback contract"
```

---

### Task 2: 在统一制作规范中加入持续反馈闭环

**Files:**
- Modify: `docs/物理动画统一制作规范-v1.md`

**Interfaces:**
- Consumes: Task 1 的 `feedbackSection` 契约和现有第 10～12 节结构。
- Produces: v1.1 规范、第 11 节反馈治理流程、顺延后的“明确不做”和“标准维护”。

- [ ] **Step 1: 复跑统一制作规范定向测试并确认仍为 RED**

```bash
/Users/luogaowei/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test --test-name-pattern='统一制作规范' tests/unified-animation-standards.test.mjs
```

Expected: 仅统一制作规范定向测试失败，失败原因是缺少第 11 节与 v1.1 标记。

- [ ] **Step 2: 升级标题并插入持续反馈章节**

把首行改为：

```markdown
# 物理动画统一制作规范 v1.1
```

在当前第 10 节之后、原第 11 节之前插入以下完整章节：

```markdown
## 11. 教师持续反馈与标准升级

教师可以在查看实际动画后随时提出不满意和调整意见，没有反馈轮数限制。反馈未明确要求推广时，默认只修改当前动画，不自动改变全项目标准。

### 11.1 当前动画调整

“这个动画这里改一下”等反馈只影响当前目标文件。Codex 动手前简短复述不满意点、影响范围、不会改变的锁定内容和定向验证范围；修改采用增量方式，不重新启动完整策划。每轮不重复完整最低验收，只定向复查受影响功能并快速走一次主流程冒烟。需要视觉判断时提供同尺寸前后截图；现有资料不足时，直接向教师说明还需要的截图和想法。

### 11.2 全项目标准候选

教师明确表达“以后都这样”“升级为项目标准”或同等含义时，该反馈才进入全项目标准候选。候选先在当前动画中验证；教师确认当前动画效果后，Codex 再整理正式条文、适用范围、与旧规则的关系和回退边界。

### 11.3 规则归属与正式生效

教学流程、学生操作、唯一状态和验收变化写入本文；颜色、布局、字号、公式、光晕、引导卡、触控和响应式变化写入视觉标准；项目必读入口和红线写入 `AGENTS.md`；题型特例只写当前动画的制作决策或修改说明。

教师最新明确确认高于旧规则，并可以发起对旧规则的修订；涉及项目红线变化时，Codex 必须先说明冲突和影响，取得教师明确确认后再继续。

全项目规则必须同步更新唯一权威文件、契约测试和版本记录，完成定向验证与仓库全量回归，并通过 Pull Request 合并进 `main` 后才正式生效。在合并前，其他 Codex 不得把候选做法当作强制标准。

标准升级不批量迁移旧动画；旧动画以后再次修改时才应用最新版。撤销既有标准时走同一确认、测试和合并流程，并说明替代关系。
```

- [ ] **Step 3: 顺延后续章节并更新维护记录**

把原 `## 11. 明确不做` 改为 `## 12. 明确不做`，把原 `## 12. 标准维护` 改为 `## 13. 标准维护`。在标准维护节把当前版本说明更新为：

```markdown
本文当前版本为 v1.1。2026-08-11 增加教师持续反馈、当前动画调整和全项目标准升级机制；文件路径继续作为 v1 主版本系列的稳定入口。
```

- [ ] **Step 4: 运行定向测试与文档守卫并确认 GREEN**

```bash
/Users/luogaowei/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test --test-name-pattern='统一制作规范' tests/unified-animation-standards.test.mjs
rg -n '教师持续反馈与标准升级|默认只修改当前动画|全项目标准候选|主流程冒烟|同尺寸前后截图|还需要的截图和想法|项目红线变化|合并进 `main` 后才正式生效|本文当前版本为 v1\.1' docs/物理动画统一制作规范-v1.md
if rg -n '^## 11\. 明确不做|^## 12\. 标准维护|批量迁移旧动画$' docs/物理动画统一制作规范-v1.md; then exit 1; fi
git diff --check
```

Expected: 定向测试通过；正向检索覆盖全部新规则；负向守卫无输出并以整个 `if` 命令成功结束；差异格式通过。

- [ ] **Step 5: 人工核对规则职责**

确认本文只描述反馈范围、验证状态、生效流程与文件归属；本轮不把颜色、公式、光晕或响应式细节复制进本文，也不修改视觉标准。

- [ ] **Step 6: 提交统一制作规范升级**

```bash
git add docs/物理动画统一制作规范-v1.md
git diff --cached --check
git diff --cached -- docs/物理动画统一制作规范-v1.md
git commit -m "docs: add continuous teacher feedback workflow"
```

---

### Task 3: 在 AGENTS 中加入反馈范围红线

**Files:**
- Modify: `AGENTS.md`

**Interfaces:**
- Consumes: Task 2 已建立的详细反馈流程。
- Produces: 每个后续 Codex 启动动画任务时都会读取的最小反馈范围红线。

- [ ] **Step 1: 复跑 AGENTS 定向测试并确认仍为 RED**

```bash
/Users/luogaowei/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test --test-name-pattern='AGENTS' tests/unified-animation-standards.test.mjs
```

Expected: AGENTS 定向测试失败，且只缺少“默认当前动画”和“明确以后都这样才升级项目标准”两项语义。

- [ ] **Step 2: 添加单条项目级红线**

在 `## 本地网页预览` 之前加入：

```markdown
- 教师反馈未明确要求推广时，默认只修改当前动画；只有教师明确表示“以后都这样”或“升级为项目标准”，且当前动画效果已经确认后，才按统一制作规范更新项目标准、契约测试和版本记录。
```

不要在 `AGENTS.md` 重复反馈轮数、定向验收、PR 流程或文件职责等详细说明；这些内容继续由统一制作规范唯一维护。

- [ ] **Step 3: 运行 AGENTS 定向测试和完整契约并确认 GREEN**

```bash
/Users/luogaowei/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test --test-name-pattern='AGENTS' tests/unified-animation-standards.test.mjs
/Users/luogaowei/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/unified-animation-standards.test.mjs
if rg -n '没有反馈轮数限制|主流程冒烟|Pull Request|规则归属' AGENTS.md; then exit 1; fi
git diff --check
```

Expected: AGENTS 定向测试通过；统一规范契约 5/5 通过；负向守卫无输出并成功结束；格式通过。

- [ ] **Step 4: 人工核对入口效果**

确认 `AGENTS.md` 仍要求新动画先读取两份仓库内权威，即统一制作规范与视觉标准；新增红线能够让后续 Codex 判定“当前动画调整”与“全项目标准候选”，但不形成第三份详细标准。

- [ ] **Step 5: 提交 AGENTS 红线**

```bash
git add AGENTS.md
git diff --cached --check
git diff --cached -- AGENTS.md
git commit -m "docs: add teacher feedback scope red line"
```

---

### Task 4: 完成回归验证并更新设计状态

**Files:**
- Modify: `docs/superpowers/specs/2026-08-11-continuous-animation-standard-feedback-design.md`

**Interfaces:**
- Consumes: Tasks 1–3 的测试、规范和 AGENTS 红线。
- Produces: 可审计的完成状态；不改动任何产品动画或视觉标准。

- [ ] **Step 1: 运行统一规范契约与仓库全量测试**

```bash
/Users/luogaowei/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/unified-animation-standards.test.mjs
/Users/luogaowei/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/*.test.mjs
```

Expected: 统一规范契约 5/5 通过；仓库全量测试 51/51 通过。若实际测试总数因独立新增测试而变化，以“全部通过且零失败”为硬条件，并在交付说明中记录新总数。

- [ ] **Step 2: 运行正向覆盖与负向边界守卫**

```bash
rg -n '默认只修改当前动画|以后都这样|全项目标准候选|教师确认|主流程冒烟|同尺寸前后截图|还需要的截图和想法|项目红线变化|合并进 `main` 后才正式生效|不批量迁移旧动画|v1\.1' AGENTS.md docs/物理动画统一制作规范-v1.md tests/unified-animation-standards.test.mjs
if rg -n '教师持续反馈与标准升级|默认只修改当前动画|全项目标准候选|主流程冒烟|v1\.1' docs/物理动画视觉标准-v1.md; then exit 1; fi
git diff --check
git status --short
```

Expected: 正向覆盖命中三类权威/契约文件；视觉标准负向守卫无输出并成功结束；格式通过；状态中只出现设计状态文件的待提交修改。

- [ ] **Step 3: 人工核对已批准的反馈状态机**

逐条确认：

1. 普通不满意反馈默认只修改当前动画。
2. Codex 动手前复述不满意点、影响范围、锁定内容和验证范围。
3. 当前动画每轮只做定向复查和一次主流程冒烟。
4. 视觉判断提供同尺寸前后截图；材料不足时直接询问教师还需要的截图和想法。
5. 明确“以后都这样”才进入标准候选。
6. 候选先在当前动画验证，教师确认后才写正式规则。
7. 触碰项目红线时先说明冲突和影响，取得教师明确确认后再继续。
8. 规则通过权威文件、契约、版本和 PR 合并 `main` 后才生效。
9. 不批量改旧动画，旧动画再次修改时才应用新版。

- [ ] **Step 4: 更新设计规格状态**

把：

```markdown
- 状态：教师已逐节确认，待实施计划
```

替换为：

```markdown
- 状态：教师已确认，持续反馈机制已实施并通过文档契约验证
```

- [ ] **Step 5: 提交完成状态并检查分支**

```bash
git add docs/superpowers/specs/2026-08-11-continuous-animation-standard-feedback-design.md
git diff --cached --check
git diff --cached -- docs/superpowers/specs/2026-08-11-continuous-animation-standard-feedback-design.md
git commit -m "docs: mark continuous feedback mechanism implemented"
git status --short
git log --oneline -6
```

Expected: 提交只包含设计规格状态行；功能分支工作树和暂存区均干净。

---

### Task 5: 更新 PR、合并远端 main 并安全同步本地主工作区

**Files:**
- Remote update: Pull Request `#1` in `1157290843-crypto/--2`
- Local state only: `/Users/luogaowei/Documents/代码保存仓库/动画制作`

**Interfaces:**
- Consumes: 已验证且干净的 `codex/unified-animation-standards` 分支。
- Produces: 远端 `main` 的正式标准、本地主工作区快进后的 `main`、一条保留旧草案的命名 stash。

- [ ] **Step 1: 推送功能分支并核对 PR 合并条件**

```bash
git status --short
git push origin codex/unified-animation-standards
gh pr view 1 --repo 1157290843-crypto/--2 --json number,state,baseRefName,headRefName,mergeable,url
```

Expected: 功能分支工作树干净并推送成功；PR #1 为 `OPEN`，base 为 `main`，head 为 `codex/unified-animation-standards`，`mergeable` 为 `MERGEABLE`。

- [ ] **Step 2: 在 PR 记录反馈机制验证结果**

```bash
gh pr comment 1 --repo 1157290843-crypto/--2 --body "持续反馈机制已加入：教师反馈默认只修改当前动画；明确‘以后都这样’后，先验证当前动画，再更新规范、契约和版本。统一规范契约 5/5、仓库全量测试 51/51 通过。"
```

Expected: 评论成功创建。若 Task 4 的全量测试总数不再是 51，先把评论中的数字改成 fresh evidence，不得提交过期结果。

- [ ] **Step 3: 合并 PR 并把远端默认分支设为 main**

```bash
gh pr merge 1 --repo 1157290843-crypto/--2 --merge
gh repo edit 1157290843-crypto/--2 --default-branch main
gh pr view 1 --repo 1157290843-crypto/--2 --json state,mergedAt,mergeCommit,url
gh repo view 1157290843-crypto/--2 --json defaultBranchRef
```

Expected: PR 状态为 `MERGED` 且存在 merge commit；远端默认分支为 `main`。任一项不成立都停止，不进入本地主工作区同步。

- [ ] **Step 4: 在临时 worktree 独立验证远端 main**

```bash
git fetch origin main
ANIMATION_VERIFY_PARENT=$(mktemp -d /tmp/animation-main-verify.XXXXXX)
git worktree add --detach "$ANIMATION_VERIFY_PARENT/main" origin/main
/Users/luogaowei/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test "$ANIMATION_VERIFY_PARENT/main/tests/"*.test.mjs
git worktree remove "$ANIMATION_VERIFY_PARENT/main"
rmdir "$ANIMATION_VERIFY_PARENT"
```

Expected: 远端 `main` 的全部测试零失败（当前基线为 51/51）。若验证失败，保留本地主工作区原状并先修复远端标准分支；不要继续以下步骤。

- [ ] **Step 5: 只保护本地主工作区两份重叠草案**

```bash
ANIMATION_PROJECT_ROOT='/Users/luogaowei/Documents/代码保存仓库/动画制作'
git -C "$ANIMATION_PROJECT_ROOT" branch --show-current
git -C "$ANIMATION_PROJECT_ROOT" status --short
git -C "$ANIMATION_PROJECT_ROOT" diff -- AGENTS.md 'docs/物理动画视觉标准-v1.md'
git -C "$ANIMATION_PROJECT_ROOT" stash push -m 'pre-unified-standards-local-drafts-2026-08-11' -- AGENTS.md 'docs/物理动画视觉标准-v1.md'
git -C "$ANIMATION_PROJECT_ROOT" stash list --format='%gd %s'
git -C "$ANIMATION_PROJECT_ROOT" status --short
```

Expected: 当前分支为 `main`；命名 stash 已保存且不自动应用、不删除；只有两份已跟踪重叠草案进入 stash。未跟踪的 `docs/物理动画类型与交互逻辑标准-v1.md` 和 `outputs/` 仍原地保留。若分支不是 `main`，或状态中出现未预期的已跟踪修改，立即停止并报告，不执行 stash 或 merge。

- [ ] **Step 6: 快进本地 main 并复跑全量测试**

```bash
git -C "$ANIMATION_PROJECT_ROOT" fetch origin main
git -C "$ANIMATION_PROJECT_ROOT" merge --ff-only origin/main
/Users/luogaowei/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test "$ANIMATION_PROJECT_ROOT/tests/"*.test.mjs
git -C "$ANIMATION_PROJECT_ROOT" status --short
git -C "$ANIMATION_PROJECT_ROOT" log -1 --oneline
git -C "$ANIMATION_PROJECT_ROOT" stash list --format='%gd %s'
```

Expected: 本地 `main` 快进到远端合并结果；全量测试零失败；未跟踪文件仍存在；命名 stash 仍保留。

- [ ] **Step 7: 验证后续动画入口已经正式激活**

```bash
rg -n '物理动画统一制作规范-v1\.md|物理动画视觉标准-v1\.md|默认只修改当前动画|以后都这样' "$ANIMATION_PROJECT_ROOT/AGENTS.md"
rg -n '^# 物理动画统一制作规范 v1\.1$|^## 11\. 教师持续反馈与标准升级$|合并进 `main` 后才正式生效|不批量迁移旧动画' "$ANIMATION_PROJECT_ROOT/docs/物理动画统一制作规范-v1.md"
```

Expected: `main` 中的 AGENTS 必读入口和反馈红线全部命中；统一制作规范 v1.1 的反馈闭环全部命中。此时未来新建、改版或修复动画的 Codex 才会按新机制工作。
