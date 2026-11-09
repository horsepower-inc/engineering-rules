// dependency-cruiser rules for ADR 0001 (features, not layers), ADR 0009 (shared modules) and ADR 0011 (ports and adapters). Spread into `forbidden` of .dependency-cruiser.cjs.
// `root` is the service source folder relative to the repository root, e.g. 'apps/api/src'.

function esc(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * @param {{ root: string, shared?: string, severity?: 'error' | 'warn', pureFolder?: string,
 *           frameworkModules?: string[] }} options  frameworkModules: path patterns of the app's framework, database and
 *           queue packages from its stack ADR (ADR 0007), e.g. ['^@nestjs/', '^kysely']; domain/ may import none of them.
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
 * ADR 0009: the packages of a cross-cutting concern are imported only in that concern's home.
 * @param {{ root: string, severity?: 'error' | 'warn',
 *           modules: { name: string, home: string[], packages: string[] }[] }} options
 *   home: path prefixes relative to the repository root (e.g. 'apps/api/src/shared/providers/logger/');
 *   packages: the concern's package names from the app's stack ADR (e.g. 'pino'). A module without packages adds no rule.
 */
function sharedModuleRules({ root, modules, severity = 'error' }) {
  const r = esc(root);
  return modules
    .filter((m) => m.packages.length > 0)
    .map((m) => {
      if (m.home.length === 0) throw new Error(`sharedModuleRules: ${m.name} has packages but no home`);
      return {
        name: `shared-module-${m.name}`,
        comment: `ADR 0009: ${m.name} is done by its shared module (${m.home.join(', ')}); use it, do not import its packages.`,
        severity,
        from: { path: `^${r}/`, pathNot: m.home.map((h) => `^${esc(h)}`) },
        to: { path: m.packages.map((name) => `(^|node_modules/)${esc(name)}(/|$)`) },
      };
    });
}


/**
 * dependency-cruiser rules for ADR 0011 (factory projects: ports and adapters). `root` is the source folder, e.g. 'src'.
 * @param {{ root?: string, severity?: 'error' | 'warn' }} options
 */
function portsAndAdaptersRules({ root = 'src', severity = 'error' } = {}) {
  const r = esc(root);
  const rule = (name, comment, from, to) => ({ name, comment: `ADR 0011: ${comment}`, severity, from, to });
  return [
    rule('core-imports-no-outer-layer', 'core/ is pure and imports no outer layer.', { path: `^${r}/core/` }, { path: `^${r}/(app|adapters|plugins|cli)/` }),
    rule('app-imports-no-adapter', 'app/ reaches I/O only through ports (contract tests excepted).', { path: `^${r}/app/`, pathNot: '\\.contract\\.test\\.ts$' }, { path: `^${r}/(adapters|plugins|cli)/` }),
    rule('adapter-imports-no-app', 'an adapter implements a port and imports no use case or plugin.', { path: `^${r}/adapters/` }, { path: `^${r}/(app|plugins|cli)/` }),
    rule('plugin-imports-no-app', 'a plugin implements a port and imports no use case or adapter.', { path: `^${r}/plugins/` }, { path: `^${r}/(app|adapters|cli)/` }),
    rule('nothing-imports-main', 'main.ts is the only composition root.', { path: `^${r}/` }, { path: `^${r}/main\\.ts$` }),
  ];
}

module.exports = { featureRules, sharedModuleRules, portsAndAdaptersRules };
