import { describe, it, expect, beforeEach, afterEach } from 'vitest'

import ReactDOM from 'react-dom'
import StatBar from './StatBar'

describe('StatBar', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(container)
    document.body.removeChild(container)
  })

  it('renders label', () => {
    ReactDOM.render(<StatBar label="HP" current={50} max={100} />, container)
    expect(container.textContent).toContain('HP')
  })

  it('displays current and max values', () => {
    ReactDOM.render(<StatBar label="HP" current={50} max={100} />, container)
    expect(container.textContent).toContain('50')
    expect(container.textContent).toContain('100')
  })

  it('hides values when showValues is false', () => {
    ReactDOM.render(<StatBar label="HP" current={50} max={100} showValues={false} />, container)
    const text = container.textContent || ''
    // Should not contain the "50 / 100" pattern
    expect(text.includes('50 / 100')).toBe(false)
  })

  it('renders progress bar', () => {
    ReactDOM.render(<StatBar label="HP" current={50} max={100} />, container)
    const bar = container.querySelector('[style*="width"]')
    expect(bar).toBeTruthy()
  })

  it('calculates percentage correctly', () => {
    ReactDOM.render(<StatBar label="HP" current={50} max={100} />, container)
    const fillBars = container.querySelectorAll('div')
    let found = false
    fillBars.forEach(bar => {
      if (bar.style.width === '50%') found = true
    })
    expect(found).toBe(true)
  })

  it('clamps percentage to 100%', () => {
    ReactDOM.render(<StatBar label="HP" current={150} max={100} />, container)
    const fillBars = container.querySelectorAll('div')
    let found = false
    fillBars.forEach(bar => {
      if (bar.style.width === '100%') found = true
    })
    expect(found).toBe(true)
  })

  it('clamps percentage to 0%', () => {
    ReactDOM.render(<StatBar label="HP" current={-10} max={100} />, container)
    const fillBars = container.querySelectorAll('div')
    let found = false
    fillBars.forEach(bar => {
      if (bar.style.width === '0%') found = true
    })
    expect(found).toBe(true)
  })

  it('applies custom color', () => {
    ReactDOM.render(<StatBar label="HP" current={50} max={100} color="#FF0000" />, container)
    const bars = container.querySelectorAll('div')
    let found = false
    bars.forEach(bar => {
      if (bar.style.backgroundColor === 'rgb(255, 0, 0)') found = true
    })
    expect(found).toBe(true)
  })

  it('shows current/max values above the bar when showValues is true', () => {
    ReactDOM.render(<StatBar label="HP" current={50} max={100} />, container)
    expect(container.textContent).toContain('50')
    expect(container.textContent).toContain('100')
  })

  it('has transition effect', () => {
    ReactDOM.render(<StatBar label="HP" current={50} max={100} />, container)
    const bars = container.querySelectorAll('div')
    let found = false
    bars.forEach(bar => {
      if (bar.style.transition?.includes('width')) found = true
    })
    expect(found).toBe(true)
  })
})
