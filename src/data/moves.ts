import { MoveDefinition } from './types'

// ============================================================================
// Basic Attack (always available, all Berryvolutions)
// ============================================================================

export const BASIC_ATTACK: MoveDefinition = {
  id: 'basic-attack',
  name: 'Basic Attack',
  type: 'Fire', // type is irrelevant for basic attack, defaults to Fire
  category: 'Physical',
  power: 20,
  nrgCost: 0,
  accuracy: 100,
  unlockLevel: 1,
}

// ============================================================================
// Hypereon Moves (Water type)
// ============================================================================

export const HYPEREON_SPLASH_SHOT: MoveDefinition = {
  id: 'hypereon-splash-shot',
  name: 'Splash Shot',
  type: 'Water',
  category: 'Special',
  power: 40,
  nrgCost: 20,
  accuracy: 100,
  unlockLevel: 1,
}

export const HYPEREON_SOAK_MIST: MoveDefinition = {
  id: 'hypereon-soak-mist',
  name: 'Soak Mist',
  type: 'Water',
  category: 'Special',
  power: 20,
  nrgCost: 15,
  accuracy: 90,
  effect: { status: 'Soak' },
  unlockLevel: 8,
}

export const HYPEREON_TIDE_CRASH: MoveDefinition = {
  id: 'hypereon-tide-crash',
  name: 'Tide Crash',
  type: 'Water',
  category: 'Physical',
  power: 60,
  nrgCost: 25,
  accuracy: 90,
  unlockLevel: 15,
}

export const HYPEREON_TIDAL_WAVE: MoveDefinition = {
  id: 'hypereon-tidal-wave',
  name: 'Tidal Wave',
  type: 'Water',
  category: 'Special',
  power: 90,
  nrgCost: 45,
  accuracy: 80,
  unlockLevel: 22,
}

// ============================================================================
// Volteon Moves (Electric type)
// ============================================================================

export const VOLTEON_SPARK: MoveDefinition = {
  id: 'volteon-spark',
  name: 'Spark',
  type: 'Electric',
  category: 'Physical',
  power: 35,
  nrgCost: 15,
  accuracy: 100,
  unlockLevel: 1,
}

export const VOLTEON_SHOCK_DART: MoveDefinition = {
  id: 'volteon-shock-dart',
  name: 'Shock Dart',
  type: 'Electric',
  category: 'Special',
  power: 25,
  nrgCost: 15,
  accuracy: 90,
  effect: { status: 'Shock' },
  unlockLevel: 8,
}

export const VOLTEON_VOLT_RUSH: MoveDefinition = {
  id: 'volteon-volt-rush',
  name: 'Volt Rush',
  type: 'Electric',
  category: 'Physical',
  power: 65,
  nrgCost: 30,
  accuracy: 90,
  unlockLevel: 15,
}

export const VOLTEON_THUNDERSTRIKE: MoveDefinition = {
  id: 'volteon-thunderstrike',
  name: 'Thunderstrike',
  type: 'Electric',
  category: 'Special',
  power: 90,
  nrgCost: 40,
  accuracy: 80,
  unlockLevel: 22,
}

// ============================================================================
// Emberon Moves (Fire type)
// ============================================================================

export const EMBERON_EMBER: MoveDefinition = {
  id: 'emberon-ember',
  name: 'Ember',
  type: 'Fire',
  category: 'Special',
  power: 40,
  nrgCost: 20,
  accuracy: 100,
  unlockLevel: 1,
}

export const EMBERON_SCORCH: MoveDefinition = {
  id: 'emberon-scorch',
  name: 'Scorch',
  type: 'Fire',
  category: 'Special',
  power: 30,
  nrgCost: 20,
  accuracy: 90,
  effect: { status: 'Burn' },
  unlockLevel: 8,
}

export const EMBERON_FIRE_FANG: MoveDefinition = {
  id: 'emberon-fire-fang',
  name: 'Fire Fang',
  type: 'Fire',
  category: 'Physical',
  power: 65,
  nrgCost: 30,
  accuracy: 90,
  unlockLevel: 15,
}

export const EMBERON_INFERNO: MoveDefinition = {
  id: 'emberon-inferno',
  name: 'Inferno',
  type: 'Fire',
  category: 'Special',
  power: 95,
  nrgCost: 50,
  accuracy: 80,
  unlockLevel: 22,
}

// ============================================================================
// Eryleon Moves (Psychic type)
// ============================================================================

export const ERYLEON_MIND_BOLT: MoveDefinition = {
  id: 'eryleon-mind-bolt',
  name: 'Mind Bolt',
  type: 'Psychic',
  category: 'Special',
  power: 40,
  nrgCost: 20,
  accuracy: 100,
  unlockLevel: 1,
}

export const ERYLEON_CONFUSE_RAY: MoveDefinition = {
  id: 'eryleon-confuse-ray',
  name: 'Confuse Ray',
  type: 'Psychic',
  category: 'Special',
  power: 10,
  nrgCost: 15,
  accuracy: 90,
  effect: { status: 'Confuse' },
  unlockLevel: 8,
}

export const ERYLEON_PSY_BEAM: MoveDefinition = {
  id: 'eryleon-psy-beam',
  name: 'Psy Beam',
  type: 'Psychic',
  category: 'Special',
  power: 70,
  nrgCost: 35,
  accuracy: 90,
  unlockLevel: 15,
}

export const ERYLEON_MINDBREAK: MoveDefinition = {
  id: 'eryleon-mindbreak',
  name: 'Mindbreak',
  type: 'Psychic',
  category: 'Special',
  power: 95,
  nrgCost: 50,
  accuracy: 80,
  unlockLevel: 22,
}

// ============================================================================
// Vengeon Moves (Rock type)
// ============================================================================

export const VENGEON_BONE_CRUSH: MoveDefinition = {
  id: 'vengeon-bone-crush',
  name: 'Bone Crush',
  type: 'Rock',
  category: 'Physical',
  power: 40,
  nrgCost: 15,
  accuracy: 100,
  unlockLevel: 1,
}

export const VENGEON_WITHER_CURSE: MoveDefinition = {
  id: 'vengeon-wither-curse',
  name: 'Wither Curse',
  type: 'Rock',
  category: 'Special',
  power: 15,
  nrgCost: 15,
  accuracy: 90,
  effect: { status: 'Shatter' },
  unlockLevel: 8,
}

export const VENGEON_SHADOW_PRESS: MoveDefinition = {
  id: 'vengeon-shadow-press',
  name: 'Shadow Press',
  type: 'Rock',
  category: 'Physical',
  power: 65,
  nrgCost: 30,
  accuracy: 90,
  unlockLevel: 15,
}

export const VENGEON_DARK_VERDICT: MoveDefinition = {
  id: 'vengeon-dark-verdict',
  name: 'Dark Verdict',
  type: 'Rock',
  category: 'Special',
  power: 85,
  nrgCost: 40,
  accuracy: 80,
  effect: { status: 'Shatter' },
  unlockLevel: 22,
}

// ============================================================================
// Grasseon Moves (Grass type)
// ============================================================================

export const GRASSEON_VINE_LASH: MoveDefinition = {
  id: 'grasseon-vine-lash',
  name: 'Vine Lash',
  type: 'Grass',
  category: 'Physical',
  power: 35,
  nrgCost: 15,
  accuracy: 100,
  unlockLevel: 1,
}

export const GRASSEON_WILT_SPORE: MoveDefinition = {
  id: 'grasseon-wilt-spore',
  name: 'Wilt Spore',
  type: 'Grass',
  category: 'Special',
  power: 20,
  nrgCost: 15,
  accuracy: 90,
  effect: { status: 'Wilt' },
  unlockLevel: 8,
}

export const GRASSEON_THORN_VOLLEY: MoveDefinition = {
  id: 'grasseon-thorn-volley',
  name: 'Thorn Volley',
  type: 'Grass',
  category: 'Physical',
  power: 65,
  nrgCost: 30,
  accuracy: 90,
  unlockLevel: 15,
}

export const GRASSEON_SOLAR_RUSH: MoveDefinition = {
  id: 'grasseon-solar-rush',
  name: 'Solar Rush',
  type: 'Grass',
  category: 'Special',
  power: 90,
  nrgCost: 45,
  accuracy: 80,
  unlockLevel: 22,
}

// ============================================================================
// Polareon Moves (Ice type)
// ============================================================================

export const POLAREON_ICE_SHARD: MoveDefinition = {
  id: 'polareon-ice-shard',
  name: 'Ice Shard',
  type: 'Ice',
  category: 'Special',
  power: 35,
  nrgCost: 15,
  accuracy: 100,
  unlockLevel: 1,
}

export const POLAREON_FROST_BITE: MoveDefinition = {
  id: 'polareon-frost-bite',
  name: 'Frost Bite',
  type: 'Ice',
  category: 'Special',
  power: 25,
  nrgCost: 20,
  accuracy: 90,
  effect: { status: 'Freeze' },
  unlockLevel: 8,
}

export const POLAREON_BLIZZARD_EDGE: MoveDefinition = {
  id: 'polareon-blizzard-edge',
  name: 'Blizzard Edge',
  type: 'Ice',
  category: 'Physical',
  power: 65,
  nrgCost: 30,
  accuracy: 90,
  unlockLevel: 15,
}

export const POLAREON_GLACIAL_STORM: MoveDefinition = {
  id: 'polareon-glacial-storm',
  name: 'Glacial Storm',
  type: 'Ice',
  category: 'Special',
  power: 90,
  nrgCost: 45,
  accuracy: 80,
  unlockLevel: 22,
}

// ============================================================================
// Luxeon Moves (Psychic type)
// ============================================================================

export const LUXEON_SPARKLE_DUST: MoveDefinition = {
  id: 'luxeon-sparkle-dust',
  name: 'Sparkle Dust',
  type: 'Psychic',
  category: 'Special',
  power: 35,
  nrgCost: 15,
  accuracy: 100,
  unlockLevel: 1,
}

export const LUXEON_DAZZLE: MoveDefinition = {
  id: 'luxeon-dazzle',
  name: 'Dazzle',
  type: 'Psychic',
  category: 'Special',
  power: 20,
  nrgCost: 15,
  accuracy: 90,
  effect: { status: 'Confuse' },
  unlockLevel: 8,
}

export const LUXEON_GLITTER_BLADE: MoveDefinition = {
  id: 'luxeon-glitter-blade',
  name: 'Glitter Blade',
  type: 'Psychic',
  category: 'Physical',
  power: 60,
  nrgCost: 25,
  accuracy: 90,
  unlockLevel: 15,
}

export const LUXEON_RADIANT_BURST: MoveDefinition = {
  id: 'luxeon-radiant-burst',
  name: 'Radiant Burst',
  type: 'Psychic',
  category: 'Special',
  power: 85,
  nrgCost: 40,
  accuracy: 80,
  unlockLevel: 22,
}

// ============================================================================
// Move Collections (for easy reference)
// ============================================================================

export const HYPEREON_MOVES = [
  HYPEREON_SPLASH_SHOT,
  HYPEREON_SOAK_MIST,
  HYPEREON_TIDE_CRASH,
  HYPEREON_TIDAL_WAVE,
] as const

export const VOLTEON_MOVES = [
  VOLTEON_SPARK,
  VOLTEON_SHOCK_DART,
  VOLTEON_VOLT_RUSH,
  VOLTEON_THUNDERSTRIKE,
] as const

export const EMBERON_MOVES = [
  EMBERON_EMBER,
  EMBERON_SCORCH,
  EMBERON_FIRE_FANG,
  EMBERON_INFERNO,
] as const

export const ERYLEON_MOVES = [
  ERYLEON_MIND_BOLT,
  ERYLEON_CONFUSE_RAY,
  ERYLEON_PSY_BEAM,
  ERYLEON_MINDBREAK,
] as const

export const VENGEON_MOVES = [
  VENGEON_BONE_CRUSH,
  VENGEON_WITHER_CURSE,
  VENGEON_SHADOW_PRESS,
  VENGEON_DARK_VERDICT,
] as const

export const GRASSEON_MOVES = [
  GRASSEON_VINE_LASH,
  GRASSEON_WILT_SPORE,
  GRASSEON_THORN_VOLLEY,
  GRASSEON_SOLAR_RUSH,
] as const

export const POLAREON_MOVES = [
  POLAREON_ICE_SHARD,
  POLAREON_FROST_BITE,
  POLAREON_BLIZZARD_EDGE,
  POLAREON_GLACIAL_STORM,
] as const

export const LUXEON_MOVES = [
  LUXEON_SPARKLE_DUST,
  LUXEON_DAZZLE,
  LUXEON_GLITTER_BLADE,
  LUXEON_RADIANT_BURST,
] as const

// ============================================================================
// Utility: Get move by ID
// ============================================================================

const ALL_MOVES: Record<string, MoveDefinition> = {
  'basic-attack': BASIC_ATTACK,
  // Aquareon
  'hypereon-splash-shot': HYPEREON_SPLASH_SHOT,
  'hypereon-soak-mist': HYPEREON_SOAK_MIST,
  'hypereon-tide-crash': HYPEREON_TIDE_CRASH,
  'hypereon-tidal-wave': HYPEREON_TIDAL_WAVE,
  // Volteon
  'volteon-spark': VOLTEON_SPARK,
  'volteon-shock-dart': VOLTEON_SHOCK_DART,
  'volteon-volt-rush': VOLTEON_VOLT_RUSH,
  'volteon-thunderstrike': VOLTEON_THUNDERSTRIKE,
  // Emberon
  'emberon-ember': EMBERON_EMBER,
  'emberon-scorch': EMBERON_SCORCH,
  'emberon-fire-fang': EMBERON_FIRE_FANG,
  'emberon-inferno': EMBERON_INFERNO,
  // Eryleon
  'eryleon-mind-bolt': ERYLEON_MIND_BOLT,
  'eryleon-confuse-ray': ERYLEON_CONFUSE_RAY,
  'eryleon-psy-beam': ERYLEON_PSY_BEAM,
  'eryleon-mindbreak': ERYLEON_MINDBREAK,
  // Vengeon
  'vengeon-bone-crush': VENGEON_BONE_CRUSH,
  'vengeon-wither-curse': VENGEON_WITHER_CURSE,
  'vengeon-shadow-press': VENGEON_SHADOW_PRESS,
  'vengeon-dark-verdict': VENGEON_DARK_VERDICT,
  // Grasseon
  'grasseon-vine-lash': GRASSEON_VINE_LASH,
  'grasseon-wilt-spore': GRASSEON_WILT_SPORE,
  'grasseon-thorn-volley': GRASSEON_THORN_VOLLEY,
  'grasseon-solar-rush': GRASSEON_SOLAR_RUSH,
  // Polareon
  'polareon-ice-shard': POLAREON_ICE_SHARD,
  'polareon-frost-bite': POLAREON_FROST_BITE,
  'polareon-blizzard-edge': POLAREON_BLIZZARD_EDGE,
  'polareon-glacial-storm': POLAREON_GLACIAL_STORM,
  // Luxeon
  'luxeon-sparkle-dust': LUXEON_SPARKLE_DUST,
  'luxeon-dazzle': LUXEON_DAZZLE,
  'luxeon-glitter-blade': LUXEON_GLITTER_BLADE,
  'luxeon-radiant-burst': LUXEON_RADIANT_BURST,
}

export function getMoveById(id: string): MoveDefinition | undefined {
  return ALL_MOVES[id]
}
