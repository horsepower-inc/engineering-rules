# ADR 0012: Shared rules state outcomes; each project decides the implementation

Status: accepted (2026-11-10)

## Context

The first rules were written from one codebase, so they carried its implementation with them: decorator names
(`@Roles`), the direction of the API contract (file first, code generated), the shape of the principal (`.role`), a
closed list of six commit types. A second group of projects (the CoachInside repositories) met the intent of those rules
and failed their letter: permission-based access with a tested list of open routes, a contract generated from code with
a drift gate, nine commit types and a subject-only commit message. Agents that read both sets of rules saw a conflict
and stopped; the projects recorded "exceptions" for things that were not exceptions (issues #11 to #14).

These rules serve both the horsepower and the CoachInside projects. They can only do that as a guide to what must
hold, not as one project's implementation.

## Decision

1. A shared rule states an **outcome**: what must be true, and why. Where an ADR, an agent rule or the review checklist
   names a decorator, a file, a folder or a tool, that is the **reference implementation**: an example that conforms,
   not the only one.
2. **Each project decides how it meets an outcome.** A different implementation conforms when the project records it
   (its stack ADR, section "How this app meets the shared rules", or its own AGENTS.md sections) and a gate or test in
   the project enforces it. That is not an exception and needs no change here.
3. A project rule that is **stricter** than a shared rule, or that records how the project meets one, is **not a
   conflict**. Agents follow the project rule. A conflict is only a project rule that allows what a shared outcome
   forbids; then the agent stops and asks, and the exception is proposed here (ADR 0006 rule 4).
4. A project picks a **profile** (ADR 0001 or ADR 0011) for its layout. Inside the profile, rules 1 to 3 apply.
5. **Gates take the project's shapes as options.** Their defaults are the reference implementation. A shared gate that
   cannot express a project's conforming implementation is a defect of the gate, reported here; until it is fixed the
   project enforces the outcome with its own check.
6. New and amended ADRs are written this way: the Decision gives the outcome first, then the reference implementation,
   marked as such.

## Enforcement

- No gate: this ADR is about how the rules are written. Reviewers of a change to this repository check rule 6.
- `templates/stack.md` has the section a project fills for rule 2.

## Consequences

One set of rules fits projects with different frameworks, auth models and release tooling. Agents stop less often,
because "stricter" and "done differently, recorded and enforced" no longer read as conflicts. The cost: a reviewer can
no longer check a project by matching names; they read the project's stack ADR to see how it meets each outcome. ADRs
0002 and 0004 are amended in this form; the others are amended when a project meets one of them differently.
