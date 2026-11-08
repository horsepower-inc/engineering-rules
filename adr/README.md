# Organisation-wide ADRs

| ADR | Decision |
| --- | --- |
| [0001](0001-features-not-layers.md) | Code is organised by feature; layers live inside the feature |
| [0002](0002-access-policies.md) | Access is declared on the route and decided by policies |
| [0003](0003-ai-gateway.md) | Every language-model call goes through one AI gateway with tracing and budgets |
| [0004](0004-api-documentation.md) | The OpenAPI contract is complete enough for an outside team |
| [0005](0005-web-app-layers.md) | Web apps split each feature into pages, components, state, api and model |
| [0006](0006-shared-rules.md) | Engineering rules live in one public repo and are pinned per project |
| [0007](0007-stack-per-app.md) | Each app covers every concern with an existing library and records its own stack |
| [0008](0008-factory-ports-and-adapters.md) | Factory projects use ports and adapters, not feature folders |

ADR 0001 applies to the `service` profile, ADR 0008 to the `factory` profile; ADR 0007 applies to every app, and the others to both profiles where the project has routes or a web app.

New ADRs use `templates/adr.md`; an app's stack record uses `templates/stack.md`. Project ADRs live in the project and may add to these, never contradict them.
