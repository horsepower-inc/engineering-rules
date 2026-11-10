# ADR 0010: Acceptance is defined per feature and verified per epic

Status: proposed (2026-11-09)

## Goal

Every feature states what a user can rely on, each statement has exactly one check that proves it, and an epic is done when
the checks of the criteria it touches pass and are recorded. Its effect on the product is measured after release, over its
effect window, without holding the epic open.

## Decision

1. **A feature has one acceptance file,** `docs/acceptance/<feature>.md` (`templates/acceptance.md`). A feature is a lasting
   product capability (sign-in, upload, reports), not a batch of work. Its key is two to four capital letters, unique in the
   repository (feature and epic keys together), and prefixes every criterion id.
2. **A criterion** has an id `<KEY>-AC<n>`, a user-visible outcome in one or two sentences, its failure paths, and exactly one
   check. An id is never reused; a criterion that no longer applies stays in the file with `status: retired`.
3. **A check** has one kind:
   - `e2e`: a browser test, named by spec file and test name;
   - `api`: an API scenario test against the real stack, named by scenario (the environment and what tests may read
     and write there are in the stack ADR, "Acceptance runs"; user data stays synthetic, base rule 1);
   - `metric`: a measured value, named by measure, source and threshold;
   - `manual`: a check a person does, named by owner and what they look at.
4. **Monitor:** the acceptance file names the feature's lasting metrics: their kind (`usage`, `health` or `outcome`), what is
   measured, the source tool from the app's stack ADR, the target and how it is shown.
5. **An epic has one spec,** `docs/epics/<epic>.md` (`templates/epic.md`): the tracker's epic number, a kind (`feature`
   changes what users get, `work` changes how it is built or run), a key for the criteria it owns, the criteria it touches
   with a role each (`adds`, `changes`, `keeps`, `owns`), its Improve measures (what should get better) and Guard measures
   (what must not get worse) with targets, and an effect window in days (default 14). A feature epic has at least one Improve
   measure; a work epic may have Guard measures only. An `owns` criterion belongs to the epic itself (work that no feature
   carries) and is written in full in the epic file, with the same fields as a feature criterion and an id
   `<epic key>-AC<n>`.
6. **Tickets point at criteria.** A ticket that works towards criteria has one line `Feature acceptance: <ids>`. A bug ticket
   has one line `Fixes: <id>` and no `Feature acceptance` line. A ticket closes no criterion on its own.
7. **An epic closes** when every check of its `adds`, `changes`, `keeps` and `owns` criteria passes in the environment the
   project names (its stack ADR, "Acceptance runs") and the result is recorded per criterion. A failing criterion becomes a
   ticket and keeps the epic open.
8. **Effect after release.** Improve and Guard measures are judged after release over `effect_window_days`. A Guard measure
   that misses its target opens a bug at once; at the end of the window the numbers go to a person. The effect never
   reopens the epic.
9. **The files are the source.** A tracker or dashboard shows criteria, checks and results read from these files and from
   recorded runs; it never edits them.

## Enforcement

- The project's ticket lint: a `Feature acceptance` or `Fixes` id must exist and not be retired; every epic criterion has a
  check; an `adds`, `changes` or `owns` criterion has at least one ticket (a `keeps` criterion needs none); a feature epic has
  an Improve measure.
- A file check (the tracker's parser or a fitness test): every acceptance and epic file parses against its template's front
  matter; ids are unique per repository.
- Closing an epic is refused without a recorded passing run per criterion (the tracker's rule); a missed Guard target opens
  a bug (the tracker's rule).

## Consequences

Each feature carries a short file that outlives its epics and doubles as its regression suite. Writing a criterion costs a
named check up front; an outcome with no check cannot be written down as accepted.
