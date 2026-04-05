# Berry's Evolution — Implementation Plan

Derived from: `TECH_SPEC.md` (current), `PRD.md` (current)
Status: Awaiting human review

> Tasks are ordered by dependency. Each task should be completable in one focused
> session. All tasks are v1 unless marked otherwise. Open technical questions from
> TECH_SPEC.md §9 must be resolved before tasks that depend on them (noted inline).

---

## Milestone 0 — Project Scaffold

### TASK-01: Initialize project
- **Depends on**: nothing
- **Spec ref**: TECH_SPEC.md §2
- **Description**: Create Vite + React + TypeScript project. Configure CSS Modules. Install Zustand and Vitest. Set up `src/` directory structure matching TECH_SPEC.md §4.
- **Definition of Done**: `npm run dev` serves a blank page. `npm run test` runs with zero tests passing/failing. Directory structure matches spec.

---

## Milestone 1 — Static Game Data

### TASK-02: Define all enums and interfaces
- **Depends on**: TASK-01
- **Spec ref**: TECH_SPEC.md §3.1
- **Description**: Implement `src/data/types.ts` with all enums (`ElementType`, `MoveCategory`, `StatusEffect`, `ArenaTier`, `EvolutionStone`, `BerryvolutionId`) and all interfaces (`MoveDefinition`, `BerryvolutionDef`, `BerryDef`, `PartyMember`, `CombatantState`, `BattleState`, `SaveState`, `ZoneDef`).
- **Definition of Done**: File compiles with no errors. All types referenced in TECH_SPEC.md §3 are present.

### TASK-03: Implement type effectiveness chart
- **Depends on**: TASK-02
- **Spec ref**: TECH_SPEC.md §5.2, DESIGN.md §3.1–3.2
- **Description**: Implement `src/data/typeChart.ts` with the `SUPER_EFFECTIVE` and `NOT_EFFECTIVE` tables and a `multiplier(attackType, defenderType)` function returning `1.5 | 1.0 | 0.67`.
- **Definition of Done**: Unit tests cover all 7×7 type combinations and return correct multipliers.

### TASK-04: Define all move data
- **Depends on**: TASK-02
- **Spec ref**: TECH_SPEC.md §3.2, §9.2, DESIGN.md §5.1
- **Description**: Implement `src/data/moves.ts` with all 32 `MoveDefinition` records per TECH_SPEC.md §9.2, plus the shared `BASIC_ATTACK` constant.
- **Definition of Done**: Every move has all 7 fields populated. TypeScript type-checks cleanly.

### TASK-05: Define all Berryvolution and Berry static data
- **Depends on**: TASK-04
- **Spec ref**: TECH_SPEC.md §3.2–3.3, §9.1, DESIGN.md §2.1
- **Description**: Implement `src/data/config.ts` (all tunable constants per TECH_SPEC.md §9), `src/data/berryvolutions.ts` (all 8 `BerryvolutionDef` records using stats from config), and `src/data/berry.ts` (`BerryDef`). Wire each form to its moves, trait, stone, and sprite path.
- **Definition of Done**: All 8 forms defined. Stats and growth read from `config.ts`. TypeScript type-checks cleanly.

### TASK-06: Define all Zone data
- **Depends on**: TASK-02
- **Spec ref**: TECH_SPEC.md §3.7–3.8, DESIGN.md §8.1
- **Description**: Implement `src/data/zones.ts` with all 5 `ZoneDef` records including encounter rates, wild Berry level ranges (per TECH_SPEC.md §3.8), and Stone drop rates.
- **Definition of Done**: All 5 zones defined with correct rates matching DESIGN.md §8.1.

---

## Milestone 2 — Core Engine

### TASK-07: Leveling and XP engine
- **Depends on**: TASK-05
- **Spec ref**: TECH_SPEC.md §5.4, DESIGN.md §4.3
- **Description**: Implement `src/engine/leveling.ts`. Functions: `xpToNextLevel(level)`, `applyXp(member, xp) → { member, leveledUp, newMoves }`, `computeStats(def, level)` (base + growth × level), `getUnlockedMoves(def, level)`.
- **Definition of Done**: Unit tests confirm correct XP thresholds, stat growth, and move unlock at levels 1/8/15/22 for at least 2 Berryvolutions.

### TASK-08: Evolution engine
- **Depends on**: TASK-05, TASK-07
- **Spec ref**: TECH_SPEC.md §4, DESIGN.md §2.2
- **Description**: Implement `src/engine/evolution.ts`. Functions: `canEvolve(member, stone, inventory)` (level ≥ 10, stone present, no duplicate form owned), `applyEvolution(member, stone, party) → PartyMember` (replaces Berry instance with Berryvolution at level 1, deducts stone).
- **Definition of Done**: Unit tests verify gate conditions (below level 10 blocked, wrong stone blocked, duplicate blocked) and that stats reset to level-1 Berryvolution values post-evolution.

### TASK-09: Zone exploration and capture engine
- **Depends on**: TASK-06
- **Spec ref**: TECH_SPEC.md §5.5–5.6, DESIGN.md §8.1–8.2
- **Description**: Implement `src/engine/exploration.ts` (`searchZone(zone) → SearchResult`, `spawnWildBerry(zone) → PartyMember`) and `src/engine/capture.ts` (`catchChance(currentHp, maxHp)`, `attemptCapture(wildBerry) → boolean`).
- **Definition of Done**: Unit tests confirm catch rate formula matches DESIGN.md §8.2 at 0%, 50%, 100% HP depletion. Search roll distribution tested over 10,000 samples.

### TASK-10: Damage calculation and traits
- **Depends on**: TASK-03, TASK-05
- **Spec ref**: TECH_SPEC.md §5.1, DESIGN.md §5.2, §3.3
- **Description**: Implement `calcDamage()` in `src/engine/battle.ts` with Physical and Special formulas, type multiplier, variance, minimum-1 floor, and all trait interactions (Volatile, Dark Shroud, Frost Armor).
- **Definition of Done**: Unit tests (with fixed random seed) verify Physical and Special damage for all 8 Berryvolutions against a representative set of defenders, including each trait interaction.

### TASK-11: Status effect engine
- **Depends on**: TASK-10
- **Spec ref**: TECH_SPEC.md §5.3, DESIGN.md §5.3
- **Description**: Implement status application (`applyStatus`), end-of-turn tick (`tickStatus`), and stat modifier application for all 7 status effects. Status replaces existing status. Duration countdown per spec.
- **Definition of Done**: Unit tests verify each status applies correct stat modifier, ticks correctly, and expires at the right turn. Freeze thaw probability tested statistically.

### TASK-12: Turn resolution engine
- **Depends on**: TASK-10, TASK-11
- **Spec ref**: TECH_SPEC.md §5.3, DESIGN.md §6.2
- **Description**: Implement `resolveTurn(battleState, playerAction, aiAction) → BattleState` in `src/engine/battle.ts`. Full resolution order: switches → speed-sorted moves → end-of-turn effects → faint checks → Fairy Charm trigger → win/loss/draw check.
- **Definition of Done**: Unit tests cover: switch-before-move ordering, Speed tie with Volteon (Swift always wins), Freeze skip, Confuse self-hit, simultaneous faint → draw, Fairy Charm heal on Luxeon faint.

### TASK-13: AI engine
- **Depends on**: TASK-12
- **Spec ref**: TECH_SPEC.md §5.7, DESIGN.md §6.4
- **Description**: Implement `src/engine/ai.ts` with `chooseAction(battleState, difficulty) → Action` for all three tiers (Rookie, Trainer, Champion).
- **Definition of Done**: Unit tests verify Rookie never switches, Trainer switches on type disadvantage, Champion uses Basic Attack when NRG < 20%.

---

## Milestone 3 — State Store

### TASK-14: Implement save/load and export/import
- **Depends on**: TASK-02
- **Spec ref**: TECH_SPEC.md §7, §9.3, §10
- **Description**: Implement `src/engine/save.ts` with `save(state)`, `load() → SaveState | null`, `newGame() → SaveState` (seeds player with starting resources from `config.ts`), `exportSave(state)` (JSON file download), and `importSave(file) → Promise<SaveState>`.
- **Definition of Done**: Save round-trips correctly. `newGame()` seeds correct starting resources. Export downloads a valid JSON file. Import loads it back cleanly. Missing save returns null.

### TASK-15: Implement Zustand game store
- **Depends on**: TASK-14, TASK-12, TASK-13, TASK-08, TASK-09, TASK-07
- **Spec ref**: TECH_SPEC.md §4 (store), §6
- **Description**: Implement `src/store/gameStore.ts`. Store holds `SaveState`, `Screen`, and optional `BattleState`. Actions: `startBattle`, `submitPlayerAction`, `evolve`, `searchZone`, `attemptCapture`, `buyItem`, `navigateTo`. Each mutating action calls the relevant engine function and saves.
- **Definition of Done**: All engine functions are called through the store. Direct state mutation never happens in components. Save is called after every mutating action.

---

## Milestone 4 — Screens & UI

> For all screens: correctness over polish. CSS Modules for layout; pixel art sprites
> via `<Sprite>` component. No animations beyond basic CSS transitions in v1.

### TASK-16: Shared UI components
- **Depends on**: TASK-02
- **Spec ref**: TECH_SPEC.md §4 (components/)
- **Description**: Build `StatBar`, `TypeBadge`, `MoveCard`, `Sprite`, and `ConfirmDialog` components. `ConfirmDialog` blocks action until confirmed or cancelled.
- **Definition of Done**: Each component renders correctly with representative props. `ConfirmDialog` cannot be bypassed without user interaction.

### TASK-17: Main Menu screen
- **Depends on**: TASK-15, TASK-16
- **Spec ref**: DESIGN.md §11
- **Description**: Render navigation links to Arena, Explore, Party, Berry Log, Shop, Settings. Show current Arena tier and Berry Log progress (X/8). On first launch (no save), trigger new game flow and show tutorial.
- **Definition of Done**: All 6 nav links navigate to correct screens. Progress counters reflect live save state.

### TASK-18: Tutorial flow
- **Depends on**: TASK-17
- **Spec ref**: PRD REQ-01, REQ-02
- **Description**: On `save.tutorialComplete === false`, show a skippable 3-step overlay: (1) introduce Berry, (2) explain evolution at level 10, (3) show Berry Log win condition. Set `tutorialComplete = true` on completion or skip.
- **Definition of Done**: Tutorial shows exactly once. Skip works. Berry is in Party after tutorial. Berry Log is accessible immediately after.

### TASK-19: Party screen and Berryvolution detail
- **Depends on**: TASK-16, TASK-15
- **Spec ref**: PRD REQ-08 (partial), DESIGN.md §11
- **Description**: Party screen lists all Party members with sprite, name, type, level. Tapping a member opens Berryvolution Detail: full stats, all unlocked moves (with move card), trait name and description, evolution button (if Berry at level ≥ 10 and stone held).
- **Definition of Done**: Unevolved Berry shows evolution button only when eligible. Evolution button triggers `ConfirmDialog` before calling `evolve` action.

### TASK-20: Berry Log screen
- **Depends on**: TASK-16, TASK-15
- **Spec ref**: PRD REQ-05
- **Description**: 8-slot grid. Collected forms show sprite, name, type, level. Uncollected show locked silhouette and form name. Progress counter "X / 8 collected" at top. Stone-to-form info accessible via tap on locked slot.
- **Definition of Done**: Grid updates immediately on new capture or evolution. Locked slot shows correct Stone required.

### TASK-21: Zone Select and Explore screens
- **Depends on**: TASK-16, TASK-15
- **Spec ref**: PRD REQ-19, REQ-20, DESIGN.md §8.1
- **Description**: Zone Select lists all 5 Zones with encounter rate, available Stones, and current Stamina. Tapping a Zone and pressing Search costs 1 Stamina and calls `searchZone`. Results: wild Berry encounter → Encounter Screen; Stone drop / Gold Dust / nothing → result card.
- **Definition of Done**: Search button disabled at 0 Stamina. Zone drop table matches DESIGN.md §8.1. Stamina display updates immediately.

### TASK-22: Encounter screen and capture flow
- **Depends on**: TASK-21, TASK-12
- **Spec ref**: PRD REQ-06, REQ-07
- **Description**: Shows wild Berry sprite, level, current HP bar. Player can fight (runs mini-battle engine with wild Berry as opponent, single Berryvolution chosen by player) or attempt capture directly. Capture button costs 1 Crystal Orb, shows success/failure, and on failure wild Berry flees.
- **Definition of Done**: Catch rate matches formula across test cases. Flee is immediate on failure. Captured Berry added to Party.

### TASK-23: Team Builder screen
- **Depends on**: TASK-16, TASK-15
- **Spec ref**: PRD REQ-08
- **Description**: Shows all eligible Berryvolutions (no unevolved Berry). Player selects 1–3 for Arena match. Confirm navigates to Battle Screen with selected team.
- **Definition of Done**: Unevolved Berry absent from list. Confirm disabled until ≥ 1 selected. Max 3 enforced.

### TASK-24: Battle screen
- **Depends on**: TASK-23, TASK-15, TASK-16
- **Spec ref**: PRD REQ-09, REQ-10, REQ-11, REQ-12
- **Description**: Renders active player and AI Berryvolutions with HP bars, NRG bar, status indicator. Move buttons (greyed if NRG insufficient or locked). Basic Attack always available. Switch button (disabled if only 1 conscious). After each move resolves, show type effectiveness label ("Super effective!", "Not very effective…"). After faint, prompt player to choose replacement.
- **Definition of Done**: All PRD REQ-09 through REQ-12 acceptance criteria pass manually. Type label appears on every damaging hit.

### TASK-25: Post-battle results screen
- **Depends on**: TASK-24
- **Spec ref**: PRD REQ-13
- **Description**: Shows Win/Loss/Draw, XP earned per Berryvolution, Arena Points change, resources earned. HP/NRG restore applied before display. "Continue" returns to Main Menu. Check win condition — if met, navigate to Victory screen.
- **Definition of Done**: Points math correct for all three outcomes. Victory screen triggers when all 8 collected and Apex defeated.

### TASK-26: Arena Ladder Rankings screen
- **Depends on**: TASK-15, TASK-16
- **Spec ref**: PRD REQ-17, REQ-18
- **Description**: Shows all 5 tiers with point thresholds, current tier highlighted, current points. Apex row shows Berry Log lock indicator if < 8 collected. "Fight" button navigates to Team Builder.
- **Definition of Done**: Apex fight button disabled when < 8 Berryvolutions collected, regardless of points.

### TASK-27: Shop screen
- **Depends on**: TASK-16, TASK-15
- **Spec ref**: PRD REQ-21, TECH_SPEC.md §9.4
- **Description**: Lists Crystal Orbs and Stamina Potions with Gold Dust prices from `config.ts`. Current Gold Dust balance shown. Each purchase triggers `ConfirmDialog`. Deducts Gold Dust, adds item.
- **Definition of Done**: Cannot spend more Gold Dust than held. Balance updates immediately post-purchase.

### TASK-28: Settings screen
- **Depends on**: TASK-17, TASK-14
- **Spec ref**: DESIGN.md §11, TECH_SPEC.md §10
- **Description**: Minimal: mute toggle for any audio (placeholder in v1), "Export Save" button (triggers download), "Import Save" file input, and "Reset Save" button behind a `ConfirmDialog`.
- **Definition of Done**: Reset wipes localStorage and returns to new game. Export downloads valid JSON. Import loads a previously exported file and resumes correctly.

---

## Milestone 5 — Assets

### TASK-29: Pixel art sprites
- **Depends on**: TASK-01
- **Spec ref**: PRD REQ-22
- **Description**: Create or source static pixel art sprites for Berry and all 8 Berryvolutions. Place in `src/assets/sprites/`. Add basic battle animations (attack flash, faint fade) via CSS.
- **Definition of Done**: All 9 sprites (Berry + 8 forms) render at correct size on Battle Screen, Party Screen, and Berry Log. Faint animation plays on KO.

---

## Milestone 6 — Polish & Release Readiness

### TASK-30: End-to-end playthrough test
- **Depends on**: TASK-25, TASK-26, TASK-27, TASK-28, TASK-29
- **Spec ref**: All PRD requirements
- **Description**: Manual playthrough from new game to Victory screen. Verify: tutorial → Zone exploration → capture → evolution → Arena climb → Apex defeat → Victory screen. Confirm save persists across page refresh.
- **Definition of Done**: All 22 PRD requirements pass their acceptance criteria. No blocking bugs.

### TASK-31: Unit test coverage pass
- **Depends on**: TASK-07 through TASK-13
- **Spec ref**: TECH_SPEC.md engine functions
- **Description**: Ensure all engine functions (leveling, evolution, exploration, capture, damage, status, turn resolution, AI) have unit tests covering happy path and key edge cases.
- **Definition of Done**: `npm run test` passes. Engine coverage ≥ 80%.

---

## Resolved Questions

All open questions from TECH_SPEC.md §9 are now resolved. See TECH_SPEC.md §9–10 for full data.

| Ref | Resolution                                              |
|-----|---------------------------------------------------------|
| T1  | Save export/import via JSON download — see §10          |
| T2  | Base stats and growth defined in `config.ts` — see §9.1 |
| T3  | 32 move pools defined — see §9.2                        |
| T4  | Starting: 10 Stamina, 3 Crystal Orbs, 50 Gold Dust      |
| T5  | Crystal Orb: 30 Gold Dust; Stamina Potion: 25 Gold Dust |
