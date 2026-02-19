# Release Notes — v0.9.12

## Release Summary
- Finalized package manifest alignment for `0.9.12` across Rust and npm release metadata.
- Refactored `thread` flow code for readability and maintainability without behavioral changes.

## What’s Changed

### Refactor
- `src/thread.rs`
  - Reorganized thread flow code paths to improve readability.
  - Kept runtime behavior equivalent to the previous implementation.

### Packaging / Versioning
- `Cargo.toml` / `Cargo.lock`
  - Version bumped to `0.9.12`.
- `npm/package.json`
  - Package version and platform `optionalDependencies` versions aligned to `0.9.12`.

### Documentation
- `docs/README.md`
  - Added `v0.9.12` release notes link.

## Tests
- `cargo test`
- `node npm/testing/test-platform-detection.js`

## Versioning / Packaging
- Tag: `v0.9.12`
- GitHub Release: `https://github.com/haegyung/xsfire-camp/releases/tag/v0.9.12`

## Traceability
- `47b64c2` — `refactor: align v0.9.11 metadata and tidy thread code`
