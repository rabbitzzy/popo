import { ZoneDef, ZoneId } from './types'

// ============================================================================
// Cooldown reference (edit these constants to tune all zone cooldowns at once)
// ============================================================================
// All values are in milliseconds.  1 min = 60_000 ms.
const CD = {
  starter: 5  * 60_000,   //  5 min — entry-level zones near Home
  easy:    8  * 60_000,   //  8 min — common mid-game zones
  medium:  12 * 60_000,   // 12 min — harder mid-game zones
  hard:    18 * 60_000,   // 18 min — late-game zones
  elite:   25 * 60_000,   // 25 min — end-game / peninsula tips
} as const

// ============================================================================
// ── ORIGINAL FIVE ────────────────────────────────────────────────────────────
// ============================================================================

export const EMBER_CRATER: ZoneDef = {
  id: 'ember-crater',
  name: 'Ember Crater',
  berryEncounterRate: 0.10,
  wildBerryLevelRange: [3, 7],
  stoneDrops: [
    { stone: 'Fire Stone', dropRate: 0.15 },
    { stone: 'Sun Shard',  dropRate: 0.12 },
  ],
  goldDustRange: [10, 25],
  exploreCooldownMs: CD.easy,
}

export const TIDE_BASIN: ZoneDef = {
  id: 'tide-basin',
  name: 'Tide Basin',
  berryEncounterRate: 0.10,
  wildBerryLevelRange: [3, 7],
  stoneDrops: [
    { stone: 'Water Stone',   dropRate: 0.15 },
    { stone: 'Thunder Stone', dropRate: 0.12 },
  ],
  goldDustRange: [10, 25],
  exploreCooldownMs: CD.easy,
}

export const VERDANT_VALE: ZoneDef = {
  id: 'verdant-vale',
  name: 'Verdant Vale',
  berryEncounterRate: 0.10,
  wildBerryLevelRange: [5, 9],
  stoneDrops: [
    { stone: 'Leaf Stone', dropRate: 0.15 },
    { stone: 'Moon Shard', dropRate: 0.12 },
  ],
  goldDustRange: [10, 30],
  exploreCooldownMs: CD.medium,
}

export const FROSTPEAK_ZONE: ZoneDef = {
  id: 'frostpeak-zone',
  name: 'Frostpeak Zone',
  berryEncounterRate: 0.08,
  wildBerryLevelRange: [6, 10],
  stoneDrops: [
    { stone: 'Ice Stone', dropRate: 0.20 },
  ],
  goldDustRange: [15, 35],
  exploreCooldownMs: CD.medium,
}

export const WANDERING_PATH: ZoneDef = {
  id: 'wandering-path',
  name: 'Wandering Path',
  berryEncounterRate: 0.05,
  wildBerryLevelRange: [1, 10],
  stoneDrops: [
    { stone: 'Ribbon Shard', dropRate: 0.18 },
  ],
  goldDustRange: [5, 20],
  exploreCooldownMs: CD.starter,
}

// ============================================================================
// ── NORTHERN PLATEAU ─────────────────────────────────────────────────────────
// ============================================================================

/** High-altitude caldera east of Ember Crater. Connects to Stormcliff Ridge. */
export const ASHFALL_SUMMIT: ZoneDef = {
  id: 'ashfall-summit',
  name: 'Ashfall Summit',
  berryEncounterRate: 0.07,
  wildBerryLevelRange: [7, 10],
  stoneDrops: [
    { stone: 'Fire Stone', dropRate: 0.18 },
    { stone: 'Sun Shard',  dropRate: 0.10 },
  ],
  goldDustRange: [20, 40],
  exploreCooldownMs: CD.hard,
}

/** Icy peak jutting north-west — peninsula tip reachable only via Ember Crater or Glacial Rift. */
export const CRYSTAL_SPIRE: ZoneDef = {
  id: 'crystal-spire',
  name: 'Crystal Spire',
  berryEncounterRate: 0.06,
  wildBerryLevelRange: [8, 10],
  stoneDrops: [
    { stone: 'Ice Stone',  dropRate: 0.20 },
    { stone: 'Moon Shard', dropRate: 0.12 },
  ],
  goldDustRange: [25, 45],
  exploreCooldownMs: CD.elite,
}

/** Clifftop bridge between Ashfall Summit and the eastern coast. Storm-battered. */
export const STORMCLIFF_RIDGE: ZoneDef = {
  id: 'stormcliff-ridge',
  name: 'Stormcliff Ridge',
  berryEncounterRate: 0.09,
  wildBerryLevelRange: [5, 9],
  stoneDrops: [
    { stone: 'Thunder Stone', dropRate: 0.20 },
  ],
  goldDustRange: [15, 30],
  exploreCooldownMs: CD.medium,
}

// ============================================================================
// ── EASTERN COAST ─────────────────────────────────────────────────────────────
// ============================================================================

/** Shallow reef south of Tide Basin. Entry-level water zone, gentle encounter rate. */
export const CORAL_SHALLOWS: ZoneDef = {
  id: 'coral-shallows',
  name: 'Coral Shallows',
  berryEncounterRate: 0.12,
  wildBerryLevelRange: [2, 6],
  stoneDrops: [
    { stone: 'Water Stone', dropRate: 0.16 },
  ],
  goldDustRange: [8, 20],
  exploreCooldownMs: CD.starter,
}

// ============================================================================
// ── CENTRAL HEARTLANDS ────────────────────────────────────────────────────────
// ============================================================================

/** Dense forest south-east of Verdant Vale. Forms a grass triangle with Dusty Badlands. */
export const THORNWOOD: ZoneDef = {
  id: 'thornwood',
  name: 'Thornwood',
  berryEncounterRate: 0.10,
  wildBerryLevelRange: [4, 8],
  stoneDrops: [
    { stone: 'Leaf Stone', dropRate: 0.17 },
  ],
  goldDustRange: [12, 25],
  exploreCooldownMs: CD.easy,
}

/** Cracked scrubland at the heart of the continent. High connectivity, diverse drops. */
export const DUSTY_BADLANDS: ZoneDef = {
  id: 'dusty-badlands',
  name: 'Dusty Badlands',
  berryEncounterRate: 0.08,
  wildBerryLevelRange: [5, 9],
  stoneDrops: [
    { stone: 'Fire Stone', dropRate: 0.10 },
    { stone: 'Leaf Stone', dropRate: 0.10 },
  ],
  goldDustRange: [10, 28],
  exploreCooldownMs: CD.medium,
}

// ============================================================================
// ── WESTERN REACHES ───────────────────────────────────────────────────────────
// ============================================================================

/** Deep glacier north of Frostpeak — only accessible via Crystal Spire or Frostpeak. */
export const GLACIAL_RIFT: ZoneDef = {
  id: 'glacial-rift',
  name: 'Glacial Rift',
  berryEncounterRate: 0.07,
  wildBerryLevelRange: [7, 10],
  stoneDrops: [
    { stone: 'Ice Stone', dropRate: 0.22 },
  ],
  goldDustRange: [20, 42],
  exploreCooldownMs: CD.elite,
}

/** Misty swamp linking the western ice chain to the central badlands. */
export const SHADOWMERE_BOG: ZoneDef = {
  id: 'shadowmere-bog',
  name: 'Shadowmere Bog',
  berryEncounterRate: 0.07,
  wildBerryLevelRange: [6, 10],
  stoneDrops: [
    { stone: 'Moon Shard',   dropRate: 0.16 },
    { stone: 'Ribbon Shard', dropRate: 0.10 },
  ],
  goldDustRange: [18, 35],
  exploreCooldownMs: CD.hard,
}

// ============================================================================
// ── SOUTHERN BASIN ────────────────────────────────────────────────────────────
// ============================================================================

/** Damp cave at the foot of the western hills. Entry-level zone near Home. */
export const MOSSY_CAVERN: ZoneDef = {
  id: 'mossy-cavern',
  name: 'Mossy Cavern',
  berryEncounterRate: 0.11,
  wildBerryLevelRange: [3, 7],
  stoneDrops: [
    { stone: 'Leaf Stone',   dropRate: 0.14 },
    { stone: 'Ribbon Shard', dropRate: 0.08 },
  ],
  goldDustRange: [10, 22],
  exploreCooldownMs: CD.starter,
}

/** Sun-scorched dunes at the south-east — peninsula tip only reachable via Home + Wandering Path. */
export const SUNBAKED_DUNES: ZoneDef = {
  id: 'sunbaked-dunes',
  name: 'Sunbaked Dunes',
  berryEncounterRate: 0.08,
  wildBerryLevelRange: [4, 8],
  stoneDrops: [
    { stone: 'Sun Shard',  dropRate: 0.18 },
    { stone: 'Fire Stone', dropRate: 0.10 },
  ],
  goldDustRange: [15, 30],
  exploreCooldownMs: CD.easy,
}

// ============================================================================
// Zone Registry — keep in sync with ZoneId type in types.ts
// ============================================================================

export const ALL_ZONES: Record<ZoneId, ZoneDef> = {
  // Original
  'ember-crater':   EMBER_CRATER,
  'tide-basin':     TIDE_BASIN,
  'verdant-vale':   VERDANT_VALE,
  'frostpeak-zone': FROSTPEAK_ZONE,
  'wandering-path': WANDERING_PATH,
  // Northern plateau
  'ashfall-summit':   ASHFALL_SUMMIT,
  'crystal-spire':    CRYSTAL_SPIRE,
  'stormcliff-ridge': STORMCLIFF_RIDGE,
  // Eastern coast
  'coral-shallows': CORAL_SHALLOWS,
  // Central heartlands
  'thornwood':      THORNWOOD,
  'dusty-badlands': DUSTY_BADLANDS,
  // Western reaches
  'glacial-rift':   GLACIAL_RIFT,
  'shadowmere-bog': SHADOWMERE_BOG,
  // Southern basin
  'mossy-cavern':   MOSSY_CAVERN,
  'sunbaked-dunes': SUNBAKED_DUNES,
} as const

export const ZONE_LIST: ZoneDef[] = Object.values(ALL_ZONES)

export function getZoneById(id: ZoneId): ZoneDef {
  const zone = ALL_ZONES[id]
  if (!zone) throw new Error(`Unknown zone: ${id}`)
  return zone
}
