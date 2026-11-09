import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { accessRules, aiGatewayRules } from '../presets/eslint/index.js';

const require = createRequire(import.meta.url);
const { featureRules } = require('../presets/dependency-cruiser/index.cjs');

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

test('uiRules bans locale formatting outside the format module and styling outside the design system', async () => {
  const { uiRules } = await import('../presets/eslint/index.js');
  const [format, outside] = uiRules({
    files: ['src/**/*.tsx'],
    designSystem: 'packages/ui/**',
    formatModule: ['packages/format/**'],
    behaviour: ['react-aria-components'],
  });
  assert.deepEqual(format.ignores, ['packages/format/**']);
  const [, ...properties] = format.rules['no-restricted-properties'];
  assert.ok(properties.some((p) => p.property === 'toLocaleDateString' && p.object === undefined));
  assert.ok(properties.some((p) => p.object === 'Intl' && p.property === 'NumberFormat'));
  assert.deepEqual(outside.ignores, ['packages/ui/**']);
  const [, imports] = outside.rules['no-restricted-imports'];
  assert.equal(imports.paths[0].name, 'react-aria-components');
  assert.deepEqual(imports.patterns[0].group, ['react-aria-components/*']);
  const [, ...selectors] = outside.rules['no-restricted-syntax'];
  assert.equal(selectors.length, 2);
});

test('uiRules without behaviour packages adds no import rule', async () => {
  const { uiRules } = await import('../presets/eslint/index.js');
  const [, outside] = uiRules({ files: ['src/**/*.tsx'] });
  assert.equal(outside.rules['no-restricted-imports'], undefined);
});
