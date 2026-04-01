import { EvolutionStone, ZoneId } from './types'

// ============================================================================
// Berryvolution Base Stats & Growth
// ============================================================================

export const BERRYVOLUTION_STATS = {
  hypereon: {
    baseStats: { hp: 120, atk: 65, def: 95, spd: 55, nrg: 65 },
    statGrowth: { hp: 5, atk: 2, def: 4, spd: 1, nrg: 2 },
  },
  volteon: {
    baseStats: { hp: 60, atk: 95, def: 50, spd: 130, nrg: 60 },
    statGrowth: { hp: 1, atk: 4, def: 1, spd: 5, nrg: 2 },
  },
  emberon: {
    baseStats: { hp: 70, atk: 130, def: 45, spd: 80, nrg: 50 },
    statGrowth: { hp: 2, atk: 5, def: 1, spd: 3, nrg: 1 },
  },
  eryleon: {
    baseStats: { hp: 65, atk: 55, def: 60, spd: 110, nrg: 110 },
    statGrowth: { hp: 2, atk: 1, def: 2, spd: 4, nrg: 5 },
  },
  vengeon: {
    baseStats: { hp: 115, atk: 55, def: 110, spd: 45, nrg: 70 },
    statGrowth: { hp: 5, atk: 1, def: 5, spd: 1, nrg: 2 },
  },
  grasseon: {
    baseStats: { hp: 85, atk: 95, def: 90, spd: 70, nrg: 60 },
    statGrowth: { hp: 3, atk: 3, def: 3, spd: 2, nrg: 2 },
  },
  polareon: {
    baseStats: { hp: 75, atk: 90, def: 65, spd: 75, nrg: 100 },
    statGrowth: { hp: 2, atk: 3, def: 2, spd: 2, nrg: 4 },
  },
  luxeon: {
    baseStats: { hp: 130, atk: 55, def: 75, spd: 60, nrg: 95 },
    statGrowth: { hp: 5, atk: 1, def: 2, spd: 2, nrg: 4 },
  },
} as const

// ============================================================================
// Berry (Unevolved) Base Stats & Growth
// ============================================================================

export const BERRY_STATS = {
  baseStats: { hp: 45, atk: 40, def: 40, spd: 45, nrg: 30 },
  statGrowth: { hp: 2, atk: 2, def: 2, spd: 2, nrg: 1 },
  levelCap: 10,
} as const

// ============================================================================
// XP & Leveling Configuration
// ============================================================================

export const XP_CONFIG = {
  basePerBattle: 30,
  winBonus: 20,
  xpToNextLevel: (level: number): number => 20 + level * 10,
} as const

// ============================================================================
// Arena Rewards
// ============================================================================

export const ARENA_REWARDS = {
  winGoldDust: 15,
  winStamina: 3,
  winArenaPoints: 25,
  lossArenaPoints: -15,
  drawArenaPoints: 0,
} as const

// ============================================================================
// Zone Rewards
// ============================================================================

export const ZONE_REWARDS = {
  encounterStamina: 1,
  goldDustRange: {
    'ember-crater': [10, 25],
    'tide-basin': [10, 25],
    'verdant-vale': [10, 30],
    'frostpeak-zone': [15, 35],
    'wandering-path': [5, 20],
  } as Record<ZoneId, [number, number]>,
} as const

// ============================================================================
// Shop Prices
// ============================================================================

export const SHOP_PRICES = {
  crystalOrb: 30,
  staminaPotion: 25,
  staminaPotionAmount: 5,
} as const

// ============================================================================
// Starting Resources (New Game)
// ============================================================================

export const STARTING_RESOURCES = {
  stamina: 10,
  crystalOrbs: 3,
  goldDust: 50,
} as const

// ============================================================================
// Evolution Stones
// ============================================================================

export const EVOLUTION_STONE_NAMES: Record<EvolutionStone, string> = {
  'Water Stone': 'Water Stone',
  'Thunder Stone': 'Thunder Stone',
  'Fire Stone': 'Fire Stone',
  'Sun Shard': 'Sun Shard',
  'Moon Shard': 'Moon Shard',
  'Leaf Stone': 'Leaf Stone',
  'Ice Stone': 'Ice Stone',
  'Ribbon Shard': 'Ribbon Shard',
} as const

// ============================================================================
// Arena Tiers & Point Thresholds
// ============================================================================

export const ARENA_TIERS = {
  bronze: { tier: 'Bronze' as const, pointsRequired: 0, aiDifficulty: 'Rookie' as const },
  silver: { tier: 'Silver' as const, pointsRequired: 300, aiDifficulty: 'Rookie' as const },
  gold: { tier: 'Gold' as const, pointsRequired: 600, aiDifficulty: 'Trainer' as const },   // Reduced from 700
  crystal: { tier: 'Crystal' as const, pointsRequired: 900, aiDifficulty: 'Trainer' as const }, // Reduced from 1200
  apex: { tier: 'Apex' as const, pointsRequired: 1400, aiDifficulty: 'Champion' as const }, // Reduced from 2000
} as const

// ============================================================================
// Status Effect Durations (in turns)
// ============================================================================

export const STATUS_DURATIONS = {
  Burn: 3,
  Freeze: { min: 1, max: 3 },
  Shock: 2,
  Soak: 3,
  Wilt: 2,
  Shatter: 2,
  Confuse: 2,
} as const

// ============================================================================
// Trait Definitions
// ============================================================================

export const TRAIT_DEFINITIONS = {
  'hydration': {
    name: 'Hydration',
    description: 'Restores 8% max HP at the start of each turn',
  },
  'swift': {
    name: 'Swift',
    description: 'Always acts first within its Speed tier (breaks Speed ties)',
  },
  'volatile': {
    name: 'Volatile',
    description: 'Outgoing moves +15% damage; takes +10% incoming damage',
  },
  'psychic-veil': {
    name: 'Psychic Veil',
    description: 'Immune to status effects from non-Psychic moves',
  },
  'dark-shroud': {
    name: 'Dark Shroud',
    description: 'Psychic-type moves deal 0 damage to this form',
  },
  'thorn-guard': {
    name: 'Thorn Guard',
    description: 'Attackers take 5% reflected damage on contact Physical moves',
  },
  'frost-armor': {
    name: 'Frost Armor',
    description: 'The first hit each battle is reduced by 30%',
  },
  'fairy-charm': {
    name: 'Fairy Charm',
    description: 'When this form faints, the next active ally is healed for 10% HP',
  },
} as const
