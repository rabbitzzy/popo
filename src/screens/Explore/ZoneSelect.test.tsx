import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import ReactDOM from 'react-dom'
import ZoneSelect from './ZoneSelect'
import { useGameStore } from '../../store/gameStore'
import * as exploration from '../../engine/exploration'

// ── Helpers ───────────────────────────────────────────────────────────────────

function resetStore(stamina = 10) {
  const store = useGameStore.getState()
  useGameStore.setState({
    saveState: {
      version: 1,
      party: [],
      inventory: { crystalOrbs: 0, goldDust: 50, stamina, evolutionStones: {} },
      arena: { points: 0, tier: 'Bronze' },
      berryLog: [],
      tutorialComplete: true,
      gameWon: false,
    currentLocation: 'verdant-vale' as const,
    },
    battleState: null,
    screen: { id: 'zone-select' },
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

// ── Test suite ────────────────────────────────────────────────────────────────

describe('ZoneSelect', () => {
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

  // ── Header ────────────────────────────────────────────────────────────────

  it('renders "Explore" heading', () => {
    ReactDOM.render(<ZoneSelect />, container)
    expect(container.textContent).toContain('Explore')
  })

  it('renders Back button', () => {
    ReactDOM.render(<ZoneSelect />, container)
    const btns = Array.from(container.querySelectorAll('button'))
    expect(btns.some(b => b.textContent?.includes('Back'))).toBe(true)
  })

  it('navigates to main-menu when Back clicked', () => {
    ReactDOM.render(<ZoneSelect />, container)
    const btn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('Back'))
    btn?.click()
    expect(useGameStore.getState().screen.id).toBe('main-menu')
  })

  // ── Stamina ───────────────────────────────────────────────────────────────

  it('shows stamina count', () => {
    ReactDOM.render(<ZoneSelect />, container)
    expect(container.textContent).toContain('Stamina:')
    expect(container.textContent).toContain('10')
  })

  it('shows stamina with 0', () => {
    resetStore(0)
    ReactDOM.render(<ZoneSelect />, container)
    expect(container.textContent).toContain('Stamina:')
    expect(container.textContent).toContain('0')
  })

  // ── GameMap rendering ─────────────────────────────────────────────────────

  it('renders GameMap component', () => {
    ReactDOM.render(<ZoneSelect />, container)
    // GameMap renders an SVG graph
    const svg = container.querySelector('svg')
    expect(svg).toBeTruthy()
  })
})
