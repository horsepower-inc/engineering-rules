---
# ADR 0010. One file per epic: docs/epics/<epic>.md. The front matter is the parsed part; the body is prose.
epic: 96                        # the tracker's epic number (an integer)
name: Invitations by e-mail
kind: feature                   # feature | work; a feature epic has at least one improve measure
key: RF                         # 2-4 capital letters, unique with the feature keys; prefixes the criteria this epic owns
criteria:
  - { id: IN-AC1, role: adds }      # adds | changes | keeps | owns
  - { id: IN-AC2, role: changes }
  - { id: AU-AC3, role: keeps }     # must still pass; needs no ticket
  - id: RF-AC1                      # owns: written here in full, same fields as a feature criterion
    role: owns
    status: active
    outcome: Invites created before the change keep working until they expire.
    failures:
      - An old invite link uses the previous token format; it is accepted until its expiry date.
    check:
      kind: api
      scenario: invite-legacy-token-accepted
measures:
  improve:
    - { measure: invite_first_signin_within_24h_ratio, source: posthog, target: ">= 0.7" }
  guard:
    - { measure: signin_errors_ratio, source: grafana, target: "<= 0.01" }
effect_window_days: 14          # measures are judged after release over this window; they never reopen the epic
---

# Invitations by e-mail

What the epic delivers and for whom. Tickets name the criteria they work on with `Feature acceptance: IN-AC1, RF-AC1`; a bug
names one criterion with `Fixes: IN-AC1`.
