import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import React from 'react'
import ReactDOM from 'react-dom'
import ConfirmDialog from './ConfirmDialog'

describe('ConfirmDialog', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(container)
    document.body.removeChild(container)
  })

  it('renders title', () => {
    const handleConfirm = vi.fn()
    const handleCancel = vi.fn()
    ReactDOM.render(
      <ConfirmDialog
        title="Confirm"
        message="Are you sure?"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />,
      container
    )
    expect(container.textContent).toContain('Confirm')
  })

  it('renders message', () => {
    const handleConfirm = vi.fn()
    const handleCancel = vi.fn()
    ReactDOM.render(
      <ConfirmDialog
        title="Confirm"
        message="Are you sure?"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />,
      container
    )
    expect(container.textContent).toContain('Are you sure?')
  })

  it('renders buttons', () => {
    const handleConfirm = vi.fn()
    const handleCancel = vi.fn()
    ReactDOM.render(
      <ConfirmDialog
        title="Confirm"
        message="Test"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />,
      container
    )
    expect(container.querySelectorAll('button').length).toBe(2)
  })

  it('calls onConfirm when confirm button clicked', () => {
    const handleConfirm = vi.fn()
    const handleCancel = vi.fn()
    ReactDOM.render(
      <ConfirmDialog
        title="Confirm"
        message="Test"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />,
      container
    )
    const buttons = container.querySelectorAll('button')
    const confirmButton = buttons[1] as HTMLButtonElement
    confirmButton.click()
    expect(handleConfirm).toHaveBeenCalled()
  })

  it('calls onCancel when cancel button clicked', () => {
    const handleConfirm = vi.fn()
    const handleCancel = vi.fn()
    ReactDOM.render(
      <ConfirmDialog
        title="Confirm"
        message="Test"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />,
      container
    )
    const buttons = container.querySelectorAll('button')
    const cancelButton = buttons[0] as HTMLButtonElement
    cancelButton.click()
    expect(handleCancel).toHaveBeenCalled()
  })

  it('calls onCancel when backdrop clicked', () => {
    const handleConfirm = vi.fn()
    const handleCancel = vi.fn()
    ReactDOM.render(
      <ConfirmDialog
        title="Confirm"
        message="Test"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />,
      container
    )
    const backdrop = container.querySelector('div') as HTMLDivElement
    backdrop.click()
    expect(handleCancel).toHaveBeenCalled()
  })

  it('renders custom button text', () => {
    const handleConfirm = vi.fn()
    const handleCancel = vi.fn()
    ReactDOM.render(
      <ConfirmDialog
        title="Confirm"
        message="Test"
        confirmText="Delete"
        cancelText="Keep"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />,
      container
    )
    expect(container.textContent).toContain('Delete')
    expect(container.textContent).toContain('Keep')
  })

  it('renders default button text', () => {
    const handleConfirm = vi.fn()
    const handleCancel = vi.fn()
    ReactDOM.render(
      <ConfirmDialog
        title="Confirm"
        message="Test"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />,
      container
    )
    expect(container.textContent).toContain('Confirm')
    expect(container.textContent).toContain('Cancel')
  })

  it('applies dangerous styling when isDangerous is true', () => {
    const handleConfirm = vi.fn()
    const handleCancel = vi.fn()
    ReactDOM.render(
      <ConfirmDialog
        title="Confirm"
        message="Delete?"
        isDangerous={true}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />,
      container
    )
    const buttons = container.querySelectorAll('button')
    const confirmButton = buttons[1] as HTMLButtonElement
    expect(confirmButton.style.backgroundColor).toBe('rgb(255, 107, 107)')
  })

  it('applies normal styling when isDangerous is false', () => {
    const handleConfirm = vi.fn()
    const handleCancel = vi.fn()
    ReactDOM.render(
      <ConfirmDialog
        title="Confirm"
        message="Proceed?"
        isDangerous={false}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />,
      container
    )
    const buttons = container.querySelectorAll('button')
    const confirmButton = buttons[1] as HTMLButtonElement
    expect(confirmButton.style.backgroundColor).toBe('rgb(78, 205, 196)')
  })

  it('has fixed positioning backdrop', () => {
    const handleConfirm = vi.fn()
    const handleCancel = vi.fn()
    ReactDOM.render(
      <ConfirmDialog
        title="Confirm"
        message="Test"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />,
      container
    )
    const backdrop = container.querySelector('div') as HTMLDivElement
    expect(backdrop.style.position).toBe('fixed')
  })
})
