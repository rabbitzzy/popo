import { PartyMember } from '../data/types'

// ============================================================================
// Catch Rate Calculation
// ============================================================================

/**
 * Calculate the probability of successfully catching a wild Berry.
 *
 * Formula (from DESIGN.md):
 * catchChance = min(0.80, max(0.10, 0.70 * (1 - currentHp/maxHp) + 0.10))
 *
 * - At full HP (currentHp = maxHp): chance = 0.10 (10%)
 * - At half HP (currentHp = maxHp/2): chance = 0.45 (45%)
 * - At low HP (currentHp = 0): chance = 0.80 (80% cap)
 *
 * @param currentHp - Current HP of the wild Berry
 * @param maxHp - Maximum HP of the wild Berry
 * @returns Probability of successful capture (0.0 to 1.0)
 */
export function catchChance(currentHp: number, maxHp: number): number {
  return Math.min(0.8, Math.max(0.1, 0.7 * (1 - currentHp / maxHp) + 0.1))
}

// ============================================================================
// Capture Attempt
// ============================================================================

/**
 * Attempt to capture a wild Berry.
 *
 * Calculates catch probability based on current HP and performs a random roll.
 * Note: In a real scenario, this might consume a resource (Poke Ball / Crystal Orb)
 * and adjust probability based on item used. For now, it's a simple probability check.
 *
 * @param wildBerry - The wild Berry to attempt to capture
 * @returns true if capture succeeded, false otherwise
 */
export function attemptCapture(wildBerry: PartyMember): boolean {
  const chance = catchChance(wildBerry.currentStats.hp, wildBerry.maxHp)
  const roll = Math.random()
  return roll < chance
}
