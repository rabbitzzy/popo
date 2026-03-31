import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import ReactDOM from 'react-dom'
import Tutorial from './Tutorial'
import { useGameStore } from '../store/gameStore'

// ── Store reset helper ────────────────────────────────────────────────────────

function resetStore() {
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
      tutorialComplete: false,
      gameWon: false,
    },
    battleState: null,
    screen: { id: 'tutorial' },
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

describe('Tutorial', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    const mockStorage: Record<string, string> = {}
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => mockStorage[key] ?? null,
      setItem: (key: string, value: string) => { mockStorage[key] = value },
      removeItem: (key: string) => { delete mockStorage[key] },
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

  it('renders "How to Play" heading', () => {
    ReactDOM.render(<Tutorial />, container)
    expect(container.textContent).toContain('How to Play')
  })

  // ── Step 1 (initial) ──────────────────────────────────────────────────────

  it('shows first step title "Meet Berry" initially', () => {
    ReactDOM.render(<Tutorial />, container)
    expect(container.textContent).toContain('Meet Berry')
  })

  it('shows first step body text about Berry initially', () => {
    ReactDOM.render(<Tutorial />, container)
    expect(container.textContent).toContain('8 powerful Berryvolutions')
  })

  it('shows step counter "1 / 5" initially', () => {
    ReactDOM.render(<Tutorial />, container)
    expect(container.textContent).toContain('1 / 5')
  })

  it('shows "Next" button on first step', () => {
    ReactDOM.render(<Tutorial />, container)
    const buttons = Array.from(container.querySelectorAll('button'))
    expect(buttons.some(b => b.textContent?.includes('Next'))).toBe(true)
  })

  it('shows "Skip Tutorial" button on non-final steps', () => {
    ReactDOM.render(<Tutorial />, container)
    const buttons = Array.from(container.querySelectorAll('button'))
    expect(buttons.some(b => b.textContent?.includes('Skip Tutorial'))).toBe(true)
  })

  it('does not show "Let\'s Go!" on first step', () => {
    ReactDOM.render(<Tutorial />, container)
    const buttons = Array.from(container.querySelectorAll('button'))
    expect(buttons.some(b => b.textContent?.includes("Let's Go!"))).toBe(false)
  })

  // ── Progress dots ─────────────────────────────────────────────────────────

  it('renders 5 progress dots', () => {
    ReactDOM.render(<Tutorial />, container)
    // Dots are small divs with borderRadius 50% — count divs with height 0.5rem
    const dots = Array.from(container.querySelectorAll('div')).filter(
      d => d.style.borderRadius === '50%' && d.style.width === '0.5rem'
    )
    expect(dots).toHaveLength(5)
  })

  it('first dot is highlighted (teal color) initially', () => {
    ReactDOM.render(<Tutorial />, container)
    const dots = Array.from(container.querySelectorAll('div')).filter(
      d => d.style.borderRadius === '50%' && d.style.width === '0.5rem'
    )
    expect(dots[0].style.backgroundColor).toBe('rgb(45, 139, 133)')
  })

  // ── Navigation ────────────────────────────────────────────────────────────

  it('advances to step 2 when Next is clicked', () => {
    ReactDOM.render(<Tutorial />, container)
    const buttons = Array.from(container.querySelectorAll('button'))
    const nextBtn = buttons.find(b => b.textContent === 'Next')
    nextBtn?.click()
    expect(container.textContent).toContain('Explore Zones')
  })

  it('advances to step 3 when Next clicked twice', () => {
    ReactDOM.render(<Tutorial />, container)
    const clickNext = () => {
      const btn = Array.from(container.querySelectorAll('button')).find(b => b.textContent === 'Next')
      btn?.click()
    }
    clickNext()
    clickNext()
    expect(container.textContent).toContain('Evolve Berry')
  })

  it('advances to step 4 when Next clicked three times', () => {
    ReactDOM.render(<Tutorial />, container)
    for (let i = 0; i < 3; i++) {
      const btn = Array.from(container.querySelectorAll('button')).find(b => b.textContent === 'Next')
      btn?.click()
    }
    expect(container.textContent).toContain('Battle the Arena')
  })

  it('advances to step 5 when Next clicked four times', () => {
    ReactDOM.render(<Tutorial />, container)
    for (let i = 0; i < 4; i++) {
      const btn = Array.from(container.querySelectorAll('button')).find(b => b.textContent === 'Next')
      btn?.click()
    }
    expect(container.textContent).toContain('The Goal')
  })

  it('updates step counter to "2 / 5" after one Next click', () => {
    ReactDOM.render(<Tutorial />, container)
    const btn = Array.from(container.querySelectorAll('button')).find(b => b.textContent === 'Next')
    btn?.click()
    expect(container.textContent).toContain('2 / 5')
  })

  // ── Final step ────────────────────────────────────────────────────────────

  it('shows "Let\'s Go!" button on final step', () => {
    ReactDOM.render(<Tutorial />, container)
    for (let i = 0; i < 4; i++) {
      const btn = Array.from(container.querySelectorAll('button')).find(b => b.textContent === 'Next')
      btn?.click()
    }
    const buttons = Array.from(container.querySelectorAll('button'))
    expect(buttons.some(b => b.textContent?.includes("Let's Go!"))).toBe(true)
  })

  it('does not show "Skip Tutorial" on final step', () => {
    ReactDOM.render(<Tutorial />, container)
    for (let i = 0; i < 4; i++) {
      const btn = Array.from(container.querySelectorAll('button')).find(b => b.textContent === 'Next')
      btn?.click()
    }
    const buttons = Array.from(container.querySelectorAll('button'))
    expect(buttons.some(b => b.textContent?.includes('Skip Tutorial'))).toBe(false)
  })

  it('shows step counter "5 / 5" on final step', () => {
    ReactDOM.render(<Tutorial />, container)
    for (let i = 0; i < 4; i++) {
      const btn = Array.from(container.querySelectorAll('button')).find(b => b.textContent === 'Next')
      btn?.click()
    }
    expect(container.textContent).toContain('5 / 5')
  })

  // ── Completion ────────────────────────────────────────────────────────────

  it('sets tutorialComplete to true when Let\'s Go! clicked', () => {
    ReactDOM.render(<Tutorial />, container)
    for (let i = 0; i < 4; i++) {
      const btn = Array.from(container.querySelectorAll('button')).find(b => b.textContent === 'Next')
      btn?.click()
    }
    const btn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes("Let's Go!"))
    btn?.click()
    expect(useGameStore.getState().saveState.tutorialComplete).toBe(true)
  })

  it('navigates to main-menu when Let\'s Go! clicked', () => {
    ReactDOM.render(<Tutorial />, container)
    for (let i = 0; i < 4; i++) {
      const btn = Array.from(container.querySelectorAll('button')).find(b => b.textContent === 'Next')
      btn?.click()
    }
    const btn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes("Let's Go!"))
    btn?.click()
    expect(useGameStore.getState().screen.id).toBe('main-menu')
  })

  // ── Skip tutorial ─────────────────────────────────────────────────────────

  it('sets tutorialComplete to true when Skip Tutorial clicked', () => {
    ReactDOM.render(<Tutorial />, container)
    const btn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('Skip Tutorial'))
    btn?.click()
    expect(useGameStore.getState().saveState.tutorialComplete).toBe(true)
  })

  it('navigates to main-menu when Skip Tutorial clicked', () => {
    ReactDOM.render(<Tutorial />, container)
    const btn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('Skip Tutorial'))
    btn?.click()
    expect(useGameStore.getState().screen.id).toBe('main-menu')
  })

  it('can skip from any step', () => {
    ReactDOM.render(<Tutorial />, container)
    // Advance to step 3
    for (let i = 0; i < 2; i++) {
      const next = Array.from(container.querySelectorAll('button')).find(b => b.textContent === 'Next')
      next?.click()
    }
    const skipBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('Skip Tutorial'))
    skipBtn?.click()
    expect(useGameStore.getState().screen.id).toBe('main-menu')
    expect(useGameStore.getState().saveState.tutorialComplete).toBe(true)
  })

  // ── Step content ──────────────────────────────────────────────────────────

  it('step 2 mentions stamina cost', () => {
    ReactDOM.render(<Tutorial />, container)
    const btn = Array.from(container.querySelectorAll('button')).find(b => b.textContent === 'Next')
    btn?.click()
    expect(container.textContent).toContain('Stamina')
  })

  it('step 3 mentions Evolution Stones', () => {
    ReactDOM.render(<Tutorial />, container)
    for (let i = 0; i < 2; i++) {
      const btn = Array.from(container.querySelectorAll('button')).find(b => b.textContent === 'Next')
      btn?.click()
    }
    expect(container.textContent).toContain('Evolution Stones')
  })

  it('step 4 mentions Arena Points', () => {
    ReactDOM.render(<Tutorial />, container)
    for (let i = 0; i < 3; i++) {
      const btn = Array.from(container.querySelectorAll('button')).find(b => b.textContent === 'Next')
      btn?.click()
    }
    expect(container.textContent).toContain('Arena Points')
  })

  it('step 5 mentions Berry Log', () => {
    ReactDOM.render(<Tutorial />, container)
    for (let i = 0; i < 4; i++) {
      const btn = Array.from(container.querySelectorAll('button')).find(b => b.textContent === 'Next')
      btn?.click()
    }
    expect(container.textContent).toContain('Berry Log')
  })
})
