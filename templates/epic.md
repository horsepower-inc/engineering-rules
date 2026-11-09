---
# ADR 0010. One file per epic: docs/epics/<epic>.md. The front matter is the parsed part; the body is prose.
epic: CAN-172                   # the tracker's epic id
name: Invitations by e-mail
criteria:
  - { id: IN-AC1, role: adds }      # adds | changes | keeps | owns
  - { id: IN-AC2, role: adds }
  - { id: AU-AC3, role: keeps }     # another feature's criterion this epic must not break
measures:
  improve:
    - { measure: invite_first_signin_within_24h_ratio, source: posthog, target: ">= 0.7" }
  guard:
    - { measure: signin_errors_ratio, source: grafana, target: "<= 0.01" }
effect_window_days: 14
---

# Invitations by e-mail

What the epic delivers and for whom. Tickets name the criteria they work on with `Feature acceptance: IN-AC1, IN-AC2`; a bug
names one criterion with `Fixes: IN-AC1`.
