// dependency-cruiser rules for ADR 0001 (features, not layers) and ADR 0008 (ports and adapters). Spread into `forbidden` of .dependency-cruiser.cjs.
// `root` is the service source folder relative to the repository root, e.g. 'apps/api/src'.

function esc(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * @param {{ root: string, shared?: string, severity?: 'error' | 'warn', pureFolder?: string,
 *           frameworkModules?: string[] }} options  frameworkModules: path patterns of the app's framework, database and
 *           queue packages from its stack ADR (ADR 0008), e.g. ['^@nestjs/', '^kysely']; domain/ may import none of them.
 */
function featureRules({ root, shared = 'shared', severity = 'error', pureFolder = 'domain', frameworkModules = [] }) {
  const r = esc(root);
  const s = esc(shared);
  return [
    {
      name: 'feature-only-through-index',
      comment: 'ADR 0001: another feature is imported only through its index.ts.',
      severity,
      from: { path: `^${r}/([^/]+)/` },
      to: {
        path: `^${r}/[^/]+/.+`,
        pathNot: [`^${r}/$1/`, `^${r}/[^/]+/index\\.(ts|tsx|js)$`, `^${r}/${s}/`],
      },
    },
    {
      name: 'shared-imports-no-feature',
      comment: 'ADR 0001: shared/ is infrastructure and never imports a feature.',
      severity,
      from: { path: `^${r}/${s}/` },
      to: { path: `^${r}/[^/]+/`, pathNot: [`^${r}/${s}/`] },
    },
    {
      name: 'domain-is-pure',
      comment: 'ADR 0001: domain/ imports no adapters, framework or Node I/O.',
      severity,
      from: { path: `^${r}/[^/]+/${esc(pureFolder)}/` },
      to: {
        path: [`^${r}/[^/]+/adapters/`, ...frameworkModules, '^(node:)?(fs|net|http|https|child_process|dgram)$'],
      },
    },
    {
      name: 'no-circular-features',
      comment: 'ADR 0001: features form no import cycle.',
      severity,
      from: { path: `^${r}/` },
      to: { circular: true },
    },
  ];
}

/**
 * dependency-cruiser rules for ADR 0008 (factory projects: ports and adapters). `root` is the source folder, e.g. 'src'.
 * @param {{ root?: string, severity?: 'error' | 'warn' }} options
 */
function portsAndAdaptersRules({ root = 'src', severity = 'error' } = {}) {
  const r = esc(root);
  const rule = (name, comment, from, to) => ({ name, comment: `ADR 0008: ${comment}`, severity, from, to });
  return [
    rule('core-imports-no-outer-layer', 'core/ is pure and imports no outer layer.', { path: `^${r}/core/` }, { path: `^${r}/(app|adapters|plugins|cli)/` }),
    rule('app-imports-no-adapter', 'app/ reaches I/O only through ports (contract tests excepted).', { path: `^${r}/app/`, pathNot: '\\.contract\\.test\\.ts$' }, { path: `^${r}/(adapters|plugins|cli)/` }),
    rule('adapter-imports-no-app', 'an adapter implements a port and imports no use case or plugin.', { path: `^${r}/adapters/` }, { path: `^${r}/(app|plugins|cli)/` }),
    rule('plugin-imports-no-app', 'a plugin implements a port and imports no use case or adapter.', { path: `^${r}/plugins/` }, { path: `^${r}/(app|adapters|cli)/` }),
    rule('nothing-imports-main', 'main.ts is the only composition root.', { path: `^${r}/` }, { path: `^${r}/main\\.ts$` }),
  ];
}

module.exports = { featureRules, portsAndAdaptersRules };
