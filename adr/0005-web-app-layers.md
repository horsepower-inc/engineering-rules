# ADR 0005: Web apps split each feature into pages, components, state, api and model

Status: accepted (2026-11-08), amended 2026-11-08 (tooling, see Amendment 1)

## Context

Feature folders existed, but one page component loaded data, polled, held workflow state and rendered, in files of
900–1,250 lines.

## Decision

```
src/
  app/          router, query client, providers, i18n setup
  shared/       api/ (typed client from the contract, query hooks factory), components/, hooks/, lib/
  features/<feature>/
    pages/        route components: params, hooks, layout, loading and error states
    components/   presentational: props in, events out; built from the design-system package
    state/        reducers and flows for multi-step work (upload, autosave, editor rounds); a store only for shared client state
    api/          query and mutation hooks over the typed client, query keys, invalidation; adapters from contract DTOs to view models
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

Tooling (Amendment 1): TanStack Query for server data, through `openapi-react-query` over the `openapi-fetch` client typed from
the OpenAPI contract (caching, invalidation after mutations, polling, retries, cancellation). Multi-step work is a reducer or a
small state machine in the feature's `state/`. No global store by default: add one (Zustand or Redux Toolkit) only for client
state that several features share, in an ADR amendment that names that state. A page file stays under 150 lines; a component
file under 250.

## Amendment 1 (2026-11-08): TanStack Query instead of Redux Toolkit

The first version named Redux Toolkit, RTK Query and the listener middleware. Measured on the first adopter (Coach Analyzer
web: about 13k lines, server data loaded per page, polling written by hand in six pages, one shared value, the signed-in
session), almost all state is server data or local to one page. RTK Query would add a second endpoint layer next to the typed
client the project already has, and a store with nothing global to hold; redux-saga adds generators for the two flows (upload,
editor) that a reducer handles. TanStack Query covers the server data on the existing client with no store.

## Enforcement

- `fitness.webLayers`: `components/` and `model/` import no store, API or router; `pages/` import no API client directly.
- `fitness.maxLines` for page and component files.
