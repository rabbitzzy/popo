import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import ReactDOM from 'react-dom'
import BerryLog from './BerryLog'
import { useGameStore } from '../store/gameStore'

// ── Helpers ───────────────────────────────────────────────────────────────────

function resetStore(berryLogOverride: string[] = []) {
  const store = useGameStore.getState()
  useGameStore.setState({
    saveState: {
      version: 1,
      party: [],
      inventory: { crystalOrbs: 0, goldDust: 0, stamina: 0, evolutionStones: {} },
      arena: { points: 0, tier: 'Bronze' },
      berryLog: berryLogOverride as import('../data/types').BerryvolutionId[],
      tutorialComplete: true,
      gameWon: false,
    },
    battleState: null,
    screen: { id: 'berry-log' },
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

describe('BerryLog', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    resetStore()
  })

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(container)
    document.body.removeChild(container)
  })

  // ── Layout ────────────────────────────────────────────────────────────────

  it('renders "Berry Log" heading', () => {
    ReactDOM.render(<BerryLog />, container)
    expect(container.textContent).toContain('Berry Log')
  })

  it('renders Back button', () => {
    ReactDOM.render(<BerryLog />, container)
    const btns = Array.from(container.querySelectorAll('button'))
    expect(btns.some(b => b.textContent?.includes('Back'))).toBe(true)
  })

  it('navigates to main-menu when Back clicked', () => {
    ReactDOM.render(<BerryLog />, container)
    const btn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('Back'))
    btn?.click()
    expect(useGameStore.getState().screen.id).toBe('main-menu')
  })

  // ── Progress bar ──────────────────────────────────────────────────────────

  it('shows "0 / 8" when nothing collected', () => {
    ReactDOM.render(<BerryLog />, container)
    expect(container.textContent).toContain('0 / 8')
  })

  it('shows "3 / 8" with 3 in log', () => {
    resetStore(['hypereon', 'volteon', 'emberon'])
    ReactDOM.render(<BerryLog />, container)
    expect(container.textContent).toContain('3 / 8')
  })

  it('shows "8 / 8" when all collected', () => {
    resetStore(['hypereon', 'volteon', 'emberon', 'eryleon', 'vengeon', 'grasseon', 'polareon', 'luxeon'])
    ReactDOM.render(<BerryLog />, container)
    expect(container.textContent).toContain('8 / 8')
  })

  it('shows Complete! badge when all 8 collected', () => {
    resetStore(['hypereon', 'volteon', 'emberon', 'eryleon', 'vengeon', 'grasseon', 'polareon', 'luxeon'])
    ReactDOM.render(<BerryLog />, container)
    expect(container.textContent).toContain('Complete!')
  })

  it('does not show Complete! when collection is incomplete', () => {
    resetStore(['hypereon'])
    ReactDOM.render(<BerryLog />, container)
    expect(container.textContent).not.toContain('Complete!')
  })

  it('progress bar width is 0% when nothing collected', () => {
    ReactDOM.render(<BerryLog />, container)
    const bars = Array.from(container.querySelectorAll('div')).filter(
      d => d.style.width && d.style.width.includes('%') && d.style.backgroundColor === 'rgb(78, 205, 196)'
    )
    expect(bars.some(b => b.style.width === '0%')).toBe(true)
  })

  it('progress bar width is 100% when all collected', () => {
    resetStore(['hypereon', 'volteon', 'emberon', 'eryleon', 'vengeon', 'grasseon', 'polareon', 'luxeon'])
    ReactDOM.render(<BerryLog />, container)
    const bars = Array.from(container.querySelectorAll('div')).filter(
      d => d.style.width === '100%'
    )
    expect(bars.length).toBeGreaterThan(0)
  })

  // ── All 8 entries rendered ────────────────────────────────────────────────

  it('renders 8 log entries', () => {
    ReactDOM.render(<BerryLog />, container)
    // Each entry has a stone hint with "Find with:"
    const hints = container.textContent?.split('Find with:') ?? []
    expect(hints.length - 1).toBe(8)
  })

  it('always shows evolution stone names', () => {
    ReactDOM.render(<BerryLog />, container)
    expect(container.textContent).toContain('Water Stone')
    expect(container.textContent).toContain('Thunder Stone')
    expect(container.textContent).toContain('Fire Stone')
    expect(container.textContent).toContain('Ice Stone')
    expect(container.textContent).toContain('Ribbon Shard')
  })

  // ── Collected entry ───────────────────────────────────────────────────────

  it('shows name for collected entry', () => {
    resetStore(['hypereon'])
    ReactDOM.render(<BerryLog />, container)
    expect(container.textContent).toContain('Hypereon')
  })

  it('shows "Obtained with" for collected entry', () => {
    resetStore(['emberon'])
    ReactDOM.render(<BerryLog />, container)
    expect(container.textContent).toContain('Obtained with')
  })

  it('shows trait name for collected entry', () => {
    resetStore(['emberon'])
    ReactDOM.render(<BerryLog />, container)
    expect(container.textContent).toContain('Volatile')
  })

  it('shows trait description for collected entry', () => {
    resetStore(['emberon'])
    ReactDOM.render(<BerryLog />, container)
    expect(container.textContent).toContain('15%')
  })

  it('shows Hydration trait for Hypereon', () => {
    resetStore(['hypereon'])
    ReactDOM.render(<BerryLog />, container)
    expect(container.textContent).toContain('Hydration')
  })

  it('shows Frost Armor trait for Polareon', () => {
    resetStore(['polareon'])
    ReactDOM.render(<BerryLog />, container)
    expect(container.textContent).toContain('Frost Armor')
  })

  it('shows Fairy Charm trait for Luxeon', () => {
    resetStore(['luxeon'])
    ReactDOM.render(<BerryLog />, container)
    expect(container.textContent).toContain('Fairy Charm')
  })

  // ── Uncollected entry ─────────────────────────────────────────────────────

  it('shows ??? for uncollected entries', () => {
    ReactDOM.render(<BerryLog />, container)
    expect(container.textContent).toContain('???')
  })

  it('does not show Hypereon name when not collected', () => {
    ReactDOM.render(<BerryLog />, container)
    expect(container.textContent).not.toContain('Hypereon')
  })

  it('does not show trait for uncollected entry', () => {
    ReactDOM.render(<BerryLog />, container)
    expect(container.textContent).not.toContain('Hydration')
  })

  it('shows "Find with" for uncollected entries', () => {
    ReactDOM.render(<BerryLog />, container)
    expect(container.textContent).toContain('Find with')
  })

  // ── Mixed state ───────────────────────────────────────────────────────────

  it('shows name for collected, ??? for uncollected in same render', () => {
    resetStore(['volteon'])
    ReactDOM.render(<BerryLog />, container)
    expect(container.textContent).toContain('Volteon')
    expect(container.textContent).toContain('???')
  })

  it('shows Swift trait only for Volteon when collected', () => {
    resetStore(['volteon'])
    ReactDOM.render(<BerryLog />, container)
    expect(container.textContent).toContain('Swift')
  })

  it('Dark Shroud visible only after collecting Vengeon', () => {
    ReactDOM.render(<BerryLog />, container)
    expect(container.textContent).not.toContain('Dark Shroud')
    resetStore(['vengeon'])
    ReactDOM.render(<BerryLog />, container)
    expect(container.textContent).toContain('Dark Shroud')
  })
})
