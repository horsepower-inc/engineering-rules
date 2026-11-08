#!/usr/bin/env node
// Copies the shared text rules (adr/, agents/, templates/) into the project's .rules/ and, with --agents, writes
// agents/AGENTS.base.md between markers in the project's AGENTS.md. --check compares instead of writing and exits 1 on
// drift. Runs from the installed package: no network.
import { existsSync, mkdirSync, readdirSync, readFileSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const BEGIN = '<!-- engineering-rules:begin -->';
const END = '<!-- engineering-rules:end -->';
const FOLDERS = ['adr', 'agents', 'templates'];

export function parseArgs(argv) {
  const args = { check: false, agents: null, target: '.rules', cwd: process.cwd() };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--check') args.check = true;
    else if (a === '--agents') args.agents = argv[++i];
    else if (a === '--target') args.target = argv[++i];
    else if (a === '--cwd') args.cwd = argv[++i];
    else if (a === '--help' || a === '-h') args.help = true;
    else throw new Error(`unknown argument: ${a}`);
  }
  if (args.agents === undefined || args.target === undefined || args.cwd === undefined) throw new Error('missing value');
  return args;
}

function files(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? files(join(dir, e.name)) : [join(dir, e.name)],
  );
}

/** The files the target folder must contain: relative path → content. */
export function expected(source) {
  const pkg = JSON.parse(readFileSync(join(source, 'package.json'), 'utf8'));
  const out = new Map();
  for (const folder of FOLDERS) {
    for (const file of files(join(source, folder))) out.set(relative(source, file).split('\\').join('/'), readFileSync(file, 'utf8'));
  }
  out.set('VERSION', `${pkg.version}\n`);
  out.set('README.md', `# .rules\n\nCopied from horsepower-inc/engineering-rules v${pkg.version} by rules-sync. Do not edit: change the\nrules there and bump the pinned version.\n`);
  return out;
}

export function agentsBlock(source) {
  return `${BEGIN}\n${readFileSync(join(source, 'agents', 'AGENTS.base.md'), 'utf8').trimEnd()}\n${END}`;
}

/** AGENTS.md with the shared block inserted or replaced. A file without markers gets the block at the top. */
export function withBlock(text, block) {
  const start = text.indexOf(BEGIN);
  const end = text.indexOf(END);
  if (start !== -1 && end > start) return text.slice(0, start) + block + text.slice(end + END.length);
  if (start !== -1 || end !== -1) throw new Error('AGENTS.md has only one engineering-rules marker');
  return `${block}\n\n${text}`;
}

export function sync({ source, cwd, target, agents, check }) {
  const want = expected(source);
  const dir = resolve(cwd, target);
  const drift = [];
  const have = new Map(files(dir).map((f) => [relative(dir, f).split('\\').join('/'), readFileSync(f, 'utf8')]));
  for (const [path, content] of want) if (have.get(path) !== content) drift.push(`${target}/${path}`);
  for (const path of have.keys()) if (!want.has(path)) drift.push(`${target}/${path} (not in the rules)`);
  let agentsText = null;
  if (agents) {
    const path = resolve(cwd, agents);
    const current = existsSync(path) ? readFileSync(path, 'utf8') : '';
    agentsText = withBlock(current, agentsBlock(source));
    if (agentsText !== current) drift.push(`${agents} (engineering-rules block)`);
  }
  if (check || drift.length === 0) return drift;
  rmSync(dir, { recursive: true, force: true });
  for (const [path, content] of want) {
    mkdirSync(dirname(join(dir, path)), { recursive: true });
    writeFileSync(join(dir, path), content);
  }
  if (agents) writeFileSync(resolve(cwd, agents), agentsText);
  return drift;
}

// Package managers start bins through a symlink (node_modules/.bin, node_modules/@scope/pkg); Node resolves
// import.meta.url to the real path, so compare real paths or the CLI silently does nothing.
const isMain = process.argv[1] && realpathSync(resolve(process.argv[1])) === realpathSync(fileURLToPath(import.meta.url));
if (isMain) {
  try {
    const args = parseArgs(process.argv.slice(2));
    if (args.help) {
      console.log('rules-sync [--check] [--agents AGENTS.md] [--target .rules] [--cwd <dir>]');
      process.exit(0);
    }
    const source = resolve(dirname(fileURLToPath(import.meta.url)), '..');
    const drift = sync({ source, ...args });
    if (args.check && drift.length) {
      console.error(`rules-sync: out of date with the pinned engineering-rules version:\n  ${drift.join('\n  ')}\nRun: pnpm exec rules-sync${args.agents ? ` --agents ${args.agents}` : ''}`);
      process.exit(1);
    }
    console.log(args.check ? 'rules-sync: up to date' : drift.length ? `rules-sync: updated ${drift.length} file(s)` : 'rules-sync: already up to date');
  } catch (error) {
    console.error(`rules-sync: ${error.message}`);
    process.exit(2);
  }
}
