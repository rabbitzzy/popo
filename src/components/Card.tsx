import React from 'react'

interface CardProps {
  title?: string
  children: React.ReactNode
  onClick?: () => void
  selected?: boolean
  disabled?: boolean
}

export default function Card({ title, children, onClick, selected = false, disabled = false }: CardProps) {
  return (
    <div
      onClick={onClick}
      style={{
        border: selected ? '2px solid #4ECDC4' : '1px solid #ddd',
        borderRadius: '0.5rem',
        padding: '1rem',
        backgroundColor: disabled ? '#f5f5f5' : selected ? '#e8f8f7' : '#fff',
        cursor: onClick && !disabled ? 'pointer' : 'default',
        opacity: disabled ? 0.6 : 1,
        transition: 'all 0.2s ease',
      }}
    >
      {title && <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '1.125rem' }}>{title}</h3>}
      <div>{children}</div>
    </div>
  )
}
