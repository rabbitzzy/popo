import { PartyMember, MoveDefinition } from '../data/types'
import { XP_CONFIG, BERRY_STATS, BERRYVOLUTION_STATS } from '../data/config'
import {
  HYPEREON_MOVES,
  VOLTEON_MOVES,
  EMBERON_MOVES,
  ERYLEON_MOVES,
  VENGEON_MOVES,
  GRASSEON_MOVES,
  POLAREON_MOVES,
  LUXEON_MOVES,
} from '../data/moves'

// ============================================================================
// Move Registry
// ============================================================================

const MOVE_REGISTRY: Record<string, readonly MoveDefinition[]> = {
  hypereon: HYPEREON_MOVES,
  volteon: VOLTEON_MOVES,
  emberon: EMBERON_MOVES,
  eryleon: ERYLEON_MOVES,
  vengeon: VENGEON_MOVES,
  grasseon: GRASSEON_MOVES,
  polareon: POLAREON_MOVES,
  luxeon: LUXEON_MOVES,
}

// ============================================================================
// Stat Computation
// ============================================================================

/**
 * Compute the actual stats for a Berryvolution or Berry at a given level.
 * Formula: base + (growth × level)
 *
 * @param defId - The Berryvolution or Berry definition ID
 * @param level - The current level
 * @returns Computed stats at the given level
 */
export function computeStats(
  defId: string,
  level: number
): { hp: number; atk: number; def: number; spd: number; nrg: number } {
  let baseStats: { hp: number; atk: number; def: number; spd: number; nrg: number }
  let statGrowth: { hp: number; atk: number; def: number; spd: number; nrg: number }

  // Unevolved Berry
  if (defId === 'berry') {
    baseStats = BERRY_STATS.baseStats
    statGrowth = BERRY_STATS.statGrowth
  } else {
    // Berryvolution
    const stats = BERRYVOLUTION_STATS[defId as keyof typeof BERRYVOLUTION_STATS]
    if (!stats) throw new Error(`Unknown form: ${defId}`)
    baseStats = stats.baseStats
    statGrowth = stats.statGrowth
  }

  return {
    hp: baseStats.hp + statGrowth.hp * level,
    atk: baseStats.atk + statGrowth.atk * level,
    def: baseStats.def + statGrowth.def * level,
    spd: baseStats.spd + statGrowth.spd * level,
    nrg: baseStats.nrg + statGrowth.nrg * level,
  }
}

// ============================================================================
// XP & Leveling
// ============================================================================

/**
 * Calculate XP required to reach the next level.
 * Formula: 20 + (level × 10)
 *
 * @param level - Current level
 * @returns XP needed to reach level+1
 */
export function xpToNextLevel(level: number): number {
  return XP_CONFIG.xpToNextLevel(level)
}

/**
 * Calculate total cumulative XP needed to reach a given level.
 * This is the sum of xpToNextLevel for all previous levels.
 *
 * @param level - Target level
 * @returns Total XP needed to reach that level
 */
export function totalXpToLevel(level: number): number {
  let total = 0
  for (let i = 1; i < level; i++) {
    total += xpToNextLevel(i)
  }
  return total
}

/**
 * Apply XP to a party member and handle leveling up.
 * Levels are capped at:
 * - Level 10 for unevolved Berry
 * - Level 30 for Berryvolutions
 *
 * @param member - The party member to level up
 * @param xp - Amount of XP to apply
 * @returns Result with updated member, leveledUp flag, and newly unlocked moves
 */
export function applyXp(
  member: PartyMember,
  xp: number
): {
  member: PartyMember
  leveledUp: boolean
  newMoveIds: string[]
} {
  const updated = { ...member, xp: member.xp + xp }
  let leveledUp = false
  const newMoveIds: string[] = []

  // Determine level cap
  const levelCap = member.defId === 'berry' ? 10 : 30

  // Check if we can level up (may happen multiple times)
  while (updated.level < levelCap) {
    const xpNeeded = xpToNextLevel(updated.level)
    if (updated.xp >= xpNeeded) {
      updated.xp -= xpNeeded
      updated.level += 1
      leveledUp = true

      // Check for newly unlocked moves
      const newMoves = getUnlockedMoves(member.defId, updated.level)
      newMoves.forEach(move => {
        if (!updated.unlockedMoveIds.includes(move.id)) {
          updated.unlockedMoveIds.push(move.id)
          newMoveIds.push(move.id)
        }
      })

      // Recompute stats on level up
      updated.currentStats = computeStats(member.defId, updated.level)
      updated.maxHp = updated.currentStats.hp
    } else {
      break
    }
  }

  return { member: updated, leveledUp, newMoveIds }
}

// ============================================================================
// Move Unlocking
// ============================================================================

/**
 * Get all moves unlocked at or below a given level.
 * Moves unlock at levels 1, 8, 15, and 22.
 *
 * @param defId - The Berryvolution or Berry definition ID
 * @param level - The current level
 * @returns Array of move definitions unlocked at/before this level
 */
export function getUnlockedMoves(defId: string, level: number): MoveDefinition[] {
  // Berry (unevolved) only has Basic Attack
  if (defId === 'berry') {
    return []
  }

  const moves = MOVE_REGISTRY[defId]
  if (!moves) return []

  return moves.filter(move => move.unlockLevel <= level)
}

/**
 * Get the next move that will unlock for a form at a given level.
 *
 * @param defId - The Berryvolution definition ID
 * @param currentLevel - The current level
 * @returns The move that unlocks at the next milestone, or null
 */
export function getNextUnlockingMove(defId: string, currentLevel: number): MoveDefinition | null {
  const moves = MOVE_REGISTRY[defId]
  if (!moves) return null

  const nextMove = moves.find(move => move.unlockLevel > currentLevel)
  return nextMove || null
}
