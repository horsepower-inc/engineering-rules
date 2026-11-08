import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import {
  featureImports,
  featureShape,
  matchesAny,
  maxLines,
  noDirectDriverImports,
  noRoleChecks,
  webLayers,
} from '../fitness/index.js';

function project(files) {
  const cwd = mkdtempSync(join(tmpdir(), 'rules-'));
  for (const [path, content] of Object.entries(files)) {
    mkdirSync(dirname(join(cwd, path)), { recursive: true });
    writeFileSync(join(cwd, path), content);
  }
  return cwd;
}

test('matchesAny handles ** and *', () => {
  assert.equal(matchesAny('src/reports/reports.policy.ts', ['**/*.policy.ts']), true);
  assert.equal(matchesAny('src/shared/auth/guard.ts', ['**/shared/auth/**']), true);
  assert.equal(matchesAny('src/reports/reports.service.ts', ['**/*.policy.ts']), false);
});

test('featureShape accepts features with index, shared and entry files', () => {
  const cwd = project({
    'src/reports/index.ts': '',
    'src/shared/db/index.ts': '',
    'src/main.ts': '',
  });
  assert.deepEqual(featureShape({ root: 'src', entryFiles: ['main.ts'], cwd }), []);
});

test('featureShape reports a folder without index and a stray top-level file', () => {
  const cwd = project({ 'src/reports/service.ts': '', 'src/helpers.ts': '' });
  assert.deepEqual(featureShape({ root: 'src', cwd }).sort(), [
    'src/helpers.ts: file at the top level (only entry files belong here)',
    'src/reports: feature folder without index.ts',
  ]);
});

test('featureImports allows index imports and shared, rejects deep imports and shared → feature', () => {
  const cwd = project({
    'src/reports/index.ts': "export * from './reports.service.js';",
    'src/reports/reports.service.ts': [
      "import { x } from '../sessions/index.js';",
      "import { y } from '../sessions';",
      "import { db } from '../shared/db/index.js';",
      "import { z } from '../sessions/adapters/repo.js';",
    ].join('\n'),
    'src/sessions/index.ts': '',
    'src/shared/db/index.ts': "import { r } from '../../reports/index.js';",
  });
  assert.deepEqual(featureImports({ root: 'src', cwd }), [
    'src/reports/reports.service.ts: imports ../sessions/adapters/repo.js inside feature "sessions"; use src/sessions/index.ts',
    'src/shared/db/index.ts: shared code imports feature "reports" (../../reports/index.js)',
  ]);
});

test('noRoleChecks finds comparisons outside policies and shared/auth', () => {
  const cwd = project({
    'src/reports/reports.service.ts': "if (actor.role === 'coach') {}\nconst ok = roles.includes(r);",
    'src/reports/reports.policy.ts': "export const read = (p) => p.role === 'admin';",
    'src/shared/auth/roles.guard.ts': 'return roles.includes(principal.role);',
  });
  assert.deepEqual(noRoleChecks({ dirs: ['src'], cwd }), [
    'src/reports/reports.service.ts:1: role check outside a policy',
    'src/reports/reports.service.ts:2: role check outside a policy',
  ]);
});

test('noDirectDriverImports allows the gateway only', () => {
  const cwd = project({
    'src/shared/ai/drivers/anthropic.ts': "import Anthropic from '@anthropic-ai/sdk';",
    'src/analysis/analysis.service.ts': "import Anthropic from '@anthropic-ai/sdk';\nimport { d } from '../shared/ai/drivers/anthropic.js';",
    'src/reports/reports.service.ts': "import { ai } from '../shared/ai/index.js';",
  });
  assert.deepEqual(noDirectDriverImports({ dirs: ['src'], cwd }), [
    'src/analysis/analysis.service.ts: imports @anthropic-ai/sdk; call the AI gateway instead',
    'src/analysis/analysis.service.ts: imports ../shared/ai/drivers/anthropic.js; call the AI gateway instead',
  ]);
});

const stack = { store: ['zustand'], serverData: ['@tanstack/react-query'], router: ['react-router'], apiClient: ['openapi-fetch'] };

test('webLayers keeps components and model free of the store, server-state library, router and api', () => {
  const cwd = project({
    'src/features/viewer/components/panel.tsx': "import { useStore } from 'zustand';",
    'src/features/viewer/components/list.tsx': "import { useQuery } from '@tanstack/react-query';",
    'src/features/viewer/components/card.tsx': "import { useSession } from '../api/session.js';",
    'src/features/viewer/model/filter.ts': "import { useState } from 'react';",
    'src/features/viewer/pages/viewer.page.tsx': "import { useParams } from 'react-router';\nimport { useSession } from '../api/session.js';",
    'src/features/viewer/api/session.ts': "import { useQuery } from '@tanstack/react-query';",
    'src/features/viewer/state/upload.reducer.ts': "export const reducer = (s) => s;",
  });
  assert.deepEqual(webLayers({ root: 'src', cwd, ...stack }), [
    'src/features/viewer/components/card.tsx: components imports ../api/session.js',
    'src/features/viewer/components/list.tsx: components imports @tanstack/react-query',
    'src/features/viewer/components/panel.tsx: components imports zustand',
    'src/features/viewer/model/filter.ts: model imports react',
  ]);
});

test('webLayers keeps pages off the server-state library and the client', () => {
  const cwd = project({
    'src/features/teams/pages/teams.page.tsx': "import { useQuery } from '@tanstack/react-query';",
    'src/features/users/pages/users.page.tsx': "import createClient from 'openapi-fetch';",
  });
  assert.deepEqual(webLayers({ root: 'src', cwd, ...stack }), [
    'src/features/teams/pages/teams.page.tsx: pages imports @tanstack/react-query',
    'src/features/users/pages/users.page.tsx: pages imports openapi-fetch',
  ]);
});

test('webLayers names no library of its own', () => {
  const cwd = project({
    'src/features/a/components/x.tsx': "import { useSelector } from 'react-redux';\nimport { useQuery } from '@tanstack/react-query';",
    'src/features/a/pages/a.page.tsx': "import createClient from 'openapi-fetch';",
  });
  assert.deepEqual(webLayers({ root: 'src', cwd }), []);
});

test('maxLines reports long files that match', () => {
  const cwd = project({
    'src/features/a/pages/a.page.tsx': 'x\n'.repeat(200),
    'src/features/a/state/a.slice.ts': 'x\n'.repeat(400),
  });
  assert.deepEqual(maxLines({ dirs: ['src'], globs: ['**/pages/*.tsx'], max: 150, cwd }), [
    'src/features/a/pages/a.page.tsx: 201 lines (max 150)',
  ]);
});

test('test files are not scanned by default', () => {
  const cwd = project({ 'src/reports/reports.service.test.ts': "if (u.role === 'coach') {}" });
  assert.deepEqual(noRoleChecks({ dirs: ['src'], cwd }), []);
});
