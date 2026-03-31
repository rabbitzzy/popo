import { BerryvolutionDef, BerryvolutionId } from './types'
import { BERRYVOLUTION_STATS } from './config'
import {
  HYPEREON_SPLASH_SHOT,
  HYPEREON_SOAK_MIST,
  HYPEREON_TIDE_CRASH,
  HYPEREON_TIDAL_WAVE,
  VOLTEON_SPARK,
  VOLTEON_SHOCK_DART,
  VOLTEON_VOLT_RUSH,
  VOLTEON_THUNDERSTRIKE,
  EMBERON_EMBER,
  EMBERON_SCORCH,
  EMBERON_FIRE_FANG,
  EMBERON_INFERNO,
  ERYLEON_MIND_BOLT,
  ERYLEON_CONFUSE_RAY,
  ERYLEON_PSY_BEAM,
  ERYLEON_MINDBREAK,
  VENGEON_BONE_CRUSH,
  VENGEON_WITHER_CURSE,
  VENGEON_SHADOW_PRESS,
  VENGEON_DARK_VERDICT,
  GRASSEON_VINE_LASH,
  GRASSEON_WILT_SPORE,
  GRASSEON_THORN_VOLLEY,
  GRASSEON_SOLAR_RUSH,
  POLAREON_ICE_SHARD,
  POLAREON_FROST_BITE,
  POLAREON_BLIZZARD_EDGE,
  POLAREON_GLACIAL_STORM,
  LUXEON_SPARKLE_DUST,
  LUXEON_DAZZLE,
  LUXEON_GLITTER_BLADE,
  LUXEON_RADIANT_BURST,
} from './moves'

// ============================================================================
// Hypereon (Water type)
// ============================================================================

export const HYPEREON: BerryvolutionDef = {
  id: 'hypereon',
  name: 'Hypereon',
  type: 'Water',
  baseStats: BERRYVOLUTION_STATS.hypereon.baseStats,
  statGrowth: BERRYVOLUTION_STATS.hypereon.statGrowth,
  trait: 'hydration',
  moves: [HYPEREON_SPLASH_SHOT, HYPEREON_SOAK_MIST, HYPEREON_TIDE_CRASH, HYPEREON_TIDAL_WAVE],
  evolutionStone: 'Water Stone',
  spriteUrl: '/sprites/hypereon.svg',
}

// ============================================================================
// Volteon (Electric type)
// ============================================================================

export const VOLTEON: BerryvolutionDef = {
  id: 'volteon',
  name: 'Volteon',
  type: 'Electric',
  baseStats: BERRYVOLUTION_STATS.volteon.baseStats,
  statGrowth: BERRYVOLUTION_STATS.volteon.statGrowth,
  trait: 'swift',
  moves: [VOLTEON_SPARK, VOLTEON_SHOCK_DART, VOLTEON_VOLT_RUSH, VOLTEON_THUNDERSTRIKE],
  evolutionStone: 'Thunder Stone',
  spriteUrl: '/sprites/volteon.svg',
}

// ============================================================================
// Emberon (Fire type)
// ============================================================================

export const EMBERON: BerryvolutionDef = {
  id: 'emberon',
  name: 'Emberon',
  type: 'Fire',
  baseStats: BERRYVOLUTION_STATS.emberon.baseStats,
  statGrowth: BERRYVOLUTION_STATS.emberon.statGrowth,
  trait: 'volatile',
  moves: [EMBERON_EMBER, EMBERON_SCORCH, EMBERON_FIRE_FANG, EMBERON_INFERNO],
  evolutionStone: 'Fire Stone',
  spriteUrl: '/sprites/emberon.svg',
}

// ============================================================================
// Eryleon (Psychic type)
// ============================================================================

export const ERYLEON: BerryvolutionDef = {
  id: 'eryleon',
  name: 'Eryleon',
  type: 'Psychic',
  baseStats: BERRYVOLUTION_STATS.eryleon.baseStats,
  statGrowth: BERRYVOLUTION_STATS.eryleon.statGrowth,
  trait: 'psychic-veil',
  moves: [ERYLEON_MIND_BOLT, ERYLEON_CONFUSE_RAY, ERYLEON_PSY_BEAM, ERYLEON_MINDBREAK],
  evolutionStone: 'Sun Shard',
  spriteUrl: '/sprites/eryleon.svg',
}

// ============================================================================
// Vengeon (Dark/Rock type)
// ============================================================================

export const VENGEON: BerryvolutionDef = {
  id: 'vengeon',
  name: 'Vengeon',
  type: 'Rock',
  baseStats: BERRYVOLUTION_STATS.vengeon.baseStats,
  statGrowth: BERRYVOLUTION_STATS.vengeon.statGrowth,
  trait: 'dark-shroud',
  moves: [VENGEON_BONE_CRUSH, VENGEON_WITHER_CURSE, VENGEON_SHADOW_PRESS, VENGEON_DARK_VERDICT],
  evolutionStone: 'Moon Shard',
  spriteUrl: '/sprites/vengeon.svg',
}

// ============================================================================
// Grasseon (Grass type)
// ============================================================================

export const GRASSEON: BerryvolutionDef = {
  id: 'grasseon',
  name: 'Grasseon',
  type: 'Grass',
  baseStats: BERRYVOLUTION_STATS.grasseon.baseStats,
  statGrowth: BERRYVOLUTION_STATS.grasseon.statGrowth,
  trait: 'thorn-guard',
  moves: [GRASSEON_VINE_LASH, GRASSEON_WILT_SPORE, GRASSEON_THORN_VOLLEY, GRASSEON_SOLAR_RUSH],
  evolutionStone: 'Leaf Stone',
  spriteUrl: '/sprites/grasseon.svg',
}

// ============================================================================
// Polareon (Ice type)
// ============================================================================

export const POLAREON: BerryvolutionDef = {
  id: 'polareon',
  name: 'Polareon',
  type: 'Ice',
  baseStats: BERRYVOLUTION_STATS.polareon.baseStats,
  statGrowth: BERRYVOLUTION_STATS.polareon.statGrowth,
  trait: 'frost-armor',
  moves: [POLAREON_ICE_SHARD, POLAREON_FROST_BITE, POLAREON_BLIZZARD_EDGE, POLAREON_GLACIAL_STORM],
  evolutionStone: 'Ice Stone',
  spriteUrl: '/sprites/polareon.svg',
}

// ============================================================================
// Luxeon (Fairy/Psychic type)
// ============================================================================

export const LUXEON: BerryvolutionDef = {
  id: 'luxeon',
  name: 'Luxeon',
  type: 'Psychic',
  baseStats: BERRYVOLUTION_STATS.luxeon.baseStats,
  statGrowth: BERRYVOLUTION_STATS.luxeon.statGrowth,
  trait: 'fairy-charm',
  moves: [LUXEON_SPARKLE_DUST, LUXEON_DAZZLE, LUXEON_GLITTER_BLADE, LUXEON_RADIANT_BURST],
  evolutionStone: 'Ribbon Shard',
  spriteUrl: '/sprites/luxeon.svg',
}

// ============================================================================
// Berryvolution Registry
// ============================================================================

export const ALL_BERRYVOLUTIONS: Record<BerryvolutionId, BerryvolutionDef> = {
  hypereon: HYPEREON,
  volteon: VOLTEON,
  emberon: EMBERON,
  eryleon: ERYLEON,
  vengeon: VENGEON,
  grasseon: GRASSEON,
  polareon: POLAREON,
  luxeon: LUXEON,
} as const

export const BERRYVOLUTION_LIST: BerryvolutionDef[] = [
  HYPEREON,
  VOLTEON,
  EMBERON,
  ERYLEON,
  VENGEON,
  GRASSEON,
  POLAREON,
  LUXEON,
]

export function getBerryvolutionById(id: BerryvolutionId): BerryvolutionDef {
  const form = ALL_BERRYVOLUTIONS[id]
  if (!form) throw new Error(`Unknown berryvolution: ${id}`)
  return form
}
