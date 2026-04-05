# Berry's Evolution — Complete Knowledge Base

> **Purpose**: Reference document for (1) an assistant agent answering player questions and (2) generating challenge-mode quiz questions. All data reflects the live implementation; divergences from design documents are noted.

---

## 1. GAME OVERVIEW

| Field | Value |
|---|---|
| Title | Berry's Evolution |
| Genre | Collectible evolution / turn-based battle |
| Platform | Web app (React + TypeScript, runs in browser) |
| Win Condition | Collect all 8 Berryvolutions AND defeat the Apex Arena tier |
| Persistence | `localStorage` key `popo_save` (v1); export/import via JSON |
| Starting Location | Verdant Vale |

**Tagline**: "Collect all 8 evolutions. Conquer the Arena."

---

## 2. THE BERRYVOLUTIONS

### 2.1 Berry (Unevolved Starter)

- **Type**: Water (varies by skin)
- **Level Cap**: 10
- **Base Stats**: HP 45, ATK 40, DEF 40, SPD 45, NRG 30
- **Stat Growth/Level**: HP +3, ATK +3, DEF +3, SPD +3, NRG +2
- Cannot enter Arena matches — must evolve first

### 2.2 Berry Skin Variants

Wild Berries spawn with random cosmetic skins mapping to elemental types:

| Skin | Color | Type |
|---|---|---|
| default | Blue | Water |
| crimson | Red | Fire |
| sapphire | Blue | Water |
| citrus | Yellow | Electric |
| jade | Green | Grass |
| lilac | Purple | Psychic |
| coral | Pink | Ice |

### 2.3 All 8 Berryvolution Forms

#### HYPEREON (Water)
- **Trait**: Hydration — Restores 8% max HP at end of every turn
- **Evolution Stone**: Water Stone (Tide Basin)
- **Base Stats**: HP 90, ATK 65, DEF 75, SPD 55, NRG 65
- **Stat Growth**: HP +4, ATK +2, DEF +3, SPD +1, NRG +2
- **Role**: Tanky sustain fighter

| Level | Move | Type | Category | Power | NRG | Accuracy | Effect |
|---|---|---|---|---|---|---|---|
| 1 | Splash Shot | Water | Special | 40 | 20 | 100% | — |
| 8 | Soak Mist | Water | Special | 20 | 15 | 90% | Soak |
| 15 | Tide Crash | Water | Physical | 60 | 25 | 90% | — |
| 22 | Tidal Wave | Water | Special | 90 | 45 | 80% | — |

#### VOLTEON (Electric)
- **Trait**: Swift — Always acts first in Speed ties
- **Evolution Stone**: Thunder Stone (Tide Basin)
- **Base Stats**: HP 55, ATK 95, DEF 45, SPD 130, NRG 60
- **Stat Growth**: HP +1, ATK +4, DEF +1, SPD +5, NRG +2
- **Role**: Fastest glass cannon

| Level | Move | Type | Category | Power | NRG | Accuracy | Effect |
|---|---|---|---|---|---|---|---|
| 1 | Spark | Electric | Physical | 35 | 15 | 100% | — |
| 8 | Shock Dart | Electric | Special | 25 | 15 | 90% | Shock |
| 15 | Volt Rush | Electric | Physical | 65 | 30 | 90% | — |
| 22 | Thunderstrike | Electric | Special | 90 | 40 | 80% | — |

#### EMBERON (Fire)
- **Trait**: Volatile — Outgoing moves +15% damage; incoming damage +10%
- **Evolution Stone**: Fire Stone (Ember Crater)
- **Base Stats**: HP 60, ATK 130, DEF 40, SPD 80, NRG 50
- **Stat Growth**: HP +2, ATK +5, DEF +1, SPD +3, NRG +1
- **Role**: Highest raw damage, low DEF

| Level | Move | Type | Category | Power | NRG | Accuracy | Effect |
|---|---|---|---|---|---|---|---|
| 1 | Ember | Fire | Special | 40 | 20 | 100% | — |
| 8 | Scorch | Fire | Special | 30 | 20 | 90% | Burn |
| 15 | Fire Fang | Fire | Physical | 65 | 30 | 90% | — |
| 22 | Inferno | Fire | Special | 95 | 50 | 80% | — |

#### ERYLEON (Psychic)
- **Trait**: Psychic Veil — Immune to status effects from non-Psychic moves
- **Evolution Stone**: Sun Shard (Ember Crater)
- **Base Stats**: HP 55, ATK 55, DEF 50, SPD 110, NRG 110
- **Stat Growth**: HP +2, ATK +1, DEF +2, SPD +4, NRG +5
- **Role**: Special move powerhouse (highest NRG pool)

| Level | Move | Type | Category | Power | NRG | Accuracy | Effect |
|---|---|---|---|---|---|---|---|
| 1 | Mind Bolt | Psychic | Special | 40 | 20 | 100% | — |
| 8 | Confuse Ray | Psychic | Special | 10 | 15 | 90% | Confuse |
| 15 | Psy Beam | Psychic | Special | 70 | 35 | 90% | — |
| 22 | Mindbreak | Psychic | Special | 95 | 50 | 80% | — |

#### VENGEON (Rock)
- **Trait**: Dark Shroud — Psychic-type moves deal 0 damage to Vengeon
- **Evolution Stone**: Moon Shard (Verdant Vale)
- **Base Stats**: HP 95, ATK 55, DEF 90, SPD 45, NRG 70
- **Stat Growth**: HP +4, ATK +1, DEF +4, SPD +1, NRG +2
- **Role**: Wall; debuff and stall

| Level | Move | Type | Category | Power | NRG | Accuracy | Effect |
|---|---|---|---|---|---|---|---|
| 1 | Bone Crush | Rock | Physical | 40 | 15 | 100% | — |
| 8 | Wither Curse | Rock | Special | 15 | 15 | 90% | Shatter |
| 15 | Shadow Press | Rock | Physical | 65 | 30 | 90% | — |
| 22 | Dark Verdict | Rock | Special | 85 | 40 | 80% | Shatter |

#### GRASSEON (Grass)
- **Trait**: Thorn Guard — Attacker takes 5% of their current HP as damage on contact Physical moves
- **Evolution Stone**: Leaf Stone (Verdant Vale)
- **Base Stats**: HP 70, ATK 95, DEF 75, SPD 70, NRG 60
- **Stat Growth**: HP +3, ATK +3, DEF +3, SPD +2, NRG +2
- **Role**: Balanced; thorn-reflect

| Level | Move | Type | Category | Power | NRG | Accuracy | Effect |
|---|---|---|---|---|---|---|---|
| 1 | Vine Lash | Grass | Physical | 35 | 15 | 100% | — |
| 8 | Wilt Spore | Grass | Special | 20 | 15 | 90% | Wilt |
| 15 | Thorn Volley | Grass | Physical | 65 | 30 | 90% | — |
| 22 | Solar Rush | Grass | Special | 90 | 45 | 80% | — |

#### POLAREON (Ice)
- **Trait**: Frost Armor — First hit each battle reduced by 30% (one-time)
- **Evolution Stone**: Ice Stone (Frostpeak Zone)
- **Base Stats**: HP 65, ATK 90, DEF 55, SPD 75, NRG 100
- **Stat Growth**: HP +2, ATK +3, DEF +2, SPD +2, NRG +4
- **Role**: Control; status-heavy

| Level | Move | Type | Category | Power | NRG | Accuracy | Effect |
|---|---|---|---|---|---|---|---|
| 1 | Ice Shard | Ice | Special | 35 | 15 | 100% | — |
| 8 | Frost Bite | Ice | Special | 25 | 20 | 90% | Freeze |
| 15 | Blizzard Edge | Ice | Physical | 65 | 30 | 90% | — |
| 22 | Glacial Storm | Ice | Special | 90 | 45 | 80% | — |

#### LUXEON (Psychic)
- **Trait**: Fairy Charm — When Luxeon faints, next active ally healed 10% of their max HP
- **Evolution Stone**: Ribbon Shard (any zone, rare)
- **Base Stats**: HP 100, ATK 55, DEF 65, SPD 60, NRG 95
- **Stat Growth**: HP +4, ATK +1, DEF +2, SPD +2, NRG +4
- **Role**: Healer and disruptor; highest HP base

| Level | Move | Type | Category | Power | NRG | Accuracy | Effect |
|---|---|---|---|---|---|---|---|
| 1 | Sparkle Dust | Psychic | Special | 35 | 15 | 100% | — |
| 8 | Dazzle | Psychic | Special | 20 | 15 | 90% | Confuse |
| 15 | Glitter Blade | Psychic | Physical | 60 | 25 | 90% | — |
| 22 | Radiant Burst | Psychic | Special | 85 | 40 | 80% | — |

---

## 3. TYPE SYSTEM

### 3.1 The 7 Types
Fire · Water · Grass · Electric · Rock · Ice · Psychic

> Dark and Fairy are not full types — they exist only as trait flavors (Dark Shroud on Vengeon, Fairy Charm on Luxeon). Both those creatures use Rock/Psychic mechanically.

### 3.2 Effectiveness Chart

| Attacking Type | Super Effective (×1.5) | Not Very Effective (×0.67) |
|---|---|---|
| Fire | Grass, Ice | Water, Rock |
| Water | Fire, Rock | Grass, Electric |
| Grass | Water, Rock | Fire, Ice |
| Electric | Water | Rock |
| Rock | Fire | Water, Grass |
| Ice | Grass | Fire, Rock |
| Psychic | (none) | (none) |

- All other combinations are neutral (×1.0).
- No full immunities exist in the type chart — Dark Shroud (Vengeon trait) is the only pseudo-immunity, blocking Psychic to exactly 0.

---

## 4. BATTLE SYSTEM

### 4.1 Team Composition
- Player selects 1–2 Berryvolutions per Arena match (unevolved Berry cannot participate)
- Only 1 member is active at a time; switching costs the player's turn
- HP and NRG fully restored between matches (not between turns)

### 4.2 Turn Resolution Order
1. Collect player and AI actions
2. Switches resolve first (both sides simultaneously); if either side switched, turn ends — no moves resolve
3. Remaining moves sorted by effective SPD (with stat modifiers applied)
   - Volteon's **Swift** trait wins all Speed ties
   - Other ties: random
4. For each move in speed order:
   - Check if combatant can act (Freeze blocks; Confuse 30% self-hit chance)
   - Deduct NRG (Basic Attack restores +8 NRG instead of costing)
   - Accuracy check (random 0–100 vs move accuracy)
   - Calculate and apply damage
   - Apply move effects (status, stat mods)
   - Apply Thorn Guard reflection if Physical contact vs Grasseon
5. End-of-turn effects:
   - Hydration: Hypereon heals +8% maxHP
   - Burn tick: −5% maxHP; decrement burn duration
   - All other status durations decrement; expired statuses clear
   - Freeze: 50% thaw chance each turn
6. Check faint → Fairy Charm triggers if Luxeon just fainted → check win/loss/draw

### 4.3 Damage Formulas

**Physical Move**:
```
damage = (power / 50) × ATK × typeMultiplier × variance × max(0.2, 1 − DEF/200)
```

**Special Move**:
```
damage = (power / 50) × currentNRG × typeMultiplier × variance
```
Special moves use **current** NRG — they get weaker as NRG is spent.

**Shared**:
- Variance: `0.85 + random() × 0.15` (range 0.85–1.00)
- Critical hit: 10% chance → ×1.5 damage
- Minimum damage: 1 (except Dark Shroud → 0)

### 4.4 Basic Attack
| Field | Value |
|---|---|
| Category | Physical |
| Power | 20 |
| NRG cost | 0 (restores +8 NRG) |
| Accuracy | 100% |
| Availability | Always available regardless of NRG |

### 4.5 Energy (NRG) System
- Battles begin with NRG = base NRG stat
- Spending specials drains NRG; Basic Attack restores +8 NRG
- NRG capped at base NRG stat; cannot go below 0
- At 0 NRG, only Basic Attack and Switch are available

---

## 5. STATUS EFFECTS

| Status | Duration | Effect |
|---|---|---|
| Burn | 3 turns | −5% maxHP per turn end; ATK −20% |
| Freeze | Up to 3 turns | Cannot act; 50% thaw chance each turn |
| Shock | 2 turns | SPD halved |
| Soak | 3 turns | Fire moves against target deal ×0.5 damage |
| Wilt | 2 turns | DEF −10% |
| Shatter | 2 turns | DEF −25% |
| Confuse | 2 turns | 30% chance to hurt self (10% maxHP) instead of acting |

- Only **one** status at a time; a new status replaces the old
- **Psychic Veil** (Eryleon): immune to status from non-Psychic moves

---

## 6. TRAITS REFERENCE

| Trait | Holder | Trigger | Effect |
|---|---|---|---|
| Hydration | Hypereon | End of every turn | Heal 8% maxHP |
| Swift | Volteon | Speed tie resolution | Always acts first in ties |
| Volatile | Emberon | On dealing/receiving damage | +15% outgoing; +10% incoming |
| Psychic Veil | Eryleon | On status application | Immune to status from non-Psychic moves |
| Dark Shroud | Vengeon | On receiving Psychic moves | Psychic-type damage = 0 |
| Thorn Guard | Grasseon | On receiving Physical hit | Attacker takes 5% of their current HP |
| Frost Armor | Polareon | First hit received | That hit reduced by 30% (once per battle) |
| Fairy Charm | Luxeon | On fainting | Next active ally healed 10% of their maxHP |

---

## 7. LEVELING & XP

### 7.1 XP to Next Level
```
xpToNextLevel(level) = 20 + level × 10
```

| Current Level | XP Needed |
|---|---|
| 1 → 2 | 30 |
| 5 → 6 | 70 |
| 9 → 10 | 110 |
| 15 → 16 | 170 |
| 22 → 23 | 250 |
| 29 → 30 | 310 |

### 7.2 XP Awarded per Battle
```
xpBase = max(floor(avgEnemyLevel × 5), 10)
xpPerMember = xpBase + (win ? 20 : 0)
```
All participating team members receive equal XP.

### 7.3 Stat Formula
```
stat = base + growth × level
```

### 7.4 Level Caps
| Form | Cap |
|---|---|
| Unevolved Berry | 10 |
| All Berryvolutions | 30 |

### 7.5 Move Unlocks
Every Berryvolution learns moves at **levels 1, 8, 15, and 22** — 4 moves total.

---

## 8. EVOLUTION SYSTEM

### 8.1 Requirements
- Berry must be **level 10 or higher**
- Player must **hold the matching Evolution Stone** (consumed on use)
- Party must not already contain that evolved form (no duplicates)
- Only unevolved Berry (defId `'berry'`) can evolve

### 8.2 Stone → Evolution Mapping

| Stone | Evolves Into | Where to Find |
|---|---|---|
| Water Stone | Hypereon | Tide Basin |
| Thunder Stone | Volteon | Tide Basin |
| Fire Stone | Emberon | Ember Crater |
| Sun Shard | Eryleon | Ember Crater |
| Moon Shard | Vengeon | Verdant Vale |
| Leaf Stone | Grasseon | Verdant Vale |
| Ice Stone | Polareon | Frostpeak Zone |
| Ribbon Shard | Luxeon | Any zone (rare, 18% drop rate) |

### 8.3 What Changes on Evolution
- Level **retained** (does not reset)
- XP resets to 0
- Stats recomputed for evolved form at current level
- All moves unlocked up to current level applied immediately
- Stone consumed, instance ID preserved
- Permanent and irreversible

---

## 9. WORLD & ZONES

### 9.1 Zone Details

| Zone | Type | Berry Lvl Range | Berry Encounter | Stone Drops | Gold Range |
|---|---|---|---|---|---|
| Ember Crater | Fire | 3–7 | 10% | Fire Stone 15%, Sun Shard 12% | 10–25 |
| Tide Basin | Water | 3–7 | 10% | Water Stone 15%, Thunder Stone 12% | 10–25 |
| Verdant Vale | Grass | 5–9 | 10% | Leaf Stone 15%, Moon Shard 12% | 10–30 |
| Frostpeak Zone | Ice | 6–10 | 8% | Ice Stone 20% | 15–35 |
| Wandering Path | Mixed | 1–10 | 5% | Ribbon Shard 18% | 5–20 |

> Verdant Vale is the starting location.

### 9.2 Map Connections (Travel Graph)
- Ember Crater ↔ Verdant Vale
- Ember Crater ↔ Tide Basin
- Tide Basin ↔ Verdant Vale
- Verdant Vale ↔ Frostpeak Zone
- Verdant Vale ↔ Wandering Path
- Frostpeak Zone ↔ Wandering Path

### 9.3 Zone Search Mechanics
Each search costs **1 Stamina**. Roll order:
1. If roll < berryEncounterRate → wild Berry encounter
2. If roll < cumulative stone drop rate → stone drop
3. Separate 40% roll → Gold Dust (random in zone range)
4. Otherwise → nothing

---

## 10. WILD BERRY CAPTURE

### 10.1 Catch Rate Formula
```
catchChance = min(0.80, max(0.10, 0.70 × (1 − currentHP/maxHP) + 0.10))
```

| HP Remaining | Catch Rate |
|---|---|
| 100% | 10% |
| 75% | 27.5% |
| 50% | 45% |
| 25% | 62.5% |
| 0% (if possible) | 80% (cap) |

### 10.2 Capture Flow
1. Wild Berry appears during zone search
2. Optional battle to weaken it (increases catch rate)
3. Spend **1 Crystal Orb** to attempt capture
4. Success → Berry added to Party
5. Failure → wild Berry flees immediately (no retry in same encounter)

---

## 11. ARENA & RANKED LADDER

### 11.1 Tier Structure

| Tier | Points Required | AI | Team Size | AI Level Range |
|---|---|---|---|---|
| Bronze | 0 (start) | Rookie | 1 | 3–8 |
| Silver | 300 | Rookie | 1 | 3–8 |
| Gold | 600 | Trainer | 1 | 12–18 |
| Crystal | 900 | Trainer | 1 | 12–18 |
| Apex | 1400 + all 8 forms | Champion | 2 | 25–30 |

Apex requires **both** 1400 points **and** all 8 Berryvolutions collected.

### 11.2 Point Changes

| Outcome | Arena Points | Gold Dust | Stamina |
|---|---|---|---|
| Win | +25 | +50 | +3 |
| Loss | −15 | +25 | +1 |
| Draw | 0 | 0 | 0 |

### 11.3 AI Behavior

**Rookie** (Bronze/Silver):
- Picks a random move from NRG-affordable options
- Never switches
- Always includes Basic Attack in options

**Trainer** (Gold/Crystal):
- Checks if current type is disadvantaged (type multiplier < 0.8); switches to better matchup if available
- Picks super-effective moves first (highest power); falls back to highest-power neutral, then Basic Attack

**Champion** (Apex):
- Same smart switching as Trainer
- If target has no status and own NRG > 40%: prefers status-inflicting moves
- Uses Basic Attack if NRG < 20% of max NRG stat
- Otherwise picks highest expected damage (power × type multiplier)

---

## 12. ECONOMY & RESOURCES

### 12.1 Starting Resources (New Game)
| Resource | Starting Amount |
|---|---|
| Stamina | 10 |
| Crystal Orbs | 3 |
| Gold Dust | 50 |

### 12.2 Shop Prices
| Item | Cost |
|---|---|
| Crystal Orb | 30 Gold Dust |
| Stamina Potion | 25 Gold Dust (+5 Stamina) |

### 12.3 Resource Summary

| Resource | Earned From | Spent On |
|---|---|---|
| Crystal Orbs | Shop (30 GD) | Capturing wild Berry (1 per attempt) |
| Gold Dust | Arena wins/losses, zone searches | Shop purchases |
| Evolution Stones | Zone drops | Evolving Berry |
| Stamina | Arena (+3 win, +1 loss), Shop (+5) | Zone searches (−1 each) |
| Arena Points | Arena wins (+25) / losses (−15) | Tier advancement |
| XP | All battles | Leveling up |

---

## 13. SAVE SYSTEM

- **Storage**: `localStorage` key `popo_save`, schema version 1
- **Auto-save**: After every meaningful action (battle, capture, evolution, purchase)
- **Export**: Downloads `popo_save.json`
- **Import**: File upload with validation and version migration

### 13.1 Save Structure (schema)
```
SaveState {
  version: 1
  party: PartyMember[]
  inventory: { crystalOrbs, goldDust, stamina, evolutionStones }
  arena: { points, tier }
  berryLog: BerryvolutionId[]   // tracks all 8 collected
  tutorialComplete: boolean
  gameWon: boolean
  currentLocation: ZoneId      // default 'verdant-vale'
}
```

---

## 14. UI SCREENS & FLOW

```
Main Menu
├── Arena → Team Builder → Battle → Post-Battle Results
├── Ladder (Arena Rankings)
├── Explore → Zone Select → Encounter → Capture Result
├── Party → Berryvolution Detail
├── Berry Log (8-slot collection grid)
├── Shop
├── Settings
├── Tutorial (5-step, shown on first launch)
└── Victory (shown when game won)
```

### 14.1 Tutorial Steps
1. "Meet Berry" — introduces Berry companion
2. "Explore Zones" — explains zone searching and Stamina
3. "Evolve Berry" — explains Evolution Stones from Party screen
4. "Battle the Arena" — explains Team Builder and Arena tiers
5. "The Goal" — collect all 8, conquer Apex Arena

---

## 15. KEY FORMULAS REFERENCE

| Formula | Expression |
|---|---|
| Stat at level | `base + growth × level` |
| XP to next level | `20 + level × 10` |
| Physical damage | `(power/50) × ATK × typeMult × variance × max(0.2, 1 − DEF/200)` |
| Special damage | `(power/50) × currentNRG × typeMult × variance` |
| Catch chance | `min(0.80, max(0.10, 0.70 × (1 − currentHP/maxHP) + 0.10))` |
| Damage variance | `0.85 + random() × 0.15` |
| Critical hit | 10% chance → ×1.5 |
| Burn tick | 5% maxHP/turn |
| Hydration heal | 8% maxHP/turn |
| Thorn Guard reflect | 5% of attacker's current HP |
| Fairy Charm heal | 10% of next ally's maxHP |
| Frost Armor reduction | 30% off first hit |
| Volatile outgoing | +15% damage |
| Volatile incoming | +10% damage |
| Basic Attack NRG restore | +8 NRG |
| Confuse self-hit | 10% of maxHP |

---

## 16. NOTABLE IMPLEMENTATION DETAILS

1. **Special move damage uses currentNRG** (not base NRG stat) — specials weaken as NRG depletes.
2. **Physical defense**: percentage-based formula (`max(0.2, 1 − DEF/200)`) — minimum 20% damage always gets through.
3. **Critical hits**: 10% chance for ×1.5 (not mentioned in design docs; implemented in code).
4. **Evolution retains level** — originally designed to reset to 1; changed to prevent a progression wall.
5. **Ribbon Shard**: 18% drop rate (increased from 8% to reduce grind).
6. **Arena thresholds lowered**: Gold 600 (was 700), Crystal 900 (was 1200), Apex 1400 (was 2000).
7. **Consolation rewards** for Arena losses (25 GD, 1 Stamina) not in original design.
8. **Thorn Guard** reflects 5% of attacker's **current HP** (not 5% of damage dealt).
9. **Hypereon alias**: design doc calls the Water form "Aquareon" in one table; code uses "Hypereon" everywhere.

---

## 17. LORE & STORY

Berry is the player's starting companion — unevolved and weak, but the seed of every powerful form. The player's journey:

1. Receive Berry in the tutorial at Verdant Vale
2. Explore 5 zones to find Evolution Stones and wild Berries
3. Level Berry to 10, then evolve using a Stone
4. Capture more wild Berries; evolve all 8 forms
5. Battle through Bronze → Silver → Gold → Crystal → Apex Arena
6. Defeat Apex with all 8 Berryvolutions → **Victory**

There is no post-game loop; the Victory screen ends the run.

---

## 18. DEBUG TOOLS

Available in browser console via `window.__GAME_DEBUG`:
- `peekState()` — full game state snapshot
- `printState()` — pretty-prints state to console
- `summary()` — progress summary (tutorial, party, inventory, arena, berry log)
