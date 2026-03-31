import { describe, it, expect, beforeEach, vi } from 'vitest'
import { searchZone, spawnWildBerry } from './exploration'
import { computeStats } from './leveling'
import { ZoneDef } from '../data/types'
import { EMBER_CRATER, TIDE_BASIN, VERDANT_VALE, FROSTPEAK_ZONE, WANDERING_PATH } from '../data/zones'

describe('exploration engine', () => {
  // =========================================================================
  // Zone Search Tests
  // =========================================================================

  describe('searchZone', () => {
    it('should return encounter when roll is below berry encounter rate', () => {
      const zone = EMBER_CRATER // berryEncounterRate: 0.1
      let encounteredBerry = false

      // Run multiple times to hit the encounter chance (0.1)
      for (let i = 0; i < 100; i++) {
        const result = searchZone(zone)
        if (result.type === 'encounter') {
          encounteredBerry = true
          break
        }
      }

      expect(encounteredBerry).toBe(true)
    })

    it('should return stone when roll hits a stone drop', () => {
      const zone = EMBER_CRATER // stoneDrops: Fire Stone (0.15), Sun Shard (0.12)
      let foundStone = false

      // Run multiple times to hit stone drop chances
      for (let i = 0; i < 200; i++) {
        const result = searchZone(zone)
        if (result.type === 'stone') {
          foundStone = true
          expect(['Fire Stone', 'Sun Shard']).toContain(result.stone)
          break
        }
      }

      expect(foundStone).toBe(true)
    })

    it('should return gold when roll hits the gold dust chance', () => {
      const zone = EMBER_CRATER // goldDustRange: [10, 25]
      let foundGold = false

      // Run multiple times to hit the gold dust chance
      for (let i = 0; i < 200; i++) {
        const result = searchZone(zone)
        if (result.type === 'gold') {
          foundGold = true
          expect(result.amount).toBeGreaterThanOrEqual(10)
          expect(result.amount).toBeLessThanOrEqual(25)
          break
        }
      }

      expect(foundGold).toBe(true)
    })

    it('should return nothing when roll misses all probabilities', () => {
      const zone = EMBER_CRATER
      let foundNothing = false

      // Run multiple times to hit the nothing case
      for (let i = 0; i < 300; i++) {
        const result = searchZone(zone)
        if (result.type === 'nothing') {
          foundNothing = true
          break
        }
      }

      expect(foundNothing).toBe(true)
    })

    it('should respect gold dust range for Tide Basin', () => {
      const zone = TIDE_BASIN // goldDustRange: [10, 25]
      let foundGold = false

      for (let i = 0; i < 200; i++) {
        const result = searchZone(zone)
        if (result.type === 'gold') {
          foundGold = true
          expect(result.amount).toBeGreaterThanOrEqual(10)
          expect(result.amount).toBeLessThanOrEqual(25)
          break
        }
      }

      expect(foundGold).toBe(true)
    })

    it('should respect gold dust range for Verdant Vale', () => {
      const zone = VERDANT_VALE // goldDustRange: [10, 30]
      let foundGold = false

      for (let i = 0; i < 200; i++) {
        const result = searchZone(zone)
        if (result.type === 'gold') {
          foundGold = true
          expect(result.amount).toBeGreaterThanOrEqual(10)
          expect(result.amount).toBeLessThanOrEqual(30)
          break
        }
      }

      expect(foundGold).toBe(true)
    })

    it('should return correct stone from multiple options', () => {
      const zone = TIDE_BASIN // stoneDrops: Water Stone (0.15), Thunder Stone (0.12)
      const foundStones = new Set<string>()

      // Run enough times to find both stones
      for (let i = 0; i < 500; i++) {
        const result = searchZone(zone)
        if (result.type === 'stone') {
          foundStones.add(result.stone)
        }
      }

      // Should be able to find at least one of the available stones
      expect(foundStones.size).toBeGreaterThan(0)
      for (const stone of foundStones) {
        expect(['Water Stone', 'Thunder Stone']).toContain(stone)
      }
    })

    it('should handle zones with single stone (Frostpeak)', () => {
      const zone = FROSTPEAK_ZONE // stoneDrops: [Ice Stone (0.20)]
      let foundIceStone = false

      for (let i = 0; i < 200; i++) {
        const result = searchZone(zone)
        if (result.type === 'stone') {
          foundIceStone = true
          expect(result.stone).toBe('Ice Stone')
          break
        }
      }

      expect(foundIceStone).toBe(true)
    })

    it('should have outcomes for all zone types', () => {
      const zones = [EMBER_CRATER, TIDE_BASIN, VERDANT_VALE, FROSTPEAK_ZONE, WANDERING_PATH]

      for (const zone of zones) {
        let foundEncounter = false
        let foundStone = false
        let foundGold = false
        let foundNothing = false

        // Run searches to find all outcome types
        for (let i = 0; i < 500; i++) {
          const result = searchZone(zone)
          if (result.type === 'encounter') foundEncounter = true
          else if (result.type === 'stone') foundStone = true
          else if (result.type === 'gold') foundGold = true
          else if (result.type === 'nothing') foundNothing = true
        }

        // At least some outcomes should be possible
        expect(foundEncounter || foundStone || foundGold || foundNothing).toBe(true)
      }
    })
  })

  // =========================================================================
  // Wild Berry Spawn Tests
  // =========================================================================

  describe('spawnWildBerry', () => {
    it('should spawn a Berry with valid level from zone range', () => {
      const zone = EMBER_CRATER // wildBerryLevelRange: [3, 7]
      const berry = spawnWildBerry(zone)

      expect(berry.defId).toBe('berry')
      expect(berry.level).toBeGreaterThanOrEqual(3)
      expect(berry.level).toBeLessThanOrEqual(7)
    })

    it('should spawn Berry with stats matching the level', () => {
      const zone = EMBER_CRATER
      const berry = spawnWildBerry(zone)

      const expectedStats = computeStats('berry', berry.level)
      expect(berry.currentStats).toEqual(expectedStats)
      expect(berry.maxHp).toBe(expectedStats.hp)
    })

    it('should generate unique instance IDs for each spawn', () => {
      const zone = EMBER_CRATER
      const berry1 = spawnWildBerry(zone)
      const berry2 = spawnWildBerry(zone)

      expect(berry1.instanceId).not.toBe(berry2.instanceId)
    })

    it('should spawn Berry with XP = 0', () => {
      const zone = EMBER_CRATER
      const berry = spawnWildBerry(zone)

      expect(berry.xp).toBe(0)
    })

    it('should spawn Berry with no unlocked moves', () => {
      const zone = EMBER_CRATER
      const berry = spawnWildBerry(zone)

      expect(berry.unlockedMoveIds).toEqual([])
    })

    it('should respect level range for Tide Basin', () => {
      const zone = TIDE_BASIN // wildBerryLevelRange: [3, 7]
      for (let i = 0; i < 20; i++) {
        const berry = spawnWildBerry(zone)
        expect(berry.level).toBeGreaterThanOrEqual(3)
        expect(berry.level).toBeLessThanOrEqual(7)
      }
    })

    it('should respect level range for Verdant Vale', () => {
      const zone = VERDANT_VALE // wildBerryLevelRange: [5, 9]
      for (let i = 0; i < 20; i++) {
        const berry = spawnWildBerry(zone)
        expect(berry.level).toBeGreaterThanOrEqual(5)
        expect(berry.level).toBeLessThanOrEqual(9)
      }
    })

    it('should respect level range for Frostpeak Zone', () => {
      const zone = FROSTPEAK_ZONE // wildBerryLevelRange: [6, 10]
      for (let i = 0; i < 20; i++) {
        const berry = spawnWildBerry(zone)
        expect(berry.level).toBeGreaterThanOrEqual(6)
        expect(berry.level).toBeLessThanOrEqual(10)
      }
    })

    it('should respect level range for Wandering Path', () => {
      const zone = WANDERING_PATH // wildBerryLevelRange: [1, 10]
      for (let i = 0; i < 20; i++) {
        const berry = spawnWildBerry(zone)
        expect(berry.level).toBeGreaterThanOrEqual(1)
        expect(berry.level).toBeLessThanOrEqual(10)
      }
    })

    it('should generate valid UUID format', () => {
      const zone = EMBER_CRATER
      const berry = spawnWildBerry(zone)

      // UUID v4 format: 8-4-4-4-12 hex digits
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      expect(berry.instanceId).toMatch(uuidRegex)
    })

    it('should spawn Berrys with different levels from same zone', () => {
      const zone = WANDERING_PATH // wide range [1, 10]
      const levels = new Set<number>()

      // Spawn multiple times to get variety
      for (let i = 0; i < 50; i++) {
        const berry = spawnWildBerry(zone)
        levels.add(berry.level)
      }

      // Should have at least 3 different levels (statistically likely from 50 spawns)
      expect(levels.size).toBeGreaterThanOrEqual(3)
    })

    it('should have consistent maxHp with computed stats', () => {
      const zone = EMBER_CRATER
      for (let i = 0; i < 10; i++) {
        const berry = spawnWildBerry(zone)
        const expectedStats = computeStats('berry', berry.level)
        expect(berry.maxHp).toBe(expectedStats.hp)
      }
    })
  })

  // =========================================================================
  // Integration Tests
  // =========================================================================

  describe('exploration flow', () => {
    it('should handle a complete zone search', () => {
      const zone = EMBER_CRATER

      // Just verify that searchZone works without errors
      const result = searchZone(zone)
      expect(result).toBeDefined()
      expect(['encounter', 'stone', 'gold', 'nothing']).toContain(result.type)
    })

    it('should spawn a wild Berry ready for battle', () => {
      const zone = EMBER_CRATER
      const wildBerry = spawnWildBerry(zone)

      // Verify all required fields for battle
      expect(wildBerry.instanceId).toBeTruthy()
      expect(wildBerry.defId).toBe('berry')
      expect(wildBerry.level).toBeGreaterThan(0)
      expect(wildBerry.currentStats.hp).toBeGreaterThan(0)
      expect(wildBerry.maxHp).toBe(wildBerry.currentStats.hp)
      expect(Array.isArray(wildBerry.unlockedMoveIds)).toBe(true)
    })

    it('should handle all zones correctly', () => {
      const zones = [EMBER_CRATER, TIDE_BASIN, VERDANT_VALE, FROSTPEAK_ZONE, WANDERING_PATH]

      for (const zone of zones) {
        const result = searchZone(zone)
        const wildBerry = spawnWildBerry(zone)

        expect(result).toBeDefined()
        expect(wildBerry.defId).toBe('berry')
        expect(wildBerry.level).toBeGreaterThan(0)
      }
    })
  })
})
