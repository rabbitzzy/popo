// ============================================================================
// Quest Gate Configuration
// ============================================================================
// Each value is a probability (0–1) that a Knowledge Quest is shown before
// that action. 0 = never show a quest, 1 = always show a quest.
//
// Usage in code:
//   import { QUEST_CONFIG } from '../../data/questConfig'
//   if (Math.random() < QUEST_CONFIG.gateExplore) { /* show quest */ } else { /* run action */ }

export const QUEST_CONFIG = {
  /** Probability of showing a quest before searching a zone (costs Stamina). */
  gateExplore: 0,

  /** Probability of showing a quest before travelling to a new zone. Low by default (high-frequency action). */
  gateTravel: 0.1,

  /** Probability of showing a quest before entering an Arena battle. */
  gateBattle: 0.3,

  /** Probability of showing a quest before evolving a Berry. */
  gateEvolve: 0.7,

  /** Probability of showing a quest before attempting to capture a wild Berry. */
  gateCapture: 0.3,

  /** Probability of showing a quest before making a Shop purchase. */
  gateShop: 0,
} as const
