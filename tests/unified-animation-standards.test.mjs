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
  const entrySection = visual.split('### 2.4 引导演示与实验指南入口')[1]?.split('\n---')[0] ?? '';
  const wideLayout = visual.split('### 4.1 信息职责')[1]?.split('### 4.2 栏宽标准')[0] ?? '';
  const narrowLayout = visual.split('### 5.1 窄屏')[1]?.split('### 5.2 短横屏')[0] ?? '';
  const shortLandscape = visual.split('### 5.2 短横屏')[1]?.split('### 5.3 面板状态要求')[0] ?? '';
  const layoutTemplate = visual.split('### 6.4 可直接复制的三栏与响应式模板')[1]?.split('模板中的类名')[0] ?? '';
  assert.match(visual, /--focus:\s*#9a83ff/i);
  assert.match(visual, /引导演示与实验指南入口/);
  assert.match(entrySection, /<main class="experiment-layout">[\s\S]{0,400}<aside class="control-panel"[\s\S]{0,500}<section class="stage-column"[\s\S]{0,300}<nav class="guide-entry-bar"[\s\S]{0,900}<section class="stage"[\s\S]{0,500}<aside class="observe-panel"/);
  assert.match(entrySection, /<nav class="guide-entry-bar"[\s\S]{0,600}<button[\s\S]{0,400}<button/);
  assert.doesNotMatch(visual, /experiment-shell/);
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
  assert.match(layoutTemplate, /\.stage-column\s*\{[^}]*grid-column:\s*2/);
  assert.match(layoutTemplate, /\.stage\s*\{(?=[^}]*min-height:\s*0)[^}]*\}/);
  assert.match(layoutTemplate, /@media \(max-width: 960px\)[\s\S]{0,500}\.guide-entry-bar\s*\{[^}]*width:\s*100%/);
  assert.match(layoutTemplate, /@media \(max-width: 960px\)[\s\S]{0,900}\.stage-column\s*\{[^}]*grid-column:\s*1[^}]*grid-row:\s*1/);
  assert.match(layoutTemplate, /@media \(orientation: landscape\) and \(max-width: 960px\) and \(max-height: 540px\)[\s\S]{0,500}\.guide-entry-bar\s*\{[^}]*width:\s*100%/);
  assert.match(layoutTemplate, /@media \(orientation: landscape\) and \(max-width: 960px\) and \(max-height: 540px\)[\s\S]{0,900}\.stage-column\s*\{[^}]*grid-column:\s*1[^}]*grid-row:\s*1 \/ 3/);
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
  assert.match(svgExample, /<svg[^>]*aria-labelledby="acceleration-title"[\s\S]{0,240}<title id="acceleration-title">/);
  assert.match(svgExample, /<text[^>]*>\s*<tspan class="formula-variable">a<\/tspan>\s*<tspan class="formula-operator">=<\/tspan>\s*<\/text>/);
  assert.match(svgExample, /<text[^>]*>\s*<tspan class="formula-operator">Δ<\/tspan><tspan class="formula-variable">v<\/tspan>\s*<\/text>/);
  assert.match(svgExample, /<text[^>]*>\s*<tspan class="formula-operator">Δ<\/tspan><tspan class="formula-variable">t<\/tspan>\s*<\/text>/);
  assert.match(svgExample, /\.formula-variable\s*\{[^}]*font-style:\s*italic/);
  assert.match(svgExample, /\.formula-operator\s*\{[^}]*font-style:\s*normal/);
  assert.doesNotMatch(svgExample, /<text[^>]*>(?:a\s*=|Δ[vt])<\/text>/);
});

test('the three standards have one owner per concern and no legacy prompt dependency', () => {
  const agents = readStandard('agents');
  const production = readStandard('production');
  const visual = readStandard('visual');
  assert.doesNotMatch(`${agents}\n${production}\n${visual}`, /235181b3-b39e-4217-abf1-b37333008bab/);
  assert.match(production, /## 3\. 五阶段制作流程/);
  assert.doesNotMatch(production, /--surface-page|grid-template-columns/);
});
