# Changelog

## v2.1.0 (2026-11-09)

UI and design system (ADR 0008). Additive: no existing option or rule changes.

- New ADR 0008: every UI is built from one design system. Tokens are the only source of visual values and generate the
  theme; components come from the design-system package on an accessible behaviour library, with closed APIs and scoped
  styles; layout components and a column grid place everything; every interaction is animated with motion tokens;
  one formatting module formats dates and numbers; a page is done when it matches its design in a browser, with
  screenshot baselines and flow tests. No library is named.
- `agents/lanes/web.md` rules 9–15 and a pointer in `agents/AGENTS.base.md` rule 5.
- `templates/stack.md`: rows for UI components, styling and theme, layout and tables, motion, formatting, style checks
  and browser tests; gate options for the two new checks. ADR 0007 lists the UI concerns.
- New ESLint preset `uiRules({ files, designSystem, formatModule, behaviour })`.
- New fitness check `tokenReferences({ dirs, tokens, allowPrefixes })`; `sourceFiles` takes an optional `pattern`.

## v2.0.1 (2026-11-08)

- Fix: `rules-sync` did nothing when started through a package-manager bin (`pnpm exec rules-sync`, `node_modules/.bin`):
  the entry check compared the symlinked path with Node's real path, so the CLI wrote no files and `--check` always
  exited 0. It now compares real paths. Projects on v2.0.0 should upgrade: their CI drift check never ran.

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
