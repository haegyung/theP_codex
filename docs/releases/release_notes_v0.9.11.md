# Release Notes — v0.9.11

## Release Summary
- Reworked monitoring UX with a dual-lane monitor layout, adaptive progress striping, and richer flow telemetry.
- Added stricter ACP smoke coverage with a deterministic script and updated verification guidance.
- Improved setup verification visibility by showing explicit verification progress in both setup guidance and plan tasks.
- Reorganized documentation into purpose-based categories and added ACP standard mapping docs.

## What’s Changed

### Features
- `src/thread.rs`
  - Added setup verification progress helpers (`TOTAL_VERIFICATION_STEPS`, completed count, percent).
  - Updated setup wizard text to show `Verification progress: x/3, y%`.
  - Updated setup plan task text to show `Verify: run /status, /monitor, and /vector (x/3, y%)`.
  - Expanded monitor rendering into a dual-lane structure with clearer flow/context telemetry output.

### QA / Verification
- `scripts/acp_compat_smoke.sh`
  - Added a strict ACP smoke mode with fixed critical tests.
- `docs/quality/verification_guidance.md`
  - Added and aligned ACP smoke and manual verification guidance.
- `.github/workflows/release.yml`
  - Included release workflow refinement used in this cycle.

### Documentation
- `docs/README.md`
  - Added category index and normalized document navigation.
- `docs/reference/acp_standard_spec.md`
  - Added ACP standard-to-implementation mapping reference.
- `docs/backend/backend_development_guide.md`
  - Added backend development and validation guidance.
- `docs/`
  - Reorganized docs into `backend/`, `plans/`, `quality/`, `reference/`, `releases/`, `zed/`.

### Packaging / Versioning
- `Cargo.toml` / `Cargo.lock`
  - Version bumped to `0.9.11`.

## Tests
- `cargo test`
  - `36 passed`.
- `node npm/testing/test-platform-detection.js`
  - All platform detection checks passed.

## Versioning / Packaging
- Tag: `v0.9.11`
- GitHub Release: `https://github.com/haegyung/xsfire-camp/releases/tag/v0.9.11`

## Traceability
- `a61c775` — `feat: improve monitor UI with dual lanes and adaptive progress`
- `6329a09` — `chore: reorganize docs and scripts`
- `3ee27dd` — `fix: stabilize realtime plan updates and add ACP smoke script`
- `8825dc4` — `chore: add strict ACP smoke mode with fixed critical tests`
- `b5979e0` — `docs: document strict ACP smoke workflow`
- `2f6355b` — `feat: improve setup progress visibility and update docs`
