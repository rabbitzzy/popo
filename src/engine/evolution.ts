import { PartyMember, BerryvolutionId, EvolutionStone } from '../data/types'
import { computeStats, getUnlockedMoves } from './leveling'
import { getBerryvolutionById } from '../data/berryvolutions'

// ============================================================================
// Evolution Stone to Berryvolution Mapping
// ============================================================================

const EVOLUTION_STONE_TO_FORM: Record<EvolutionStone, BerryvolutionId> = {
  'Water Stone': 'hypereon',
  'Thunder Stone': 'volteon',
  'Fire Stone': 'emberon',
  'Sun Shard': 'eryleon',
  'Moon Shard': 'vengeon',
  'Leaf Stone': 'grasseon',
  'Ice Stone': 'polareon',
  'Ribbon Shard': 'luxeon',
}

// ============================================================================
// Evolution Gate & Validation
// ============================================================================

/**
 * Check if a Berry can evolve.
 *
 * Requirements:
 * - Member must be unevolved Berry (defId === 'berry')
 * - Member must be level 10 or higher
 * - Inventory must contain the matching evolution stone
 * - Party must not already contain the evolved form
 *
 * @param member - The party member to check
 * @param stone - The evolution stone to use
 * @param partyFormIds - List of evolved forms already in party
 * @param stoneCount - Number of this stone in inventory
 * @returns true if evolution is allowed, false otherwise
 */
export function canEvolve(
  member: PartyMember,
  stone: EvolutionStone,
  partyFormIds: BerryvolutionId[],
  stoneCount: number
): boolean {
  // Must be unevolved Berry
  if (member.defId !== 'berry') {
    return false
  }

  // Must be level 10 or higher
  if (member.level < 10) {
    return false
  }

  // Must have at least 1 of the stone
  if (stoneCount < 1) {
    return false
  }

  // Must not already have this evolved form
  const targetForm = EVOLUTION_STONE_TO_FORM[stone]
  if (partyFormIds.includes(targetForm)) {
    return false
  }

  return true
}

/**
 * Apply evolution to a Berry, transforming it into a Berryvolution.
 *
 * Evolution:
 * - Replaces the Berry with the evolved form
 * - KEEPS current level (no reset!)
 * - Updates stats to evolved form's stats at current level
 * - Updates unlocked moves for new form at current level
 * - Updates instance to reflect new form
 *
 * Note: Does NOT deduct the stone from inventory - caller must do that.
 *
 * @param member - The unevolved Berry to evolve
 * @param stone - The evolution stone to use
 * @returns New PartyMember with evolved form
 * @throws Error if evolution is not possible
 */
export function applyEvolution(member: PartyMember, stone: EvolutionStone): PartyMember {
  // Verify we're evolving a Berry
  if (member.defId !== 'berry') {
    throw new Error('Cannot evolve non-Berry')
  }

  // Get the target evolution form
  const targetFormId = EVOLUTION_STONE_TO_FORM[stone]
  if (!targetFormId) {
    throw new Error(`Unknown evolution stone: ${stone}`)
  }

  // Get the form definition to validate and access stats
  const formDef = getBerryvolutionById(targetFormId)

  // FIXED: Keep current level instead of resetting to 1
  const evolvedLevel = member.level

  // Compute stats at current level of the evolved form
  const levelStats = computeStats(targetFormId, evolvedLevel)

  // Get moves unlocked up to current level
  const unlockedMoveIds = getUnlockedMoves(targetFormId, evolvedLevel).map(m => m.id)

  // Create the evolved member
  const evolved: PartyMember = {
    instanceId: member.instanceId,
    defId: targetFormId,
    level: evolvedLevel,
    xp: 0,
    currentStats: levelStats,
    maxHp:      levelStats.hp,
    currentHp:  levelStats.hp,   // evolution fully heals
    currentNrg: levelStats.nrg,
    unlockedMoveIds,
  }

  return evolved
}

/**
 * Get the form that a stone will evolve a Berry into.
 *
 * @param stone - The evolution stone
 * @returns The BerryvolutionId the stone unlocks, or null if invalid
 */
export function getEvolutionForm(stone: EvolutionStone): BerryvolutionId | null {
  return EVOLUTION_STONE_TO_FORM[stone] || null
}

/**
 * Get the stone required to evolve into a specific form.
 *
 * @param formId - The target Berryvolution form
 * @returns The evolution stone required
 * @throws Error if form doesn't exist or has no evolution stone
 */
export function getEvolutionStone(formId: BerryvolutionId): EvolutionStone {
  const formDef = getBerryvolutionById(formId)
  return formDef.evolutionStone
}
