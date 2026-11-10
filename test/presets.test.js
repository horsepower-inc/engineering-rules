import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { accessRules, aiGatewayRules, roleComparisonSelectors } from '../presets/eslint/index.js';

const require = createRequire(import.meta.url);
const { featureRules, portsAndAdaptersRules } = require('../presets/dependency-cruiser/index.cjs');

test('accessRules ignores policies and shared/auth and restricts role comparisons', () => {
  const [config] = accessRules({ files: ['src/**/*.ts'] });
  assert.deepEqual(config.ignores, ['**/*.policy.ts', '**/shared/auth/**']);
  const [, ...selectors] = config.rules['no-restricted-syntax'];
  assert.equal(selectors.length, 3);
});

test('accessRules takes the selectors for the project\'s principal shape', () => {
  const tag = 'BinaryExpression[operator=/^[!=]==?$/] > MemberExpression[property.name="tag"][object.property.name="role"]';
  const [config] = accessRules({ files: ['src/**/*.ts'], selectors: [...roleComparisonSelectors, tag] });
  const [level, ...entries] = config.rules['no-restricted-syntax'];
  assert.equal(level, 'error');
  assert.equal(entries.length, 4);
  assert.equal(entries[3].selector, tag);
  assert.ok(entries.every((entry) => entry.message.includes('ADR 0002')));
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

test('portsAndAdaptersRules holds the ADR 0011 import direction and spares contract tests', () => {
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

test('sharedModuleRules allows a concern\'s packages only in its home', () => {
  const { sharedModuleRules } = require('../presets/dependency-cruiser/index.cjs');
  const rules = sharedModuleRules({
    root: 'apps/api/src',
    severity: 'warn',
    modules: [
      { name: 'logging', home: ['apps/api/src/shared/providers/logger/'], packages: ['pino'] },
      { name: 'time', home: ['apps/api/src/shared/helpers/time/'], packages: ['@date-fns/tz'] },
      { name: 'ids', home: ['apps/api/src/shared/providers/ids/'], packages: [] },
    ],
  });
  assert.deepEqual(rules.map((r) => r.name), ['shared-module-logging', 'shared-module-time']);
  assert.ok(rules.every((r) => r.severity === 'warn'));
  const [logging, time] = rules;
  assert.ok(new RegExp(logging.from.path).test('apps/api/src/reports/reports.service.ts'));
  assert.ok(new RegExp(logging.from.pathNot[0]).test('apps/api/src/shared/providers/logger/logger.ts'));
  const to = new RegExp(logging.to.path[0]);
  assert.ok(to.test('node_modules/pino/lib/pino.js'));
  assert.ok(to.test('pino'));
  assert.ok(!to.test('node_modules/pino-pretty/index.js'));
  assert.ok(new RegExp(time.to.path[0]).test('node_modules/@date-fns/tz/index.js'));
});

test('sharedModuleRules refuses packages without a home', () => {
  const { sharedModuleRules } = require('../presets/dependency-cruiser/index.cjs');
  assert.throws(() => sharedModuleRules({ root: 'src', modules: [{ name: 'queue', home: [], packages: ['bullmq'] }] }), /no home/);
});

test('httpRules bans fetch and XMLHttpRequest outside the client home', async () => {
  const { httpRules } = await import('../presets/eslint/index.js');
  const [config] = httpRules({ files: ['src/**/*.ts'], client: 'src/shared/api/**' });
  assert.deepEqual(config.ignores, ['src/shared/api/**']);
  const [level, ...globals] = config.rules['no-restricted-globals'];
  assert.equal(level, 'error');
  assert.deepEqual(globals.map((g) => g.name), ['fetch', 'XMLHttpRequest']);
  assert.deepEqual(Object.keys(config.rules), ['no-restricted-globals']);
});
