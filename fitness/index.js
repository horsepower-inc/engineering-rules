// Reusable architecture checks. Each returns a list of violations (strings); a project test asserts it is empty.
// No dependencies: plain Node, so the checks run in any test runner.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const SOURCE = /\.(ts|tsx|js|jsx|mjs|cjs)$/u;
const TEST = /\.(test|spec)\.(ts|tsx|js|jsx|mjs)$|\.test-d\.ts$/u;

/** All source files under `dir` (relative to `cwd`), skipping node_modules, dist and test files unless asked. */
export function sourceFiles(dir, { cwd = process.cwd(), tests = false } = {}) {
  const base = join(cwd, dir);
  if (!existsSync(base)) return [];
  const out = [];
  const walk = (path) => {
    for (const entry of readdirSync(path, { withFileTypes: true })) {
      if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name.startsWith('.')) continue;
      const full = join(path, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (SOURCE.test(entry.name) && (tests || !TEST.test(entry.name))) out.push(relative(cwd, full).split(sep).join('/'));
    }
  };
  walk(base);
  return out.sort();
}

function globToRegExp(glob) {
  let re = '';
  for (let i = 0; i < glob.length; i += 1) {
    const c = glob[i];
    if (c === '*' && glob[i + 1] === '*') {
      re += glob[i + 2] === '/' ? '(?:.*/)?' : '.*';
      i += glob[i + 2] === '/' ? 2 : 1;
    } else if (c === '*') re += '[^/]*';
    else if (c === '?') re += '[^/]';
    else re += c.replace(/[.+^${}()|[\]\\]/gu, '\\$&');
  }
  return new RegExp(`^${re}$`, 'u');
}

/** True when `path` matches any of the globs (`**`, `*`, `?`). */
export function matchesAny(path, globs = []) {
  return globs.some((glob) => globToRegExp(glob).test(path));
}

/**
 * ADR 0001. Every top-level folder under `root` is a feature with an `index.ts` (or `index.js`), or the shared folder;
 * top-level files are only the allowed entry files.
 */
export function featureShape({ root, shared = 'shared', entryFiles = [], allowFolders = [], cwd = process.cwd() }) {
  const base = join(cwd, root);
  const problems = [];
  for (const entry of readdirSync(base, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const path = `${root}/${entry.name}`;
    if (entry.isDirectory()) {
      if (entry.name === shared || allowFolders.includes(entry.name)) continue;
      const hasIndex = ['index.ts', 'index.tsx', 'index.js'].some((name) => existsSync(join(base, entry.name, name)));
      if (!hasIndex) problems.push(`${path}: feature folder without index.ts`);
    } else if (!entryFiles.includes(entry.name) && !TEST.test(entry.name)) {
      problems.push(`${path}: file at the top level (only entry files belong here)`);
    }
  }
  return problems;
}

/**
 * ADR 0001. Imports into another feature go through its index. `features` are folder names under `root`;
 * relative and `root`-anchored imports are both resolved.
 */
export function featureImports({ root, shared = 'shared', cwd = process.cwd() }) {
  const problems = [];
  const files = sourceFiles(root, { cwd, tests: true });
  const top = (path) => path.slice(root.length + 1).split('/')[0];
  for (const file of files) {
    const own = top(file);
    const text = readFileSync(join(cwd, file), 'utf8');
    for (const match of text.matchAll(/(?:import|export)[^'"]*?from\s*['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)/gu)) {
      const spec = match[1] ?? match[2];
      if (!spec.startsWith('.')) continue;
      const target = join(file, '..', spec).split(sep).join('/');
      if (!target.startsWith(`${root}/`)) continue;
      const feature = top(target);
      if (feature === own) continue;
      if (own === shared && feature !== shared) {
        problems.push(`${file}: shared code imports feature "${feature}" (${spec})`);
        continue;
      }
      if (feature === shared) continue;
      const rest = target.slice(root.length + 2 + feature.length);
      if (rest !== '' && !/^index(\.js|\.ts|\.tsx)?$/u.test(rest)) {
        problems.push(`${file}: imports ${spec} inside feature "${feature}"; use ${root}/${feature}/index.ts`);
      }
    }
  }
  return problems;
}

/** ADR 0002. No role comparisons outside policy files and the shared auth folder. */
export function noRoleChecks({ dirs, allow = ['**/*.policy.ts', '**/shared/auth/**'], cwd = process.cwd() }) {
  const pattern = /\.role\s*[!=]==?|\broles\s*\.\s*includes\s*\(/u;
  const problems = [];
  for (const dir of dirs) {
    for (const file of sourceFiles(dir, { cwd })) {
      if (matchesAny(file, allow)) continue;
      readFileSync(join(cwd, file), 'utf8')
        .split('\n')
        .forEach((line, index) => {
          if (pattern.test(line)) problems.push(`${file}:${index + 1}: role check outside a policy`);
        });
    }
  }
  return problems;
}

/** ADR 0003. Only the AI gateway imports model drivers or vendor SDKs. */
export function noDirectDriverImports({
  dirs,
  gateway = ['**/shared/ai/**'],
  modules = ['@anthropic-ai/sdk', 'openai', '@google/genai', 'ollama'],
  cwd = process.cwd(),
}) {
  const problems = [];
  for (const dir of dirs) {
    for (const file of sourceFiles(dir, { cwd })) {
      if (matchesAny(file, gateway)) continue;
      const text = readFileSync(join(cwd, file), 'utf8');
      for (const match of text.matchAll(/from\s*['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)|require\(\s*['"]([^'"]+)['"]\s*\)/gu)) {
        const spec = match[1] ?? match[2] ?? match[3];
        const hit = modules.some((name) => spec === name || spec.startsWith(`${name}/`)) || /(^|\/)ai\/drivers(\/|$)/u.test(spec);
        if (hit) problems.push(`${file}: imports ${spec}; call the AI gateway instead`);
      }
    }
  }
  return problems;
}

/** ADR 0005. Components and model files import no store, API or router; pages import no API client. */
export function webLayers({
  root,
  store = ['react-redux', '@reduxjs/toolkit'],
  router = ['react-router', 'react-router-dom'],
  api = ['/api/', 'openapi-fetch'],
  cwd = process.cwd(),
}) {
  const problems = [];
  const rules = [
    { layer: '/components/', banned: [...store, ...router, ...api] },
    { layer: '/model/', banned: [...store, ...router, ...api, 'react'] },
    { layer: '/pages/', banned: ['openapi-fetch'] },
  ];
  for (const file of sourceFiles(root, { cwd })) {
    const rule = rules.find((r) => file.includes(r.layer));
    if (!rule) continue;
    const text = readFileSync(join(cwd, file), 'utf8');
    for (const match of text.matchAll(/from\s*['"]([^'"]+)['"]/gu)) {
      const spec = match[1];
      const hit = rule.banned.find((name) => (name.startsWith('/') ? spec.includes(name) : spec === name || spec.startsWith(`${name}/`)));
      if (hit) problems.push(`${file}: ${rule.layer.slice(1, -1)} imports ${spec}`);
    }
  }
  return problems;
}

/** ADR 0005. Files matching `globs` stay under `max` lines. */
export function maxLines({ dirs, globs, max, cwd = process.cwd() }) {
  const problems = [];
  for (const dir of dirs) {
    for (const file of sourceFiles(dir, { cwd })) {
      if (!matchesAny(file, globs)) continue;
      const lines = readFileSync(join(cwd, file), 'utf8').split('\n').length;
      if (lines > max) problems.push(`${file}: ${lines} lines (max ${max})`);
    }
  }
  return problems;
}

