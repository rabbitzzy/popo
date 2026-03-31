import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import React from 'react'
import ReactDOM from 'react-dom'
import TypeBadge from './TypeBadge'

describe('TypeBadge', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(container)
    document.body.removeChild(container)
  })

  it('renders span element', () => {
    ReactDOM.render(<TypeBadge type="Fire" />, container)
    expect(container.querySelector('span')).toBeTruthy()
  })

  it('renders type text', () => {
    ReactDOM.render(<TypeBadge type="Water" />, container)
    expect(container.textContent).toContain('Water')
  })

  it('applies badge styling', () => {
    ReactDOM.render(<TypeBadge type="Fire" />, container)
    const badge = container.querySelector('span') as HTMLSpanElement
    expect(badge.style.display).toBe('inline-block')
    expect(badge.style.fontWeight).toBe('bold')
    expect(badge.style.textTransform).toBe('uppercase')
  })

  it('renders with Fire type color', () => {
    ReactDOM.render(<TypeBadge type="Fire" />, container)
    const badge = container.querySelector('span') as HTMLSpanElement
    expect(badge.style.backgroundColor).toBeTruthy()
  })

  it('renders with Water type color', () => {
    ReactDOM.render(<TypeBadge type="Water" />, container)
    const badge = container.querySelector('span') as HTMLSpanElement
    expect(badge.style.backgroundColor).toBeTruthy()
  })

  it('renders with small size', () => {
    ReactDOM.render(<TypeBadge type="Fire" size="small" />, container)
    const badge = container.querySelector('span') as HTMLSpanElement
    expect(badge.style.padding).toBeTruthy()
  })

  it('renders with medium size', () => {
    ReactDOM.render(<TypeBadge type="Fire" size="medium" />, container)
    const badge = container.querySelector('span') as HTMLSpanElement
    expect(badge.style.padding).toBeTruthy()
  })

  it('renders with large size', () => {
    ReactDOM.render(<TypeBadge type="Fire" size="large" />, container)
    const badge = container.querySelector('span') as HTMLSpanElement
    expect(badge.style.padding).toBeTruthy()
  })

  it('renders with white text color', () => {
    ReactDOM.render(<TypeBadge type="Fire" />, container)
    const badge = container.querySelector('span') as HTMLSpanElement
    expect(badge.style.color).toBe('rgb(255, 255, 255)')
  })

  it('renders all element types', () => {
    const types = ['Fire', 'Water', 'Grass', 'Electric', 'Rock', 'Ice', 'Psychic'] as const
    types.forEach(type => {
      ReactDOM.unmountComponentAtNode(container)
      ReactDOM.render(<TypeBadge type={type} />, container)
      expect(container.textContent).toContain(type)
    })
  })
})
