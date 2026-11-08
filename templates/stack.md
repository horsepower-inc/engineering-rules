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
| i18n | | | |
| HTTP framework (api) | | | |
| Database access | | | |
| Queue / jobs | | | |
| API contract and client | | | |
| Testing | | | |
| Observability | | | |

## Gate options

The packages this app passes to the shared gates:

```js
webLayers({ root: 'src', store: [], serverData: [], router: [], apiClient: [] })
featureRules({ root: 'src', frameworkModules: [] })
```

## Amendments

<date: what changed and why>
