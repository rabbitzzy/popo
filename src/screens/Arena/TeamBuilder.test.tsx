import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import React from 'react'
import ReactDOM from 'react-dom'
import TeamBuilder from './TeamBuilder'
import { useGameStore } from '../../store/gameStore'
import { computeStats } from '../../engine/leveling'

// ── Helpers ───────────────────────────────────────────────────────────────────

function resetStore(partyOverride = []) {
  const store = useGameStore.getState()
  useGameStore.setState({
    saveState: {
      version: 1,
      party: partyOverride,
      inventory: { crystalOrbs: 0, goldDust: 0, stamina: 0, evolutionStones: {} },
      arena: { points: 150, tier: 'Silver' },
      berryLog: [],
      tutorialComplete: true,
      gameWon: false,
    },
    battleState: null,
    screen: { id: 'team-builder' },
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

function makeEmberon(instanceId = 'emberon-1', level = 5) {
  const stats = computeStats('emberon', level)
  return {
    instanceId,
    defId: 'emberon' as const,
    level,
    xp: 10,
    currentStats: stats,
    maxHp: stats.hp,
    unlockedMoveIds: [],
  }
}

function makeHypereon(instanceId = 'hypereon-1', level = 8) {
  const stats = computeStats('hypereon', level)
  return {
    instanceId,
    defId: 'hypereon' as const,
    level,
    xp: 20,
    currentStats: stats,
    maxHp: stats.hp,
    unlockedMoveIds: [],
  }
}

// ── Test suite ────────────────────────────────────────────────────────────────

describe('TeamBuilder', () => {
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

  // ── Empty party ───────────────────────────────────────────────────────────

  it('shows empty party message', () => {
    resetStore([])
    ReactDOM.render(<TeamBuilder />, container)
    expect(container.textContent).toContain('No Party Members')
  })

  it('shows back button in empty state', () => {
    resetStore([])
    ReactDOM.render(<TeamBuilder />, container)
    const btns = Array.from(container.querySelectorAll('button'))
    expect(btns.some(b => b.textContent?.includes('Back to Hub'))).toBe(true)
  })

  it('navigates to main-menu from empty state', () => {
    resetStore([])
    ReactDOM.render(<TeamBuilder />, container)
    const btn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('Back to Hub')
    )
    btn?.click()
    expect(useGameStore.getState().screen.id).toBe('main-menu')
  })

  // ── Header ────────────────────────────────────────────────────────────────

  it('renders "Team Builder" heading', () => {
    resetStore([makeEmberon()])
    ReactDOM.render(<TeamBuilder />, container)
    expect(container.textContent).toContain('Team Builder')
  })

  it('shows arena tier', () => {
    resetStore([makeEmberon()])
    ReactDOM.render(<TeamBuilder />, container)
    expect(container.textContent).toContain('Silver')
  })

  it('shows arena points', () => {
    resetStore([makeEmberon()])
    ReactDOM.render(<TeamBuilder />, container)
    expect(container.textContent).toContain('150')
  })

  it('renders Back button', () => {
    resetStore([makeEmberon()])
    ReactDOM.render(<TeamBuilder />, container)
    const btns = Array.from(container.querySelectorAll('button'))
    expect(btns.some(b => b.textContent?.includes('Back'))).toBe(true)
  })

  it('navigates to main-menu when Back clicked', () => {
    resetStore([makeEmberon()])
    ReactDOM.render(<TeamBuilder />, container)
    const btn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('Back')
    )
    btn?.click()
    expect(useGameStore.getState().screen.id).toBe('main-menu')
  })

  // ── Party display ─────────────────────────────────────────────────────────

  it('displays party members', () => {
    resetStore([makeEmberon()])
    ReactDOM.render(<TeamBuilder />, container)
    expect(container.textContent).toContain('Emberon')
  })

  it('shows multiple party members', () => {
    resetStore([makeEmberon('em-1'), makeHypereon('hy-1')])
    ReactDOM.render(<TeamBuilder />, container)
    expect(container.textContent).toContain('Emberon')
    expect(container.textContent).toContain('Hypereon')
  })

  it('shows selection counter', () => {
    resetStore([makeEmberon()])
    ReactDOM.render(<TeamBuilder />, container)
    expect(container.textContent).toContain('0 / 2 selected')
  })

  // ── Selection ─────────────────────────────────────────────────────────────

  it('toggles member selection on click', () => {
    resetStore([makeEmberon('em-1')])
    ReactDOM.render(<TeamBuilder />, container)
    const cards = Array.from(container.querySelectorAll('div[style*="pointer"]'))
    const card = cards.find(c => c.textContent?.includes('Emberon'))
    card?.click()
    expect(container.textContent).toContain('1 / 2 selected')
  })

  it('allows selecting up to 2 members', () => {
    resetStore([makeEmberon('em-1'), makeHypereon('hy-1')])
    ReactDOM.render(<TeamBuilder />, container)
    const cards = Array.from(container.querySelectorAll('div[style*="pointer"]'))
    cards[0]?.click()
    cards[1]?.click()
    expect(container.textContent).toContain('2 / 2 selected')
  })

  it('shows error when trying to select > 2', () => {
    resetStore([makeEmberon('em-1'), makeHypereon('hy-1'), makeEmberon('em-2', 10)])
    ReactDOM.render(<TeamBuilder />, container)
    const cards = Array.from(container.querySelectorAll('div[style*="pointer"]'))
    cards[0]?.click()
    cards[1]?.click()
    cards[2]?.click()
    expect(container.textContent).toContain('Maximum 2 team members allowed')
  })

  it('deselects when clicking selected member', () => {
    resetStore([makeEmberon('em-1')])
    ReactDOM.render(<TeamBuilder />, container)
    const card = Array.from(container.querySelectorAll('div[style*="pointer"]')).find(
      c => c.textContent?.includes('Emberon')
    )
    card?.click()
    expect(container.textContent).toContain('1 / 2 selected')
    card?.click()
    expect(container.textContent).toContain('0 / 2 selected')
  })

  // ── Start Battle button ────────────────────────────────────────────────────

  it('renders Start Battle button', () => {
    resetStore([makeEmberon()])
    ReactDOM.render(<TeamBuilder />, container)
    const btns = Array.from(container.querySelectorAll('button'))
    expect(btns.some(b => b.textContent?.includes('Start Battle'))).toBe(true)
  })

  it('disables Start Battle when no members selected', () => {
    resetStore([makeEmberon()])
    ReactDOM.render(<TeamBuilder />, container)
    const btn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('Start Battle')
    ) as HTMLButtonElement
    expect(btn?.disabled).toBe(true)
  })

  it('enables Start Battle when members selected', () => {
    resetStore([makeEmberon('em-1')])
    ReactDOM.render(<TeamBuilder />, container)
    const cards = Array.from(container.querySelectorAll('div[style*="pointer"]'))
    cards[0]?.click()
    const btn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('Start Battle')
    ) as HTMLButtonElement
    expect(btn?.disabled).toBe(false)
  })

  it('disables Start Battle and prevents error when no selection', () => {
    // Button is disabled so click won't fire; no error shows
    resetStore([makeEmberon()])
    ReactDOM.render(<TeamBuilder />, container)
    const btn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('Start Battle')
    ) as HTMLButtonElement
    expect(btn?.disabled).toBe(true)
    btn?.click()
    // No error because button doesn't fire when disabled
    expect(container.textContent).not.toContain('Select at least 1 team member')
  })

  // ── Battle initiation ─────────────────────────────────────────────────────

  it('navigates to battle when Start Battle clicked with selection', () => {
    resetStore([makeEmberon('em-1')])
    ReactDOM.render(<TeamBuilder />, container)
    const cards = Array.from(container.querySelectorAll('div[style*="pointer"]'))
    cards[0]?.click()
    const btn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('Start Battle')
    )
    btn?.click()
    expect(useGameStore.getState().screen.id).toBe('battle')
  })

  it('sets battleState when starting battle', () => {
    resetStore([makeEmberon('em-1')])
    ReactDOM.render(<TeamBuilder />, container)
    const cards = Array.from(container.querySelectorAll('div[style*="pointer"]'))
    cards[0]?.click()
    const btn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('Start Battle')
    )
    btn?.click()
    const state = useGameStore.getState()
    expect(state.battleState).not.toBeNull()
  })

  it('includes selected players in battle state', () => {
    resetStore([makeEmberon('em-1'), makeHypereon('hy-1')])
    ReactDOM.render(<TeamBuilder />, container)
    const cards = Array.from(container.querySelectorAll('div[style*="pointer"]'))
    cards[0]?.click()
    cards[1]?.click()
    const btn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('Start Battle')
    )
    btn?.click()
    const battleState = useGameStore.getState().battleState
    expect(battleState?.playerTeam).toHaveLength(2)
  })

  it('generates AI team in battle state', () => {
    resetStore([makeEmberon('em-1')])
    ReactDOM.render(<TeamBuilder />, container)
    const cards = Array.from(container.querySelectorAll('div[style*="pointer"]'))
    cards[0]?.click()
    const btn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('Start Battle')
    )
    btn?.click()
    const battleState = useGameStore.getState().battleState
    expect(battleState?.aiTeam.length).toBeGreaterThan(0)
  })

  it('sets correct difficulty for tier', () => {
    useGameStore.setState(state => ({
      saveState: { ...state.saveState, arena: { points: 0, tier: 'Bronze' } },
    }))
    resetStore([makeEmberon('em-1')])
    ReactDOM.render(<TeamBuilder />, container)
    const cards = Array.from(container.querySelectorAll('div[style*="pointer"]'))
    cards[0]?.click()
    const btn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('Start Battle')
    )
    btn?.click()
    const battleState = useGameStore.getState().battleState
    expect(battleState?.aiDifficulty).toBe('Rookie')
  })
})
