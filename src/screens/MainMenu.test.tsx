import { describe, it, expect, vi, beforeEach, afterEach, afterAll } from 'vitest'
import React from 'react'
import ReactDOM from 'react-dom'
import MainMenu from './MainMenu'
import { useGameStore } from '../store/gameStore'

// ── Store setup helper ────────────────────────────────────────────────────────

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
      tutorialComplete: false,
      gameWon: false,
      ...overrides,
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

function setActiveGame() {
  useGameStore.setState(state => ({
    saveState: {
      ...state.saveState,
      party: [
        {
          instanceId: 'berry-1',
          defId: 'berry',
          level: 5,
          xp: 20,
          currentStats: { hp: 40, atk: 20, def: 15, spd: 18, nrg: 25 },
          maxHp: 40,
          unlockedMoveIds: [],
        },
      ],
      berryLog: ['emberon', 'hypereon'],
      arena: { points: 150, tier: 'Silver' },
    },
  }))
}

// ── Test suite ────────────────────────────────────────────────────────────────

describe('MainMenu', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    // Mock localStorage for save engine
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

  // ── Title ─────────────────────────────────────────────────────────────────

  it('renders game title', () => {
    ReactDOM.render(<MainMenu />, container)
    expect(container.textContent).toContain("Berry's Evolution")
  })

  it('renders game tagline', () => {
    ReactDOM.render(<MainMenu />, container)
    expect(container.textContent).toContain('Collect all 8 evolutions')
  })

  // ── No active game ────────────────────────────────────────────────────────

  it('shows New Game button when no active game', () => {
    ReactDOM.render(<MainMenu />, container)
    const buttons = Array.from(container.querySelectorAll('button'))
    expect(buttons.some(b => b.textContent?.includes('New Game'))).toBe(true)
  })

  it('shows Import Save button when no active game', () => {
    ReactDOM.render(<MainMenu />, container)
    const buttons = Array.from(container.querySelectorAll('button'))
    expect(buttons.some(b => b.textContent?.includes('Import Save'))).toBe(true)
  })

  it('does not show Arena nav card when no active game', () => {
    ReactDOM.render(<MainMenu />, container)
    // The word "Arena" appears in tagline; check no nav card is present
    expect(container.textContent).not.toContain('Battle & Rankings')
  })

  it('does not show Explore nav when no active game', () => {
    ReactDOM.render(<MainMenu />, container)
    expect(container.textContent).not.toContain('Find Berries')
  })

  // ── Active game ───────────────────────────────────────────────────────────

  it('shows arena tier with active game', () => {
    setActiveGame()
    ReactDOM.render(<MainMenu />, container)
    expect(container.textContent).toContain('Silver')
  })

  it('shows arena points with active game', () => {
    setActiveGame()
    ReactDOM.render(<MainMenu />, container)
    expect(container.textContent).toContain('150')
  })

  it('shows berry log progress', () => {
    setActiveGame()
    ReactDOM.render(<MainMenu />, container)
    expect(container.textContent).toContain('2 / 8 Berryvolutions')
  })

  it('shows party count', () => {
    setActiveGame()
    ReactDOM.render(<MainMenu />, container)
    expect(container.textContent).toContain('1 in party')
  })

  it('shows Arena nav card', () => {
    setActiveGame()
    ReactDOM.render(<MainMenu />, container)
    expect(container.textContent).toContain('Arena')
  })

  it('shows Explore nav card', () => {
    setActiveGame()
    ReactDOM.render(<MainMenu />, container)
    expect(container.textContent).toContain('Explore')
  })

  it('shows Party nav card', () => {
    setActiveGame()
    ReactDOM.render(<MainMenu />, container)
    expect(container.textContent).toContain('Party')
  })

  it('shows Berry Log nav card', () => {
    setActiveGame()
    ReactDOM.render(<MainMenu />, container)
    expect(container.textContent).toContain('Berry Log')
  })

  it('shows Shop nav card', () => {
    setActiveGame()
    ReactDOM.render(<MainMenu />, container)
    expect(container.textContent).toContain('Shop')
  })

  it('shows Settings nav card', () => {
    setActiveGame()
    ReactDOM.render(<MainMenu />, container)
    expect(container.textContent).toContain('Settings')
  })

  it('shows Export Save and Import Save buttons', () => {
    setActiveGame()
    ReactDOM.render(<MainMenu />, container)
    expect(container.textContent).toContain('Export Save')
    expect(container.textContent).toContain('Import Save')
  })

  it('shows New Game button in footer with active game', () => {
    setActiveGame()
    ReactDOM.render(<MainMenu />, container)
    const buttons = Array.from(container.querySelectorAll('button'))
    expect(buttons.some(b => b.textContent?.includes('New Game'))).toBe(true)
  })

  // ── Navigation ────────────────────────────────────────────────────────────

  it('navigates to party screen when Party card is clicked', () => {
    setActiveGame()
    ReactDOM.render(<MainMenu />, container)
    const clickableCards = Array.from(container.querySelectorAll('div[style*="pointer"]'))
    const partyCard = clickableCards.find(
      d => d.textContent?.includes('1 member')
    ) as HTMLDivElement | undefined
    partyCard?.click()
    expect(useGameStore.getState().screen.id).toBe('party')
  })

  it('navigates to team-builder when Arena card is clicked', () => {
    setActiveGame()
    ReactDOM.render(<MainMenu />, container)
    // Find card containing "Battle & Rankings" description
    const clickableCards = Array.from(container.querySelectorAll('div[style*="pointer"]'))
    const arenaCard = clickableCards.find(
      d => d.textContent?.includes('Battle & Rankings')
    ) as HTMLDivElement | undefined
    arenaCard?.click()
    expect(useGameStore.getState().screen.id).toBe('team-builder')
  })

  it('navigates to zone-select when Explore card is clicked', () => {
    setActiveGame()
    ReactDOM.render(<MainMenu />, container)
    const clickableCards = Array.from(container.querySelectorAll('div[style*="pointer"]'))
    const exploreCard = clickableCards.find(
      d => d.textContent?.includes('Find Berries & Stones')
    ) as HTMLDivElement | undefined
    exploreCard?.click()
    expect(useGameStore.getState().screen.id).toBe('zone-select')
  })

  it('navigates to berry-log when Berry Log card is clicked', () => {
    setActiveGame()
    ReactDOM.render(<MainMenu />, container)
    const clickableCards = Array.from(container.querySelectorAll('div[style*="pointer"]'))
    const logCard = clickableCards.find(
      d => d.textContent?.includes('2/8 collected')
    ) as HTMLDivElement | undefined
    logCard?.click()
    expect(useGameStore.getState().screen.id).toBe('berry-log')
  })

  it('navigates to shop when Shop card is clicked', () => {
    setActiveGame()
    ReactDOM.render(<MainMenu />, container)
    const clickableCards = Array.from(container.querySelectorAll('div[style*="pointer"]'))
    const shopCard = clickableCards.find(
      d => d.textContent?.includes('Spend Gold Dust')
    ) as HTMLDivElement | undefined
    shopCard?.click()
    expect(useGameStore.getState().screen.id).toBe('shop')
  })

  it('navigates to settings when Settings card is clicked', () => {
    setActiveGame()
    ReactDOM.render(<MainMenu />, container)
    const clickableCards = Array.from(container.querySelectorAll('div[style*="pointer"]'))
    const settingsCard = clickableCards.find(
      d => d.textContent?.includes('Save & Options')
    ) as HTMLDivElement | undefined
    settingsCard?.click()
    expect(useGameStore.getState().screen.id).toBe('settings')
  })

  // ── New Game confirmation ─────────────────────────────────────────────────

  it('shows confirm dialog when New Game clicked with active save', () => {
    setActiveGame()
    ReactDOM.render(<MainMenu />, container)
    const buttons = Array.from(container.querySelectorAll('button'))
    const newGameBtn = buttons.find(b => b.textContent?.includes('New Game'))
    newGameBtn?.click()
    expect(container.textContent).toContain('Start New Game?')
  })

  it('confirm dialog shows danger message', () => {
    setActiveGame()
    ReactDOM.render(<MainMenu />, container)
    const buttons = Array.from(container.querySelectorAll('button'))
    const newGameBtn = buttons.find(b => b.textContent?.includes('New Game'))
    newGameBtn?.click()
    expect(container.textContent).toContain('permanently delete')
  })

  it('dismisses confirm dialog when Keep Playing is clicked', () => {
    setActiveGame()
    ReactDOM.render(<MainMenu />, container)
    const buttons = Array.from(container.querySelectorAll('button'))
    const newGameBtn = buttons.find(b => b.textContent?.includes('New Game'))
    newGameBtn?.click()

    const dialogButtons = Array.from(container.querySelectorAll('button'))
    const keepBtn = dialogButtons.find(b => b.textContent === 'Keep Playing')
    keepBtn?.click()

    expect(container.textContent).not.toContain('Start New Game?')
  })

  it('does not show confirm dialog when New Game clicked with no active game', () => {
    ReactDOM.render(<MainMenu />, container)
    const buttons = Array.from(container.querySelectorAll('button'))
    const newGameBtn = buttons.find(b => b.textContent === 'New Game')
    newGameBtn?.click()
    // Should not show dialog — it starts the game directly
    expect(container.textContent).not.toContain('Start New Game?')
  })

  // ── Victory banner ────────────────────────────────────────────────────────

  it('does not show victory banner when game not won', () => {
    setActiveGame()
    ReactDOM.render(<MainMenu />, container)
    expect(container.textContent).not.toContain('conquered the Apex Arena')
  })

  it('shows victory banner when game is won', () => {
    setActiveGame()
    useGameStore.setState(state => ({
      saveState: { ...state.saveState, gameWon: true },
    }))
    ReactDOM.render(<MainMenu />, container)
    expect(container.textContent).toContain('conquered the Apex Arena')
  })

  // ── Berry log progress bar ────────────────────────────────────────────────

  it('shows partial progress bar for incomplete berry log', () => {
    setActiveGame() // 2 of 8
    ReactDOM.render(<MainMenu />, container)
    const progressBars = Array.from(container.querySelectorAll('div')).filter(
      d => d.style.width && d.style.width.includes('%')
    )
    const progressBar = progressBars.find(d => d.style.width === '25%')
    expect(progressBar).toBeTruthy()
  })

  it('shows full progress bar when all 8 collected', () => {
    setActiveGame()
    useGameStore.setState(state => ({
      saveState: {
        ...state.saveState,
        berryLog: ['hypereon', 'volteon', 'emberon', 'eryleon', 'vengeon', 'grasseon', 'polareon', 'luxeon'],
      },
    }))
    ReactDOM.render(<MainMenu />, container)
    const progressBars = Array.from(container.querySelectorAll('div')).filter(
      d => d.style.width === '100%'
    )
    expect(progressBars.length).toBeGreaterThan(0)
  })

  // ── Party member count ────────────────────────────────────────────────────

  it('shows correct plural for party members', () => {
    setActiveGame() // 1 member
    ReactDOM.render(<MainMenu />, container)
    expect(container.textContent).toContain('1 member')
  })

  it('shows correct plural for multiple party members', () => {
    setActiveGame()
    useGameStore.setState(state => ({
      saveState: {
        ...state.saveState,
        party: [
          ...state.saveState.party,
          {
            instanceId: 'emberon-1',
            defId: 'emberon',
            level: 15,
            xp: 0,
            currentStats: { hp: 80, atk: 90, def: 50, spd: 70, nrg: 50 },
            maxHp: 80,
            unlockedMoveIds: [],
          },
        ],
      },
    }))
    ReactDOM.render(<MainMenu />, container)
    expect(container.textContent).toContain('2 members')
  })
})
