import React from 'react'

interface GridProps {
  columns?: number | string
  gap?: string
  children: React.ReactNode
}

export default function Grid({ columns = 'auto', gap = '1rem', children }: GridProps) {
  const gridCols = typeof columns === 'number' ? `repeat(${columns}, 1fr)` : columns

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: gridCols,
        gap,
      }}
    >
      {children}
    </div>
  )
}
