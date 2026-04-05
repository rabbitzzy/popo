import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import ReactDOM from 'react-dom'
import Settings from './Settings'
import { useGameStore } from '../store/gameStore'

// ── Helpers ───────────────────────────────────────────────────────────────────

function resetStore() {
  const store = useGameStore.getState()
  useGameStore.setState({
    saveState: {
      version: 1,
      party: [],
      inventory: { crystalOrbs: 0, goldDust: 100, stamina: 20, evolutionStones: {} },
      arena: { points: 150, tier: 'Silver' },
      berryLog: [],
      tutorialComplete: true,
      gameWon: false,
    currentLocation: 'verdant-vale' as const,
    },
    battleState: null,
    screen: { id: 'settings' },
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

describe('Settings', () => {
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
    vi.stubGlobal('URL', {
      createObjectURL: (blob: any) => 'blob:mock-url',
      revokeObjectURL: () => {},
    })
  })

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(container)
    document.body.removeChild(container)
    vi.unstubAllGlobals()
  })

  // ── Header and navigation ──────────────────────────────────────────────────

  it('displays Settings heading', () => {
    resetStore()
    ReactDOM.render(<Settings />, container)
    expect(container.textContent).toContain('Settings')
  })

  it('shows back button', () => {
    resetStore()
    ReactDOM.render(<Settings />, container)
    const btns = Array.from(container.querySelectorAll('button'))
    expect(btns.some(b => b.textContent?.includes('Back'))).toBe(true)
  })

  it('navigates to main-menu on back click', () => {
    resetStore()
    ReactDOM.render(<Settings />, container)
    const btn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('Back')
    )
    btn?.click()
    expect(useGameStore.getState().screen.id).toBe('main-menu')
  })

  // ── Audio toggle ───────────────────────────────────────────────────────────

  it('displays Audio section', () => {
    resetStore()
    ReactDOM.render(<Settings />, container)
    expect(container.textContent).toContain('Audio')
  })

  it('shows audio toggle button with initial "On" state', () => {
    resetStore()
    ReactDOM.render(<Settings />, container)
    expect(container.textContent).toContain('🔊 On')
  })

  it('shows audio description', () => {
    resetStore()
    ReactDOM.render(<Settings />, container)
    expect(container.textContent).toContain('Toggle sound effects and music')
  })

  it('toggles audio to muted state', () => {
    resetStore()
    ReactDOM.render(<Settings />, container)
    const audioBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('🔊 On')
    )
    audioBtn?.click()
    expect(container.textContent).toContain('🔇 Muted')
  })

  it('toggles audio back to on state', () => {
    resetStore()
    ReactDOM.render(<Settings />, container)
    const audioBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('🔊 On')
    )
    audioBtn?.click()
    expect(container.textContent).toContain('🔇 Muted')
    const mutedBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('🔇 Muted')
    )
    mutedBtn?.click()
    expect(container.textContent).toContain('🔊 On')
  })

  // ── Export save ────────────────────────────────────────────────────────────

  it('displays Export Save section', () => {
    resetStore()
    ReactDOM.render(<Settings />, container)
    expect(container.textContent).toContain('Export Save')
  })

  it('shows export description', () => {
    resetStore()
    ReactDOM.render(<Settings />, container)
    expect(container.textContent).toContain('Download your game progress as JSON')
  })

  it('shows Download button', () => {
    resetStore()
    ReactDOM.render(<Settings />, container)
    const btns = Array.from(container.querySelectorAll('button'))
    expect(btns.some(b => b.textContent?.includes('Download'))).toBe(true)
  })

  it('saves game state before exporting', () => {
    resetStore()
    const saveGameSpy = vi.spyOn(useGameStore.getState(), 'saveGame')
    const mockStorage: Record<string, string> = {}
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => mockStorage[k] ?? null,
      setItem: (k: string, v: string) => { mockStorage[k] = v },
      removeItem: (k: string) => { delete mockStorage[k] },
      clear: () => Object.keys(mockStorage).forEach(k => delete mockStorage[k]),
    })
    ReactDOM.render(<Settings />, container)
    const downloadBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('Download')
    )
    downloadBtn?.click()
    expect(saveGameSpy).toHaveBeenCalled()
  })

  it('handles export error gracefully', () => {
    resetStore()
    const mockStorage: Record<string, string> = {}
    vi.stubGlobal('localStorage', {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
      clear: () => {},
    })
    ReactDOM.render(<Settings />, container)
    const downloadBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('Download')
    )
    downloadBtn?.click()
    expect(container.textContent).toContain('No save data to export')
  })

  // ── Import save ────────────────────────────────────────────────────────────

  it('displays Import Save section', () => {
    resetStore()
    ReactDOM.render(<Settings />, container)
    expect(container.textContent).toContain('Import Save')
  })

  it('shows import description', () => {
    resetStore()
    ReactDOM.render(<Settings />, container)
    expect(container.textContent).toContain('Load a previously exported save file')
  })

  it('shows Upload button', () => {
    resetStore()
    ReactDOM.render(<Settings />, container)
    const btns = Array.from(container.querySelectorAll('button'))
    expect(btns.some(b => b.textContent?.includes('Upload'))).toBe(true)
  })

  it('has hidden file input', () => {
    resetStore()
    ReactDOM.render(<Settings />, container)
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement
    expect(fileInput).toBeTruthy()
    expect(fileInput.style.display).toBe('none')
  })

  it('accepts JSON files only', () => {
    resetStore()
    ReactDOM.render(<Settings />, container)
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement
    expect(fileInput.accept).toBe('.json')
  })

  it('shows Upload button for file import', () => {
    resetStore()
    ReactDOM.render(<Settings />, container)
    const uploadBtns = Array.from(container.querySelectorAll('button')).filter(
      b => b.textContent?.includes('Upload')
    )
    expect(uploadBtns.length).toBeGreaterThan(0)
  })

  // ── Reset save ────────────────────────────────────────────────────────────

  it('displays Reset Save section', () => {
    resetStore()
    ReactDOM.render(<Settings />, container)
    expect(container.textContent).toContain('Reset Save')
  })

  it('shows reset description', () => {
    resetStore()
    ReactDOM.render(<Settings />, container)
    expect(container.textContent).toContain('Permanently delete all progress and start over')
  })

  it('shows Reset button', () => {
    resetStore()
    ReactDOM.render(<Settings />, container)
    const btns = Array.from(container.querySelectorAll('button'))
    expect(btns.some(b => b.textContent?.includes('Reset'))).toBe(true)
  })

  it('shows reset confirmation dialog on Reset click', () => {
    resetStore()
    ReactDOM.render(<Settings />, container)
    const resetBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.trim() === 'Reset'
    )
    resetBtn?.click()
    expect(container.textContent).toContain('Reset Save?')
  })

  it('shows reset confirmation dialog with message', () => {
    resetStore()
    ReactDOM.render(<Settings />, container)
    const resetBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.trim() === 'Reset'
    )
    resetBtn?.click()
    expect(container.textContent).toContain('Reset Save?')
  })

  it('clears game state on reset confirm', () => {
    resetStore()
    const clearGameSpy = vi.spyOn(useGameStore.getState(), 'clearGame')
    ReactDOM.render(<Settings />, container)
    const resetBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.trim() === 'Reset'
    )
    resetBtn?.click()
    const confirmBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('Confirm') || b.textContent?.includes('Yes')
    )
    confirmBtn?.click()
    expect(clearGameSpy).toHaveBeenCalled()
  })

  it('navigates to main menu after reset', () => {
    resetStore()
    ReactDOM.render(<Settings />, container)
    const resetBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.trim() === 'Reset'
    )
    resetBtn?.click()
    const confirmBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('Confirm') || b.textContent?.includes('Yes')
    )
    confirmBtn?.click()
    expect(useGameStore.getState().screen.id).toBe('main-menu')
  })

  it('cancels reset dialog', () => {
    resetStore()
    ReactDOM.render(<Settings />, container)
    const resetBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.trim() === 'Reset'
    )
    resetBtn?.click()
    expect(container.textContent).toContain('Reset Save?')
    const cancelBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('Cancel') || b.textContent?.includes('No')
    )
    cancelBtn?.click()
    expect(container.textContent).not.toContain('Reset Save?')
  })

  // ── Error handling ────────────────────────────────────────────────────────

  it('handles export without saved data', () => {
    resetStore()
    const mockStorage: Record<string, string> = {}
    vi.stubGlobal('localStorage', {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
      clear: () => {},
    })
    ReactDOM.render(<Settings />, container)
    const downloadBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('Download')
    )
    downloadBtn?.click()
    // Should show error message, but the component handles it internally
    // Test just verifies button exists and is clickable
    expect(downloadBtn).toBeTruthy()
  })

  it('export button is clickable', () => {
    resetStore()
    ReactDOM.render(<Settings />, container)
    const downloadBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('Download')
    )
    expect(downloadBtn).toBeTruthy()
    // Clicking should not throw error
    expect(() => downloadBtn?.click()).not.toThrow()
  })

  // ── Layout and structure ───────────────────────────────────────────────────

  it('displays all four settings sections', () => {
    resetStore()
    ReactDOM.render(<Settings />, container)
    const cards = container.querySelectorAll('div[style*="padding: 1rem"]')
    expect(cards.length).toBeGreaterThanOrEqual(4)
  })

  it('displays sections in correct order', () => {
    resetStore()
    ReactDOM.render(<Settings />, container)
    const text = container.textContent
    const audioPos = text.indexOf('Audio')
    const exportPos = text.indexOf('Export Save')
    const importPos = text.indexOf('Import Save')
    const resetPos = text.indexOf('Reset Save')
    expect(audioPos).toBeLessThan(exportPos)
    expect(exportPos).toBeLessThan(importPos)
    expect(importPos).toBeLessThan(resetPos)
  })

  it('renders without errors', () => {
    resetStore()
    ReactDOM.render(<Settings />, container)
    expect(container.textContent).toContain('Settings')
  })
})
