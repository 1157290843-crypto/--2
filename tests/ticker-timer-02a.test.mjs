import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import vm from 'node:vm';

export const repoRoot = resolve(import.meta.dirname, '..');
export const sourcePath = '/Users/luogaowei/Documents/网站全部动画/第二次全量改版/02-打点计时器三维互动实验.html';
export const outputPath = resolve(repoRoot, '02A-打点计时器结构与原理-v1.html');
const approvedHash = '32a77ec92628599b924add2a3a8babc1571f45ec95c6efaff04b948e4b79d12d';

export function read02A() {
  return readFileSync(outputPath, 'utf8');
}

export function loadInlineCore(attributeName) {
  const pattern = new RegExp(`<script\\s+${attributeName}[^>]*>([\\s\\S]*?)<\\/script>`);
  const match = read02A().match(pattern);
  assert.ok(match, `missing <script ${attributeName}>`);
  return match[1];
}

function loadPrincipleCore() {
  const window = {};
  vm.runInNewContext(loadInlineCore('data-principle-core'), { window, Math, Object, Array });
  return window.TimerPrincipleCore;
}

test('50 Hz produces an exact 0.02 second interval', () => {
  const P = loadPrincipleCore();
  assert.equal(P.intervalForFrequency(50), 0.02);
});

test('dot crossings are independent of animation frame boundaries', () => {
  const P = loadPrincipleCore();
  assert.deepEqual(Array.from(P.dotTimesBetween(0, 0.061, 50), value => +value.toFixed(6)), [0.02, 0.04, 0.06]);
  assert.deepEqual(Array.from(P.dotTimesBetween(0.019, 0.041, 50), value => +value.toFixed(6)), [0.02, 0.04]);
});

test('machine definitions distinguish voltage and marking mechanism', () => {
  const P = loadPrincipleCore();
  assert.equal(P.MACHINES.em.power, '4~6 V 交流');
  assert.equal(P.MACHINES.em.marking, '振针与复写纸');
  assert.equal(P.MACHINES.spark.power, '220 V 交流');
  assert.equal(P.MACHINES.spark.marking, '脉冲放电与墨粉纸盘');
});

test('the approved source remains hash locked', () => {
  const digest = createHash('sha256').update(readFileSync(sourcePath)).digest('hex');
  assert.equal(digest, approvedHash);
});

test('02A preserves the approved baseline and remains offline and silent', () => {
  const html = read02A();

  assert.doesNotMatch(html, /<script[^>]+src=/i);
  assert.doesNotMatch(html, /<link[^>]+href=/i);
  assert.doesNotMatch(html, /<audio|new Audio|speechSynthesis/i);
});
