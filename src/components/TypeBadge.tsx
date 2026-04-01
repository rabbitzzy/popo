import { ElementType } from '../data/types'

interface TypeBadgeProps {
  type: ElementType
  size?: 'small' | 'medium' | 'large'
}

// Background colour per type
const typeBg: Record<ElementType, string> = {
  Fire:     '#e84040',
  Water:    '#2a9d9a',
  Grass:    '#3a9a30',
  Electric: '#c49000',
  Rock:     '#7a7060',
  Ice:      '#2e8fbf',
  Psychic:  '#8855cc',
}

export default function TypeBadge({ type, size = 'medium' }: TypeBadgeProps) {
  const sizeStyles = {
    small:  { padding: '0.25rem 0.5rem',  fontSize: '0.75rem'  },
    medium: { padding: '0.375rem 0.75rem', fontSize: '0.875rem' },
    large:  { padding: '0.5rem 1rem',      fontSize: '1rem'     },
  }

  return (
    <span
      style={{
        display: 'inline-block',
        backgroundColor: typeBg[type],
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
