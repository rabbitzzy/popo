// ============================================================================
// Core Enums
// ============================================================================

export type ElementType = 'Fire' | 'Water' | 'Grass' | 'Electric' | 'Rock' | 'Ice' | 'Psychic';

export type MoveCategory = 'Physical' | 'Special';

export type StatusEffect = 'Burn' | 'Freeze' | 'Shock' | 'Soak' | 'Wilt' | 'Shatter' | 'Confuse' | null;

export type ArenaTier = 'Bronze' | 'Silver' | 'Gold' | 'Crystal' | 'Apex';

export type EvolutionStone =
  | 'Water Stone'
  | 'Thunder Stone'
  | 'Fire Stone'
  | 'Sun Shard'
  | 'Moon Shard'
  | 'Leaf Stone'
  | 'Ice Stone'
  | 'Ribbon Shard';

export type BerryvolutionId =
  | 'hypereon'
  | 'volteon'
  | 'emberon'
  | 'eryleon'
  | 'vengeon'
  | 'grasseon'
  | 'polareon'
  | 'luxeon';

export type TraitId =
  | 'hydration'
  | 'swift'
  | 'volatile'
  | 'psychic-veil'
  | 'dark-shroud'
  | 'thorn-guard'
  | 'frost-armor'
  | 'fairy-charm';

export type ZoneId =
  // ── Original five ──────────────────────────────────────────────────────────
  | 'ember-crater'
  | 'tide-basin'
  | 'verdant-vale'
  | 'frostpeak-zone'
  | 'wandering-path'
  // ── Northern plateau ───────────────────────────────────────────────────────
  | 'ashfall-summit'    // fire/rock  — connected to Ember Crater + Stormcliff Ridge
  | 'crystal-spire'     // ice/psychic — peninsula tip: Ember Crater + Glacial Rift
  | 'stormcliff-ridge'  // electric   — bridge: Ashfall Summit ↔ Tide Basin
  // ── Eastern coast ──────────────────────────────────────────────────────────
  | 'coral-shallows'    // water      — chain: Tide Basin → Wandering Path
  // ── Central heartlands ─────────────────────────────────────────────────────
  | 'thornwood'         // grass      — triangle with Verdant Vale + Dusty Badlands
  | 'dusty-badlands'    // rock       — hub: Verdant Vale, Thornwood, Shadowmere Bog, Wandering Path
  // ── Western reaches ────────────────────────────────────────────────────────
  | 'glacial-rift'      // ice        — chain: Crystal Spire → Frostpeak Zone
  | 'shadowmere-bog'    // psychic    — links west chain to central + south
  // ── Southern basin ─────────────────────────────────────────────────────────
  | 'mossy-cavern'      // grass/rock — peninsula: Shadowmere Bog + Home
  | 'sunbaked-dunes'    // fire       — peninsula tip: Home + Wandering Path
  ;

/** Superset of ZoneId that includes non-explorable map locations (e.g. Home hub). */
export type LocationId = ZoneId | 'home';

export type QuestContext = 'explore' | 'battle' | 'evolve' | 'capture' | 'arena' | 'any';

export type Screen =
  | { id: 'main-menu' }
  | { id: 'tutorial' }
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
  | { id: 'victory' }
  | {
      id: 'trivia-quest';
      questContext: QuestContext;
      /** Screen to navigate to when the player answers correctly. */
      onPass: Screen;
      /** Screen to navigate to when the player answers wrong or skips. */
      onFail: Screen;
      /** Short label shown on the quest card, e.g. "Before you search Frostpeak Zone…" */
      actionLabel: string;
    };

// ============================================================================
// Move System
// ============================================================================

export interface MoveDefinition {
  id: string;
  name: string;
  type: ElementType;
  category: MoveCategory;
  power: number; // 10–100
  nrgCost: number; // 0 = Basic Attack
  accuracy: 80 | 90 | 100;
  effect?: {
    status?: StatusEffect;
    statMod?: { stat: 'ATK' | 'DEF' | 'SPD' | 'NRG'; delta: number };
  };
  unlockLevel: 1 | 8 | 15 | 22;
}

// ============================================================================
// Berryvolution Data
// ============================================================================

export interface BerryvolutionDef {
  id: BerryvolutionId;
  name: string;
  type: ElementType;
  baseStats: { hp: number; atk: number; def: number; spd: number; nrg: number };
  statGrowth: { hp: number; atk: number; def: number; spd: number; nrg: number };
  trait: TraitId;
  moves: [MoveDefinition, MoveDefinition, MoveDefinition, MoveDefinition];
  evolutionStone: EvolutionStone;
  spriteUrl: string;
}

export interface BerryDef {
  id: 'berry';
  name: 'Berry';
  baseStats: { hp: number; atk: number; def: number; spd: number; nrg: number };
  statGrowth: { hp: number; atk: number; def: number; spd: number; nrg: number };
  levelCap: number;
  spriteUrl: string;
}

// ============================================================================
// Party & Instance Data
// ============================================================================

export interface PartyMember {
  instanceId: string; // uuid — distinguishes two Berrys
  defId: BerryvolutionId | 'berry';
  /** Cosmetic berry skin variant — only meaningful when defId === 'berry' */
  skinId?: string;
  level: number;
  xp: number;
  currentStats: { hp: number; atk: number; def: number; spd: number; nrg: number };
  maxHp: number;
  /** Persistent HP between battles — restored to maxHp at Home. */
  currentHp: number;
  /** Persistent NRG between battles — restored to currentStats.nrg at Home. */
  currentNrg: number;
  unlockedMoveIds: string[];
}

// ============================================================================
// Battle System
// ============================================================================

export interface CombatantState {
  partyMember: PartyMember;
  currentHp: number;
  currentNrg: number;
  status: StatusEffect;
  statusTurnsLeft: number;
  traitState: Record<string, unknown>; // trait-specific bookkeeping
  statModifiers: {
    atk: number;
    def: number;
    spd: number;
  };
}

export type BattlePhase = 'action-select' | 'resolving' | 'post-faint' | 'ended';

export type BattleOutcome = 'win' | 'loss' | 'draw' | null;

export type BattleAction =
  | { type: 'move'; moveId: string }
  | { type: 'switch'; toInstanceId: string };

export interface BattleState {
  playerTeam: CombatantState[];
  aiTeam: CombatantState[];
  activePlayerIndex: number;
  activeAiIndex: number;
  turn: number;
  log: string[];
  phase: BattlePhase;
  outcome: BattleOutcome;
  aiDifficulty: 'Rookie' | 'Trainer' | 'Champion';
}

export interface BattleResult {
  outcome: 'win' | 'loss' | 'draw';
  xpEarned: Partial<Record<string, number>>; // instanceId → xp
  arenaPointsChange: number;
  resourcesEarned: {
    goldDust: number;
    stamina: number;
  };
}

// ============================================================================
// Zone & Exploration
// ============================================================================

export interface ZoneDef {
  id: ZoneId;
  name: string;
  berryEncounterRate: number; // 0.05–0.10
  wildBerryLevelRange: [min: number, max: number];
  stoneDrops: Array<{
    stone: EvolutionStone;
    dropRate: number;
  }>;
  goldDustRange: [min: number, max: number];
  /** Milliseconds before this zone can be searched again after an exploration. */
  exploreCooldownMs: number;
}

export type SearchResult =
  | { type: 'encounter' }
  | { type: 'stone'; stone: EvolutionStone }
  | { type: 'gold'; amount: number }
  | { type: 'nothing' };

// ============================================================================
// Player Save State
// ============================================================================

export interface SaveState {
  version: number;
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
  berryLog: BerryvolutionId[];
  tutorialComplete: boolean;
  gameWon: boolean;
  currentLocation: LocationId;
  /** Unix timestamp (ms) of the last exploration per zone — used for cooldown. */
  zoneLastExploredAt: Partial<Record<ZoneId, number>>;
}

// ============================================================================
// Trait Definitions
// ============================================================================

export interface TraitDef {
  id: TraitId;
  name: string;
  description: string;
  heldBy: BerryvolutionId;
}
