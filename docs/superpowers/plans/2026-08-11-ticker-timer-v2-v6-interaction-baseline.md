# Ticker Timer v2 V6 Interaction Baseline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create three new self-contained `v2` ticker-timer animations that preserve the verified physics and visual language while adopting the confirmed v6 student-paced scenario entries, draggable guide card, purple focus layer, and three-tab experiment guide.

**Architecture:** Keep the three HTML files independent and copy the verified `v1` files as immutable starting points. Duplicate one small pure `TickerV6InteractionCore` into each self-contained HTML, then add page-specific scenario definitions and adapters that dispatch the already-verified physics/reducer actions. Treat browser geometry, focus layers, guide modal behavior, and responsive entry placement as view/controller concerns derived from that pure state.

**Tech Stack:** Self-contained HTML/CSS/JavaScript, Canvas 2D custom renderer, Node.js `node:test`, `vm` for inline-core tests, Codex in-app browser through a `127.0.0.1` temporary server.

## Global Constraints

- Preserve `02A-打点计时器结构与原理-v1.html`, `02B-打点计时器规范操作-v1.html`, and `02C-纸带数据处理-v1.html` byte-for-byte; create `v2` files.
- Keep the exact visible titles: `打点计时器｜结构怎样形成等时点迹`, `打点计时器｜按正确顺序完成实验`, and `纸带逐差法｜用六段位移求加速度`.
- Keep the standard header, warm-white panels, deep-blue stage, six visible font sizes `20/16/14/13/12/11px`, wide three-column layout, `≤960px` single-panel layout, and `≤960×540` short-landscape split.
- 02A entries: `A 电磁式原理 / B 电火花式原理 / 实验指南`.
- 02B entries: `正确操作 / 实验指南`; do not create an error-scenario entry.
- 02C entries: `分组逐差 / 实验指南`; average and combined formula remain steps in the same scenario.
- Do not auto-advance teaching steps on timers. Observation steps require an explicit `下一步`; action steps require the verified real state plus an explicit `下一步`.
- Show `替我操作` only when the current step requires a system action.
- Use one `pointer-events:none` purple focus layer at `z-index:68`; use default guide `z-index:12`, floating guide `z-index:72`, header `z-index:40`, and guide modal `z-index:80`.
- Preserve the 02A/02B 3D structures, physical clock, operation reducer, camera presets, deterministic tape, 02C ideal tape, and exact `2.00 m/s²` successive-difference result.
- No sound, audio interfaces, external scripts, external styles, external images, analytics, accounts, or network APIs.
- Preview and browser automation must use a temporary server bound only to `127.0.0.1`; never automate `file://`.

---

### Task 1: Create immutable v2 baselines and the shared student-paced interaction core

**Files:**
- Create: `02A-打点计时器结构与原理-v2.html`
- Create: `02B-打点计时器规范操作-v2.html`
- Create: `02C-纸带数据处理-v2.html`
- Create: `tests/helpers/ticker-v6-test-utils.mjs`
- Create: `tests/ticker-timer-v2-contract.test.mjs`

**Interfaces:**
- Consumes: the three verified `v1` HTML files.
- Produces: identical inline `window.TickerV6InteractionCore` objects in all three `v2` files.
- `selectScenario(scenarioId: string, scenarios: Record<string, Step[]>): GuideState`
- `reduceGuide(state: GuideState, action: GuideAction, scenarios: Record<string, Step[]>): GuideState`
- `guideActionView(state: GuideState, scenarios: Record<string, Step[]>): ActionView`
- `clampFloatingPosition(rect, viewport, margin = 12): {x:number,y:number}`
- `layoutForViewport(width:number, height:number): {kind:'wide'|'narrow'|'short-landscape', tabs:boolean, panels:number}`
- `Step = {id:string,title:string,requiresAssist:boolean,assistCount?:number,focusTargets:string[]}`
- `GuideState = {scenarioId:string|null,status:'idle'|'running'|'acting'|'ready'|'completed'|'explore',step:number,substep:number,open:boolean}`

- [ ] **Step 1: Copy the locked v1 files to v2 without modifying v1**

Run:

```bash
cp '02A-打点计时器结构与原理-v1.html' '02A-打点计时器结构与原理-v2.html'
cp '02B-打点计时器规范操作-v1.html' '02B-打点计时器规范操作-v2.html'
cp '02C-纸带数据处理-v1.html' '02C-纸带数据处理-v2.html'
```

Expected: the three new files exist and initially match their corresponding `v1` hashes.

- [ ] **Step 2: Add the common test utilities**

Create `tests/helpers/ticker-v6-test-utils.mjs`:

```js
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import vm from 'node:vm';

export const repoRoot = resolve(import.meta.dirname, '../..');

export function readHtml(name) {
  return readFileSync(resolve(repoRoot, name), 'utf8');
}

export function loadInlineCore(html, attributeName, globals = {}) {
  const pattern = new RegExp(`<script\\s+${attributeName}[^>]*>([\\s\\S]*?)<\\/script>`);
  const match = html.match(pattern);
  assert.ok(match, `missing <script ${attributeName}>`);
  const window = {};
  vm.runInNewContext(match[1], { window, Object, Array, Math, Number, Set, ...globals });
  return window;
}

export function assertOfflineSilent(html) {
  assert.doesNotMatch(html, /<script[^>]+src=|<link[^>]+href=/i);
  assert.doesNotMatch(html, /<audio|new Audio|speechSynthesis/i);
}
```

- [ ] **Step 3: Write the failing v2 contract tests**

Create `tests/ticker-timer-v2-contract.test.mjs` with exact hash protection and pure guide behavior:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readHtml, loadInlineCore, assertOfflineSilent } from './helpers/ticker-v6-test-utils.mjs';

const locked = {
  '02A-打点计时器结构与原理-v1.html': 'd9ca4104688b7f7497a7d36fdeb4efe94a1c53d8bd9fdd0e84cc2582a92aaf34',
  '02B-打点计时器规范操作-v1.html': '740925f4b17edbd1cd26bcab38a3f65a81625c8b3064ac9daacaf31895852236',
  '02C-纸带数据处理-v1.html': 'c582e57b6c4c966560b3d085be256547794f556c4e0759bda82d20343df0d30e',
};

for (const [file, expected] of Object.entries(locked)) {
  test(`${file} remains byte locked`, () => {
    assert.equal(createHash('sha256').update(readHtml(file)).digest('hex'), expected);
  });
}

const v2Files = [
  '02A-打点计时器结构与原理-v2.html',
  '02B-打点计时器规范操作-v2.html',
  '02C-纸带数据处理-v2.html',
];

for (const file of v2Files) {
  test(`${file} is offline and uses the shared manual guide contract`, () => {
    const html = readHtml(file);
    assertOfflineSilent(html);
    const I = loadInlineCore(html, 'data-v6-interaction-core').TickerV6InteractionCore;
    const scenarios = { demo: [
      { id:'observe', title:'观察', requiresAssist:false, focusTargets:['stage'] },
      { id:'act', title:'操作', requiresAssist:true, focusTargets:['control'] },
      { id:'groups', title:'分组', requiresAssist:true, assistCount:3, focusTargets:['workbench'] },
    ] };
    let state = I.selectScenario('demo', scenarios);
    assert.deepEqual({ step:state.step, status:state.status }, { step:1, status:'ready' });
    assert.equal(I.reduceGuide(state, { type:'TICK' }, scenarios).step, 1);
    state = I.reduceGuide(state, { type:'NEXT' }, scenarios);
    assert.equal(state.status, 'running');
    assert.equal(I.reduceGuide(state, { type:'NEXT' }, scenarios).step, 2);
    state = I.reduceGuide(state, { type:'ASSIST_START' }, scenarios);
    assert.equal(state.status, 'acting');
    state = I.reduceGuide(state, { type:'ASSIST_COMPLETE' }, scenarios);
    assert.equal(state.status, 'ready');
    state = I.reduceGuide(state, { type:'NEXT' }, scenarios);
    for (let index = 0; index < 3; index += 1) {
      state = I.reduceGuide(state, { type:'ASSIST_START' }, scenarios);
      state = I.reduceGuide(state, { type:'ASSIST_COMPLETE' }, scenarios);
    }
    assert.equal(state.status, 'ready');
    assert.equal(state.substep, 3);
  });
}
```

- [ ] **Step 4: Run the contract test to verify RED**

Run:

```bash
/Users/luogaowei/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/ticker-timer-v2-contract.test.mjs
```

Expected: three v1 hash tests pass; the three v2 tests fail with `missing <script data-v6-interaction-core>`.

- [ ] **Step 5: Add the identical pure interaction core to every v2 file**

Insert this self-contained script before each page's controller script:

```html
<script data-v6-interaction-core>
(function(){
  function stepsFor(state, scenarios){ return state.scenarioId ? scenarios[state.scenarioId] || [] : []; }
  function currentStep(state, scenarios){ return stepsFor(state, scenarios)[state.step - 1] || null; }
  function statusFor(step){ return step && step.requiresAssist ? 'running' : 'ready'; }
  function createGuideState(){ return { scenarioId:null, status:'idle', step:0, substep:0, open:false }; }
  function selectScenario(scenarioId, scenarios){
    var steps=scenarios[scenarioId] || [];
    if(!steps.length) return createGuideState();
    return { scenarioId:scenarioId, status:statusFor(steps[0]), step:1, substep:0, open:true };
  }
  function reduceGuide(state, action, scenarios){
    var steps=stepsFor(state, scenarios), step=currentStep(state, scenarios);
    if(action.type==='SELECT_SCENARIO'||action.type==='REPLAY') return selectScenario(action.scenarioId||state.scenarioId, scenarios);
    if(action.type==='OPEN') return Object.assign({},state,{open:true});
    if(action.type==='CLOSE') return Object.assign({},state,{open:false});
    if(action.type==='EXPLORE') return Object.assign({},state,{status:'explore',open:false});
    if(action.type==='ASSIST_START'&&step&&step.requiresAssist&&state.status==='running') return Object.assign({},state,{status:'acting'});
    if(action.type==='ASSIST_COMPLETE'&&step&&state.status==='acting'){
      var count=step.assistCount||1, next=state.substep+1;
      return Object.assign({},state,{substep:next,status:next>=count?'ready':'running'});
    }
    if(action.type==='NEXT'&&state.status==='ready'){
      if(state.step>=steps.length) return Object.assign({},state,{status:'completed'});
      var nextStep=steps[state.step];
      return Object.assign({},state,{step:state.step+1,substep:0,status:statusFor(nextStep)});
    }
    if(action.type==='PREV'&&state.step>1) return Object.assign({},state,{step:state.step-1,substep:0,status:'ready'});
    return state;
  }
  function guideActionView(state, scenarios){
    var step=currentStep(state, scenarios), completed=state.status==='completed';
    return {
      assistVisible:!!step&&!!step.requiresAssist&&!completed,
      assistDisabled:state.status!=='running',
      assistLabel:state.status==='acting'?'正在操作…':state.status==='ready'?'操作完成':'替我操作',
      previousVisible:!completed&&state.step>0,
      nextVisible:!completed&&state.step>0,
      nextDisabled:state.status!=='ready',
      replayVisible:completed,
      exploreVisible:completed
    };
  }
  function clampFloatingPosition(rect, viewport, margin){
    margin=margin==null?12:margin;
    return {x:Math.max(margin,Math.min(rect.x,viewport.width-rect.width-margin)),y:Math.max(margin,Math.min(rect.y,viewport.height-rect.height-margin))};
  }
  function layoutForViewport(width,height){
    if(width<=960&&height<=540&&width>height) return {kind:'short-landscape',tabs:true,panels:1};
    if(width<=960) return {kind:'narrow',tabs:true,panels:1};
    return {kind:'wide',tabs:false,panels:2};
  }
  window.TickerV6InteractionCore=Object.freeze({createGuideState:createGuideState,selectScenario:selectScenario,reduceGuide:reduceGuide,guideActionView:guideActionView,clampFloatingPosition:clampFloatingPosition,layoutForViewport:layoutForViewport});
})();
</script>
```

- [ ] **Step 6: Run the contract test and the full v1 suite**

Run:

```bash
/Users/luogaowei/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/ticker-timer-v2-contract.test.mjs tests/ticker-timer-02a.test.mjs tests/ticker-timer-02b.test.mjs tests/ticker-timer-02c.test.mjs
```

Expected: all contract tests and the existing 46 v1 tests pass.

- [ ] **Step 7: Commit the v2 foundations**

```bash
git add '02A-打点计时器结构与原理-v2.html' '02B-打点计时器规范操作-v2.html' '02C-纸带数据处理-v2.html' tests/helpers/ticker-v6-test-utils.mjs tests/ticker-timer-v2-contract.test.mjs
git commit -m "feat: establish ticker timer v2 interaction core"
```

---

### Task 2: Implement 02A electromagnetic and spark student-paced scenarios

**Files:**
- Modify: `02A-打点计时器结构与原理-v2.html`
- Create: `tests/ticker-timer-02a-v2.test.mjs`

**Interfaces:**
- Consumes: `window.TickerV6InteractionCore`, `window.TimerPrincipleCore`, `window.TimerPrincipleLesson`, the existing renderer state `S`, camera state `cam`, and existing view/focus helpers.
- Produces: `window.TimerPrincipleV6.SCENARIOS`, `selectPrincipleScenario(id)`, `assistPrincipleStep()`, `restorePrincipleStep(step)`, `renderPrincipleScenarioGuide()`, and the standard DOM IDs `principleEmEntry`, `principleSparkEntry`, `experimentGuideEntry`, `lessonGuide`, `scenarioFocusLayer`.

- [ ] **Step 1: Write 02A v2 RED tests for entry mapping and scenario definitions**

Create `tests/ticker-timer-02a-v2.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readHtml, loadInlineCore, assertOfflineSilent } from './helpers/ticker-v6-test-utils.mjs';

const html = readHtml('02A-打点计时器结构与原理-v2.html');

test('02A exposes two principle scenarios and one guide entry', () => {
  assert.match(html, /id="principleEmEntry"[^>]*>A 电磁式原理</);
  assert.match(html, /id="principleSparkEntry"[^>]*>B 电火花式原理</);
  assert.match(html, /id="experimentGuideEntry"[^>]*>实验指南</);
});

test('02A scenarios use five manual steps and assist only physical setup actions', () => {
  const A = loadInlineCore(html, 'data-principle-v6-scenarios').TimerPrincipleV6;
  assert.deepEqual(Object.keys(A.SCENARIOS), ['em','spark']);
  for (const steps of Object.values(A.SCENARIOS)) {
    assert.equal(steps.length, 5);
    assert.deepEqual(Array.from(steps, step => step.requiresAssist), [false,false,true,true,false]);
    assert.ok(steps.every(step => step.focusTargets.length >= 1));
  }
});

test('02A contains the draggable card, one focus layer, and three guide templates', () => {
  assert.equal((html.match(/class="scenario-focus-layer"/g)||[]).length, 1);
  assert.match(html, /id="lessonGuideHeader"/);
  assert.match(html, /template id="experimentGuideContent"/);
  assert.match(html, /template id="examPointsContent"/);
  assert.match(html, /template id="commonMistakesContent"/);
  assertOfflineSilent(html);
});
```

- [ ] **Step 2: Run 02A v2 tests to verify RED**

Run:

```bash
/Users/luogaowei/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/ticker-timer-02a-v2.test.mjs
```

Expected: fail for missing entry IDs, missing scenario script, focus layer, and guide templates.

- [ ] **Step 3: Replace the in-stage two-button entry with a full-width three-button entry row**

Create a `.stage-column` wrapper in the middle grid column and use:

```html
<nav class="scenario-entry-bar scenario-entry-bar--three" aria-label="原理情境">
  <button type="button" id="principleEmEntry">A 电磁式原理</button>
  <button type="button" id="principleSparkEntry">B 电火花式原理</button>
  <button type="button" id="experimentGuideEntry" aria-haspopup="dialog" aria-expanded="false">实验指南</button>
</nav>
```

CSS contract:

```css
.stage-column{grid-column:2;min-width:0;min-height:0;display:grid;grid-template-rows:auto minmax(0,1fr);gap:10px}
.scenario-entry-bar{display:grid;gap:10px;min-width:0}
.scenario-entry-bar--three{grid-template-columns:repeat(3,minmax(0,1fr))}
.scenario-entry-bar button{min-height:44px;border:1px solid #b9c9f6;border-radius:14px;background:var(--surface-raised);color:var(--action);font-size:var(--type-13);font-weight:800}
.scenario-entry-bar button[aria-pressed="true"]{background:var(--action);border-color:var(--action);color:var(--on-action)}
```

At `≤960px`, place `.stage-column` first. At short landscape, place `.stage-column` in the left column with rows `40px minmax(0,1fr)`.

- [ ] **Step 4: Add exact 02A scenario definitions**

Insert:

```html
<script data-principle-v6-scenarios>
(function(){
  var sharedConclusion={id:'shared-timing',title:'比较两种计时结构',requiresAssist:false,focusTargets:['#principleChain']};
  var SCENARIOS={
    em:[
      {id:'em-path',title:'找到纸带通道和打点位置',requiresAssist:false,focusTargets:['#stageViewport']},
      {id:'em-section',title:'观察电磁式内部剖面',requiresAssist:false,focusTargets:['#emSectionView']},
      {id:'em-drive',title:'让线圈驱动振片',requiresAssist:true,focusTargets:['#stageViewport']},
      {id:'em-mark',title:'完成一次振针打点',requiresAssist:true,focusTargets:['#stageViewport']},
      Object.assign({},sharedConclusion)
    ],
    spark:[
      {id:'spark-path',title:'找到纸带通道和放电位置',requiresAssist:false,focusTargets:['#stageViewport']},
      {id:'spark-section',title:'观察电火花式内部剖面',requiresAssist:false,focusTargets:['#sparkSectionView']},
      {id:'spark-drive',title:'建立脉冲放电条件',requiresAssist:true,focusTargets:['#stageViewport']},
      {id:'spark-mark',title:'完成一次脉冲放电',requiresAssist:true,focusTargets:['#stageViewport']},
      Object.assign({},sharedConclusion)
    ]
  };
  window.TimerPrincipleV6=Object.freeze({SCENARIOS:SCENARIOS});
})();
</script>
```

- [ ] **Step 5: Convert the guide into a draggable overlay and add the focus layer**

Use one focus layer immediately below the modal:

```html
<div class="scenario-focus-layer" id="scenarioFocusLayer" aria-hidden="true"></div>
```

Use `#lessonGuideHeader` as the Pointer Events drag handle. On first pointer movement, compute the card's viewport rect, add `.is-floating`, set `position:fixed`, and update `left/top`; clamp through `TickerV6InteractionCore.clampFloatingPosition`. Re-clamp on `resize`, after toggling `为什么？`, and after every guide render.

Required CSS:

```css
#lessonGuide{position:absolute;z-index:12;left:50%;bottom:76px;width:min(72%,720px);transform:translateX(-50%)}
#lessonGuide.is-floating{position:fixed;z-index:72;left:var(--guide-x);top:var(--guide-y);bottom:auto;transform:none}
#lessonGuideHeader{cursor:grab;touch-action:none}
#lessonGuideHeader:active{cursor:grabbing}
.scenario-focus-layer{position:fixed;z-index:68;pointer-events:none;border:5px solid #9a83ff;box-shadow:0 0 0 7px rgba(154,131,255,.26),0 0 20px 10px rgba(154,131,255,.20),0 0 40px 18px rgba(154,131,255,.13),0 0 64px 28px rgba(154,131,255,.07);animation:scenarioFocusPulse 2.8s ease-in-out infinite}
@media (prefers-reduced-motion:reduce){.scenario-focus-layer{animation:none}}
```

`updateScenarioFocus()` must union all visible `focusTargets`, expand ordinary controls by `32px`, expand the stage/conclusion by `10px`, and hide the layer when the guide is closed.

- [ ] **Step 6: Wire manual guide actions to the verified 02A clock and scene state**

Implement these exact adapters:

```js
var I=window.TickerV6InteractionCore;
var A=window.TimerPrincipleV6;
var pendingSingleMark=null;
function selectPrincipleScenario(id){
  guideElapsed=0;
  principleGuide=I.selectScenario(id,A.SCENARIOS);
  restorePrincipleStep(1);
  resetGuideCardPosition();
  renderPrincipleScenarioGuide();
}
function assistPrincipleStep(){
  var step=A.SCENARIOS[principleGuide.scenarioId][principleGuide.step-1];
  principleGuide=I.reduceGuide(principleGuide,{type:'ASSIST_START'},A.SCENARIOS);
  if(step.id==='em-drive') applyCameraPreset('emSection');
  if(step.id==='spark-drive') applyCameraPreset('sparkSection');
  if(step.id==='em-mark'||step.id==='spark-mark') beginSingleRealMark(step.id);
  if(step.id.endsWith('-drive')) principleGuide=I.reduceGuide(principleGuide,{type:'ASSIST_COMPLETE'},A.SCENARIOS);
  renderPrincipleScenarioGuide();
}
function beginSingleRealMark(stepId){
  S.machine=stepId==='em-mark'?'em':'spark';
  S.powered=true;
  setPlaybackState(true);
  pendingSingleMark={baseline:S.pulseCount};
}
function completePendingSingleMark(){
  if(!pendingSingleMark||S.pulseCount<=pendingSingleMark.baseline)return;
  pendingSingleMark=null;
  S.powered=false;
  setPlaybackState(false);
  principleGuide=I.reduceGuide(principleGuide,{type:'ASSIST_COMPLETE'},A.SCENARIOS);
  renderPrincipleScenarioGuide();
}
```

Call `completePendingSingleMark()` from the existing animation tick immediately after dot-crossing updates. Remove the `maybeAdvanceGuide(dt)` call from the v2 tick and remove guide-only `AUTO_TICK`, dwell timers, and automatic step advancement.

- [ ] **Step 7: Replace the guide dialog with three stable templates and shared modal controller**

Add the three templates, three `role="tab"` buttons, one `role="tabpanel"`, backdrop click, Escape close, left/right arrow tab changes, pause-state capture, resume-on-close, and focus return to `#experimentGuideEntry`. The guide modal must use `z-index:80` and `max-width:760px`.

- [ ] **Step 8: Run 02A v2 and all baseline tests**

Run:

```bash
/Users/luogaowei/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/ticker-timer-02a-v2.test.mjs tests/ticker-timer-v2-contract.test.mjs tests/ticker-timer-02a.test.mjs
```

Expected: all pass; no v1 hash changes.

- [ ] **Step 9: Commit 02A v2**

```bash
git add '02A-打点计时器结构与原理-v2.html' tests/ticker-timer-02a-v2.test.mjs
git commit -m "feat: add student-paced ticker principle scenarios"
```

---

### Task 3: Implement 02B correct-operation student-paced scenario

**Files:**
- Modify: `02B-打点计时器规范操作-v2.html`
- Create: `tests/ticker-timer-02b-v2.test.mjs`

**Interfaces:**
- Consumes: `window.TickerV6InteractionCore`, `window.TimerOperationCore`, existing `dispatchOperation`, `operationState`, `renderCurrentTape`, camera/view code, and the focus/drag/modal DOM contract.
- Produces: `window.TimerOperationV6.SCENARIOS.correct`, `selectCorrectOperation()`, `assistCorrectOperationStep()`, `restoreCorrectOperationStep(step)`, and DOM IDs `correctOperationEntry`, `experimentGuideEntry`, `lessonGuide`, `scenarioFocusLayer`.

- [ ] **Step 1: Write 02B v2 RED tests**

Create tests that assert:

```js
assert.match(html, /id="correctOperationEntry"[^>]*>正确操作</);
assert.match(html, /id="experimentGuideEntry"[^>]*>实验指南</);
assert.doesNotMatch(html, />错误后果<|>错误演示</);
assert.deepEqual(Array.from(B.SCENARIOS.correct, step => step.id), ['fix','thread','power','release','finish']);
assert.ok(B.SCENARIOS.correct.every(step => step.requiresAssist));
```

Also assert one focus layer, `lessonGuideHeader`, the three stable templates, and offline/silent source.

- [ ] **Step 2: Run 02B v2 tests to verify RED**

Run:

```bash
/Users/luogaowei/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/ticker-timer-02b-v2.test.mjs
```

Expected: fail for missing entry IDs, scenario core, focus layer, and templates.

- [ ] **Step 3: Build the two-button full-width entry row and exact scenario definition**

Use:

```html
<nav class="scenario-entry-bar scenario-entry-bar--two" aria-label="规范操作入口">
  <button type="button" id="correctOperationEntry">正确操作</button>
  <button type="button" id="experimentGuideEntry" aria-haspopup="dialog" aria-expanded="false">实验指南</button>
</nav>
```

Define:

```html
<script data-operation-v6-scenarios>
(function(){
  var SCENARIOS={correct:[
    {id:'fix',title:'固定并校正计时器',requiresAssist:true,focusTargets:['#hotspotLayer [data-scene-action="fixTimer"]']},
    {id:'thread',title:'让纸带通过正确通道',requiresAssist:true,focusTargets:['#hotspotLayer [data-scene-action="threadTape"]','#threadTarget']},
    {id:'power',title:'先通电并等待稳定',requiresAssist:true,focusTargets:['#hotspotLayer [data-scene-action="powerOn"]']},
    {id:'release',title:'后释放小车',requiresAssist:true,focusTargets:['#hotspotLayer [data-scene-action="releaseCar"]']},
    {id:'finish',title:'先断电，再取带',requiresAssist:true,focusTargets:['#hotspotLayer [data-scene-action="powerOff"]','#hotspotLayer [data-scene-action="takeTape"]']}
  ]};
  window.TimerOperationV6=Object.freeze({SCENARIOS:SCENARIOS});
})();
</script>
```

Use the same full-width middle-column, responsive placement, draggable-card CSS, focus-layer CSS, and three-template modal DOM required by the global constraints; the v2 file remains self-contained and must include its own code.

- [ ] **Step 4: Replace automatic scheduling with one-step reducer assists**

Delete guide calls to `scheduleAuto()` and keep the physical animation loop. Implement:

```js
var I=window.TickerV6InteractionCore;
var B=window.TimerOperationV6;
var pendingOperationAssist=null;
function assistCorrectOperationStep(){
  var step=B.SCENARIOS.correct[operationGuide.step-1];
  operationGuide=I.reduceGuide(operationGuide,{type:'ASSIST_START'},B.SCENARIOS);
  if(step.id==='fix') dispatchOperation({type:'FIX_TIMER',aligned:true},'assist');
  if(step.id==='thread') dispatchOperation({type:'THREAD_TAPE',throughGuide:true,consumableReady:true},'assist');
  if(step.id==='power'){
    dispatchOperation({type:'POWER_ON'},'assist');
    var pulseBaseline=S.vibPhase;
    waitForOperationState(function(){return S.vibPhase-pulseBaseline>=2;},function(){
      dispatchOperation({type:'MARKING_STABLE'},'assist');
      finishOperationAssist();
    });
    return;
  }
  if(step.id==='release'){
    dispatchOperation({type:'RELEASE_CAR'},'assist');
    waitForOperationState(function(){return operationState.carStopped;},function(){finishOperationAssist();});
    return;
  }
  if(step.id==='finish'){
    dispatchOperation({type:'POWER_OFF'},'assist');
    dispatchOperation({type:'TAKE_TAPE'},'assist');
  }
  finishOperationAssist();
}
function finishOperationAssist(){
  operationGuide=I.reduceGuide(operationGuide,{type:'ASSIST_COMPLETE'},B.SCENARIOS);
  renderOperationGuide();
}
function waitForOperationState(predicate,complete){
  pendingOperationAssist={predicate:predicate,complete:complete};
}
function checkPendingOperationAssist(){
  var pending=pendingOperationAssist;
  if(!pending||!pending.predicate())return;
  pendingOperationAssist=null;
  pending.complete();
}
```

Call `checkPendingOperationAssist()` once from the existing animation tick after vibration, dot, and car-stop updates. `下一步` stays disabled until `operationCompletesGuideStep()` confirms the real reducer state and `ASSIST_COMPLETE` has moved the guide to `ready`. This prevents duplicate completion dispatches and replaces the v1 guide scheduling timers.

- [ ] **Step 5: Preserve free-operation errors without adding an error entry**

Keep `lateOn` and `lateOff` reducer consequences reachable only when the guide is closed or status is `explore`. Put the two explanations in `template#commonMistakesContent`. `现在自己试试` must call `resetOperation(false)`, close the guide, enable manual hotspots, and keep the two recoverable error paths.

- [ ] **Step 6: Add drag, focus, and three-tab guide behavior**

Use the required layer values `12/40/68/72/80`, title-bar Pointer Events, `12px` clamping, one union focus frame, pause/resume around the modal, Escape/backdrop close, arrow-key tabs, and focus return. Step 5's two focus targets must produce one union rectangle rather than two frames.

- [ ] **Step 7: Run 02B v2 and reducer regression tests**

Run:

```bash
/Users/luogaowei/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/ticker-timer-02b-v2.test.mjs tests/ticker-timer-v2-contract.test.mjs tests/ticker-timer-02b.test.mjs
```

Expected: all pass; the correct eight reducer actions still complete with no errors; the two recoverable errors still work in explore mode.

- [ ] **Step 8: Commit 02B v2**

```bash
git add '02B-打点计时器规范操作-v2.html' tests/ticker-timer-02b-v2.test.mjs
git commit -m "feat: add student-paced correct operation lesson"
```

---

### Task 4: Implement 02C one-scenario grouped successive-difference lesson

**Files:**
- Modify: `02C-纸带数据处理-v2.html`
- Create: `tests/ticker-timer-02c-v2.test.mjs`

**Interfaces:**
- Consumes: `window.TickerV6InteractionCore`, `window.SuccessiveDifferenceCore`, `window.SuccessiveDifferenceTeaching`, `window.SuccessiveDifferenceLesson`, existing input controls and tape renderer.
- Produces: `window.SuccessiveDifferenceV6.SCENARIOS.grouped`, `selectGroupedDifference()`, `assistDifferenceStep()`, `restoreDifferenceStep(step, substep)`, DOM IDs `groupedDifferenceEntry`, `experimentGuideEntry`, `lessonGuide`, `scenarioFocusLayer`.

- [ ] **Step 1: Write 02C v2 RED tests**

Create tests that assert:

```js
assert.match(html, /id="groupedDifferenceEntry"[^>]*>分组逐差</);
assert.match(html, /id="experimentGuideEntry"[^>]*>实验指南</);
assert.doesNotMatch(html, />合并验证<\/button>/);
assert.deepEqual(Array.from(C.SCENARIOS.grouped, step => step.id), ['interval','segments','pairings','average','combined']);
assert.deepEqual(Array.from(C.SCENARIOS.grouped, step => step.requiresAssist), [false,false,true,true,false]);
assert.equal(C.SCENARIOS.grouped[2].assistCount, 3);
```

Also assert the three stable templates, one focus layer, draggable header, offline/silent source, ideal segments `[3,5,7,9,11,13]`, and results `[2,2,2] / 2 / 2`.

- [ ] **Step 2: Run 02C v2 tests to verify RED**

Run:

```bash
/Users/luogaowei/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/ticker-timer-02c-v2.test.mjs
```

Expected: fail for missing v2 entry IDs, scenario definition, draggable card, focus layer, and templates.

- [ ] **Step 3: Build the two-button entry row and grouped scenario**

Use:

```html
<nav class="scenario-entry-bar scenario-entry-bar--two" aria-label="逐差法入口">
  <button type="button" id="groupedDifferenceEntry">分组逐差</button>
  <button type="button" id="experimentGuideEntry" aria-haspopup="dialog" aria-expanded="false">实验指南</button>
</nav>
```

Define:

```html
<script data-difference-v6-scenarios>
(function(){
  var SCENARIOS={grouped:[
    {id:'interval',title:'确认计数点时间间隔',requiresAssist:false,focusTargets:['#fixedConditions']},
    {id:'segments',title:'读取六段位移',requiresAssist:false,focusTargets:['#segmentValues']},
    {id:'pairings',title:'依次完成三组逐差',requiresAssist:true,assistCount:3,focusTargets:['#tapeCanvas','#formulaWorkbench']},
    {id:'average',title:'求三个结果的平均值',requiresAssist:true,focusTargets:['#formulaWorkbench','#groupResults']},
    {id:'combined',title:'用合并式验证逐差结果',requiresAssist:false,focusTargets:['#combinedFormula']}
  ]};
  window.SuccessiveDifferenceV6=Object.freeze({SCENARIOS:SCENARIOS});
})();
</script>
```

- [ ] **Step 4: Wire each assist to exactly one existing reducer action**

Implement:

```js
var I=window.TickerV6InteractionCore;
var C=window.SuccessiveDifferenceV6;
function assistDifferenceStep(){
  var step=C.SCENARIOS.grouped[differenceGuide.step-1];
  differenceGuide=I.reduceGuide(differenceGuide,{type:'ASSIST_START'},C.SCENARIOS);
  if(step.id==='pairings'){
    var index=differenceGuide.substep;
    state=T.differenceReducer(state,{type:'SUBMIT_GROUP',index:index,value:2});
  }
  if(step.id==='average') state=T.differenceReducer(state,{type:'SUBMIT_AVERAGE',value:2});
  differenceGuide=I.reduceGuide(differenceGuide,{type:'ASSIST_COMPLETE'},C.SCENARIOS);
  render();
  renderV6Guide();
}
```

Manual correct submissions must dispatch the same `ASSIST_COMPLETE` signal. Step 3 remains on the same guide step while subprogress moves `1/3 → 2/3 → 3/3`; only after the third correct group does the state become `ready`. No timer may dispatch `NEXT`.

- [ ] **Step 5: Convert the guide card, focus layer, and modal**

Use the required default/floating positions and layers. The pairings focus frame must union the tape's active pair and the workbench into one rectangle. The guide dialog uses the three stable templates; put unit conversion and method in `实验指南`, exam formula recognition in `常考点`, and wrong denominator/pairing order in `易错点`.

- [ ] **Step 6: Remove duplicated teaching navigation from side panels**

Keep fixed conditions and current numeric results, but remove or hide the duplicate left-side step controller. Preserve the paper scale, A–G labels, six segment values, group inputs, average input, combined formula, reset, and parameter/observe mobile tabs.

- [ ] **Step 7: Implement explore reset without changing the ideal tape**

`现在自己试试` must call the existing reducer `RESET`, set mode to explore, clear group and average answers, keep the same ideal tape, close the guide, hide the focus layer, and enable manual segment/pair selection.

- [ ] **Step 8: Run 02C v2 and calculation regression tests**

Run:

```bash
/Users/luogaowei/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/ticker-timer-02c-v2.test.mjs tests/ticker-timer-v2-contract.test.mjs tests/ticker-timer-02c.test.mjs
```

Expected: all pass; ideal data and every `2.00 m/s²` result remain unchanged.

- [ ] **Step 9: Commit 02C v2**

```bash
git add '02C-纸带数据处理-v2.html' tests/ticker-timer-02c-v2.test.mjs
git commit -m "feat: add student-paced grouped difference lesson"
```

---

### Task 5: Integrated responsive, modal, drag, focus, and completion verification

**Files:**
- Modify only if verification exposes a defect: the affected `v2` HTML and its matching `*-v2.test.mjs`
- Create: `docs/superpowers/reports/2026-08-11-ticker-timer-v2-v6-baseline-qa.md`

**Interfaces:**
- Consumes: all three v2 pages and all v1/v2 tests.
- Produces: final browser evidence, inline-script parse evidence, and a clean merge-ready branch.

- [ ] **Step 1: Run the complete automated suite**

Run:

```bash
/Users/luogaowei/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/ticker-timer-02a.test.mjs tests/ticker-timer-02b.test.mjs tests/ticker-timer-02c.test.mjs tests/ticker-timer-v2-contract.test.mjs tests/ticker-timer-02a-v2.test.mjs tests/ticker-timer-02b-v2.test.mjs tests/ticker-timer-02c-v2.test.mjs
```

Expected: zero failures.

- [ ] **Step 2: Parse every inline script and scan offline/silent constraints**

Use `vm.Script` to parse every inline script in all six HTML files. Run `git diff --check`. Fail if a v2 file contains an external script/style link, `<audio>`, `new Audio`, or `speechSynthesis`.

- [ ] **Step 3: Start the local-only preview**

Run from the worktree root:

```bash
python3 -m http.server 4173 --bind 127.0.0.1
```

Open each v2 through `http://127.0.0.1:4173/` in the in-app browser.

- [ ] **Step 4: Verify the responsive matrix**

For each v2 page, test `1180×820`, `1024×768`, `960×768`, `960×540`, and `834×1194`:

- exact single `h1` and always-visible `11px` eyebrow;
- entry bar and stage share left/right edges;
- 02A has three equal entries; 02B/02C have two equal entries;
- `1024px` keeps three columns and the stage column is wider than either side panel;
- narrow layouts show stage before tabs and exactly one panel;
- short landscape keeps entry + stage left and tabs + panel right;
- no horizontal document overflow.

- [ ] **Step 5: Verify student-paced guide behavior**

For every scenario:

- open the scenario and wait at least three seconds; step number must not change;
- observation steps show no assist button and allow explicit next;
- action steps show `替我操作`, keep next disabled, show `正在操作…`, then `操作完成` after the verified physical/reducer state;
- explicit next advances exactly one step;
- previous restores the specified snapshot;
- close preserves current physical state;
- `现在自己试试` resets to scenario initial state and enables manual controls.

- [ ] **Step 6: Verify drag and layer geometry**

At `1180×820`, drag each guide card from its title bar upward and sideways:

- body and button drags do not move it;
- first title drag changes it to fixed positioning;
- card stays at least `12px` from viewport edges;
- step changes and `为什么？` preserve/clamp its position;
- the guide card is above the purple frame after dragging;
- the guide modal is above both;
- the purple layer does not block underlying clicks and has no text label.

- [ ] **Step 7: Verify the three-tab experiment guide**

On each page:

- open the modal while the physical animation is playing and confirm pause;
- change tabs by click and left/right arrow;
- close by button, Escape, and backdrop in separate runs;
- confirm the pre-open play/pause state is restored;
- confirm focus returns to the guide entry;
- confirm long content scrolls inside the modal without moving the page.

- [ ] **Step 8: Record evidence and commit any test-first QA fix**

Write the tested sizes, flow results, console result, test count, hashes, and residual concerns to `docs/superpowers/reports/2026-08-11-ticker-timer-v2-v6-baseline-qa.md`. If a defect is found, add a failing test to the affected `*-v2.test.mjs`, run RED, implement the minimal fix, rerun GREEN, and record the fix.

- [ ] **Step 9: Request final code review**

Use `superpowers:requesting-code-review` against the spec and this plan. Resolve every Critical or Important finding through the same test-first loop; do not expand scope for optional improvements.

- [ ] **Step 10: Run final verification and commit the QA report**

Re-run the complete suite, inline parse, offline/silent scan, `git diff --check`, and `git status --short`. Then commit:

```bash
git add docs/superpowers/reports/2026-08-11-ticker-timer-v2-v6-baseline-qa.md
git commit -m "test: verify ticker timer v2 interaction baseline"
```

Expected: clean worktree and zero test failures.
