# Launcher Graphics Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement task-by-task.

**Goal:** Per-game launcher backend selection using the existing executable field.
**Architecture:** Core supplies context and dynamic choices; a separate injected dylib routes only the matching process.
**Tech Stack:** C, shell, existing generated JavaScript UI, macOS universal dylib.
**Spec:** docs/superpowers/specs/2026-11-24-launcher-graphics-design.md

## Global Constraints

Automatic is a no-op. No configured executable means disabled. No global plugin setting. Preserve existing launch wrappers. Use plugin-pt3 injection for Rosetta and FEX. No live installation.

## Review Focus

Executable paths with spaces/quotes; removed executable with saved backend; switching Rosetta/FEX; unrelated child processes; startup graphics imports.

### Task 1: Core context and choices
- [x] Add failing panel, shell-wrapper and descriptor tests for context readiness, dynamic choices, per-game visibility and escaped paths.
- [x] Add context/type schema support in conf.c and compat_run.sh, UI metadata/readiness, wrapper context export with legacy parsing, and Wine environment forwarding.
- [x] Run confcheck, featcheck, panel-behavior, featstagecheck and relevant shell checks.

### Task 2: Sibling plugin repository
- [x] Add policy tests for exact executable identity, no-op settings, supported backend paths and child isolation.
- [x] Implement universal routing dylib, descriptor, build/install scripts and documentation. Keep architecture-specific injection behavior explicit.
- [x] Run unit tests, universal build and isolated Rosetta/FEX launcher-child probes including startup imports.

### Task 3: Review and finish
- [x] Review changes against specification, address findings, verify both repository states and report branch, paths and limitations.

Ruling: Work in the existing clean checkout on a new branch; no additional worktree requested. Execute inline and keep installation explicit.

Validation: core confcheck/conf-fixtures/featcheck/featstagecheck and all panel-behavior scripts passed; universal core dylib built. Plugin policy tests and universal build passed; four startup-import integration cases each on Rosetta 26.3 and FEX Preview 27 passed. Shell syntax checked; shellcheck is unavailable, so lint targets reported a skip.

Review: addressed raw typed-value forwarding by limiting it to allowlisted graphics-backend values; hid the provider from global settings independently of context; disabled batch targets. Added legacy migration and removed-executable regressions. DXVK/D3DMetal rendering, 32-bit guests and real launcher compatibility remain untested.
