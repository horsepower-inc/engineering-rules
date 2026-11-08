## Engineering rules (shared, from horsepower-inc/engineering-rules)

These rules apply in every project. The project's own sections in this file add to them; when they seem to conflict,
stop and ask. The decisions behind them are in `.rules/adr/`.

### Where code goes

1. Code is organised by feature, not by layer (ADR 0001). A change to one capability touches one feature folder.
2. Import another feature only through its `index.ts`. Never reach into its files, never copy a type or a function to
   avoid an import.
3. `shared/` is infrastructure only. Code that names a business object belongs to its feature; a helper with one caller
   stays with the caller.
4. In a feature: the controller translates HTTP, the service runs the use case and owns the transaction, `domain/` is
   pure, `adapters/` do the I/O, the policy decides access.
5. Web apps: `pages/` compose, `components/` render from props, `state/` holds store and flows, `api/` talks to the
   server, `model/` is pure (ADR 0005).

### Access, AI and data

6. Never compare roles in a controller or service. Declare `@Roles`/`@Policy` on the route; put the rule in the feature's
   `*.policy.ts` (ADR 0002).
7. Every language-model call goes through `shared/ai` (`ai.run`). Never import a model driver or vendor SDK elsewhere; never
   bypass the budget or tracing (ADR 0003).
8. No personal data, secrets, prompt text or model output in logs, metrics, traces, errors, tests or fixtures. Tests use
   synthetic data only.
9. Secrets arrive through the environment from the secret manager. If one is missing, stop and say so; never hardcode one.
10. No environment-specific address (production host, localhost) in code that is built once and promoted. Read it from
    configuration at runtime or link to a same-origin path.

### API contract

11. The OpenAPI contract is the source of truth. A route change changes the contract in the same change, and meets the
    documentation standard: description, examples, error codes, security (ADR 0004).

### Working

12. Tests before implementation at the seams you change. A bug fix adds a test that fails without the fix.
13. For every change, check the failure paths: cancelled or timed out, failed halfway, run twice, input at its edge.
14. No refactors, renames or "while at it" changes outside the task. Propose them separately.
15. Never weaken or disable a gate to make it pass. Fix the cause.
16. Commit messages: one line, conventional (`feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`).
