import { BattleState, CombatantState, PartyMember, ArenaTier } from '../data/types'
import { BERRYVOLUTION_LIST } from '../data/berryvolutions'
import { computeStats } from './leveling'
import { ARENA_TIERS } from '../data/config'

// ============================================================================
// Battle Initialization
// ============================================================================

/**
 * Initialize a BattleState for a new arena match.
 *
 * - Converts player party to CombatantStates
 * - Generates AI team (1-2 random Berryvolutions)
 * - Sets difficulty based on arena tier
 * - Initializes turn counter, log, and phase
 *
 * @param playerTeam - Selected player party (1-2 members)
 * @param arenaTier - Current arena tier (determines AI difficulty)
 * @returns Fully initialized BattleState
 * @throws Error if playerTeam is empty or has > 2 members
 */
export function initializeBattle(playerTeam: PartyMember[], arenaTier: ArenaTier): BattleState {
  if (playerTeam.length === 0 || playerTeam.length > 2) {
    throw new Error('Player team must have 1-2 members')
  }

  // Get AI difficulty from tier
  const tierConfig = Object.values(ARENA_TIERS).find(t => t.tier === arenaTier)
  const aiDifficulty = tierConfig?.aiDifficulty ?? 'Rookie'

  // Convert player party to CombatantStates
  const playerCombatants: CombatantState[] = playerTeam.map(member =>
    createCombatant(member)
  )

  // Generate AI team (1-2 random Berryvolutions, not unevolved Berry)
  const aiTeam = generateAiTeam(arenaTier === 'Apex' ? 2 : 1)

  return {
    playerTeam: playerCombatants,
    aiTeam,
    activePlayerIndex: 0,
    activeAiIndex: 0,
    turn: 1,
    log: ['Battle started!'],
    phase: 'action-select',
    outcome: null,
    aiDifficulty,
  }
}

// ============================================================================
// Helper: Create CombatantState from PartyMember
// ============================================================================

/**
 * Convert a PartyMember into a CombatantState for battle.
 *
 * - Sets currentHp and currentNrg to base values
 * - Initializes stat modifiers to 1.0 (neutral)
 * - No initial status effect
 * - Resets trait state
 *
 * @param member - The party member to convert
 * @returns CombatantState ready for battle
 */
function createCombatant(member: PartyMember): CombatantState {
  return {
    partyMember: member,
    currentHp: member.maxHp,
    currentNrg: member.currentStats.nrg,
    status: null,
    statusTurnsLeft: 0,
    traitState: {},
    statModifiers: {
      atk: 1,
      def: 1,
      spd: 1,
    },
  }
}

// ============================================================================
// Helper: Generate AI Team
// ============================================================================

/**
 * Generate a random AI team for the battle.
 *
 * Selects random Berryvolutions (evolved forms only, no unevolved Berry).
 * Each AI member is at a level proportional to their Berryvolution's role.
 *
 * @param teamSize - Number of AI team members (1 or 2)
 * @returns Array of CombatantStates ready for battle
 */
function generateAiTeam(teamSize: number): CombatantState[] {
  const shuffled = [...BERRYVOLUTION_LIST].sort(() => Math.random() - 0.5)
  const selected = shuffled.slice(0, teamSize)

  return selected.map(def => {
    // AI Berryvolutions start at level 15-25
    const level = 15 + Math.floor(Math.random() * 11)
    const stats = computeStats(def.id, level)

    const aiMember: PartyMember = {
      instanceId: `ai-${def.id}-${Date.now()}`,
      defId: def.id,
      level,
      xp: 0,
      currentStats: stats,
      maxHp: stats.hp,
      unlockedMoveIds: [], // AI moves are determined by combat logic
    }

    return createCombatant(aiMember)
  })
}
