# ADR 0003: Every language-model call goes through one AI gateway with tracing and budgets

Status: accepted (2026-11-08)

## Context

Model calls are the most expensive and least predictable dependency we have. Drivers, prices, call logs and spend limits
grew in different places; there was one global daily ceiling and no trace per call.

## Decision

1. Each service has `shared/ai/` with one entry: `ai.run(task, input, context)`, returning a typed, schema-checked result.
   ```
   shared/ai/
     ai.gateway.ts   routing/  budget/  tracing/  guards/  prompts/  drivers/  pricing/  index.ts
   ```
2. **Routing:** a task (`tagging`, `summary`, …) resolves to provider + model from configuration per tenant (or per
   project); a provider not on the approved list is refused; an optional fallback model covers provider outages.
3. **Budget:** before a call the gateway estimates cost (input tokens + output limit at the price table) and reserves it
   against every applicable cap: job, tenant per day, tenant per month, global per day. Over a cap: no call; the caller gets
   a typed `BudgetExceeded` (jobs wait or fail with a clear code). After the call it settles the real cost from the
   provider's usage and releases the remainder. Caps are configuration, not code.
4. **Tracing:** one OpenTelemetry span per call, child of the caller's span, with: tenant, job, stage, task, provider,
   model, prompt version, input hash, tokens in/out/cached, cost, latency, retries, outcome. The same fields are stored in
   a call ledger for audit and replay. Prompt and completion **text is never** in spans, logs or metrics.
5. **Guards:** input passes the project's data-protection check (for example "pseudonymised only") or the call is refused;
   output is validated against the task's JSON schema; refusal and truncation are typed errors.
6. **Resilience:** timeouts, retry with backoff on 429/5xx, circuit breaker per provider, idempotent replay of a stored
   answer after a crash.
7. **Visibility:** metrics for spend per tenant and model, tokens, latency, errors; alerts at 80% and 100% of each cap.
8. Prompts are versioned files; the version is part of every trace and every stored result.
9. Tests use a `fake` driver through the same gateway, so budget and tracing run on every test path.

## Enforcement

- `presets/eslint` `aiGatewayRules` and `fitness.noDirectDriverImports`: only `shared/ai` imports model drivers or vendor SDKs.
