import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useGameStore } from './store/gameStore'
import { peekState, printState, summary } from './debug'
import { computeStats } from './engine/leveling'

// ── Helpers ───────────────────────────────────────────────────────────────────

function resetStore() {
  const store = useGameStore.getState()
  useGameStore.setState({
    saveState: {
      version: 1,
      party: [],
      inventory: { crystalOrbs: 3, goldDust: 100, stamina: 8, evolutionStones: { 'Fire Stone': 2 } },
      arena: { points: 150, tier: 'Silver' },
      berryLog: ['emberon', 'hypereon'],
      tutorialComplete: true,
      gameWon: false,
    currentLocation: 'verdant-vale' as const,
    },
    battleState: null,
    screen: { id: 'main-menu' },
    initGame: store.initGame,
    createNewGame: store.createNewGame,
    loadGame: store.loadGame,
    saveGame: store.saveGame,
    clearGame: store.clearGame,
    setScreen: store.setScreen,
    setBattleState: store.setBattleState,
    updateSaveState: store.updateSaveState,
  })
}

function makeBerry(level = 5) {
  const stats = computeStats('berry', level)
  return {
    instanceId: 'berry-1',
    defId: 'berry' as const,
    level,
    xp: 10,
    currentStats: stats,
    maxHp: stats.hp,
    unlockedMoveIds: [],
  }
}

// ── Test suite ────────────────────────────────────────────────────────────────

describe('Debug Utilities', () => {
  beforeEach(() => {
    resetStore()
  })

  // ── peekState ──────────────────────────────────────────────────────────────

  it('peekState returns save state', () => {
    const state = peekState()
    expect(state.saveState.inventory.stamina).toBe(8)
  })

  it('peekState returns battle state', () => {
    const state = peekState()
    expect(state.battleState).toBeNull()
  })

  it('peekState returns current screen', () => {
    const state = peekState()
    expect(state.screen.id).toBe('main-menu')
  })

  it('peekState contains party data', () => {
    useGameStore.setState(s => ({
      saveState: { ...s.saveState, party: [makeBerry()] },
    }))
    const state = peekState()
    expect(state.saveState.party).toHaveLength(1)
  })

  it('peekState contains inventory', () => {
    const state = peekState()
    expect(state.saveState.inventory.goldDust).toBe(100)
    expect(state.saveState.inventory.crystalOrbs).toBe(3)
  })

  it('peekState contains arena data', () => {
    const state = peekState()
    expect(state.saveState.arena.tier).toBe('Silver')
    expect(state.saveState.arena.points).toBe(150)
  })

  // ── printState ────────────────────────────────────────────────────────────

  it('printState logs to console', () => {
    const spy = vi.spyOn(console, 'group')
    printState()
    expect(spy).toHaveBeenCalled()
    spy.mockRestore()
  })

  it('printState includes save state', () => {
    const logSpy = vi.spyOn(console, 'log')
    printState()
    expect(logSpy).toHaveBeenCalledWith('Save State:', expect.anything())
    logSpy.mockRestore()
  })

  // ── summary ────────────────────────────────────────────────────────────────

  it('summary includes tutorial completion', () => {
    const s = summary()
    expect(s.tutorialComplete).toBe(true)
  })

  it('summary includes game won status', () => {
    const s = summary()
    expect(s.gameWon).toBe(false)
  })

  it('summary includes party size', () => {
    useGameStore.setState(s => ({
      saveState: { ...s.saveState, party: [makeBerry(), makeBerry()] },
    }))
    const s = summary()
    expect(s.partySize).toBe(2)
  })

  it('summary includes party member info', () => {
    useGameStore.setState(s => ({
      saveState: { ...s.saveState, party: [makeBerry(7)] },
    }))
    const s = summary()
    const partyMembers = s.partyMembers as Array<{ name: string; level: number }>
    expect(partyMembers[0].level).toBe(7)
  })

  it('summary includes inventory', () => {
    const s = summary()
    expect(s.inventory).toHaveProperty('stamina')
    expect(s.inventory).toHaveProperty('crystalOrbs')
    expect(s.inventory).toHaveProperty('goldDust')
    expect(s.inventory).toHaveProperty('evolutionStones')
  })

  it('summary includes arena tier and points', () => {
    const s = summary()
    expect(s.arena).toEqual({ tier: 'Silver', points: 150 })
  })

  it('summary includes berryvolution log progress', () => {
    const s = summary()
    expect((s.berryvolutionLog as any).collected).toBe(2)
    expect((s.berryvolutionLog as any).total).toBe(8)
  })

  it('summary includes current screen', () => {
    const s = summary()
    expect(s.currentScreen).toBe('main-menu')
  })

  it('summary evolution stones only includes owned', () => {
    const s = summary()
    const stones = (s.inventory as any).evolutionStones
    expect(stones['Fire Stone']).toBe(2)
    expect(stones['Water Stone']).toBeUndefined()
  })

  it('summary reflects berryvolution log', () => {
    const s = summary()
    const log = (s.berryvolutionLog as any)
    expect(log.forms).toContain('emberon')
    expect(log.forms).toContain('hypereon')
  })
})
