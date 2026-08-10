import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import vm from 'node:vm';

const repoRoot = resolve(import.meta.dirname, '..');
const sourcePath = '/Users/luogaowei/Documents/网站全部动画/第二次全量改版/02-打点计时器三维互动实验.html';
const outputPath = resolve(repoRoot, '02C-纸带数据处理-v1.html');

export const read02C = () => readFileSync(outputPath, 'utf8');

export function loadInlineCore(attributeName) {
  const match = read02C().match(
    new RegExp(`<script\\s+${attributeName}[^>]*>([\\s\\S]*?)<\\/script>`),
  );
  assert.ok(match, `missing <script ${attributeName}>`);
  return match[1];
}

function loadDifferenceCore() {
  const window = {};
  vm.runInNewContext(loadInlineCore('data-successive-difference-core'), { window, Object, Array, Math });
  return window.SuccessiveDifferenceCore;
}

test('protects the locked source and keeps 02C offline, silent, and self-contained', () => {
  const sourceHash = createHash('sha256')
    .update(readFileSync(sourcePath))
    .digest('hex');
  assert.equal(sourceHash, '32a77ec92628599b924add2a3a8babc1571f45ec95c6efaff04b948e4b79d12d');

  const html = read02C();
  assert.doesNotMatch(html, /<script[^>]+src=|<link[^>]+href=/i);
  assert.doesNotMatch(html, /<audio|new Audio|speechSynthesis/i);
});

test('fixed ideal tape has the approved six segment lengths', () => {
  const D = loadDifferenceCore();
  const positions = D.generatePositions(D.CONFIG);
  const segmentsCm = D.segmentDisplacements(positions).map(value => +(value * 100).toFixed(10));
  assert.deepEqual(Array.from(segmentsCm), [3, 5, 7, 9, 11, 13]);
});

test('all three successive differences and both averages equal 2 m/s squared', () => {
  const D = loadDifferenceCore();
  const segments = D.segmentDisplacements(D.generatePositions(D.CONFIG));
  const result = D.analyzeSuccessiveDifferences(segments, D.CONFIG.interval);
  assert.deepEqual(Array.from(result.groupAccelerations, value => +value.toFixed(12)), [2, 2, 2]);
  assert.equal(+result.average.toFixed(12), 2);
  assert.equal(+result.combined.toFixed(12), 2);
});

test('pairings use every segment exactly once on each side', () => {
  const D = loadDifferenceCore();
  assert.deepEqual(JSON.parse(JSON.stringify(D.PAIRINGS)), [[0, 3], [1, 4], [2, 5]]);
});
