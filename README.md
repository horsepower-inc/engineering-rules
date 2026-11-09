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
| `agents/lanes/` | Extra rules per kind of work: `api.md`, `web.md` (including the UI and design-system rules of ADR 0008). |
| `agents/review.md` | The placement checklist every reviewer applies to new and changed lines (ADR 0009). |
| `fitness/` | Reusable architecture checks, called from a project's tests. |
| `presets/eslint/` | ESLint flat-config pieces (role checks only in policies, no direct model drivers, UI rules, HTTP only through its client). |
| `presets/dependency-cruiser/` | Feature isolation rules and shared-module homes, parameterised by the project's paths. |
| `presets/spectral/` | The API documentation standard as a Spectral ruleset. |
| `templates/` | ADR and pull-request templates. |
| `bin/rules-sync.mjs` | Copies the text rules into a project's `.rules/` and checks them in CI. |

## Using it in a project

```bash
# 1. Pin a version (no registry, no token: the repo is public)
pnpm add -D -w "github:horsepower-inc/engineering-rules#v2.2.0"

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
// eslint.config.js, web apps (ADR 0008): the app's own libraries come from its stack ADR
import { uiRules } from '@horsepower/engineering-rules/eslint';
export default [
  ...uiRules({
    files: ['apps/web/src/**/*.{ts,tsx}', 'packages/ui/src/**/*.{ts,tsx}'],
    designSystem: ['packages/ui/**'],
    formatModule: ['packages/format/**'],
    behaviour: ['react-aria-components', '@tanstack/react-table'],
  }),
];
```

```ts
// packages/ui/src/tokens/token-references.test.ts (ADR 0008 rule 3)
import { tokenReferences } from '@horsepower/engineering-rules/fitness';
it('names only existing tokens', () => {
  expect(tokenReferences({ dirs: ['apps/web/src', 'packages/ui/src'], tokens: tokenNames, allowPrefixes: ['ca-'] })).toEqual([]);
});
```

```js
// .dependency-cruiser.cjs
const { featureRules } = require('@horsepower/engineering-rules/dependency-cruiser');
module.exports = { forbidden: [...featureRules({ root: 'apps/api/src', shared: 'shared' })] };
```

```js
// .dependency-cruiser.cjs (ADR 0009): each concern's packages only in its home, from the stack ADR's "Shared modules"
const { sharedModuleRules } = require('@horsepower/engineering-rules/dependency-cruiser');
module.exports = { forbidden: [...sharedModuleRules({ root: 'apps/api/src', modules: [
  { name: 'logging', home: ['apps/api/src/shared/providers/logger/'], packages: ['pino'] },
  { name: 'queue', home: ['apps/api/src/shared/providers/queue/', 'apps/api/src/shared/testing/'], packages: ['bullmq'] },
] })] };
```

```js
// eslint.config.js (ADR 0009): HTTP only through the client home
import { httpRules } from '@horsepower/engineering-rules/eslint';
export default [...httpRules({ files: ['apps/web/src/**/*.{ts,tsx}'], client: ['apps/web/src/shared/api/**'] })];
```

Review agents load `.rules/agents/review.md` and report a placement finding in a new or changed line as a blocker.

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
