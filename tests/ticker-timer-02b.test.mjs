import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const repoRoot = resolve(import.meta.dirname, '..');
const sourcePath = '/Users/luogaowei/Documents/网站全部动画/第二次全量改版/02-打点计时器三维互动实验.html';
const outputPath = resolve(repoRoot, '02B-打点计时器规范操作-v1.html');

const read02B = () => readFileSync(outputPath, 'utf8');

function loadInlineCore(attributeName) {
  const match = read02B().match(new RegExp(`<script\\s+${attributeName}[^>]*>([\\s\\S]*?)<\\/script>`));
  assert.ok(match, `missing <script ${attributeName}>`);
  return match[1];
}

test('source is unchanged and 02B is an offline silent single file', () => {
  const sourceHash = createHash('sha256').update(readFileSync(sourcePath)).digest('hex');

  assert.equal(sourceHash, '32a77ec92628599b924add2a3a8babc1571f45ec95c6efaff04b948e4b79d12d');
  assert.doesNotThrow(read02B);
  const html = read02B();
  assert.doesNotMatch(html, /<script[^>]+src=|<link[^>]+href=|<audio|new Audio|speechSynthesis/i);
});

export { read02B, loadInlineCore };
