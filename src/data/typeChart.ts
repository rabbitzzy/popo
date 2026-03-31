import { ElementType } from './types'

// ============================================================================
// Type Effectiveness Charts
// ============================================================================

const SUPER_EFFECTIVE: Record<ElementType, ElementType[]> = {
  Fire: ['Grass', 'Ice'],
  Water: ['Fire', 'Rock'],
  Grass: ['Water', 'Rock'],
  Electric: ['Water'],
  Rock: ['Fire'],
  Ice: ['Grass'],
  Psychic: [], // Psychic has no full-type strengths (trait-only)
}

const NOT_EFFECTIVE: Record<ElementType, ElementType[]> = {
  Fire: ['Water', 'Rock'],
  Water: ['Grass', 'Electric'],
  Grass: ['Fire', 'Ice'],
  Electric: ['Rock'], // Ground mapped to Rock in this 7-type system
  Rock: ['Water', 'Grass'],
  Ice: ['Fire', 'Rock'],
  Psychic: [], // Psychic has no full-type weaknesses (trait-only)
}

// ============================================================================
// Type Effectiveness Multiplier
// ============================================================================

const MULTIPLIER_SUPER_EFFECTIVE = 1.5
const MULTIPLIER_NEUTRAL = 1.0
const MULTIPLIER_NOT_EFFECTIVE = 0.67

/**
 * Get the type effectiveness multiplier for an attack.
 *
 * @param attackType - The type of the attacking move
 * @param defenderType - The type of the defending Berryvolution
 * @returns 1.5 (super effective), 1.0 (neutral), or 0.67 (not very effective)
 */
export function getTypeMultiplier(attackType: ElementType, defenderType: ElementType): number {
  if (SUPER_EFFECTIVE[attackType].includes(defenderType)) {
    return MULTIPLIER_SUPER_EFFECTIVE
  }

  if (NOT_EFFECTIVE[attackType].includes(defenderType)) {
    return MULTIPLIER_NOT_EFFECTIVE
  }

  return MULTIPLIER_NEUTRAL
}

/**
 * Get the type effectiveness label for display.
 *
 * @param attackType - The type of the attacking move
 * @param defenderType - The type of the defending Berryvolution
 * @returns Human-readable label or empty string for neutral
 */
export function getTypeLabel(attackType: ElementType, defenderType: ElementType): string {
  const multiplier = getTypeMultiplier(attackType, defenderType)

  if (multiplier === MULTIPLIER_SUPER_EFFECTIVE) {
    return 'Super effective!'
  }

  if (multiplier === MULTIPLIER_NOT_EFFECTIVE) {
    return 'Not very effective…'
  }

  return ''
}

/**
 * Check if an attack is super effective.
 */
export function isSuperEffective(attackType: ElementType, defenderType: ElementType): boolean {
  return getTypeMultiplier(attackType, defenderType) === MULTIPLIER_SUPER_EFFECTIVE
}

/**
 * Check if an attack is not very effective.
 */
export function isNotEffective(attackType: ElementType, defenderType: ElementType): boolean {
  return getTypeMultiplier(attackType, defenderType) === MULTIPLIER_NOT_EFFECTIVE
}

export const TypeChart = {
  getTypeMultiplier,
  getTypeLabel,
  isSuperEffective,
  isNotEffective,
}
