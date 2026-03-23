# Release Notes - v0.9.23

## Summary

- Added a new `Progress signals` panel to `/monitor` output for live bottleneck, repetition, and stall visibility.
- Wired active open-tool runtime tracking into monitoring so long-running tool calls can be attributed to a specific submission.
- Added regression coverage for repetition/stall heuristics and the new bottleneck snapshot rendering.

## Details

- `src/thread.rs` now includes:
  - monitor thresholds for slow bottlenecks, repetitive loops, and no-progress stalls
  - `FlowVectorState` progress-tracking fields (`last_plan_update_at`, `last_progress_at`, stalled update streak)
  - dynamic signal renderers:
    - `render_repeat_signal`
    - `render_stall_signal`
    - `render_progress_signals_snapshot`
  - longest-running open-tool-call lookup across active submissions
- `/monitor` output now renders the new `Progress signals` section before recent actions.
- Added/updated tests:
  - `thread::tests::test_monitor_command`
  - `thread::tests::test_flow_vector_repeat_and_stall_signals_show_stagnation`
  - `thread::tests::test_progress_signals_snapshot_reports_long_running_open_tool_call`

## Verification

- `cargo test -- --nocapture`
- `node npm/testing/test-platform-detection.js`

## Release

- Tag: `v0.9.23`
- GitHub Release: `https://github.com/theprometheusxyz/xsfire-camp/releases/tag/v0.9.23`
