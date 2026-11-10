# Review checklist: is the code in the right place?

For reviewers (people, review agents and the factory reviewer) in addition to the review for bugs, security and the
ticket's requirements. The rules behind each item are in the ADRs named. "Home" means the shared module the app's stack
ADR records for that concern (ADR 0009, "Shared modules").

## How to apply it

1. Check every **new or changed line** of the diff against the items below. Do not report lines the change does not
   touch.
2. A match in a new or changed line is a **blocker**. Write it as:
   `blocker: <path>:<line> — placement <item id>: <what the line does>; belongs in <home or folder>`.
3. Before reporting a duplicate (P11), find the existing code and name its path.
4. Code that a migration has not moved yet keeps its project's documented layout (the project's AGENTS.md says which):
   its folder is not a finding, but new lines in it still use the shared homes (P3–P10).
5. Not a placement finding: a test file, a fixture, or a change the ticket's Scope explicitly asks for in that place.

## Items

| Id | Look for | Belongs in | ADR |
| --- | --- | --- | --- |
| P1 | Business logic in a controller, page or component: an `if` on business state, a calculation, a rule | the service, `domain/`, the policy, or web `model/` | 0001, 0005 |
| P2 | A role, permission or ownership comparison outside a policy file | the feature's `*.policy.ts`, declared on the route through the auth home | 0002 |
| P3 | A model call outside the AI gateway: a vendor SDK, raw HTTP to a model API, a hand-built prompt loop, its own token count, budget or retry around a model call | `ai.run` in the AI gateway home | 0003 |
| P4 | HTTP plumbing outside its home: `fetch` or another HTTP client, its own timeout, retry or backoff loop, its own token refresh or 401 handling, its own error mapping | the outside-call home (api) or the one API client and server-state hooks (web) | 0009 |
| P5 | Time handled in place: time-zone offsets or conversions, `getTimezoneOffset`, adding 24 hours for a day, day or month boundaries, parsing date strings, a calendar date stored as an instant, `new Date()`/`Date.now()` in `domain/` or a component | the time home (clock, zones, boundaries); formatting in the formatting module | 0009, 0008 rule 12 |
| P6 | Logging or metrics in place: `console.*`, a new logger instance, a metric registered outside the registry, a personal value in a log line | the logging and metrics home | 0009 |
| P7 | Environment read outside configuration: `process.env`, `import.meta.env`, a hardcoded host | the configuration home | 0009 |
| P8 | Persistence outside its layer: SQL in a service or controller, a transaction opened outside the service, a tenant filter written by hand | repositories in `adapters/`; transactions and tenant scope from the persistence home | 0001, 0009 |
| P9 | Background work in place: a loop, sleep or poll in a request handler, its own queue client, retries written inside a stage | a stage run by the jobs home | 0001, 0009 |
| P10 | Hand-written request or response validation next to the contract | the contract and the validation home | 0004, 0009 |
| P11 | A copy of a helper, type or function that exists in a home or another feature's `index.ts` | an import of the existing one | 0001 |
| P12 | Web layers crossed: a component imports the API client, store or router; a page holds workflow state or calls the API; `state/` formats text; pure view logic inside a component | `pages/`, `components/`, `state/`, `api/`, `model/` as ADR 0005 assigns | 0005 |
| P13 | UI built around the design system: a visual literal, a `style` prop, a behaviour-library import, locale formatting in place | the design-system package and the formatting module | 0008 |
| P14 | Code in the wrong owner: a feature's business object in `shared/` or in another feature, a shared module that names a business object | the feature that owns the object | 0001 |
