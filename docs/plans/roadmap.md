# Roadmap (2026-02 Refresh)

This roadmap is execution-oriented: each milestone has explicit `Must` and `Should` checks,
evidence paths, and verification commands.

## Goal
- Keep ACP work context continuous across clients and backend choices while preserving backend-native execution behavior (tool calls, approvals, file edits) instead of degrading to chat-only behavior.

## Baseline (Already Shipped)
- ACP stdio agent wrapper around Codex CLI.
  - Evidence: `README.md`, `src/main.rs`, `src/acp_agent.rs`
- Multi-backend routing with in-thread backend switching.
  - Evidence: `src/multi_backend.rs`, `src/backend.rs`, `README.md` (`--backend=multi`, `/backend ...`)
- Canonical session logging under `ACP_HOME` with redaction coverage.
  - Evidence: `src/session_store.rs`, `docs/backend/session_store.md`, `src/session_store.rs` tests
- Slash command parity and monitoring command coverage in tests.
  - Evidence: `src/thread.rs` tests (`test_slash_command_smoke_flow`, `test_monitor_command`, etc.)

## Roadmap Principles
- ACP surface stability first: avoid breaking client-visible protocol behavior.
- Driver isolation: backend specifics should live behind driver boundaries.
- Evidence-backed completion: each `Must` item closes only with concrete file/command evidence.
- Safety over convenience: approvals/redaction/policy consistency is a release gate.

## Milestone 1: Driver Boundary Hardening (Near Term)
### Outcome
- Internal backend driver boundary is explicit and testable without ACP API changes.

### Must
1. Driver capability contract is clearly separated from ACP orchestration logic.
2. Event translation path (`prompt -> tool/plan/approval`) is deterministic across drivers.
3. Existing Codex behavior remains backward-compatible at slash-command level.

### Should
1. `docs/backend/backend_development_guide.md` includes driver implementation checklist.
2. Add one focused regression test for correlation continuity across event categories.

### Verification
- `cargo test`
- `cargo test thread::tests::test_slash_command_smoke_flow`
- `cargo test session_store::tests::writes_canonical_log_and_redacts_secrets`

## Milestone 2: Non-Codex Backend Fidelity (Near-Mid Term)
### Outcome
- Claude Code and Gemini backends preserve meaningful streamed execution signals instead of reduced text-only responses.

### Must
1. Tool/approval/terminal progress from non-Codex backends maps into ACP event categories with minimal semantic loss.
2. `/backend <name>` switching is stable in `--backend=multi` flow and does not corrupt session continuity.
3. Auth routing remains method-id based and documented for each backend path.

### Should
1. Backend-specific feature matrix documented in `docs/backend/backends.md`.
2. Add compatibility notes for known CLI limitations and fallbacks.

### Verification
- `cargo test`
- `cargo test thread::tests::test_mcp`
- `cargo test thread::tests::test_monitor_command`
- Targeted manual smoke using `scripts/acp_compat_smoke.sh` (when client environment is available)

## Milestone 3: Session Continuity and Canonical Log Quality (Mid Term)
### Outcome
- Session replay/trace quality is reliable for cross-client and cross-backend workflows.

### Must
1. Canonical log schema versioning and required fields are explicitly defined and enforced.
2. Correlation IDs remain intact across prompt/tool/approval/file-change timeline.
3. Redaction policy covers known sensitive patterns with tests.

### Should
1. Add a lightweight log-inspection utility doc/workflow.
2. Publish troubleshooting guide for missing/partial timeline events.

### Verification
- `cargo test`
- `cargo test session_store::tests::writes_canonical_log_and_redacts_secrets`
- `cargo test thread::tests::test_canonical_log_correlation_path`

## Milestone 4: Client Readiness and Release Operations (Mid-Late Term)
### Outcome
- Installation, upgrade, and release flows are predictable for Zed/VS Code users and maintainers.

### Must
1. Quick-start paths for binary/npm usage are kept consistent between KR/EN README sections.
2. Release process remains reproducible via scripts and documented checks.
3. Platform package detection path stays green.

### Should
1. Add a concise VS Code ACP compatibility matrix.
2. Add a "first 10 minutes" onboarding snippet for new contributors.

### Verification
- `cargo build --release`
- `cargo test`
- `node npm/testing/test-platform-detection.js`
- `scripts/build_and_install.sh`

## Quality Gate for Roadmap Work Items
- A milestone item is closed only when all associated `Must` checks pass.
- If a `Must` item fails, open a follow-up task immediately with:
  - failure evidence (file path or command output),
  - owner,
  - next verification command.

## Non-Goals (Current Horizon)
- Forcing vendor-native session stores into one physical format.
- Sacrificing backend-native execution semantics for simplified chat-only interoperability.
