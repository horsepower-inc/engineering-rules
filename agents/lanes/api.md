# Lane: API services

In addition to `AGENTS.base.md`.

1. New code goes into the feature it serves; a new feature folder gets `<feature>.module.ts`, `index.ts` and, if it has
   routes, `<feature>.controller.ts` and `<feature>.policy.ts`.
2. A controller method is a few lines: decorators, one service call, response mapping. If it needs an `if`, the logic
   belongs in the service or the policy.
3. A service method opens at most one transaction per use case and writes the audit event inside it.
4. `domain/` functions take everything they need as arguments (including "now"); they never read the clock or the
   environment.
5. Repositories return domain types, never database rows, and never decide business rules.
6. Domain events feed mails and read models only; audit is written by the use case.
7. Long-running or retriable work is a stage in the job model, not a loop in a request handler.
8. Every route: `@Roles` or `@Public`, a policy for resource access, a contract entry with description and examples.
