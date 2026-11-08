# ADR 0007: Each app covers every concern with an existing library and records its own stack

Status: accepted (2026-11-08)

## Context

ADR 0005 first named one web state library for every app. Apps differ in size and needs, and a library that fits one app
is overhead in another. What should be shared is the rule that a concern is solved with maintained, widely used code and
not by hand, and that each app writes its choices down where agents and reviewers find them.

## Decision

1. The shared rules name **concerns** (server data, shared client state, multi-step work, routing, forms, i18n, HTTP
   framework, database access, queues, validation, testing, observability) and the layer rules around them. They never
   name a library, framework or version.
2. Each app covers each concern it has with an **existing, maintained library or framework**, not with hand-written
   infrastructure. Hand-written code for a concern is allowed only when the stack ADR says why no library fits.
3. Each app records its choices in **its own stack ADR** (`templates/stack.md`): one row per concern with the library,
   the reason and the alternatives considered. Changing a choice is an amendment to that ADR.
4. Each app **pins its own dependencies** in its own manifest and lockfile. The shared rules pin nothing.
5. The shared gates take the app's packages as options (for example `fitness.webLayers({ store, serverData, router,
   apiClient })`, `featureRules({ frameworkModules })`), filled from the stack ADR.
6. Agents use the library the stack ADR names for a concern. Adding a second library for a covered concern, or writing by
   hand what the named library does, needs a stack ADR amendment first.

## Enforcement

- The project's own review: a dependency added in a PR names its stack ADR row.
- The shared gates enforce the layer rules with the packages the app passes in; with no packages passed they check only
  the app's own folders.

## Consequences

Apps can choose what fits them and upgrade on their own schedule. The shared rules stay valid across stacks. Each app
carries one more document, its stack ADR, which is the first thing an agent reads before adding a dependency.
