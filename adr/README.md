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
| [0008](0008-ui-design-system.md) | Every UI is built from one design system: tokens, generated theme, closed components, layout, motion and one formatting module |
| [0009](0009-shared-modules.md) | Cross-cutting work has one shared module, features use it, and review checks where code is placed |
| [0010](0010-acceptance-per-feature.md) | Acceptance is defined per feature and verified per epic |

New ADRs use `templates/adr.md`; an app's stack record uses `templates/stack.md`. Reviewers check placement with `agents/review.md`. Project ADRs live in the project and may add to these, never contradict them.
