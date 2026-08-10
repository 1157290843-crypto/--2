import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

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

test('the approved source remains hash locked', () => {
  const digest = createHash('sha256').update(readFileSync(sourcePath)).digest('hex');
  assert.equal(digest, approvedHash);
});

test('02A preserves the approved baseline and remains offline and silent', () => {
  const html = read02A();
  const digest = createHash('sha256').update(html).digest('hex');

  assert.equal(digest, approvedHash);
  assert.doesNotMatch(html, /<script[^>]+src=/i);
  assert.doesNotMatch(html, /<link[^>]+href=/i);
  assert.doesNotMatch(html, /<audio|new Audio|speechSynthesis/i);
});
