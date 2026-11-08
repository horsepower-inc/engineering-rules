import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { accessRules, aiGatewayRules } from '../presets/eslint/index.js';

const require = createRequire(import.meta.url);
const { featureRules, portsAndAdaptersRules } = require('../presets/dependency-cruiser/index.cjs');

test('accessRules ignores policies and shared/auth and restricts role comparisons', () => {
  const [config] = accessRules({ files: ['src/**/*.ts'] });
  assert.deepEqual(config.ignores, ['**/*.policy.ts', '**/shared/auth/**']);
  const [, ...selectors] = config.rules['no-restricted-syntax'];
  assert.equal(selectors.length, 3);
});

test('aiGatewayRules blocks vendor SDKs and driver paths outside the gateway', () => {
  const [config] = aiGatewayRules({ files: ['src/**/*.ts'], gateway: 'src/shared/ai/**' });
  assert.deepEqual(config.ignores, ['src/shared/ai/**']);
  const [, options] = config.rules['no-restricted-imports'];
  assert.ok(options.paths.some((p) => p.name === '@anthropic-ai/sdk'));
  assert.ok(options.patterns[0].group.includes('**/ai/drivers/**'));
});

test('featureRules builds the four rules with the escaped root and $1 back-reference', () => {
  const rules = featureRules({ root: 'apps/api/src', severity: 'warn' });
  assert.deepEqual(rules.map((r) => r.name), [
    'feature-only-through-index',
    'shared-imports-no-feature',
    'domain-is-pure',
    'no-circular-features',
  ]);
  assert.ok(rules.every((r) => r.severity === 'warn'));
  assert.equal(rules[0].from.path, '^apps/api/src/([^/]+)/');
  assert.ok(rules[0].to.pathNot.includes('^apps/api/src/$1/'));
  assert.ok(new RegExp(rules[0].to.pathNot[1]).test('apps/api/src/reports/index.ts'));
});

test('portsAndAdaptersRules holds the ADR 0008 import direction and spares contract tests', () => {
  const rules = portsAndAdaptersRules({ root: 'src', severity: 'warn' });
  assert.deepEqual(rules.map((r) => r.name), [
    'core-imports-no-outer-layer',
    'app-imports-no-adapter',
    'adapter-imports-no-app',
    'plugin-imports-no-app',
    'nothing-imports-main',
  ]);
  assert.ok(rules.every((r) => r.severity === 'warn'));
  const app = rules[1];
  assert.ok(new RegExp(app.from.pathNot).test('src/app/github.contract.test.ts'));
  assert.ok(new RegExp(app.to.path).test('src/adapters/github.ts'));
  assert.ok(!new RegExp(app.to.path).test('src/core/failure.ts'));
  assert.ok(new RegExp(rules[4].to.path).test('src/main.ts'));
});
