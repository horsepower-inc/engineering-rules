# Lane: web apps

In addition to `AGENTS.base.md`.

1. A page reads route params, calls the feature's hooks and lays out components. No API calls, no `useEffect` that
   fetches, no workflow state in a page.
2. Server data comes from RTK Query endpoints in the feature's `api/`; an adapter maps contract DTOs to view models.
3. Multi-step work (upload, polling, autosave, export) is a flow in `state/` (listener middleware), cancellable and
   tested with fake timers.
4. Components render from props and emit events; they never import the store, the API client or the router.
5. Pure view logic (filters, grouping, status mapping) lives in `model/` with unit tests.
6. Styles come from the design-system package and stylesheet files; no inline `<style>` elements (strict CSP).
7. Every user-visible string is translated in every supported language in the same change.
8. Links to another of our hosts use a same-origin path or runtime configuration, never a hardcoded host.
