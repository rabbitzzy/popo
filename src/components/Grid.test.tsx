import { describe, it, expect, beforeEach, afterEach } from 'vitest'

import ReactDOM from 'react-dom'
import Grid from './Grid'

describe('Grid', () => {
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
    ReactDOM.render(
      <Grid>
        <div>Item 1</div>
        <div>Item 2</div>
      </Grid>,
      container
    )
    expect(container.textContent).toContain('Item 1')
    expect(container.textContent).toContain('Item 2')
  })

  it('applies display grid', () => {
    ReactDOM.render(<Grid><div>Item</div></Grid>, container)
    const grid = container.querySelector('div') as HTMLDivElement
    expect(grid.style.display).toBe('grid')
  })

  it('applies default column auto', () => {
    ReactDOM.render(<Grid><div>Item</div></Grid>, container)
    const grid = container.querySelector('div') as HTMLDivElement
    expect(grid.style.gridTemplateColumns).toBe('auto')
  })

  it('applies numeric columns as repeat', () => {
    ReactDOM.render(<Grid columns={3}><div>Item</div></Grid>, container)
    const grid = container.querySelector('div') as HTMLDivElement
    expect(grid.style.gridTemplateColumns).toBe('repeat(3, 1fr)')
  })

  it('applies string columns directly', () => {
    ReactDOM.render(<Grid columns="1fr 2fr"><div>Item</div></Grid>, container)
    const grid = container.querySelector('div') as HTMLDivElement
    expect(grid.style.gridTemplateColumns).toBe('1fr 2fr')
  })

  it('applies default gap 1rem', () => {
    ReactDOM.render(<Grid><div>Item</div></Grid>, container)
    const grid = container.querySelector('div') as HTMLDivElement
    expect(grid.style.gap).toBe('1rem')
  })

  it('applies custom gap', () => {
    ReactDOM.render(<Grid gap="2rem"><div>Item</div></Grid>, container)
    const grid = container.querySelector('div') as HTMLDivElement
    expect(grid.style.gap).toBe('2rem')
  })

  it('combines columns and gap', () => {
    ReactDOM.render(<Grid columns={2} gap="0.5rem"><div>Item</div></Grid>, container)
    const grid = container.querySelector('div') as HTMLDivElement
    expect(grid.style.gridTemplateColumns).toBe('repeat(2, 1fr)')
    expect(grid.style.gap).toBe('0.5rem')
  })

  it('renders multiple children', () => {
    ReactDOM.render(
      <Grid columns={2}>
        <div>1</div>
        <div>2</div>
        <div>3</div>
        <div>4</div>
      </Grid>,
      container
    )
    const divs = container.querySelectorAll('div')
    expect(divs.length).toBeGreaterThanOrEqual(5)
  })
})
