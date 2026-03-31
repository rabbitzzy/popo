import { describe, it, expect } from 'vitest'
import { canEvolve, applyEvolution, getEvolutionForm, getEvolutionStone } from './evolution'
import { computeStats } from './leveling'
import { PartyMember } from '../data/types'

describe('evolution engine', () => {
  // =========================================================================
  // Evolution Gate Tests
  // =========================================================================

  describe('canEvolve', () => {
    const createBerry = (level: number): PartyMember => ({
      instanceId: 'test-berry',
      defId: 'berry',
      level,
      xp: 0,
      currentStats: computeStats('berry', level),
      maxHp: computeStats('berry', level).hp,
      unlockedMoveIds: [],
    })

    it('should block evolution below level 10', () => {
      const berry9 = createBerry(9)
      expect(canEvolve(berry9, 'Water Stone', [], 1)).toBe(false)

      const berry1 = createBerry(1)
      expect(canEvolve(berry1, 'Water Stone', [], 1)).toBe(false)
    })

    it('should allow evolution at level 10', () => {
      const berry10 = createBerry(10)
      expect(canEvolve(berry10, 'Water Stone', [], 1)).toBe(true)
    })

    it('should allow evolution above level 10', () => {
      const berry15 = createBerry(15)
      expect(canEvolve(berry15, 'Water Stone', [], 1)).toBe(true)
    })

    it('should block evolution without the stone', () => {
      const berry10 = createBerry(10)
      expect(canEvolve(berry10, 'Water Stone', [], 0)).toBe(false)
    })

    it('should allow evolution with the stone', () => {
      const berry10 = createBerry(10)
      expect(canEvolve(berry10, 'Water Stone', [], 1)).toBe(true)
    })

    it('should block evolution if form already owned', () => {
      const berry10 = createBerry(10)
      expect(canEvolve(berry10, 'Water Stone', ['hypereon'], 1)).toBe(false)
    })

    it('should allow evolution if different form owned', () => {
      const berry10 = createBerry(10)
      expect(canEvolve(berry10, 'Water Stone', ['volteon'], 1)).toBe(true)
    })

    it('should block evolution of non-Berry', () => {
      const hypereon: PartyMember = {
        instanceId: 'test-1',
        defId: 'hypereon',
        level: 10,
        xp: 0,
        currentStats: computeStats('hypereon', 10),
        maxHp: computeStats('hypereon', 10).hp,
        unlockedMoveIds: [],
      }
      expect(canEvolve(hypereon, 'Water Stone', [], 1)).toBe(false)
    })

    it('should handle all 8 evolution stones', () => {
      const berry10 = createBerry(10)
      const stones = [
        'Water Stone',
        'Thunder Stone',
        'Fire Stone',
        'Sun Shard',
        'Moon Shard',
        'Leaf Stone',
        'Ice Stone',
        'Ribbon Shard',
      ] as const

      stones.forEach(stone => {
        expect(canEvolve(berry10, stone, [], 1)).toBe(true)
      })
    })
  })

  // =========================================================================
  // Evolution Application Tests
  // =========================================================================

  describe('applyEvolution', () => {
    const createBerry = (level: number): PartyMember => ({
      instanceId: 'test-berry-1',
      defId: 'berry',
      level,
      xp: 0,
      currentStats: computeStats('berry', level),
      maxHp: computeStats('berry', level).hp,
      unlockedMoveIds: [],
    })

    it('should evolve Berry into Hypereon with Water Stone', () => {
      const berry = createBerry(10)
      const evolved = applyEvolution(berry, 'Water Stone')

      expect(evolved.defId).toBe('hypereon')
      expect(evolved.level).toBe(1)
      expect(evolved.xp).toBe(0)
      expect(evolved.instanceId).toBe('test-berry-1') // Keep same instance ID
    })

    it('should reset stats to evolved form level 1', () => {
      const berry = createBerry(10)
      const evolved = applyEvolution(berry, 'Water Stone')

      const hypereonLevel1 = computeStats('hypereon', 1)
      expect(evolved.currentStats).toEqual(hypereonLevel1)
      expect(evolved.maxHp).toBe(hypereonLevel1.hp)
    })

    it('should unlock only level 1 move', () => {
      const berry = createBerry(10)
      const evolved = applyEvolution(berry, 'Water Stone')

      expect(evolved.unlockedMoveIds.length).toBe(1)
      expect(evolved.unlockedMoveIds[0]).toBe('hypereon-splash-shot')
    })

    it('should evolve into correct form for each stone', () => {
      const berry = createBerry(10)

      const evolutions = [
        { stone: 'Water Stone', form: 'hypereon' },
        { stone: 'Thunder Stone', form: 'volteon' },
        { stone: 'Fire Stone', form: 'emberon' },
        { stone: 'Sun Shard', form: 'eryleon' },
        { stone: 'Moon Shard', form: 'vengeon' },
        { stone: 'Leaf Stone', form: 'grasseon' },
        { stone: 'Ice Stone', form: 'polareon' },
        { stone: 'Ribbon Shard', form: 'luxeon' },
      ] as const

      evolutions.forEach(({ stone, form }) => {
        const evolved = applyEvolution(berry, stone)
        expect(evolved.defId).toBe(form)
      })
    })

    it('should reject evolution of non-Berry', () => {
      const hypereon: PartyMember = {
        instanceId: 'test-1',
        defId: 'hypereon',
        level: 10,
        xp: 0,
        currentStats: computeStats('hypereon', 10),
        maxHp: computeStats('hypereon', 10).hp,
        unlockedMoveIds: [],
      }

      expect(() => applyEvolution(hypereon, 'Water Stone')).toThrow()
    })

    it('should preserve instance ID through evolution', () => {
      const berry: PartyMember = {
        instanceId: 'special-uuid-123',
        defId: 'berry',
        level: 10,
        xp: 0,
        currentStats: computeStats('berry', 10),
        maxHp: computeStats('berry', 10).hp,
        unlockedMoveIds: [],
      }

      const evolved = applyEvolution(berry, 'Water Stone')
      expect(evolved.instanceId).toBe('special-uuid-123')
    })

    it('should not carry over unevolved stats', () => {
      // Berry at high level has inflated stats
      const berry20 = createBerry(20)
      const evolvedStats = applyEvolution(berry20, 'Water Stone')

      // Should be reset to level 1 of evolved form
      const hypereonLevel1 = computeStats('hypereon', 1)
      expect(evolvedStats.currentStats.hp).toBe(hypereonLevel1.hp)
      expect(evolvedStats.currentStats.atk).toBe(hypereonLevel1.atk)
    })

    it('should work for all Berryvolutions', () => {
      const berry = createBerry(10)
      const forms = ['hypereon', 'volteon', 'emberon', 'eryleon', 'vengeon', 'grasseon', 'polareon', 'luxeon']

      const stones = [
        'Water Stone',
        'Thunder Stone',
        'Fire Stone',
        'Sun Shard',
        'Moon Shard',
        'Leaf Stone',
        'Ice Stone',
        'Ribbon Shard',
      ] as const

      stones.forEach((stone, index) => {
        const evolved = applyEvolution(berry, stone)
        expect(evolved.defId).toBe(forms[index])
        expect(evolved.level).toBe(1)
        expect(evolved.unlockedMoveIds.length).toBe(1)
      })
    })
  })

  // =========================================================================
  // Evolution Form/Stone Lookup Tests
  // =========================================================================

  describe('getEvolutionForm', () => {
    it('should map all stones to correct forms', () => {
      const mappings = [
        { stone: 'Water Stone', form: 'hypereon' },
        { stone: 'Thunder Stone', form: 'volteon' },
        { stone: 'Fire Stone', form: 'emberon' },
        { stone: 'Sun Shard', form: 'eryleon' },
        { stone: 'Moon Shard', form: 'vengeon' },
        { stone: 'Leaf Stone', form: 'grasseon' },
        { stone: 'Ice Stone', form: 'polareon' },
        { stone: 'Ribbon Shard', form: 'luxeon' },
      ] as const

      mappings.forEach(({ stone, form }) => {
        expect(getEvolutionForm(stone)).toBe(form)
      })
    })
  })

  describe('getEvolutionStone', () => {
    it('should return correct stone for each form', () => {
      const mappings = [
        { form: 'hypereon', stone: 'Water Stone' },
        { form: 'volteon', stone: 'Thunder Stone' },
        { form: 'emberon', stone: 'Fire Stone' },
        { form: 'eryleon', stone: 'Sun Shard' },
        { form: 'vengeon', stone: 'Moon Shard' },
        { form: 'grasseon', stone: 'Leaf Stone' },
        { form: 'polareon', stone: 'Ice Stone' },
        { form: 'luxeon', stone: 'Ribbon Shard' },
      ] as const

      mappings.forEach(({ form, stone }) => {
        expect(getEvolutionStone(form)).toBe(stone)
      })
    })
  })

  // =========================================================================
  // Integration Tests
  // =========================================================================

  describe('evolution flow', () => {
    it('should allow evolution of level-10 Berry with stone and no duplicate', () => {
      const berry: PartyMember = {
        instanceId: 'berry-1',
        defId: 'berry',
        level: 10,
        xp: 0,
        currentStats: computeStats('berry', 10),
        maxHp: computeStats('berry', 10).hp,
        unlockedMoveIds: [],
      }

      // Check preconditions
      expect(canEvolve(berry, 'Water Stone', [], 1)).toBe(true)

      // Apply evolution
      const evolved = applyEvolution(berry, 'Water Stone')

      // Verify post-evolution state
      expect(evolved.defId).toBe('hypereon')
      expect(evolved.level).toBe(1)
      expect(evolved.unlockedMoveIds).toContain('hypereon-splash-shot')
      expect(evolved.currentStats.hp).toBe(computeStats('hypereon', 1).hp)
    })

    it('should prevent duplicate evolutions', () => {
      const berry: PartyMember = {
        instanceId: 'berry-1',
        defId: 'berry',
        level: 10,
        xp: 0,
        currentStats: computeStats('berry', 10),
        maxHp: computeStats('berry', 10).hp,
        unlockedMoveIds: [],
      }

      // Already have Hypereon in party
      expect(canEvolve(berry, 'Water Stone', ['hypereon'], 1)).toBe(false)

      // But can evolve into different form
      expect(canEvolve(berry, 'Fire Stone', ['emberon'], 1)).toBe(true)
    })

    it('should handle multiple Berrys evolving into different forms', () => {
      const berrys: PartyMember[] = [
        {
          instanceId: 'berry-1',
          defId: 'berry',
          level: 10,
          xp: 0,
          currentStats: computeStats('berry', 10),
          maxHp: computeStats('berry', 10).hp,
          unlockedMoveIds: [],
        },
        {
          instanceId: 'berry-2',
          defId: 'berry',
          level: 10,
          xp: 0,
          currentStats: computeStats('berry', 10),
          maxHp: computeStats('berry', 10).hp,
          unlockedMoveIds: [],
        },
      ]

      const evolved1 = applyEvolution(berrys[0], 'Water Stone')
      const evolved2 = applyEvolution(berrys[1], 'Fire Stone')

      expect(evolved1.defId).toBe('hypereon')
      expect(evolved2.defId).toBe('emberon')
      expect(evolved1.instanceId).toBe('berry-1')
      expect(evolved2.instanceId).toBe('berry-2')
    })
  })
})
