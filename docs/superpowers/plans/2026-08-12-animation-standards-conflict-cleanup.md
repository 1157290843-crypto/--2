# Animation Standards Conflict Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将交互类型与拆分判断完整并入唯一制作规范，清除会重新引入旧要求的文件和工作树入口，同时保留所有尚未合并的动画成果。

**Architecture:** 在隔离分支中先用 Node 文档契约锁定 v1.2 的六种载体、八类主类型、主交互闭环、拆分硬规则和物理播放边界，再最小扩展统一制作规范并通过 Pull Request 合入 `main`。合并后按 Git 祖先关系分级处理旧工作树；只有全部保留工作树不再引用旧提示词，才把两份旧源文件移动到废纸篓。旧 stash 保留为历史备份，不整体恢复。

**Tech Stack:** Markdown、Node.js `node:test`、Git、GitHub CLI、Git worktree、macOS 废纸篓。

## Global Constraints

- 运行时权威始终只有根目录 `AGENTS.md`、统一制作规范和视觉标准三层；`AGENTS.md` 的必读文档仍只有两份正式规范。
- 统一制作规范升级为 v1.2，并成为载体判断、主类型、交互闭环和拆分规则的唯一权威。
- 不复制已有的单一目标、无声音、引导演示、视觉位置、公式和光晕规则。
- “物理过程自动播放”只推进当前教学步骤内的物理时间，不得自动推进教学步骤或恢复旧称“自动演示”。
- 不修改任何动画页面、物理模型、实验装置、公式呈现、视觉效果、素材或数据。
- 固定 Node 运行时：`/Users/luogaowei/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node`。
- 实现工作树：`/Users/luogaowei/Documents/代码保存仓库/动画制作/.worktrees/standards-conflict-cleanup`；分支：`codex/standards-conflict-cleanup`。
- 主工作区的未跟踪类型标准和 `outputs/` 在 Pull Request 合并前不得移动或覆盖。
- `stash@{0}` 的命名备份不得整体 `apply`、`pop` 或删除。
- 删除候选均使用显式绝对路径并重新验证；旧源文件只移动到废纸篓。

---

### Task 1: 建立隔离实现工作树与干净基线

**Files:**
- Read: `AGENTS.md`
- Read: `docs/物理动画统一制作规范-v1.md`
- Read: `docs/物理动画视觉标准-v1.md`
- Read: `docs/superpowers/specs/2026-08-12-animation-standards-conflict-cleanup-design.md`

**Interfaces:**
- Consumes: 已确认设计、当前 `main`、固定 Node 运行时。
- Produces: 隔离分支和 51/51 通过的测试基线。

- [ ] **Step 1: 确认仓库边界并保护用户文件**

```bash
project_root='/Users/luogaowei/Documents/代码保存仓库/动画制作'
git_dir=$(cd "$(git -C "$project_root" rev-parse --git-dir)" && pwd -P)
git_common=$(cd "$(git -C "$project_root" rev-parse --git-common-dir)" && pwd -P)
test "$git_dir" = "$git_common"
test "$(git -C "$project_root" branch --show-current)" = 'main'
git -C "$project_root" status --short
test -f "$project_root/docs/物理动画类型与交互逻辑标准-v1.md"
test -d "$project_root/outputs"
```

Expected: 主工作区只有已知的两个未跟踪项；不清理、不暂存它们。

- [ ] **Step 2: 验证工作树目录被忽略并创建隔离分支**

```bash
git -C "$project_root" check-ignore -q .worktrees
git -C "$project_root" worktree add \
  "$project_root/.worktrees/standards-conflict-cleanup" \
  -b codex/standards-conflict-cleanup main
```

- [ ] **Step 3: 完整阅读任务权威并运行基线**

```bash
worktree="$project_root/.worktrees/standards-conflict-cleanup"
sed -n '1,240p' "$worktree/AGENTS.md"
sed -n '1,240p' "$worktree/docs/物理动画统一制作规范-v1.md"
sed -n '1,1200p' "$worktree/docs/物理动画视觉标准-v1.md"
sed -n '1,180p' "$worktree/docs/superpowers/specs/2026-08-12-animation-standards-conflict-cleanup-design.md"
cd "$worktree"
/Users/luogaowei/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test
```

Expected: 51 tests pass, 0 fail；实现工作树干净。

---

### Task 2: 用失败契约锁定交互分类与拆分规则

**Files:**
- Modify: `tests/unified-animation-standards.test.mjs`

**Interfaces:**
- Consumes: 现有 `readStandard('production')` 和五项统一规范契约。
- Produces: v1.2 版本契约和一项新的分类/拆分契约；Task 3 必须使它们转绿。

- [ ] **Step 1: 把现有版本断言改为 v1.2**

```js
assert.match(production, /^# 物理动画统一制作规范 v1\.2$/m);
assert.match(production, /本文当前版本为 v1\.2/);
```

- [ ] **Step 2: 新增载体、八类主类型和拆分契约**

```js
test('统一制作规范 selects one carrier and one interaction type before applying split rules', () => {
  const production = readStandard('production');
  const decisionSection = production
    .split('## 4. 教学目标、功能预算与主动做减法')[1]
    ?.split('## 5. 物理模型、参数分类与唯一实验状态')[0] ?? '';

  for (const carrier of [
    '独立成品', '同内核独立成品', '嵌入教学步骤',
    '静态题卡', '暂缓待补', '成版排除'
  ]) assert.match(decisionSection, new RegExp(carrier));

  for (const type of [
    '过程演示型', '状态互动型', '参数探究型', '图像联动型',
    '模型建构型', '空间观察型', '虚拟实验型', '题目推演型'
  ]) assert.match(decisionSection, new RegExp(type));

  assert.match(decisionSection, /八类主类型[\s\S]{0,120}不设置第九类/);
  assert.match(decisionSection, /非独立动画[\s\S]{0,120}不是第九种/);
  assert.match(decisionSection, /两个不同主问题[\s\S]{0,100}必须拆分/);
  assert.match(decisionSection, /两种不同主交互[\s\S]{0,100}必须拆分/);
  assert.match(decisionSection, /两套不同物理状态机[\s\S]{0,260}四个以上主要参数[\s\S]{0,260}两张以上[\s\S]{0,260}任意两项[\s\S]{0,100}原则上必须拆分/);
  assert.match(decisionSection, /每个成品最多选择一个辅助机制/);
  assert.match(decisionSection, /主类型[\s\S]{0,120}必备闭环[\s\S]{0,120}不得重复登记/);
  assert.match(decisionSection, /物理过程自动播放[\s\S]{0,180}当前教学步骤内[\s\S]{0,180}不得自动[\s\S]{0,80}教学步骤/);
  assert.match(decisionSection, /建议载体[\s\S]{0,180}主类型[\s\S]{0,180}学生主要操作[\s\S]{0,180}唯一观察焦点/);
  assert.doesNotMatch(decisionSection, /全项目无声音|浮动引导卡|#[0-9a-f]{6}/i);
});
```

- [ ] **Step 3: 运行定向测试并确认 RED**

```bash
node_bin='/Users/luogaowei/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node'
"$node_bin" --test --test-name-pattern='统一制作规范' tests/unified-animation-standards.test.mjs
```

Expected: 两项统一制作规范测试失败；失败原因分别为版本仍为 v1.1、缺少载体与类型条文，不得出现语法错误。

- [ ] **Step 4: 检查并提交 RED 契约**

```bash
"$node_bin" --check tests/unified-animation-standards.test.mjs
git diff --check
git diff -- tests/unified-animation-standards.test.mjs
git add tests/unified-animation-standards.test.mjs
git diff --cached --check
git commit -m 'test: define interaction type and split decision contract'
```

---

### Task 3: 将独有交互与拆分判断并入统一制作规范 v1.2

**Files:**
- Modify: `docs/物理动画统一制作规范-v1.md`

**Interfaces:**
- Consumes: Task 2 的 `decisionSection` 契约和已确认清理设计。
- Produces: 唯一正式的载体、主类型、交互闭环、拆分与辅助机制条文。

- [ ] **Step 1: 复跑新契约并确认仍为 RED**

```bash
"$node_bin" --test --test-name-pattern='统一制作规范 selects' tests/unified-animation-standards.test.mjs
```

- [ ] **Step 2: 升级版本并扩展第4节**

将标题升级为 `# 物理动画统一制作规范 v1.2`。保留现有功能预算两段，并追加：

- `4.1 动画化价值与载体判断`：六种载体只选一种；动态或交互不能提供静态图无法替代的信息时不立项；非独立动画不是第九种主类型。
- `4.2 八类主类型与主交互闭环`：使用下表作为正式内容。
- `4.3 拆分硬规则`：写入两条硬判断和底层内核复用边界。
- `4.4 辅助机制与制作决策单`：最多一个辅助机制，并记录完整决策字段。

```markdown
| 主类型 | 主要学习障碍与唯一主操作 | 主交互闭环 | 拆分边界 |
|---|---|---|---|
| 过程演示型 | 看不清连续过程；播放、暂停或单步 | 确定初态→学生启动物理过程→关键节点暂停→观察唯一因果关系→局部回放→结论 | 第二个情境引入新因果链或新状态机时拆分。 |
| 状态互动型 | 分不清离散条件、约束或参考系；切换或拖动一个条件 | 先判断→改变一个条件→重算唯一状态→高亮变化→对照判断 | 两个开关分别服务不同概念目标时拆分。 |
| 参数探究型 | 不清楚一个变量关系；只改变本次操纵自变量 | 预测→设置自变量和锁定条件→运行→保存结果→只改变该自变量→对比→结论 | 更换研究自变量或因变量时拆成同内核独立成品。 |
| 图像联动型 | 难以对应过程、状态与函数图像；拖动唯一游标 | 场景或图像定位→另一端同步→高亮一条关系→反向操作验证 | 每个成品只突出一条主要图像关系。 |
| 模型建构型 | 难以从情境建立二维模型；选择对象并放置坐标或矢量 | 观察→选对象→去背景→放坐标或矢量→检查方向与约束→形成模型→验证 | 不同研究对象或不同建模方法形成独立任务。 |
| 空间观察型 | 存在三维方向、遮挡或投影歧义；有限旋转或切换预设视角 | 标准视角→有限观察→锁定空间关系→显示投影、剖面或分量→转成二维表达 | 空间观察和参数探究都很重时拆分。 |
| 虚拟实验型 | 难在装置操作、读数、控制变量、数据或误差；亲手完成实验 | 检查仪器→设置一个自变量→操作与读数→重复采数→处理数据→分析误差→回看预测 | 操作、数据处理和误差分析各自超过三至五分钟时拆分。 |
| 题目推演型 | 难以识别关键阶段、临界条件或转折；标记对象和事件 | 必要题干→标记对象与阶段→预测事件→运行到关键帧→转二维模型→完成一处核心推理→验证 | 存在两个可独立教学的关键过程时拆分或只保留一个。 |
```

物理播放条文必须明确：只推进当前教学步骤内的真实物理时间；学生可以暂停、单步、改变倍速或接管；到达本步完成边界后等待学生主动推进；不得恢复旧称“自动演示”。

拆分条文必须包含：两个不同主问题或两种不同主交互任一出现即必须拆分；两套状态机、四个以上主要参数、两张以上长期主图、频繁切换对象/场景/解法、同一按钮跨模式变义、预计超过十分钟六项中命中任意两项时原则上必须拆分。

制作决策单记录：建议载体、唯一主类型、零到一个辅助机制、单一主问题、学生主要操作、唯一观察焦点、表现维度、物理时间控制、可编辑与锁定条件、图像必要性、优先删除项、物理风险和可复用内核。

- [ ] **Step 3: 更新阶段二引用和维护记录**

```markdown
本文当前版本为 v1.2。2026-08-12 将载体选择、八类主交互、拆分硬规则和辅助机制并入唯一制作规范；2026-08-11 增加教师持续反馈、当前动画调整和全项目标准升级机制；文件路径继续作为 v1 主版本系列的稳定入口。
```

- [ ] **Step 4: 运行定向契约并确认 GREEN**

```bash
"$node_bin" --test --test-name-pattern='统一制作规范' tests/unified-animation-standards.test.mjs
```

- [ ] **Step 5: 检查没有复制视觉或通用红线**

```bash
sed -n '/^## 4\./,/^## 5\./p' docs/物理动画统一制作规范-v1.md > /tmp/animation-standard-section-4.txt
if rg -n '全项目无声音|浮动引导卡|#[0-9a-f]{6}' /tmp/animation-standard-section-4.txt; then
  exit 1
fi
git diff --check
git diff -- docs/物理动画统一制作规范-v1.md
```

- [ ] **Step 6: 提交正式规范实现**

```bash
git add docs/物理动画统一制作规范-v1.md
git diff --cached --check
git commit -m 'docs: unify interaction type and split decisions'
```

---

### Task 4: 完成内容覆盖审计与全量验证

**Files:**
- Read: 主工作区的 `docs/物理动画类型与交互逻辑标准-v1.md`
- Read: 实现工作树的统一制作规范
- Test: `tests/unified-animation-standards.test.mjs`

**Interfaces:**
- Consumes: Task 3 的 v1.2 规范。
- Produces: 可以安全移走第三份标准的覆盖证据。

- [ ] **Step 1: 逐项对照独有内容**

确认 v1.2 已覆盖六种载体、八类主类型、各自主交互闭环与拆分边界、非独立动画判断、物理播放与教学步骤边界、最多一个辅助机制、两条拆分硬规则和制作决策字段；重复的无声音、页面布局、引导卡和公式规则没有再次复制。

- [ ] **Step 2: 执行正向和负向守卫**

```bash
for term in 独立成品 同内核独立成品 嵌入教学步骤 静态题卡 暂缓待补 成版排除 \
  过程演示型 状态互动型 参数探究型 图像联动型 模型建构型 空间观察型 虚拟实验型 题目推演型; do
  rg -q "$term" docs/物理动画统一制作规范-v1.md
done
if rg -n '\.codex/attachments|235181b3-b39e-4217-abf1-b37333008bab|pasted-text|项目总提示词' \
  AGENTS.md docs/物理动画统一制作规范-v1.md docs/物理动画视觉标准-v1.md; then
  exit 1
fi
```

- [ ] **Step 3: 运行完整验证**

```bash
"$node_bin" --test tests/unified-animation-standards.test.mjs
"$node_bin" --test
git diff --check
git status --short
```

Expected: 规范契约 6/6、全量 52/52 通过；实现工作树干净。

---

### Task 5: 通过 Pull Request 让 v1.2 正式生效并同步 main

**Files:**
- Push: `codex/standards-conflict-cleanup`
- Merge target: `main`

**Interfaces:**
- Consumes: Task 4 的全绿分支。
- Produces: 远端和本地主分支中的正式 v1.2 标准。

- [ ] **Step 1: 推送并创建 Pull Request**

```bash
git push -u origin codex/standards-conflict-cleanup
gh pr create \
  --base main \
  --head codex/standards-conflict-cleanup \
  --title 'docs: unify animation interaction and split standards' \
  --body 'Integrates six carrier decisions, eight interaction types, split rules, and the physical-playback boundary into the single production authority. Contract and full test suites pass.'
```

- [ ] **Step 2: 检查 PR 差异和门禁**

```bash
gh pr diff --name-only
gh pr checks --watch
```

Expected: PR 只包含本次设计与计划、契约测试和统一制作规范；检查通过。

- [ ] **Step 3: 合并并同步主工作区**

```bash
gh pr merge --merge
project_root='/Users/luogaowei/Documents/代码保存仓库/动画制作'
git -C "$project_root" fetch origin main
git -C "$project_root" merge --ff-only origin/main
```

- [ ] **Step 4: 在新 main 上重新验证**

```bash
node_bin='/Users/luogaowei/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node'
test "$(git -C "$project_root" rev-parse main)" = "$(git -C "$project_root" rev-parse origin/main)"
cd "$project_root"
"$node_bin" --test tests/unified-animation-standards.test.mjs
"$node_bin" --test
```

Expected: 6/6 和 52/52 通过，本地与远端 main 相同。

---

### Task 6: 安全退役四个已完全合并的旧工作树

**Files:**
- Remove worktrees only: `ticker-timer-02a`、`ticker-timer-02b`、`ticker-timer-02c`、`ticker-timer-three-animations`

**Interfaces:**
- Consumes: 已同步的 main 和四个无独立提交、无工作区内容的分支。
- Produces: 四个退出工作树和四个安全删除的本地已合并分支。

- [ ] **Step 1: 对每个候选重新验证三项删除门禁**

对每个名称执行：

```bash
name='ticker-timer-02a'
git merge-base --is-ancestor "codex/$name" main
test -z "$(git -C ".worktrees/$name" status --porcelain)"
test -z "$(git log --format='%H' "main..codex/$name")"
```

用另外三个名称重复。任一命令失败便停止该目标，不移除。

- [ ] **Step 2: 使用显式路径移除通过门禁的工作树**

```bash
project_root='/Users/luogaowei/Documents/代码保存仓库/动画制作'
for name in ticker-timer-02a ticker-timer-02b ticker-timer-02c ticker-timer-three-animations; do
  git -C "$project_root" worktree remove "$project_root/.worktrees/$name"
done
```

- [ ] **Step 3: 仅使用安全 `-d` 删除已合并分支**

```bash
git -C "$project_root" branch -d \
  codex/ticker-timer-02a \
  codex/ticker-timer-02b \
  codex/ticker-timer-02c \
  codex/ticker-timer-three-animations
```

---

### Task 7: 将最新 main 合入六个保留工作树

**Files:**
- Preserve and update: `double-source-interference-v2`、`satellite-orbit-v5`、`ticker-guide-a`、`ticker-guide-b`、`ticker-guide-c`、`ticker-timer-v2-v6-baseline`

**Interfaces:**
- Consumes: 六个含独立提交的分支和正式 v1.2 main。
- Produces: 不丢失动画提交、规范入口与 main 一致的六个工作树。

- [ ] **Step 1: 记录状态和分支尖端**

```bash
for wt in double-source-interference-v2 satellite-orbit-v5 ticker-guide-a ticker-guide-b ticker-guide-c ticker-timer-v2-v6-baseline; do
  git -C ".worktrees/$wt" branch --show-current
  git -C ".worktrees/$wt" rev-parse HEAD
  git -C ".worktrees/$wt" status --short
done
```

Expected: 只有 `satellite-orbit-v5` 显示既有未跟踪 `artifacts/`；出现新的已跟踪修改时停止。

- [ ] **Step 2: 用 `merge-tree` 做无工作区写入的冲突预检**

```bash
for branch in \
  codex/double-source-interference-v2 \
  codex/satellite-orbit-v5 \
  codex/ticker-guide-a \
  codex/ticker-guide-b \
  codex/ticker-guide-c \
  codex/ticker-timer-v2-v6-baseline; do
  git merge-tree --write-tree "$branch" main
done
```

Expected: `double-source-interference-v2`、`satellite-orbit-v5`、`ticker-guide-c` 和 `ticker-timer-v2-v6-baseline` 可完整合并；`ticker-guide-a` 在 02A HTML 冲突，`ticker-guide-b` 在 02B HTML 和测试冲突。后两者不得执行完整合并。

- [ ] **Step 3: 对四个预检通过的分支逐个合并**

```bash
git -C '.worktrees/double-source-interference-v2' merge --no-edit main
git -C '.worktrees/satellite-orbit-v5' merge --no-edit main
git -C '.worktrees/ticker-guide-c' merge --no-edit main
git -C '.worktrees/ticker-timer-v2-v6-baseline' merge --no-edit main
```

逐一执行，不并行修改共享 Git 引用。若其中只出现政策文件冲突，真实合并后仅对三份显式权威采用 main：

```bash
git restore --source=main --staged --worktree -- \
  AGENTS.md \
  docs/物理动画统一制作规范-v1.md \
  docs/物理动画视觉标准-v1.md
git commit --no-edit
```

- [ ] **Step 4: 对两个动画冲突分支只提交政策同步**

```bash
for wt in ticker-guide-a ticker-guide-b; do
  git -C ".worktrees/$wt" restore --source=main --staged --worktree -- \
    AGENTS.md \
    docs/物理动画统一制作规范-v1.md \
    docs/物理动画视觉标准-v1.md
  test "$(git -C ".worktrees/$wt" diff --cached --name-only | wc -l | tr -d ' ')" = '3'
  git -C ".worktrees/$wt" diff --cached --name-only
  git -C ".worktrees/$wt" diff --cached --check
  git -C ".worktrees/$wt" commit -m 'chore: sync unified animation standards'
done
```

Expected: 暂存和提交只包含三份运行时权威，不触碰 02A/02B HTML 或测试；两个分支继续保留其独立动画提交，并明确仍未完整合并 main。

- [ ] **Step 5: 验证规范哈希、旧依赖和各分支测试**

```bash
project_root='/Users/luogaowei/Documents/代码保存仓库/动画制作'
node_bin='/Users/luogaowei/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node'
for wt in double-source-interference-v2 satellite-orbit-v5 ticker-guide-a ticker-guide-b ticker-guide-c ticker-timer-v2-v6-baseline; do
  cmp "$project_root/AGENTS.md" "$project_root/.worktrees/$wt/AGENTS.md"
  cmp "$project_root/docs/物理动画统一制作规范-v1.md" "$project_root/.worktrees/$wt/docs/物理动画统一制作规范-v1.md"
  cmp "$project_root/docs/物理动画视觉标准-v1.md" "$project_root/.worktrees/$wt/docs/物理动画视觉标准-v1.md"
  if rg -n '\.codex/attachments|235181b3-b39e-4217-abf1-b37333008bab|pasted-text|项目总提示词' "$project_root/.worktrees/$wt/AGENTS.md"; then
    exit 1
  fi
  (cd "$project_root/.worktrees/$wt" && "$node_bin" --test)
done
```

Expected: 三份运行时权威逐字一致、旧依赖无命中、各分支测试通过；`satellite-orbit-v5/artifacts/` 仍在。

---

### Task 8: 将两份旧源文件移动到废纸篓

**Files:**
- Move: `/Users/luogaowei/Documents/代码保存仓库/动画制作/docs/物理动画类型与交互逻辑标准-v1.md`
- Move: `/Users/luogaowei/.codex/attachments/235181b3-b39e-4217-abf1-b37333008bab/pasted-text.txt`
- Preserve: `/Users/luogaowei/Documents/代码保存仓库/动画制作/outputs/`

**Interfaces:**
- Consumes: 所有保留工作树已经不再引用旧外部路径的证据。
- Produces: 项目中没有第三份同名标准，旧绝对提示词路径失效，两份源文件仍可恢复。

- [ ] **Step 1: 验证精确源文件和空闲目标名**

```bash
type_source='/Users/luogaowei/Documents/代码保存仓库/动画制作/docs/物理动画类型与交互逻辑标准-v1.md'
prompt_source='/Users/luogaowei/.codex/attachments/235181b3-b39e-4217-abf1-b37333008bab/pasted-text.txt'
type_trash='/Users/luogaowei/.Trash/legacy-physics-animation-type-interaction-standard-v1-2026-08-12.md'
prompt_trash='/Users/luogaowei/.Trash/legacy-physics-animation-total-prompt-2026-08-12.txt'
test -f "$type_source"
test -f "$prompt_source"
test ! -e "$type_trash"
test ! -e "$prompt_trash"
test -d '/Users/luogaowei/.Trash'
```

若目标已存在，停止并使用新的显式日期时间后缀，不覆盖已有文件。

- [ ] **Step 2: 最后确认全部工作树均已脱离旧路径**

```bash
git worktree list --porcelain | sed -n 's/^worktree //p' | while IFS= read -r wt; do
  if [ -f "$wt/AGENTS.md" ] && rg -n '\.codex/attachments|235181b3-b39e-4217-abf1-b37333008bab|pasted-text|项目总提示词' "$wt/AGENTS.md"; then
    exit 1
  fi
done
```

若任一工作树仍引用旧文件，不移动外部总提示词。

- [ ] **Step 3: 移入废纸篓，不永久删除**

```bash
mv -- "$type_source" "$type_trash"
mv -- "$prompt_source" "$prompt_trash"
test ! -e "$type_source"
test ! -e "$prompt_source"
test -f "$type_trash"
test -f "$prompt_trash"
test -d '/Users/luogaowei/Documents/代码保存仓库/动画制作/outputs'
```

---

### Task 9: 最终审计并清理实现工作树

**Files:**
- Verify: entire repository and all remaining worktrees
- Preserve: `stash@{0}`、`outputs/`、`satellite-orbit-v5/artifacts/`

**Interfaces:**
- Consumes: Tasks 1–8 的提交、PR、工作树合并与废纸篓归档。
- Produces: 一套正式规范入口、无活跃旧依赖的项目状态和可复核证据。

- [ ] **Step 1: 在 main 上执行最终测试与权威检查**

```bash
project_root='/Users/luogaowei/Documents/代码保存仓库/动画制作'
node_bin='/Users/luogaowei/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node'
cd "$project_root"
"$node_bin" --test tests/unified-animation-standards.test.mjs
"$node_bin" --test
rg -o 'docs/[^`]+\.md' AGENTS.md | sort -u
if rg -n '\.codex/attachments|235181b3-b39e-4217-abf1-b37333008bab|pasted-text|项目总提示词|物理动画类型与交互逻辑标准' \
  AGENTS.md docs/物理动画统一制作规范-v1.md docs/物理动画视觉标准-v1.md; then
  exit 1
fi
git diff --check
```

Expected: 6/6、52/52 通过；`AGENTS.md` 只列两份正式规范；旧路径和第三份标准无命中。

- [ ] **Step 2: 审计所有工作树、用户成果和 stash**

```bash
git worktree list
git worktree list --porcelain | sed -n 's/^worktree //p' | while IFS= read -r wt; do
  printf '%s\n' "$wt"
  git -C "$wt" status --short
done
test -d "$project_root/outputs"
test -d "$project_root/.worktrees/satellite-orbit-v5/artifacts"
git stash list --date=iso-local | rg 'pre-unified-standards-local-drafts-2026-08-11'
```

Expected: 主工作区仅保留已知 `outputs/`；六个保留工作树存在且规范一致；卫星 `artifacts/` 和命名 stash 均保留。

- [ ] **Step 3: 移除已合并且干净的实现工作树和分支**

```bash
implementation_wt="$project_root/.worktrees/standards-conflict-cleanup"
test -z "$(git -C "$implementation_wt" status --porcelain)"
git -C "$project_root" merge-base --is-ancestor codex/standards-conflict-cleanup main
git -C "$project_root" worktree remove "$implementation_wt"
git -C "$project_root" branch -d codex/standards-conflict-cleanup
```

- [ ] **Step 4: 记录最终远端与恢复信息**

```bash
git fetch origin main
test "$(git rev-parse main)" = "$(git rev-parse origin/main)"
git status --short
git stash list --date=iso-local
```

Expected: 本地与远端 main 一致；stash 未删除；最终报告列出两份废纸篓文件的精确恢复路径。
