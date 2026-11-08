# Changelog

## v2.1.0 (2026-11-08)

- Profiles: `agents/AGENTS.base.md` keeps the rules for every project; `agents/profiles/service.md` holds the web-app and
  API-service rules (v2.0.0 text, renumbered from 8); `agents/profiles/factory.md` is new.
- ADR 0008: factory projects (the orchestrator, the tracker, operator tooling) use ports and adapters, not feature folders.
- dependency-cruiser preset `portsAndAdaptersRules({ root, severity })`; it names no package.
- `rules-sync --profile service|factory` (default `service`).
- Commit rule: a one-line conventional subject; a body and trailers may follow.
- Upgrading a service project: bump the pin and run `rules-sync --agents AGENTS.md` once; its AGENTS.md block is regrouped.

## v2.0.0 (2026-11-08)

Concerns, not libraries (ADR 0007).

- New ADR 0007: each app covers every concern with an existing, maintained library or framework, records its choices in
  its own stack ADR (`templates/stack.md`) and pins its own dependencies. The shared rules name no library.
- ADR 0005 Amendment 1: the web layers name concerns (server-state library, flows in `state/`, a store only for named
  shared client state) instead of Redux Toolkit, RTK Query and the listener middleware.
- `agents/lanes/web.md` rules 2 and 3 and `agents/AGENTS.base.md` rule 5 follow.
- **Breaking** (`fitness.webLayers`): no built-in package lists. Options are now `store`, `serverData`, `router` and
  `apiClient` (default empty); the app passes its stack's packages. Only the app's own `/api/` folder is built in.
- **Breaking** (`featureRules`): `frameworkModules` defaults to empty; pass the app's framework, database and queue
  packages.

## v1.0.0 (2026-11-08)

First version.

- ADRs 0001–0006: features not layers, access policies, AI gateway, API documentation standard, web app layers,
  shared rules repo.
- `agents/AGENTS.base.md` and lanes `api`, `web`.
- Fitness checks: `featureShape`, `featureImports`, `noRoleChecks`, `noDirectDriverImports`, `webLayers`, `maxLines`.
- Presets: ESLint `accessRules`, `aiGatewayRules`; dependency-cruiser `featureRules`; Spectral `api-docs.yaml`.
- `rules-sync` with `--check` and `--agents`.
- Templates: ADR, pull request.
