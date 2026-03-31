import { ZoneDef, PartyMember, SearchResult } from '../data/types'
import { computeStats } from './leveling'

// ============================================================================
// Zone Search
// ============================================================================

/**
 * Perform a zone search roll to determine what is found.
 *
 * Probability breakdown:
 * 1. Roll for Berry encounter (zone.berryEncounterRate)
 * 2. Roll for stone drops (cumulative across all stones)
 * 3. Roll for gold dust (40% chance)
 * 4. Otherwise nothing
 *
 * @param zone - The zone to search in
 * @returns SearchResult indicating what was found
 */
export function searchZone(zone: ZoneDef): SearchResult {
  const roll = Math.random()

  // Check for Berry encounter
  if (roll < zone.berryEncounterRate) {
    return { type: 'encounter' }
  }

  // Check for stone drops
  let cursor = zone.berryEncounterRate
  for (const drop of zone.stoneDrops) {
    cursor += drop.dropRate
    if (roll < cursor) {
      return { type: 'stone', stone: drop.stone }
    }
  }

  // Check for gold dust (40% of remaining)
  const goldRoll = Math.random()
  if (goldRoll < 0.4) {
    const gold = randInt(zone.goldDustRange[0], zone.goldDustRange[1])
    return { type: 'gold', amount: gold }
  }

  // Nothing found
  return { type: 'nothing' }
}

// ============================================================================
// Wild Berry Generation
// ============================================================================

/**
 * Spawn a wild Berry with a random level from the zone's range.
 *
 * - Level is randomly chosen from zone.wildBerryLevelRange
 * - Stats are computed for Berry at that level
 * - Instance ID is generated (uuid)
 * - Unevolved Berry has no unlocked moves
 *
 * @param zone - The zone to spawn from
 * @returns A wild Berry PartyMember ready for battle
 */
export function spawnWildBerry(zone: ZoneDef): PartyMember {
  const [minLevel, maxLevel] = zone.wildBerryLevelRange
  const level = randInt(minLevel, maxLevel)

  const stats = computeStats('berry', level)

  return {
    instanceId: generateUuid(),
    defId: 'berry',
    level,
    xp: 0,
    currentStats: stats,
    maxHp: stats.hp,
    unlockedMoveIds: [],
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Generate a random integer in [min, max] inclusive.
 */
function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Generate a UUID v4.
 * In the browser, we'd normally use crypto.randomUUID() or a library.
 * For testing, we use a simple implementation that's sufficient for game instance IDs.
 */
function generateUuid(): string {
  // Try to use browser crypto if available
  if (typeof globalThis !== 'undefined' && globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID()
  }

  // Fallback simple UUID v4 implementation
  const chars = '0123456789abcdef'
  let uuid = ''
  for (let i = 0; i < 36; i++) {
    if (i === 8 || i === 13 || i === 18 || i === 23) {
      uuid += '-'
    } else if (i === 14) {
      uuid += '4'
    } else if (i === 19) {
      uuid += chars[Math.floor(Math.random() * 16) | 8]
    } else {
      uuid += chars[Math.floor(Math.random() * 16)]
    }
  }
  return uuid
}
