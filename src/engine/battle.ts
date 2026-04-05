import { CombatantState, MoveDefinition, StatusEffect, BattleState, BattleAction, BattleOutcome } from '../data/types'
import { getTypeMultiplier } from '../data/typeChart'
import { STATUS_DURATIONS } from '../data/config'
import { HYPEREON_MOVES, VOLTEON_MOVES, EMBERON_MOVES, ERYLEON_MOVES, VENGEON_MOVES, GRASSEON_MOVES, POLAREON_MOVES, LUXEON_MOVES, BASIC_ATTACK } from '../data/moves'
import { getBerryType } from '../data/berryVariants'

// ============================================================================
// Damage Calculation
// ============================================================================

/**
 * Calculate damage for an attack.
 *
 * Formula (from DESIGN.md §5.2):
 * - Physical: (power / 50) * ATK * typeMultiplier * variance - DEF * 0.5
 * - Special: (power / 50) * NRG * typeMultiplier * variance
 *
 * Variance: 0.85 + random() * 0.15 (range 0.85 to 1.00)
 * Minimum damage: 1
 * Critical hits: 10% chance for ×1.5 damage
 *
 * Trait interactions:
 * - Volatile (Emberon): +15% outgoing, +10% incoming
 * - Dark Shroud (Vengeon): Psychic moves deal 0 damage
 * - Frost Armor (Polareon): first hit reduced by 30%
 *
 * @param move - The move being used
 * @param attacker - The attacking combatant
 * @param defender - The defending combatant
 * @returns Damage dealt (minimum 1), with isCrit flag in state
 */
export function calcDamage(
  move: MoveDefinition,
  attacker: CombatantState,
  defender: CombatantState
): number {
  // Get attacker's type (Berry has type based on skin, Berryvolutions have fixed types)
  const attackerType = attacker.partyMember.defId === 'berry' 
    ? getBerryType(attacker.partyMember.skinId)
    : getAttackerType(attacker.partyMember.defId)
  
  const defenderType = getDefenderType(defender.partyMember.defId)
  
  // Type effectiveness: move type vs defender type
  const typeMultiplier = getTypeMultiplier(move.type, defenderType)
  const variance = 0.85 + Math.random() * 0.15

  // Dark Shroud: Psychic moves deal 0 damage to Vengeon
  if (defender.partyMember.defId === 'vengeon' && move.type === 'Psychic') {
    return 0
  }

  let raw: number

  if (move.category === 'Physical') {
    const atkStat = attacker.partyMember.currentStats.atk * attacker.statModifiers.atk
    const defStat = defender.partyMember.currentStats.def * defender.statModifiers.def
    // FIXED: Defense reduces damage by percentage instead of flat subtraction
    // This prevents damage from being reduced to 1 against higher-level opponents
    // Formula: (power/50 * ATK * typeMult * variance) * (1 - DEF/200)
    const baseDamage = (move.power / 50) * atkStat * typeMultiplier * variance
    const defenseMultiplier = Math.max(0.2, 1 - (defStat / 200)) // Min 20% damage
    raw = baseDamage * defenseMultiplier
  } else {
    // Special move uses NRG stat (current NRG, not base)
    const nrgStat = attacker.currentNrg
    raw = (move.power / 50) * nrgStat * typeMultiplier * variance
  }

  // Volatile trait: +15% outgoing damage for Emberon
  if (attacker.partyMember.defId === 'emberon') {
    raw *= 1.15
  }

  // Volatile trait: +10% incoming damage to Emberon
  if (defender.partyMember.defId === 'emberon') {
    raw *= 1.1
  }

  // Frost Armor: first hit reduced by 30%
  if (defender.partyMember.defId === 'polareon' && !defender.traitState.frostArmorUsed) {
    raw *= 0.7
    defender.traitState.frostArmorUsed = true
  }

  // Critical hit: 10% chance for ×1.5 damage
  const isCrit = Math.random() < 0.10
  if (isCrit) {
    raw *= 1.5
  }

  return Math.max(1, Math.floor(raw))
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get the type of a Berryvolution.
 * Used for type effectiveness calculations.
 */
function getAttackerType(defId: string): 'Fire' | 'Water' | 'Grass' | 'Electric' | 'Rock' | 'Ice' | 'Psychic' {
  const typeMap: Record<string, any> = {
    hypereon: 'Water',
    volteon: 'Electric',
    emberon: 'Fire',
    eryleon: 'Psychic',
    vengeon: 'Rock', // Dark is expressed via Dark Shroud trait
    grasseon: 'Grass',
    polareon: 'Ice',
    luxeon: 'Psychic', // Fairy is expressed via Fairy Charm trait
  }

  return typeMap[defId] || 'Water'
}

/**
 * Get the type of a Berryvolution or Berry.
 * Berry is Water type by default (for compatibility).
 */
function getDefenderType(defId: string): 'Fire' | 'Water' | 'Grass' | 'Electric' | 'Rock' | 'Ice' | 'Psychic' {
  const typeMap: Record<string, any> = {
    hypereon: 'Water',
    volteon: 'Electric',
    emberon: 'Fire',
    eryleon: 'Psychic',
    vengeon: 'Rock', // Dark is expressed via Dark Shroud trait
    grasseon: 'Grass',
    polareon: 'Ice',
    luxeon: 'Psychic', // Fairy is expressed via Fairy Charm trait
    berry: 'Water',
  }

  return typeMap[defId] || 'Water'
}

// ============================================================================
// Status Effects
// ============================================================================

/**
 * Apply a status effect to a combatant.
 *
 * A combatant can hold only one status at a time — a new one replaces the old.
 * Status durations are defined in config.ts.
 *
 * @param combatant - The combatant to inflict status on
 * @param status - The status to apply
 */
export function applyStatus(combatant: CombatantState, status: StatusEffect): void {
  if (!status) return

  combatant.status = status
  combatant.statusTurnsLeft = getStatusDuration(status)

  // Apply stat modifiers based on status
  switch (status) {
    case 'Burn':
      combatant.statModifiers.atk *= 0.8 // ATK -20%
      break
    case 'Shock':
      combatant.statModifiers.spd *= 0.5 // SPD halved
      break
    case 'Wilt':
      combatant.statModifiers.def *= 0.9 // DEF -10%
      break
    case 'Shatter':
      combatant.statModifiers.def *= 0.75 // DEF -25%
      break
    // Freeze, Soak, Confuse don't have immediate stat modifiers
    // (Freeze prevents action, Soak reduces Fire damage, Confuse is a 30% check during action)
  }
}

/**
 * Get the duration (in turns) for a status effect.
 *
 * @param status - The status effect
 * @returns Duration in turns
 */
function getStatusDuration(status: StatusEffect): number {
  if (!status) return 0

  const durations = STATUS_DURATIONS as Record<string, any>
  const duration = durations[status]

  // Freeze has a range; default to max for initialization (actual thaw handled in tickStatus)
  if (status === 'Freeze' && typeof duration === 'object') {
    return duration.max
  }

  return typeof duration === 'number' ? duration : 0
}

/**
 * Process status effect damage and duration countdown.
 *
 * Called at end-of-turn. Applies damage (Burn), handles Freeze thaw check,
 * and decrements duration.
 *
 * Freeze: 50% chance to thaw each turn. If thawed, status clears.
 * Burn: Inflicts -5% maxHp damage each turn.
 *
 * @param combatant - The combatant with status
 * @returns Damage inflicted by status (e.g., Burn damage), or 0 if none
 */
export function tickStatus(combatant: CombatantState): number {
  if (!combatant.status) return 0

  let damageInflicted = 0

  switch (combatant.status) {
    case 'Burn':
      // Burn: -5% maxHp per turn
      damageInflicted = Math.floor(combatant.partyMember.maxHp * 0.05)
      break

    case 'Freeze':
      // Freeze: 50% thaw chance each turn
      if (Math.random() < 0.5) {
        combatant.status = null
        combatant.statusTurnsLeft = 0
        return 0
      }
      break

    case 'Shock':
    case 'Soak':
    case 'Wilt':
    case 'Shatter':
    case 'Confuse':
      // These don't have end-of-turn damage; they're handled elsewhere
      break
  }

  // Decrement duration
  combatant.statusTurnsLeft -= 1

  // Clear status if duration expired
  if (combatant.statusTurnsLeft <= 0) {
    combatant.status = null
  }

  return damageInflicted
}

/**
 * Check if a Berryvolution can act (not Frozen or Confused self-hit).
 *
 * Freeze: Prevents action entirely.
 * Confuse: 30% chance to fail action (hurt self instead).
 *
 * @param combatant - The combatant
 * @returns true if can act, false if Frozen or Confused self-hit occurred
 */
export function canAct(combatant: CombatantState): boolean {
  if (combatant.status === 'Freeze') {
    return false
  }

  if (combatant.status === 'Confuse' && Math.random() < 0.3) {
    return false // 30% chance Confuse prevents action
  }

  return true
}

/**
 * Check if Fire moves are affected by Soak status.
 *
 * Soak: Fire moves against this target deal ×0.5 damage.
 *
 * @param defender - The defending combatant
 * @param moveType - The type of the move being used
 * @returns Damage multiplier (1.0 normally, 0.5 if Soak + Fire move)
 */
export function getSoakMultiplier(defender: CombatantState, moveType: string): number {
  if (defender.status === 'Soak' && moveType === 'Fire') {
    return 0.5
  }
  return 1.0
}

// ============================================================================
// Turn Resolution
// ============================================================================

/**
 * Resolve a single turn in battle.
 *
 * Full resolution order:
 * 1. Collect both actions (already provided as params)
 * 2. Process switches first (both sides, simultaneous)
 * 3. Sort remaining moves by effective SPD (with Volteon Swift handling)
 * 4. For each move: check accuracy, can act, apply damage, apply status, Thorn Guard
 * 5. End-of-turn effects: Hydration, Burn tick, status countdown
 * 6. Check faint conditions
 * 7. Trigger Fairy Charm if Luxeon faints
 * 8. Check win/loss/draw
 *
 * @param battleState - The current battle state
 * @param playerAction - The player's chosen action
 * @param aiAction - The AI's chosen action
 * @returns Updated battle state after the turn
 */
export function resolveTurn(
  battleState: BattleState,
  playerAction: BattleAction,
  aiAction: BattleAction
): BattleState {
  const state = JSON.parse(JSON.stringify(battleState)) as BattleState // Deep copy

  // =========================================================================
  // 2. Process switches first (both sides, simultaneous)
  // =========================================================================

  if (playerAction.type === 'switch') {
    const newMember = state.playerTeam.find(c => c.partyMember.instanceId === playerAction.toInstanceId)
    if (newMember) {
      // Swap active player member
      const oldIndex = state.activePlayerIndex
      state.activePlayerIndex = state.playerTeam.indexOf(newMember)
      // Record switch in log
      state.log.push(`Player switched to ${newMember.partyMember.defId}`)
    }
  }

  if (aiAction.type === 'switch') {
    const newMember = state.aiTeam.find(c => c.partyMember.instanceId === aiAction.toInstanceId)
    if (newMember) {
      const oldIndex = state.activeAiIndex
      state.activeAiIndex = state.aiTeam.indexOf(newMember)
      state.log.push(`AI switched to ${newMember.partyMember.defId}`)
    }
  }

  // If either side switched, return (switches consume turn)
  if (playerAction.type === 'switch' || aiAction.type === 'switch') {
    state.turn += 1
    return state
  }

  // =========================================================================
  // 3. Sort remaining moves by effective SPD
  // =========================================================================

  const playerCombatant = state.playerTeam[state.activePlayerIndex]
  const aiCombatant = state.aiTeam[state.activeAiIndex]

  if (!playerCombatant || !aiCombatant) {
    return state // Shouldn't happen, but safeguard
  }

  const playerMove = getMoveById(playerAction as any, playerCombatant.partyMember.defId)
  const aiMove = getMoveById(aiAction as any, aiCombatant.partyMember.defId)

  if (!playerMove || !aiMove) {
    return state // Shouldn't happen
  }

  // Calculate effective speed
  const playerSpeed = playerCombatant.partyMember.currentStats.spd * playerCombatant.statModifiers.spd
  const aiSpeed = aiCombatant.partyMember.currentStats.spd * aiCombatant.statModifiers.spd

  // Volteon (Swift): always wins ties
  const playerFirst =
    playerSpeed > aiSpeed ||
    (playerSpeed === aiSpeed && playerCombatant.partyMember.defId === 'volteon') ||
    (playerSpeed === aiSpeed && Math.random() < 0.5)

  const moveOrder = playerFirst
    ? [
        { combatant: playerCombatant, move: playerMove, isPlayer: true },
        { combatant: aiCombatant, move: aiMove, isPlayer: false },
      ]
    : [
        { combatant: aiCombatant, move: aiMove, isPlayer: false },
        { combatant: playerCombatant, move: playerMove, isPlayer: true },
      ]

  // =========================================================================
  // 4. Resolve each move
  // =========================================================================

  for (const { combatant, move, isPlayer } of moveOrder) {
    const defender = isPlayer ? aiCombatant : playerCombatant

    // 4a. Check if can act (Freeze, Confuse)
    if (!canAct(combatant)) {
      if (combatant.status === 'Confuse') {
        const selfDamage = Math.max(1, Math.floor(combatant.partyMember.maxHp * 0.1))
        combatant.currentHp -= selfDamage
        state.log.push(`${combatant.partyMember.defId} is confused and hurt itself for ${selfDamage} damage!`)
      } else {
        state.log.push(`${combatant.partyMember.defId} is frozen! Cannot act.`)
      }
      continue
    }

    // 4b. Deduct NRG cost (Basic Attack restores +8 instead)
    if (move.id === 'basic-attack') {
      combatant.currentNrg = Math.min(
        combatant.partyMember.currentStats.nrg,
        combatant.currentNrg + 8
      )
    } else {
      combatant.currentNrg = Math.max(0, combatant.currentNrg - move.nrgCost)
    }

    // 4c. Check accuracy roll
    const accuracyRoll = Math.random() * 100
    if (accuracyRoll > move.accuracy) {
      state.log.push(`${combatant.partyMember.defId}'s ${move.name} missed!`)
      continue
    }

    // 4c. Apply damage
    let damage = calcDamage(move, combatant, defender)

    // Apply Soak multiplier
    damage = Math.floor(damage * getSoakMultiplier(defender, move.type))

    defender.currentHp -= damage
    state.log.push(`${move.name} hit ${defender.partyMember.defId} for ${damage} damage`)

    // 4d. Apply move effects (status, stat mods)
    if (move.effect?.status) {
      applyStatus(defender, move.effect.status)
      state.log.push(`${defender.partyMember.defId} is now ${move.effect.status.toLowerCase()}`)
    }

    if (move.effect?.statMod) {
      const statKey = move.effect.statMod.stat.toLowerCase() as keyof typeof defender.statModifiers
      if (statKey === 'atk' || statKey === 'def' || statKey === 'spd') {
        defender.statModifiers[statKey] *= 1 + move.effect.statMod.delta / 100
      }
    }

    // 4e. Apply Thorn Guard (Grasseon) if Physical contact
    if (defender.partyMember.defId === 'grasseon' && move.category === 'Physical') {
      const thornDamage = Math.max(1, Math.floor(combatant.currentHp * 0.05))
      combatant.currentHp -= thornDamage
      state.log.push(`Thorn Guard reflects ${thornDamage} damage to ${combatant.partyMember.defId}`)
    }
  }

  // =========================================================================
  // 5. End-of-turn effects
  // =========================================================================

  // 5a. Hydration (Hypereon): +8% maxHp
  if (playerCombatant.partyMember.defId === 'hypereon') {
    const healAmount = Math.floor(playerCombatant.partyMember.maxHp * 0.08)
    playerCombatant.currentHp = Math.min(playerCombatant.currentHp + healAmount, playerCombatant.partyMember.maxHp)
    state.log.push(`${playerCombatant.partyMember.defId} heals with Hydration`)
  }

  if (aiCombatant.partyMember.defId === 'hypereon') {
    const healAmount = Math.floor(aiCombatant.partyMember.maxHp * 0.08)
    aiCombatant.currentHp = Math.min(aiCombatant.currentHp + healAmount, aiCombatant.partyMember.maxHp)
  }

  // 5b. Burn tick: -5% maxHp
  const playerBurnDmg = tickStatus(playerCombatant)
  if (playerBurnDmg > 0) {
    playerCombatant.currentHp -= playerBurnDmg
    state.log.push(`${playerCombatant.partyMember.defId} takes ${playerBurnDmg} damage from Burn`)
  }

  const aiBurnDmg = tickStatus(aiCombatant)
  if (aiBurnDmg > 0) {
    aiCombatant.currentHp -= aiBurnDmg
    state.log.push(`${aiCombatant.partyMember.defId} takes ${aiBurnDmg} damage from Burn`)
  }

  // =========================================================================
  // 6. Check faint conditions
  // =========================================================================

  const playerFainted = playerCombatant.currentHp <= 0
  const aiFainted = aiCombatant.currentHp <= 0

  if (playerFainted) {
    state.log.push(`${playerCombatant.partyMember.defId} fainted!`)

    // 7. Trigger Fairy Charm if Luxeon
    if (playerCombatant.partyMember.defId === 'luxeon') {
      // Find next active player combatant
      const nextPlayerIndex = state.playerTeam.findIndex(c => c !== playerCombatant && c.currentHp > 0)
      if (nextPlayerIndex !== -1) {
        const healAmount = Math.floor(state.playerTeam[nextPlayerIndex].partyMember.maxHp * 0.1)
        state.playerTeam[nextPlayerIndex].currentHp = Math.min(
          state.playerTeam[nextPlayerIndex].currentHp + healAmount,
          state.playerTeam[nextPlayerIndex].partyMember.maxHp
        )
        state.log.push(`Fairy Charm heals ${state.playerTeam[nextPlayerIndex].partyMember.defId}`)
      }
    }
  }

  if (aiFainted) {
    state.log.push(`${aiCombatant.partyMember.defId} fainted!`)

    // Trigger Fairy Charm if Luxeon
    if (aiCombatant.partyMember.defId === 'luxeon') {
      const nextAiIndex = state.aiTeam.findIndex(c => c !== aiCombatant && c.currentHp > 0)
      if (nextAiIndex !== -1) {
        const healAmount = Math.floor(state.aiTeam[nextAiIndex].partyMember.maxHp * 0.1)
        state.aiTeam[nextAiIndex].currentHp = Math.min(
          state.aiTeam[nextAiIndex].currentHp + healAmount,
          state.aiTeam[nextAiIndex].partyMember.maxHp
        )
      }
    }
  }

  // =========================================================================
  // 8. Check win/loss/draw, then handle faint replacements
  // =========================================================================

  const playerTeamFainted = state.playerTeam.every(c => c.currentHp <= 0)
  const aiTeamFainted = state.aiTeam.every(c => c.currentHp <= 0)

  if (playerTeamFainted && aiTeamFainted) {
    state.outcome = 'draw'
    state.phase = 'ended'
  } else if (playerTeamFainted) {
    state.outcome = 'loss'
    state.phase = 'ended'
  } else if (aiTeamFainted) {
    state.outcome = 'win'
    state.phase = 'ended'
  } else {
    // Battle continues — handle faint replacements
    if (aiFainted) {
      // Auto-switch AI to the first alive member
      const nextAiIndex = state.aiTeam.findIndex(c => c.currentHp > 0)
      if (nextAiIndex !== -1) {
        state.activeAiIndex = nextAiIndex
        state.log.push(`AI sends out ${state.aiTeam[nextAiIndex].partyMember.defId}!`)
      }
    }
    if (playerFainted) {
      // Player must choose a replacement before the next action
      state.phase = 'post-faint'
    }
  }

  state.turn += 1
  return state
}

// ============================================================================
// Turn Resolution Helpers
// ============================================================================

/**
 * Get a move definition by ID and combatant form.
 */
function getMoveById(action: BattleAction, formId: string): MoveDefinition | null {
  if (action.type !== 'move') return null

  const moveId = action.moveId

  // Handle basic attack
  if (moveId === 'basic-attack') {
    return BASIC_ATTACK
  }

  // Look up move in form-specific registry
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

  const moves = moveRegistry[formId]
  if (!moves) return null

  return (moves as MoveDefinition[]).find(m => m.id === moveId) || null
}
