# Ticker Timer Guidance and Layout Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring all three ticker-timer HTML lessons into the current title, responsive-layout, and student-autoplay standards while preserving their verified physics cores.

**Architecture:** Each self-contained HTML keeps its existing renderer and domain reducer, and gains the same small `data-student-guide-core` contract for five-stage autoplay state plus a page-specific controller adapter. CSS is migrated through a final standards layer: unified header, wide three-column layout, narrow single-panel tabs, and short-landscape stage/right-panel layout. Existing Node tests cover pure behavior; browser tests verify real layout and interaction.

**Tech Stack:** Self-contained HTML/CSS/JavaScript, Canvas/WebGL-style existing renderers, Node.js `node:test`, local `127.0.0.1` static preview, in-app Chromium browser.

## Global Constraints

- Modify only the three existing v1 outputs, their three tests, and this task's QA report; do not overwrite the original source HTML.
- Preserve 02A/02B 3D internals, material/lighting quality, physics timing, operation reducer, and 02C ideal successive-difference calculations.
- Use exactly the standard visible font sizes `20/16/14/13/12/11px` and the visual-standard color semantics.
- Keep the page fully offline, self-contained, and silent; add no audio resources, controls, APIs, or placeholders.
- At `1024px` keep three columns; at `≤960px` show panel tabs and one active panel; at `≤960×540` place stage left and active panel right.
- Use titles: `打点计时器｜结构怎样形成等时点迹`, `打点计时器｜按正确顺序完成实验`, `纸带逐差法｜用六段位移求加速度`.
- Browser automation must use a temporary server listening only on `127.0.0.1`, never `file://`.

---

### Task 1: 02A structure-and-principle lesson

**Files:**
- Modify: `tests/ticker-timer-02a.test.mjs`
- Modify: `02A-打点计时器结构与原理-v1.html`

**Interfaces:**
- Consumes: existing `TimerPrincipleCore`, `TimerPrincipleLesson`, renderer camera presets, and physical-time clock.
- Produces: `window.StudentGuideCore` with `GUIDE_STEPS`, `createGuideState()`, `guideReducer(state, action)`, and `layoutForViewport(width, height)`; visible `#lessonGuide`, `#experimentGuideDialog`, `#panelTabs`.

- [ ] **Step 1: Write failing runtime tests**

Add tests that load `<script data-student-guide-core>` and assert:

```js
assert.equal(G.GUIDE_STEPS.length, 5);
assert.deepEqual(Array.from(G.GUIDE_STEPS, s => s.focus), [
  'paper-path', 'em-drive', 'needle-mark', 'spark-mark', 'shared-timing'
]);
let state = G.guideReducer(G.createGuideState(), { type: 'START' });
assert.equal(state.status, 'running');
assert.equal(state.step, 1);
state = G.guideReducer(state, { type: 'PAUSE' });
assert.equal(G.guideReducer(state, { type: 'SIGNAL_COMPLETE' }).step, 1);
```

Replace the obsolete `960×540` three-column assertion with wide/narrow/short assertions:

```js
assert.equal(G.layoutForViewport(1024, 768).kind, 'wide');
assert.equal(G.layoutForViewport(960, 768).kind, 'narrow');
assert.equal(G.layoutForViewport(960, 540).kind, 'short-landscape');
```

- [ ] **Step 2: Run RED**

Run: `node --test tests/ticker-timer-02a.test.mjs`

Expected: failures because `data-student-guide-core` is missing and the old layout contract still returns three columns at `960×540`.

- [ ] **Step 3: Implement the five-stage guide core and adapter**

Add the approved five stages. `START` resets to step 1, `PAUSE/RESUME` gate signals, `SIGNAL_COMPLETE` advances only while running, and the final signal yields `status:'completed'`. Bind stage entry buttons to the controller; drive step completion from the retained clock/marking state instead of a second animation.

- [ ] **Step 4: Implement the standard header, responsive layout, and aligned progress rows**

Use the exact grid header template. Put two entry buttons above the central stage, the compact step strip inside the stage above its toolbar, and the detailed guide in a modal. Replace content-centering in visible step rows with a fixed grid such as `40px minmax(0,1fr)` so every number, title, and description shares the same x positions. Implement accessible `参数设置 / 观察数据` tabs without resetting renderer state.

- [ ] **Step 5: Run GREEN and commit**

Run: `node --test tests/ticker-timer-02a.test.mjs`

Expected: all 02A tests pass.

Commit: `fix: align and modernize ticker timer 02A guide`

---

### Task 2: 02B规范操作 lesson

**Files:**
- Modify: `tests/ticker-timer-02b.test.mjs`
- Modify: `02B-打点计时器规范操作-v1.html`

**Interfaces:**
- Consumes: existing `TimerOperationCore` reducer and direct-operation renderer/controller.
- Produces: the same `window.StudentGuideCore` API, with five operation stages and reducer-snapshot restoration for step replay.

- [ ] **Step 1: Write failing runtime tests**

Assert the five stage focuses are `fix`, `thread`, `power`, `release`, `finish`; `SIGNAL_COMPLETE` cannot advance while paused; `NEXT` cannot bypass a stage with `requiresSignal:true`; and the final stage completes only after the underlying operation state reports power off and tape removed. Add wide/narrow/short layout assertions matching Task 1.

- [ ] **Step 2: Run RED**

Run: `node --test tests/ticker-timer-02b.test.mjs`

Expected: guide-core and new responsive-layout assertions fail.

- [ ] **Step 3: Implement guide orchestration through the real operation reducer**

The autoplay adapter dispatches the same verified actions as a correct student sequence: `FIX_TIMER`, `THREAD_TAPE`, `POWER_ON`, stable-mark signal, `RELEASE_CAR`, stop signal, `POWER_OFF`, and `TAKE_TAPE`. It waits for the renderer/operation state to confirm each physical stage. Manual mode retains late-on and late-off recoverable consequences.

- [ ] **Step 4: Apply the standard shell and interaction pattern**

Use the new title and header grid, two central-stage entries, in-stage step strip, independent guide modal, standard panel tabs, and wide/narrow/short layout. Keep the 3D drag targets and all existing error recovery paths. Ensure guide overlays do not intercept unrelated scene drag gestures when hidden.

- [ ] **Step 5: Run GREEN and commit**

Run: `node --test tests/ticker-timer-02b.test.mjs`

Expected: all 02B tests pass.

Commit: `fix: modernize ticker timer 02B operation guide`

---

### Task 3: 02C successive-difference lesson

**Files:**
- Modify: `tests/ticker-timer-02c.test.mjs`
- Modify: `02C-纸带数据处理-v1.html`

**Interfaces:**
- Consumes: existing `SuccessiveDifferenceCore`, deterministic tape positions, and calculation view core.
- Produces: the same `window.StudentGuideCore` API with five top-level stages and `substep` values `0..2` during the three successive-difference pairings.

- [ ] **Step 1: Write failing runtime tests**

Assert five stages, ideal fixed inputs, and the ordered pairing subprogress:

```js
let state = G.guideReducer(G.createGuideState(), { type: 'START' });
state = G.guideReducer(state, { type: 'SIGNAL_COMPLETE' }); // T′
state = G.guideReducer(state, { type: 'SIGNAL_COMPLETE' }); // read six segments
assert.equal(state.step, 3);
assert.equal(state.substep, 0);
state = G.guideReducer(state, { type: 'SIGNAL_COMPLETE' });
assert.equal(state.step, 3);
assert.equal(state.substep, 1);
```

After three pairing signals, assert step 4; after average and combined-formula signals, assert completion. Add the same layout breakpoint contract.

- [ ] **Step 2: Run RED**

Run: `node --test tests/ticker-timer-02c.test.mjs`

Expected: missing guide-core and five-stage assertions fail against the old seven-step shell.

- [ ] **Step 3: Implement the five-stage wrapper without changing the calculation core**

Keep the three real pairings and all exact `2.00 m/s²` results. Represent them as subprogress inside top-level stage 3, highlighting only one pair at a time. Auto mode submits the same real calculations; `现在自己试试` resets the workbench for student input while preserving the ideal tape.

- [ ] **Step 4: Apply the standard shell and responsive tabs**

Use the new title/header, two stage entries, in-stage step strip, guide modal, and panel tab behavior. Preserve the fixed-scale tape and prevent the guide strip from covering A—G marks, segment labels, inputs, or formula workbench.

- [ ] **Step 5: Run GREEN and commit**

Run: `node --test tests/ticker-timer-02c.test.mjs`

Expected: all 02C tests pass.

Commit: `fix: modernize ticker timer 02C difference guide`

---

### Task 4: Integrated browser verification and delivery

**Files:**
- Create: `.superpowers/sdd/2026-08-11-ticker-timer-guidance-layout-refresh/final-build-report.md`
- Modify only if defects are found: the three HTML files and matching tests.

**Interfaces:**
- Consumes: all three completed pages and test suites.
- Produces: verified screenshots/measurements and a concise build report.

- [ ] **Step 1: Run the complete automated suite and syntax checks**

Run:

```bash
node --test tests/ticker-timer-02a.test.mjs tests/ticker-timer-02b.test.mjs tests/ticker-timer-02c.test.mjs
git diff --check
```

Extract each inline script and parse it with `node --check`; expected: no syntax errors.

- [ ] **Step 2: Start a local-only preview**

Start a temporary static server bound to `127.0.0.1` from the repository root. Record its PID and stop it after QA.

- [ ] **Step 3: Verify four target viewports in all three pages**

At `1180×820`, verify three columns and no mobile tabs. At `1024×768`, verify the middle stage remains wider than either panel. At `960×768`, verify stage-first stacking and one active panel. At `960×540`, verify stage-left/right-panel layout, visible header, and no horizontal overflow.

- [ ] **Step 4: Verify title, A alignment, tab preservation, and full guide flow**

Measure the header brand x-position and ensure it follows the fixed return slot instead of moving to the right edge. In 02A, compare progress-row number and text x-coordinates. Toggle `参数设置 / 观察数据` and assert experiment state is unchanged. Run A/B/C demos from start to completion, including pause/resume, close/continue, replay, and `现在自己试试`.

- [ ] **Step 5: Write report, rerun verification, and commit fixes/report**

The report records test totals, script parse results, viewports checked, browser interaction results, and any residual concern. Run the complete suite again after the final edit.

Commit: `fix: finish ticker timer guidance and layout refresh`
