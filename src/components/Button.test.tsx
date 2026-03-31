import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import ReactDOM from 'react-dom'
import Button from './Button'

describe('Button', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(container)
    document.body.removeChild(container)
  })

  it('renders button element', () => {
    ReactDOM.render(<Button>Click</Button>, container)
    expect(container.querySelector('button')).toBeTruthy()
  })

  it('renders with children text', () => {
    ReactDOM.render(<Button>Hello World</Button>, container)
    expect(container.textContent).toContain('Hello World')
  })

  it('passes disabled prop to button', () => {
    ReactDOM.render(<Button disabled>Click</Button>, container)
    const button = container.querySelector('button') as HTMLButtonElement
    expect(button.disabled).toBe(true)
  })

  it('accepts onClick handler', () => {
    const handleClick = vi.fn()
    ReactDOM.render(<Button onClick={handleClick}>Click</Button>, container)
    const button = container.querySelector('button') as HTMLButtonElement
    button.click()
    expect(handleClick).toHaveBeenCalled()
  })

  it('accepts custom HTML attributes', () => {
    ReactDOM.render(<Button type="submit" data-testid="submit-btn">Submit</Button>, container)
    const button = container.querySelector('button') as HTMLButtonElement
    expect(button.type).toBe('submit')
    expect(button.getAttribute('data-testid')).toBe('submit-btn')
  })

  it('renders with primary variant', () => {
    ReactDOM.render(<Button variant="primary">Click</Button>, container)
    const button = container.querySelector('button') as HTMLButtonElement
    expect(button.style.backgroundColor).toBeTruthy()
  })

  it('renders with secondary variant', () => {
    ReactDOM.render(<Button variant="secondary">Click</Button>, container)
    const button = container.querySelector('button') as HTMLButtonElement
    expect(button.style.backgroundColor).toBeTruthy()
  })

  it('renders with danger variant', () => {
    ReactDOM.render(<Button variant="danger">Click</Button>, container)
    const button = container.querySelector('button') as HTMLButtonElement
    expect(button.style.backgroundColor).toBeTruthy()
  })

  it('renders with small size', () => {
    ReactDOM.render(<Button size="small">Click</Button>, container)
    const button = container.querySelector('button') as HTMLButtonElement
    expect(button.style.padding).toBeTruthy()
    expect(button.style.fontSize).toBeTruthy()
  })

  it('renders with medium size', () => {
    ReactDOM.render(<Button size="medium">Click</Button>, container)
    const button = container.querySelector('button') as HTMLButtonElement
    expect(button.style.padding).toBeTruthy()
    expect(button.style.fontSize).toBeTruthy()
  })

  it('renders with large size', () => {
    ReactDOM.render(<Button size="large">Click</Button>, container)
    const button = container.querySelector('button') as HTMLButtonElement
    expect(button.style.padding).toBeTruthy()
    expect(button.style.fontSize).toBeTruthy()
  })

  it('renders with transition effect', () => {
    ReactDOM.render(<Button>Click</Button>, container)
    const button = container.querySelector('button') as HTMLButtonElement
    expect(button.style.transition).toBe('all 0.2s ease')
  })
})
