---
# ADR 0010. One file per feature: docs/acceptance/<feature>.md. The front matter is the parsed part; the body is prose.
feature: IN                     # key, 2-4 capital letters, unique in the repo; prefixes every criterion id
name: Invitations               # the feature's name in the product
criteria:
  - id: IN-AC1                  # <KEY>-AC<n>, never reused
    status: active              # active | retired
    outcome: >-
      An admin invites a coach by e-mail address; the coach gets the invite mail within one minute and can sign in
      with a passkey from it.
    failures:
      - The invite link is expired or already used; the page says so and offers to request a new invite.
      - The mail cannot be delivered; the admin sees the invite as failed with the reason.
    check:
      kind: e2e                 # e2e | api | metric | manual
      spec: e2e/AU-invite.spec.ts
      test: invites a coach who signs in with a passkey
  - id: IN-AC2
    status: active
    outcome: An invite expires after 7 days and cannot be used afterwards.
    failures:
      - The clock passes the expiry while the coach is on the page; submitting fails with the expiry message.
    check:
      kind: api
      scenario: invite-expires-after-7-days
  - id: IN-AC3
    status: active
    outcome: Most invited coaches sign in within a day of the invite.
    failures:
      - Invite mails land in spam; the share drops and the monitor shows it.
    check:
      kind: metric
      measure: invite_first_signin_within_24h_ratio
      source: posthog           # a tool named in the app's stack ADR
      threshold: ">= 0.7"
  - id: IN-AC4
    status: active
    outcome: The invite mail matches its design in both languages.
    failures:
      - A mail client without web fonts shows the fallback stack, still readable.
    check:
      kind: manual
      owner: design session
      looks_at: the mail in the two main clients, DE and EN
monitor:
  - measure: invite_first_signin_within_24h_ratio
    what: Share of invites whose coach signs in within 24 hours
    source: posthog
    target: ">= 0.7"
    display: { chart: line, window_days: 30 }
  - measure: invite_mail_failures_total
    what: Invite mails that could not be delivered
    source: grafana
    target: "0 per day"
    display: { chart: bar, window_days: 14 }
---

# Invitations

Who uses the feature and what it covers, in a few sentences. No history; describe how it is (ADR 0006 rule 6).
