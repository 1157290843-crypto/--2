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
  visual: resolve(repoRoot, 'docs/物理动画视觉标准-v1.md'),
  retiredInteractionStandard: resolve(repoRoot, 'docs/物理动画类型与交互逻辑标准-v1.md'),
  feedbackPlan: resolve(repoRoot, 'docs/superpowers/plans/2026-08-11-continuous-animation-standard-feedback.md'),
  originalPlan: resolve(repoRoot, 'docs/superpowers/plans/2026-08-11-unified-physics-animation-production-standard.md')
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
  assert.match(agents, /教师反馈[^\n]*默认[^\n]*当前动画/);
  assert.match(agents, /明确[^\n]*以后都这样[^\n]*项目标准/);
  assert.doesNotMatch(agents, /\.codex\/attachments/);
  assert.doesNotMatch(agents, /自动演示/);
  assert.doesNotMatch(agents, /--focus|#9a83ff|grid-template-columns|@keyframes/);
});

test('统一制作规范 contains the five-stage, risk-routed student workflow', () => {
  const production = readStandard('production');
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
  assert.match(production, /^# 物理动画统一制作规范 v1\.2$/m);
  assert.match(production, /本文当前版本为 v1\.2/);
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

test('统一制作规范 selects one carrier and one interaction type before applying split rules', () => {
  const production = readStandard('production');
  const decisionSection = production
    .split('## 4. 教学目标、功能预算与主动做减法')[1]
    ?.split('## 5. 物理模型、参数分类与唯一实验状态')[0] ?? '';

  for (const carrier of [
    '独立成品', '同内核独立成品', '嵌入教学步骤',
    '静态题卡', '暂缓待补', '成版排除'
  ]) assert.match(decisionSection, new RegExp(carrier));

  const expectedTypes = [
    '过程演示型', '状态互动型', '参数探究型', '图像联动型',
    '模型建构型', '空间观察型', '虚拟实验型', '题目推演型'
  ];
  for (const type of expectedTypes) assert.match(decisionSection, new RegExp(type));

  const primaryTypeSection = decisionSection.split('### 4.2 八类主类型与主交互闭环')[1]?.split('各类的必备控制')[0] ?? '';
  const primaryTypeTable = primaryTypeSection.split('| 主类型 | 主要学习障碍与唯一主操作 | 主交互闭环 | 拆分边界 |')[1]
    ?.split('\n\n')[0] ?? '';
  const primaryTypeRows = primaryTypeTable.split('\n')
    .filter((line) => /^\|[^-][^|]*\|[^|]+\|[^|]+\|[^|]+\|$/.test(line));
  const actualTypes = primaryTypeRows.map((line) => line.split('|')[1].trim());
  assert.equal(primaryTypeRows.length, 8, 'primary-type table must contain exactly eight data rows');
  assert.deepEqual(actualTypes, expectedTypes);

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

test('统一制作规范 maps every carrier to an eight-type field state', () => {
  const production = readStandard('production');
  const decisionSection = production
    .split('## 4. 教学目标、功能预算与主动做减法')[1]
    ?.split('## 5. 物理模型、参数分类与唯一实验状态')[0] ?? '';

  assert.match(decisionSection, /独立成品、同内核独立成品[\s\S]{0,100}必须[\s\S]{0,80}八类/);
  assert.match(decisionSection, /嵌入教学步骤[\s\S]{0,180}真实动态交互[\s\S]{0,120}不适用/);
  assert.match(decisionSection, /静态题卡、成版排除[\s\S]{0,80}不适用/);
  assert.match(decisionSection, /暂缓待补[\s\S]{0,80}待定/);
  assert.match(decisionSection, /不适用[\s\S]{0,80}待定[\s\S]{0,100}字段状态[\s\S]{0,80}不属于主类型/);
});

test('统一制作规范 gives all eight types mandatory controls and prohibited boundaries', () => {
  const production = readStandard('production');
  const decisionSection = production
    .split('## 4. 教学目标、功能预算与主动做减法')[1]
    ?.split('## 5. 物理模型、参数分类与唯一实验状态')[0] ?? '';
  const expected = new Map([
    ['过程演示型', ['播放', '关键节点', '大量参数']],
    ['状态互动型', ['恢复默认', '前后对照', '结果量']],
    ['参数探究型', ['预测记录', '结果对比', '多个自变量']],
    ['图像联动型', ['双向同步游标', '坐标、单位', '多张主图']],
    ['模型建构型', ['研究对象选择', '撤销', '自由白板']],
    ['空间观察型', ['恢复标准视角', '考试视角', '自由漫游']],
    ['虚拟实验型', ['原始数据表', '估读', '自动填满数据']],
    ['题目推演型', ['阶段时间轴', '关键帧暂停', '完整题库']]
  ]);
  for (const [type, terms] of expected) {
    const typeSection = decisionSection.split(`#### ${type}`)[1]?.split(/^#### /m)[0] ?? '';
    assert.match(typeSection, /必备控制/);
    assert.match(typeSection, /禁止边界/);
    for (const term of terms) assert.match(typeSection, new RegExp(term));
  }
});

test('统一制作规范 defines the ordered classification decision sequence', () => {
  const production = readStandard('production');
  const sequence = production.split('### 4.5 分类决策顺序')[1]?.split('### 4.6')[0] ?? '';
  const ordered = ['学习障碍', '静态图无法替代', '建议载体', '主类型', '辅助机制', '单一主问题', '学生主要操作', '唯一观察焦点', '优先删除', '拆分', '物理风险'];
  let previous = -1;
  for (const term of ordered) {
    const current = sequence.indexOf(term);
    assert.ok(current > previous, `${term} must appear in classification order`);
    previous = current;
  }
});

test('统一制作规范 requires a compact per-item classification quality check', () => {
  const production = readStandard('production');
  const checklist = production.split('### 4.6 逐项分类质量检查')[1]?.split('## 5.')[0] ?? '';
  for (const term of [
    '一个问句', '载体与主类型', '十秒', '一个观察焦点',
    '不超过四个', '系统计算结果', '结果量', '图像', '3D',
    '动态、交互或操作价值', '适用范围', '底层复用'
  ]) assert.match(checklist, new RegExp(term));
});

test('统一制作规范 decision record distinguishes conditions, results and animation priority', () => {
  const production = readStandard('production');
  const decisionSection = production
    .split('### 4.4 辅助机制与制作决策单')[1]
    ?.split('### 4.5')[0] ?? '';
  assert.match(decisionSection, /可编辑条件[\s\S]{0,100}锁定条件[\s\S]{0,100}系统计算结果/);
  assert.match(decisionSection, /动画化优先级[\s\S]{0,40}理由/);
});

test('统一制作规范 resolves editable and locked parameter budgets', () => {
  const production = readStandard('production');
  const decisionSection = production
    .split('## 4. 教学目标、功能预算与主动做减法')[1]
    ?.split('## 5. 物理模型、参数分类与唯一实验状态')[0] ?? '';
  assert.match(decisionSection, /零至四个可编辑条件[\s\S]{0,80}优先[\s\S]{0,40}一至两个/);
  assert.doesNotMatch(decisionSection, /默认[^\r\n]{0,80}二至四个主要参数/);
  const parameterType = decisionSection.split('#### 参数探究型')[1]?.split(/^#### /m)[0] ?? '';
  assert.match(parameterType, /一个[^\r\n]*自变量[\s\S]{0,100}零至三个[^\r\n]*锁定条件/);
});

test('统一制作规范 defines exactly eight auxiliary mechanisms with boundaries', () => {
  const production = readStandard('production');
  const auxiliary = production.split('#### 辅助机制目录')[1]?.split('#### 主从组合边界')[0] ?? '';
  const expectedMechanisms = [
    '时间控制', '预测验证', '临界事件', '对比辨析',
    '图像游标', '二维模型转化', '数据采集', '研究对象切换'
  ];
  const table = auxiliary.split('| 辅助机制 | 用途 | 使用边界 |')[1]?.split('\n\n')[0] ?? '';
  const dataRows = table.split('\n').filter((line) => /^\|[^-][^|]*\|[^|]+\|[^|]+\|$/.test(line));
  const actualMechanisms = dataRows.map((line) => line.split('|')[1].trim());
  assert.equal(dataRows.length, 8, 'auxiliary mechanism table must contain exactly eight data rows');
  assert.deepEqual(actualMechanisms, expectedMechanisms);
  assert.match(auxiliary, /时间控制[\s\S]{0,180}教学步骤[\s\S]{0,180}过程演示型[\s\S]{0,120}不重复登记/);
  assert.match(auxiliary, /主类型[\s\S]{0,120}必备[\s\S]{0,120}不得重复/);
});

test('统一制作规范 gives safe and disallowed main-type combinations', () => {
  const production = readStandard('production');
  const combinations = production.split('#### 主从组合边界')[1]?.split('### 4.5')[0] ?? '';
  for (const pattern of [
    /参数探究型[^\r\n]*图像游标/,
    /空间观察型[^\r\n]*二维模型转化/,
    /题目推演型[^\r\n]*临界事件/,
    /状态互动型[^\r\n]*对比辨析/,
    /虚拟实验型[^\r\n]*二维模型转化/
  ]) assert.match(combinations, pattern);
  assert.match(combinations, /多套实验方法[^\r\n]*不得[^\r\n]*并列|不得[^\r\n]*多套实验方法[^\r\n]*并列/);
  assert.match(combinations, /多个临界条件[^\r\n]*不得[^\r\n]*扫描|不得[^\r\n]*多个临界条件[^\r\n]*扫描/);
});

test('统一制作规范 preserves non-independent handling priority', () => {
  const production = readStandard('production');
  const carrier = production.split('#### 非独立内容处置顺序')[1]?.split('### 4.2')[0] ?? '';
  const ordered = ['嵌入已有动画', '静态题卡', '轻量可拖动示意', '可跳过的折叠验证', '暂缓待补'];
  let previous = -1;
  for (const term of ordered) {
    const current = carrier.indexOf(term);
    assert.ok(current > previous, `${term} must appear in non-independent priority order`);
    previous = current;
  }
  assert.match(carrier, /不得[^\r\n]*强行立项|不强行立项/);
});

test('统一制作规范 defines directory granularity and bad-source handling', () => {
  const production = readStandard('production');
  const checklist = production.split('### 4.6 逐项分类质量检查')[1]?.split('## 5.')[0] ?? '';
  assert.match(checklist, /最低层[^\r\n]*可独立教学[^\r\n]*目录叶子/);
  assert.match(checklist, /父级[^\r\n]*不自动立项/);
  assert.match(checklist, /同内核[^\r\n]*独立标题[^\r\n]*独立[^\r\n]*脚本/);
  assert.match(checklist, /无效输入[\s\S]{0,80}残缺[\s\S]{0,80}编号断裂[\s\S]{0,80}物理表述错误/);
  assert.match(checklist, /暂缓待补[\s\S]{0,80}修正建议[\s\S]{0,100}不得[^\r\n]*猜测[^\r\n]*制作/);
});

test('统一制作规范 preserves spatial pause and virtual-experiment authenticity boundaries', () => {
  const production = readStandard('production');
  const spatial = production.split('#### 空间观察型')[1]?.split(/^#### /m)[0] ?? '';
  assert.match(spatial, /物理时间暂停[\s\S]{0,100}旋转[\s\S]{0,80}切换[^\r\n]*视角/);
  const experiment = production.split('#### 虚拟实验型')[1]?.split(/^#### /m)[0] ?? '';
  assert.match(experiment, /操作错误[\s\S]{0,100}不得[\s\S]{0,80}正常测量误差/);
  assert.match(experiment, /补充[\s\S]{0,60}演练[\s\S]{0,100}不得[\s\S]{0,80}取代真实实验/);
});

test('视觉标准 owns the page shell, formula, focus glow and guide-card details', () => {
  const visual = readStandard('visual');
  const entrySection = visual.split('### 2.4 引导演示与实验指南入口')[1]?.split('\n---')[0] ?? '';
  const wideLayout = visual.split('### 4.1 信息职责')[1]?.split('### 4.2 栏宽标准')[0] ?? '';
  const narrowLayout = visual.split('### 5.1 窄屏')[1]?.split('### 5.2 短横屏')[0] ?? '';
  const shortLandscape = visual.split('### 5.2 短横屏')[1]?.split('### 5.3 面板状态要求')[0] ?? '';
  const layoutTemplate = visual.split('### 6.4 可直接复制的三栏与响应式模板')[1]?.split('模板中的类名')[0] ?? '';
  const narrowTemplate = layoutTemplate.split('@media (max-width: 960px)')[1]
    ?.split('@media (orientation: landscape)')[0] ?? '';
  const shortLandscapeTemplate = layoutTemplate.split('@media (orientation: landscape)')[1] ?? '';
  const stageColumnStart = entrySection.indexOf('<section class="stage-column">');
  const mobileTabsStart = entrySection.indexOf('<div class="mobile-tabs" role="tablist"');
  const conditionsPanelStart = entrySection.indexOf('<aside id="conditionsPanel"');
  const observePanelStart = entrySection.indexOf('<aside id="observePanel"');
  const stageColumnFragment = stageColumnStart >= 0 && mobileTabsStart > stageColumnStart
    ? entrySection.slice(stageColumnStart, mobileTabsStart)
    : '';
  const tabList = mobileTabsStart >= 0
    ? entrySection.slice(mobileTabsStart).split('</div>')[0]
    : '';
  const tabButtons = [...tabList.matchAll(/<button\b[^>]*>/g)].map(([tag]) => tag);
  const panelTags = [...entrySection.matchAll(/<aside\b[^>]*>/g)].map(([tag]) => tag);
  assert.match(visual, /--focus:\s*#9a83ff/i);
  assert.match(visual, /引导演示与实验指南入口/);
  assert.match(entrySection, /<main class="experiment-layout" data-panel="conditions">/);
  assert.ok(
    stageColumnStart >= 0
      && stageColumnStart < mobileTabsStart
      && mobileTabsStart < conditionsPanelStart,
    'narrow source order must be stage column, tabs, then conditions panel'
  );
  assert.ok(
    mobileTabsStart >= 0 && mobileTabsStart < observePanelStart,
    'narrow source order must place tabs before the observe panel'
  );
  assert.match(stageColumnFragment, /<nav class="guide-entry-bar"/);
  assert.match(stageColumnFragment, /<section class="stage">/);
  assert.equal(tabButtons.length, 2);
  for (const [tag, attributes] of [
    [tabButtons[0], ['id="conditionsTab"', 'type="button"', 'role="tab"', 'aria-controls="conditionsPanel"', 'aria-selected="true"', 'tabindex="0"']],
    [tabButtons[1], ['id="observeTab"', 'type="button"', 'role="tab"', 'aria-controls="observePanel"', 'aria-selected="false"', 'tabindex="-1"']]
  ]) {
    for (const attribute of attributes) assert.match(tag, new RegExp(attribute));
  }
  for (const [id, className, labelledBy] of [
    ['conditionsPanel', 'control-panel', 'conditionsTab'],
    ['observePanel', 'observe-panel', 'observeTab']
  ]) {
    const panel = panelTags.find((tag) => tag.includes(`id="${id}"`));
    assert.ok(panel, `missing panel ${id}`);
    assert.match(panel, new RegExp(`class="${className}"`));
    assert.match(panel, /role="tabpanel"/);
    assert.match(panel, new RegExp(`aria-labelledby="${labelledBy}"`));
    assert.doesNotMatch(panel, /\shidden(?:\s|=|>)/);
  }
  assert.match(entrySection, /脚本[\s\S]{0,120}data-panel[\s\S]{0,120}aria-selected[\s\S]{0,120}tabindex[\s\S]{0,160}不得重置.*实验状态/);
  assert.match(wideLayout, /左侧参数区[^\n]*引导演示 \/ 实验指南入口[^\n]*右侧观察区/);
  assert.match(narrowLayout, /入口栏.*单列.*全宽/);
  assert.match(shortLandscape, /入口栏.*左侧主舞台列顶部/);
  assert.match(shortLandscape, /右侧.*参数\/观察标签.*标题栏下/);
  for (const responsiveSection of [narrowLayout, shortLandscape]) {
    assert.match(responsiveSection, /不得.*(?:挤压|裁切).*主舞台.*底部控制条.*活动面板/);
    assert.match(responsiveSection, /不得缩小核心字号/);
  }
  assert.match(
    layoutTemplate,
    /\.experiment-layout\s*\{(?=[^}]*height:\s*calc\(100dvh - var\(--header-height\)\))(?=[^}]*overflow:\s*hidden)[^}]*\}/
  );
  assert.match(
    layoutTemplate,
    /\.stage-column\s*\{(?=[^}]*min-height:\s*0)(?=[^}]*display:\s*grid)(?=[^}]*grid-template-rows:\s*auto minmax\(0,\s*1fr\))(?=[^}]*overflow:\s*hidden)[^}]*\}/
  );
  assert.match(
    layoutTemplate,
    /\.guide-entry-bar\s*\{(?=[^}]*width:\s*100%)(?=[^}]*min-height:\s*44px)(?=[^}]*display:\s*flex)(?=[^}]*overflow-x:\s*auto)[^}]*\}/
  );
  assert.match(
    layoutTemplate,
    /\.guide-entry\s*\{(?=[^}]*min-width:\s*44px)(?=[^}]*min-height:\s*44px)(?=[^}]*flex:\s*0 0 auto)(?=[^}]*border:\s*1px solid var\(--border\))(?=[^}]*border-radius:\s*12px)(?=[^}]*background:\s*var\(--surface-raised\))(?=[^}]*color:\s*var\(--text-strong\))[^}]*\}/
  );
  assert.match(
    layoutTemplate,
    /\.guide-entry\.is-active\s*,\s*\.guide-entry\[aria-pressed="true"\]\s*,\s*\.guide-entry\[aria-expanded="true"\]\s*\{(?=[^}]*border(?:-color)?:\s*var\(--action\))(?=[^}]*background:\s*var\(--action\))(?=[^}]*color:\s*var\(--on-action\))[^}]*\}/
  );
  assert.match(
    layoutTemplate,
    /\.guide-entry:focus-visible\s*\{[^}]*outline:\s*[^;}]*var\(--focus\)[^}]*\}/
  );
  assert.match(layoutTemplate, /\.stage-column\s*\{[^}]*grid-column:\s*2/);
  assert.match(layoutTemplate, /\.control-panel\s*\{[^}]*grid-column:\s*1/);
  assert.match(layoutTemplate, /\.observe-panel\s*\{[^}]*grid-column:\s*3/);
  assert.match(layoutTemplate, /\.stage\s*\{(?=[^}]*min-height:\s*0)[^}]*\}/);
  assert.match(layoutTemplate, /\.mobile-tabs\s*\{\s*display:\s*none/);
  assert.match(layoutTemplate, /\.mobile-tabs\s*>\s*button\s*\{[^}]*min-height:\s*44px/);
  assert.match(layoutTemplate, /@media \(max-width: 960px\)[\s\S]{0,500}\.guide-entry-bar\s*\{[^}]*width:\s*100%/);
  assert.match(layoutTemplate, /@media \(max-width: 960px\)[\s\S]{0,900}\.stage-column\s*\{[^}]*grid-column:\s*1[^}]*grid-row:\s*1/);
  assert.match(layoutTemplate, /@media \(max-width: 960px\)[\s\S]{0,1200}\.mobile-tabs\s*\{[^}]*display:\s*grid/);
  assert.match(narrowTemplate, /\.brand-mark\s*\{(?=[^}]*width:\s*34px)(?=[^}]*height:\s*34px)(?=[^}]*flex:\s*0 0 34px)[^}]*\}/);
  assert.match(narrowTemplate, /grid-template-rows:\s*minmax\(350px,\s*56svh\)\s*44px\s*minmax\(0,\s*1fr\)/);
  assert.match(layoutTemplate, /data-panel="conditions"[\s\S]{0,160}\.control-panel[\s\S]{0,160}data-panel="observe"[\s\S]{0,160}\.observe-panel/);
  assert.match(layoutTemplate, /@media \(orientation: landscape\) and \(max-width: 960px\) and \(max-height: 540px\)[\s\S]{0,500}\.guide-entry-bar\s*\{[^}]*width:\s*100%/);
  assert.match(layoutTemplate, /@media \(orientation: landscape\) and \(max-width: 960px\) and \(max-height: 540px\)[\s\S]{0,900}\.stage-column\s*\{[^}]*grid-column:\s*1[^}]*grid-row:\s*1 \/ 3/);
  assert.match(layoutTemplate, /@media \(orientation: landscape\) and \(max-width: 960px\) and \(max-height: 540px\)[\s\S]{0,1200}\.mobile-tabs\s*\{[^}]*grid-column:\s*2[^}]*grid-row:\s*1/);
  assert.match(shortLandscapeTemplate, /\.brand-mark\s*\{(?=[^}]*width:\s*30px)(?=[^}]*height:\s*30px)(?=[^}]*flex:\s*0 0 30px)[^}]*\}/);
  assert.match(shortLandscapeTemplate, /grid-template-rows:\s*44px\s*minmax\(0,\s*1fr\)/);
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
  const correctExamples = visual.split('### 9.7 正确示例')[1]?.split('### 9.8 错误示例')[0] ?? '';
  const svgExample = correctExamples.split('SVG 标准分式')[1]?.split('Canvas 使用')[0] ?? '';
  const fractionExample = correctExamples.split('原生 MathML 分式、矢量角标与复合底数：')[1]
    ?.split('</math>')[0] ?? '';
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
  assert.match(
    visual,
    /含标准分式、根式或多层脚本[^\n]*即使[^\n]*display="inline"[^\n]*T2 `16px`/
  );
  assert.match(visual, /\.formula-complex\s*\{[^}]*font-size:\s*var\(--type-16\)[^}]*\}/);
  assert.match(fractionExample, /<math[^>]*class="formula-complex"[^>]*display="inline"[^>]*>[\s\S]*<mfrac>/);
  const beforeErrorExamples = visual.split('### 9.8 错误示例')[0];
  assert.doesNotMatch(beforeErrorExamples, /v_0|r_0/);
  assert.match(visual, /### 9\.8 错误示例[\s\S]*a=Δv\/Δt[\s\S]*v_0=5m\/s/);
  assert.doesNotMatch(visual, /sub\s*,\s*\n?\s*sup\s*\{\s*font-size:\s*1em\s*;?\s*\}/);
  assert.doesNotMatch(visual, /<mi>Δv<\/mi>|<mi>Δt<\/mi>/);
  assert.match(svgExample, /<svg[^>]*aria-labelledby="acceleration-title"[\s\S]{0,240}<title id="acceleration-title">/);
  assert.match(svgExample, /<text[^>]*>\s*<tspan class="formula-variable">a<\/tspan>\s*<tspan class="formula-operator">=<\/tspan>\s*<\/text>/);
  assert.match(svgExample, /<text[^>]*>\s*<tspan class="formula-operator">Δ<\/tspan><tspan class="formula-variable">v<\/tspan>\s*<\/text>/);
  assert.match(svgExample, /<text[^>]*>\s*<tspan class="formula-operator">Δ<\/tspan><tspan class="formula-variable">t<\/tspan>\s*<\/text>/);
  assert.match(svgExample, /\.formula-variable\s*\{[^}]*font-style:\s*italic/);
  assert.match(svgExample, /\.formula-operator\s*\{[^}]*font-style:\s*normal/);
  assert.doesNotMatch(svgExample, /<text[^>]*>(?:a\s*=|Δ[vt])<\/text>/);
});

test('the three standards have one owner per concern and no legacy prompt dependency', () => {
  assert.equal(
    existsSync(paths.retiredInteractionStandard),
    false,
    `retired interaction standard must stay absent: ${paths.retiredInteractionStandard}`
  );
  const agents = readStandard('agents');
  const production = readStandard('production');
  const visual = readStandard('visual');
  const feedbackPlan = readStandard('feedbackPlan');
  const originalPlan = readStandard('originalPlan');
  const runtimeAuthorities = `${agents}\n${production}\n${visual}`;
  const manualAuthorityCheck = feedbackPlan.split('- [ ] **Step 4: 人工核对入口效果**')[1]
    ?.split('- [ ] **Step 5: 提交 AGENTS 红线**')[0] ?? '';
  const executionHandoff = originalPlan.split('## Execution Handoff')[1] ?? '';
  assert.doesNotMatch(agents, /没有反馈轮数限制|主流程冒烟|Pull Request|规则归属/);
  assert.doesNotMatch(visual, /教师持续反馈与标准升级|默认只修改当前动画|全项目标准候选|主流程冒烟|v1\.1/);
  assert.doesNotMatch(runtimeAuthorities, /\.codex\/attachments/);
  assert.doesNotMatch(`${agents}\n${production}\n${visual}`, /235181b3-b39e-4217-abf1-b37333008bab/);
  assert.match(production, /## 3\. 五阶段制作流程/);
  assert.doesNotMatch(production, /--surface-page|grid-template-columns/);
  assert.match(manualAuthorityCheck, /两份仓库内权威/);
  assert.match(manualAuthorityCheck, /统一制作规范/);
  assert.match(manualAuthorityCheck, /视觉标准/);
  assert.doesNotMatch(manualAuthorityCheck, /总提示词|\.codex\/attachments/);
  assert.match(executionHandoff, /命名隔离工作树[^\n]*唯一可写/);
  assert.match(executionHandoff, /主工作区[^\n]*只读迁移来源/);
  assert.doesNotMatch(executionHandoff, /从当前工作树内容出发/);
});
