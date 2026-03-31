import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import React from 'react'
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

  // ── Zones ─────────────────────────────────────────────────────────────────

  it('renders 5 zone cards', () => {
    ReactDOM.render(<ZoneSelect />, container)
    const searchBtns = Array.from(container.querySelectorAll('button')).filter(
      b => b.textContent?.includes('Search')
    )
    expect(searchBtns.length).toBe(5)
  })

  it('shows Ember Crater', () => {
    ReactDOM.render(<ZoneSelect />, container)
    expect(container.textContent).toContain('Ember Crater')
  })

  it('shows Tide Basin', () => {
    ReactDOM.render(<ZoneSelect />, container)
    expect(container.textContent).toContain('Tide Basin')
  })

  it('shows Verdant Vale', () => {
    ReactDOM.render(<ZoneSelect />, container)
    expect(container.textContent).toContain('Verdant Vale')
  })

  it('shows Frostpeak Zone', () => {
    ReactDOM.render(<ZoneSelect />, container)
    expect(container.textContent).toContain('Frostpeak Zone')
  })

  it('shows Wandering Path', () => {
    ReactDOM.render(<ZoneSelect />, container)
    expect(container.textContent).toContain('Wandering Path')
  })

  // ── Zone details ──────────────────────────────────────────────────────────

  it('shows berry encounter rates', () => {
    ReactDOM.render(<ZoneSelect />, container)
    expect(container.textContent).toContain('10%') // Ember Crater
    expect(container.textContent).toContain('8%')  // Frostpeak
    expect(container.textContent).toContain('5%')  // Wandering Path
  })

  it('shows Fire Stone in Ember Crater', () => {
    ReactDOM.render(<ZoneSelect />, container)
    expect(container.textContent).toContain('Fire Stone')
  })

  it('shows Water Stone in Tide Basin', () => {
    ReactDOM.render(<ZoneSelect />, container)
    expect(container.textContent).toContain('Water Stone')
  })

  it('shows gold dust ranges', () => {
    ReactDOM.render(<ZoneSelect />, container)
    expect(container.textContent).toContain('10-25') // Ember Crater, Tide Basin
    expect(container.textContent).toContain('15-35') // Frostpeak
  })

  // ── Search with stamina ───────────────────────────────────────────────────

  it('disables Search button when stamina is 0', () => {
    resetStore(0)
    ReactDOM.render(<ZoneSelect />, container)
    const searchBtns = Array.from(container.querySelectorAll('button')).filter(
      b => b.textContent?.includes('Search')
    )
    expect(searchBtns.every(b => (b as HTMLButtonElement).disabled)).toBe(true)
  })

  it('enables Search button when stamina > 0', () => {
    resetStore(5)
    ReactDOM.render(<ZoneSelect />, container)
    const searchBtns = Array.from(container.querySelectorAll('button')).filter(
      b => b.textContent?.includes('Search') && !(b as HTMLButtonElement).disabled
    )
    expect(searchBtns.length).toBeGreaterThan(0)
  })

  // ── Search results ────────────────────────────────────────────────────────

  it('deducts stamina after search', () => {
    vi.spyOn(exploration, 'searchZone').mockReturnValue({ type: 'nothing' })
    resetStore(10)
    ReactDOM.render(<ZoneSelect />, container)
    const btn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('Search') && !(b as HTMLButtonElement).disabled
    )
    btn?.click()
    expect(useGameStore.getState().saveState.inventory.stamina).toBe(9)
  })

  it('shows result message for nothing found', () => {
    vi.spyOn(exploration, 'searchZone').mockReturnValue({ type: 'nothing' })
    ReactDOM.render(<ZoneSelect />, container)
    const btn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('Search'))
    btn?.click()
    expect(container.textContent).toContain('Found nothing')
  })

  it('adds gold dust when stone found', () => {
    vi.spyOn(exploration, 'searchZone').mockReturnValue({ type: 'gold', amount: 15 })
    resetStore(10)
    ReactDOM.render(<ZoneSelect />, container)
    const btn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('Search'))
    btn?.click()
    expect(useGameStore.getState().saveState.inventory.goldDust).toBe(65) // 50 + 15
  })

  it('shows gold result message', () => {
    vi.spyOn(exploration, 'searchZone').mockReturnValue({ type: 'gold', amount: 20 })
    ReactDOM.render(<ZoneSelect />, container)
    const btn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('Search'))
    btn?.click()
    expect(container.textContent).toContain('20 Gold Dust')
  })

  it('adds evolution stone when found', () => {
    vi.spyOn(exploration, 'searchZone').mockReturnValue({ type: 'stone', stone: 'Fire Stone' })
    ReactDOM.render(<ZoneSelect />, container)
    const btn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('Search'))
    btn?.click()
    expect(useGameStore.getState().saveState.inventory.evolutionStones['Fire Stone']).toBe(1)
  })

  it('shows stone result message', () => {
    vi.spyOn(exploration, 'searchZone').mockReturnValue({ type: 'stone', stone: 'Water Stone' })
    ReactDOM.render(<ZoneSelect />, container)
    const btn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('Search'))
    btn?.click()
    expect(container.textContent).toContain('Water Stone')
  })

  it('navigates to encounter when wild berry found', () => {
    const mockBerry = {
      instanceId: 'wild-1',
      defId: 'berry' as const,
      level: 5,
      xp: 0,
      currentStats: { hp: 50, atk: 40, def: 40, spd: 45, nrg: 30 },
      maxHp: 50,
      unlockedMoveIds: [],
    }
    vi.spyOn(exploration, 'searchZone').mockReturnValue({ type: 'encounter' })
    vi.spyOn(exploration, 'spawnWildBerry').mockReturnValue(mockBerry)
    ReactDOM.render(<ZoneSelect />, container)
    const btn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('Search'))
    btn?.click()
    expect(useGameStore.getState().screen.id).toBe('encounter')
  })

  // ── Search again flow ─────────────────────────────────────────────────────

  it('shows "Search Again" button after result', () => {
    vi.spyOn(exploration, 'searchZone').mockReturnValue({ type: 'nothing' })
    ReactDOM.render(<ZoneSelect />, container)
    const btn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('Search'))
    btn?.click()
    const againBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('Search Again')
    )
    expect(againBtn).toBeTruthy()
  })

  it('"Search Again" returns to zone select', () => {
    vi.spyOn(exploration, 'searchZone').mockReturnValue({ type: 'nothing' })
    ReactDOM.render(<ZoneSelect />, container)
    let btn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('Search'))
    btn?.click()
    const againBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('Search Again')
    )
    againBtn?.click()
    expect(container.textContent).toContain('Explore')
  })

  it('"Back to Hub" navigates to main-menu', () => {
    vi.spyOn(exploration, 'searchZone').mockReturnValue({ type: 'nothing' })
    ReactDOM.render(<ZoneSelect />, container)
    const btn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('Search'))
    btn?.click()
    const backBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('Back to Hub')
    )
    backBtn?.click()
    expect(useGameStore.getState().screen.id).toBe('main-menu')
  })
})
