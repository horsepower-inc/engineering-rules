# ADR 0002: Access is declared on the route and decided by policies

Status: accepted (2026-11-08), amended (2026-11-10: outcome first, permission-based access conforms; ADR 0012)

## Context

Role checks were written by hand inside use cases (`actor.role === 'coach' && …`), the same ownership check was copied
into several places, and nobody could answer "who may see this resource" from one file.

## Decision

1. The auth home provides the only access mechanisms: authentication guards (browser session, OAuth2 access token for
   machines), the route's access declaration, and the way to read the caller. **Every route carries an access
   declaration that the auth home enforces deny-by-default, and a project test proves no route is undeclared.**
   Conforming declarations: roles (`@Roles(...)`), a permission (`@Permissions(...)`), a policy
   (`@Policy(rule, paramName)`), and for a route open to everyone an explicit marker (`@Public()`) or an entry in one
   reviewed list of open routes, each with its reason. Reference implementation: `shared/auth` with `@Roles`,
   `@Policy`, `@Public` and `@Principal()`.
2. Each feature has `<feature>.policy.ts` with its rules, defined through `definePolicy(resource, { read, change, … })`.
   A rule is a pure function `(principal, resource) => boolean`.
3. The policy guard loads the resource through the feature's port, applies the rule, and answers `404` when the caller may
   not know the resource exists, `403` when they may know it but not act on it.
4. List endpoints use the same rule as a query filter, so a list and a single read never disagree.
5. Services and controllers never compare roles or permissions. Tenant scoping comes from the request context and row-level security,
   never from a parameter.

## Enforcement

- `presets/eslint` `accessRules({ files, allow, selectors })`: by default fails on `.role ===`, `.role !==`,
  `roles.includes(` outside `*.policy.ts` and `shared/auth`. A project whose principal has another shape (for example
  `role.tag`, or a permission map) passes its own `selectors`; `roleComparisonSelectors` exports the defaults to extend.
- `fitness.noRoleChecks({ dirs, allow, pattern })`: the same check for repositories without the ESLint preset;
  `roleComparisonPattern` is the default.
- Every route has an access declaration (each project keeps its auth-coverage test).
