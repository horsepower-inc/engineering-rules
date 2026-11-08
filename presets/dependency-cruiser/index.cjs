// dependency-cruiser rules for ADR 0001 (features, not layers). Spread into `forbidden` of .dependency-cruiser.cjs.
// `root` is the service source folder relative to the repository root, e.g. 'apps/api/src'.

function esc(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * @param {{ root: string, shared?: string, severity?: 'error' | 'warn', pureFolder?: string,
 *           frameworkModules?: string[] }} options
 */
function featureRules({ root, shared = 'shared', severity = 'error', pureFolder = 'domain', frameworkModules = ['^@nestjs/', '^kysely', '^pg$', '^ioredis', '^bullmq'] }) {
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

module.exports = { featureRules };
