import { BerryDef } from './types'
import { BERRY_STATS } from './config'

// ============================================================================
// Unevolved Berry
// ============================================================================

export const BERRY: BerryDef = {
  id: 'berry',
  name: 'Berry',
  baseStats: BERRY_STATS.baseStats,
  statGrowth: BERRY_STATS.statGrowth,
  levelCap: BERRY_STATS.levelCap,
  spriteUrl: '/sprites/berry.svg',
}

export default BERRY
