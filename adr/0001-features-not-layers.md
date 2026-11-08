# ADR 0001: Code is organised by feature, layers live inside the feature

Status: accepted (2026-11-08)

## Context

Our first services were sliced by technical layer (`core/`, `app/`, `adapters/`, `http/`, `workers/`, `modules/`). One
feature ended up in up to seven top-level folders; nothing in the tree said what belonged to it; access checks and helpers
were copied between use cases because no folder owned them.

## Decision

1. Every service (`apps/api` and similar) has one top-level folder per **feature** and one `shared/` folder. A feature is
   a business capability (`reports`, `sessions`, `users`), not a technical layer.
2. A feature folder holds everything for that capability:

   | File or folder | Responsible for | Never |
   | --- | --- | --- |
   | `<feature>.module.ts` | Wiring: ports to adapters, controllers, stages, event handlers | Logic |
   | `<feature>.controller.ts` | Route, method, `@Roles`/`@Policy`, params → service call → response DTO | Role or ownership checks, I/O, try/catch, rules |
   | `<feature>.service.ts` | Use cases: transaction, load via ports, call domain, save, audit, events | HTTP types, SQL, role comparisons |
   | `<feature>.policy.ts` | Access rules for the feature's resources (ADR 0002) | I/O beyond the one lookup it gets |
   | `<name>.stage.ts` | One background/pipeline stage | Own retry or transaction rules |
   | `<feature>.events.ts` | Event names, payloads, handlers for other features' events | Audit rows |
   | `domain/` | Types, invariants, calculations, port interfaces | I/O, clock, env, framework, `try` |
   | `adapters/` | Repositories, files, external calls behind a port | Business decisions |
   | `dto/` | Contract types ↔ domain types | Hand-written validation |
   | `index.ts` | The public surface: module, service interfaces, event types | Adapters or domain internals |

3. **One public door.** Another feature imports only `<feature>/index.ts`. `shared/` imports no feature.
4. **Work across features has one owner.** The feature whose job it is calls the others' `index.ts` (deletion on request
   in `lifecycle/`, mails in `notifications/`). There is no general "application" layer.
5. **`shared/` is infrastructure only:** `ai/` (ADR 0003), `auth/`, `providers/` (db, queue, logger, clock, ids, metrics,
   config), `adapters/` (crypto, pdf, outbound HTTP), `http/` (filters, pipes, interceptors), `contracts/`, `entities/`,
   `helpers/` (pure, used by three or more features), `testing/`. Code that names a business object belongs to its feature.
   A helper with one caller stays with the caller.
6. Tests sit next to the file they test.

## Enforcement

- `presets/dependency-cruiser` `featureRules`: cross-feature imports only through `index.ts`; `shared/` never imports a
  feature; `domain/` imports no adapters, framework or Node I/O.
- `fitness.featureShape`: every top-level folder is a feature with an `index.ts`, `shared/`, or an allowed entry file.

## Consequences

Changing a feature touches one folder. Moving an existing service to this layout is a mechanical move per feature; the
import rules start as warnings and become blocking when the move is complete.
