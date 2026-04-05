# Berry's Evolution — Technical Specification

Derived from: `PRD.md` (current), `DESIGN.md` (current)
Status: Awaiting human review

---

## 1. Overview

Berry's Evolution is a single-page web game. All game logic runs client-side in
the browser. There is no backend in v1 — state is persisted in `localStorage`.

The architecture is deliberately simple: a pure TypeScript game engine with a
thin React rendering layer on top. The engine owns all state and logic; React
only renders what the engine exposes.

---

## 2. Tech Stack

| Layer         | Choice              | Reason                                              |
|---------------|---------------------|-----------------------------------------------------|
| Language      | TypeScript          | Type safety for complex game state                  |
| UI framework  | React               | Component model suits screen-per-screen UI map      |
| Build tool    | Vite                | Fast dev server; zero-config for a web game         |
| Styling       | CSS Modules         | Scoped styles; no runtime overhead                  |
| Persistence   | localStorage        | No backend required in v1                           |
| Testing       | Vitest              | Co-located with Vite; fast unit tests for engine    |
| Sprites       | PNG spritesheets    | Static pixel art; imported as assets                |

No external game engine (Phaser, PixiJS, etc.) — the game is turn-based with
simple 2D rendering, so a game engine is unnecessary overhead.

---

## 3. Data Models

All types live in `src/data/types.ts`. Static game data (Berryvolutions, moves,
zones) lives in `src/data/` as plain TypeScript constant files.

### 3.1 Core Enums

```ts
type ElementType = 'Fire' | 'Water' | 'Grass' | 'Electric' | 'Rock' | 'Ice' | 'Psychic';

type MoveCategory = 'Physical' | 'Special';

type StatusEffect = 'Burn' | 'Freeze' | 'Shock' | 'Soak' | 'Wilt' | 'Shatter' | 'Confuse' | null;

type ArenaTier = 'Bronze' | 'Silver' | 'Gold' | 'Crystal' | 'Apex';

type EvolutionStone =
  | 'Water Stone' | 'Thunder Stone' | 'Fire Stone' | 'Sun Shard'
  | 'Moon Shard' | 'Leaf Stone' | 'Ice Stone' | 'Ribbon Shard';

type BerryvolutionId =
  | 'hypereon' | 'volteon' | 'emberon' | 'eryleon'
  | 'vengeon' | 'grasseon' | 'polareon' | 'luxeon';
```

### 3.2 Static Berryvolution Definition

Immutable data record per form. Stored in `src/data/berryvolutions.ts`.

```ts
interface MoveDefinition {
  id: string;
  name: string;
  type: ElementType;
  category: MoveCategory;
  power: number;          // 10–100
  nrgCost: number;        // 0 = Basic Attack
  accuracy: 80 | 90 | 100;
  effect?: {
    status?: StatusEffect;
    statMod?: { stat: 'ATK' | 'DEF' | 'SPD' | 'NRG'; delta: number };
  };
  unlockLevel: 1 | 8 | 15 | 22;
}

interface BerryvolutionDef {
  id: BerryvolutionId;
  name: string;
  type: ElementType;
  baseStats: { hp: number; atk: number; def: number; spd: number; nrg: number };
  statGrowth: { hp: number; atk: number; def: number; spd: number; nrg: number }; // flat per level
  trait: TraitId;
  moves: [MoveDefinition, MoveDefinition, MoveDefinition, MoveDefinition];
  evolutionStone: EvolutionStone;
  spriteUrl: string;
}
```

### 3.3 Berry (Unevolved) Definition

```ts
interface BerryDef {
  id: 'berry';
  name: 'Berry';
  baseStats: { hp: 45; atk: 40; def: 40; spd: 45; nrg: 30 };
  statGrowth: { hp: 2; atk: 2; def: 2; spd: 2; nrg: 1 };
  levelCap: 10;
  spriteUrl: string;
}
```

### 3.4 Party Member (Live Instance)

Mutable runtime record for each owned Berry or Berryvolution.

```ts
interface PartyMember {
  instanceId: string;           // uuid — distinguishes two Berrys
  defId: BerryvolutionId | 'berry';
  level: number;
  xp: number;
  currentStats: { hp: number; atk: number; def: number; spd: number; nrg: number };
  maxHp: number;                // computed from base + growth * level
  unlockedMoveIds: string[];    // grows as level increases
}
```

### 3.5 Battle State

Ephemeral — never persisted. Lives only during an active match.

```ts
interface CombatantState {
  partyMember: PartyMember;     // reference to Party member
  currentHp: number;
  currentNrg: number;
  status: StatusEffect;
  statusTurnsLeft: number;
  traitState: Record<string, unknown>; // trait-specific bookkeeping (e.g. Frost Armor used)
  statModifiers: {              // temporary in-battle stat multipliers
    atk: number; def: number; spd: number;
  };
}

interface BattleState {
  playerTeam: CombatantState[];
  aiTeam: CombatantState[];
  activePlayerIndex: number;
  activeAiIndex: number;
  turn: number;
  log: string[];                // human-readable action log for display
  phase: 'action-select' | 'resolving' | 'post-faint' | 'ended';
  outcome: 'win' | 'loss' | 'draw' | null;
}
```

### 3.6 Player Save State

Persisted to `localStorage` under key `popo_save`.

```ts
interface SaveState {
  version: number;              // for future migration
  party: PartyMember[];
  inventory: {
    crystalOrbs: number;
    goldDust: number;
    stamina: number;
    evolutionStones: Partial<Record<EvolutionStone, number>>;
  };
  arena: {
    points: number;
    tier: ArenaTier;
  };
  berryLog: BerryvolutionId[];  // which forms have been collected
  tutorialComplete: boolean;
  gameWon: boolean;
}
```

### 3.7 Zone Definition

```ts
interface ZoneDef {
  id: string;
  name: string;
  berryEncounterRate: number;      // 0.05–0.10
  wildBerryLevelRange: [min: number, max: number];
  stoneDrops: Array<{
    stone: EvolutionStone;
    dropRate: number;
  }>;
  goldDustRange: [min: number, max: number];
}
```

### 3.8 Wild Berry Level Ranges per Zone

| Zone           | Level Range |
|----------------|-------------|
| Ember Crater   | 3 – 7       |
| Tide Basin     | 3 – 7       |
| Verdant Vale   | 5 – 9       |
| Frostpeak Zone | 6 – 10      |
| Wandering Path | 1 – 10      |

---

## 4. Component Architecture

```
src/
├── data/
│   ├── types.ts               # All enums and interfaces
│   ├── berryvolutions.ts      # Static BerryvolutionDef records (all 8)
│   ├── berry.ts               # BerryDef
│   ├── moves.ts               # All MoveDefinition records
│   ├── zones.ts               # All ZoneDef records
│   └── typeChart.ts           # Effectiveness lookup table
│
├── engine/
│   ├── battle.ts              # Turn resolution, damage, status, traits
│   ├── ai.ts                  # Rookie / Trainer / Champion AI logic
│   ├── evolution.ts           # Evolution gate checks and application
│   ├── leveling.ts            # XP thresholds, level-up, move unlocks
│   ├── exploration.ts         # Zone search, encounter roll, drop roll
│   ├── capture.ts             # Catch rate formula
│   └── save.ts                # localStorage read/write/migrate
│
├── store/
│   └── gameStore.ts           # Global state (Zustand) — SaveState + BattleState
│
├── screens/
│   ├── MainMenu.tsx
│   ├── Arena/
│   │   ├── TeamBuilder.tsx
│   │   ├── BattleScreen.tsx
│   │   └── PostBattle.tsx
│   ├── Explore/
│   │   ├── ZoneSelect.tsx
│   │   └── EncounterScreen.tsx
│   ├── Party/
│   │   ├── PartyScreen.tsx
│   │   └── BerryvolutionDetail.tsx
│   ├── BerryLog.tsx
│   ├── Shop.tsx
│   └── Settings.tsx
│
├── components/               # Shared UI primitives
│   ├── StatBar.tsx
│   ├── TypeBadge.tsx
│   ├── MoveCard.tsx
│   ├── Sprite.tsx
│   └── ConfirmDialog.tsx
│
└── assets/
    └── sprites/              # PNG spritesheets per Berryvolution + Berry
```

State management: **Zustand** single store. Engine functions are pure — they
take state in and return new state out. The store calls engine functions and
applies results. React components read from the store and dispatch actions.

---

## 5. Key Algorithms

### 5.1 Damage Calculation

Directly from DESIGN.md §5.2:

```ts
function calcDamage(
  move: MoveDefinition,
  attacker: CombatantState,
  defender: CombatantState,
  typeChart: TypeChart,
): number {
  const typeMultiplier = typeChart.multiplier(move.type, defender.partyMember.def /* type */);
  const variance = 0.85 + Math.random() * 0.15;

  let raw: number;
  if (move.category === 'Physical') {
    const atkStat = attacker.currentStats.atk * attacker.statModifiers.atk;
    const defStat = defender.currentStats.def * defender.statModifiers.def;
    raw = (move.power / 50) * atkStat * typeMultiplier * variance - defStat * 0.5;
  } else {
    const nrgStat = attacker.currentNrg;
    raw = (move.power / 50) * nrgStat * typeMultiplier * variance;
  }

  // Volatile trait: +15% outgoing
  if (attacker.partyMember.defId === 'emberon') raw *= 1.15;
  // Volatile trait: +10% incoming to Emberon
  if (defender.partyMember.defId === 'emberon') raw *= 1.10;
  // Dark Shroud: Psychic deals 0 to Vengeon
  if (defender.partyMember.defId === 'vengeon' && move.type === 'Psychic') return 0;
  // Frost Armor: first hit reduced 30%
  if (defender.partyMember.defId === 'polareon' && !defender.traitState.frostArmorUsed) {
    raw *= 0.70;
    defender.traitState.frostArmorUsed = true;
  }

  return Math.max(1, Math.floor(raw));
}
```

### 5.2 Type Effectiveness Table

```ts
// typeChart.ts — multiplier(attackType, defenderType)
// Returns 1.5 | 1.0 | 0.67
const SUPER_EFFECTIVE: Record<ElementType, ElementType[]> = {
  Fire:     ['Grass', 'Ice'],
  Water:    ['Fire', 'Rock'],
  Grass:    ['Water', 'Rock'],
  Electric: ['Water'],
  Rock:     ['Fire'],        // Rock strong vs Fire (per design)
  Ice:      ['Grass'],
  Psychic:  [],              // trait-only interactions; no chart entry
};
const NOT_EFFECTIVE: Record<ElementType, ElementType[]> = {
  Fire:     ['Water', 'Rock'],
  Water:    ['Grass', 'Electric'],
  Grass:    ['Fire', 'Ice'],
  Electric: ['Rock'],        // Ground mapped to Rock in this 7-type system
  Rock:     ['Water', 'Grass'],
  Ice:      ['Fire', 'Rock'],
  Psychic:  [],
};
```

### 5.3 Turn Resolution Order

```
1. Collect both actions (player choice + AI choice)
2. Process switches first (both sides, simultaneous)
3. Sort remaining moves by effective SPD (statModifiers.spd applied):
   - Volteon (Swift trait) always wins ties
   - Other ties: random
4. For each move in order:
   a. Check accuracy roll
   b. Check Freeze / Confuse self-hit
   c. Apply damage via calcDamage()
   d. Apply move.effect (status, stat mod)
   e. Apply Thorn Guard if Physical contact
5. End-of-turn effects (all active combatants):
   a. Hydration: +8% maxHp to Aquareon
   b. Burn tick: -5% maxHp, applied to burned target
   c. Decrement all status counters; clear expired
6. Check faint conditions
7. Trigger Fairy Charm if Luxeon just fainted
8. Check win/loss/draw
```

### 5.4 XP System

```
xpToNextLevel(level) = 20 + level * 10

xpAwarded(battle) = {
  base: max(floor(avgEnemyLevel × 5), 10)   // scales with enemy strength
  winBonus: +20                              // added only on victory
}

// Examples:
//   vs level 5 enemy (lose):  max(25, 10) = 25 XP
//   vs level 5 enemy (win):   25 + 20     = 45 XP
//   vs level 15 enemy (win):  75 + 20     = 95 XP
//   vs level 30 enemy (win):  150 + 20    = 170 XP
```

Stat growth per level is flat, defined per Berryvolution in `statGrowth`.
Applied on level-up: `currentStats[stat] += def.statGrowth[stat]`.

### 5.5 Catch Rate Formula

Directly from DESIGN.md §8.2:

```ts
function catchChance(currentHp: number, maxHp: number): number {
  return Math.min(0.80, Math.max(0.10, 0.70 * (1 - currentHp / maxHp) + 0.10));
}
```

### 5.6 Zone Search Roll

```ts
function searchZone(zone: ZoneDef): SearchResult {
  const roll = Math.random();
  if (roll < zone.berryEncounterRate) return { type: 'encounter' };

  let cursor = zone.berryEncounterRate;
  for (const drop of zone.stoneDrops) {
    cursor += drop.dropRate;
    if (roll < cursor) return { type: 'stone', stone: drop.stone };
  }

  const goldRoll = Math.random();
  if (goldRoll < 0.40) {
    const gold = randInt(zone.goldDustRange[0], zone.goldDustRange[1]);
    return { type: 'gold', amount: gold };
  }

  return { type: 'nothing' };
}
```

### 5.7 AI Behavior

```ts
// Rookie: random move from available (non-zero NRG if special, or basic attack)
// Trainer:
//   1. If current type is disadvantaged vs player active → switch to best available type
//   2. Else pick highest-power super-effective move; fallback to highest-power neutral
// Champion:
//   1. Same switch logic as Trainer
//   2. Prefer status moves if target has no status and NRG > 40%
//   3. Manage NRG: use Basic Attack if NRG < 20% of max
//   4. Otherwise pick highest expected damage move (power * type_multiplier)
```

---

## 6. Screen State & Navigation

Navigation is state-driven, not URL-driven. A top-level `screen` field in the
store determines which screen component renders.

```ts
type Screen =
  | { id: 'main-menu' }
  | { id: 'team-builder' }
  | { id: 'battle'; battleState: BattleState }
  | { id: 'post-battle'; result: BattleResult }
  | { id: 'ladder' }
  | { id: 'zone-select' }
  | { id: 'encounter'; zone: ZoneDef; wildBerry: PartyMember }
  | { id: 'party' }
  | { id: 'berryvolution-detail'; instanceId: string }
  | { id: 'berry-log' }
  | { id: 'shop' }
  | { id: 'settings' }
  | { id: 'victory' };
```

---

## 7. Persistence

Save/load on every meaningful state mutation (after battle, after purchase,
after capture, after evolution). No auto-save timer.

```ts
// save.ts
const SAVE_KEY = 'popo_save';
const SAVE_VERSION = 1;

function save(state: SaveState): void {
  localStorage.setItem(SAVE_KEY, JSON.stringify({ version: SAVE_VERSION, ...state }));
}

function load(): SaveState | null {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return null;
  const parsed = JSON.parse(raw);
  if (parsed.version !== SAVE_VERSION) return migrate(parsed);
  return parsed;
}
```

---

## 8. Win Condition Check

```ts
function checkWinCondition(save: SaveState): boolean {
  const allCollected = ALL_BERRYVOLUTION_IDS.every(id => save.berryLog.includes(id));
  const apexDefeated = save.gameWon; // set on Apex win
  return allCollected && apexDefeated;
}
```

Victory screen is shown once and `save.gameWon` is set. No post-game loop.

---

## 9. Game Data Constants

All values below live in `src/data/config.ts` as exported constants so they
can be tuned without touching engine logic.

### 9.1 Berryvolution Base Stats & Growth (at Level 1)

Growth is flat per level, applied on each level-up. By level 30 stats
roughly double from their base.

| Form      | HP  | ATK | DEF | SPD | NRG | HP+ | ATK+ | DEF+ | SPD+ | NRG+ |
|-----------|-----|-----|-----|-----|-----|-----|------|------|------|------|
| Aquareon  | 120 |  65 |  95 |  55 |  65 |   5 |    2 |    4 |    1 |    2 |
| Volteon   |  60 |  95 |  50 | 130 |  60 |   1 |    4 |    1 |    5 |    2 |
| Emberon   |  70 | 130 |  45 |  80 |  50 |   2 |    5 |    1 |    3 |    1 |
| Eryleon   |  65 |  55 |  60 | 110 | 110 |   2 |    1 |    2 |    4 |    5 |
| Vengeon   | 115 |  55 | 110 |  45 |  70 |   5 |    1 |    5 |    1 |    2 |
| Grasseon  |  85 |  95 |  90 |  70 |  60 |   3 |    3 |    3 |    2 |    2 |
| Polareon  |  75 |  90 |  65 |  75 | 100 |   2 |    3 |    2 |    2 |    4 |
| Luxeon    | 130 |  55 |  75 |  60 |  95 |   5 |    1 |    2 |    2 |    4 |

> `HP+` through `NRG+` are the flat growth values added per level.
> All values live in `config.ts` — adjust freely without touching engine code.

### 9.2 Move Pools

Each Berryvolution has 4 moves unlocked at levels 1, 8, 15, 22, plus the
shared Basic Attack (always available, 0 NRG cost, Physical, power 20,
100% accuracy). All move data lives in `src/data/moves.ts`.

> Vengeon and Luxeon use Rock and Psychic typed moves respectively, since Dark
> and Fairy are not full types in the 7-type chart (DESIGN.md §2.1).

**Aquareon**
| Level | Name        | Type  | Cat      | Pwr | NRG | Acc | Effect |
|-------|-------------|-------|----------|-----|-----|-----|--------|
| 1     | Splash Shot | Water | Special  |  40 |  20 | 100 | —      |
| 8     | Soak Mist   | Water | Special  |  20 |  15 |  90 | Soak   |
| 15    | Tide Crash  | Water | Physical |  60 |  25 |  90 | —      |
| 22    | Tidal Wave  | Water | Special  |  90 |  45 |  80 | —      |

**Volteon**
| Level | Name         | Type     | Cat      | Pwr | NRG | Acc | Effect |
|-------|--------------|----------|----------|-----|-----|-----|--------|
| 1     | Spark        | Electric | Physical |  35 |  15 | 100 | —      |
| 8     | Shock Dart   | Electric | Special  |  25 |  15 |  90 | Shock  |
| 15    | Volt Rush    | Electric | Physical |  65 |  30 |  90 | —      |
| 22    | Thunderstrike| Electric | Special  |  90 |  40 |  80 | —      |

**Emberon**
| Level | Name      | Type | Cat      | Pwr | NRG | Acc | Effect |
|-------|-----------|------|----------|-----|-----|-----|--------|
| 1     | Ember     | Fire | Special  |  40 |  20 | 100 | —      |
| 8     | Scorch    | Fire | Special  |  30 |  20 |  90 | Burn   |
| 15    | Fire Fang | Fire | Physical |  65 |  30 |  90 | —      |
| 22    | Inferno   | Fire | Special  |  95 |  50 |  80 | —      |

**Eryleon**
| Level | Name       | Type    | Cat     | Pwr | NRG | Acc | Effect  |
|-------|------------|---------|---------|-----|-----|-----|---------|
| 1     | Mind Bolt  | Psychic | Special |  40 |  20 | 100 | —       |
| 8     | Confuse Ray| Psychic | Special |  10 |  15 |  90 | Confuse |
| 15    | Psy Beam   | Psychic | Special |  70 |  35 |  90 | —       |
| 22    | Mindbreak  | Psychic | Special |  95 |  50 |  80 | —       |

**Vengeon**
| Level | Name         | Type | Cat      | Pwr | NRG | Acc | Effect  |
|-------|--------------|------|----------|-----|-----|-----|---------|
| 1     | Bone Crush   | Rock | Physical |  40 |  15 | 100 | —       |
| 8     | Wither Curse | Rock | Special  |  15 |  15 |  90 | Shatter |
| 15    | Shadow Press | Rock | Physical |  65 |  30 |  90 | —       |
| 22    | Dark Verdict | Rock | Special  |  85 |  40 |  80 | Shatter |

**Grasseon**
| Level | Name         | Type  | Cat      | Pwr | NRG | Acc | Effect |
|-------|--------------|-------|----------|-----|-----|-----|--------|
| 1     | Vine Lash    | Grass | Physical |  35 |  15 | 100 | —      |
| 8     | Wilt Spore   | Grass | Special  |  20 |  15 |  90 | Wilt   |
| 15    | Thorn Volley | Grass | Physical |  65 |  30 |  90 | —      |
| 22    | Solar Rush   | Grass | Special  |  90 |  45 |  80 | —      |

**Polareon**
| Level | Name          | Type | Cat      | Pwr | NRG | Acc | Effect |
|-------|---------------|------|----------|-----|-----|-----|--------|
| 1     | Ice Shard     | Ice  | Special  |  35 |  15 | 100 | —      |
| 8     | Frost Bite    | Ice  | Special  |  25 |  20 |  90 | Freeze |
| 15    | Blizzard Edge | Ice  | Physical |  65 |  30 |  90 | —      |
| 22    | Glacial Storm | Ice  | Special  |  90 |  45 |  80 | —      |

**Luxeon**
| Level | Name          | Type    | Cat      | Pwr | NRG | Acc | Effect  |
|-------|---------------|---------|----------|-----|-----|-----|---------|
| 1     | Sparkle Dust  | Psychic | Special  |  35 |  15 | 100 | —       |
| 8     | Dazzle        | Psychic | Special  |  20 |  15 |  90 | Confuse |
| 15    | Glitter Blade | Psychic | Physical |  60 |  25 |  90 | —       |
| 22    | Radiant Burst | Psychic | Special  |  85 |  40 |  80 | —       |

### 9.3 Starting Resources (New Game)

```ts
// config.ts
export const STARTING_RESOURCES = {
  stamina:      10,
  crystalOrbs:   3,
  goldDust:     50,
};
```

### 9.4 Shop Prices

```ts
// config.ts
export const SHOP_PRICES = {
  crystalOrb:     30,   // Gold Dust per orb
  staminaPotion:  25,   // Gold Dust per potion (+5 Stamina)
  staminaPotionAmount: 5,
};
```

### 9.5 XP and Economy Constants

```ts
// config.ts
export const XP_CONFIG = {
  xpPerEnemyLevel: 5,   // multiplied by avg enemy level for base XP
  xpBaseMin:      10,   // floor so even trivial fights give some XP
  winBonus:       20,   // added on top when winning
  xpToNextLevel: (level: number) => 20 + level * 10,
};

export const ARENA_REWARDS = {
  winGoldDust:   15,
  winStamina:     3,
  winArenaPoints: 25,
  lossArenaPoints: -15,
  drawArenaPoints:  0,
};

export const ZONE_REWARDS = {
  encounterStamina: 1,  // refunded on any encounter result
  goldDustRange: {
    'ember-crater':   [10, 25],
    'tide-basin':     [10, 25],
    'verdant-vale':   [10, 30],
    'frostpeak-zone': [15, 35],
    'wandering-path': [5,  20],
  } as Record<string, [number, number]>,
};
```

---

## 10. Save Export / Import

Save state can be exported as a JSON file download and re-imported for backup.
This is a pure client-side operation — no server involved.

```ts
// save.ts
function exportSave(state: SaveState): void {
  const json = JSON.stringify({ version: SAVE_VERSION, ...state }, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'popo_save.json';
  a.click();
  URL.revokeObjectURL(url);
}

function importSave(file: File): Promise<SaveState> {
  return file.text().then(text => {
    const parsed = JSON.parse(text);
    if (!parsed.version) throw new Error('Invalid save file');
    if (parsed.version !== SAVE_VERSION) return migrate(parsed);
    return parsed as SaveState;
  });
}
```

Export/import buttons live in the Settings screen.
