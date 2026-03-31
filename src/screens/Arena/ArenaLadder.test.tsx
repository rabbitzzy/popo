import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

import ReactDOM from 'react-dom'
import ArenaLadder from './ArenaLadder'
import { useGameStore } from '../../store/gameStore'
import { computeStats } from '../../engine/leveling'
import type { PartyMember } from '../../data/types'

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeBerryvolution(defId: string, instanceId = `${defId}-1`, level = 10) {
  const stats = computeStats(defId, level)
  return {
    instanceId,
    defId: defId as any,
    level,
    xp: 100,
    currentStats: stats,
    maxHp: stats.hp,
    unlockedMoveIds: [],
  }
}

function resetStore(
  partyOverride: PartyMember[] = [],
  arenaPoints = 150,
  arenaTier = 'Silver' as any
) {
  const store = useGameStore.getState()
  useGameStore.setState({
    saveState: {
      version: 1,
      party: partyOverride,
      inventory: { crystalOrbs: 0, goldDust: 0, stamina: 0, evolutionStones: {} },
      arena: { points: arenaPoints, tier: arenaTier },
      berryLog: [],
      tutorialComplete: true,
      gameWon: false,
    },
    battleState: null,
    screen: { id: 'ladder' },
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

describe('ArenaLadder', () => {
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

  // ── Header ────────────────────────────────────────────────────────────────

  it('displays Arena Rankings heading', () => {
    resetStore([makeBerryvolution('emberon')])
    ReactDOM.render(<ArenaLadder />, container)
    expect(container.textContent).toContain('Arena Rankings')
  })

  it('shows back button', () => {
    resetStore([makeBerryvolution('emberon')])
    ReactDOM.render(<ArenaLadder />, container)
    const btns = Array.from(container.querySelectorAll('button'))
    expect(btns.some(b => b.textContent?.includes('Back'))).toBe(true)
  })

  it('navigates to main-menu on back click', () => {
    resetStore([makeBerryvolution('emberon')])
    ReactDOM.render(<ArenaLadder />, container)
    const btn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('Back')
    )
    btn?.click()
    expect(useGameStore.getState().screen.id).toBe('main-menu')
  })

  // ── Current status display ─────────────────────────────────────────────────

  it('displays current tier', () => {
    resetStore([makeBerryvolution('emberon')], 150, 'Silver')
    ReactDOM.render(<ArenaLadder />, container)
    expect(container.textContent).toContain('Silver')
  })

  it('displays arena points', () => {
    resetStore([makeBerryvolution('emberon')], 250, 'Silver')
    ReactDOM.render(<ArenaLadder />, container)
    expect(container.textContent).toContain('250')
  })

  it('shows current tier label', () => {
    resetStore([makeBerryvolution('emberon')], 150, 'Silver')
    ReactDOM.render(<ArenaLadder />, container)
    expect(container.textContent).toContain('Current Tier')
  })

  it('shows arena points label', () => {
    resetStore([makeBerryvolution('emberon')], 150, 'Silver')
    ReactDOM.render(<ArenaLadder />, container)
    expect(container.textContent).toContain('Arena Points')
  })

  // ── Next tier progress ─────────────────────────────────────────────────────

  it('displays points to next tier for non-Apex', () => {
    resetStore([makeBerryvolution('emberon')], 150, 'Silver')
    ReactDOM.render(<ArenaLadder />, container)
    // Silver: 300 points required, player has 150, so 150 points to Gold (700)
    // Actually should show points to next tier which is Gold at 700
    expect(container.textContent).toContain('points to')
  })

  it('shows next tier name (Bronze to Silver)', () => {
    resetStore([makeBerryvolution('emberon')], 50, 'Bronze')
    ReactDOM.render(<ArenaLadder />, container)
    expect(container.textContent).toContain('Silver')
  })

  it('shows next tier name (Silver to Gold)', () => {
    resetStore([makeBerryvolution('emberon')], 300, 'Silver')
    ReactDOM.render(<ArenaLadder />, container)
    expect(container.textContent).toContain('Gold')
  })

  // ── Tier progression display ───────────────────────────────────────────────

  it('displays tier progression heading', () => {
    resetStore([makeBerryvolution('emberon')])
    ReactDOM.render(<ArenaLadder />, container)
    expect(container.textContent).toContain('Tier Progression')
  })

  it('displays all 5 tiers', () => {
    resetStore([makeBerryvolution('emberon')])
    ReactDOM.render(<ArenaLadder />, container)
    expect(container.textContent).toContain('Bronze')
    expect(container.textContent).toContain('Silver')
    expect(container.textContent).toContain('Gold')
    expect(container.textContent).toContain('Crystal')
    expect(container.textContent).toContain('Apex')
  })

  it('displays point requirements for each tier', () => {
    resetStore([makeBerryvolution('emberon')])
    ReactDOM.render(<ArenaLadder />, container)
    expect(container.textContent).toContain('0 points') // Bronze
    expect(container.textContent).toContain('300 points') // Silver
    expect(container.textContent).toContain('700 points') // Gold
    expect(container.textContent).toContain('1200 points') // Crystal
    expect(container.textContent).toContain('2000 points') // Apex
  })

  // ── Tier status indicators ────────────────────────────────────────────────

  it('marks current tier as Active', () => {
    resetStore([makeBerryvolution('emberon')], 150, 'Silver')
    ReactDOM.render(<ArenaLadder />, container)
    expect(container.textContent).toContain('Active')
  })

  it('marks achieved tiers as Achieved', () => {
    resetStore([makeBerryvolution('emberon')], 500, 'Gold')
    ReactDOM.render(<ArenaLadder />, container)
    expect(container.textContent).toContain('✓ Achieved')
  })

  it('marks locked tiers as Locked', () => {
    resetStore([makeBerryvolution('emberon')], 50, 'Bronze')
    ReactDOM.render(<ArenaLadder />, container)
    const lockedCount = (container.textContent.match(/Locked/g) || []).length
    expect(lockedCount).toBeGreaterThan(0)
  })

  // ── Apex tier behavior ─────────────────────────────────────────────────────

  it('shows Apex without berryvolutions requirement note', () => {
    resetStore([makeBerryvolution('emberon')], 150, 'Silver')
    ReactDOM.render(<ArenaLadder />, container)
    expect(container.textContent).toContain('Apex Requirement')
  })

  it('counts collected berryvolutions correctly', () => {
    resetStore(
      [
        makeBerryvolution('emberon', 'em-1'),
        makeBerryvolution('hypereon', 'hy-1'),
        makeBerryvolution('volteon', 'vo-1'),
      ],
      150,
      'Silver'
    )
    ReactDOM.render(<ArenaLadder />, container)
    // 3 unique berryvolutions, so should show "currently 3/8"
    expect(container.textContent).toContain('3/8')
  })

  it('counts all 8 berryvolutions', () => {
    resetStore(
      [
        makeBerryvolution('emberon', 'em-1'),
        makeBerryvolution('hypereon', 'hy-1'),
        makeBerryvolution('volteon', 'vo-1'),
        makeBerryvolution('eryleon', 'er-1'),
        makeBerryvolution('vengeon', 've-1'),
        makeBerryvolution('grasseon', 'gr-1'),
        makeBerryvolution('polareon', 'po-1'),
        makeBerryvolution('luxeon', 'lu-1'),
      ],
      1500,
      'Crystal'
    )
    ReactDOM.render(<ArenaLadder />, container)
    // With all 8 berryvolutions, Apex should not show requirement note
    expect(container.textContent).not.toContain('Apex Requirement')
  })

  it('hides Apex requirement note when all berryvolutions collected', () => {
    resetStore(
      [
        makeBerryvolution('emberon', 'em-1'),
        makeBerryvolution('hypereon', 'hy-1'),
        makeBerryvolution('volteon', 'vo-1'),
        makeBerryvolution('eryleon', 'er-1'),
        makeBerryvolution('vengeon', 've-1'),
        makeBerryvolution('grasseon', 'gr-1'),
        makeBerryvolution('polareon', 'po-1'),
        makeBerryvolution('luxeon', 'lu-1'),
      ],
      2000,
      'Apex'
    )
    ReactDOM.render(<ArenaLadder />, container)
    // At Apex with all 8, requirement note should be gone
    const requirementNote = container.textContent.includes('Apex Requirement')
    expect(requirementNote).toBe(false)
  })

  it('locks Apex tier without all berryvolutions', () => {
    resetStore(
      [makeBerryvolution('emberon', 'em-1'), makeBerryvolution('hypereon', 'hy-1')],
      2000,
      'Crystal'
    )
    ReactDOM.render(<ArenaLadder />, container)
    expect(container.textContent).toContain('Apex Requirement')
    expect(container.textContent).toContain('2/8')
  })

  // ── Tier progression at different levels ──────────────────────────────────

  it('shows multiple achieved tiers at high points', () => {
    resetStore([makeBerryvolution('emberon')], 1500, 'Crystal')
    ReactDOM.render(<ArenaLadder />, container)
    const achievedCount = (container.textContent.match(/Achieved/g) || []).length
    expect(achievedCount).toBeGreaterThanOrEqual(3) // Bronze, Silver, Gold achieved
  })

  it('shows Bronze as first tier', () => {
    resetStore([makeBerryvolution('emberon')], 0, 'Bronze')
    ReactDOM.render(<ArenaLadder />, container)
    expect(container.textContent).toContain('Bronze')
  })

  it('displays correct next tier for Bronze', () => {
    resetStore([makeBerryvolution('emberon')], 100, 'Bronze')
    ReactDOM.render(<ArenaLadder />, container)
    // Bronze at 0, Silver at 300, so 200 points to Silver (300 - 100 = 200)
    expect(container.textContent).toContain('Silver')
  })

  // ── Berry vs Berryvolution handling ────────────────────────────────────────

  it('counts only berryvolutions, not unevolved berry', () => {
    resetStore(
      [
        makeBerryvolution('berry', 'berry-1'), // Unevolved (shouldn't count)
        makeBerryvolution('emberon', 'em-1'),
        makeBerryvolution('hypereon', 'hy-1'),
      ],
      150,
      'Silver'
    )
    ReactDOM.render(<ArenaLadder />, container)
    // Should show 2/8, not 3/8
    expect(container.textContent).toContain('2/8')
  })

  // ── Tier point display ─────────────────────────────────────────────────────

  it('shows all tier points correctly', () => {
    resetStore([makeBerryvolution('emberon')], 500, 'Gold')
    ReactDOM.render(<ArenaLadder />, container)
    const text = container.textContent
    expect(text).toContain('0 points') // Bronze
    expect(text).toContain('300 points') // Silver
    expect(text).toContain('700 points') // Gold
    expect(text).toContain('1200 points') // Crystal
    expect(text).toContain('2000 points') // Apex
  })

  // ── Styling and visual feedback ───────────────────────────────────────────

  it('shows current tier indicator (●)', () => {
    resetStore([makeBerryvolution('emberon')], 150, 'Silver')
    ReactDOM.render(<ArenaLadder />, container)
    expect(container.textContent).toContain('● Silver')
  })

  it('shows checkmark for achieved tiers', () => {
    resetStore([makeBerryvolution('emberon')], 500, 'Gold')
    ReactDOM.render(<ArenaLadder />, container)
    expect(container.textContent).toContain('✓')
  })

  it('shows lock emoji for locked Apex', () => {
    resetStore([makeBerryvolution('emberon')], 1500, 'Crystal')
    ReactDOM.render(<ArenaLadder />, container)
    expect(container.textContent).toContain('🔒')
  })
})
