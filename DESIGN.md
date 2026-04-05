# Berry's Evolution — Game Design Document

> Platform: **Web**. Visual style: **Pixel art** (upgradeable to 3D later).
> PvP: **AI only** (turn-based submission). Personal project — not for publication.

---

## 1. Core Concept

The player's goal is to **collect all 8 evolution forms of Berry** and use them
to **win battles** in the Arena. Each Berry evolution embodies a different
elemental type, giving the collection quest a natural tie to the battle system.

Berry itself is the starting companion — unevolved, weak, but the seed of
every powerful form. Evolution is the core progression loop:

```
Receive Berry  →  Evolve into a typed form  →  Battle in Arena  →  Earn resources
      ↑                                                                    |
      └──────────────── collect all 8 evolutions ────────────────────────┘
```

**Win condition**: Collect and evolve all 8 Berryvolutions and defeat the Apex
Arena with your complete team. A Berry Log-style completion tracker shows
progress. The game ends with a victory screen — there is no post-game loop.

The design principle is **simplicity with depth**: fewer moving parts than a
full Shards game, but enough type interaction and stat variation to reward
strategic thinking.

---

## 2. The Berryvolutions

### 2.1 The 8 Evolution Forms

Each evolution is a playable monster with a fixed type, unique stat spread,
a signature trait, and a 4-move pool. Unevolved Berry cannot enter Arena
matches — it must be evolved first.

| Evolution | Type     | Stat Focus  | Role                              | Signature Trait |
|-----------|----------|-------------|-----------------------------------|-----------------|
| Hypereon  | Water    | HP, DEF     | Tanky sustain fighter             | Hydration       |
| Volteon   | Electric | SPD, ATK    | Fastest; fragile glass cannon     | Swift           |
| Emberon   | Fire     | ATK         | Highest raw damage; low DEF       | Volatile        |
| Eryleon   | Psychic  | NRG, SPD    | Special move powerhouse           | Psychic Veil    |
| Vengeon   | (Dark*)  | DEF, HP     | Wall; debuff and stall            | Dark Shroud     |
| Grasseon   | Grass    | ATK, DEF    | Balanced; regen-flavored          | Thorn Guard     |
| Polareon  | Ice      | NRG, ATK    | Control; status-heavy             | Frost Armor     |
| Luxeon    | (Fairy*) | HP, NRG     | Healer and disruptor              | Fairy Charm     |

> *Dark and Fairy are **not full types** in the effectiveness chart. They are
> expressed as type-adjacent flavor via each evolution's trait and move effects.
> This keeps the type table learnable at 7 entries. Can be revisited in v2.

### 2.2 How Evolution Works

- Player starts with a single Berry (gifted in the tutorial).
- Additional Berrys can be found via Zone exploration (rare encounter).
- To evolve, a Berry must reach **level 10** and the player must spend an
  **Evolution Stone** matching the target type.
- Each Berry can only evolve once; there is no de-evolving.
- Each evolution form can only be obtained once (no duplicates in v1).

| Evolution Stone | Obtained From          | Unlocks  |
|-----------------|------------------------|----------|
| Water Stone     | Tide Basin Zone        | Hypereon |
| Thunder Stone   | Tide Basin Zone        | Volteon  |
| Fire Stone      | Ember Crater Zone      | Emberon  |
| Sun Shard       | Ember Crater Zone      | Eryleon  |
| Moon Shard      | Verdant Vale Zone      | Vengeon  |
| Leaf Stone      | Verdant Vale Zone      | Grasseon  |
| Ice Stone       | Frostpeak Zone         | Polareon |
| Ribbon Shard    | Any Zone (rare drop)   | Luxeon   |

---

## 3. Type System

### 3.1 The 7 Types

Every evolution and enemy has exactly **one type**.

| Type    | Strong Against       | Weak Against    | Flavor              |
|---------|----------------------|-----------------|---------------------|
| Fire    | Grass, Ice           | Water, Rock     | Aggressive, fast    |
| Water   | Fire, Rock           | Grass, Electric | Balanced, bulky     |
| Grass   | Water, Rock          | Fire, Ice       | Sustain, regen      |
| Electric| Water                | Ground, Rock    | Fast, fragile       |
| Rock    | Fire                 | Water, Grass    | Slow, tanky         |
| Ice     | Grass                | Fire, Rock      | Control, debuff     |
| Psychic | Fighting*, Poison*   | Dark*, Ghost*   | Special burst       |

> Types marked with * exist only as **traits** on specific enemies or
> Berryvolutions — they are not types a player's team can be. This keeps the
> chart to 7 without breaking Psychic's canonical identity.

### 3.2 Type Effectiveness Multipliers

| Relationship       | Damage Multiplier |
|--------------------|-------------------|
| Super effective    | ×1.5              |
| Neutral            | ×1.0              |
| Not very effective | ×0.67             |

No full immunities in v1 (except Dark Shroud trait — see §3.3).

### 3.3 Traits

Each Berryvolution has one **fixed passive trait**.

| Trait        | Held By  | Effect                                                          |
|--------------|----------|-----------------------------------------------------------------|
| Hydration    | Aquareon | Restores 8% max HP at the start of each turn                    |
| Swift        | Volteon  | Always acts first within its Speed tier (breaks Speed ties)     |
| Volatile     | Emberon  | Outgoing moves +15% damage; takes +10% incoming damage          |
| Psychic Veil | Eryleon  | Immune to status effects from non-Psychic moves                 |
| Dark Shroud  | Vengeon  | Psychic-type moves deal 0 damage to Vengeon                     |
| Thorn Guard  | Grasseon  | Attackers take 5% reflected damage on contact Physical moves    |
| Frost Armor  | Polareon | The first hit each battle is reduced by 30%                     |
| Fairy Charm  | Luxeon   | When Luxeon faints, the next active ally is healed for 10% HP   |

---

## 4. Stats & Leveling

### 4.1 The 5 Stats

| Stat    | Abbr | Description                                                    |
|---------|------|----------------------------------------------------------------|
| HP      | HP   | Hit points. Reaches 0 = knocked out.                           |
| Attack  | ATK  | Physical move power multiplier.                                |
| Defense | DEF  | Reduces incoming Physical move damage.                         |
| Speed   | SPD  | Determines turn order. Higher goes first.                      |
| Energy  | NRG  | Fuel for Special moves. Also used as Special power multiplier. |

### 4.2 Base Stat Ranges (at Level 1)

Each Berryvolution's stats are fixed by design, not random. Below is the
range across all 8 forms to give a sense of scale:

| Stat | Min (weakest form) | Max (strongest form) |
|------|--------------------|----------------------|
| HP   | 55                 | 130                  |
| ATK  | 45                 | 130                  |
| DEF  | 45                 | 110                  |
| SPD  | 45                 | 130                  |
| NRG  | 30                 | 110                  |

### 4.3 Leveling

- Berryvolutions level from **1 to 30** after evolution (Berry caps at level 10).
- Each level grants flat stat growth according to the evolution's growth profile.
- New moves are unlocked at fixed levels: **1, 8, 15, 22**.
- XP is earned from every battle (win or lose), scaled by the average level of the enemy team, with an additional win bonus. Defeating stronger enemies yields more XP.

---

## 5. Move System

### 5.1 Move Anatomy

Each evolution has a **fixed pool of 4 moves** (unlocked by level).

| Field       | Description                                               |
|-------------|-----------------------------------------------------------|
| Name        | Display name                                              |
| Type        | Elemental type (drives type-effectiveness calculation)    |
| Category    | Physical (ATK vs DEF) or Special (NRG, ignores DEF)       |
| Power       | Base damage coefficient on a 10–100 scale                 |
| Energy Cost | NRG consumed per use. 0 = free basic attack               |
| Effect      | Optional status infliction or stat change                 |
| Accuracy    | Hit chance: 80%, 90%, or 100%                             |

Every evolution also has a **free Basic Attack** (0 NRG cost, Physical, power
20, 100% accuracy) that is always available regardless of move pool.

### 5.2 Damage Formula

**Physical move:**
```
damage = floor((move.power / 50) * attacker.ATK * type_multiplier
               * random(0.85, 1.0) - defender.DEF * 0.5)
```

**Special move:**
```
damage = floor((move.power / 50) * attacker.NRG * type_multiplier
               * random(0.85, 1.0))
```

Minimum damage is always **1**.

### 5.3 Status Effects

Each Berryvolution can apply a status via specific moves. A target can hold
only **one status at a time** — a new one replaces the old.

| Status  | Source Type | Effect                                      | Duration     |
|---------|-------------|---------------------------------------------|--------------|
| Burn    | Fire        | -5% max HP per turn; ATK -20%               | 3 turns      |
| Freeze  | Ice         | Cannot act; 50% thaw chance each turn        | Up to 3 turns|
| Shock   | Electric    | SPD halved                                  | 2 turns      |
| Soak    | Water       | Fire moves against target deal ×0.5 damage  | 3 turns      |
| Wilt    | Grass       | HP regen disabled; DEF -10%                 | 2 turns      |
| Shatter | Rock        | DEF -25%                                    | 2 turns      |
| Confuse | Psychic     | 30% chance to hurt self instead of acting   | 2 turns      |

---

## 6. Battle System (Arena)

### 6.1 Team Composition

- Players bring a team of **up to 2 Berryvolutions** to each Arena match.
- Only 1 evolution is active at a time.
- Switching costs the player's turn for that round.
- A fainted evolution cannot return. If all 3 faint, the player loses.
- HP is **fully restored** between matches. NRG is restored between matches.

### 6.2 Turn Structure (vs AI)

```
1. Match starts — player picks a team of 1–2 from their collection
2. Player and AI each choose their starting evolution
3. Each turn:
   a. Player selects: [Move 1–4] | [Basic Attack] | [Switch]
   b. AI selects its action (see §6.4)
   c. Resolve in Speed order:
      - Switches always happen before moves
      - Higher SPD moves first; ties broken randomly
   d. Apply damage → status effects → end-of-turn effects (Burn tick, Regen)
   e. Check faints → player selects replacement if needed
   f. Check win condition
4. Battle ends → award XP, Arena Points, resources
```

### 6.3 Energy Management

- Each evolution enters battle with **NRG = base NRG stat**.
- Special moves cost NRG (shown on move card).
- The **Basic Attack** costs 0 NRG and restores **+8 NRG**.
- NRG is capped at the base NRG stat.
- At 0 NRG, only Basic Attack and switches are available.

The intended rhythm: spend specials aggressively, recharge with basics,
find the right moment to burst again.

### 6.4 AI Behavior

The AI has three difficulty tiers that unlock with Arena rank:

| Difficulty | Behavior                                                           |
|------------|--------------------------------------------------------------------|
| Rookie     | Picks moves randomly; never switches                               |
| Trainer    | Prioritizes super-effective moves; switches if type-disadvantaged  |
| Champion   | Full type-aware play; manages NRG; applies status strategically    |

### 6.5 Win / Loss / Draw

- **Win**: All enemy evolutions are knocked out.
- **Loss**: All player evolutions are knocked out.
- **Draw**: Both sides' last evolution faints on the same turn — no points lost.

---

## 7. Arena (Ranked Ladder)

| Tier    | Points to Reach | Opponents    | Match Format |
|---------|-----------------|--------------|--------------|
| Bronze  | 0 (start)       | Rookie AI    | Best of 1    |
| Silver  | 300             | Rookie AI    | Best of 1    |
| Gold    | 700             | Trainer AI   | Best of 3    |
| Crystal | 1200            | Trainer AI   | Best of 3    |
| Apex    | 2000 + all 8    | Champion AI  | Best of 5    |

> Apex requires both 2000 points **and** owning all 8 Berryvolutions.

Point changes: **Win +25 / Loss -15 / Draw ±0**

---

## 8. Collection & Exploration

### 8.1 Zones

Players explore Zones to find Berrys, Evolution Stones, and resources.
Zone exploration is a **simple UI action** (no overworld movement in v1):
tap "Search" → encounter result. Each search costs **1 Stamina**.
Stamina is **action-gated** — it refills by winning Arena battles and
completing Zone encounters, not by waiting on a real-world timer.

| Zone           | Berry Encounter Rate | Stones Found            |
|----------------|----------------------|-------------------------|
| Ember Crater   | 10%                  | Fire Stone, Sun Shard   |
| Tide Basin     | 10%                  | Water Stone, Thunder Stone |
| Verdant Vale   | 10%                  | Leaf Stone, Moon Shard  |
| Frostpeak Zone | 8%                   | Ice Stone               |
| Wandering Path | 5%                   | Ribbon Shard (rare)     |

### 8.2 Wild Encounters

When a wild Berry appears:
1. An optional battle begins (weakening Berry raises catch rate).
2. Player spends a **Crystal Orb** to attempt capture.
3. `catch_chance = 0.70 * (1 - current_hp / max_hp) + 0.10`
   (minimum 10%, maximum 80%).
4. On failure, the wild Berry flees after each missed attempt.

### 8.3 Player Collection

- The player's full roster of Berryvolutions is called their **Party**.
- No cap on Party size in v1.
- Players select up to 3 from their Party to bring to Arena.

---

## 9. Progression & Economy

| Resource        | Earned By                              | Spent On                     |
|-----------------|----------------------------------------|------------------------------|
| Crystal Orbs    | Zone rewards, Shop, Arena wins         | Capturing wild Berry         |
| Gold Dust       | Arena wins, Zone encounters            | Shop (Orbs, Crystal Orbs)    |
| Evolution Stones| Zone drops                             | Evolving Berry               |
| Stamina         | Arena wins (+3), Zone encounters (+1)  | Zone exploration searches    |
| Arena Points    | Arena wins                             | Advancing Arena tiers        |
| XP (per mon)    | All battles (win or lose)              | Leveling up Berryvolutions   |

---

## 10. Functionalities (Feature List)

### Core — v1 (Minimum Viable Game)

| # | Feature                   | Description                                                        |
|---|---------------------------|--------------------------------------------------------------------|
| 1 | Berryvolution data model  | All 8 forms: type, stats, trait, 4 moves, level, XP               |
| 2 | Type effectiveness engine | 7-type chart with ×1.5 / ×1.0 / ×0.67 multipliers                 |
| 3 | Battle engine             | Turn loop, Speed ordering, damage calc, status tracking            |
| 4 | Energy system             | NRG pool per evolution; cost/restore per move                      |
| 5 | AI opponent               | Three difficulty tiers (Rookie, Trainer, Champion)                 |
| 6 | Team builder              | Select up to 2 Berryvolutions from Party for Arena                 |
| 7 | Arena + ranked ladder     | 5-tier ladder, point tracking, unlock gates                        |
| 8 | Zone exploration          | Tap-to-search, encounter Berry, find Stones and resources          |
| 9 | Capture mechanic          | Crystal Orb usage, catch rate formula, flee on failure             |
|10 | Evolution system          | Spend Evolution Stone at level 10 to unlock a Berryvolution form   |
|11 | Leveling & XP             | Earn XP from battles, level up, unlock moves at fixed milestones   |
|12 | Party / collection screen | View all Berryvolutions, stats, moves, current level               |
|13 | Berry Log                 | Berry Log screen showing which of the 8 forms are collected        |
|14 | Shop                      | Spend Gold Dust on Crystal Orbs and Stamina Potions                |
|15 | Pixel art sprites         | Static pixel art for each Berryvolution; battle animations (v1 basic)|

### Extended — v2

| # | Feature                   | Description                                                        |
|---|---------------------------|--------------------------------------------------------------------|
|16 | Upgrade to 3D sprites     | Replace pixel art with low-poly 3D models                          |
|17 | Daily challenges          | Fixed team + set opponent; tests type knowledge                    |
|18 | Achievement system        | Milestones rewarding Gold Dust or exclusive stones                 |
|19 | Battle replays            | Review past Arena battles turn by turn                             |
|20 | Async PvP                 | Submit turns vs another player; resolve when both submit           |
|21 | Seasonal events           | Limited-time Zone with exclusive encounter rates                   |

---

## 11. UI / Screen Map

```
Main Menu
├── Arena
│   ├── Team Builder  ──►  Battle Screen  ──►  Post-Battle Results
│   └── Ladder Rankings
├── Explore
│   ├── Zone Select
│   └── Search / Encounter Screen  ──►  Capture Result
├── Party
│   └── Berryvolution Detail  (stats / moves / level / trait)
├── Berry Log  (8-slot completion grid)
├── Shop
└── Settings
```

---

## 12. Decisions Log

| # | Decision                                                                    |
|---|-----------------------------------------------------------------------------|
| D1 | Wild Berrys have **random level ranges** per Zone (not fixed levels).      |
| D2 | Type matchup hints are **shown during battle** (super effective, not very effective, etc.). |

---

## 13. Glossary

| Term              | Meaning                                                        |
|-------------------|----------------------------------------------------------------|
| Berryvolution     | One of the 8 evolved forms of Berry; the main playable units   |
| Party             | The player's full collection of evolved Berryvolutions         |
| Arena             | The AI-opponent ranked battle ladder                           |
| Evolution Stone   | Item that triggers Berry's evolution into a specific form      |
| Crystal Orb       | Capture item used to catch wild Berry                          |
| Gold Dust         | Soft in-game currency                                          |
| Zone              | A biome area where wild Berry and Stones can be found          |
| NRG               | Energy resource that powers Special moves                      |
| Stamina           | Resource consumed by Zone searches; refills through gameplay   |
| Arena Points      | Ranking currency; determines which tier the player is in       |
