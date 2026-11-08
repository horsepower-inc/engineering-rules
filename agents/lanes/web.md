# Lane: web apps

In addition to `AGENTS.base.md`.

1. A page reads route params, calls the feature's hooks and lays out components. No API calls, no `useEffect` that
   fetches, no workflow state in a page.
2. Server data comes from the app's server-state library (its stack ADR) through hooks in the feature's `api/`; a mutation
   invalidates what it changes, polling uses the library's interval, and an adapter maps contract DTOs to view models. No
   hand-written fetch-and-poll loops.
3. Multi-step work (upload, autosave, export, editor rounds) is a reducer or state machine in `state/`, cancellable and
   tested with fake timers. No global store unless the stack ADR names the shared client state it holds.
4. Components render from props and emit events; they never import the store, the API client or the router.
5. Pure view logic (filters, grouping, status mapping) lives in `model/` with unit tests.
6. Styles come from the design-system package and stylesheet files; no inline `<style>` elements (strict CSP).
7. Every user-visible string is translated in every supported language in the same change.
8. Links to another of our hosts use a same-origin path or runtime configuration, never a hardcoded host.
