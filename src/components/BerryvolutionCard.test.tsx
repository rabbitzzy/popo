import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import ReactDOM from 'react-dom'
import BerryvolutionCard from './BerryvolutionCard'
import { PartyMember } from '../data/types'

describe('BerryvolutionCard', () => {
  let container: HTMLDivElement
  const baseMember: PartyMember = {
    instanceId: 'member-1',
    defId: 'berry',
    level: 10,
    xp: 50,
    currentStats: {
      hp: 30,
      atk: 15,
      def: 12,
      spd: 14,
      nrg: 25,
    },
    maxHp: 40,
    unlockedMoveIds: ['move-1', 'move-2'],
  }

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(container)
    document.body.removeChild(container)
  })

  it('renders member name', () => {
    ReactDOM.render(<BerryvolutionCard member={baseMember} />, container)
    expect(container.textContent).toContain('Berry')
  })

  it('renders member level', () => {
    ReactDOM.render(<BerryvolutionCard member={baseMember} />, container)
    expect(container.textContent).toContain('10')
  })

  it('renders type badge', () => {
    ReactDOM.render(<BerryvolutionCard member={baseMember} />, container)
    expect(container.querySelector('span')).toBeTruthy()
  })

  it('renders HP stat in full mode', () => {
    ReactDOM.render(<BerryvolutionCard member={baseMember} />, container)
    expect(container.textContent).toContain('HP')
  })

  it('renders all stats in full mode', () => {
    ReactDOM.render(<BerryvolutionCard member={baseMember} />, container)
    expect(container.textContent).toContain('ATK')
    expect(container.textContent).toContain('DEF')
    expect(container.textContent).toContain('SPD')
    expect(container.textContent).toContain('NRG')
  })

  it('renders only HP in compact mode', () => {
    ReactDOM.render(<BerryvolutionCard member={baseMember} compact={true} />, container)
    expect(container.textContent).toContain('HP')
  })

  it('renders move count', () => {
    ReactDOM.render(<BerryvolutionCard member={baseMember} />, container)
    expect(container.textContent).toContain('Moves: 2 unlocked')
  })

  it('does not render move count when no moves', () => {
    const memberNoMoves: PartyMember = {
      ...baseMember,
      unlockedMoveIds: [],
    }
    ReactDOM.render(<BerryvolutionCard member={memberNoMoves} />, container)
    expect(container.textContent).not.toContain('Moves:')
  })

  it('applies selected styling', () => {
    ReactDOM.render(<BerryvolutionCard member={baseMember} selected={true} />, container)
    const cards = container.querySelectorAll('div')
    const mainCard = cards[0] as HTMLDivElement
    expect(mainCard.style.border).toContain('2px')
  })

  it('applies default styling', () => {
    ReactDOM.render(<BerryvolutionCard member={baseMember} selected={false} />, container)
    const cards = container.querySelectorAll('div')
    const mainCard = cards[0] as HTMLDivElement
    expect(mainCard.style.border).toContain('1px')
  })

  it('handles onClick', () => {
    const handleClick = vi.fn()
    ReactDOM.render(<BerryvolutionCard member={baseMember} onClick={handleClick} />, container)
    const cards = container.querySelectorAll('div')
    const mainCard = cards[0] as HTMLDivElement
    mainCard.click()
    expect(handleClick).toHaveBeenCalled()
  })

  it('renders different berryvolution', () => {
    const emberon: PartyMember = {
      ...baseMember,
      defId: 'emberon',
    }
    ReactDOM.render(<BerryvolutionCard member={emberon} />, container)
    expect(container.textContent).toContain('Emberon')
  })

  it('renders XP info in full mode', () => {
    ReactDOM.render(<BerryvolutionCard member={baseMember} />, container)
    expect(container.textContent).toContain('XP')
  })

  it('renders compact card properly', () => {
    ReactDOM.render(<BerryvolutionCard member={baseMember} compact={true} />, container)
    const cards = container.querySelectorAll('div')
    expect(cards.length).toBeGreaterThan(0)
  })

  it('renders with high level member', () => {
    const highLevel: PartyMember = {
      ...baseMember,
      level: 100,
    }
    ReactDOM.render(<BerryvolutionCard member={highLevel} />, container)
    expect(container.textContent).toContain('100')
  })

  it('renders stat values', () => {
    ReactDOM.render(<BerryvolutionCard member={baseMember} />, container)
    expect(container.textContent).toContain('30')
    expect(container.textContent).toContain('40')
  })

  it('has pointer cursor when onClick provided', () => {
    const handleClick = vi.fn()
    ReactDOM.render(<BerryvolutionCard member={baseMember} onClick={handleClick} />, container)
    const cards = container.querySelectorAll('div')
    const mainCard = cards[0] as HTMLDivElement
    expect(mainCard.style.cursor).toBe('pointer')
  })

  it('has default cursor when no onClick', () => {
    ReactDOM.render(<BerryvolutionCard member={baseMember} />, container)
    const cards = container.querySelectorAll('div')
    const mainCard = cards[0] as HTMLDivElement
    expect(mainCard.style.cursor).toBe('default')
  })
})
