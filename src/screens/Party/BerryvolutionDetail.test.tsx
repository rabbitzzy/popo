import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import React from 'react'
import ReactDOM from 'react-dom'
import BerryvolutionDetail from './BerryvolutionDetail'
import { useGameStore } from '../../store/gameStore'
import { computeStats } from '../../engine/leveling'

// ── Helpers ───────────────────────────────────────────────────────────────────

function resetStore(partyOverride = [], inventoryOverride = {}, berryLogOverride = []) {
  const store = useGameStore.getState()
  useGameStore.setState({
    saveState: {
      version: 1,
      party: partyOverride,
      inventory: {
        crystalOrbs: 3,
        goldDust: 50,
        stamina: 10,
        evolutionStones: {},
        ...inventoryOverride,
      },
      arena: { points: 0, tier: 'Bronze' },
      berryLog: berryLogOverride,
      tutorialComplete: true,
      gameWon: false,
    },
    battleState: null,
    screen: { id: 'berryvolution-detail', instanceId: 'berry-1' },
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

describe('BerryvolutionDetail', () => {
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

  // ── Not found ─────────────────────────────────────────────────────────────

  it('shows not-found message for unknown instanceId', () => {
    resetStore([makeBerry()])
    ReactDOM.render(<BerryvolutionDetail instanceId="nonexistent" />, container)
    expect(container.textContent).toContain('not found')
  })

  it('shows Back to Party button when member not found', () => {
    resetStore([])
    ReactDOM.render(<BerryvolutionDetail instanceId="gone" />, container)
    const btn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('Back to Party'))
    expect(btn).toBeTruthy()
  })

  // ── Header & navigation ───────────────────────────────────────────────────

  it('renders member name in header for Berry', () => {
    resetStore([makeBerry('berry-1', 1)])
    ReactDOM.render(<BerryvolutionDetail instanceId="berry-1" />, container)
    expect(container.textContent).toContain('Berry')
  })

  it('renders member name in header for Emberon', () => {
    resetStore([makeEmberon('emberon-1', 5)])
    ReactDOM.render(<BerryvolutionDetail instanceId="emberon-1" />, container)
    expect(container.textContent).toContain('Emberon')
  })

  it('renders Party back button', () => {
    resetStore([makeBerry()])
    ReactDOM.render(<BerryvolutionDetail instanceId="berry-1" />, container)
    const btn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('Party'))
    expect(btn).toBeTruthy()
  })

  it('navigates to party screen when back is clicked', () => {
    resetStore([makeBerry()])
    ReactDOM.render(<BerryvolutionDetail instanceId="berry-1" />, container)
    const btn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('Party'))
    btn?.click()
    expect(useGameStore.getState().screen.id).toBe('party')
  })

  // ── XP progress ───────────────────────────────────────────────────────────

  it('shows XP progress section when not at level cap', () => {
    resetStore([makeBerry('berry-1', 5)])
    ReactDOM.render(<BerryvolutionDetail instanceId="berry-1" />, container)
    expect(container.textContent).toContain('XP Progress')
  })

  it('shows level cap message at Berry level 10', () => {
    resetStore([makeBerry('berry-1', 10)])
    ReactDOM.render(<BerryvolutionDetail instanceId="berry-1" />, container)
    expect(container.textContent).toContain('Level Cap Reached')
  })

  it('shows level cap of 30 for Berryvolutions', () => {
    const stats = computeStats('emberon', 30)
    const cap30 = { instanceId: 'em-30', defId: 'emberon' as const, level: 30, xp: 0, currentStats: stats, maxHp: stats.hp, unlockedMoveIds: [] }
    resetStore([cap30])
    ReactDOM.render(<BerryvolutionDetail instanceId="em-30" />, container)
    expect(container.textContent).toContain('30')
    expect(container.textContent).toContain('Level Cap Reached')
  })

  // ── Trait ─────────────────────────────────────────────────────────────────

  it('shows trait name for Emberon (Volatile)', () => {
    resetStore([makeEmberon()])
    ReactDOM.render(<BerryvolutionDetail instanceId="emberon-1" />, container)
    expect(container.textContent).toContain('Volatile')
  })

  it('shows trait description', () => {
    resetStore([makeEmberon()])
    ReactDOM.render(<BerryvolutionDetail instanceId="emberon-1" />, container)
    expect(container.textContent).toContain('15%')
  })

  it('does not show trait section for Berry', () => {
    resetStore([makeBerry()])
    ReactDOM.render(<BerryvolutionDetail instanceId="berry-1" />, container)
    expect(container.textContent).not.toContain('Trait:')
  })

  // ── Moves ─────────────────────────────────────────────────────────────────

  it('shows moves section for Emberon at level 5', () => {
    resetStore([makeEmberon('emberon-1', 5)])
    ReactDOM.render(<BerryvolutionDetail instanceId="emberon-1" />, container)
    expect(container.textContent).toContain('Moves')
  })

  it('shows next move unlock hint', () => {
    resetStore([makeEmberon('emberon-1', 5)])
    ReactDOM.render(<BerryvolutionDetail instanceId="emberon-1" />, container)
    expect(container.textContent).toContain('Next move unlocks at')
  })

  it('shows Berry no-moves hint', () => {
    resetStore([makeBerry()])
    ReactDOM.render(<BerryvolutionDetail instanceId="berry-1" />, container)
    expect(container.textContent).toContain('cannot use special moves')
  })

  it('shows all 4 moves unlocked at level 22+', () => {
    const stats = computeStats('emberon', 22)
    const lv22 = { instanceId: 'em-22', defId: 'emberon' as const, level: 22, xp: 0, currentStats: stats, maxHp: stats.hp, unlockedMoveIds: [] }
    resetStore([lv22])
    ReactDOM.render(<BerryvolutionDetail instanceId="em-22" />, container)
    expect(container.textContent).toContain('4 / 4')
  })

  // ── Evolution section ─────────────────────────────────────────────────────

  it('shows Evolution section for Berry', () => {
    resetStore([makeBerry()])
    ReactDOM.render(<BerryvolutionDetail instanceId="berry-1" />, container)
    expect(container.textContent).toContain('Evolution')
  })

  it('shows level requirement when Berry below level 10', () => {
    resetStore([makeBerry('berry-1', 5)])
    ReactDOM.render(<BerryvolutionDetail instanceId="berry-1" />, container)
    expect(container.textContent).toContain('level 10')
  })

  it('shows explore hint when Berry at level 10 but no stones', () => {
    resetStore([makeBerry('berry-1', 10)])
    ReactDOM.render(<BerryvolutionDetail instanceId="berry-1" />, container)
    expect(container.textContent).toContain('Find Evolution Stones')
  })

  it('shows evolution button when Berry level 10 and stone available', () => {
    resetStore(
      [makeBerry('berry-1', 10)],
      { evolutionStones: { 'Fire Stone': 1 } },
    )
    ReactDOM.render(<BerryvolutionDetail instanceId="berry-1" />, container)
    const buttons = Array.from(container.querySelectorAll('button'))
    expect(buttons.some(b => b.textContent?.includes('Fire Stone'))).toBe(true)
  })

  it('shows target form name on evolution button', () => {
    resetStore(
      [makeBerry('berry-1', 10)],
      { evolutionStones: { 'Fire Stone': 1 } },
    )
    ReactDOM.render(<BerryvolutionDetail instanceId="berry-1" />, container)
    expect(container.textContent).toContain('Emberon')
  })

  it('does not show evolution button if form already in party', () => {
    // Already have emberon in party — fire stone should not be eligible
    resetStore(
      [makeBerry('berry-1', 10), makeEmberon('emberon-1', 5)],
      { evolutionStones: { 'Fire Stone': 1 } },
    )
    ReactDOM.render(<BerryvolutionDetail instanceId="berry-1" />, container)
    const buttons = Array.from(container.querySelectorAll('button'))
    expect(buttons.some(b => b.textContent?.includes('Fire Stone'))).toBe(false)
  })

  it('does not show Evolution section for evolved Berryvolution', () => {
    resetStore([makeEmberon()])
    ReactDOM.render(<BerryvolutionDetail instanceId="emberon-1" />, container)
    // Should not show evolution controls
    const buttons = Array.from(container.querySelectorAll('button'))
    expect(buttons.some(b => b.textContent?.includes('Evolve with'))).toBe(false)
  })

  // ── Evolution action ──────────────────────────────────────────────────────

  it('evolving Berry with Fire Stone changes defId to emberon', () => {
    resetStore(
      [makeBerry('berry-1', 10)],
      { evolutionStones: { 'Fire Stone': 1 } },
    )
    ReactDOM.render(<BerryvolutionDetail instanceId="berry-1" />, container)
    const btn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('Fire Stone'))
    btn?.click()
    const party = useGameStore.getState().saveState.party
    const evolved = party.find(m => m.instanceId === 'berry-1')
    expect(evolved?.defId).toBe('emberon')
  })

  it('deducts the stone from inventory after evolution', () => {
    resetStore(
      [makeBerry('berry-1', 10)],
      { evolutionStones: { 'Fire Stone': 2 } },
    )
    ReactDOM.render(<BerryvolutionDetail instanceId="berry-1" />, container)
    const btn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('Fire Stone'))
    btn?.click()
    const stones = useGameStore.getState().saveState.inventory.evolutionStones
    expect(stones['Fire Stone']).toBe(1)
  })

  it('adds form to berryLog after evolution', () => {
    resetStore(
      [makeBerry('berry-1', 10)],
      { evolutionStones: { 'Fire Stone': 1 } },
    )
    ReactDOM.render(<BerryvolutionDetail instanceId="berry-1" />, container)
    const btn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('Fire Stone'))
    btn?.click()
    const log = useGameStore.getState().saveState.berryLog
    expect(log).toContain('emberon')
  })

  it('does not duplicate berryLog entry if already collected', () => {
    resetStore(
      [makeBerry('berry-1', 10)],
      { evolutionStones: { 'Fire Stone': 1 } },
      ['emberon'],
    )
    ReactDOM.render(<BerryvolutionDetail instanceId="berry-1" />, container)
    const btn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('Fire Stone'))
    btn?.click()
    const log = useGameStore.getState().saveState.berryLog
    expect(log.filter(id => id === 'emberon').length).toBe(1)
  })

  it('stays on berryvolution-detail screen after evolution', () => {
    resetStore(
      [makeBerry('berry-1', 10)],
      { evolutionStones: { 'Fire Stone': 1 } },
    )
    ReactDOM.render(<BerryvolutionDetail instanceId="berry-1" />, container)
    const btn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('Fire Stone'))
    btn?.click()
    expect(useGameStore.getState().screen.id).toBe('berryvolution-detail')
  })
})
