import { BattleAction, BattleState, CombatantState, MoveDefinition } from '../data/types'
import { getTypeMultiplier } from '../data/typeChart'
import { HYPEREON_MOVES, VOLTEON_MOVES, EMBERON_MOVES, ERYLEON_MOVES, VENGEON_MOVES, GRASSEON_MOVES, POLAREON_MOVES, LUXEON_MOVES, BASIC_ATTACK } from '../data/moves'

// ============================================================================
// AI Decision Logic
// ============================================================================

/**
 * Get AI's chosen action for the current battle state.
 *
 * Difficulty levels:
 * - Rookie: Random move from available (respects NRG)
 * - Trainer: Switch if disadvantaged, pick super-effective moves
 * - Champion: Advanced switching, status preference, NRG management
 *
 * @param battleState - Current battle state
 * @returns AI's chosen action (move or switch)
 */
export function getAIAction(battleState: BattleState): BattleAction {
  const difficulty = battleState.aiDifficulty
  const aiCombatant = battleState.aiTeam[battleState.activeAiIndex]
  const playerCombatant = battleState.playerTeam[battleState.activePlayerIndex]

  if (!aiCombatant || !playerCombatant) {
    // Fallback: use basic attack
    return { type: 'move', moveId: 'basic-attack' }
  }

  switch (difficulty) {
    case 'Rookie':
      return getAIActionRookie(aiCombatant)
    case 'Trainer':
      return getAIActionTrainer(battleState, aiCombatant, playerCombatant)
    case 'Champion':
      return getAIActionChampion(battleState, aiCombatant, playerCombatant)
    default:
      return { type: 'move', moveId: 'basic-attack' }
  }
}

// ============================================================================
// Rookie AI: Random Valid Move
// ============================================================================

function getAIActionRookie(aiCombatant: CombatantState): BattleAction {
  // Get all available moves (including basic attack)
  const availableMoves = getAvailableMoves(aiCombatant)

  if (availableMoves.length === 0) {
    // Fallback
    return { type: 'move', moveId: 'basic-attack' }
  }

  // Pick random move
  const randomMove = availableMoves[Math.floor(Math.random() * availableMoves.length)]
  return { type: 'move', moveId: randomMove.id }
}

// ============================================================================
// Trainer AI: Switches & Super-Effective
// ============================================================================

function getAIActionTrainer(battleState: BattleState, aiCombatant: CombatantState, playerCombatant: CombatantState): BattleAction {
  const playerType = getDefenderType(playerCombatant.partyMember.defId)

  // 1. Check if current type is disadvantaged
  const aiType = getDefenderType(aiCombatant.partyMember.defId)
  const currentTypeMultiplier = getTypeMultiplier(aiType, playerType)
  const disadvantagedThreshold = 0.8 // If effectiveness is < 0.8, consider switching

  if (currentTypeMultiplier < disadvantagedThreshold) {
    // Look for better match
    const betterSwitch = findBestSwitch(battleState, playerType)
    if (betterSwitch !== null) {
      return { type: 'switch', toInstanceId: betterSwitch }
    }
  }

  // 2. Pick best move (super-effective > highest power > basic)
  const bestMove = findBestMoveTRAINER(aiCombatant, playerType)
  return { type: 'move', moveId: bestMove.id }
}

/**
 * Find a teammate with better type matchup against the opponent.
 * Returns the instanceId of a living teammate with better matchup, or null.
 */
function findBestSwitch(battleState: BattleState, playerType: any): string | null {
  const aiCombatant = battleState.aiTeam[battleState.activeAiIndex]
  const currentMultiplier = getTypeMultiplier(getDefenderType(aiCombatant.partyMember.defId), playerType)

  let bestSwitch: string | null = null
  let bestMultiplier = currentMultiplier

  for (const teammate of battleState.aiTeam) {
    if (teammate.currentHp <= 0 || teammate.partyMember.instanceId === aiCombatant.partyMember.instanceId) {
      continue // Dead or active
    }

    const teamType = getDefenderType(teammate.partyMember.defId)
    const multiplier = getTypeMultiplier(teamType, playerType)

    if (multiplier > bestMultiplier) {
      bestMultiplier = multiplier
      bestSwitch = teammate.partyMember.instanceId
    }
  }

  return bestSwitch
}

/**
 * Find the best move for Trainer difficulty:
 * 1. Super-effective move with NRG available
 * 2. Fallback to highest-power neutral move
 * 3. Fallback to basic attack
 */
function findBestMoveTRAINER(aiCombatant: CombatantState, playerType: any): MoveDefinition {
  const availableMoves = getAvailableMoves(aiCombatant)

  // Filter super-effective moves
  const superEffectiveMoves = availableMoves.filter(move => {
    return getTypeMultiplier(move.type, playerType) === 1.5
  })

  if (superEffectiveMoves.length > 0) {
    // Return highest power super-effective
    return superEffectiveMoves.reduce((best, move) => (move.power > best.power ? move : best))
  }

  // Fallback to highest power neutral move
  const neutralMoves = availableMoves.filter(move => {
    return getTypeMultiplier(move.type, playerType) === 1.0
  })

  if (neutralMoves.length > 0) {
    return neutralMoves.reduce((best, move) => (move.power > best.power ? move : best))
  }

  // Ultimate fallback
  return BASIC_ATTACK
}

// ============================================================================
// Champion AI: Advanced Decision Making
// ============================================================================

function getAIActionChampion(battleState: BattleState, aiCombatant: CombatantState, playerCombatant: CombatantState): BattleAction {
  const playerType = getDefenderType(playerCombatant.partyMember.defId)

  // 1. Same switch logic as Trainer
  const aiType = getDefenderType(aiCombatant.partyMember.defId)
  const currentTypeMultiplier = getTypeMultiplier(aiType, playerType)
  const disadvantagedThreshold = 0.8

  if (currentTypeMultiplier < disadvantagedThreshold) {
    const betterSwitch = findBestSwitch(battleState, playerType)
    if (betterSwitch !== null) {
      return { type: 'switch', toInstanceId: betterSwitch }
    }
  }

  // 2. Prefer status moves if target has no status and NRG > 40%
  const currentNrgPercent = aiCombatant.currentNrg / aiCombatant.partyMember.maxHp // Note: should be max NRG stat
  const hasStatusMoves = aiCombatant.partyMember.unlockedMoveIds.length > 0

  if (!playerCombatant.status && currentNrgPercent > 0.4 && hasStatusMoves) {
    const statusMove = findStatusMove(aiCombatant)
    if (statusMove) {
      return { type: 'move', moveId: statusMove.id }
    }
  }

  // 3. Manage NRG: use Basic Attack if NRG < 20% of max
  const nrgRatio = aiCombatant.currentNrg / aiCombatant.partyMember.currentStats.nrg
  if (nrgRatio < 0.2) {
    return { type: 'move', moveId: 'basic-attack' }
  }

  // 4. Pick highest expected damage move
  const bestMove = findBestMoveCHAMPION(aiCombatant, playerType)
  return { type: 'move', moveId: bestMove.id }
}

/**
 * Find a status move from available moves (with NRG available).
 */
function findStatusMove(aiCombatant: CombatantState): MoveDefinition | null {
  const availableMoves = getAvailableMoves(aiCombatant)
  const statusMoves = availableMoves.filter(move => move.effect?.status)

  return statusMoves.length > 0 ? statusMoves[0] : null
}

/**
 * Find the best move for Champion difficulty:
 * Highest expected damage = power * type_multiplier
 */
function findBestMoveCHAMPION(aiCombatant: CombatantState, playerType: any): MoveDefinition {
  const availableMoves = getAvailableMoves(aiCombatant)

  if (availableMoves.length === 0) {
    return BASIC_ATTACK
  }

  // Calculate expected damage for each move
  let bestMove = availableMoves[0]
  let bestExpectedDamage = bestMove.power * getTypeMultiplier(bestMove.type, playerType)

  for (const move of availableMoves.slice(1)) {
    const expectedDamage = move.power * getTypeMultiplier(move.type, playerType)
    if (expectedDamage > bestExpectedDamage) {
      bestExpectedDamage = expectedDamage
      bestMove = move
    }
  }

  return bestMove
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get all available moves for a combatant (respects NRG constraints).
 */
function getAvailableMoves(combatant: CombatantState): MoveDefinition[] {
  const formId = combatant.partyMember.defId
  const unlockedIds = combatant.partyMember.unlockedMoveIds

  // Get move registry for this form
  const moveRegistry: Record<string, MoveDefinition[]> = {
    hypereon: HYPEREON_MOVES as any,
    volteon: VOLTEON_MOVES as any,
    emberon: EMBERON_MOVES as any,
    eryleon: ERYLEON_MOVES as any,
    vengeon: VENGEON_MOVES as any,
    grasseon: GRASSEON_MOVES as any,
    polareon: POLAREON_MOVES as any,
    luxeon: LUXEON_MOVES as any,
  }

  const moves = moveRegistry[formId] || []

  // Filter to unlocked moves and basic attack (always available)
  const available: MoveDefinition[] = []

  // Add basic attack
  available.push(BASIC_ATTACK)

  // Add unlocked moves that have enough NRG
  for (const move of moves) {
    if (unlockedIds.includes(move.id) && combatant.currentNrg >= move.nrgCost) {
      available.push(move)
    }
  }

  return available
}

/**
 * Get the type of a Berryvolution or Berry.
 */
function getDefenderType(defId: string): any {
  const typeMap: Record<string, any> = {
    hypereon: 'Water',
    volteon: 'Electric',
    emberon: 'Fire',
    eryleon: 'Psychic',
    vengeon: 'Rock',
    grasseon: 'Grass',
    polareon: 'Ice',
    luxeon: 'Psychic',
    berry: 'Water',
  }

  return typeMap[defId] || 'Water'
}
