/**
 * Development debug utilities for peeking at game state.
 * Exposed on window.__GAME_DEBUG in development mode.
 */

import { useGameStore } from './store/gameStore'

export interface GameDebugState {
  saveState: ReturnType<typeof useGameStore.getState>['saveState']
  battleState: ReturnType<typeof useGameStore.getState>['battleState']
  screen: ReturnType<typeof useGameStore.getState>['screen']
}

/**
 * Get the complete current game state snapshot.
 * Useful for debugging during development.
 *
 * Usage (in browser console):
 *   __GAME_DEBUG.peekState()
 *   __GAME_DEBUG.peekState().saveState.party
 */
export function peekState(): GameDebugState {
  const state = useGameStore.getState()
  return {
    saveState: state.saveState,
    battleState: state.battleState,
    screen: state.screen,
  }
}

/**
 * Pretty-print the current game state to console.
 *
 * Usage (in browser console):
 *   __GAME_DEBUG.printState()
 */
export function printState(): void {
  const state = peekState()
  console.group('🎮 Game State')
  console.log('Save State:', state.saveState)
  console.log('Battle State:', state.battleState)
  console.log('Current Screen:', state.screen)
  console.groupEnd()
}

/**
 * Get a summary of the current game progress.
 *
 * Usage (in browser console):
 *   __GAME_DEBUG.summary()
 */
export function summary(): Record<string, unknown> {
  const state = peekState()
  const { saveState } = state

  return {
    tutorialComplete: saveState.tutorialComplete,
    gameWon: saveState.gameWon,
    partySize: saveState.party.length,
    partyMembers: saveState.party.map(m => ({
      name: m.defId,
      level: m.level,
      instanceId: m.instanceId,
    })),
    inventory: {
      stamina: saveState.inventory.stamina,
      crystalOrbs: saveState.inventory.crystalOrbs,
      goldDust: saveState.inventory.goldDust,
      evolutionStones: Object.entries(saveState.inventory.evolutionStones)
        .filter(([, count]) => count > 0)
        .reduce((acc, [stone, count]) => ({ ...acc, [stone]: count }), {}),
    },
    arena: {
      tier: saveState.arena.tier,
      points: saveState.arena.points,
    },
    berryvolutionLog: {
      collected: saveState.berryLog.length,
      total: 8,
      forms: saveState.berryLog,
    },
    currentScreen: state.screen.id,
  }
}

/**
 * Initialize debug utilities on window object.
 * Call this during app initialization if in development mode.
 */
export function initDebug(): void {
  if (typeof window !== 'undefined') {
    (window as any).__GAME_DEBUG = {
      peekState,
      printState,
      summary,
    }
    console.log('🎮 Game debug utilities loaded. Try: __GAME_DEBUG.summary()')
  }
}
