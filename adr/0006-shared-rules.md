# ADR 0006: Engineering rules live in one public repo and are pinned per project

Status: accepted (2026-11-08)

## Context

Rules, linters and fitness tests were copied by hand from one project to the next and drifted apart.

## Decision

1. `horsepower-inc/engineering-rules` (public, no secrets or product data) holds organisation-wide ADRs, the base agent
   instructions, fitness checks and lint/import/API-docs presets.
2. A project installs it as a dev dependency pinned to a tag (`github:horsepower-inc/engineering-rules#vX.Y.Z`). Gates run
   against exactly that version; nothing is fetched at gate time.
3. `rules-sync` copies ADRs, agent rules and templates into the project's `.rules/` and writes the base agent rules
   between markers in its `AGENTS.md`. `rules-sync --check` runs in CI and fails on any local edit or drift.
4. A project's own ADRs and AGENTS.md sections add to the shared rules and never contradict them. A needed exception is
   proposed here as a change, not made locally.
5. Versioning: MAJOR when a project's gates can turn red on unchanged code; MINOR for new rules behind an option or
   documentation; PATCH for fixes. Every change has a CHANGELOG entry.
