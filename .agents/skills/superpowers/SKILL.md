---
name: superpowers
description: Rigorous software development lifecycle framework by Jesse Vincent (obra/superpowers). Enforces systematic engineering, TDD, structured plan execution, root-cause debugging, and clean review workflows.
---

# Superpowers Engineering Framework

Structured methodology for reliable software engineering. Prevents unstructured vibe-coding.

## Core Lifecycle Disciplines

### 1. Brainstorming & Requirements (`brainstorming`)
- Explore design options before writing code.
- Clarify ambiguous requirements through targeted questions.
- Establish architectural decisions upfront.

### 2. Planning (`writing-plans`)
- Break approved designs into bite-sized tasks.
- Specify exact file paths, interfaces, and expected verification criteria.

### 3. Execution (`executing-plans` / `subagent-development`)
- Execute step-by-step against the plan.
- Use subagents or isolated contexts for self-contained milestones.

### 4. Test-Driven Development (`test-driven-development`)
- Enforce Red-Green-Refactor loop:
  1. Write failing test first.
  2. Implement minimal code to pass test.
  3. Refactor with tests green.

### 5. Systematic Debugging (`systematic-debugging`)
- No random trial-and-error guessing.
- 4-step debugging protocol:
  1. Reproduce with minimal test case.
  2. Identify root cause with evidence.
  3. Formulate and apply minimal fix.
  4. Verify fix and ensure no regressions.

### 6. Review & Verification (`requesting-code-review`)
- Inspect diffs against requirements.
- Verify test coverage, performance constraints, and clean git history before merge.

