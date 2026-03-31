import { describe, it, expect } from 'vitest'
import { getTypeMultiplier, getTypeLabel, isSuperEffective, isNotEffective } from './typeChart'
import { ElementType } from './types'

describe('typeChart', () => {
  describe('getTypeMultiplier', () => {
    it('should return 1.5 for super effective matchups', () => {
      // Fire > Grass, Ice
      expect(getTypeMultiplier('Fire', 'Grass')).toBe(1.5)
      expect(getTypeMultiplier('Fire', 'Ice')).toBe(1.5)

      // Water > Fire, Rock
      expect(getTypeMultiplier('Water', 'Fire')).toBe(1.5)
      expect(getTypeMultiplier('Water', 'Rock')).toBe(1.5)

      // Grass > Water, Rock
      expect(getTypeMultiplier('Grass', 'Water')).toBe(1.5)
      expect(getTypeMultiplier('Grass', 'Rock')).toBe(1.5)

      // Electric > Water
      expect(getTypeMultiplier('Electric', 'Water')).toBe(1.5)

      // Rock > Fire
      expect(getTypeMultiplier('Rock', 'Fire')).toBe(1.5)

      // Ice > Grass
      expect(getTypeMultiplier('Ice', 'Grass')).toBe(1.5)

      // Psychic has no super effective types
      expect(getTypeMultiplier('Psychic', 'Fire')).not.toBe(1.5)
      expect(getTypeMultiplier('Psychic', 'Water')).not.toBe(1.5)
    })

    it('should return 0.67 for not very effective matchups', () => {
      // Fire is not effective against Water, Rock
      expect(getTypeMultiplier('Fire', 'Water')).toBe(0.67)
      expect(getTypeMultiplier('Fire', 'Rock')).toBe(0.67)

      // Water is not effective against Grass, Electric
      expect(getTypeMultiplier('Water', 'Grass')).toBe(0.67)
      expect(getTypeMultiplier('Water', 'Electric')).toBe(0.67)

      // Grass is not effective against Fire, Ice
      expect(getTypeMultiplier('Grass', 'Fire')).toBe(0.67)
      expect(getTypeMultiplier('Grass', 'Ice')).toBe(0.67)

      // Electric is not effective against Rock
      expect(getTypeMultiplier('Electric', 'Rock')).toBe(0.67)

      // Rock is not effective against Water, Grass
      expect(getTypeMultiplier('Rock', 'Water')).toBe(0.67)
      expect(getTypeMultiplier('Rock', 'Grass')).toBe(0.67)

      // Ice is not effective against Fire, Rock
      expect(getTypeMultiplier('Ice', 'Fire')).toBe(0.67)
      expect(getTypeMultiplier('Ice', 'Rock')).toBe(0.67)

      // Psychic has no not-effective types
      expect(getTypeMultiplier('Psychic', 'Fire')).not.toBe(0.67)
      expect(getTypeMultiplier('Psychic', 'Water')).not.toBe(0.67)
    })

    it('should return 1.0 for neutral matchups', () => {
      // Fire vs Electric, Psychic
      expect(getTypeMultiplier('Fire', 'Electric')).toBe(1.0)
      expect(getTypeMultiplier('Fire', 'Psychic')).toBe(1.0)

      // Water vs Psychic (Electric and Grass are weak to Water, not neutral)
      expect(getTypeMultiplier('Water', 'Psychic')).toBe(1.0)

      // Grass vs Electric, Psychic
      expect(getTypeMultiplier('Grass', 'Electric')).toBe(1.0)
      expect(getTypeMultiplier('Grass', 'Psychic')).toBe(1.0)

      // Electric vs Fire, Grass, Ice, Psychic
      expect(getTypeMultiplier('Electric', 'Fire')).toBe(1.0)
      expect(getTypeMultiplier('Electric', 'Grass')).toBe(1.0)
      expect(getTypeMultiplier('Electric', 'Ice')).toBe(1.0)
      expect(getTypeMultiplier('Electric', 'Psychic')).toBe(1.0)

      // Rock vs Electric, Psychic, Ice
      expect(getTypeMultiplier('Rock', 'Electric')).toBe(1.0)
      expect(getTypeMultiplier('Rock', 'Psychic')).toBe(1.0)
      expect(getTypeMultiplier('Rock', 'Ice')).toBe(1.0)

      // Ice vs Electric, Water, Psychic
      expect(getTypeMultiplier('Ice', 'Electric')).toBe(1.0)
      expect(getTypeMultiplier('Ice', 'Water')).toBe(1.0)
      expect(getTypeMultiplier('Ice', 'Psychic')).toBe(1.0)

      // Psychic vs all (no strengths/weaknesses in full type)
      const psychicDefenders: ElementType[] = ['Fire', 'Water', 'Grass', 'Electric', 'Rock', 'Ice', 'Psychic']
      psychicDefenders.forEach(defender => {
        expect(getTypeMultiplier('Psychic', defender)).toBe(1.0)
      })
    })

    it('should handle all 7x7 combinations', () => {
      const types: ElementType[] = ['Fire', 'Water', 'Grass', 'Electric', 'Rock', 'Ice', 'Psychic']

      types.forEach(attacker => {
        types.forEach(defender => {
          const multiplier = getTypeMultiplier(attacker, defender)
          expect([1.5, 1.0, 0.67]).toContain(multiplier)
        })
      })
    })
  })

  describe('getTypeLabel', () => {
    it('should return "Super effective!" for super effective matchups', () => {
      expect(getTypeLabel('Fire', 'Grass')).toBe('Super effective!')
      expect(getTypeLabel('Water', 'Fire')).toBe('Super effective!')
      expect(getTypeLabel('Electric', 'Water')).toBe('Super effective!')
    })

    it('should return "Not very effective…" for not very effective matchups', () => {
      expect(getTypeLabel('Fire', 'Water')).toBe('Not very effective…')
      expect(getTypeLabel('Water', 'Grass')).toBe('Not very effective…')
      expect(getTypeLabel('Electric', 'Rock')).toBe('Not very effective…')
    })

    it('should return empty string for neutral matchups', () => {
      expect(getTypeLabel('Fire', 'Electric')).toBe('')
      expect(getTypeLabel('Water', 'Psychic')).toBe('')
      expect(getTypeLabel('Psychic', 'Fire')).toBe('')
    })
  })

  describe('isSuperEffective', () => {
    it('should return true for super effective matchups', () => {
      expect(isSuperEffective('Fire', 'Grass')).toBe(true)
      expect(isSuperEffective('Water', 'Rock')).toBe(true)
      expect(isSuperEffective('Rock', 'Fire')).toBe(true)
    })

    it('should return false for non-super-effective matchups', () => {
      expect(isSuperEffective('Fire', 'Water')).toBe(false)
      expect(isSuperEffective('Fire', 'Electric')).toBe(false)
      expect(isSuperEffective('Psychic', 'Water')).toBe(false)
    })
  })

  describe('isNotEffective', () => {
    it('should return true for not very effective matchups', () => {
      expect(isNotEffective('Fire', 'Water')).toBe(true)
      expect(isNotEffective('Water', 'Grass')).toBe(true)
      expect(isNotEffective('Ice', 'Fire')).toBe(true)
    })

    it('should return false for non-not-effective matchups', () => {
      expect(isNotEffective('Fire', 'Grass')).toBe(false)
      expect(isNotEffective('Fire', 'Electric')).toBe(false)
      expect(isNotEffective('Psychic', 'Water')).toBe(false)
    })
  })

  describe('type effectiveness summary', () => {
    it('should match DESIGN.md §3.1–3.2 effectiveness table', () => {
      const effectivenessTable = [
        { attacker: 'Fire', strong: ['Grass', 'Ice'], weak: ['Water', 'Rock'] },
        { attacker: 'Water', strong: ['Fire', 'Rock'], weak: ['Grass', 'Electric'] },
        { attacker: 'Grass', strong: ['Water', 'Rock'], weak: ['Fire', 'Ice'] },
        { attacker: 'Electric', strong: ['Water'], weak: ['Rock'] },
        { attacker: 'Rock', strong: ['Fire'], weak: ['Water', 'Grass'] },
        { attacker: 'Ice', strong: ['Grass'], weak: ['Fire', 'Rock'] },
        { attacker: 'Psychic', strong: [], weak: [] },
      ]

      effectivenessTable.forEach(({ attacker, strong, weak }) => {
        strong.forEach(defender => {
          expect(isSuperEffective(attacker as ElementType, defender as ElementType)).toBe(true)
        })

        weak.forEach(defender => {
          expect(isNotEffective(attacker as ElementType, defender as ElementType)).toBe(true)
        })
      })
    })
  })
})
