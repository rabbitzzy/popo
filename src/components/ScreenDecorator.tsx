import React from 'react'
import styles from './Decorations.module.css'

interface ScreenDecoratorProps {
  children: React.ReactNode
  hasDecorations?: boolean
  cornerStyle?: 'flowers' | 'nature' | 'gems' | 'minimal'
  className?: string
}

export default function ScreenDecorator({
  children,
  hasDecorations = true,
  cornerStyle = 'nature',
  className = '',
}: ScreenDecoratorProps) {
  const decorationUrls = {
    flowers: '/sprites/flower.svg',
    nature: '/sprites/grass.svg',
    gems: '/sprites/gem.svg',
    minimal: '/sprites/star.svg',
  }

  return (
    <div
      className={`${styles.pixelBackground} ${className}`}
      style={{
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Corner decorations */}
      {hasDecorations && (
        <>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: 32,
              height: 32,
              opacity: 0.4,
              pointerEvents: 'none',
              backgroundImage: `url('/sprites/flower.svg')`,
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
            }}
          />
          <div
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              width: 32,
              height: 32,
              opacity: 0.4,
              pointerEvents: 'none',
              backgroundImage: `url('/sprites/tree.svg')`,
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              transform: 'scaleX(-1)',
            }}
          />
          <div
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              width: 32,
              height: 32,
              opacity: 0.3,
              pointerEvents: 'none',
              backgroundImage: `url('/sprites/grass.svg')`,
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              transform: 'scaleY(-1)',
            }}
          />
          <div
            style={{
              position: 'fixed',
              bottom: 0,
              right: 0,
              width: 32,
              height: 32,
              opacity: 0.3,
              pointerEvents: 'none',
              backgroundImage: `url('/sprites/gem.svg')`,
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              transform: 'scaleX(-1)',
            }}
          />
        </>
      )}

      {/* Main content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </div>
  )
}
