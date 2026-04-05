import { create } from 'zustand'
import { SaveState, BattleState, Screen, LocationId } from '../data/types'
import { save as persistSave, load as persistLoad, clearSave as persistClearSave } from '../engine/save'
import { HOME_LOCATION } from '../data/mapGraph'

// ============================================================================
// Game Store Types
// ============================================================================

export interface GameStore {
  // Core State
  saveState: SaveState
  battleState: BattleState | null
  screen: Screen

  // Persistence
  initGame: () => void
  createNewGame: () => void
  loadGame: () => boolean
  saveGame: () => void
  clearGame: () => void

  // Navigation
  setScreen: (screen: Screen) => void

  // Battle
  setBattleState: (battleState: BattleState | null) => void

  // Core Updates (called by engine functions)
  updateSaveState: (partial: Partial<SaveState>) => void
}

// ============================================================================
// Initial Save State
// ============================================================================

function getDefaultSaveState(): SaveState {
  return {
    version: 1,
    party: [],
    inventory: {
      crystalOrbs: 0,
      goldDust: 0,
      stamina: 0,
      evolutionStones: {},
    },
    arena: {
      points: 0,
      tier: 'Bronze',
    },
    berryLog: [],
    tutorialComplete: false,
    gameWon: false,
    currentLocation: HOME_LOCATION as LocationId,
    zoneLastExploredAt: {},
  }
}

// ============================================================================
// Zustand Store
// ============================================================================

export const useGameStore = create<GameStore>((set, get) => ({
  // =========================================================================
  // Initial State
  // =========================================================================

  saveState: getDefaultSaveState(),
  battleState: null,
  screen: { id: 'main-menu' },

  // =========================================================================
  // Persistence Actions
  // =========================================================================

  /**
   * Initialize the game store.
   *
   * Attempts to load a save. If no save exists, creates a fresh game.
   * Called on app startup.
   */
  initGame: () => {
    const loaded = persistLoad()

    if (loaded) {
      set({
        saveState: loaded,
        screen: { id: 'main-menu' },
      })
    } else {
      set({
        saveState: getDefaultSaveState(),
        screen: { id: 'main-menu' },
      })
    }
  },

  /**
   * Create a new game (reset all state).
   *
   * Clears the save and resets to default state.
   */
  createNewGame: () => {
    persistClearSave()
    set({
      saveState: getDefaultSaveState(),
      battleState: null,
      screen: { id: 'main-menu' },
    })
  },

  /**
   * Load game from localStorage.
   *
   * @returns true if successful, false if no save exists or load failed
   */
  loadGame: () => {
    const loaded = persistLoad()

    if (!loaded) {
      return false
    }

    set({
      saveState: loaded,
      battleState: null,
    })

    return true
  },

  /**
   * Save current game state to localStorage.
   *
   * Called after meaningful mutations (battle, capture, evolution, etc).
   */
  saveGame: () => {
    const { saveState } = get()
    persistSave(saveState)
  },

  /**
   * Clear the saved game entirely.
   *
   * Useful for "New Game" flow or debugging.
   */
  clearGame: () => {
    persistClearSave()
    set({
      saveState: getDefaultSaveState(),
      battleState: null,
    })
  },

  // =========================================================================
  // Navigation
  // =========================================================================

  /**
   * Update the current screen.
   *
   * Screen is the only way to navigate in this game.
   */
  setScreen: (screen: Screen) => {
    set({ screen })
  },

  // =========================================================================
  // Battle State
  // =========================================================================

  /**
   * Set or clear the battle state.
   *
   * When a battle starts, battleState is set from the battle screen.
   * When a battle ends, battleState is cleared.
   */
  setBattleState: (battleState: BattleState | null) => {
    set({ battleState })
  },

  // =========================================================================
  // Core State Updates
  // =========================================================================

  /**
   * Update the save state with partial changes.
   *
   * Called by engine functions to apply results (XP, captures, etc).
   * Automatically merged with current state.
   */
  updateSaveState: (partial: Partial<SaveState>) => {
    set(state => ({
      saveState: {
        ...state.saveState,
        ...partial,
      },
    }))
  },
}))

// ============================================================================
// Convenience Selectors & Actions
// ============================================================================

/**
 * Get the current active player Berryvolution.
 */
export function useActivePlayerMember() {
  return useGameStore(state => {
    const battleState = state.battleState
    if (!battleState || battleState.playerTeam.length === 0) return null
    return battleState.playerTeam[battleState.activePlayerIndex]?.partyMember || null
  })
}

/**
 * Get the current active AI Berryvolution.
 */
export function useActiveAIMember() {
  return useGameStore(state => {
    const battleState = state.battleState
    if (!battleState || battleState.aiTeam.length === 0) return null
    return battleState.aiTeam[battleState.activeAiIndex]?.partyMember || null
  })
}

/**
 * Get the player's party from save state.
 */
export function useParty() {
  return useGameStore(state => state.saveState.party)
}

/**
 * Get the player's inventory.
 */
export function useInventory() {
  return useGameStore(state => state.saveState.inventory)
}

/**
 * Get the player's arena rank and points.
 */
export function useArenaStatus() {
  return useGameStore(state => state.saveState.arena)
}

/**
 * Get the player's Berryvolution collection log.
 */
export function useBerryLog() {
  return useGameStore(state => state.saveState.berryLog)
}

/**
 * Check if game is won.
 */
export function useGameWon() {
  return useGameStore(state => state.saveState.gameWon)
}

/**
 * Check if tutorial is complete.
 */
export function useTutorialComplete() {
  return useGameStore(state => state.saveState.tutorialComplete)
}

/**
 * Get the current screen.
 */
export function useCurrentScreen() {
  return useGameStore(state => state.screen)
}

/**
 * Check if currently in battle.
 */
export function useInBattle() {
  return useGameStore(state => state.battleState !== null)
}

/**
 * Get the current battle state (or null).
 */
export function useBattleState() {
  return useGameStore(state => state.battleState)
}
