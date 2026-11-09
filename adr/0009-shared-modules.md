# ADR 0009: Cross-cutting work has one shared module, features use it, and review checks where code is placed

Status: proposed (2026-11-09)

## Context

ADR 0001 slices code by feature and says what `shared/` must **not** hold (business objects, helpers with one caller). It
never says what `shared/` **must** hold, or that a feature has to use it. A coding agent that works inside one feature
sees no reason not to write its own fetch-and-retry loop, its own token refresh, its own logger, a time-zone calculation
inside a UI component, or a model call next to the use case. Each copy is small, passes the gates, and behaves a little
differently: one retries a write, one logs a name, one counts a day in UTC, one skips the AI budget. Reviews looked for
bugs and unmet ticket lines, so a misplaced but working piece of code was at most an optional remark.

## Decision

1. **Horizontal and vertical.** A service has two kinds of code. Features (vertical, ADR 0001) hold one business
   capability each. Shared modules (horizontal) hold the work every feature needs done the same way. A shared module
   names no business object.
2. **Each cross-cutting concern has exactly one home,** recorded in the app's stack ADR (`templates/stack.md`, "Shared
   modules"), with its path for each app:

   | Concern | What the home owns |
   | --- | --- |
   | Outside HTTP calls | client, timeouts, retries with backoff, circuit breaking, call logging, error mapping |
   | Web API client | the one typed client: auth header and refresh, the sign-in redirect on 401, the error shape, the retry policy of the server-state library |
   | Auth | token check and refresh, the principal, guards and decorators (`@Roles`, `@Policy`, ADR 0002) |
   | Logging, metrics, tracing | the one logger, the metric registry, spans; redaction of personal data |
   | Errors | the error type, its codes, the mapping to the response format |
   | Configuration and secrets | reading the environment, typed config; nothing else reads the environment |
   | Time | the clock, time zones, calendar dates versus instants, day and month boundaries; formatting is ADR 0008's module |
   | Ids and idempotency | id generation, idempotency keys |
   | Persistence | connections, transactions, tenant scoping |
   | Jobs and pipeline | the queue client, the stage runner, retries, waits and backoff of a stage |
   | Model calls | the AI gateway (ADR 0003) |
   | Validation | request and response validation against the contract (ADR 0004) |

3. **Features use the home and never rebuild it.** No own retry or backoff loop, token refresh, 401 handling, logger,
   metric registry, environment read, time-zone arithmetic, queue client, transaction handling or model call.
4. **A missing capability goes into the home.** If the home cannot do what a feature needs, the change extends the home
   (named in its scope) or stops and asks. Never a local copy, never a second library for the concern (ADR 0007 rule 6).
5. **A home exists even with one caller.** ADR 0001's "a helper with one caller stays with the caller" is about business
   helpers. A cross-cutting concern lives in its home from the first caller.
6. **Review checks placement.** Every review checks each new or changed line against the placement checklist
   (`agents/review.md`, synced to `.rules/agents/review.md`). A placement violation in a new or changed line is a
   **blocker**, like a bug: the author moves the code to its home in the same change. Lines the change does not touch are
   not reported. Code that a migration has not moved yet keeps its project's documented layout; a change that adds to it
   still uses the shared homes of rule 3.

## Enforcement

- Review: the checklist in `agents/review.md`, with the blocker rule above. The project's reviewer prompt loads it.
- dependency-cruiser preset `sharedModuleRules({ root, modules })`: the packages of a concern (logger, queue client, HTTP
  client, time-zone library, …) are imported only in that concern's home. The app passes the packages and homes from its
  stack ADR.
- ESLint preset `httpRules({ files, client })`: no `fetch` or `XMLHttpRequest` outside the HTTP or API client home.
- Existing: `aiGatewayRules` (model calls), `accessRules` (role checks), `uiRules` (formatting), `fitness.webLayers`.
- Rules 3–5 for time-zone arithmetic, retry loops and token refresh written with plain language features have no generic
  gate; the review checklist covers them.

## Consequences

Retries, logging, time and model calls behave the same in every feature, and a fix in the home fixes every caller. The
first change that needs a capability a home lacks costs one more file in that change. Reviews block on misplaced code in
new lines, so authors check the stack ADR's homes before writing infrastructure.
