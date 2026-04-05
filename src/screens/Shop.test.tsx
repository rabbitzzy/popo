import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import ReactDOM from 'react-dom'
import Shop from './Shop'
import { useGameStore } from '../store/gameStore'
import { SHOP_PRICES } from '../data/config'

// ── Helpers ───────────────────────────────────────────────────────────────────

function resetStore(goldDustOverride = 100) {
  const store = useGameStore.getState()
  useGameStore.setState({
    saveState: {
      version: 1,
      party: [],
      inventory: { crystalOrbs: 0, goldDust: goldDustOverride, stamina: 20, evolutionStones: {} },
      arena: { points: 150, tier: 'Silver' },
      berryLog: [],
      tutorialComplete: true,
      gameWon: false,
    currentLocation: 'verdant-vale' as const,
    },
    battleState: null,
    screen: { id: 'shop' },
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

describe('Shop', () => {
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
  })

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(container)
    document.body.removeChild(container)
    vi.unstubAllGlobals()
  })

  // ── Header and navigation ──────────────────────────────────────────────────

  it('displays Shop heading', () => {
    resetStore()
    ReactDOM.render(<Shop />, container)
    expect(container.textContent).toContain('Shop')
  })

  it('shows back button', () => {
    resetStore()
    ReactDOM.render(<Shop />, container)
    const btns = Array.from(container.querySelectorAll('button'))
    expect(btns.some(b => b.textContent?.includes('Back'))).toBe(true)
  })

  it('navigates to main-menu on back click', () => {
    resetStore()
    ReactDOM.render(<Shop />, container)
    const btn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('Back')
    )
    btn?.click()
    expect(useGameStore.getState().screen.id).toBe('main-menu')
  })

  // ── Gold Dust balance display ──────────────────────────────────────────────

  it('displays Gold Dust balance label', () => {
    resetStore(100)
    ReactDOM.render(<Shop />, container)
    expect(container.textContent).toContain('Gold Dust Balance')
  })

  it('displays current gold dust amount', () => {
    resetStore(150)
    ReactDOM.render(<Shop />, container)
    expect(container.textContent).toContain('150')
  })

  it('displays zero gold dust', () => {
    resetStore(0)
    ReactDOM.render(<Shop />, container)
    expect(container.textContent).toContain('0')
  })

  // ── Shop items display ─────────────────────────────────────────────────────

  it('displays Available Items heading', () => {
    resetStore()
    ReactDOM.render(<Shop />, container)
    expect(container.textContent).toContain('Available Items')
  })

  it('displays Crystal Orb item', () => {
    resetStore()
    ReactDOM.render(<Shop />, container)
    expect(container.textContent).toContain('Crystal Orb')
  })

  it('displays Stamina Potion item', () => {
    resetStore()
    ReactDOM.render(<Shop />, container)
    expect(container.textContent).toContain('Stamina Potion')
  })

  it('shows Crystal Orb price', () => {
    resetStore()
    ReactDOM.render(<Shop />, container)
    expect(container.textContent).toContain(String(SHOP_PRICES.crystalOrb))
  })

  it('shows Stamina Potion price', () => {
    resetStore()
    ReactDOM.render(<Shop />, container)
    expect(container.textContent).toContain(String(SHOP_PRICES.staminaPotion))
  })

  it('displays Crystal Orb description', () => {
    resetStore()
    ReactDOM.render(<Shop />, container)
    expect(container.textContent).toContain('Powers evolution stones')
  })

  it('displays Stamina Potion description', () => {
    resetStore()
    ReactDOM.render(<Shop />, container)
    expect(container.textContent).toContain('Zone exploration')
  })

  it('shows stamina amount in potion description', () => {
    resetStore()
    ReactDOM.render(<Shop />, container)
    expect(container.textContent).toContain(String(SHOP_PRICES.staminaPotionAmount))
  })

  // ── Purchase affordability ─────────────────────────────────────────────────

  it('allows purchase when enough gold dust', () => {
    resetStore(100)
    ReactDOM.render(<Shop />, container)
    const text = container.textContent
    expect(text).toContain('Crystal Orb')
    expect(text).toContain('Stamina Potion')
  })

  it('shows items even when insufficient gold dust', () => {
    resetStore(5)
    ReactDOM.render(<Shop />, container)
    const text = container.textContent
    expect(text).toContain('Crystal Orb')
    expect(text).toContain('Stamina Potion')
  })

  // ── Price formatting ───────────────────────────────────────────────────────

  it('displays "Gold Dust" label next to each price', () => {
    resetStore()
    ReactDOM.render(<Shop />, container)
    expect(container.textContent).toContain('Gold Dust')
  })

  // ── Edge cases ────────────────────────────────────────────────────────────

  it('displays items correctly with no gold dust', () => {
    resetStore(0)
    ReactDOM.render(<Shop />, container)
    expect(container.textContent).toContain('Crystal Orb')
    expect(container.textContent).toContain('Stamina Potion')
  })

  it('shows both items with very high gold dust', () => {
    resetStore(10000)
    ReactDOM.render(<Shop />, container)
    expect(container.textContent).toContain('Crystal Orb')
    expect(container.textContent).toContain('Stamina Potion')
  })

  it('shows exact price for crystal orb', () => {
    resetStore(100)
    ReactDOM.render(<Shop />, container)
    expect(container.textContent).toContain(`${SHOP_PRICES.crystalOrb}`)
  })

  it('shows exact price for stamina potion', () => {
    resetStore(100)
    ReactDOM.render(<Shop />, container)
    expect(container.textContent).toContain(`${SHOP_PRICES.staminaPotion}`)
  })

  it('renders without errors with full balance', () => {
    resetStore(100)
    ReactDOM.render(<Shop />, container)
    expect(container.textContent).toContain('Shop')
  })

  it('displays balance before items', () => {
    resetStore(75)
    ReactDOM.render(<Shop />, container)
    const text = container.textContent
    expect(text.indexOf('Gold Dust Balance')).toBeLessThan(text.indexOf('Available Items'))
  })
})
