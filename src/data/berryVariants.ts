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
