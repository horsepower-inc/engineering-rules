# ADR 0004: The OpenAPI contract is complete enough for an outside team

Status: accepted (2026-11-08)

## Context

Contracts were written for our own web apps: summaries and schemas, almost no descriptions, no examples, only cookie
authentication. An integration partner could not use them without asking us.

## Decision

The contract (`openapi.yaml`) stays the source of truth; code is generated from it and a drift test keeps them equal.
Every contract meets this standard:

| Part | Required |
| --- | --- |
| Document | `info` with purpose, contact and terms; versioned base path (`/v1`); tags with descriptions; changelog and deprecation policy |
| Operation | Summary (verb first, one line), description (behaviour, side effects, who may call it in words, audit event, idempotency), `operationId` (camelCase), one tag |
| Parameters | Description, format, constraints, example |
| Request body | Schema and at least one named example |
| Responses | Every status the route returns, each with schema and example; errors as `application/problem+json` and the list of `code` values this operation can return |
| Schemas | Description on every schema and every property, meaning of each enum value, formats, `readOnly`/`writeOnly`, nullability |
| Security | Browser session for our apps, OAuth2 client credentials for machines, scopes per tag |
| Cross-cutting | Pagination (cursor, limit, order), `Idempotency-Key`, rate-limit headers, `Accept-Language`, time zones, request id |

Routes meant for partners carry `x-public: true` and change only with a deprecation period.
The rendered reference (Redoc or Scalar) is served from the same file.

## Enforcement

- `presets/spectral/api-docs.yaml` in CI. A project may start it as warnings while it fills the gaps; the target is errors.
