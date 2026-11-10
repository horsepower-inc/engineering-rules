## Engineering rules (shared, from horsepower-inc/engineering-rules)

These rules apply in every project. The profile below them adds the rules for this kind of project; the project's own
sections in this file add to both. The shared rules say what must hold; where they name a decorator, file or tool, that
is one conforming example, and the project's stack ADR and its own sections say how this project does it (ADR 0012). A
project rule that is stricter than a shared rule, or that records how the project meets one, is not a conflict: follow
the project rule. Stop and ask only when a project rule would allow what a shared rule forbids. The decisions behind
them are in `.rules/adr/`.

### Data and secrets

1. No personal data, secrets, prompt text or model output in logs, metrics, traces, errors, tests or fixtures. Data about
   users and customers (accounts, addresses, IPs, device ids, messages, anything entered by or about an account holder)
   is synthetic in every test and fixture, without exception; network addresses come from the documentation ranges.
   Public reference data the product itself publishes may be read by tests from the environment the stack ADR names
   under "Acceptance runs"; it is never copied into a fixture next to user data, and a test never changes shared data
   without restoring it.
2. Secrets arrive through the environment from the secret manager. If one is missing, stop and say so; never hardcode one.

### Working

3. Tests before implementation at the seams you change. A bug fix adds a test that fails without the fix.
4. For every change, check the failure paths: cancelled or timed out, failed halfway, run twice, input at its edge.
5. No refactors, renames or "while at it" changes outside the task. Propose them separately.
6. Never weaken or disable a gate to make it pass. Fix the cause.
7. Commit messages: a one-line conventional subject (`feat:`, `fix:`, `perf:`, `refactor:`, `docs:`, `test:`, `build:`,
   `ci:`, `chore:`). A body and trailers (`Refs: PB-12`, `Co-Authored-By:`) may follow after a blank line unless the
   project's own rules forbid them.

### Shared modules and review

8. Cross-cutting work has one home per concern, listed in the app's stack ADR (ADR 0009): outside HTTP calls and the API
   client (timeouts, retries, token refresh), auth, logging and metrics, errors, configuration, time and time zones, ids,
   persistence, jobs, model calls, validation. A feature uses the home and never rebuilds it; if the home lacks
   something, extend the home in the same change or stop and ask.
9. Reviews check every new or changed line against `.rules/agents/review.md` (is the code in the right place?). A
   placement finding in a new or changed line is a blocker, the same as a bug.

### Acceptance

10. A feature's criteria live in `docs/acceptance/<feature>.md`, each with exactly one check (ADR 0010). A ticket that works
   towards criteria names them in one `Feature acceptance: <ids>` line; a bug names one in a `Fixes: <id>` line.
