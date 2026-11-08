# ADR 0002: Access is declared on the route and decided by policies

Status: accepted (2026-11-08)

## Context

Role checks were written by hand inside use cases (`actor.role === 'coach' && …`), the same ownership check was copied
into several places, and nobody could answer "who may see this resource" from one file.

## Decision

1. `shared/auth` provides the only access mechanisms: authentication guards (browser session, OAuth2 access token for
   machines), `@Roles(...)`, `@Policy(rule, paramName)`, `@Public()`, and `@Principal()` to read the caller.
2. Each feature has `<feature>.policy.ts` with its rules, defined through `definePolicy(resource, { read, change, … })`.
   A rule is a pure function `(principal, resource) => boolean`.
3. The policy guard loads the resource through the feature's port, applies the rule, and answers `404` when the caller may
   not know the resource exists, `403` when they may know it but not act on it.
4. List endpoints use the same rule as a query filter, so a list and a single read never disagree.
5. Services and controllers never compare roles. Tenant scoping comes from the request context and row-level security,
   never from a parameter.

## Enforcement

- `presets/eslint` `accessRules`: fails on `.role ===`, `.role !==`, `roles.includes(` outside `*.policy.ts` and `shared/auth`.
- `fitness.noRoleChecks`: the same check for repositories without the ESLint preset.
- Every route declares `@Roles` or `@Public` (each project keeps its auth-coverage test).
