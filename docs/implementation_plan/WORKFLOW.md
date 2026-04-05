# popo — Document-Based Collaboration Workflow

This is the **meta document** for this project. Every AI agent and human collaborator
working on *Berry's Evolution* must read and follow this workflow before generating,
modifying, or acting on any project document.

---

## The Pipeline

All work flows through five ordered phases. Each phase produces a document that
becomes the authoritative input for the next phase. Do not skip phases or work
out of order without explicit instruction from the human owner.

```
DESIGN.md
    │  high-level vision, mechanics, systems
    ▼
USER_STORIES.md
    │  what the player/user wants to do and why
    ▼
PRD.md
    │  what to build — scoped requirements and acceptance criteria
    ▼
TECH_SPEC.md
    │  how to build it — architecture, data models, contracts
    ▼
IMPL_PLAN.md
       ordered task breakdown ready for execution
```

---

## Phase Definitions

### 1. Design · `DESIGN.md`

**Purpose**: Capture the full product vision — game mechanics, systems, economy,
UI structure, and open questions. Written in natural language for human alignment.

**Owner**: Human (with AI assistance)
**Triggers next phase when**: The design is stable enough to derive player-facing
stories (major open questions resolved, core loops defined).

**Rules**:
- Single file at project root.
- All naming decisions (characters, game terms, platform) are canonical here.
- Other documents inherit naming from this file — never the reverse.

---

### 2. User Stories · `USER_STORIES.md`

**Purpose**: Translate the design into discrete player/user goals. Each story
captures *who* wants *what* and *why*, along with acceptance criteria.

**Owner**: AI-generated from DESIGN.md, human-reviewed
**Input**: DESIGN.md (current, fully read before generation)
**Triggers next phase when**: All stories are reviewed and acceptance criteria agreed.

**Format per story**:
```
### US-{n}: {Short Title}
**As a** {player / new player / returning player}
**I want** {capability or interaction}
**So that** {benefit or motivation}

**Acceptance Criteria**:
- [ ] {observable, testable condition}
- [ ] ...

**Linked Design Section**: §{n}
```

**Rules**:
- Group stories by feature area (Arena, Exploration, Collection, Economy, etc.).
- Each story must link to the DESIGN.md section it derives from.
- Do not add requirements not grounded in DESIGN.md — flag them as open questions.

---

### 3. Product Requirements · `PRD.md`

**Purpose**: Define the precise scope of what will be built. Converts user stories
into numbered requirements with priority, constraints, and success metrics.

**Owner**: AI-generated from USER_STORIES.md, human-reviewed
**Input**: USER_STORIES.md (fully read), DESIGN.md (for context)
**Triggers next phase when**: Scope is locked and priorities agreed (must-have vs. nice-to-have).

**Format**:
```
## Feature: {Name}
### REQ-{n}: {Title}
- **Priority**: Must-have | Should-have | Nice-to-have
- **Derived from**: US-{n}
- **Description**: {what the system must do}
- **Constraints**: {technical, design, or business constraints}
- **Success Metric**: {how we know this is done correctly}
- **Out of Scope**: {related things explicitly not included}
```

**Rules**:
- Every requirement must trace to at least one user story.
- Explicitly call out v1 vs. v2 scope boundaries (use DESIGN.md §10 as reference).
- Requirements must be implementation-agnostic — no tech decisions here.

---

### 4. Tech Spec · `TECH_SPEC.md`

**Purpose**: Define the technical architecture — stack, data models, component
boundaries, APIs, and key algorithms. This is the blueprint for implementation.

**Owner**: AI-generated from PRD.md, human-reviewed
**Input**: PRD.md (fully read), DESIGN.md (for domain model and formulas)
**Triggers next phase when**: Architecture decisions are approved and no blocking unknowns remain.

**Format**:
```
## Overview
## Tech Stack
## Data Models
## Component Architecture
## Key Algorithms / Formulas
## API / Interface Contracts (if applicable)
## State Management
## Open Technical Questions
```

**Rules**:
- Must cover every Must-have requirement from PRD.md.
- Reference DESIGN.md formulas (damage, catch rate, etc.) verbatim — do not reinterpret.
- Flag any PRD requirement that is technically ambiguous before proceeding.
- Keep the spec platform-consistent: current platform is **Web** (see DESIGN.md).

---

### 5. Implementation Plan · `IMPL_PLAN.md`

**Purpose**: Break the tech spec into an ordered, dependency-aware task list
ready for execution. This is the direct input for writing code.

**Owner**: AI-generated from TECH_SPEC.md, human-reviewed
**Input**: TECH_SPEC.md (fully read), PRD.md (for priority ordering)
**Triggers execution when**: Human approves the plan.

**Format per task**:
```
### TASK-{n}: {Title}
- **Phase**: v1 | v2
- **Depends on**: TASK-{n}, ...
- **Spec ref**: TECH_SPEC.md §{section}
- **Description**: {what to build}
- **Definition of Done**: {verifiable completion condition}
```

**Rules**:
- Tasks must be ordered so no task depends on an unbuilt predecessor.
- Each task should be completable in one focused session.
- Must-have PRD items must all appear before any Should-have items.
- Do not include implementation details that contradict TECH_SPEC.md.

---

## General Rules for All AI Agents

1. **Read before writing.** Always read the current state of the relevant upstream
   document(s) before generating a downstream document. Never rely on memory alone.

2. **Naming is canonical in DESIGN.md.** Game terms, character names, and
   feature names defined in DESIGN.md are authoritative. Use them exactly.

3. **One phase at a time.** Do not generate TECH_SPEC.md if PRD.md hasn't been
   reviewed and confirmed. Ask the human owner to confirm phase completion.

4. **Surface conflicts, don't resolve them silently.** If a downstream document
   contradicts an upstream one, flag it explicitly before proceeding.

5. **No scope creep.** Do not add features, requirements, or tasks not traceable
   to an upstream document. If you think something is missing, flag it as an
   open question rather than silently including it.

6. **Document location.** All pipeline documents live at the project root.
   Do not create subdirectories for these files unless explicitly instructed.

---

## Current State

| Phase | Document        | Status         |
|-------|-----------------|----------------|
| 1     | DESIGN.md       | ✅ In progress  |
| 2     | USER_STORIES.md | ✅ Complete     |
| 3     | PRD.md          | ✅ Complete     |
| 4     | TECH_SPEC.md    | ✅ Complete     |
| 5     | IMPL_PLAN.md    | ✅ Complete     |
