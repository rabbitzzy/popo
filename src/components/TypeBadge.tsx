import { ElementType } from '../data/types'

interface TypeBadgeProps {
  type: ElementType
  size?: 'small' | 'medium' | 'large'
}

// Type color mapping
const typeColors: Record<ElementType, string> = {
  Fire: '#FF6B6B',
  Water: '#4ECDC4',
  Grass: '#95E77D',
  Electric: '#FFE66D',
  Rock: '#A0A0A0',
  Ice: '#A0E7E5',
  Psychic: '#D4B8FF',
}

export default function TypeBadge({ type, size = 'medium' }: TypeBadgeProps) {
  const sizeStyles = {
    small: { padding: '0.25rem 0.5rem', fontSize: '0.75rem' },
    medium: { padding: '0.375rem 0.75rem', fontSize: '0.875rem' },
    large: { padding: '0.5rem 1rem', fontSize: '1rem' },
  }

  return (
    <span
      style={{
        display: 'inline-block',
        backgroundColor: typeColors[type],
        color: '#fff',
        borderRadius: '0.25rem',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        ...sizeStyles[size],
      }}
    >
      {type}
    </span>
  )
}
