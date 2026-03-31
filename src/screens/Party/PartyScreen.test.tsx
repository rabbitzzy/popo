import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import React from 'react'
import ReactDOM from 'react-dom'
import PartyScreen from './PartyScreen'
import { useGameStore } from '../../store/gameStore'
import { computeStats } from '../../engine/leveling'

// ── Helpers ───────────────────────────────────────────────────────────────────

function resetStore(overrides: Record<string, unknown> = {}) {
  const store = useGameStore.getState()
  useGameStore.setState({
    saveState: {
      version: 1,
      party: [],
      inventory: {
        crystalOrbs: 0,
        goldDust: 0,
        stamina: 0,
        evolutionStones: {},
      },
      arena: { points: 0, tier: 'Bronze' },
      berryLog: [],
      tutorialComplete: true,
      gameWon: false,
      ...overrides,
    },
    battleState: null,
    screen: { id: 'party' },
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

function makeBerry(instanceId = 'berry-1', level = 1) {
  const stats = computeStats('berry', level)
  return {
    instanceId,
    defId: 'berry' as const,
    level,
    xp: 0,
    currentStats: stats,
    maxHp: stats.hp,
    unlockedMoveIds: [],
  }
}

function makeEmberon(instanceId = 'emberon-1', level = 5) {
  const stats = computeStats('emberon', level)
  return {
    instanceId,
    defId: 'emberon' as const,
    level,
    xp: 10,
    currentStats: stats,
    maxHp: stats.hp,
    unlockedMoveIds: ['emberon-ember'],
  }
}

// ── Test suite ────────────────────────────────────────────────────────────────

describe('PartyScreen', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    const mockStorage: Record<string, string> = {}
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => mockStorage[k] ?? null,
      setItem: (k: string, v: string) => { mockStorage[k] = v },
      removeItem: (k: string) => { delete mockStorage[k] },
      clear: () => Object.keys(mockStorage).forEach(k => delete mockStorage[k]),
    })
    resetStore()
  })

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(container)
    document.body.removeChild(container)
    vi.unstubAllGlobals()
  })

  // ── Layout ────────────────────────────────────────────────────────────────

  it('renders "Party" heading', () => {
    ReactDOM.render(<PartyScreen />, container)
    expect(container.textContent).toContain('Party')
  })

  it('renders Back button', () => {
    ReactDOM.render(<PartyScreen />, container)
    const buttons = Array.from(container.querySelectorAll('button'))
    expect(buttons.some(b => b.textContent?.includes('Back'))).toBe(true)
  })

  it('navigates to main-menu when Back is clicked', () => {
    ReactDOM.render(<PartyScreen />, container)
    const btn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('Back'))
    btn?.click()
    expect(useGameStore.getState().screen.id).toBe('main-menu')
  })

  // ── Empty party ───────────────────────────────────────────────────────────

  it('shows empty message when party is empty', () => {
    ReactDOM.render(<PartyScreen />, container)
    expect(container.textContent).toContain('No party members')
  })

  // ── Inventory strip ───────────────────────────────────────────────────────

  it('shows crystal orb count', () => {
    resetStore({ inventory: { crystalOrbs: 3, goldDust: 50, stamina: 10, evolutionStones: {} } })
    ReactDOM.render(<PartyScreen />, container)
    expect(container.textContent).toContain('3 Orbs')
  })

  it('shows gold dust count', () => {
    resetStore({ inventory: { crystalOrbs: 0, goldDust: 75, stamina: 0, evolutionStones: {} } })
    ReactDOM.render(<PartyScreen />, container)
    expect(container.textContent).toContain('75 Gold Dust')
  })

  it('shows stamina count', () => {
    resetStore({ inventory: { crystalOrbs: 0, goldDust: 0, stamina: 8, evolutionStones: {} } })
    ReactDOM.render(<PartyScreen />, container)
    expect(container.textContent).toContain('8 Stamina')
  })

  it('shows "No evolution stones" when inventory has none', () => {
    ReactDOM.render(<PartyScreen />, container)
    expect(container.textContent).toContain('No evolution stones')
  })

  it('shows owned evolution stones', () => {
    resetStore({
      inventory: {
        crystalOrbs: 0,
        goldDust: 0,
        stamina: 0,
        evolutionStones: { 'Fire Stone': 1, 'Water Stone': 2 },
      },
    })
    ReactDOM.render(<PartyScreen />, container)
    expect(container.textContent).toContain('Fire Stone')
    expect(container.textContent).toContain('Water Stone')
  })

  it('shows stone quantity', () => {
    resetStore({
      inventory: {
        crystalOrbs: 0,
        goldDust: 0,
        stamina: 0,
        evolutionStones: { 'Ice Stone': 3 },
      },
    })
    ReactDOM.render(<PartyScreen />, container)
    expect(container.textContent).toContain('×3')
  })

  // ── Party members ─────────────────────────────────────────────────────────

  it('shows party member name', () => {
    resetStore({ party: [makeBerry()] })
    ReactDOM.render(<PartyScreen />, container)
    expect(container.textContent).toContain('Berry')
  })

  it('shows multiple party members', () => {
    resetStore({ party: [makeBerry(), makeEmberon()] })
    ReactDOM.render(<PartyScreen />, container)
    expect(container.textContent).toContain('Berry')
    expect(container.textContent).toContain('Emberon')
  })

  it('navigates to berryvolution-detail when member card is clicked', () => {
    resetStore({ party: [makeBerry('berry-42')] })
    ReactDOM.render(<PartyScreen />, container)
    const clickableCards = Array.from(container.querySelectorAll('div[style*="pointer"]'))
    const berryCard = clickableCards.find(d => d.textContent?.includes('Berry'))
    berryCard?.click()
    const screen = useGameStore.getState().screen
    expect(screen.id).toBe('berryvolution-detail')
    if (screen.id === 'berryvolution-detail') {
      expect(screen.instanceId).toBe('berry-42')
    }
  })

  it('passes correct instanceId for second party member', () => {
    resetStore({ party: [makeBerry('berry-1'), makeEmberon('emberon-99')] })
    ReactDOM.render(<PartyScreen />, container)
    const clickableCards = Array.from(container.querySelectorAll('div[style*="pointer"]'))
    const emberonCard = clickableCards.find(d => d.textContent?.includes('Emberon'))
    emberonCard?.click()
    const screen = useGameStore.getState().screen
    if (screen.id === 'berryvolution-detail') {
      expect(screen.instanceId).toBe('emberon-99')
    }
  })
})
