import { ZoneDef, ZoneId } from './types'

// ============================================================================
// Ember Crater (Fire stone zone)
// ============================================================================

export const EMBER_CRATER: ZoneDef = {
  id: 'ember-crater',
  name: 'Ember Crater',
  berryEncounterRate: 0.1,
  wildBerryLevelRange: [3, 7],
  stoneDrops: [
    { stone: 'Fire Stone', dropRate: 0.15 },
    { stone: 'Sun Shard', dropRate: 0.12 },
  ],
  goldDustRange: [10, 25],
}

// ============================================================================
// Tide Basin (Water stone zone)
// ============================================================================

export const TIDE_BASIN: ZoneDef = {
  id: 'tide-basin',
  name: 'Tide Basin',
  berryEncounterRate: 0.1,
  wildBerryLevelRange: [3, 7],
  stoneDrops: [
    { stone: 'Water Stone', dropRate: 0.15 },
    { stone: 'Thunder Stone', dropRate: 0.12 },
  ],
  goldDustRange: [10, 25],
}

// ============================================================================
// Verdant Vale (Grass stone zone)
// ============================================================================

export const VERDANT_VALE: ZoneDef = {
  id: 'verdant-vale',
  name: 'Verdant Vale',
  berryEncounterRate: 0.1,
  wildBerryLevelRange: [5, 9],
  stoneDrops: [
    { stone: 'Leaf Stone', dropRate: 0.15 },
    { stone: 'Moon Shard', dropRate: 0.12 },
  ],
  goldDustRange: [10, 30],
}

// ============================================================================
// Frostpeak Zone (Ice stone zone)
// ============================================================================

export const FROSTPEAK_ZONE: ZoneDef = {
  id: 'frostpeak-zone',
  name: 'Frostpeak Zone',
  berryEncounterRate: 0.08,
  wildBerryLevelRange: [6, 10],
  stoneDrops: [
    { stone: 'Ice Stone', dropRate: 0.20 },
  ],
  goldDustRange: [15, 35],
}

// ============================================================================
// Wandering Path (Rare/misc zone)
// ============================================================================

export const WANDERING_PATH: ZoneDef = {
  id: 'wandering-path',
  name: 'Wandering Path',
  berryEncounterRate: 0.05,
  wildBerryLevelRange: [1, 10],
  stoneDrops: [
    { stone: 'Ribbon Shard', dropRate: 0.18 },  // Increased from 0.08 for better UX
  ],
  goldDustRange: [5, 20],
}

// ============================================================================
// Zone Registry
// ============================================================================

export const ALL_ZONES: Record<ZoneId, ZoneDef> = {
  'ember-crater': EMBER_CRATER,
  'tide-basin': TIDE_BASIN,
  'verdant-vale': VERDANT_VALE,
  'frostpeak-zone': FROSTPEAK_ZONE,
  'wandering-path': WANDERING_PATH,
} as const

export const ZONE_LIST: ZoneDef[] = [
  EMBER_CRATER,
  TIDE_BASIN,
  VERDANT_VALE,
  FROSTPEAK_ZONE,
  WANDERING_PATH,
]

// ============================================================================
// Utility: Get zone by ID
// ============================================================================

export function getZoneById(id: ZoneId): ZoneDef {
  const zone = ALL_ZONES[id]
  if (!zone) throw new Error(`Unknown zone: ${id}`)
  return zone
}
