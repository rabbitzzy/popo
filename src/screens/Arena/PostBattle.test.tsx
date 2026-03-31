import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import React from 'react'
import ReactDOM from 'react-dom'
import PostBattle from './PostBattle'
import { useGameStore } from '../../store/gameStore'
import { computeStats } from '../../engine/leveling'
import { BattleResult } from '../../data/types'

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

function resetStore(partyOverride = [], arenaPoints = 150) {
  const store = useGameStore.getState()
  useGameStore.setState({
    saveState: {
      version: 1,
      party: partyOverride,
      inventory: { crystalOrbs: 0, goldDust: 100, stamina: 20, evolutionStones: {} },
      arena: { points: arenaPoints, tier: 'Silver' },
      berryLog: [],
      tutorialComplete: true,
      gameWon: false,
    },
    battleState: null,
    screen: { id: 'post-battle' },
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

describe('PostBattle', () => {
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

  // ── Outcome display ───────────────────────────────────────────────────────

  it('displays victory message on win', () => {
    resetStore([makeEmberon()])
    const result: BattleResult = {
      outcome: 'win',
      xpEarned: {},
      arenaPointsChange: 10,
      resourcesEarned: { goldDust: 50, stamina: 5 },
    }
    ReactDOM.render(<PostBattle result={result} />, container)
    expect(container.textContent).toContain('Victory')
  })

  it('displays defeat message on loss', () => {
    resetStore([makeEmberon()])
    const result: BattleResult = {
      outcome: 'loss',
      xpEarned: {},
      arenaPointsChange: 0,
      resourcesEarned: { goldDust: 0, stamina: 5 },
    }
    ReactDOM.render(<PostBattle result={result} />, container)
    expect(container.textContent).toContain('Defeat')
  })

  // ── Arena points display ──────────────────────────────────────────────────

  it('shows arena points change on victory', () => {
    resetStore([makeEmberon()])
    const result: BattleResult = {
      outcome: 'win',
      xpEarned: {},
      arenaPointsChange: 10,
      resourcesEarned: { goldDust: 50, stamina: 5 },
    }
    ReactDOM.render(<PostBattle result={result} />, container)
    expect(container.textContent).toContain('+10')
  })

  it('shows 0 arena points change on defeat', () => {
    resetStore([makeEmberon()])
    const result: BattleResult = {
      outcome: 'loss',
      xpEarned: {},
      arenaPointsChange: 0,
      resourcesEarned: { goldDust: 0, stamina: 5 },
    }
    ReactDOM.render(<PostBattle result={result} />, container)
    expect(container.textContent).toContain('Arena Points')
  })

  // ── Resources display ─────────────────────────────────────────────────────

  it('displays gold dust earned', () => {
    resetStore([makeEmberon()])
    const result: BattleResult = {
      outcome: 'win',
      xpEarned: {},
      arenaPointsChange: 10,
      resourcesEarned: { goldDust: 50, stamina: 5 },
    }
    ReactDOM.render(<PostBattle result={result} />, container)
    expect(container.textContent).toContain('Gold Dust')
    expect(container.textContent).toContain('+50')
  })

  it('displays stamina earned', () => {
    resetStore([makeEmberon()])
    const result: BattleResult = {
      outcome: 'win',
      xpEarned: {},
      arenaPointsChange: 10,
      resourcesEarned: { goldDust: 50, stamina: 5 },
    }
    ReactDOM.render(<PostBattle result={result} />, container)
    expect(container.textContent).toContain('Stamina')
    expect(container.textContent).toContain('+5')
  })

  // ── XP display ────────────────────────────────────────────────────────────

  it('displays experience gained section when XP earned', () => {
    resetStore([makeEmberon('em-1')])
    const result: BattleResult = {
      outcome: 'win',
      xpEarned: { 'em-1': 50 },
      arenaPointsChange: 10,
      resourcesEarned: { goldDust: 50, stamina: 5 },
    }
    ReactDOM.render(<PostBattle result={result} />, container)
    expect(container.textContent).toContain('Experience Gained')
  })

  it('shows XP earned per party member', () => {
    resetStore([makeEmberon('em-1')])
    const result: BattleResult = {
      outcome: 'win',
      xpEarned: { 'em-1': 75 },
      arenaPointsChange: 10,
      resourcesEarned: { goldDust: 50, stamina: 5 },
    }
    ReactDOM.render(<PostBattle result={result} />, container)
    expect(container.textContent).toContain('Emberon')
    expect(container.textContent).toContain('+75 XP')
  })

  it('shows XP for multiple party members', () => {
    resetStore([makeEmberon('em-1'), makeHypereon('hy-1')])
    const result: BattleResult = {
      outcome: 'win',
      xpEarned: { 'em-1': 60, 'hy-1': 40 },
      arenaPointsChange: 10,
      resourcesEarned: { goldDust: 50, stamina: 5 },
    }
    ReactDOM.render(<PostBattle result={result} />, container)
    expect(container.textContent).toContain('Emberon')
    expect(container.textContent).toContain('Hypereon')
    expect(container.textContent).toContain('+60 XP')
    expect(container.textContent).toContain('+40 XP')
  })

  it('hides XP section when no XP earned', () => {
    resetStore([makeEmberon()])
    const result: BattleResult = {
      outcome: 'loss',
      xpEarned: {},
      arenaPointsChange: 0,
      resourcesEarned: { goldDust: 0, stamina: 5 },
    }
    ReactDOM.render(<PostBattle result={result} />, container)
    expect(container.textContent).not.toContain('Experience Gained')
  })


  // ── Navigation ────────────────────────────────────────────────────────────

  it('shows Back to Hub button', () => {
    resetStore([makeEmberon()])
    const result: BattleResult = {
      outcome: 'win',
      xpEarned: {},
      arenaPointsChange: 10,
      resourcesEarned: { goldDust: 50, stamina: 5 },
    }
    ReactDOM.render(<PostBattle result={result} />, container)
    const btns = Array.from(container.querySelectorAll('button'))
    expect(btns.some(b => b.textContent?.includes('Back to Hub'))).toBe(true)
  })

  it('navigates to main-menu on Back button click', () => {
    resetStore([makeEmberon()])
    const result: BattleResult = {
      outcome: 'win',
      xpEarned: {},
      arenaPointsChange: 10,
      resourcesEarned: { goldDust: 50, stamina: 5 },
    }
    ReactDOM.render(<PostBattle result={result} />, container)
    const btn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('Back to Hub')
    )
    btn?.click()
    expect(useGameStore.getState().screen.id).toBe('main-menu')
  })

  // ── Rewards header ────────────────────────────────────────────────────────

  it('displays Rewards header', () => {
    resetStore([makeEmberon()])
    const result: BattleResult = {
      outcome: 'win',
      xpEarned: {},
      arenaPointsChange: 10,
      resourcesEarned: { goldDust: 50, stamina: 5 },
    }
    ReactDOM.render(<PostBattle result={result} />, container)
    expect(container.textContent).toContain('Rewards')
  })

  // ── Defeat outcome ────────────────────────────────────────────────────────

  it('shows defeat emoji on loss', () => {
    resetStore([makeEmberon()])
    const result: BattleResult = {
      outcome: 'loss',
      xpEarned: {},
      arenaPointsChange: 0,
      resourcesEarned: { goldDust: 0, stamina: 5 },
    }
    ReactDOM.render(<PostBattle result={result} />, container)
    expect(container.textContent).toContain('😔')
  })

  it('shows victory emoji on win', () => {
    resetStore([makeEmberon()])
    const result: BattleResult = {
      outcome: 'win',
      xpEarned: {},
      arenaPointsChange: 10,
      resourcesEarned: { goldDust: 50, stamina: 5 },
    }
    ReactDOM.render(<PostBattle result={result} />, container)
    expect(container.textContent).toContain('🎉')
  })
})
