# Berry's Evolution — User Stories

Derived from: `DESIGN.md` (current)
Status: Awaiting human review

---

## Feature Area: Onboarding & Tutorial

### US-01: Receive Starting Berry
**As a** new player
**I want** to receive a Berry companion at the start of the game
**So that** I have something to care about and evolve from the beginning

**Acceptance Criteria**:
- [ ] Tutorial gifts the player one unevolved Berry
- [ ] Berry is shown with its current level (1) and stats
- [ ] Tutorial explains that Berry must reach level 10 to evolve

**Linked Design Section**: §2.2

---

### US-02: Understand the Win Condition
**As a** new player
**I want** to be shown the goal of the game upfront
**So that** I know what I'm working toward

**Acceptance Criteria**:
- [ ] Tutorial or intro screen explains: collect all 8 Berryvolutions, defeat Apex Arena
- [ ] Berry Log is introduced showing 8 empty slots
- [ ] Player understands the collect → evolve → battle loop

**Linked Design Section**: §1

---

## Feature Area: Evolution

### US-03: Evolve Berry into a Typed Form
**As a** player
**I want** to evolve my Berry once it reaches level 10 using an Evolution Stone
**So that** I unlock a powerful typed form to use in battle

**Acceptance Criteria**:
- [ ] Evolution is only available when Berry is level 10+
- [ ] Player must hold the matching Evolution Stone
- [ ] Selecting a stone shows which form it unlocks before confirming
- [ ] After evolution, Berry is replaced by the Berryvolution permanently
- [ ] Each Berry can only evolve once; no de-evolving

**Linked Design Section**: §2.2

---

### US-04: Know Where to Find Evolution Stones
**As a** player
**I want** to know which Zone drops which Evolution Stone
**So that** I can plan which Zone to explore to unlock my desired Berryvolution

**Acceptance Criteria**:
- [ ] Each Zone's item drop list is visible before entering
- [ ] The Evolution Stone table (Stone → Zone → Berryvolution) is accessible in-game
- [ ] Ribbon Shard is marked as a rare drop available in any Zone

**Linked Design Section**: §2.2

---

## Feature Area: Collection & Berry Log

### US-05: Track Which Berryvolutions I Own
**As a** player
**I want** to see an 8-slot Berry Log showing which forms I've collected
**So that** I always know my progress toward the win condition

**Acceptance Criteria**:
- [ ] Berry Log shows all 8 Berryvolution slots
- [ ] Collected forms show their name, type, and level
- [ ] Uncollected forms show as locked/silhouetted
- [ ] Progress count is shown (e.g. "3 / 8 collected")

**Linked Design Section**: §1, §10 (feature #13)

---

### US-06: Find Wild Berrys in Zones
**As a** player
**I want** to encounter wild Berrys while exploring Zones
**So that** I can capture additional Berrys to evolve into new forms

**Acceptance Criteria**:
- [ ] Each Zone has a documented encounter rate for wild Berry
- [ ] Wild Berry encounter is triggered by spending 1 Stamina on a Search action
- [ ] Encounter rate varies by Zone (5%–10%)
- [ ] Wild Berry level is random within a range defined per Zone

**Linked Design Section**: §8.1, §8.2

---

### US-07: Capture a Wild Berry
**As a** player
**I want** to use a Crystal Orb to capture a wild Berry after weakening it
**So that** I have more Berrys available to evolve

**Acceptance Criteria**:
- [ ] An optional battle begins when a wild Berry appears
- [ ] Player can attempt capture by spending a Crystal Orb
- [ ] Catch rate follows the formula: `0.70 * (1 - hp/max_hp) + 0.10` (min 10%, max 80%)
- [ ] On failure, wild Berry flees; player is informed
- [ ] Captured Berry is added to Party

**Linked Design Section**: §8.2

---

## Feature Area: Battle System

### US-08: Build a Team for Arena
**As a** player
**I want** to select up to 2 Berryvolutions from my Party before an Arena match
**So that** I can strategize my team composition based on type matchups

**Acceptance Criteria**:
- [ ] Team Builder shows all available Berryvolutions with type, level, and stats
- [ ] Player can select 1–2 evolutions
- [ ] Player cannot enter a match with unevolved Berry on the team

**Linked Design Section**: §6.1, §10 (feature #6)

---

### US-09: Battle an AI Opponent
**As a** player
**I want** to fight turn-based battles against AI opponents
**So that** I can earn XP, Arena Points, and resources

**Acceptance Criteria**:
- [ ] Each turn: player selects Move 1–4, Basic Attack, or Switch
- [ ] Actions resolve in Speed order (switches always first)
- [ ] Damage is calculated using the correct physical/special formula from DESIGN.md §5.2
- [ ] Status effects are applied and tracked per DESIGN.md §5.3
- [ ] End-of-turn effects (Burn tick, regen) resolve after moves
- [ ] Battle ends when all of one side's evolutions faint

**Linked Design Section**: §6.2

---

### US-10: Use Special Moves and Manage Energy
**As a** player
**I want** to spend and recover NRG across turns
**So that** I can use powerful special moves strategically

**Acceptance Criteria**:
- [ ] Each evolution enters battle with NRG equal to its base NRG stat
- [ ] Special moves cost NRG shown on the move card
- [ ] Basic Attack costs 0 NRG and restores +8 NRG
- [ ] NRG is capped at base NRG stat
- [ ] Only Basic Attack and Switch are available at 0 NRG

**Linked Design Section**: §6.3

---

### US-11: Switch Berryvolutions During Battle
**As a** player
**I want** to switch my active Berryvolution during a battle
**So that** I can respond to type disadvantages

**Acceptance Criteria**:
- [ ] Switching costs the player's turn for that round
- [ ] Switch resolves before all moves in the same turn
- [ ] A fainted evolution cannot be switched back in
- [ ] If all 3 evolutions faint, player loses the match

**Linked Design Section**: §6.1, §6.2

---

### US-12: See Win, Loss, or Draw Outcome
**As a** player
**I want** to see a clear match outcome screen after every battle
**So that** I know what I earned and how my rank changed

**Acceptance Criteria**:
- [ ] Win, Loss, or Draw is clearly displayed
- [ ] XP earned per Berryvolution is shown
- [ ] Arena Points change is shown (+25 win / -15 loss / ±0 draw)
- [ ] Resources earned (Gold Dust, etc.) are listed

**Linked Design Section**: §6.5, §7

---

## Feature Area: Type System

### US-13: Benefit from Type Advantages
**As a** player
**I want** to deal increased damage when my move type counters the opponent's type
**So that** building a strategically diverse team is rewarded

**Acceptance Criteria**:
- [ ] Super effective moves deal ×1.5 damage
- [ ] Neutral moves deal ×1.0 damage
- [ ] Not very effective moves deal ×0.67 damage
- [ ] Battle screen shows type effectiveness label on each hit (e.g. "Super effective!", "Not very effective…")

**Linked Design Section**: §3.1, §3.2

---

### US-14: Benefit from My Berryvolution's Passive Trait
**As a** player
**I want** each Berryvolution to have a unique passive trait that activates automatically
**So that** each form feels distinct and rewards knowledge of the roster

**Acceptance Criteria**:
- [ ] Each of the 8 Berryvolutions has exactly one trait active at all times
- [ ] Traits trigger at the correct moment (start of turn, on hit, on faint, etc.)
- [ ] Trait name and description are visible on the Berryvolution detail screen

**Linked Design Section**: §3.3

---

## Feature Area: Leveling & Progression

### US-15: Earn XP and Level Up
**As a** player
**I want** my Berryvolutions to earn XP from every battle
**So that** I feel progression even when I lose

**Acceptance Criteria**:
- [ ] XP is awarded after every battle (win or lose), with a win bonus
- [ ] Level-up is shown with a clear UI notification
- [ ] Each level grants flat stat growth per the evolution's growth profile
- [ ] Unevolved Berry caps at level 10; Berryvolutions level up to 30

**Linked Design Section**: §4.3

---

### US-16: Unlock New Moves by Leveling
**As a** player
**I want** my Berryvolution to gain new moves at levels 1, 8, 15, and 22
**So that** leveling up has concrete tactical value beyond raw stat gains

**Acceptance Criteria**:
- [ ] Each Berryvolution has exactly 4 moves unlocked at fixed levels
- [ ] Newly unlocked move is shown to the player at level-up
- [ ] Move details (type, category, power, NRG cost, effect, accuracy) are visible

**Linked Design Section**: §4.3, §5.1

---

## Feature Area: Arena Ranked Ladder

### US-17: Progress Through Arena Tiers
**As a** player
**I want** to climb through Bronze, Silver, Gold, Crystal, and Apex tiers by earning Arena Points
**So that** I have a long-term progression goal

**Acceptance Criteria**:
- [ ] Player starts at Bronze (0 points)
- [ ] Each tier has a defined point threshold to unlock
- [ ] Current tier and points are shown on the Arena screen
- [ ] Reaching Apex requires 2000 points AND all 8 Berryvolutions

**Linked Design Section**: §7

---

### US-18: Face Harder AI as I Advance
**As a** player
**I want** the AI opponents to become more intelligent as I climb tiers
**So that** the game stays challenging as I improve

**Acceptance Criteria**:
- [ ] Bronze/Silver: Rookie AI (random moves, never switches)
- [ ] Gold/Crystal: Trainer AI (type-aware, switches on disadvantage)
- [ ] Apex: Champion AI (full type + NRG + status strategy)

**Linked Design Section**: §6.4, §7

---

## Feature Area: Zone Exploration

### US-19: Explore Zones to Find Resources
**As a** player
**I want** to search Zones and receive encounter results
**So that** I can gather Evolution Stones, Crystal Orbs, and Gold Dust

**Acceptance Criteria**:
- [ ] Zone Select screen shows all available Zones
- [ ] Tapping "Search" costs 1 Stamina and produces an encounter result
- [ ] Results can be: wild Berry, Evolution Stone drop, Gold Dust, or nothing
- [ ] No overworld movement required — exploration is a UI tap action

**Linked Design Section**: §8.1

---

### US-20: Manage Stamina
**As a** player
**I want** my Stamina to refill through gameplay (battles and Zone encounters)
**So that** the game never gates me behind a real-world timer

**Acceptance Criteria**:
- [ ] Stamina is consumed at 1 per Zone search
- [ ] Arena wins restore +3 Stamina
- [ ] Zone encounters restore +1 Stamina
- [ ] Current Stamina is always visible on the Explore screen

**Linked Design Section**: §8.1, §9

---

## Feature Area: Economy & Shop

### US-21: Spend Gold Dust in the Shop
**As a** player
**I want** to exchange Gold Dust for Crystal Orbs and Stamina Potions
**So that** I can convert battle earnings into exploration resources

**Acceptance Criteria**:
- [ ] Shop is accessible from the Main Menu
- [ ] Crystal Orbs and Stamina Potions are purchasable with Gold Dust
- [ ] Current Gold Dust balance is shown in the Shop
- [ ] Transaction is confirmed before spending

**Linked Design Section**: §9, §10 (feature #14)

---

## Decisions

| # | Decision                                                                 | Impacts |
|---|--------------------------------------------------------------------------|---------|
| D1 | Wild Berrys have **random level ranges** per Zone                       | US-06, US-07 |
| D2 | Type matchup hints **shown during battle** (e.g. "Super effective!")    | US-13   |
