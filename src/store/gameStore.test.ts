import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useGameStore } from './gameStore'
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

describe('Game Store (Zustand)', () => {
  beforeEach(() => {
    // Reset store to initial state
    useGameStore.setState({
      saveState: {
        version: 1,
        party: [],
        inventory: { crystalOrbs: 0, goldDust: 0, stamina: 0, evolutionStones: {} },
        arena: { points: 0, tier: 'Bronze' },
        berryLog: [],
        tutorialComplete: false,
        gameWon: false,
    currentLocation: 'verdant-vale' as const,
      },
      battleState: null,
      screen: { id: 'main-menu' },
    })
    mockLocalStorage.clear()
  })

  afterEach(() => {
    mockLocalStorage.clear()
  })

  // =========================================================================
  // Store Initialization Tests
  // =========================================================================

  describe('initGame', () => {
    it('should initialize with main menu screen', () => {
      const { initGame, screen } = useGameStore.getState()
      initGame()

      expect(screen.id).toBe('main-menu')
    })

    it('should load saved game if it exists', () => {
      // Pre-populate localStorage with a save
      const savedState = {
        version: 1,
        party: [],
        inventory: { crystalOrbs: 100, goldDust: 50, stamina: 10, evolutionStones: {} },
        arena: { points: 50, tier: 'Silver' },
        berryLog: ['hypereon'],
        tutorialComplete: true,
        gameWon: false,
    currentLocation: 'verdant-vale' as const,
      }
      mockLocalStorage.setItem('popo_save', JSON.stringify(savedState))

      const { initGame } = useGameStore.getState()
      initGame()

      const { saveState } = useGameStore.getState()
      expect(saveState.tutorialComplete).toBe(true)
      expect(saveState.inventory.crystalOrbs).toBe(100)
    })

    it('should create default game if no save exists', () => {
      const { initGame } = useGameStore.getState()
      initGame()

      const { saveState } = useGameStore.getState()
      expect(saveState.tutorialComplete).toBe(false)
      expect(saveState.party).toEqual([])
      expect(saveState.gameWon).toBe(false)
    })
  })

  // =========================================================================
  // Save/Load Tests
  // =========================================================================

  describe('saveGame', () => {
    it('should persist state to localStorage', () => {
      const { updateSaveState, saveGame } = useGameStore.getState()

      // Modify state
      updateSaveState({
        tutorialComplete: true,
        inventory: { crystalOrbs: 50, goldDust: 100, stamina: 20, evolutionStones: {} },
      })

      // Save
      saveGame()

      // Verify localStorage
      const stored = mockLocalStorage.getItem('popo_save')
      expect(stored).toBeTruthy()
      const parsed = JSON.parse(stored!)
      expect(parsed.tutorialComplete).toBe(true)
      expect(parsed.inventory.crystalOrbs).toBe(50)
    })
  })

  describe('loadGame', () => {
    it('should load game from localStorage', () => {
      const savedState = {
        version: 1,
        party: [],
        inventory: { crystalOrbs: 75, goldDust: 200, stamina: 15, evolutionStones: {} },
        arena: { points: 100, tier: 'Gold' },
        berryLog: ['hypereon', 'volteon'],
        tutorialComplete: true,
        gameWon: false,
    currentLocation: 'verdant-vale' as const,
      }
      mockLocalStorage.setItem('popo_save', JSON.stringify(savedState))

      const { loadGame } = useGameStore.getState()
      const success = loadGame()

      expect(success).toBe(true)
      const { saveState } = useGameStore.getState()
      expect(saveState.inventory.crystalOrbs).toBe(75)
      expect(saveState.berryLog).toEqual(['hypereon', 'volteon'])
    })

    it('should return false if no save exists', () => {
      const { loadGame } = useGameStore.getState()
      const success = loadGame()

      expect(success).toBe(false)
    })
  })

  describe('createNewGame', () => {
    it('should reset state and clear localStorage', () => {
      // Set up some state
      const { updateSaveState, saveGame, createNewGame } = useGameStore.getState()
      updateSaveState({ tutorialComplete: true })
      saveGame()

      // Create new game
      createNewGame()

      const { saveState, screen } = useGameStore.getState()
      expect(saveState.tutorialComplete).toBe(false)
      expect(saveState.party).toEqual([])
      expect(screen.id).toBe('main-menu')
      expect(mockLocalStorage.getItem('popo_save')).toBeNull()
    })
  })

  describe('clearGame', () => {
    it('should clear both store and localStorage', () => {
      // Setup
      const { updateSaveState, saveGame, clearGame } = useGameStore.getState()
      updateSaveState({ tutorialComplete: true })
      saveGame()

      // Clear
      clearGame()

      const { saveState } = useGameStore.getState()
      expect(saveState.tutorialComplete).toBe(false)
      expect(mockLocalStorage.getItem('popo_save')).toBeNull()
    })
  })

  // =========================================================================
  // Screen Navigation Tests
  // =========================================================================

  describe('setScreen', () => {
    it('should update current screen', () => {
      const { setScreen } = useGameStore.getState()

      setScreen({ id: 'team-builder' })

      const { screen } = useGameStore.getState()
      expect(screen.id).toBe('team-builder')
    })

    it('should handle battle screen with state', () => {
      const { setScreen } = useGameStore.getState()

      const battleState = {
        playerTeam: [],
        aiTeam: [],
        activePlayerIndex: 0,
        activeAiIndex: 0,
        turn: 1,
        log: [],
        phase: 'action-select' as const,
        outcome: null,
        aiDifficulty: 'Rookie' as const,
      }

      setScreen({ id: 'battle', battleState })

      const { screen } = useGameStore.getState()
      expect((screen as any).battleState).toBe(battleState)
    })

    it('should handle post-battle result screen', () => {
      const { setScreen } = useGameStore.getState()

      const result = {
        outcome: 'win' as const,
        xpEarned: {},
        arenaPointsChange: 10,
        resourcesEarned: { goldDust: 50, stamina: 5 },
      }

      setScreen({ id: 'post-battle', result })

      const { screen } = useGameStore.getState()
      expect((screen as any).result).toBe(result)
    })
  })

  // =========================================================================
  // Battle State Tests
  // =========================================================================

  describe('setBattleState', () => {
    it('should set battle state', () => {
      const { setBattleState } = useGameStore.getState()

      const battleState = {
        playerTeam: [],
        aiTeam: [],
        activePlayerIndex: 0,
        activeAiIndex: 0,
        turn: 1,
        log: [],
        phase: 'action-select' as const,
        outcome: null,
        aiDifficulty: 'Trainer' as const,
      }

      setBattleState(battleState)

      const { battleState: stored } = useGameStore.getState()
      expect(stored).toBe(battleState)
    })

    it('should clear battle state', () => {
      const { setBattleState } = useGameStore.getState()

      const battleState = {
        playerTeam: [],
        aiTeam: [],
        activePlayerIndex: 0,
        activeAiIndex: 0,
        turn: 1,
        log: [],
        phase: 'action-select' as const,
        outcome: null,
        aiDifficulty: 'Rookie' as const,
      }

      setBattleState(battleState)
      expect(useGameStore.getState().battleState).not.toBeNull()

      setBattleState(null)
      expect(useGameStore.getState().battleState).toBeNull()
    })
  })

  // =========================================================================
  // Save State Update Tests
  // =========================================================================

  describe('updateSaveState', () => {
    it('should update party', () => {
      const { updateSaveState } = useGameStore.getState()

      const newParty = [
        {
          instanceId: 'test-1',
          defId: 'hypereon' as const,
          level: 10,
          xp: 500,
          currentStats: { hp: 100, atk: 50, def: 50, spd: 50, nrg: 50 },
          maxHp: 100,
          unlockedMoveIds: [],
        },
      ]

      updateSaveState({ party: newParty })

      const { saveState } = useGameStore.getState()
      expect(saveState.party).toEqual(newParty)
    })

    it('should update inventory', () => {
      const { updateSaveState } = useGameStore.getState()

      updateSaveState({
        inventory: {
          crystalOrbs: 100,
          goldDust: 500,
          stamina: 30,
          evolutionStones: { 'Water Stone': 2, 'Fire Stone': 1 },
        },
      })

      const { saveState } = useGameStore.getState()
      expect(saveState.inventory.crystalOrbs).toBe(100)
      expect(saveState.inventory.evolutionStones['Water Stone']).toBe(2)
    })

    it('should update arena', () => {
      const { updateSaveState } = useGameStore.getState()

      updateSaveState({ arena: { points: 250, tier: 'Crystal' } })

      const { saveState } = useGameStore.getState()
      expect(saveState.arena.points).toBe(250)
      expect(saveState.arena.tier).toBe('Crystal')
    })

    it('should update berryLog', () => {
      const { updateSaveState } = useGameStore.getState()

      updateSaveState({ berryLog: ['hypereon', 'volteon', 'emberon'] })

      const { saveState } = useGameStore.getState()
      expect(saveState.berryLog).toEqual(['hypereon', 'volteon', 'emberon'])
    })

    it('should merge partial updates', () => {
      const { updateSaveState } = useGameStore.getState()

      // First update
      updateSaveState({ tutorialComplete: true })

      // Second update (should not clear tutorialComplete)
      updateSaveState({ inventory: { crystalOrbs: 50, goldDust: 100, stamina: 10, evolutionStones: {} } })

      const { saveState } = useGameStore.getState()
      expect(saveState.tutorialComplete).toBe(true)
      expect(saveState.inventory.crystalOrbs).toBe(50)
    })
  })

  // =========================================================================
  // Selector Tests (use getState() instead of hooks, which require React context)
  // =========================================================================

  describe('Selectors (getState)', () => {
    it('should access party from state', () => {
      const party = [
        {
          instanceId: 'test-1',
          defId: 'hypereon' as const,
          level: 10,
          xp: 0,
          currentStats: { hp: 100, atk: 50, def: 50, spd: 50, nrg: 50 },
          maxHp: 100,
          unlockedMoveIds: [],
        },
      ]

      useGameStore.setState({ saveState: { ...useGameStore.getState().saveState, party } })

      const state = useGameStore.getState()
      expect(state.saveState.party).toEqual(party)
    })

    it('should access inventory from state', () => {
      const inventory = { crystalOrbs: 100, goldDust: 500, stamina: 20, evolutionStones: { 'Water Stone': 1 } }

      useGameStore.setState({ saveState: { ...useGameStore.getState().saveState, inventory } })

      const state = useGameStore.getState()
      expect(state.saveState.inventory).toEqual(inventory)
    })

    it('should access arena status from state', () => {
      const arena = { tier: 'Gold' as const, points: 200 }

      useGameStore.setState({ saveState: { ...useGameStore.getState().saveState, arena } })

      const state = useGameStore.getState()
      expect(state.saveState.arena).toEqual(arena)
    })

    it('should access berryLog from state', () => {
      const berryLog = ['hypereon', 'volteon', 'emberon'] as any[]

      useGameStore.setState({ saveState: { ...useGameStore.getState().saveState, berryLog } })

      const state = useGameStore.getState()
      expect(state.saveState.berryLog).toEqual(berryLog)
    })

    it('should access current screen from state', () => {
      useGameStore.setState({ screen: { id: 'team-builder' } })

      const state = useGameStore.getState()
      expect(state.screen.id).toBe('team-builder')
    })

    it('should detect battle active state correctly', () => {
      const battleState = {
        playerTeam: [],
        aiTeam: [],
        activePlayerIndex: 0,
        activeAiIndex: 0,
        turn: 1,
        log: [],
        phase: 'action-select' as const,
        outcome: null,
        aiDifficulty: 'Rookie' as const,
      }

      useGameStore.setState({ battleState })

      const state = useGameStore.getState()
      expect(state.battleState !== null).toBe(true)
    })

    it('should detect no battle when battleState is null', () => {
      useGameStore.setState({ battleState: null })

      const state = useGameStore.getState()
      expect(state.battleState !== null).toBe(false)
    })
  })
})
