import React from 'react'
import styles from './Decorations.module.css'

type ItemType = 'coin' | 'potion' | 'crystal' | 'star' | 'gem' | 'flower'

const itemImages: Record<ItemType, string> = {
  coin: '/sprites/coin.svg',
  potion: '/sprites/potion.svg',
  crystal: '/sprites/crystal_orb.svg',
  star: '/sprites/star.svg',
  gem: '/sprites/gem.svg',
  flower: '/sprites/flower.svg',
}

interface ItemIconProps {
  type: ItemType
  label?: string
  count?: number
  size?: 'small' | 'medium' | 'large'
  showBadge?: boolean
}

export default function ItemIcon({
  type,
  label,
  count,
  size = 'medium',
  showBadge = true,
}: ItemIconProps) {
  const sizeMap = {
    small: 20,
    medium: 28,
    large: 40,
  }

  const pxSize = sizeMap[size]

  return (
    <div
      className={showBadge ? styles.iconBadge : undefined}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
      }}
    >
      <div
        style={{
          width: `${pxSize}px`,
          height: `${pxSize}px`,
          backgroundImage: `url('${itemImages[type]}')`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          flexShrink: 0,
        }}
      />
      {label && (
        <div style={{ fontSize: size === 'small' ? '0.75rem' : '0.875rem' }}>
          {label}
          {count !== undefined && <span style={{ fontWeight: 'bold' }}> ×{count}</span>}
        </div>
      )}
    </div>
  )
}
