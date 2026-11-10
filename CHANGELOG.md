# Changelog

## v2.5.0 (2026-11-10)

Rules as outcomes (ADR 0012), from issues #11 to #14. No default of a gate changes; the two new Spectral checks are
warnings.

- New ADR 0012: a shared rule states an outcome; names of decorators, files and tools are the reference implementation.
  A project that meets an outcome another way records it in its stack ADR and enforces it with its own gate or test;
  that is not an exception. A stricter project rule is not a conflict. ADR 0006 rule 4 points to it.
- `agents/AGENTS.base.md` opening paragraph: follow a stricter or recording project rule; stop and ask only when a
  project rule would allow what a shared rule forbids.
- ADR 0002 (#11): every route carries an access declaration the auth home enforces deny-by-default, proven by a project
  test; roles, a permission, a policy, `@Public` or a reviewed open-route list all conform. `accessRules` takes
  `selectors`, `noRoleChecks` takes `pattern`; the defaults are unchanged and exported as `roleComparisonSelectors` and
  `roleComparisonPattern`. Service profile rule 16, `lanes/api.md` rule 8 and review item P2 follow.
- ADR 0004 (#12): contract-first and code-first both conform when the file is committed, a gate prevents drift and the
  documentation standard applies to the file. Service profile rule 19 follows. README: what a code-first project fixes
  in its generator.
- Spectral preset (#12): `oas3-api-servers` and the new `rules-error-response-problem-json` (4xx and 5xx responses of
  operations have an `application/problem+json` body) as `warn`; both become `error` in the next major version.
  `rules-error-problem-json` keeps its check; its description now says what it checks.
- Base rule 1 (#13): user and customer data is synthetic in every test and fixture; public reference data the product
  publishes may be read from the environment the stack ADR names under "Acceptance runs". ADR 0010 points to it.
- Base rule 7 (#14): nine commit types (adds `perf`, `build`, `ci`); a body and trailers may follow unless the project's
  own rules forbid them.
- `templates/stack.md`: section "How this app meets the shared rules" (access declaration, principal shape, contract
  variant, acceptance runs, commit messages) and `accessRules` in the gate options.
- Upgrading: bump the pin and run `rules-sync --agents AGENTS.md`. Written exceptions for the four cases above move
  into the stack ADR section and stop being exceptions.

## v2.4.0 (2026-11-09)

- Profiles: `agents/AGENTS.base.md` keeps the rules for every project; `agents/profiles/service.md` holds the web-app and
  API-service rules (the v2.2.1 "Where code goes", "Access, AI and data" and "API contract" rules, renumbered from 10, now from 11); `agents/profiles/factory.md` is new.
- ADR 0011: factory projects (the orchestrator, the tracker, operator tooling) use ports and adapters, not feature folders.
- dependency-cruiser preset `portsAndAdaptersRules({ root, severity })`; it names no package.
- `rules-sync --profile service|factory` (default `service`).
- `agents/AGENTS.base.md` keeps rules 1–10 for every project: data and secrets, working, shared modules and review (ADR 0009), acceptance (ADR 0010). Profile rules start at 11.
- Commit rule: a one-line conventional subject; a body and trailers may follow.
- Upgrading a service project: bump the pin and run `rules-sync --agents AGENTS.md` once; its AGENTS.md block is regrouped.

## v2.3.0 (2026-11-09)

Acceptance per feature (ADR 0010). Additive: no gate changes.

- New ADR 0010: each feature has one acceptance file with criteria (id, outcome, failure paths, exactly one check of kind
  e2e, api, metric or manual) and a Monitor list; each epic has one spec with criteria roles, Improve and Guard measures and
  an effect window (default 14 days). An epic has a kind (`feature`, `work`) and a key for the criteria it owns, written in
  full in the epic file. An epic closes when its criteria's checks pass and are recorded; Improve and Guard measures are
  judged after release and never reopen it (a missed Guard opens a bug). Monitor entries have a kind (`usage`, `health`,
  `outcome`). Tickets name criteria with `Feature acceptance:`; a bug with `Fixes:`.
- New templates `templates/acceptance.md` and `templates/epic.md`: YAML front matter is the parsed part, the body is prose.
- `agents/AGENTS.base.md` rule 19.

## v2.2.1 (2026-11-09)

- ADR 0008 rule 14 and `agents/lanes/web.md` rule 15: a page "matches its design" by structure (regions, order,
  grouping, hierarchy), components and content, not by equal computed styles. A few pixels of shift or a different
  line break is accepted; a broken grouping, order or emphasis is not. Style values are accepted once per
  design-system component; structure is tested with accessibility-tree snapshots per designed state; screenshot
  baselines are regression guards taken after acceptance. Wording only: no option or check changes.

## v2.2.0 (2026-11-09)

Shared modules and placement review (ADR 0009). Additive: no existing option or rule changes; the new presets add rules
only where a project calls them.

- New ADR 0009: each cross-cutting concern (outside HTTP calls and the API client with retries and token refresh, auth,
  logging and metrics, errors, configuration, time and time zones, ids, persistence, jobs, model calls, validation) has
  one home, recorded in the app's stack ADR. Features use it and never rebuild it; a missing capability goes into the
  home. A home exists from its first caller.
- New `agents/review.md` (synced to `.rules/agents/review.md`): the placement checklist P1–P14 for every reviewer. A
  placement finding in a new or changed line is a blocker; untouched lines are not reported.
- `agents/AGENTS.base.md`: section "Shared modules and review", rules 17 and 18 (rules 1–16 keep their numbers).
- `templates/stack.md`: a "Shared modules" table (home per concern for api and web, packages only the home imports) and
  the new gate options. ADR 0007 rule 3 names it. `templates/pull-request.md`: a placement checkbox.
- New dependency-cruiser preset `sharedModuleRules({ root, modules, severity })`: a concern's packages are imported only
  in its home.
- New ESLint preset `httpRules({ files, client })`: no `fetch` or `XMLHttpRequest` outside the HTTP or API client home.

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
