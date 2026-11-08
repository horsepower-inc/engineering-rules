# ADR 0008: Factory projects use ports and adapters, not feature folders

Status: accepted (2026-11-08)

## Context

ADR 0001 shapes a service around business features with controllers, policies and DTOs. The software factory is a
different kind of program: long-running loops and landers that drive coding agents, the tracker that holds their work,
and the operator tooling around them. Their code is already ports and adapters, the same layout in both repositories
(horsepower-inc/factory, about 1,400 TypeScript files; horsepower-inc/factory-tracker): a pure domain, use cases over
ports, adapters and plugins for the database, GitHub, the tracker and the agent CLIs, one composition root, and fitness tests
that hold the layers apart. Moving that code into feature folders would rewrite both repositories and gain nothing the
layer rules do not already give.

## Decision

1. A project with the `factory` profile keeps its source in these layers under `src/`:

   | Folder | Responsible for | Never |
   | --- | --- | --- |
   | `core/` | Domain types, rules, calculations, port interfaces | I/O, clock, environment, imports from outer layers |
   | `app/` | Use cases over ports: one job each, typed results | Imports from `adapters/` or `plugins/` |
   | `adapters/` | One external system each (database, GitHub, files, clock, network) behind a port | Business decisions, imports from `app/` or `plugins/` |
   | `plugins/` | Replaceable implementations of a port (agent runners, tracker clients, transports) | Imports from `app/` or `adapters/` |
   | `cli/` | One command's wiring: arguments, adapters, the use case, the exit code | Logic |
   | `main.ts` | The only composition root | Being imported |
   | `arch/` | Fitness tests over the source | Production code |

2. Contract tests (`*.contract.test.ts`) in `app/` may import an adapter to prove it meets its port.
3. Expected failures are typed values returned to the caller; `throw` is for programmer errors.
4. A model or coding agent is reached only through the runner port. Prompt and completion text are never logged;
   tokens, cost, duration and outcome are.
5. ADRs 0002, 0004 and 0005 apply to the parts of a factory project that serve HTTP routes or a web app; ADR 0001 does
   not apply. A factory project's web dashboard (for example the tracker's `web/`) keeps its own layout until a later
   ADR covers it.

## Enforcement

- `presets/dependency-cruiser` `portsAndAdaptersRules({ root: 'src' })`: the import direction of the table, plus
  "nothing imports `main.ts`".
- Each project's `src/arch/` tests: every module in `core/`, `app/` and `cli/` has a row in `docs/ARCHITECTURE.md`.
- `rules-sync --profile factory` writes `agents/profiles/factory.md` into the project's AGENTS.md.

## Consequences

The factory and the tracker adopt the shared rules without a restructure. A new factory component starts in this
layout. Service projects are unaffected: their profile keeps ADR 0001.
