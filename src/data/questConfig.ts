// ============================================================================
// Quest Gate Configuration
// ============================================================================
// Each flag controls whether a Knowledge Quest is shown before that action.
// Set to false to bypass the quest and let the action proceed immediately.
//
// Usage in code:
//   import { QUEST_CONFIG } from '../../data/questConfig'
//   if (QUEST_CONFIG.gateExplore) { /* show quest */ } else { /* run action */ }

export const QUEST_CONFIG = {
  /** Show a quest before searching a zone (costs Stamina). */
  gateExplore: false,

  /** Show a quest before travelling to a new zone. Off by default (high-frequency action). */
  gateTravel: false,

  /** Show a quest before entering an Arena battle. */
  gateBattle: true,

  /** Show a quest before evolving a Berry. */
  gateEvolve: true,

  /** Show a quest before attempting to capture a wild Berry. */
  gateCapture: false,

  /** Show a quest before making a Shop purchase. Off by default. */
  gateShop: false,
} as const
