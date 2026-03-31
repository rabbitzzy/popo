import { describe, it, expect } from 'vitest'
import { catchChance, attemptCapture } from './capture'
import { computeStats } from './leveling'
import { PartyMember } from '../data/types'

describe('capture engine', () => {
  // =========================================================================
  // Catch Chance Tests
  // =========================================================================

  describe('catchChance', () => {
    it('should return minimum chance (0.10) at full HP', () => {
      const chance = catchChance(100, 100) // full HP
      expect(chance).toBe(0.1)
    })

    it('should return approximately 0.45 at half HP', () => {
      const chance = catchChance(50, 100)
      // Formula: 0.70 * (1 - 50/100) + 0.10 = 0.70 * 0.5 + 0.10 = 0.45
      expect(chance).toBeCloseTo(0.45, 5)
    })

    it('should cap at 0.80 when HP is very low', () => {
      const chance = catchChance(0, 100)
      // Formula: 0.70 * (1 - 0/100) + 0.10 = 0.70 + 0.10 = 0.80 (capped at 0.80)
      expect(chance).toBeCloseTo(0.8, 5)
    })

    it('should return 0.10 when HP is at maximum', () => {
      const chance = catchChance(200, 200)
      expect(chance).toBe(0.1)
    })

    it('should increase monotonically as HP decreases', () => {
      const chances = [
        catchChance(100, 100), // full
        catchChance(75, 100),
        catchChance(50, 100),
        catchChance(25, 100),
        catchChance(0, 100), // empty
      ]

      for (let i = 0; i < chances.length - 1; i++) {
        expect(chances[i + 1]).toBeGreaterThanOrEqual(chances[i])
      }
    })

    it('should return valid probability (0.0 to 1.0)', () => {
      for (let hp = 0; hp <= 100; hp += 10) {
        const chance = catchChance(hp, 100)
        expect(chance).toBeGreaterThanOrEqual(0)
        expect(chance).toBeLessThanOrEqual(1)
      }
    })

    it('should handle different max HP values', () => {
      const chance1 = catchChance(50, 100)
      const chance2 = catchChance(100, 200) // same proportion
      expect(chance1).toBeCloseTo(chance2, 5)
    })

    it('should scale correctly with different max HP', () => {
      // At 50% HP, should get ~0.45 regardless of max HP
      expect(catchChance(50, 100)).toBeCloseTo(0.45, 5)
      expect(catchChance(100, 200)).toBeCloseTo(0.45, 5)
      expect(catchChance(150, 300)).toBeCloseTo(0.45, 5)
    })

    it('should not exceed maximum of 0.80', () => {
      // Even with 0 HP, should cap at 0.80
      expect(catchChance(0, 100)).toBeLessThanOrEqual(0.8)
      expect(catchChance(0, 1000)).toBeLessThanOrEqual(0.8)
    })

    it('should not go below minimum of 0.10', () => {
      // Even at full HP, should have at least 0.10
      expect(catchChance(100, 100)).toBeGreaterThanOrEqual(0.1)
      expect(catchChance(1000, 1000)).toBeGreaterThanOrEqual(0.1)
    })

    it('should handle edge case of 1 HP remaining', () => {
      const chance = catchChance(1, 100)
      expect(chance).toBeGreaterThan(0.1)
      expect(chance).toBeLessThanOrEqual(0.8)
    })

    it('should match formula: 0.70 * (1 - currentHp/maxHp) + 0.10', () => {
      const testCases = [
        { current: 0, max: 100, expected: 0.8 },
        { current: 25, max: 100, expected: 0.625 },
        { current: 50, max: 100, expected: 0.45 },
        { current: 75, max: 100, expected: 0.275 },
        { current: 100, max: 100, expected: 0.1 },
      ]

      for (const { current, max, expected } of testCases) {
        const chance = catchChance(current, max)
        const calculated = Math.min(0.8, Math.max(0.1, 0.7 * (1 - current / max) + 0.1))
        expect(chance).toBe(calculated)
        expect(chance).toBeCloseTo(expected, 5)
      }
    })
  })

  // =========================================================================
  // Capture Attempt Tests
  // =========================================================================

  describe('attemptCapture', () => {
    const createWildBerry = (currentHp: number, maxHp: number): PartyMember => ({
      instanceId: 'wild-berry-1',
      defId: 'berry',
      level: 5,
      xp: 0,
      currentStats: {
        hp: currentHp,
        atk: 40,
        def: 40,
        spd: 45,
        nrg: 30,
      },
      maxHp,
      unlockedMoveIds: [],
    })

    it('should return boolean result', () => {
      const wildBerry = createWildBerry(50, 100)
      const result = attemptCapture(wildBerry)
      expect(typeof result).toBe('boolean')
    })

    it('should have chance of success on damaged Berry', () => {
      const wildBerry = createWildBerry(25, 100) // 25% HP
      let successCount = 0

      // Run 100 attempts; should succeed more often than fail
      for (let i = 0; i < 100; i++) {
        if (attemptCapture(wildBerry)) {
          successCount++
        }
      }

      // With ~62.5% catch chance, expect roughly 60-65 successes out of 100
      // Use lenient bounds to account for randomness
      expect(successCount).toBeGreaterThan(30)
      expect(successCount).toBeLessThan(90)
    })

    it('should rarely succeed on full HP Berry', () => {
      const wildBerry = createWildBerry(100, 100) // full HP
      let successCount = 0

      // Run 100 attempts; should rarely succeed
      for (let i = 0; i < 100; i++) {
        if (attemptCapture(wildBerry)) {
          successCount++
        }
      }

      // With 10% catch chance, expect roughly 8-12 successes out of 100
      expect(successCount).toBeLessThan(30) // Should be much lower
    })

    it('should almost always succeed on near-zero HP Berry', () => {
      const wildBerry = createWildBerry(1, 100) // almost dead
      let successCount = 0

      // Run 100 attempts; should almost always succeed
      for (let i = 0; i < 100; i++) {
        if (attemptCapture(wildBerry)) {
          successCount++
        }
      }

      // With ~79% catch chance, expect roughly 75-85 successes out of 100
      expect(successCount).toBeGreaterThan(50)
    })

    it('should handle zero HP (already fainted)', () => {
      const wildBerry = createWildBerry(0, 100)
      let successCount = 0

      for (let i = 0; i < 100; i++) {
        if (attemptCapture(wildBerry)) {
          successCount++
        }
      }

      // With 80% catch chance at 0 HP
      expect(successCount).toBeGreaterThan(60)
    })

    it('should work with different max HP values', () => {
      const berry1 = createWildBerry(50, 100)
      const berry2 = createWildBerry(100, 200) // same proportion

      let success1 = 0
      let success2 = 0

      for (let i = 0; i < 100; i++) {
        if (attemptCapture(berry1)) success1++
        if (attemptCapture(berry2)) success2++
      }

      // Both should have similar success rates (they're at same HP%)
      // Allow some variance due to randomness
      expect(Math.abs(success1 - success2)).toBeLessThan(30)
    })

    it('should be influenced by current HP value', () => {
      const healthyBerry = createWildBerry(90, 100)
      const weakBerry = createWildBerry(10, 100)

      let healthySuccess = 0
      let weakSuccess = 0

      for (let i = 0; i < 200; i++) {
        if (attemptCapture(healthyBerry)) healthySuccess++
        if (attemptCapture(weakBerry)) weakSuccess++
      }

      // Weak berry should be captured more often
      expect(weakSuccess).toBeGreaterThan(healthySuccess)
    })

    it('should produce results matching catch chance probabilities', () => {
      const berry = createWildBerry(30, 100)
      const expectedChance = 0.7 * (1 - 30 / 100) + 0.1 // ~0.61
      let successCount = 0
      const trials = 1000

      for (let i = 0; i < trials; i++) {
        if (attemptCapture(berry)) {
          successCount++
        }
      }

      const empiricalChance = successCount / trials
      // With 1000 trials, empirical should be within ~0.05 of expected
      expect(Math.abs(empiricalChance - expectedChance)).toBeLessThan(0.05)
    })

    it('should work with full-health evolved form', () => {
      const fullHealthBerry: PartyMember = {
        instanceId: 'test-1',
        defId: 'berry',
        level: 10,
        xp: 0,
        currentStats: computeStats('berry', 10),
        maxHp: computeStats('berry', 10).hp,
        unlockedMoveIds: [],
      }

      let successCount = 0
      for (let i = 0; i < 100; i++) {
        if (attemptCapture(fullHealthBerry)) {
          successCount++
        }
      }

      // At full HP, only 10% should succeed
      expect(successCount).toBeLessThan(30)
    })

    it('should work with partially damaged Berry', () => {
      const damagedBerry: PartyMember = {
        instanceId: 'test-1',
        defId: 'berry',
        level: 5,
        xp: 0,
        currentStats: {
          hp: 20, // out of 47 max HP at level 5
          atk: 42,
          def: 42,
          spd: 47,
          nrg: 31,
        },
        maxHp: 47,
        unlockedMoveIds: [],
      }

      // Should have higher success rate with partial damage
      let successCount = 0
      for (let i = 0; i < 100; i++) {
        if (attemptCapture(damagedBerry)) {
          successCount++
        }
      }

      // At ~42% HP, should have decent chance (>15% base)
      expect(successCount).toBeGreaterThan(10)
    })
  })

  // =========================================================================
  // Integration Tests
  // =========================================================================

  describe('capture flow', () => {
    it('should enable capturing a weakened wild Berry', () => {
      const wildBerry: PartyMember = {
        instanceId: 'wild-1',
        defId: 'berry',
        level: 5,
        xp: 0,
        currentStats: {
          hp: 5, // very low
          atk: 42,
          def: 42,
          spd: 47,
          nrg: 31,
        },
        maxHp: 47,
        unlockedMoveIds: [],
      }

      // At this health, should have ~79% catch chance
      let captured = false
      for (let i = 0; i < 100; i++) {
        if (attemptCapture(wildBerry)) {
          captured = true
          break
        }
      }

      expect(captured).toBe(true)
    })

    it('should make capturing a healthy Berry difficult', () => {
      const wildBerry: PartyMember = {
        instanceId: 'wild-1',
        defId: 'berry',
        level: 5,
        xp: 0,
        currentStats: computeStats('berry', 5),
        maxHp: computeStats('berry', 5).hp,
        unlockedMoveIds: [],
      }

      // At full health, should only have 10% catch chance
      let failedCaptures = 0
      for (let i = 0; i < 100; i++) {
        if (!attemptCapture(wildBerry)) {
          failedCaptures++
        }
      }

      // Most attempts should fail
      expect(failedCaptures).toBeGreaterThan(70)
    })

    it('should progressively improve capture odds as Berry is damaged', () => {
      const maxHp = 50
      const oddsProgression: number[] = []

      // Check odds at different health levels
      for (let hp = maxHp; hp >= 0; hp -= 10) {
        let successCount = 0
        for (let i = 0; i < 100; i++) {
          const berry: PartyMember = {
            instanceId: 'test',
            defId: 'berry',
            level: 5,
            xp: 0,
            currentStats: { hp, atk: 42, def: 42, spd: 47, nrg: 31 },
            maxHp,
            unlockedMoveIds: [],
          }
          if (attemptCapture(berry)) {
            successCount++
          }
        }
        oddsProgression.push(successCount)
      }

      // Odds should improve as we go from full to empty HP
      // Last should be >= first
      expect(oddsProgression[oddsProgression.length - 1]).toBeGreaterThanOrEqual(oddsProgression[0])
    })
  })
})
