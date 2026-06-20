# Orchestration Plan

## Mode Selection

- Repo: `/Users/stephenbrown/Code/OPENSOURCE/openboard`
- Branch: `dev`
- Work mode: `full`
- Run folder: `/Users/stephenbrown/Code/OPENSOURCE/openboard/agent-runs/2026-06-20-codebase-pass`
- Verifiable gates: `git status --short --branch`, `git ls-remote --exit-code origin HEAD`, `git push --dry-run origin dev`, `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`, `npm run validate`, targeted Vitest checks where files change.
- Human-decision blockers: broad product direction, Firestore/security rule migrations, destructive data operations, unresolved branch divergence, missing credentials for runtime Firebase/OpenAI verification, or unrelated local user changes.
- Resume policy: resume from `run-state.md`, `task-queue.md`, Git status, and any local commits ahead of `origin/dev`; push validated in-scope phase commits before new edits.

## Loop Plan

| Phase | Loop | Verify Gate | Stop Condition |
| --- | --- | --- | --- |
| Preflight and Repo Docs | Orchestration Planning Loop, Docs Sweep Loop | Docs match current repo and checks pass | Plan, state, queue, docs, and report pushed |
| Baseline Validation | Baseline Validation Loop, Quality Gate Selection Loop | Lint, typecheck, tests, build, and dependency diagnostics are recorded | Baseline is clean or every failure is classified |
| Findings Backlog | Findings Queue Loop, Architecture Fitness Loop, Lean Code Loop | Evidence-backed backlog and scorecard | Backlog, scorecard, and queue are pushed |
| Execute Fixes and Improvements | Task Queue Loop, Fix Validation Loop, Architecture Fitness Loop, Lean Code Loop | Highest-priority confirmed issue is fixed with targeted checks | Focused fix batch is verified and pushed, or blocker recorded |
| Package and Dead-Code Cleanup | Package Cleanup Loop, Dead Code Loop | Safe dependency/dead-code changes are verified | Cleanup batch is pushed or deferred with evidence |
| Review | Judge Loop | Diff, reports, scorecard, and branch state pass reviewer gate | Review report is pushed with no unresolved P0/P1 findings |
| Stabilization Loop | Stabilization Loop, Judge Loop, Reflect-or-Kill Loop if needed | Required gates pass and no actionable P0/P1 issues remain | Stabilization criteria pass or real blocker is recorded |
| Integrator | Final Completion Gate | Remote read/dry-run push, clean tree, branch sync, and final checks are recorded | Final report is pushed and local `dev` matches `origin/dev` |

## File Ownership

| Task | Owned Files | Notes |
| --- | --- | --- |
| T-001 | 00-orchestration-plan.md, run-state.md, task-queue.md | Startup planning and resume state |
| T-002 | AGENTS.md, spec.md, 01-preflight-and-repo-docs.md | Evidence-backed docs sweep for current validation state |
| T-003 | 02-baseline-validation.md, task-queue.md, run-state.md | Baseline validation command matrix |
| T-004 | 03-findings-backlog.md, task-queue.md, run-state.md | Evidence-backed backlog and architecture scorecard |
| T-005 | Source files named by highest-priority finding, tests, 04-execute-fixes-and-improvements.md | Focused bug/reliability/lean-code batch only after findings |
| T-006 | package.json, package-lock.json, confirmed dead files, 05-package-and-dead-code-cleanup.md | Safe package/dead-code cleanup if evidence supports it |
| T-007 | 06-review.md, 07-stabilization-loop.md, 08-integrator.md, final-report.md | Review, stabilization, and final handoff |
