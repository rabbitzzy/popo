import { describe, it, expect } from 'vitest'
import { initializeBattle } from './battleSetup'
import { computeStats } from './leveling'
import { BERRYVOLUTION_LIST } from '../data/berryvolutions'

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeEmberon(instanceId = 'emberon-1', level = 5) {
  const stats = computeStats('emberon', level)
  return {
    instanceId,
    defId: 'emberon' as const,
    level,
    xp: 10,
    currentStats: stats,
    maxHp: stats.hp,
    unlockedMoveIds: [],
  }
}

function makeHypereon(instanceId = 'hypereon-1', level = 8) {
  const stats = computeStats('hypereon', level)
  return {
    instanceId,
    defId: 'hypereon' as const,
    level,
    xp: 20,
    currentStats: stats,
    maxHp: stats.hp,
    unlockedMoveIds: [],
  }
}

// ── Test suite ────────────────────────────────────────────────────────────────

describe('Battle Setup', () => {
  // ── Validation ────────────────────────────────────────────────────────────

  it('throws error for empty player team', () => {
    expect(() => initializeBattle([], 'Bronze')).toThrow()
  })

  it('throws error for > 2 members', () => {
    const team = [makeEmberon('em-1'), makeHypereon('hy-1'), makeEmberon('em-2', 10)]
    expect(() => initializeBattle(team, 'Bronze')).toThrow()
  })

  // ── BattleState structure ─────────────────────────────────────────────────

  it('initializes BattleState with player team', () => {
    const team = [makeEmberon('em-1')]
    const state = initializeBattle(team, 'Bronze')
    expect(state.playerTeam).toHaveLength(1)
  })

  it('initializes BattleState with AI team', () => {
    const team = [makeEmberon('em-1')]
    const state = initializeBattle(team, 'Bronze')
    expect(state.aiTeam.length).toBeGreaterThan(0)
  })

  it('sets active indices to 0', () => {
    const team = [makeEmberon('em-1')]
    const state = initializeBattle(team, 'Bronze')
    expect(state.activePlayerIndex).toBe(0)
    expect(state.activeAiIndex).toBe(0)
  })

  it('sets turn to 1', () => {
    const team = [makeEmberon('em-1')]
    const state = initializeBattle(team, 'Bronze')
    expect(state.turn).toBe(1)
  })

  it('initializes log with battle message', () => {
    const team = [makeEmberon('em-1')]
    const state = initializeBattle(team, 'Bronze')
    expect(state.log).toContain('Battle started!')
  })

  it('sets phase to action-select', () => {
    const team = [makeEmberon('em-1')]
    const state = initializeBattle(team, 'Bronze')
    expect(state.phase).toBe('action-select')
  })

  it('sets outcome to null', () => {
    const team = [makeEmberon('em-1')]
    const state = initializeBattle(team, 'Bronze')
    expect(state.outcome).toBeNull()
  })

  // ── Player team conversion ────────────────────────────────────────────────

  it('converts player members to CombatantStates', () => {
    const team = [makeEmberon('em-1')]
    const state = initializeBattle(team, 'Bronze')
    const combatant = state.playerTeam[0]
    expect(combatant.partyMember.defId).toBe('emberon')
  })

  it('sets HP to maxHp', () => {
    const team = [makeEmberon('em-1')]
    const state = initializeBattle(team, 'Bronze')
    const combatant = state.playerTeam[0]
    expect(combatant.currentHp).toBe(combatant.partyMember.maxHp)
  })

  it('sets NRG to current stat value', () => {
    const team = [makeEmberon('em-1')]
    const state = initializeBattle(team, 'Bronze')
    const combatant = state.playerTeam[0]
    expect(combatant.currentNrg).toBe(combatant.partyMember.currentStats.nrg)
  })

  it('initializes stat modifiers to 1.0', () => {
    const team = [makeEmberon('em-1')]
    const state = initializeBattle(team, 'Bronze')
    const combatant = state.playerTeam[0]
    expect(combatant.statModifiers.atk).toBe(1)
    expect(combatant.statModifiers.def).toBe(1)
    expect(combatant.statModifiers.spd).toBe(1)
  })

  it('sets no initial status', () => {
    const team = [makeEmberon('em-1')]
    const state = initializeBattle(team, 'Bronze')
    const combatant = state.playerTeam[0]
    expect(combatant.status).toBeNull()
  })

  it('handles 2-member player team', () => {
    const team = [makeEmberon('em-1'), makeHypereon('hy-1')]
    const state = initializeBattle(team, 'Bronze')
    expect(state.playerTeam).toHaveLength(2)
  })

  // ── AI team generation ────────────────────────────────────────────────────

  it('generates Berryvolutions (not unevolved Berry)', () => {
    const team = [makeEmberon('em-1')]
    const state = initializeBattle(team, 'Bronze')
    state.aiTeam.forEach(combatant => {
      expect(combatant.partyMember.defId).not.toBe('berry')
    })
  })

  it('AI members start at level 3+ for Rookie tier', () => {
    const team = [makeEmberon('em-1')]
    const state = initializeBattle(team, 'Bronze')
    state.aiTeam.forEach(combatant => {
      expect(combatant.partyMember.level).toBeGreaterThanOrEqual(3)
    })
  })

  it('AI members start at level <= 8 for Rookie tier', () => {
    const team = [makeEmberon('em-1')]
    const state = initializeBattle(team, 'Bronze')
    state.aiTeam.forEach(combatant => {
      expect(combatant.partyMember.level).toBeLessThanOrEqual(8)
    })
  })

  it('AI members start at level 12+ for Trainer tier', () => {
    const team = [makeEmberon('em-1')]
    const state = initializeBattle(team, 'Gold')
    state.aiTeam.forEach(combatant => {
      expect(combatant.partyMember.level).toBeGreaterThanOrEqual(12)
    })
  })

  it('AI members start at level <= 18 for Trainer tier', () => {
    const team = [makeEmberon('em-1')]
    const state = initializeBattle(team, 'Gold')
    state.aiTeam.forEach(combatant => {
      expect(combatant.partyMember.level).toBeLessThanOrEqual(18)
    })
  })

  it('AI members start at level 25+ for Champion tier', () => {
    const team = [makeEmberon('em-1')]
    const state = initializeBattle(team, 'Apex')
    state.aiTeam.forEach(combatant => {
      expect(combatant.partyMember.level).toBeGreaterThanOrEqual(25)
    })
  })

  it('AI members start at level <= 30 for Champion tier', () => {
    const team = [makeEmberon('em-1')]
    const state = initializeBattle(team, 'Apex')
    state.aiTeam.forEach(combatant => {
      expect(combatant.partyMember.level).toBeLessThanOrEqual(30)
    })
  })

  it('AI team is between 1 and BERRYVOLUTION_LIST length', () => {
    const team = [makeEmberon('em-1')]
    const state = initializeBattle(team, 'Bronze')
    expect(state.aiTeam.length).toBeLessThanOrEqual(BERRYVOLUTION_LIST.length)
  })

  // ── Difficulty by tier ────────────────────────────────────────────────────

  it('sets Rookie difficulty for Bronze', () => {
    const team = [makeEmberon('em-1')]
    const state = initializeBattle(team, 'Bronze')
    expect(state.aiDifficulty).toBe('Rookie')
  })

  it('sets Rookie difficulty for Silver', () => {
    const team = [makeEmberon('em-1')]
    const state = initializeBattle(team, 'Silver')
    expect(state.aiDifficulty).toBe('Rookie')
  })

  it('sets Trainer difficulty for Gold', () => {
    const team = [makeEmberon('em-1')]
    const state = initializeBattle(team, 'Gold')
    expect(state.aiDifficulty).toBe('Trainer')
  })

  it('sets Trainer difficulty for Crystal', () => {
    const team = [makeEmberon('em-1')]
    const state = initializeBattle(team, 'Crystal')
    expect(state.aiDifficulty).toBe('Trainer')
  })

  it('sets Champion difficulty for Apex', () => {
    const team = [makeEmberon('em-1')]
    const state = initializeBattle(team, 'Apex')
    expect(state.aiDifficulty).toBe('Champion')
  })

  // ── Apex tier specific ────────────────────────────────────────────────────

  it('generates 2 AI members for Apex tier', () => {
    const team = [makeEmberon('em-1')]
    const state = initializeBattle(team, 'Apex')
    expect(state.aiTeam).toHaveLength(2)
  })

  it('generates 1 AI member for non-Apex tiers', () => {
    const team = [makeEmberon('em-1')]
    const state = initializeBattle(team, 'Silver')
    expect(state.aiTeam).toHaveLength(1)
  })

  // ── Consistency ───────────────────────────────────────────────────────────

  it('consistently initializes multiple times', () => {
    const team = [makeEmberon('em-1')]
    const state1 = initializeBattle(team, 'Bronze')
    const state2 = initializeBattle(team, 'Bronze')
    expect(state1.playerTeam).toHaveLength(state2.playerTeam.length)
    expect(state1.phase).toBe(state2.phase)
    expect(state1.turn).toBe(state2.turn)
  })
})
