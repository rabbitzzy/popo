import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getAIAction } from './ai'
import { computeStats } from './leveling'
import { BattleState, CombatantState } from '../data/types'
import { HYPEREON_MOVES, VOLTEON_MOVES, EMBERON_MOVES, ERYLEON_MOVES } from '../data/moves'

describe('AI Engine', () => {
  // =========================================================================
  // Helper Functions
  // =========================================================================

  const createCombatant = (defId: string, level: number, unlockedMoveIds: string[] = []): CombatantState => {
    const stats = computeStats(defId, level)
    return {
      partyMember: {
        instanceId: `${defId}-1`,
        defId: defId as any,
        level,
        xp: 0,
        currentStats: stats,
        maxHp: stats.hp,
        unlockedMoveIds,
      },
      currentHp: stats.hp,
      currentNrg: stats.nrg,
      status: null,
      statusTurnsLeft: 0,
      traitState: {},
      statModifiers: { atk: 1, def: 1, spd: 1 },
    }
  }

  const createBattleState = (
    aiTeam: CombatantState[],
    playerTeam: CombatantState[],
    difficulty: 'Rookie' | 'Trainer' | 'Champion' = 'Rookie',
    activeAiIndex = 0,
    activePlayerIndex = 0
  ): BattleState => ({
    playerTeam,
    aiTeam,
    activePlayerIndex,
    activeAiIndex,
    turn: 1,
    log: [],
    phase: 'action-select',
    outcome: null,
    aiDifficulty: difficulty,
  })

  // =========================================================================
  // Rookie AI Tests
  // =========================================================================

  describe('Rookie AI', () => {
    it('should return a valid move action', () => {
      const aiTeam = [createCombatant('hypereon', 10, ['hypereon-splash-shot', 'hypereon-soak-mist'])]
      const playerTeam = [createCombatant('volteon', 10)]
      const state = createBattleState(aiTeam, playerTeam, 'Rookie')

      const action = getAIAction(state)

      expect(action.type).toBe('move')
      expect(typeof (action as any).moveId).toBe('string')
    })

    it('should pick a move with sufficient NRG', () => {
      const ai = createCombatant('hypereon', 10, ['hypereon-splash-shot', 'hypereon-soak-mist'])
      ai.currentNrg = 15 // Only enough for basic-attack and splash-shot (20 NRG)
      const aiTeam = [ai]
      const playerTeam = [createCombatant('volteon', 10)]
      const state = createBattleState(aiTeam, playerTeam, 'Rookie')

      vi.spyOn(Math, 'random').mockReturnValue(0.5)

      const action = getAIAction(state)

      // Should only pick from moves with NRG <= 15
      expect(action.type).toBe('move')
      const moveId = (action as any).moveId
      // Basic attack (0 cost) or soak-mist (15 cost) should be available
      expect(['basic-attack', 'hypereon-soak-mist']).toContain(moveId)
    })

    it('should always include basic attack in available moves', () => {
      const ai = createCombatant('hypereon', 10)
      ai.currentNrg = 0 // No NRG for special moves
      const aiTeam = [ai]
      const playerTeam = [createCombatant('volteon', 10)]
      const state = createBattleState(aiTeam, playerTeam, 'Rookie')

      const action = getAIAction(state)

      expect(action.type).toBe('move')
      expect((action as any).moveId).toBe('basic-attack')
    })

    it('should pick random moves (distribution test)', () => {
      const aiTeam = [createCombatant('hypereon', 10, ['hypereon-splash-shot', 'hypereon-soak-mist', 'hypereon-tide-crash'])]
      const playerTeam = [createCombatant('volteon', 10)]

      vi.restoreAllMocks()

      // Run 100 trials and collect moves
      const moveChoices = new Set<string>()
      for (let i = 0; i < 100; i++) {
        const state = createBattleState(aiTeam, playerTeam, 'Rookie')
        const action = getAIAction(state)
        moveChoices.add((action as any).moveId)
      }

      // Should pick different moves (at least 2 different types)
      expect(moveChoices.size).toBeGreaterThan(1)
    })
  })

  // =========================================================================
  // Trainer AI Tests
  // =========================================================================

  describe('Trainer AI', () => {
    it('should switch to better type matchup when disadvantaged', () => {
      // Emberon (Fire) vs Hypereon (Water) — Fire is weak to Water (0.67x)
      const ai = createCombatant('emberon', 10, ['emberon-ember'])
      const backup = createCombatant('volteon', 10) // Electric is strong against Water (1.5x)
      const aiTeam = [ai, backup]
      const playerTeam = [createCombatant('hypereon', 10)] // Water
      const state = createBattleState(aiTeam, playerTeam, 'Trainer')

      vi.spyOn(Math, 'random').mockReturnValue(0.5)

      const action = getAIAction(state)

      // Should switch to backup (better matchup)
      expect(action.type).toBe('switch')
      expect((action as any).toInstanceId).toBe('volteon-1')
    })

    it('should not switch if no better option available', () => {
      const ai = createCombatant('emberon', 10, ['emberon-ember'])
      const backup = createCombatant('volteon', 10) // Worse matchup than Emberon
      const aiTeam = [ai, backup]
      const playerTeam = [createCombatant('volteon', 10)]
      const state = createBattleState(aiTeam, playerTeam, 'Trainer')

      vi.spyOn(Math, 'random').mockReturnValue(0.5)

      const action = getAIAction(state)

      // Should move, not switch (no good option)
      expect(action.type).toBe('move')
    })

    it('should prefer super-effective moves', () => {
      // Hypereon (Water) vs Emberon (Fire) — Water is super-effective
      const ai = createCombatant('hypereon', 10, ['hypereon-splash-shot', 'hypereon-soak-mist', 'hypereon-tide-crash', 'hypereon-tidal-wave'])
      const aiTeam = [ai]
      const playerTeam = [createCombatant('emberon', 10)]
      const state = createBattleState(aiTeam, playerTeam, 'Trainer')

      vi.spyOn(Math, 'random').mockReturnValue(0.5)

      const action = getAIAction(state)

      expect(action.type).toBe('move')
      // Should pick highest-power super-effective Water move (Tidal Wave is 90 power)
      expect((action as any).moveId).toBe('hypereon-tidal-wave')
    })

    it('should fallback to neutral moves if no super-effective available', () => {
      // Hypereon (Water) vs Hypereon (Water) — no super-effective
      const ai = createCombatant('hypereon', 10, ['hypereon-splash-shot'])
      const aiTeam = [ai]
      const playerTeam = [createCombatant('hypereon', 10)]
      const state = createBattleState(aiTeam, playerTeam, 'Trainer')

      vi.spyOn(Math, 'random').mockReturnValue(0.5)

      const action = getAIAction(state)

      expect(action.type).toBe('move')
      // Should pick a move (Water vs Water is neutral)
      expect((action as any).moveId).toBe('hypereon-splash-shot')
    })

    it('should only switch to living teammates', () => {
      const ai = createCombatant('emberon', 10, ['emberon-ember'])
      const backup = createCombatant('hypereon', 10)
      backup.currentHp = 0 // Dead backup
      const aiTeam = [ai, backup]
      const playerTeam = [createCombatant('volteon', 10)]
      const state = createBattleState(aiTeam, playerTeam, 'Trainer')

      vi.spyOn(Math, 'random').mockReturnValue(0.5)

      const action = getAIAction(state)

      // Should not switch to dead backup, should move instead
      expect(action.type).toBe('move')
    })
  })

  // =========================================================================
  // Champion AI Tests
  // =========================================================================

  describe('Champion AI', () => {
    it('should use switch logic from Trainer', () => {
      // Emberon (Fire) vs Hypereon (Water) — Fire is weak to Water
      const ai = createCombatant('emberon', 10, ['emberon-ember'])
      const backup = createCombatant('volteon', 10) // Electric is strong against Water
      const aiTeam = [ai, backup]
      const playerTeam = [createCombatant('hypereon', 10)] // Water
      const state = createBattleState(aiTeam, playerTeam, 'Champion')

      vi.spyOn(Math, 'random').mockReturnValue(0.5)

      const action = getAIAction(state)

      // Should switch to better matchup
      expect(action.type).toBe('switch')
      expect((action as any).toInstanceId).toBe('volteon-1')
    })

    it('should prefer status moves when target has no status and NRG > 40%', () => {
      const ai = createCombatant('hypereon', 10, ['hypereon-splash-shot', 'hypereon-soak-mist'])
      ai.currentNrg = 80 // Well above 40% of max NRG
      const aiTeam = [ai]
      const playerTeam = [createCombatant('emberon', 10)]
      const state = createBattleState(aiTeam, playerTeam, 'Champion')

      vi.spyOn(Math, 'random').mockReturnValue(0.5)

      const action = getAIAction(state)

      // Should pick status move (Soak Mist applies Soak status)
      expect(action.type).toBe('move')
      expect((action as any).moveId).toBe('hypereon-soak-mist')
    })

    it('should not prefer status move if target already has status', () => {
      const ai = createCombatant('hypereon', 10, ['hypereon-splash-shot', 'hypereon-soak-mist'])
      ai.currentNrg = 80
      const aiTeam = [ai]
      const player = createCombatant('emberon', 10)
      player.status = 'Burn' // Already has status
      const playerTeam = [player]
      const state = createBattleState(aiTeam, playerTeam, 'Champion')

      vi.spyOn(Math, 'random').mockReturnValue(0.5)

      const action = getAIAction(state)

      // Should pick highest damage move instead
      expect(action.type).toBe('move')
      // With Burn applied, should pick damage move (Tidal Wave or Splash Shot)
      const moveId = (action as any).moveId
      expect(['hypereon-splash-shot', 'hypereon-tide-crash', 'hypereon-tidal-wave']).toContain(moveId)
    })

    it('should use Basic Attack when NRG < 20% of max', () => {
      const ai = createCombatant('hypereon', 10, ['hypereon-splash-shot', 'hypereon-tide-crash'])
      ai.currentNrg = Math.floor(ai.partyMember.currentStats.nrg * 0.15) // 15% of max
      const aiTeam = [ai]
      const playerTeam = [createCombatant('emberon', 10)]
      const state = createBattleState(aiTeam, playerTeam, 'Champion')

      vi.spyOn(Math, 'random').mockReturnValue(0.5)

      const action = getAIAction(state)

      // Should use basic attack (only 0 NRG cost)
      expect(action.type).toBe('move')
      expect((action as any).moveId).toBe('basic-attack')
    })

    it('should pick highest expected damage move', () => {
      // Expected damage = power * type_multiplier
      // Water moves vs Fire: 1.5x multiplier
      // So Water move with power 90 = 135 expected damage
      // Fire move with power 130 = 130 expected damage (1.0 multiplier vs Fire)
      const ai = createCombatant('hypereon', 10, ['hypereon-tidal-wave', 'hypereon-splash-shot'])
      ai.currentNrg = 100
      const aiTeam = [ai]
      const playerTeam = [createCombatant('emberon', 10)]
      const state = createBattleState(aiTeam, playerTeam, 'Champion')

      vi.spyOn(Math, 'random').mockReturnValue(0.5)

      const action = getAIAction(state)

      // Tidal Wave (90 power, Water type) vs Emberon (Fire) = 90 * 1.5 = 135
      // Splash Shot (40 power, Water type) vs Emberon (Fire) = 40 * 1.5 = 60
      // Should pick Tidal Wave
      expect(action.type).toBe('move')
      expect((action as any).moveId).toBe('hypereon-tidal-wave')
    })

    it('should respect NRG costs when picking moves', () => {
      const ai = createCombatant('hypereon', 10, ['hypereon-splash-shot', 'hypereon-tidal-wave'])
      ai.currentNrg = 30 // Enough for Splash Shot (20), not enough for Tidal Wave (45)
      const aiTeam = [ai]
      const playerTeam = [createCombatant('emberon', 10)]
      const state = createBattleState(aiTeam, playerTeam, 'Champion')

      vi.spyOn(Math, 'random').mockReturnValue(0.5)

      const action = getAIAction(state)

      // Can't use Tidal Wave (45 cost), should use Splash Shot (20 cost)
      expect(action.type).toBe('move')
      expect((action as any).moveId).toBe('hypereon-splash-shot')
    })
  })

  // =========================================================================
  // Integration & Edge Case Tests
  // =========================================================================

  describe('AI Decision Integration', () => {
    it('should handle empty unlocked moves gracefully', () => {
      const ai = createCombatant('hypereon', 10) // No unlocked moves
      const aiTeam = [ai]
      const playerTeam = [createCombatant('volteon', 10)]
      const state = createBattleState(aiTeam, playerTeam, 'Trainer')

      const action = getAIAction(state)

      // Should default to basic attack
      expect(action.type).toBe('move')
      expect((action as any).moveId).toBe('basic-attack')
    })

    it('should work with mixed NRG availability across moves', () => {
      const ai = createCombatant('hypereon', 10, ['hypereon-splash-shot', 'hypereon-soak-mist', 'hypereon-tide-crash'])
      ai.currentNrg = 22 // Enough for basic attack and splash-shot (20), but not soak-mist (15)? Actually 15 < 22, so soak-mist is available
      // Let me recalculate: splash-shot (20), soak-mist (15), tide-crash (25)
      // With 22 NRG, can use: basic-attack (0), splash-shot (20), soak-mist (15)
      const aiTeam = [ai]
      const playerTeam = [createCombatant('emberon', 10)]
      const state = createBattleState(aiTeam, playerTeam, 'Rookie')

      vi.spyOn(Math, 'random').mockReturnValue(0.5)

      const action = getAIAction(state)

      expect(action.type).toBe('move')
      const moveId = (action as any).moveId
      expect(['basic-attack', 'hypereon-splash-shot', 'hypereon-soak-mist']).toContain(moveId)
    })

    it('should handle all difficulty levels for same scenario', () => {
      const aiTeam = [createCombatant('hypereon', 10, ['hypereon-splash-shot', 'hypereon-soak-mist'])]
      const playerTeam = [createCombatant('emberon', 10)]

      vi.spyOn(Math, 'random').mockReturnValue(0.5)

      // Test each difficulty
      const rookieState = createBattleState([...aiTeam], [...playerTeam], 'Rookie')
      const trainerState = createBattleState([...aiTeam], [...playerTeam], 'Trainer')
      const championState = createBattleState([...aiTeam], [...playerTeam], 'Champion')

      const rookieAction = getAIAction(rookieState)
      const trainerAction = getAIAction(trainerState)
      const championAction = getAIAction(championState)

      // All should return valid actions
      expect(rookieAction.type).toBe('move')
      expect(trainerAction.type).toBe('move')
      expect(championAction.type).toBe('move')
    })

    it('should handle type advantages across different Berryvolution matchups', () => {
      const testCases = [
        { aiForm: 'hypereon', playerForm: 'emberon', shouldPreferAI: true }, // Water > Fire
        { aiForm: 'volteon', playerForm: 'grasseon', shouldPreferAI: false }, // Electric < Grass (Grass neutral to Electric)
        { aiForm: 'grasseon', playerForm: 'hypereon', shouldPreferAI: true }, // Grass < Water, so shouldn't prefer but neutral
      ]

      for (const testCase of testCases) {
        const ai = createCombatant(testCase.aiForm, 10)
        const aiTeam = [ai]
        const playerTeam = [createCombatant(testCase.playerForm, 10)]
        const state = createBattleState(aiTeam, playerTeam, 'Trainer')

        vi.spyOn(Math, 'random').mockReturnValue(0.5)

        const action = getAIAction(state)

        // Should always return a valid action
        expect(action.type).toBe('move')
      }
    })
  })
})
