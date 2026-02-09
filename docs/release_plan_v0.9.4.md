# v0.9.4 Release Plan (Draft)

Scope: reinforce ACP slash command parity and make local repo artifacts less noisy, without changing external behavior.

## Goals
- Add a scenario-based smoke test that chains common slash commands in one session.
- Keep local artifacts (`.DS_Store`, `logs/`) out of the repo history and reduce accidental noise during development.

## Work Items
- Tests:
  - Add `test_slash_command_smoke_flow` to `src/thread.rs` to validate a basic `/init` -> prompt -> `/review` -> `/compact` flow.
- Repo hygiene:
  - Remove stray `.DS_Store` files inside the repo.
  - Ensure `logs/` stays ignored and contains only local/dev artifacts.

## Non-Goals
- No public API changes.
- No behavior changes to command semantics; only coverage and hygiene.

