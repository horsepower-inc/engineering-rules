# Changelog

## v2.0.0 (2026-11-08)

Web state: TanStack Query instead of Redux Toolkit (ADR 0005 Amendment 1).

- ADR 0005: server data through TanStack Query (`openapi-react-query` over the typed `openapi-fetch` client); multi-step
  work as reducers or state machines in `state/`; a global store only for named shared client state.
- `agents/lanes/web.md` rules 2 and 3 follow the amendment.
- **Breaking** (`fitness.webLayers`): components and model files may no longer import `@tanstack/react-query`,
  `openapi-react-query` or `zustand`; pages may no longer import `@tanstack/react-query` or `openapi-react-query` (they call
  the feature's `api/` hooks).

## v1.0.0 (2026-11-08)

First version.

- ADRs 0001–0006: features not layers, access policies, AI gateway, API documentation standard, web app layers,
  shared rules repo.
- `agents/AGENTS.base.md` and lanes `api`, `web`.
- Fitness checks: `featureShape`, `featureImports`, `noRoleChecks`, `noDirectDriverImports`, `webLayers`, `maxLines`.
- Presets: ESLint `accessRules`, `aiGatewayRules`; dependency-cruiser `featureRules`; Spectral `api-docs.yaml`.
- `rules-sync` with `--check` and `--agents`.
- Templates: ADR, pull request.
