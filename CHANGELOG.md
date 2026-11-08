# Changelog

## v1.1.0 (2026-11-08)

- Profiles: `agents/AGENTS.base.md` keeps the rules for every project; `agents/profiles/service.md` holds the web-app and
  API-service rules (unchanged text, renumbered from 8); `agents/profiles/factory.md` is new.
- ADR 0007: factory projects (the orchestrator, the tracker, operator tooling) use ports and adapters, not feature folders.
- dependency-cruiser preset `portsAndAdaptersRules({ root, severity })`.
- `rules-sync --profile service|factory` (default `service`).
- Commit rule: a one-line conventional subject; a body and trailers may follow.
- Upgrading a service project: bump the pin and run `rules-sync --agents AGENTS.md` once; its AGENTS.md block is regrouped.

## v1.0.0 (2026-11-08)

First version.

- ADRs 0001–0006: features not layers, access policies, AI gateway, API documentation standard, web app layers,
  shared rules repo.
- `agents/AGENTS.base.md` and lanes `api`, `web`.
- Fitness checks: `featureShape`, `featureImports`, `noRoleChecks`, `noDirectDriverImports`, `webLayers`, `maxLines`.
- Presets: ESLint `accessRules`, `aiGatewayRules`; dependency-cruiser `featureRules`; Spectral `api-docs.yaml`.
- `rules-sync` with `--check` and `--agents`.
- Templates: ADR, pull request.
