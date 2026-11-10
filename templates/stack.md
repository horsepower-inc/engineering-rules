# ADR NNNN: <app> stack

Status: accepted (YYYY-MM-DD)

Shared rule: ADR 0007. One row per concern this app has; versions are pinned in the app's manifest and lockfile, not here.

| Concern | Library or framework | Why this one | Alternatives considered |
| --- | --- | --- | --- |
| Server data (web) | | | |
| Shared client state (web) | none unless named here, with the state it holds | | |
| Multi-step work (web) | reducers / state machines in `state/` | | |
| Routing (web) | | | |
| Forms and validation | | | |
| UI components (web): accessible behaviour library under the design-system package | | | |
| Styling and theme (web): styling framework, theme generated from tokens, variant helper | | | |
| Layout and tables (web): grid, table library | | | |
| Motion (web) | CSS from motion tokens unless named here | | |
| Formatting (dates, numbers) | one formatting module over the platform's locale APIs | | |
| Style checks (web) | | | |
| Browser tests and screenshot baselines | | | |
| i18n | | | |
| HTTP framework (api) | | | |
| Database access | | | |
| Queue / jobs | | | |
| API contract and client: contract-first or code-first (ADR 0004), generator, drift gate | | | |
| Testing | | | |
| Observability | | | |

## Shared modules

ADR 0009: the one home of each cross-cutting concern. Features use these and never rebuild them; reviewers check new code
against them (`.rules/agents/review.md`).

| Concern | Home (api) | Home (web) | Packages only the home imports |
| --- | --- | --- | --- |
| Outside HTTP calls | | n/a | |
| API client (auth header, refresh, 401, error shape, retry policy) | n/a | | |
| Auth | | | |
| Logging, metrics, tracing | | | |
| Errors | | | |
| Configuration and secrets | | | |
| Time (clock, zones, day and month boundaries) | | | |
| Ids and idempotency | | | |
| Persistence | | n/a | |
| Jobs and pipeline | | n/a | |
| Model calls (ADR 0003) | | n/a | |
| Validation | | | |

## How this app meets the shared rules

ADR 0012: the shared rules state outcomes. Fill a row where this app meets one differently from the reference
implementation, or where the rule leaves the choice to the app. A row needs a gate or test; without one it is an
exception and is proposed in engineering-rules instead.

| Outcome | How this app does it | Enforced by |
| --- | --- | --- |
| Every route has an access declaration, deny-by-default (ADR 0002) | | |
| No role or permission comparison outside policies (ADR 0002): the principal's shape | | |
| One contract, no drift (ADR 0004): contract-first or code-first | | |
| Acceptance runs (ADR 0010, base rule 1): environment, what tests may read and write there | | |
| Commit messages (base rule 7): types the release tooling reads, body allowed or not | | |

## Gate options

The packages this app passes to the shared gates:

```js
webLayers({ root: 'src', store: [], serverData: [], router: [], apiClient: [] })
featureRules({ root: 'src', frameworkModules: [] })
accessRules({ files: ['src/**/*.ts'], allow: [], selectors: roleComparisonSelectors })
uiRules({ files: ['src/**/*.{ts,tsx}'], designSystem: [], formatModule: [], behaviour: [] })
tokenReferences({ dirs: ['src'], tokens: [], allowPrefixes: [] })
sharedModuleRules({ root: 'src', modules: [{ name: 'logging', home: ['src/shared/providers/logger/'], packages: [] }] })
httpRules({ files: ['src/**/*.{ts,tsx}'], client: [] })
```

## Amendments

<date: what changed and why>
