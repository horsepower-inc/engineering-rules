import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs, sync, withBlock } from '../bin/rules-sync.mjs';

const source = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const version = JSON.parse(readFileSync(join(source, 'package.json'), 'utf8')).version;

test('sync writes .rules and the AGENTS block, then --check is clean', () => {
  const cwd = mkdtempSync(join(tmpdir(), 'sync-'));
  writeFileSync(join(cwd, 'AGENTS.md'), '# Project\n\nOwn rules.\n');
  const first = sync({ source, cwd, target: '.rules', agents: 'AGENTS.md', check: false });
  assert.ok(first.length > 0);
  assert.equal(readFileSync(join(cwd, '.rules/VERSION'), 'utf8'), `${version}\n`);
  assert.ok(existsSync(join(cwd, '.rules/adr/0001-features-not-layers.md')));
  const agents = readFileSync(join(cwd, 'AGENTS.md'), 'utf8');
  assert.match(agents, /<!-- engineering-rules:begin -->\n## Engineering rules/u);
  assert.match(agents, /Own rules\./u);
  assert.deepEqual(sync({ source, cwd, target: '.rules', agents: 'AGENTS.md', check: true }), []);
});

test('--check reports a local edit and an extra file without writing', () => {
  const cwd = mkdtempSync(join(tmpdir(), 'sync-'));
  sync({ source, cwd, target: '.rules', agents: null, check: false });
  writeFileSync(join(cwd, '.rules/adr/0002-access-policies.md'), 'edited');
  writeFileSync(join(cwd, '.rules/extra.md'), 'x');
  const drift = sync({ source, cwd, target: '.rules', agents: null, check: true });
  assert.deepEqual(drift.sort(), ['.rules/adr/0002-access-policies.md', '.rules/extra.md (not in the rules)']);
  assert.equal(readFileSync(join(cwd, '.rules/adr/0002-access-policies.md'), 'utf8'), 'edited');
});

test('a second sync is a no-op', () => {
  const cwd = mkdtempSync(join(tmpdir(), 'sync-'));
  sync({ source, cwd, target: '.rules', agents: 'AGENTS.md', check: false });
  assert.deepEqual(sync({ source, cwd, target: '.rules', agents: 'AGENTS.md', check: false }), []);
});

test('withBlock replaces an existing block and refuses a single marker', () => {
  const text = 'a\n<!-- engineering-rules:begin -->\nold\n<!-- engineering-rules:end -->\nb\n';
  assert.equal(withBlock(text, 'NEW'), 'a\nNEW\nb\n');
  assert.throws(() => withBlock('<!-- engineering-rules:begin -->', 'NEW'), /only one/u);
});

test('parseArgs rejects unknown and missing values', () => {
  assert.deepEqual(parseArgs(['--check', '--agents', 'AGENTS.md']).agents, 'AGENTS.md');
  assert.throws(() => parseArgs(['--nope']), /unknown argument/u);
  assert.throws(() => parseArgs(['--agents']), /missing value/u);
});
