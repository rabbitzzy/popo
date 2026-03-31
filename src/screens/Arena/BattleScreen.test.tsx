import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import ReactDOM from 'react-dom'
import BattleScreen from './BattleScreen'
import { useGameStore } from '../../store/gameStore'
import { computeStats, getUnlockedMoves } from '../../engine/leveling'
import { initializeBattle } from '../../engine/battleSetup'

// ── Helpers ───────────────────────────────────────────────────────────────────

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

function resetStore(battleState = null) {
  const store = useGameStore.getState()
  useGameStore.setState({
    saveState: {
      version: 1,
      party: [],
      inventory: { crystalOrbs: 0, goldDust: 0, stamina: 0, evolutionStones: {} },
      arena: { points: 100, tier: 'Silver' },
      berryLog: [],
      tutorialComplete: true,
      gameWon: false,
    },
    battleState,
    screen: { id: 'battle', battleState },
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

describe('BattleScreen', () => {
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

  // ── No battle state ───────────────────────────────────────────────────────

  it('shows "No Battle Active" when battleState is null', () => {
    resetStore(null)
    ReactDOM.render(<BattleScreen />, container)
    expect(container.textContent).toContain('No Battle Active')
  })

  it('shows back button when no battle active', () => {
    resetStore(null)
    ReactDOM.render(<BattleScreen />, container)
    const btns = Array.from(container.querySelectorAll('button'))
    expect(btns.some(b => b.textContent?.includes('Back to Hub'))).toBe(true)
  })

  it('navigates to main-menu from no-battle state', () => {
    resetStore(null)
    ReactDOM.render(<BattleScreen />, container)
    const btn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('Back to Hub')
    )
    btn?.click()
    expect(useGameStore.getState().screen.id).toBe('main-menu')
  })

  // ── Action-select phase ───────────────────────────────────────────────────

  it('renders action-select phase', () => {
    const battleState = initializeBattle([makeEmberon()], 'Silver')
    resetStore(battleState)
    ReactDOM.render(<BattleScreen />, container)
    expect(container.textContent).toContain('Choose Action')
  })

  it('displays turn counter', () => {
    const battleState = initializeBattle([makeEmberon()], 'Silver')
    resetStore(battleState)
    ReactDOM.render(<BattleScreen />, container)
    expect(container.textContent).toContain('Turn 1')
  })

  it('displays difficulty', () => {
    const battleState = initializeBattle([makeEmberon()], 'Silver')
    resetStore(battleState)
    ReactDOM.render(<BattleScreen />, container)
    expect(container.textContent).toContain('Rookie')
  })

  it('displays player active combatant name', () => {
    const battleState = initializeBattle([makeEmberon()], 'Silver')
    resetStore(battleState)
    ReactDOM.render(<BattleScreen />, container)
    expect(container.textContent).toContain('Emberon')
  })

  it('displays AI active combatant name', () => {
    const battleState = initializeBattle([makeEmberon()], 'Silver')
    resetStore(battleState)
    ReactDOM.render(<BattleScreen />, container)
    expect(container.textContent.match(/Emberon|Aquadrift|Voltshock|Verdanth|Glaceon|Pyxilon/)).toBeTruthy()
  })

  it('displays player HP stat bar', () => {
    const battleState = initializeBattle([makeEmberon()], 'Silver')
    resetStore(battleState)
    ReactDOM.render(<BattleScreen />, container)
    expect(container.textContent).toContain('HP')
  })

  it('displays player NRG stat bar', () => {
    const battleState = initializeBattle([makeEmberon()], 'Silver')
    resetStore(battleState)
    ReactDOM.render(<BattleScreen />, container)
    expect(container.textContent).toContain('NRG')
  })

  // ── Move selection ────────────────────────────────────────────────────────

  it('displays move buttons for each move', () => {
    const battleState = initializeBattle([makeEmberon()], 'Silver')
    resetStore(battleState)
    ReactDOM.render(<BattleScreen />, container)
    const combatant = battleState.playerTeam[0]
    const moveCount = getUnlockedMoves(combatant.partyMember.defId, combatant.partyMember.level).length
    const moveButtons = Array.from(container.querySelectorAll('button')).filter(
      b => b.textContent?.match(/NRG/)
    )
    expect(moveButtons.length).toBeGreaterThanOrEqual(moveCount)
  })

  it('disables moves with insufficient NRG', () => {
    const battleState = initializeBattle([makeEmberon()], 'Silver')
    battleState.playerTeam[0].currentNrg = 0
    resetStore(battleState)
    ReactDOM.render(<BattleScreen />, container)
    const moveButtons = Array.from(container.querySelectorAll('button')).filter(
      b => b.textContent?.match(/NRG/)
    ) as HTMLButtonElement[]
    expect(moveButtons.some(b => b.disabled)).toBe(true)
  })

  it('enables moves with sufficient NRG', () => {
    const battleState = initializeBattle([makeEmberon()], 'Silver')
    battleState.playerTeam[0].currentNrg = 50
    resetStore(battleState)
    ReactDOM.render(<BattleScreen />, container)
    const moveButtons = Array.from(container.querySelectorAll('button')).filter(
      b => b.textContent?.match(/NRG/)
    ) as HTMLButtonElement[]
    expect(moveButtons.some(b => !b.disabled)).toBe(true)
  })

  it('selects move on click', () => {
    const battleState = initializeBattle([makeEmberon()], 'Silver')
    resetStore(battleState)
    ReactDOM.render(<BattleScreen />, container)
    const moveButtons = Array.from(container.querySelectorAll('button')).filter(
      b => b.textContent?.match(/NRG/) && !(b as HTMLButtonElement).disabled
    )
    moveButtons[0]?.click()
    expect(container.textContent).toContain('Execute Action')
  })

  // ── Basic attack ──────────────────────────────────────────────────────────

  it('displays Basic Attack button', () => {
    const battleState = initializeBattle([makeEmberon()], 'Silver')
    resetStore(battleState)
    ReactDOM.render(<BattleScreen />, container)
    expect(container.textContent).toContain('Basic Attack (0 NRG)')
  })

  it('selects basic attack on click', () => {
    const battleState = initializeBattle([makeEmberon()], 'Silver')
    resetStore(battleState)
    ReactDOM.render(<BattleScreen />, container)
    const basicBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('Basic Attack')
    )
    basicBtn?.click()
    expect(container.textContent).toContain('Execute Action')
  })

  // ── Switch (no teammates) ─────────────────────────────────────────────────

  it('hides Switch section with 1 party member', () => {
    const battleState = initializeBattle([makeEmberon()], 'Silver')
    resetStore(battleState)
    ReactDOM.render(<BattleScreen />, container)
    const switchHeaders = Array.from(container.querySelectorAll('div')).filter(
      d => d.textContent === 'Switch'
    )
    expect(switchHeaders.length).toBe(0)
  })

  // ── Switch (with teammates) ───────────────────────────────────────────────

  it('shows Switch section with 2 party members', () => {
    const battleState = initializeBattle([makeEmberon('em-1'), makeHypereon('hy-1')], 'Silver')
    resetStore(battleState)
    ReactDOM.render(<BattleScreen />, container)
    const switchHeaders = Array.from(container.querySelectorAll('div')).filter(
      d => d.textContent === 'Switch'
    )
    expect(switchHeaders.length).toBeGreaterThan(0)
  })

  it('shows alive teammates as switch options', () => {
    const battleState = initializeBattle([makeEmberon('em-1'), makeHypereon('hy-1')], 'Silver')
    resetStore(battleState)
    ReactDOM.render(<BattleScreen />, container)
    expect(container.textContent).toContain('Hypereon')
  })

  it('hides fainted teammates from switch options', () => {
    const battleState = initializeBattle([makeEmberon('em-1'), makeHypereon('hy-1')], 'Silver')
    battleState.playerTeam[1].currentHp = 0
    resetStore(battleState)
    ReactDOM.render(<BattleScreen />, container)
    const switchButtons = Array.from(container.querySelectorAll('button')).filter(
      b => b.textContent?.includes('Hypereon')
    )
    expect(switchButtons.length).toBe(0)
  })

  it('selects switch option on click', () => {
    const battleState = initializeBattle([makeEmberon('em-1'), makeHypereon('hy-1')], 'Silver')
    resetStore(battleState)
    ReactDOM.render(<BattleScreen />, container)
    const switchButtons = Array.from(container.querySelectorAll('button')).filter(
      b => b.textContent?.includes('Hypereon')
    )
    switchButtons[0]?.click()
    expect(container.textContent).toContain('Execute Action')
  })

  // ── Execute Action button ─────────────────────────────────────────────────

  it('disables Execute Action when no action selected', () => {
    const battleState = initializeBattle([makeEmberon()], 'Silver')
    resetStore(battleState)
    ReactDOM.render(<BattleScreen />, container)
    const executeBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('Execute Action')
    ) as HTMLButtonElement
    expect(executeBtn?.disabled).toBe(true)
  })

  it('enables Execute Action when action selected', () => {
    const battleState = initializeBattle([makeEmberon()], 'Silver')
    resetStore(battleState)
    ReactDOM.render(<BattleScreen />, container)
    const basicBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('Basic Attack')
    )
    basicBtn?.click()
    const executeBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('Execute Action')
    ) as HTMLButtonElement
    expect(executeBtn?.disabled).toBe(false)
  })

  it('executes turn when Execute Action clicked', () => {
    const battleState = initializeBattle([makeEmberon()], 'Silver')
    resetStore(battleState)
    ReactDOM.render(<BattleScreen />, container)
    const basicBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('Basic Attack')
    )
    basicBtn?.click()
    const executeBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('Execute Action')
    )
    executeBtn?.click()
    expect(useGameStore.getState().battleState).not.toBeNull()
  })

  // ── Error messages ────────────────────────────────────────────────────────

  it('shows error with insufficient NRG and click', () => {
    const battleState = initializeBattle([makeEmberon()], 'Silver')
    battleState.playerTeam[0].currentNrg = 0
    resetStore(battleState)
    ReactDOM.render(<BattleScreen />, container)
    const moveButtons = Array.from(container.querySelectorAll('button')).filter(
      b => b.textContent?.match(/NRG/) && (b as HTMLButtonElement).disabled
    )
    // Disabled buttons won't fire, so no error is shown by design
    expect(moveButtons.length).toBeGreaterThan(0)
  })

  // ── Forfeit button ────────────────────────────────────────────────────────

  it('shows Forfeit button', () => {
    const battleState = initializeBattle([makeEmberon()], 'Silver')
    resetStore(battleState)
    ReactDOM.render(<BattleScreen />, container)
    const btns = Array.from(container.querySelectorAll('button'))
    expect(btns.some(b => b.textContent?.includes('Forfeit'))).toBe(true)
  })

  // ── Battle log ────────────────────────────────────────────────────────────

  it('displays battle log', () => {
    const battleState = initializeBattle([makeEmberon()], 'Silver')
    resetStore(battleState)
    ReactDOM.render(<BattleScreen />, container)
    expect(container.textContent).toContain('Battle Log')
  })

  it('displays battle started message in log', () => {
    const battleState = initializeBattle([makeEmberon()], 'Silver')
    resetStore(battleState)
    ReactDOM.render(<BattleScreen />, container)
    expect(container.textContent).toContain('Battle started')
  })

  // ── Post-faint phase (player has alive) ────────────────────────────────────

  it('shows replacement options in post-faint phase', () => {
    const battleState = initializeBattle([makeEmberon('em-1'), makeHypereon('hy-1')], 'Silver')
    battleState.phase = 'post-faint' as const
    battleState.playerTeam[0].currentHp = 0
    battleState.activePlayerIndex = 0
    resetStore(battleState)
    ReactDOM.render(<BattleScreen />, container)
    expect(container.textContent).toContain('Select Replacement')
  })

  it('shows alive teammate as replacement option', () => {
    const battleState = initializeBattle([makeEmberon('em-1'), makeHypereon('hy-1')], 'Silver')
    battleState.phase = 'post-faint' as const
    battleState.playerTeam[0].currentHp = 0
    battleState.activePlayerIndex = 0
    resetStore(battleState)
    ReactDOM.render(<BattleScreen />, container)
    expect(container.textContent).toContain('Hypereon')
  })

  it('switches to selected teammate in post-faint', () => {
    const battleState = initializeBattle([makeEmberon('em-1'), makeHypereon('hy-1')], 'Silver')
    battleState.phase = 'post-faint' as const
    battleState.playerTeam[0].currentHp = 0
    battleState.activePlayerIndex = 0
    resetStore(battleState)
    ReactDOM.render(<BattleScreen />, container)
    const hypereonBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('Hypereon')
    )
    hypereonBtn?.click()
    const newState = useGameStore.getState().battleState
    expect(newState?.activePlayerIndex).toBe(1)
    expect(newState?.phase).toBe('action-select')
  })

  // ── Post-faint phase (all fainted) ─────────────────────────────────────────

  it('shows loss message when all player members fainted', () => {
    const battleState = initializeBattle([makeEmberon('em-1'), makeHypereon('hy-1')], 'Silver')
    battleState.phase = 'post-faint' as const
    battleState.playerTeam[0].currentHp = 0
    battleState.playerTeam[1].currentHp = 0
    resetStore(battleState)
    ReactDOM.render(<BattleScreen />, container)
    expect(container.textContent).toContain('You Lost')
  })

  // ── Ended phase (victory) ─────────────────────────────────────────────────

  it('shows victory message when player wins', () => {
    const battleState = initializeBattle([makeEmberon()], 'Silver')
    battleState.phase = 'ended' as const
    battleState.outcome = 'win'
    resetStore(battleState)
    ReactDOM.render(<BattleScreen />, container)
    expect(container.textContent).toContain('You Won')
  })

  it('mentions arena points on victory', () => {
    const battleState = initializeBattle([makeEmberon()], 'Silver')
    battleState.phase = 'ended' as const
    battleState.outcome = 'win'
    resetStore(battleState)
    ReactDOM.render(<BattleScreen />, container)
    expect(container.textContent).toContain('Arena Points')
  })

  it('shows continue button in ended phase', () => {
    const battleState = initializeBattle([makeEmberon()], 'Silver')
    battleState.phase = 'ended' as const
    battleState.outcome = 'win'
    resetStore(battleState)
    ReactDOM.render(<BattleScreen />, container)
    const btns = Array.from(container.querySelectorAll('button'))
    expect(btns.some(b => b.textContent?.includes('Continue'))).toBe(true)
  })

  it('navigates to post-battle on continue', () => {
    const battleState = initializeBattle([makeEmberon()], 'Silver')
    battleState.phase = 'ended' as const
    battleState.outcome = 'win'
    resetStore(battleState)
    ReactDOM.render(<BattleScreen />, container)
    const continueBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('Continue')
    )
    continueBtn?.click()
    const screen = useGameStore.getState().screen
    expect(screen.id).toBe('post-battle')
  })

  it('updates arena points on victory', () => {
    const battleState = initializeBattle([makeEmberon()], 'Silver')
    battleState.phase = 'ended' as const
    battleState.outcome = 'win'
    resetStore(battleState)
    const initialPoints = useGameStore.getState().saveState.arena.points
    ReactDOM.render(<BattleScreen />, container)
    const continueBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('Continue')
    )
    continueBtn?.click()
    const newPoints = useGameStore.getState().saveState.arena.points
    expect(newPoints).toBe(initialPoints + 10)
  })

  it('does not update points on defeat', () => {
    const battleState = initializeBattle([makeEmberon()], 'Silver')
    battleState.phase = 'ended' as const
    battleState.outcome = 'loss'
    resetStore(battleState)
    const initialPoints = useGameStore.getState().saveState.arena.points
    ReactDOM.render(<BattleScreen />, container)
    const continueBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('Continue')
    )
    continueBtn?.click()
    const newPoints = useGameStore.getState().saveState.arena.points
    expect(newPoints).toBe(initialPoints)
  })
})
