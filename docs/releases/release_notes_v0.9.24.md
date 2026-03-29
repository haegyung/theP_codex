# Release Notes - v0.9.24

## Summary

- Completed ACP standard terminal lifecycle support with client-driven `terminal/*` orchestration for `codex` exec.
- Added ACP unstable `session/fork` and `session/resume` support for `codex`, with wrapped support in `multi` for codex-backed sessions only.
- Hardened release reproducibility by vendoring the `codex-rs` workspace and removing the repo-local `.codex_tmp` patch dependency from release builds.

## Details

- `src/lib.rs`, `src/codex_agent.rs`, and `src/thread.rs` now drive terminal execution through ACP client RPCs:
  - `terminal/create`
  - `terminal/output`
  - `terminal/kill`
  - `terminal/wait_for_exit`
  - `terminal/release`
- Legacy embedded terminal updates remain supported through `_meta.terminal_output`, but plain-text fallback is now limited to cases where no real `terminal_id` is available.
- `src/acp_agent.rs`, `src/backend.rs`, `src/codex_agent.rs`, and `src/multi_backend.rs` now advertise and implement unstable `session/fork` and `session/resume`.
- `src/claude_code_agent.rs` and `src/gemini_agent.rs` keep the ACP contract aligned for cancel/auth/config smoke coverage added during this cycle.
- `scripts/acp_compat_smoke.sh`, `docs/reference/acp_standard_spec.md`, `docs/reference/event_handling.md`, and `docs/quality/qa_checklist.md` were updated to match the shipped ACP behavior.
- `Cargo.toml` now patches `https://github.com/zed-industries/codex` crates to committed `vendor/codex-rs/*` paths so release builds do not depend on a local `.codex_tmp` checkout.

## Verification

- `cargo test --quiet`
- `cargo build --release`
- `scripts/acp_compat_smoke.sh --strict`
- `node npm/testing/test-platform-detection.js`
- `git diff --check`

## Release

- Tag: `v0.9.24`
- GitHub Release: `https://github.com/theprometheusxyz/xsfire-camp/releases/tag/v0.9.24`

## Release Verification Snapshot

- Pre-release gates passed: `cargo test --quiet`, `cargo build --release`, `scripts/acp_compat_smoke.sh --strict`, `node npm/testing/test-platform-detection.js`, and `git diff --check`.
- Tag push publishes `v0.9.24`; GitHub release/workflow visibility is verified against that tag after publication.
