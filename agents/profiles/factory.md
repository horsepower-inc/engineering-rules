## Profile: factory (the software factory: orchestrator, tracker, operator tooling)

### Where code goes

11. Code is organised in ports-and-adapters layers (ADR 0011): `src/core/` is pure domain, `src/app/` holds use cases
   over ports, `src/adapters/` and `src/plugins/` do the I/O, `src/cli/` wires one command, `src/main.ts` is the only
   composition root, `src/arch/` holds the fitness tests.
12. `src/core/` imports nothing outside itself and never reads the clock, the environment, files or the network; take
   "now" and every input as an argument.
13. `src/app/` reaches the outside world only through a port interface; it never imports `src/adapters/` or
   `src/plugins/`. Contract tests (`*.contract.test.ts`) are the one exception.
14. An adapter implements a port and makes no business decision. A new external system gets a port first.
15. Every non-test module in `src/core`, `src/app` and `src/cli` has its row in `docs/ARCHITECTURE.md` in the same change.
16. A function returns a typed failure value for an expected failure (refused, conflict, needs a human, unavailable);
   `throw` is for programmer errors only.

### Agents, models and limits

17. Coding agents and models run only through the runner port (the CLI runner or the API driver behind it). Prompt and
   completion text never reach logs, comments or metrics; record tokens, cost, duration and outcome instead.
18. Every agent run has a budget (tokens, time, attempts) read from configuration. Over budget, stop the run and say so;
   never retry past it.
19. Anything that runs unattended (a loop, a lander, a reactor) has a pause path and a give-up that reaches a human, and
   is safe to run twice on the same input.

### Contracts and data

20. A change to a frozen contract (the documents under `docs/CONTRACTS.md`, the MCP tool catalogue, a migration) states
    it in the ticket and changes the contract test in the same change. Migrations are new files, never edits.
21. Database behaviour is tested against a real database, never a mock of it.
