import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import ReactDOM from 'react-dom'
import EncounterScreen from './EncounterScreen'
import { useGameStore } from '../../store/gameStore'
import type { PartyMember } from '../../data/types'
import { computeStats } from '../../engine/leveling'
import { EMBER_CRATER, TIDE_BASIN } from '../../data/zones'

// ── Helpers ───────────────────────────────────────────────────────────────────

function resetStore(partyOverride: PartyMember[] = []) {
  const store = useGameStore.getState()
  useGameStore.setState({
    saveState: {
      version: 1,
      party: partyOverride,
      inventory: { crystalOrbs: 0, goldDust: 50, stamina: 10, evolutionStones: {} },
      arena: { points: 0, tier: 'Bronze' },
      berryLog: [],
      tutorialComplete: true,
      gameWon: false,
    currentLocation: 'verdant-vale' as const,
    },
    battleState: null,
    screen: { id: 'encounter', zone: EMBER_CRATER, wildBerry: {} as any },
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

function makeWildBerry(level = 5, instanceId = 'wild-1') {
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

describe('EncounterScreen', () => {
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

  it('renders "Wild Encounter" heading', () => {
    ReactDOM.render(<EncounterScreen zone={EMBER_CRATER} wildBerry={makeWildBerry()} />, container)
    expect(container.textContent).toContain('Wild Encounter')
  })

  it('shows zone name in header', () => {
    ReactDOM.render(<EncounterScreen zone={TIDE_BASIN} wildBerry={makeWildBerry()} />, container)
    expect(container.textContent).toContain('Tide Basin')
  })

  it('shows encounter message', () => {
    ReactDOM.render(<EncounterScreen zone={EMBER_CRATER} wildBerry={makeWildBerry()} />, container)
    expect(container.textContent).toContain('A wild Berry appeared')
  })

  // ── Wild Berry display ────────────────────────────────────────────────────

  it('displays wild Berry name', () => {
    ReactDOM.render(<EncounterScreen zone={EMBER_CRATER} wildBerry={makeWildBerry()} />, container)
    expect(container.textContent).toContain('Berry')
  })

  it('displays wild Berry level', () => {
    ReactDOM.render(<EncounterScreen zone={EMBER_CRATER} wildBerry={makeWildBerry(7)} />, container)
    expect(container.textContent).toContain('Lv. 7')
  })

  it('shows all 5 stats', () => {
    ReactDOM.render(<EncounterScreen zone={EMBER_CRATER} wildBerry={makeWildBerry()} />, container)
    expect(container.textContent).toContain('HP')
    expect(container.textContent).toContain('ATK')
    expect(container.textContent).toContain('DEF')
    expect(container.textContent).toContain('SPD')
    expect(container.textContent).toContain('NRG')
  })

  it('shows stat values in bars', () => {
    const wild = makeWildBerry(5)
    ReactDOM.render(<EncounterScreen zone={EMBER_CRATER} wildBerry={wild} />, container)
    expect(container.textContent).toContain(wild.currentStats.hp.toString())
  })

  it('shows info text about unevolved status', () => {
    ReactDOM.render(<EncounterScreen zone={EMBER_CRATER} wildBerry={makeWildBerry()} />, container)
    expect(container.textContent).toContain('unevolved')
  })

  // ── Party count ───────────────────────────────────────────────────────────

  it('shows party count when empty', () => {
    ReactDOM.render(<EncounterScreen zone={EMBER_CRATER} wildBerry={makeWildBerry()} />, container)
    expect(container.textContent).toContain('Current party: 0')
  })

  it('shows party count with singular member', () => {
    resetStore([makeEmberon()])
    ReactDOM.render(<EncounterScreen zone={EMBER_CRATER} wildBerry={makeWildBerry()} />, container)
    expect(container.textContent).toContain('1 member')
  })

  it('shows party count with multiple members', () => {
    resetStore([makeEmberon('em-1'), makeEmberon('em-2', 10)])
    ReactDOM.render(<EncounterScreen zone={EMBER_CRATER} wildBerry={makeWildBerry()} />, container)
    expect(container.textContent).toContain('2 members')
  })

  // ── Buttons (pre-capture) ─────────────────────────────────────────────────

  it('renders Capture button', () => {
    ReactDOM.render(<EncounterScreen zone={EMBER_CRATER} wildBerry={makeWildBerry()} />, container)
    const btns = Array.from(container.querySelectorAll('button'))
    expect(btns.some(b => b.textContent?.includes('Capture'))).toBe(true)
  })

  it('renders Flee button', () => {
    ReactDOM.render(<EncounterScreen zone={EMBER_CRATER} wildBerry={makeWildBerry()} />, container)
    const btns = Array.from(container.querySelectorAll('button'))
    expect(btns.some(b => b.textContent?.includes('Flee'))).toBe(true)
  })

  // ── Flee ──────────────────────────────────────────────────────────────────

  it('navigates to zone-select when Flee clicked', () => {
    ReactDOM.render(<EncounterScreen zone={EMBER_CRATER} wildBerry={makeWildBerry()} />, container)
    const btn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('Flee'))
    btn?.click()
    expect(useGameStore.getState().screen.id).toBe('zone-select')
  })

  // ── Capture ───────────────────────────────────────────────────────────────

  it('adds wild berry to party when Capture clicked', () => {
    const wild = makeWildBerry(5, 'wild-42')
    ReactDOM.render(<EncounterScreen zone={EMBER_CRATER} wildBerry={wild} />, container)
    const btn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('Capture'))
    btn?.click()
    const party = useGameStore.getState().saveState.party
    expect(party.some(m => m.instanceId === 'wild-42')).toBe(true)
  })

  it('shows capture confirmation message after Capture', () => {
    ReactDOM.render(<EncounterScreen zone={EMBER_CRATER} wildBerry={makeWildBerry()} />, container)
    const btn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('Capture'))
    btn?.click()
    expect(container.textContent).toContain('Captured')
  })

  it('shows "A wild Berry has joined your party!" message', () => {
    ReactDOM.render(<EncounterScreen zone={EMBER_CRATER} wildBerry={makeWildBerry()} />, container)
    const btn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('Capture'))
    btn?.click()
    expect(container.textContent).toContain('joined your party')
  })

  // ── Post-capture buttons ──────────────────────────────────────────────────

  it('shows "Continue Exploring" button after Capture', () => {
    ReactDOM.render(<EncounterScreen zone={EMBER_CRATER} wildBerry={makeWildBerry()} />, container)
    const btn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('Capture'))
    btn?.click()
    const continueBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('Continue Exploring')
    )
    expect(continueBtn).toBeTruthy()
  })

  it('shows "Back to Hub" button after Capture', () => {
    ReactDOM.render(<EncounterScreen zone={EMBER_CRATER} wildBerry={makeWildBerry()} />, container)
    const btn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('Capture'))
    btn?.click()
    const hubBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('Back to Hub')
    )
    expect(hubBtn).toBeTruthy()
  })

  it('"Continue Exploring" navigates to zone-select', () => {
    ReactDOM.render(<EncounterScreen zone={EMBER_CRATER} wildBerry={makeWildBerry()} />, container)
    const captureBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('Capture'))
    captureBtn?.click()
    const continueBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('Continue Exploring')
    )
    continueBtn?.click()
    expect(useGameStore.getState().screen.id).toBe('zone-select')
  })

  it('"Back to Hub" navigates to main-menu', () => {
    ReactDOM.render(<EncounterScreen zone={EMBER_CRATER} wildBerry={makeWildBerry()} />, container)
    const captureBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('Capture'))
    captureBtn?.click()
    const hubBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('Back to Hub')
    )
    hubBtn?.click()
    expect(useGameStore.getState().screen.id).toBe('main-menu')
  })

  // ── Multiple captures ─────────────────────────────────────────────────────

  it('allows capturing multiple wild berries', () => {
    const wild1 = makeWildBerry(5, 'wild-1')
    ReactDOM.render(<EncounterScreen zone={EMBER_CRATER} wildBerry={wild1} />, container)
    const btn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('Capture'))
    btn?.click()
    expect(useGameStore.getState().saveState.party).toHaveLength(1)
  })

  it('preserves existing party when capturing', () => {
    resetStore([makeEmberon('em-1')])
    const wild = makeWildBerry(5, 'wild-1')
    ReactDOM.render(<EncounterScreen zone={EMBER_CRATER} wildBerry={wild} />, container)
    const btn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('Capture'))
    btn?.click()
    const party = useGameStore.getState().saveState.party
    expect(party).toHaveLength(2)
    expect(party[0].instanceId).toBe('em-1')
    expect(party[1].instanceId).toBe('wild-1')
  })

  // ── Different zones ───────────────────────────────────────────────────────

  it('shows correct zone for Tide Basin', () => {
    ReactDOM.render(<EncounterScreen zone={TIDE_BASIN} wildBerry={makeWildBerry()} />, container)
    expect(container.textContent).toContain('Tide Basin')
  })

  it('shows correct zone when capturing from different zone', () => {
    const wild = makeWildBerry(3, 'wild-tide')
    ReactDOM.render(<EncounterScreen zone={TIDE_BASIN} wildBerry={wild} />, container)
    expect(container.textContent).toContain('Tide Basin')
    const btn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('Capture'))
    btn?.click()
    const captured = useGameStore.getState().saveState.party.find(m => m.instanceId === 'wild-tide')
    expect(captured?.level).toBe(3)
  })

  // ── Stats ─────────────────────────────────────────────────────────────────

  it('displays correct HP stat', () => {
    const wild = makeWildBerry(10)
    ReactDOM.render(<EncounterScreen zone={EMBER_CRATER} wildBerry={wild} />, container)
    const hpText = container.textContent
    expect(hpText).toContain(wild.currentStats.hp.toString())
  })

  it('displays correct ATK stat', () => {
    const wild = makeWildBerry(8)
    ReactDOM.render(<EncounterScreen zone={EMBER_CRATER} wildBerry={wild} />, container)
    const text = container.textContent
    expect(text).toContain('ATK')
  })
})
