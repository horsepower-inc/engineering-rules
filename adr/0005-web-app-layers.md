# ADR 0005: Web apps split each feature into pages, components, state, api and model

Status: accepted (2026-11-08)

## Context

Feature folders existed, but one page component loaded data, polled, held workflow state and rendered, in files of
900–1,250 lines.

## Decision

```
src/
  app/          router, store, providers, i18n setup
  shared/       api/ (base API from the contract), components/, hooks/, lib/
  features/<feature>/
    pages/        route components: params, hooks, layout, loading and error states
    components/   presentational: props in, events out; built from the design-system package
    state/        store slice, selectors, flows for multi-step work (upload, polling, autosave)
    api/          endpoints from the generated client; adapters from contract DTOs to view models
    model/        pure view logic
    i18n/
    index.ts      the routes this feature adds
```

| Layer | Never |
| --- | --- |
| `pages/` | calls the API, holds workflow state, business rules |
| `components/` | imports the store, the API or the router |
| `state/` | renders or formats text |
| `api/` | holds UI state |
| `model/` | side effects |

Tooling: Redux Toolkit for the store, RTK Query for server data with endpoints generated from the OpenAPI contract, and the
RTK listener middleware for long-running flows. A page file stays under 150 lines; a component file under 250.

## Enforcement

- `fitness.webLayers`: `components/` and `model/` import no store, API or router; `pages/` import no API client directly.
- `fitness.maxLines` for page and component files.
