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

test('the factory profile writes the base rules and the factory rules, not the service rules', () => {
  const cwd = mkdtempSync(join(tmpdir(), 'sync-'));
  writeFileSync(join(cwd, 'AGENTS.md'), '# Project\n');
  sync({ source, cwd, target: '.rules', agents: 'AGENTS.md', check: false, profile: 'factory' });
  const agents = readFileSync(join(cwd, 'AGENTS.md'), 'utf8');
  assert.match(agents, /## Engineering rules/u);
  assert.match(agents, /## Profile: factory/u);
  assert.doesNotMatch(agents, /## Profile: service/u);
  assert.deepEqual(sync({ source, cwd, target: '.rules', agents: 'AGENTS.md', check: true, profile: 'factory' }), []);
  assert.deepEqual(sync({ source, cwd, target: '.rules', agents: 'AGENTS.md', check: true }), ['AGENTS.md (engineering-rules block)']);
});

test('the default profile is service and an unknown profile is refused', () => {
  const cwd = mkdtempSync(join(tmpdir(), 'sync-'));
  sync({ source, cwd, target: '.rules', agents: 'AGENTS.md', check: false });
  assert.match(readFileSync(join(cwd, 'AGENTS.md'), 'utf8'), /## Profile: service/u);
  assert.throws(() => sync({ source, cwd, target: '.rules', agents: 'AGENTS.md', check: true, profile: 'web' }), /unknown profile: web/u);
  assert.equal(parseArgs(['--profile', 'factory']).profile, 'factory');
  assert.throws(() => parseArgs(['--profile']), /missing value/u);
});

test('the CLI runs when started through a symlink, as package-manager bin shims do', async () => {
  const { spawnSync } = await import('node:child_process');
  const { symlinkSync, mkdirSync } = await import('node:fs');
  const cwd = mkdtempSync(join(tmpdir(), 'sync-'));
  const link = join(cwd, 'node_modules', 'engineering-rules');
  mkdirSync(dirname(link), { recursive: true });
  symlinkSync(source, link, 'dir');
  const cli = join(link, 'bin', 'rules-sync.mjs');
  const check = spawnSync(process.execPath, [cli, '--check'], { cwd, encoding: 'utf8' });
  assert.equal(check.status, 1, 'a missing .rules is drift');
  assert.match(check.stderr, /out of date/u);
  const write = spawnSync(process.execPath, [cli], { cwd, encoding: 'utf8' });
  assert.equal(write.status, 0);
  assert.ok(existsSync(join(cwd, '.rules/VERSION')));
  assert.equal(spawnSync(process.execPath, [cli, '--check'], { cwd, encoding: 'utf8' }).status, 0);
});
