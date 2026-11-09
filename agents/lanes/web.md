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
   Pages use the package's components and layout; they set no visual value of their own (ADR 0008).
7. Every user-visible string is translated in every supported language in the same change.
8. Links to another of our hosts use a same-origin path or runtime configuration, never a hardcoded host.

## UI and design system (ADR 0008)

9. Every visual value is a token. No colour literals, pixel sizes, weights, z-indexes, durations, arbitrary utility
   values, `!important` or theme variants (`dark:`) in app code; a missing token is added to the token file, never
   worked around.
10. Use the design-system component. Never import the behaviour or table library in app code, never pass `className`
    or `style` to a design-system component; if no variant fits, stop and ask for one in the package.
11. Place things with the layout components (page, page header, grid, split, stack, cluster, form layout, panel). One
    `<main>`, one `h1` per page; nothing scrolls sideways at 390 px.
12. Dialogs, menus and toasts come from the package. Destructive actions confirm in a dialog; only the confirming
    button uses the destructive colour.
13. Every interaction state change is animated with the motion tokens, through the package; reduced motion is
    already handled there.
14. Format dates, times, durations, numbers, percentages and ratios only through the formatting module, with the
    user's locale; never call `toLocale…` or `Intl` formatters directly.
15. A page change is done when the page matches its design in a browser in both themes, every language, desktop and
    phone width. Matching means the same structure (regions, order, grouping, hierarchy), components and content, not
    equal pixels or computed styles; keep its structure snapshots passing, test behaviour with flows, and update its
    screenshot baselines on purpose, with the reason in the PR. A wrong style value is fixed in the component, not on
    the page.
