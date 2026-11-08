# engineering-rules

The engineering rules every horsepower and CoachInside project follows: architecture decisions (ADRs), the base
instructions for coding agents, and the gates that enforce both (fitness checks, ESLint, dependency-cruiser and
Spectral presets).

One repo, versioned with tags. Each project pins a version and upgrades with one small PR, so a rule change never
breaks a project silently.

## What is in here

| Folder | Contents |
| --- | --- |
| `adr/` | Organisation-wide ADRs. A project's own ADRs may add to them, never contradict them. |
| `agents/AGENTS.base.md` | Rules every coding agent follows (Claude Code, Codex, factory workers). |
| `agents/lanes/` | Extra rules per kind of work: `api.md`, `web.md`. |
| `fitness/` | Reusable architecture checks, called from a project's tests. |
| `presets/eslint/` | ESLint flat-config pieces (role checks only in policies, no direct model drivers). |
| `presets/dependency-cruiser/` | Feature isolation rules, parameterised by the project's paths. |
| `presets/spectral/` | The API documentation standard as a Spectral ruleset. |
| `templates/` | ADR and pull-request templates. |
| `bin/rules-sync.mjs` | Copies the text rules into a project's `.rules/` and checks them in CI. |

## Using it in a project

```bash
# 1. Pin a version (no registry, no token: the repo is public)
pnpm add -D -w "github:horsepower-inc/engineering-rules#v2.0.0"

# 2. Copy ADRs, agent rules and templates into .rules/ (commit the result)
pnpm exec rules-sync --agents AGENTS.md

# 3. In CI: fail when .rules/ or the AGENTS.md block drifted from the pinned version
pnpm exec rules-sync --check --agents AGENTS.md
```

`--agents AGENTS.md` writes `agents/AGENTS.base.md` between these markers in the project's AGENTS.md; everything outside
them is the project's own:

```markdown
<!-- engineering-rules:begin -->
<!-- engineering-rules:end -->
```

Claude Code can also import the copy directly from CLAUDE.md: `@.rules/agents/AGENTS.base.md`.

### Gates

```js
// eslint.config.js
import { accessRules, aiGatewayRules } from '@horsepower/engineering-rules/eslint';
export default [
  ...accessRules({ files: ['apps/api/src/**/*.ts'], allow: ['**/*.policy.ts', 'apps/api/src/shared/auth/**'] }),
  ...aiGatewayRules({ files: ['apps/api/src/**/*.ts'], gateway: 'apps/api/src/shared/ai/**', drivers: ['**/shared/ai/drivers/**', '@ca/outbound/models'] }),
];
```

```js
// .dependency-cruiser.cjs
const { featureRules } = require('@horsepower/engineering-rules/dependency-cruiser');
module.exports = { forbidden: [...featureRules({ root: 'apps/api/src', shared: 'shared' })] };
```

```yaml
# .spectral.yaml
extends: ['./node_modules/@horsepower/engineering-rules/presets/spectral/api-docs.yaml']
```

```ts
// apps/api/src/arch/feature-shape.test.ts
import { featureShape } from '@horsepower/engineering-rules/fitness';
it('keeps every feature in its own folder', () => {
  expect(featureShape({ root: 'apps/api/src', shared: 'shared', entryFiles: ['main.ts', 'worker.ts', 'ops.ts', 'app.module.ts'] })).toEqual([]);
});
```

## Stack choices stay in the app

These rules name concerns, never libraries (ADR 0007). Each app writes its own stack ADR from `templates/stack.md`, pins
its own dependencies, and passes its packages to the gates:

```ts
webLayers({ root: 'apps/web/src', store: [], serverData: ['@tanstack/react-query'], router: ['react-router'], apiClient: ['openapi-fetch'] })
```

## Changing a rule

1. Open a PR here: the rule, its ADR (new or amended), the gate change, a CHANGELOG entry.
2. Merge, tag (`vMAJOR.MINOR.PATCH`): MAJOR when a project's gates can turn red on unchanged code.
3. Each project upgrades with a PR that bumps the pin, runs `rules-sync` and fixes what the new gates find.

No secrets, customer names or product data belong in this repo: it is public.
