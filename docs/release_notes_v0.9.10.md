# Release Notes Template — v0.9.10

## Release Summary
- Added a new `monitor` retrospective reporting mode that outputs a structured, lane-based status format with progress ticks, risks/blockers, and next actions.
- Synced release manifests and package versions to `0.9.10` across core Rust and npm metadata.

## What’s Changed

### Features
- `src/thread.rs`
  - Added `MonitorMode::Retrospective` and argument parsing for `/monitor retro`.
  - Implemented `render_monitor_retrospective` to render a fixed multi-item format matching the requested layout.
  - Added command hints in setup messaging for `/monitor retro` and in validation docs references.
  - Added unit coverage for `/monitor retro` output behavior.

### Packaging / Versioning
- `Cargo.toml`
  - `version` bumped to `0.9.10`.
- `Cargo.lock`
  - root crate version updated to `0.9.10`.
- `npm/package.json`
  - Base package version bumped to `0.9.10`.
  - Optional dependency pins bumped to `0.9.10`.
- `extension.toml`
  - Manifest version and release archive URLs updated to `0.9.10`.
- `extensions/xsfire-camp/manifest.toml`
  - Manifest version and release archive URLs updated to `0.9.10`.

## Tests
- `cargo test`
  - Expected to pass all tests (re-run now before tagging).
- `scripts/tag_release.sh`
  - Verifies version/tag consistency and creates/pushes annotated release tag.

## Versioning / Packaging
- Tag planned: `v0.9.10`
- Commit history since `v0.9.9`: `6012948`, `83edaf0`.

## Traceability
- `feat: add monitor retrospective reporting mode` — `83edaf0`
- `chore: sync 0.9.9 manifests and checksums` — `6012948`
