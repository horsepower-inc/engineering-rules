# ADR 0005: Web apps split each feature into pages, components, state, api and model

Status: accepted (2026-11-08), amended 2026-11-08 (Amendment 1: no library names; see ADR 0007)

## Context

Feature folders existed, but one page component loaded data, polled, held workflow state and rendered, in files of
900–1,250 lines.

## Decision

```
src/
  app/          router, providers (server-state client, a store if the app has one), i18n setup
  shared/       api/ (the API client typed from the contract), components/, hooks/, lib/
  features/<feature>/
    pages/        route components: params, hooks, layout, loading and error states
    components/   presentational: props in, events out; built from the design-system package
    state/        reducers and flows for multi-step work (upload, autosave, editor rounds); a store only for shared client state
    api/          server-data hooks (queries, mutations, keys, invalidation) over the typed client; adapters from contract DTOs to view models
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

Each concern is covered by an existing library or framework that the app names in its stack ADR (ADR 0007):

| Concern | Rule |
| --- | --- |
| Server data | A server-state library over the client typed from the contract: caching, invalidation after mutations, polling, retries, cancellation. No hand-written fetch-and-poll code. |
| Multi-step work | Upload, autosave, export, editor rounds: a reducer or state machine in the feature's `state/`, cancellable, tested with fake timers. |
| Shared client state | None by default. A global store only for client state several features share, named in the stack ADR. |
| Routing, i18n, forms | The app's chosen library, used through the feature's own hooks and pages. |

A page file stays under 150 lines; a component file under 250.

## Amendment 1 (2026-11-08): concerns, not libraries

The first version named Redux Toolkit, RTK Query and the listener middleware. Library choices now belong to each app and
are recorded in its stack ADR (ADR 0007); this ADR keeps the layers and the concerns.

## Enforcement

- `fitness.webLayers`, given the app's packages per concern: `components/` and `model/` import no store, server-state
  library, API client or router; `pages/` import no API client or server-state library directly.
- `fitness.maxLines` for page and component files.
