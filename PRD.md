# Berry's Evolution — Product Requirements Document

Derived from: `USER_STORIES.md` (current), `DESIGN.md` (current)
Status: Awaiting human review

---

## Scope Boundary

**v1 (this document)**: Web-based, single-player, AI opponents only.
All Must-have requirements below must ship before any Should-have or Nice-to-have.
v2 features are listed separately and explicitly out of scope for v1.

---

## Feature: Onboarding & Tutorial

### REQ-01: Tutorial Berry Gift
- **Priority**: Must-have
- **Derived from**: US-01
- **Description**: On first launch, the game gifts the player one unevolved Berry at level 1. A brief tutorial walks the player through Berry's stats and explains the level-10 evolution requirement.
- **Constraints**: Tutorial must be skippable on replay. Berry is non-removable from Party.
- **Success Metric**: Player exits tutorial with Berry in Party and understands evolution gate.
- **Out of Scope**: Animated cutscenes; voiced narration.

### REQ-02: Win Condition Introduction
- **Priority**: Must-have
- **Derived from**: US-02
- **Description**: The tutorial introduces the Berry Log (8 empty slots) and states the win condition: collect all 8 Berryvolutions and defeat the Apex Arena.
- **Constraints**: Must display before the player's first Zone search or Arena attempt.
- **Success Metric**: Berry Log screen is accessible immediately after tutorial.
- **Out of Scope**: Animated intro sequence.

---

## Feature: Evolution

### REQ-03: Evolution Gate
- **Priority**: Must-have
- **Derived from**: US-03
- **Description**: A Berry may only evolve when it is level 10 or above AND the player holds the matching Evolution Stone. The evolution UI shows the resulting Berryvolution before confirming. Evolving is permanent and irreversible.
- **Constraints**: Each Berry evolves exactly once. No duplicate Berryvolution forms in v1.
- **Success Metric**: Evolution button is disabled below level 10 or without the matching Stone. Post-evolution, original Berry no longer exists in Party.
- **Out of Scope**: De-evolving; multiple copies of the same Berryvolution.

### REQ-04: Evolution Stone Discovery Info
- **Priority**: Must-have
- **Derived from**: US-04
- **Description**: Each Zone's item drop list (including Evolution Stones) is visible on the Zone Select screen before entering. The full Stone → Zone → Berryvolution mapping is accessible in-game (e.g., on the Berry Log or a dedicated info screen).
- **Constraints**: Ribbon Shard must be marked as a rare drop available in any Zone.
- **Success Metric**: Player can identify where to farm a specific Stone without leaving the game.
- **Out of Scope**: Dynamic drop-rate display; Stone inventory history.

---

## Feature: Collection & Berry Log

### REQ-05: Berry Log Screen
- **Priority**: Must-have
- **Derived from**: US-05
- **Description**: An 8-slot grid showing all Berryvolutions. Collected forms display name, type, and current level. Uncollected forms display as locked silhouettes. A "X / 8 collected" counter is always visible.
- **Constraints**: Berry Log must update immediately on capturing or evolving.
- **Success Metric**: Berry Log accurately reflects Party state at all times.
- **Out of Scope**: Sorting or filtering; animated reveals.

### REQ-06: Wild Berry Zone Encounters
- **Priority**: Must-have
- **Derived from**: US-06
- **Description**: Each Zone has a defined encounter rate (5%–10%) for wild Berry. Wild Berry levels are random within a per-Zone level range. Encounters are triggered by spending 1 Stamina on a Search action.
- **Constraints**: Zone encounter rates per DESIGN.md §8.1. Level ranges per Zone must be defined in TECH_SPEC.md.
- **Success Metric**: Wild Berry appears at the documented rate; its level falls within the Zone's defined range.
- **Out of Scope**: Overworld movement; encounter animations beyond a basic screen transition.

### REQ-07: Wild Berry Capture
- **Priority**: Must-have
- **Derived from**: US-07
- **Description**: When a wild Berry appears, the player may optionally battle it then spend a Crystal Orb to capture. Catch rate formula: `0.70 * (1 - current_hp / max_hp) + 0.10` (min 10%, max 80%). On failure, wild Berry flees immediately.
- **Constraints**: Player must hold at least 1 Crystal Orb to attempt capture.
- **Success Metric**: Catch rate matches formula output across test cases. Captured Berry is added to Party.
- **Out of Scope**: Multiple capture attempts per encounter (flee is immediate on failure).

---

## Feature: Battle System

### REQ-08: Team Builder
- **Priority**: Must-have
- **Derived from**: US-08
- **Description**: Before each Arena match, player selects 1–2 Berryvolutions from their Party. The Team Builder shows each evolution's type, level, and base stats. Unevolved Berry cannot be selected.
- **Constraints**: Minimum 1 evolution required to start a match.
- **Success Metric**: Team Builder correctly filters out unevolved Berry. Selected team is passed to the battle engine.
- **Out of Scope**: Saved team presets.

### REQ-09: Turn-Based Battle Engine
- **Priority**: Must-have
- **Derived from**: US-09
- **Description**: Each turn the player chooses Move 1–4, Basic Attack, or Switch. Actions resolve in Speed order (switches first, then moves by SPD; ties broken randomly). Damage is calculated per DESIGN.md §5.2. Status effects and end-of-turn effects (Burn tick, Regen) resolve after moves. Battle ends when all of one side's evolutions faint.
- **Constraints**: Formulas must match DESIGN.md §5.2 exactly. Random variance is `random(0.85, 1.0)`. Minimum damage is 1.
- **Success Metric**: Damage output matches formula for all move categories, types, and edge cases. Status durations match DESIGN.md §5.3.
- **Out of Scope**: Animated battle sequences beyond basic hit/miss feedback; battle replays (v2).

### REQ-10: Type Effectiveness Display
- **Priority**: Must-have
- **Derived from**: US-13, D2
- **Description**: After each damaging move resolves, the battle screen displays a type effectiveness label: "Super effective!" (×1.5), "Not very effective…" (×0.67), or nothing for neutral (×1.0).
- **Constraints**: Label must appear for both player and AI moves.
- **Success Metric**: Correct label displayed for every type matchup in the effectiveness chart.
- **Out of Scope**: Numeric multiplier display; type chart accessible mid-battle.

### REQ-11: Energy System
- **Priority**: Must-have
- **Derived from**: US-10
- **Description**: Each evolution enters battle with NRG equal to its base NRG stat. Special moves deduct their listed NRG cost. Basic Attack costs 0 NRG and restores +8 NRG. NRG is capped at base NRG stat. At 0 NRG, only Basic Attack and Switch are available.
- **Constraints**: NRG bar must be visible at all times during battle.
- **Success Metric**: NRG never exceeds base stat cap. Correct moves are greyed out at 0 NRG.
- **Out of Scope**: NRG persistence across matches (NRG resets between matches per DESIGN.md §6.1).

### REQ-12: Switching During Battle
- **Priority**: Must-have
- **Derived from**: US-11
- **Description**: Player may switch their active Berryvolution at the cost of their turn. Switches resolve before all moves. Fainted evolutions cannot be switched back in. If all 3 faint, the player loses.
- **Constraints**: Switch option is unavailable if player has only 1 conscious evolution remaining.
- **Success Metric**: Switch action correctly costs the turn and resolves before move phase.
- **Out of Scope**: Free switches on AI faint.

### REQ-13: Post-Battle Results Screen
- **Priority**: Must-have
- **Derived from**: US-12
- **Description**: After every battle, a results screen shows: Win/Loss/Draw, XP earned per Berryvolution, Arena Points change (+25/−15/±0), and resources earned (Gold Dust, etc.).
- **Constraints**: HP and NRG are fully restored after this screen.
- **Success Metric**: Points and XP values match design spec. Draws award 0 point change.
- **Out of Scope**: Battle replay (v2).

---

## Feature: Passive Traits

### REQ-14: Berryvolution Passive Traits
- **Priority**: Must-have
- **Derived from**: US-14
- **Description**: Each of the 8 Berryvolutions has exactly one passive trait that activates automatically at the correct moment. Traits are defined in DESIGN.md §3.3.
- **Constraints**: Trait logic must not require player input to activate.
- **Success Metric**: All 8 traits trigger at the correct moment with the correct effect. Trait name and description are shown on the Berryvolution detail screen.
- **Out of Scope**: Trait-swapping or upgrades.

---

## Feature: Leveling & Progression

### REQ-15: XP and Leveling
- **Priority**: Must-have
- **Derived from**: US-15
- **Description**: XP is awarded to participating Berryvolutions after every battle (win or lose), with a win bonus. Level-up is shown with a UI notification. Stats increase per the evolution's growth profile. Unevolved Berry caps at level 10; Berryvolutions cap at level 30.
- **Constraints**: XP values and growth profiles to be defined in TECH_SPEC.md.
- **Success Metric**: Level-up fires at correct XP thresholds. Stat increases are applied immediately.
- **Out of Scope**: XP sharing across non-participating evolutions.

### REQ-16: Move Unlocks by Level
- **Priority**: Must-have
- **Derived from**: US-16
- **Description**: Each Berryvolution has 4 moves unlocked at levels 1, 8, 15, and 22. New moves are shown to the player at level-up. Move details (type, category, power, NRG cost, effect, accuracy) are visible on the move card.
- **Constraints**: Move pools are fixed per DESIGN.md §5.1 (full move data to be defined in TECH_SPEC.md).
- **Success Metric**: Correct move unlocks at each milestone level for all 8 Berryvolutions.
- **Out of Scope**: Move forgetting or selection.

---

## Feature: Arena Ranked Ladder

### REQ-17: Arena Tier Progression
- **Priority**: Must-have
- **Derived from**: US-17
- **Description**: Five tiers (Bronze → Silver → Gold → Crystal → Apex) with point thresholds per DESIGN.md §7. Apex additionally requires all 8 Berryvolutions. Current tier and point total are shown on the Arena screen.
- **Constraints**: Player cannot challenge Apex without owning all 8 Berryvolutions, regardless of point total.
- **Success Metric**: Tier unlocks at the correct point threshold. Apex gate correctly checks both conditions.
- **Out of Scope**: Tier demotion (player cannot drop below a tier once reached in v1).

### REQ-18: AI Difficulty Tiers
- **Priority**: Must-have
- **Derived from**: US-18
- **Description**: Three AI difficulty levels unlock with Arena rank per DESIGN.md §6.4 and §7: Rookie (Bronze/Silver), Trainer (Gold/Crystal), Champion (Apex).
- **Constraints**: AI behavior must match the description in DESIGN.md §6.4 exactly.
- **Success Metric**: AI at each tier demonstrably behaves per spec (e.g., Rookie never switches; Trainer switches on type disadvantage).
- **Out of Scope**: Async PvP (v2).

---

## Feature: Zone Exploration & Economy

### REQ-19: Zone Exploration UI
- **Priority**: Must-have
- **Derived from**: US-19
- **Description**: A Zone Select screen lists all 5 Zones. Selecting a Zone and tapping "Search" costs 1 Stamina and produces a result: wild Berry encounter, Stone drop, Gold Dust, or nothing. No overworld movement.
- **Constraints**: Zone drop tables per DESIGN.md §8.1.
- **Success Metric**: Encounter and drop rates match design spec over a large sample.
- **Out of Scope**: Zone unlocking gates (all zones available from the start in v1).

### REQ-20: Stamina System
- **Priority**: Must-have
- **Derived from**: US-20
- **Description**: Stamina is consumed at 1 per Zone search. Arena wins restore +3 Stamina; Zone encounters restore +1 Stamina. Stamina never refills on a real-world timer. Current Stamina is always visible on the Explore screen.
- **Constraints**: No real-world timer gate under any circumstance.
- **Success Metric**: Stamina correctly increments and decrements. UI always reflects current value.
- **Out of Scope**: Stamina cap increase items (v2).

### REQ-21: Shop
- **Priority**: Must-have
- **Derived from**: US-21
- **Description**: The Shop sells Crystal Orbs and Stamina Potions for Gold Dust. Current Gold Dust balance is shown. Each purchase requires confirmation before deducting currency.
- **Constraints**: Player cannot spend more Gold Dust than they hold.
- **Success Metric**: Transaction deducts correct Gold Dust and adds correct item to inventory.
- **Out of Scope**: Premium currency; real-money purchases.

---

## Feature: Visual & Polish

### REQ-22: Pixel Art Sprites
- **Priority**: Must-have
- **Derived from**: DESIGN.md §10 (feature #15)
- **Description**: Each Berryvolution has a static pixel art sprite used in battle and on the Berry Log. Basic battle animations (attack, faint) are included in v1.
- **Constraints**: Style is pixel art. 3D upgrade is v2 only.
- **Success Metric**: All 8 Berryvolution sprites display correctly across all relevant screens.
- **Out of Scope**: Idle animations; 3D models (v2).

---

## v2 Out-of-Scope Features

The following are explicitly deferred to v2 and must not be partially implemented in v1:

| Feature              | Reference       |
|----------------------|-----------------|
| 3D sprite upgrade    | DESIGN.md §10 #16 |
| Daily challenges     | DESIGN.md §10 #17 |
| Achievement system   | DESIGN.md §10 #18 |
| Battle replays       | DESIGN.md §10 #19 |
| Async PvP            | DESIGN.md §10 #20 |
| Seasonal events      | DESIGN.md §10 #21 |
| Mobile platform      | DESIGN.md header  |
