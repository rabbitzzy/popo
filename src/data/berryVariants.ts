// ============================================================================
// Berry Skin Variants
// ============================================================================
// Each entry maps to /public/sprites/berry-{id}.svg.
// Add new entries here to grow the pool; spawnWildBerry picks randomly.

export const BERRY_SKIN_IDS = [
  'default',   // original berry.svg
  'crimson',
  'sapphire',
  'citrus',
  'jade',
  'lilac',
  'coral',
] as const

export type BerrySkinId = typeof BERRY_SKIN_IDS[number]

/** Return the sprite path for a berry skin */
export function berrySkinSprite(skinId: BerrySkinId | undefined): string {
  if (!skinId || skinId === 'default') return '/sprites/berry.svg'
  return `/sprites/berry-${skinId}.svg`
}

/** Pick a random skin from the pool */
export function randomBerrySkin(): BerrySkinId {
  return BERRY_SKIN_IDS[Math.floor(Math.random() * BERRY_SKIN_IDS.length)]
}

/**
 * Get the elemental type for a Berry skin.
 * Different colored Berrys have different types, affecting battle effectiveness.
 */
export function getBerryType(skinId: BerrySkinId | undefined): 'Fire' | 'Water' | 'Grass' | 'Electric' | 'Psychic' | 'Ice' | 'Rock' {
  const typeMap: Record<BerrySkinId, 'Fire' | 'Water' | 'Grass' | 'Electric' | 'Psychic' | 'Ice' | 'Rock'> = {
    'default': 'Water',   // Blue berry - Water type
    'crimson': 'Fire',    // Red berry - Fire type
    'sapphire': 'Water',  // Blue berry - Water type
    'citrus': 'Electric', // Yellow berry - Electric type
    'jade': 'Grass',      // Green berry - Grass type
    'lilac': 'Psychic',   // Purple berry - Psychic type
    'coral': 'Ice',       // Pink berry - Ice type
  }
  return typeMap[skinId || 'default']
}
