import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { save, load, clearSave, exportSave, importSave, checkWinCondition } from './save'
import { SaveState } from '../data/types'

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

vi.stubGlobal('localStorage', mockLocalStorage)

describe('Save & Load Engine', () => {
  // =========================================================================
  // Helper Functions
  // =========================================================================

  const createDefaultSaveState = (): SaveState => ({
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
    currentLocation: 'verdant-vale' as const,
  })

  beforeEach(() => {
    // Clear localStorage before each test
    mockLocalStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    mockLocalStorage.clear()
  })

  // =========================================================================
  // Core Save Tests
  // =========================================================================

  describe('save', () => {
    it('should save state to localStorage with version', () => {
      const state = createDefaultSaveState()

      save(state)

      const stored = mockLocalStorage.getItem('popo_save')
      expect(stored).toBeTruthy()

      const parsed = JSON.parse(stored!)
      expect(parsed.version).toBe(1)
      expect(parsed.party).toEqual([])
      expect(parsed.tutorialComplete).toBe(false)
    })

    it('should overwrite previous saves', () => {
      const state1 = createDefaultSaveState()
      state1.tutorialComplete = false
      const state2 = createDefaultSaveState()
      state2.tutorialComplete = true

      save(state1)
      save(state2)

      const stored = mockLocalStorage.getItem('popo_save')
      const parsed = JSON.parse(stored!)
      expect(parsed.tutorialComplete).toBe(true)
    })

    it('should preserve all SaveState fields', () => {
      const state = createDefaultSaveState()
      state.party = [
        {
          instanceId: 'test-1',
          defId: 'hypereon',
          level: 10,
          xp: 500,
          currentStats: { hp: 100, atk: 50, def: 50, spd: 50, nrg: 50 },
          maxHp: 100,
          unlockedMoveIds: ['move-1'],
        },
      ]
      state.inventory.crystalOrbs = 50
      state.inventory.goldDust = 1000
      state.inventory.stamina = 20
      state.inventory.evolutionStones['Water Stone'] = 2
      state.arena.points = 100
      state.arena.tier = 'Silver'
      state.berryLog = ['hypereon', 'volteon']
      state.tutorialComplete = true
      state.gameWon = false

      save(state)

      const stored = mockLocalStorage.getItem('popo_save')
      const parsed = JSON.parse(stored!)

      expect(parsed.party).toHaveLength(1)
      expect(parsed.party[0].defId).toBe('hypereon')
      expect(parsed.inventory.crystalOrbs).toBe(50)
      expect(parsed.inventory.goldDust).toBe(1000)
      expect(parsed.inventory.evolutionStones['Water Stone']).toBe(2)
      expect(parsed.arena.tier).toBe('Silver')
      expect(parsed.berryLog).toEqual(['hypereon', 'volteon'])
    })
  })

  // =========================================================================
  // Core Load Tests
  // =========================================================================

  describe('load', () => {
    it('should load state from localStorage', () => {
      const originalState = createDefaultSaveState()
      originalState.tutorialComplete = true
      save(originalState)

      const loadedState = load()

      expect(loadedState).not.toBeNull()
      expect(loadedState!.tutorialComplete).toBe(true)
      expect(loadedState!.version).toBe(1)
    })

    it('should return null if no save exists', () => {
      const loadedState = load()

      expect(loadedState).toBeNull()
    })

    it('should handle corrupted JSON gracefully', () => {
      mockLocalStorage.setItem('popo_save', 'not valid json {')

      const loadedState = load()

      expect(loadedState).toBeNull()
    })

    it('should detect missing version field', () => {
      const badSave = { party: [], tutorialComplete: false }
      mockLocalStorage.setItem('popo_save', JSON.stringify(badSave))

      const loadedState = load()

      expect(loadedState).toBeNull()
    })

    it('should preserve state roundtrip (save → load)', () => {
      const originalState = createDefaultSaveState()
      originalState.party = [
        {
          instanceId: 'test-1',
          defId: 'emberon',
          level: 25,
          xp: 5000,
          currentStats: { hp: 150, atk: 100, def: 50, spd: 80, nrg: 75 },
          maxHp: 150,
          unlockedMoveIds: ['move-1', 'move-2'],
        },
      ]
      originalState.inventory.crystalOrbs = 150
      originalState.arena.tier = 'Gold'

      save(originalState)
      const loadedState = load()

      expect(loadedState).not.toBeNull()
      expect(loadedState!.party[0].level).toBe(25)
      expect(loadedState!.inventory.crystalOrbs).toBe(150)
      expect(loadedState!.arena.tier).toBe('Gold')
    })
  })

  // =========================================================================
  // Clear Save Tests
  // =========================================================================

  describe('clearSave', () => {
    it('should remove save from localStorage', () => {
      const state = createDefaultSaveState()
      save(state)
      expect(mockLocalStorage.getItem('popo_save')).toBeTruthy()

      clearSave()

      expect(mockLocalStorage.getItem('popo_save')).toBeNull()
    })

    it('should work when no save exists', () => {
      // Should not throw
      expect(() => clearSave()).not.toThrow()
    })
  })

  // =========================================================================
  // Export/Import Tests
  // =========================================================================

  describe('exportSave', () => {
    it('should create a downloadable JSON file', () => {
      const state = createDefaultSaveState()
      state.tutorialComplete = true

      // Mock document and URL for Node environment
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn(),
      }

      // Stub global document object
      const mockDocument = {
        createElement: vi.fn(() => mockLink),
      }
      vi.stubGlobal('document', mockDocument)

      vi.stubGlobal('URL', {
        createObjectURL: vi.fn().mockReturnValue('blob:mock-url'),
        revokeObjectURL: vi.fn(),
      })

      exportSave(state)

      expect(mockLink.download).toBe('popo_save.json')
      expect(mockLink.click).toHaveBeenCalled()
    })
  })

  describe('importSave', () => {
    it('should parse valid save file', async () => {
      const state = createDefaultSaveState()
      state.tutorialComplete = true
      const json = JSON.stringify({ ...state, version: 1 })
      const file = new File([json], 'save.json', { type: 'application/json' })

      const imported = await importSave(file)

      expect(imported.tutorialComplete).toBe(true)
      expect(imported.version).toBe(1)
    })

    it('should reject file without version', async () => {
      const json = JSON.stringify({ party: [], tutorialComplete: false })
      const file = new File([json], 'save.json', { type: 'application/json' })

      await expect(importSave(file)).rejects.toThrow('Invalid save file')
    })

    it('should reject corrupted JSON', async () => {
      const file = new File(['not valid json {'], 'save.json', { type: 'application/json' })

      await expect(importSave(file)).rejects.toThrow('Failed to import save file')
    })

    it('should handle migration on import if version differs (future versions)', async () => {
      // Simulate a future version 2 save file
      const futureState = { version: 2, party: [], tutorialComplete: false, inventory: { crystalOrbs: 0, goldDust: 0, stamina: 0, evolutionStones: {} }, arena: { points: 0, tier: 'Bronze' as const }, berryLog: [], gameWon: false }
      const json = JSON.stringify(futureState)
      const file = new File([json], 'save.json', { type: 'application/json' })

      const imported = await importSave(file)

      // Migration should handle it (currently no-op, so v2 stays as-is)
      expect(imported.version).toBe(2)
    })
  })

  // =========================================================================
  // Win Condition Tests
  // =========================================================================

  describe('checkWinCondition', () => {
    it('should return true when all Berryvolutions collected and Apex defeated', () => {
      const state = createDefaultSaveState()
      state.berryLog = ['hypereon', 'volteon', 'emberon', 'eryleon', 'vengeon', 'grasseon', 'polareon', 'luxeon']
      state.gameWon = true

      expect(checkWinCondition(state)).toBe(true)
    })

    it('should return false if not all Berryvolutions collected', () => {
      const state = createDefaultSaveState()
      state.berryLog = ['hypereon', 'volteon', 'emberon'] // Missing 5
      state.gameWon = true

      expect(checkWinCondition(state)).toBe(false)
    })

    it('should return false if Apex not defeated', () => {
      const state = createDefaultSaveState()
      state.berryLog = ['hypereon', 'volteon', 'emberon', 'eryleon', 'vengeon', 'grasseon', 'polareon', 'luxeon']
      state.gameWon = false

      expect(checkWinCondition(state)).toBe(false)
    })

    it('should return false if both conditions not met', () => {
      const state = createDefaultSaveState()
      state.berryLog = ['hypereon', 'volteon']
      state.gameWon = false

      expect(checkWinCondition(state)).toBe(false)
    })

    it('should return false if only some Berryvolutions collected', () => {
      const state = createDefaultSaveState()
      state.berryLog = ['hypereon', 'volteon', 'emberon', 'eryleon', 'vengeon', 'grasseon', 'polareon']
      state.gameWon = true

      expect(checkWinCondition(state)).toBe(false) // Missing luxeon
    })
  })
})
