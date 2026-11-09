# ADR 0008: Every UI is built from one design system: tokens, theme, components, layout, motion and formatting

Status: proposed (2026-11-09)

## Context

A design comparison of 20 pages in one product (Coach Analyzer, round 2, 297 differences) found the same ten causes
on almost every page. None was a page bug; each was a missing rule in how the UI is built:

- headings lost their weight because the styling framework's theme was reset and only sizes were mapped back;
- a global class from one component (`.card`) restyled cards elsewhere and widened phone pages;
- stylesheets referenced design variables that did not exist, so boxes lost their padding silently;
- each dialog positioned itself, and most opened in the top-left corner;
- button and control variants were defined per page, so secondary borders and selected states differed;
- no field component owned label, hint and error, so hints had the wrong size and colour;
- each page built its own header and landmark, leaving empty breadcrumbs and a second `<main>`;
- dates and numbers were formatted in 20 places with different options: US, ISO and raw timestamps side by side;
- grid and fieldset children kept their minimum content width, so pages scrolled sideways on phones;
- figures formatted themselves, so a ratio was shown as "per 10".

Reviews and design comparisons find these late and one page at a time. The rules below make each one a structural
property of the code, so a page built from the system matches the design without a comparison round.

## Decision

Libraries are chosen per app and recorded in its stack ADR (ADR 0007, rows "UI components", "Styling and theme",
"Layout and tables", "Motion", "Formatting"). These rules name no library.

### Layers

```
design tokens (one source file)
  → generated: CSS variables for every theme, the styling framework's theme, typed values for other renderers
  → design-system package: foundation (base styles, focus, locale bridge) → layout → components → domain components
  → app pages: compose from the design-system package and the formatting module only
formatting module: pure functions, no UI dependency, shared by every renderer (app, PDF, e-mail, export)
```

### Rules

1. **Tokens are the only source of visual values.** Colour, type (size, line height, weight, tracking), spacing,
   radius, shadow, motion (durations, easings), breakpoints, z-order and layout widths are tokens in one file, which
   generates every theme. No other file defines a visual value.
2. **The styling framework's theme is generated from the tokens,** with the framework's own defaults switched off, so
   only token-backed utilities exist. A text style utility carries size, line height, weight and tracking together.
   Themes switch through variables, never through per-element theme variants (`dark:`).
3. **No literal visual values and no unknown tokens** in app or component styles: no colour literals, pixel sizes
   (except 1px hairlines), weights, z-indexes, durations, arbitrary utility values or `!important`. A reference to a
   token that does not exist fails a check.
4. **Components come from the design-system package,** built on a maintained accessible behaviour library (focus
   management, keyboard, overlays, selection, date and number fields). Apps never import the behaviour library or
   the table library directly.
5. **Component APIs are closed.** Components take design props (`variant`, `size`, `tone`, …), not `className` or
   `style`. A page that needs another look gets a variant in the package. Dynamic values (progress, positions) are
   numeric props the component applies itself.
6. **Component styles are scoped.** Utilities in the component, or a stylesheet whose every selector starts with the
   component's prefix. Global selectors live only in the base layer.
7. **Layout comes from the system.** A column grid and layout components (page, page header, grid, split, stack,
   cluster, form layout, panel) place everything; one `<main>` per page, owned by the shell; every page has a page
   header with its one `h1`. Grid and flex children may shrink (`min-width: 0`); no page scrolls sideways at 390 px.
   Data tables come from one table component that has a narrow-screen form.
8. **One field anatomy.** A field component owns label, "(optional)", hint and error; every input uses it.
9. **Overlays come from the system:** dialogs centred with a backdrop, focus trapped and returned; menus, popovers
   and tooltips positioned by the behaviour library.
10. **Destructive actions confirm.** On the page a destructive action is a normal secondary or quiet action that opens
    a confirmation; the destructive colour appears only on the confirming button.
11. **Every interaction is animated** with the motion tokens: hover, press, selection, overlays and disclosure enter
    and exit, toasts. Only opacity, transform, colours and size through grid rows are animated; nothing above the
    longest motion token; text, focus rings and content someone reads are not animated. Reduced motion is handled once,
    in the tokens; no component checks it.
12. **Dates, times, durations, numbers, percentages, ratios and sizes are formatted by one formatting module,** with
    the locale (and, for instants, the time zone) passed explicitly. Calendar dates and instants are different types.
    No other code calls the platform's locale formatting.
13. **Accessibility is part of the component:** WCAG 2.2 AA contrast for every token pair, a visible focus ring on
    every focusable element, full keyboard use, text sizes in rem with a minimum size, status never shown by colour
    alone.
14. **A page is done when it matches its design in a browser.** The design is an abstraction and the product is a grid,
    a design system and a component library, so "matches" means the same structure, components and content, not equal
    computed styles:
    - **Structure:** the same regions in the same order, the same grouping, the same hierarchy (heading levels, one
      primary action), placed on the grid, and the designed stacking order on a phone.
    - **Components:** the design-system component and variant the design uses in each place.
    - **Content:** the designed copy in every language and values formatted by the formatting module.

    A few pixels of shift, a width that follows the grid or a different line break is accepted. A group split apart or
    merged, text set as a run of lines without its grouping, a different order or emphasis, a missing or extra control
    or a different component is not. Style values (weights, colours, borders, spacing) are accepted once per
    design-system component with component tests, not per page. Behaviour is a separate list tested by end-to-end
    flows.

    Structure is tested with an accessibility-tree snapshot per designed state (landmarks, headings, groups, controls
    and text, without pixels). After a page is built or changed, it is reviewed against its design in a real browser
    (both themes, every language, desktop and phone width). Once accepted, its designed states get screenshot baselines
    as regression guards, not as the acceptance test. The most important user flows have end-to-end browser tests with
    their failure paths and a phone-width run.

## Enforcement

- ESLint preset `uiRules` (`@horsepower/engineering-rules/eslint`): no locale formatting outside the formatting
  module (rule 12); no import of the behaviour or table libraries outside the design-system package (rule 4); no
  `style` prop and no `<style>` element outside it (rules 5, 6).
- Fitness check `tokenReferences`: every `var(--…)` in styles and components names a generated token or an allowed
  component-local prefix (rule 3).
- Project gates, configured per stack: a style linter for literal values (rule 3), a test that component stylesheet
  selectors carry their prefix (rule 6), a drift test for the generated theme (rules 1–2), contrast tests for token
  pairs (rule 13), a browser check that no route scrolls sideways at 390 px (rule 7), structure snapshots, screenshot baselines and flow
  tests (rule 14).
- Rules 8–11 have no generic gate: the closed component API (rule 5) makes them the package's job, and the package's
  component tests cover each state.

## Consequences

Pages get shorter and can only produce designed results; new looks cost a variant in the package instead of a style in
a page. An existing app moves component family by component family and page area by page area, with temporary
allowlists for pages not yet moved. Each app records its UI libraries in its stack ADR.
