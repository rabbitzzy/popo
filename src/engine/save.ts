import { SaveState } from '../data/types'

// ============================================================================
// Save/Load Constants & Keys
// ============================================================================

const SAVE_KEY = 'popo_save'
const SAVE_VERSION = 1

// ============================================================================
// Core Save & Load
// ============================================================================

/**
 * Save game state to localStorage.
 *
 * Called after meaningful state mutations (battle, capture, evolution, etc).
 * No auto-save timer — explicit saves only.
 *
 * @param state - The SaveState to persist
 */
export function save(state: SaveState): void {
  const payload = {
    version: SAVE_VERSION,
    ...state,
  }
  localStorage.setItem(SAVE_KEY, JSON.stringify(payload))
}

/**
 * Load game state from localStorage.
 *
 * @returns SaveState if found, null if no save exists
 * @throws Error if save file is corrupted
 */
export function load(): SaveState | null {
  const raw = localStorage.getItem(SAVE_KEY)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw)

    if (!parsed.version) {
      throw new Error('Invalid save file: missing version')
    }

    if (parsed.version !== SAVE_VERSION) {
      return migrate(parsed)
    }

    return parsed as SaveState
  } catch (error) {
    console.error('Failed to load save state:', error)
    return null
  }
}

/**
 * Clear the save file from localStorage.
 *
 * Used when starting a new game or resetting.
 */
export function clearSave(): void {
  localStorage.removeItem(SAVE_KEY)
}

// ============================================================================
// Save Migration
// ============================================================================

/**
 * Migrate save state from older version to current version.
 *
 * Currently only version 1 exists. Future versions can add migration logic here.
 *
 * @param oldState - Save state from older version
 * @returns Migrated SaveState for current version
 */
function migrate(oldState: any): SaveState {
  // No migration needed yet (only v1 exists)
  // In the future, if version 2 is added:
  // if (oldState.version === 1) return migrateV1ToV2(oldState)
  return oldState as SaveState
}

// ============================================================================
// Export/Import (for backup/restore)
// ============================================================================

/**
 * Export the current save state as a JSON file download.
 *
 * Creates a file named `popo_save.json` and triggers browser download.
 * Pure client-side operation — no server involved.
 *
 * @param state - The SaveState to export
 */
export function exportSave(state: SaveState): void {
  const payload = {
    version: SAVE_VERSION,
    ...state,
  }

  const json = JSON.stringify(payload, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = 'popo_save.json'
  link.click()

  URL.revokeObjectURL(url)
}

/**
 * Import a previously exported save file.
 *
 * Validates version and applies migration if needed.
 *
 * @param file - The JSON file to import
 * @returns Promise<SaveState> on success
 * @throws Error if file is invalid or corrupted
 */
export async function importSave(file: File): Promise<SaveState> {
  try {
    const text = await file.text()
    const parsed = JSON.parse(text)

    if (!parsed.version) {
      throw new Error('Invalid save file: missing version field')
    }

    if (parsed.version !== SAVE_VERSION) {
      return migrate(parsed)
    }

    return parsed as SaveState
  } catch (error) {
    throw new Error(`Failed to import save file: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// ============================================================================
// Win Condition Check
// ============================================================================

/**
 * Check if the player has achieved the win condition.
 *
 * Win condition: Collect all 8 Berryvolutions AND defeat the Apex tier arena.
 *
 * @param state - The current SaveState
 * @returns true if all Berryvolutions collected and Apex defeated
 */
export function checkWinCondition(state: SaveState): boolean {
  // All 8 Berryvolutions must be in the berry log
  const ALL_BERRYVOLUTION_IDS = [
    'hypereon',
    'volteon',
    'emberon',
    'eryleon',
    'vengeon',
    'grasseon',
    'polareon',
    'luxeon',
  ]

  const allCollected = ALL_BERRYVOLUTION_IDS.every(id => state.berryLog.includes(id as any))
  const apexDefeated = state.gameWon

  return allCollected && apexDefeated
}
