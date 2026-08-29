# CLAUDE.md --- Tinder for Books

## Purpose

This file defines how Claude should work on Tinder for Books. Current
project state belongs in `PROJECT_CONTEXT.md`.

## 1. Core Working Principle

Before meaningful changes, understand the current codebase, project
context, product goal, dependencies, security implications, UX, and
possible regressions.

-   **Do not guess. Inspect first.**
-   **Plan before architectural changes.**
-   **Security before convenience** for user data, authentication,
    Supabase, APIs, or secrets.
-   **Test before declaring success.**
-   Preserve working functionality.
-   Avoid unrelated refactors.
-   Prefer simple, maintainable architecture.

## 2. Agent Model

### Planner Agent

The Planner must: - read `CLAUDE.md` and `PROJECT_CONTEXT.md` - inspect
all relevant files - understand existing architecture - identify
affected components, services, routes, data models, and dependencies -
identify risks, regressions, security implications, and migration
concerns - consider the future Flutter/mobile direction - produce a
concise implementation plan - list files expected to change

The Planner must not modify code. For significant or architectural
changes, plan before implementation.

### Implementation Agent

The Implementation Agent must: - execute the approved plan - modify only
necessary files - preserve existing functionality - follow project
conventions - avoid unrelated refactoring and unnecessary dependencies -
preserve user work and uncommitted changes

If a major architectural problem appears, stop and return to planning
instead of improvising.

### Security Agent

Mandatory for Supabase, authentication, accounts, database queries, RLS,
user data, environment variables, external APIs, or secrets.

Check: - authentication and authorization - user ownership - Row Level
Security - exposed credentials - unsafe queries - insecure defaults -
data leakage

Private user-owned Supabase tables should scope SELECT, INSERT, UPDATE,
and DELETE to the authenticated user. Do not use unrestricted
`USING (true)` or `WITH CHECK (true)` for private production data
without explicit justification.

Never expose service-role keys, passwords, secrets, or private API
credentials. Secrets belong in environment variables and `.env` must not
be committed.

### Test Agent

The Test Agent should verify: - app builds and starts - affected routes
and interactions work - nearby functionality still works - mobile
layout - relevant desktop layout - EN/DE switching where relevant -
persistence and actual database behavior where relevant -
console/runtime errors - regressions

Do not declare a feature complete merely because the code compiles.

## 3. Required Development Loop

`CONTEXT → PLAN → IMPLEMENT → SECURITY REVIEW → TEST → SUMMARY`

### Context

1.  Read `CLAUDE.md`.
2.  Read `PROJECT_CONTEXT.md`.
3.  Inspect current relevant files.
4.  Verify current implementation rather than relying on old
    assumptions.

### Plan

Explain what changes, why, affected files, risks, dependencies, and
security implications.

### Implement

Perform the approved coherent change.

### Security Review

Mandatory whenever accounts, backend, Supabase, APIs, security, or user
data are involved.

### Test

Test changed behavior and related functionality.

### Summary

Report files changed, behavior changed, tests performed, security
findings if relevant, remaining issues, and recommended next step.

## 4. Persistent Project Context

`PROJECT_CONTEXT.md` is the source of truth for the current project
state. Read it before significant work.

After a significant completed work package, update it when architecture,
features, database structure, product behavior, technical decisions,
known issues, migration strategy, current work package, or next work
package changes.

Keep it concise and current. It is not a development diary.

## 5. Change Discipline

Before editing: - identify exact relevant files - understand consumers
and dependencies - understand existing behavior - avoid guessing

During implementation: - change one coherent feature at a time - avoid
unrelated cleanup - preserve functionality - do not silently change
architecture - do not install libraries without clear benefit - never
discard user changes

For visual redesign, preserve backend/service logic unless a change is
necessary and planned.

After implementation: - test - inspect the diff - update project context
when necessary

## 6. Git Workflow

Before large changes, run `git status` and understand uncommitted work.

After a completed and tested work package: - review status and diff -
commit descriptively - push when requested

Examples: - `feat: add user authentication` -
`feat: migrate wishlist to Supabase` -
`fix: prevent duplicate wishlist entries` -
`style: redesign swipe cards` - `chore: update project configuration`

Never silently reset, restore, delete, or overwrite uncommitted user
work.

## 7. Definition of Done

A task is complete only when: - requested behavior works - relevant
existing behavior still works - no known new runtime/console errors
exist - mobile UX was checked for UI changes - relevant desktop behavior
was checked - security was reviewed when relevant - localization was
checked where visible copy changed - persistence was verified where
relevant - project conventions were followed - `PROJECT_CONTEXT.md` was
updated if long-term state changed

## 8. Final Rules

**When uncertain: inspect first.**

**When architecture changes: plan first.**

**When user data is involved: security first.**

**When implementation is finished: test before declaring success.**
