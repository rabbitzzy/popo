import { describe, it, expect } from 'vitest'
import { computeStats, xpToNextLevel, totalXpToLevel, applyXp, getUnlockedMoves, getNextUnlockingMove } from './leveling'
import { PartyMember } from '../data/types'

describe('leveling engine', () => {
  // =========================================================================
  // XP & Level Calculations
  // =========================================================================

  describe('xpToNextLevel', () => {
    it('should follow formula: 20 + (level * 10)', () => {
      expect(xpToNextLevel(1)).toBe(30) // 20 + 1*10
      expect(xpToNextLevel(2)).toBe(40) // 20 + 2*10
      expect(xpToNextLevel(5)).toBe(70) // 20 + 5*10
      expect(xpToNextLevel(10)).toBe(120) // 20 + 10*10
      expect(xpToNextLevel(29)).toBe(310) // 20 + 29*10
    })

    it('should increase by 10 with each level', () => {
      const xpAt10 = xpToNextLevel(10)
      const xpAt11 = xpToNextLevel(11)
      expect(xpAt11 - xpAt10).toBe(10)
    })
  })

  describe('totalXpToLevel', () => {
    it('should accumulate XP across levels', () => {
      // Level 1: need 30 XP
      expect(totalXpToLevel(1)).toBe(0) // no XP needed to reach level 1
      expect(totalXpToLevel(2)).toBe(30) // 30 XP to reach level 2
      expect(totalXpToLevel(3)).toBe(70) // 30 + 40 = 70 XP to reach level 3
    })

    it('should match cumulative formula', () => {
      let cumulative = 0
      for (let level = 1; level <= 5; level++) {
        cumulative += xpToNextLevel(level)
      }
      expect(totalXpToLevel(6)).toBe(cumulative)
    })
  })

  // =========================================================================
  // Stat Computation
  // =========================================================================

  describe('computeStats', () => {
    it('should compute Berry stats correctly', () => {
      // Berry at level 1: base stats
      const stats1 = computeStats('berry', 1)
      expect(stats1.hp).toBe(45 + 2 * 1) // 47
      expect(stats1.atk).toBe(40 + 2 * 1) // 42
      expect(stats1.def).toBe(40 + 2 * 1) // 42
      expect(stats1.spd).toBe(45 + 2 * 1) // 47
      expect(stats1.nrg).toBe(30 + 1 * 1) // 31

      // Berry at level 10
      const stats10 = computeStats('berry', 10)
      expect(stats10.hp).toBe(45 + 2 * 10) // 65
      expect(stats10.atk).toBe(40 + 2 * 10) // 60
      expect(stats10.def).toBe(40 + 2 * 10) // 60
      expect(stats10.spd).toBe(45 + 2 * 10) // 65
      expect(stats10.nrg).toBe(30 + 1 * 10) // 40
    })

    it('should compute Hypereon stats correctly', () => {
      // Hypereon at level 1 — base: hp:90 atk:65 def:75 spd:55 nrg:65, growth: hp:4 atk:2 def:3 spd:1 nrg:2
      const stats1 = computeStats('hypereon', 1)
      expect(stats1.hp).toBe(90 + 4 * 1) // 94
      expect(stats1.atk).toBe(65 + 2 * 1) // 67
      expect(stats1.def).toBe(75 + 3 * 1) // 78
      expect(stats1.spd).toBe(55 + 1 * 1) // 56
      expect(stats1.nrg).toBe(65 + 2 * 1) // 67

      // Hypereon at level 30
      const stats30 = computeStats('hypereon', 30)
      expect(stats30.hp).toBe(90 + 4 * 30) // 210
      expect(stats30.atk).toBe(65 + 2 * 30) // 125
      expect(stats30.def).toBe(75 + 3 * 30) // 165
      expect(stats30.spd).toBe(55 + 1 * 30) // 85
      expect(stats30.nrg).toBe(65 + 2 * 30) // 125
    })

    it('should compute Volteon stats correctly (high SPD)', () => {
      // Volteon has highest SPD growth
      const statsAt30 = computeStats('volteon', 30)
      expect(statsAt30.spd).toBe(130 + 5 * 30) // 280

      // Hypereon has lower SPD growth
      const hypereonAt30 = computeStats('hypereon', 30)
      expect(statsAt30.spd).toBeGreaterThan(hypereonAt30.spd)
    })

    it('should increase stats substantially from level 1 to 30', () => {
      const stats1 = computeStats('emberon', 1)
      const stats30 = computeStats('emberon', 30)

      // Stats increase significantly from level 1 to level 30
      // Emberon: HP 70→130 (1.86x), ATK 130→180 (1.38x)
      expect(stats30.hp).toBeGreaterThan(stats1.hp)
      expect(stats30.atk).toBeGreaterThan(stats1.atk)
      expect(stats30.def).toBeGreaterThan(stats1.def)
    })
  })

  // =========================================================================
  // Move Unlocking
  // =========================================================================

  describe('getUnlockedMoves', () => {
    it('should unlock moves at levels 1, 8, 15, 22', () => {
      // At level 1: should have 1 move
      const moves1 = getUnlockedMoves('hypereon', 1)
      expect(moves1.length).toBe(1)
      expect(moves1[0].name).toBe('Splash Shot')
      expect(moves1[0].unlockLevel).toBe(1)

      // At level 8: should have 2 moves
      const moves8 = getUnlockedMoves('hypereon', 8)
      expect(moves8.length).toBe(2)
      expect(moves8.map(m => m.unlockLevel)).toEqual([1, 8])

      // At level 15: should have 3 moves
      const moves15 = getUnlockedMoves('hypereon', 15)
      expect(moves15.length).toBe(3)
      expect(moves15.map(m => m.unlockLevel)).toEqual([1, 8, 15])

      // At level 22: should have all 4 moves
      const moves22 = getUnlockedMoves('hypereon', 22)
      expect(moves22.length).toBe(4)
      expect(moves22.map(m => m.unlockLevel)).toEqual([1, 8, 15, 22])

      // At level 30: still all 4 moves
      const moves30 = getUnlockedMoves('hypereon', 30)
      expect(moves30.length).toBe(4)
    })

    it('should unlock moves for Volteon correctly', () => {
      const moves1 = getUnlockedMoves('volteon', 1)
      expect(moves1[0].name).toBe('Spark')

      const moves8 = getUnlockedMoves('volteon', 8)
      expect(moves8[1].name).toBe('Shock Dart')
      expect(moves8[1].unlockLevel).toBe(8)
    })

    it('should not unlock moves for unevolved Berry', () => {
      const moves = getUnlockedMoves('berry', 10)
      expect(moves.length).toBe(0)
    })

    it('should return correct move types and effects', () => {
      const moves = getUnlockedMoves('hypereon', 8)
      const soak_mist = moves.find(m => m.unlockLevel === 8)
      expect(soak_mist?.type).toBe('Water')
      expect(soak_mist?.effect?.status).toBe('Soak')
    })
  })

  describe('getNextUnlockingMove', () => {
    it('should return the next move to unlock', () => {
      const nextAt1 = getNextUnlockingMove('hypereon', 1)
      expect(nextAt1?.unlockLevel).toBe(8)
      expect(nextAt1?.name).toBe('Soak Mist')

      const nextAt8 = getNextUnlockingMove('hypereon', 8)
      expect(nextAt8?.unlockLevel).toBe(15)

      const nextAt22 = getNextUnlockingMove('hypereon', 22)
      expect(nextAt22).toBeNull()
    })
  })

  // =========================================================================
  // XP Application & Leveling
  // =========================================================================

  describe('applyXp', () => {
    it('should increment XP without leveling up', () => {
      const member: PartyMember = {
        instanceId: 'test-1',
        defId: 'hypereon',
        level: 1,
        xp: 0,
        currentStats: computeStats('hypereon', 1),
        maxHp: computeStats('hypereon', 1).hp,
        unlockedMoveIds: ['hypereon-splash-shot'],
      }

      const result = applyXp(member, 10)
      expect(result.member.xp).toBe(10)
      expect(result.member.level).toBe(1)
      expect(result.leveledUp).toBe(false)
      expect(result.newMoveIds.length).toBe(0)
    })

    it('should level up when XP threshold is met', () => {
      const member: PartyMember = {
        instanceId: 'test-1',
        defId: 'hypereon',
        level: 1,
        xp: 0,
        currentStats: computeStats('hypereon', 1),
        maxHp: computeStats('hypereon', 1).hp,
        unlockedMoveIds: ['hypereon-splash-shot'],
      }

      // Need 30 XP to reach level 2
      const result = applyXp(member, 30)
      expect(result.member.level).toBe(2)
      expect(result.member.xp).toBe(0)
      expect(result.leveledUp).toBe(true)
    })

    it('should update stats on level up', () => {
      const member: PartyMember = {
        instanceId: 'test-1',
        defId: 'hypereon',
        level: 1,
        xp: 0,
        currentStats: computeStats('hypereon', 1),
        maxHp: computeStats('hypereon', 1).hp,
        unlockedMoveIds: ['hypereon-splash-shot'],
      }

      const stats1 = member.currentStats
      const result = applyXp(member, 30)
      const stats2 = result.member.currentStats

      // Stats should increase
      expect(stats2.hp).toBeGreaterThan(stats1.hp)
      expect(stats2.atk).toBeGreaterThan(stats1.atk)
      expect(result.member.maxHp).toBe(stats2.hp)
    })

    it('should unlock moves on level up', () => {
      const member: PartyMember = {
        instanceId: 'test-1',
        defId: 'hypereon',
        level: 1,
        xp: 0,
        currentStats: computeStats('hypereon', 1),
        maxHp: computeStats('hypereon', 1).hp,
        unlockedMoveIds: ['hypereon-splash-shot'],
      }

      // Apply enough XP to reach level 8 (30+40+50+60+70+80+90 = 420)
      const result = applyXp(member, 420)
      expect(result.member.level).toBe(8)
      expect(result.newMoveIds.length).toBeGreaterThan(0)
      expect(result.newMoveIds[0]).toBe('hypereon-soak-mist')
    })

    it('should handle multiple level-ups in a single call', () => {
      const member: PartyMember = {
        instanceId: 'test-1',
        defId: 'hypereon',
        level: 1,
        xp: 0,
        currentStats: computeStats('hypereon', 1),
        maxHp: computeStats('hypereon', 1).hp,
        unlockedMoveIds: ['hypereon-splash-shot'],
      }

      // Provide massive XP to jump multiple levels
      const result = applyXp(member, 1000)
      expect(result.member.level).toBeGreaterThan(1)
      expect(result.leveledUp).toBe(true)
    })

    it('should respect level cap for unevolved Berry', () => {
      const member: PartyMember = {
        instanceId: 'test-berry',
        defId: 'berry',
        level: 9,
        xp: 0,
        currentStats: computeStats('berry', 9),
        maxHp: computeStats('berry', 9).hp,
        unlockedMoveIds: [],
      }

      // Provide enough XP to try to go past level 10
      const result = applyXp(member, 5000)
      expect(result.member.level).toBe(10) // Capped at 10
    })

    it('should respect level cap for Berryvolutions', () => {
      const member: PartyMember = {
        instanceId: 'test-1',
        defId: 'hypereon',
        level: 29,
        xp: 0,
        currentStats: computeStats('hypereon', 29),
        maxHp: computeStats('hypereon', 29).hp,
        unlockedMoveIds: ['hypereon-splash-shot', 'hypereon-soak-mist', 'hypereon-tide-crash', 'hypereon-tidal-wave'],
      }

      // Provide enough XP to try to go past level 30
      const result = applyXp(member, 5000)
      expect(result.member.level).toBe(30) // Capped at 30
    })

    it('should not unlock duplicate moves', () => {
      const member: PartyMember = {
        instanceId: 'test-1',
        defId: 'hypereon',
        level: 7,
        xp: 0,
        currentStats: computeStats('hypereon', 7),
        maxHp: computeStats('hypereon', 7).hp,
        unlockedMoveIds: ['hypereon-splash-shot'],
      }

      // Apply 90 XP to reach level 8 (level 7→8 requires 90 XP, should unlock move at 8)
      const result = applyXp(member, 90)
      expect(result.newMoveIds).toContain('hypereon-soak-mist')

      // Apply more XP from level 8 (should not re-unlock the same move)
      const result2 = applyXp(result.member, 40)
      expect(result2.newMoveIds).not.toContain('hypereon-soak-mist')
    })

    it('should carry over excess XP to next level', () => {
      const member: PartyMember = {
        instanceId: 'test-1',
        defId: 'hypereon',
        level: 1,
        xp: 0,
        currentStats: computeStats('hypereon', 1),
        maxHp: computeStats('hypereon', 1).hp,
        unlockedMoveIds: ['hypereon-splash-shot'],
      }

      // Level 1→2 needs 30 XP; apply 50, should have 20 leftover
      const result = applyXp(member, 50)
      expect(result.member.level).toBe(2)
      expect(result.member.xp).toBe(20)
    })
  })

  // =========================================================================
  // Integration Tests
  // =========================================================================

  describe('leveling progression', () => {
    it('should progress a Berryvolution from level 1 to 30', () => {
      let member: PartyMember = {
        instanceId: 'test-1',
        defId: 'emberon',
        level: 1,
        xp: 0,
        currentStats: computeStats('emberon', 1),
        maxHp: computeStats('emberon', 1).hp,
        unlockedMoveIds: ['emberon-ember'],
      }

      // Simulate reaching level 30 with accumulated XP
      let totalXpNeeded = totalXpToLevel(30)
      const result = applyXp(member, totalXpNeeded)

      expect(result.member.level).toBe(30)
      expect(result.member.currentStats.atk).toBeGreaterThan(member.currentStats.atk)
      expect(result.newMoveIds.length).toBeGreaterThanOrEqual(3) // Should unlock at 8, 15, 22
    })

    it('should unlock all 4 moves by level 22', () => {
      let member: PartyMember = {
        instanceId: 'test-1',
        defId: 'hypereon',
        level: 1,
        xp: 0,
        currentStats: computeStats('hypereon', 1),
        maxHp: computeStats('hypereon', 1).hp,
        unlockedMoveIds: ['hypereon-splash-shot'],
      }

      // Reach level 22
      const result = applyXp(member, totalXpToLevel(22))
      const unlockedMoves = getUnlockedMoves('hypereon', result.member.level)

      expect(unlockedMoves.length).toBe(4)
      expect(unlockedMoves[0].name).toBe('Splash Shot')
      expect(unlockedMoves[1].name).toBe('Soak Mist')
      expect(unlockedMoves[2].name).toBe('Tide Crash')
      expect(unlockedMoves[3].name).toBe('Tidal Wave')
    })
  })
})
