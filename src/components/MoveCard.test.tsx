import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import React from 'react'
import ReactDOM from 'react-dom'
import MoveCard from './MoveCard'
import { MoveDefinition } from '../data/types'

describe('MoveCard', () => {
  let container: HTMLDivElement
  const baseMove: MoveDefinition = {
    id: 'test-move',
    name: 'Test Move',
    type: 'Fire',
    category: 'Physical',
    power: 80,
    nrgCost: 20,
    accuracy: 100,
    unlockLevel: 1,
  }

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(container)
    document.body.removeChild(container)
  })

  it('renders move name', () => {
    ReactDOM.render(<MoveCard move={baseMove} />, container)
    expect(container.textContent).toContain('Test Move')
  })

  it('renders move stats', () => {
    ReactDOM.render(<MoveCard move={baseMove} />, container)
    expect(container.textContent).toContain('Power')
    expect(container.textContent).toContain('80')
    expect(container.textContent).toContain('NRG Cost')
    expect(container.textContent).toContain('20')
  })

  it('renders type badge', () => {
    ReactDOM.render(<MoveCard move={baseMove} />, container)
    expect(container.querySelector('span')).toBeTruthy()
  })

  it('shows insufficient NRG message', () => {
    ReactDOM.render(<MoveCard move={baseMove} currentNrg={10} />, container)
    expect(container.textContent).toContain('Not enough NRG!')
  })

  it('does not show insufficient NRG when enough', () => {
    ReactDOM.render(<MoveCard move={baseMove} currentNrg={30} />, container)
    expect(container.textContent).not.toContain('Not enough NRG!')
  })

  it('applies selected styling', () => {
    ReactDOM.render(<MoveCard move={baseMove} selected={true} />, container)
    const card = container.querySelector('div') as HTMLDivElement
    expect(card.style.border).toContain('2px')
  })

  it('applies disabled styling', () => {
    ReactDOM.render(<MoveCard move={baseMove} disabled={true} />, container)
    const card = container.querySelector('div') as HTMLDivElement
    expect(card.style.opacity).toBe('0.6')
  })

  it('has pointer cursor when affordable', () => {
    ReactDOM.render(<MoveCard move={baseMove} currentNrg={30} />, container)
    const card = container.querySelector('div') as HTMLDivElement
    expect(card.style.cursor).toBe('pointer')
  })

  it('has not-allowed cursor when unaffordable', () => {
    ReactDOM.render(<MoveCard move={baseMove} currentNrg={10} />, container)
    const card = container.querySelector('div') as HTMLDivElement
    expect(card.style.cursor).toBe('not-allowed')
  })

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn()
    ReactDOM.render(<MoveCard move={baseMove} onClick={handleClick} currentNrg={30} />, container)
    const card = container.querySelector('div') as HTMLDivElement
    card.click()
    expect(handleClick).toHaveBeenCalled()
  })

  it('does not call onClick when unaffordable', () => {
    const handleClick = vi.fn()
    ReactDOM.render(<MoveCard move={baseMove} onClick={handleClick} currentNrg={10} />, container)
    const card = container.querySelector('div') as HTMLDivElement
    card.click()
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('renders move with status effect', () => {
    const moveWithEffect: MoveDefinition = {
      ...baseMove,
      effect: { status: 'Freeze' },
    }
    ReactDOM.render(<MoveCard move={moveWithEffect} />, container)
    expect(container.textContent).toContain('Freeze')
  })

  it('renders move with stat modifier', () => {
    const moveWithMod: MoveDefinition = {
      ...baseMove,
      effect: { statMod: { stat: 'ATK', delta: 20 } },
    }
    ReactDOM.render(<MoveCard move={moveWithMod} />, container)
    expect(container.textContent).toContain('ATK')
    expect(container.textContent).toContain('20')
  })
})
