import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import ReactDOM from 'react-dom'
import Card from './Card'

describe('Card', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(container)
    document.body.removeChild(container)
  })

  it('renders children', () => {
    ReactDOM.render(<Card>Test content</Card>, container)
    expect(container.textContent).toContain('Test content')
  })

  it('renders with title', () => {
    ReactDOM.render(<Card title="Title">Content</Card>, container)
    expect(container.textContent).toContain('Title')
  })

  it('does not render title when not provided', () => {
    ReactDOM.render(<Card>Content</Card>, container)
    expect(container.querySelector('h3')).toBeNull()
  })

  it('applies card styling', () => {
    ReactDOM.render(<Card>Content</Card>, container)
    const card = container.querySelector('div') as HTMLDivElement
    expect(card.style.border).toBeTruthy()
    expect(card.style.borderRadius).toBeTruthy()
    expect(card.style.padding).toBeTruthy()
  })

  it('applies selected styling', () => {
    ReactDOM.render(<Card selected={true}>Content</Card>, container)
    const card = container.querySelector('div') as HTMLDivElement
    expect(card.style.border).toContain('2px')
  })

  it('applies disabled styling', () => {
    ReactDOM.render(<Card disabled={true}>Content</Card>, container)
    const card = container.querySelector('div') as HTMLDivElement
    expect(card.style.opacity).toBe('0.6')
  })

  it('handles onClick', () => {
    const handleClick = vi.fn()
    ReactDOM.render(<Card onClick={handleClick}>Content</Card>, container)
    const card = container.querySelector('div') as HTMLDivElement
    card.click()
    expect(handleClick).toHaveBeenCalled()
  })

  it('has pointer cursor when onClick provided', () => {
    const handleClick = vi.fn()
    ReactDOM.render(<Card onClick={handleClick}>Content</Card>, container)
    const card = container.querySelector('div') as HTMLDivElement
    expect(card.style.cursor).toBe('pointer')
  })

  it('has default cursor when no onClick', () => {
    ReactDOM.render(<Card>Content</Card>, container)
    const card = container.querySelector('div') as HTMLDivElement
    expect(card.style.cursor).toBe('default')
  })

  it('has transition effect', () => {
    ReactDOM.render(<Card>Content</Card>, container)
    const card = container.querySelector('div') as HTMLDivElement
    expect(card.style.transition).toBe('all 0.2s ease')
  })
})
