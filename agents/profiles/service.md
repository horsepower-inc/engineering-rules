## Profile: service (web apps and API services)

### Where code goes

11. Code is organised by feature, not by layer (ADR 0001). A change to one capability touches one feature folder.
12. Import another feature only through its `index.ts`. Never reach into its files, never copy a type or a function to
   avoid an import.
13. `shared/` is infrastructure only. Code that names a business object belongs to its feature; a helper with one caller
   stays with the caller.
14. In a feature: the controller translates HTTP, the service runs the use case and owns the transaction, `domain/` is
   pure, `adapters/` do the I/O, the policy decides access.
15. Web apps: `pages/` compose, `components/` render from props, `state/` holds reducers, flows and any shared store,
    `api/` talks to the server, `model/` is pure (ADR 0005). The UI is built from the design system: tokens, generated
    theme, closed components, layout components, motion tokens and one formatting module (ADR 0008).

### Access, AI and addresses

16. Never compare roles or permissions in a controller or service. Declare access on the route with the project's auth
   home (`@Roles`/`@Policy`, a permission declaration, or an explicit open-route marker); put the rule in the feature's
   `*.policy.ts` (ADR 0002).
17. Every language-model call goes through `shared/ai` (`ai.run`). Never import a model driver or vendor SDK elsewhere; never
   bypass the budget or tracing (ADR 0003).
18. No environment-specific address (production host, localhost) in code that is built once and promoted. Read it from
   configuration at runtime or link to a same-origin path.

### API contract

19. There is one OpenAPI contract and it never drifts from the code: written by hand with code generated from it, or
   generated from the code and committed, as the stack ADR says. A route change changes the contract in the same
   change, and meets the documentation standard: description, examples, error codes, security (ADR 0004).
