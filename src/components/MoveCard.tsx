import { MoveDefinition } from '../data/types'
import TypeBadge from './TypeBadge'

interface MoveCardProps {
  move: MoveDefinition
  currentNrg?: number
  onClick?: () => void
  selected?: boolean
  disabled?: boolean
}

export default function MoveCard({ move, currentNrg = Infinity, onClick, selected = false, disabled = false }: MoveCardProps) {
  const canAfford = currentNrg >= move.nrgCost
  const isClickable = !disabled && canAfford

  return (
    <div
      onClick={isClickable ? onClick : undefined}
      style={{
        border: selected ? '2px solid #4ECDC4' : '1px solid #ddd',
        borderRadius: '0.5rem',
        padding: '0.75rem',
        backgroundColor: disabled ? '#f5f5f5' : selected ? '#e8f8f7' : '#fff',
        cursor: isClickable ? 'pointer' : 'not-allowed',
        opacity: disabled ? 0.6 : 1,
        transition: 'all 0.2s ease',
        userSelect: 'none',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <h4 style={{ margin: 0, fontSize: '1rem' }}>{move.name}</h4>
        <TypeBadge type={move.type} size="small" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
        <div>
          <span style={{ color: '#666' }}>Power:</span> <strong>{move.power}</strong>
        </div>
        <div>
          <span style={{ color: '#666' }}>NRG Cost:</span> <strong>{move.nrgCost}</strong>
        </div>
        <div>
          <span style={{ color: '#666' }}>Category:</span> <strong>{move.category}</strong>
        </div>
        <div>
          <span style={{ color: '#666' }}>Accuracy:</span> <strong>{move.accuracy}%</strong>
        </div>
      </div>

      {move.effect && (
        <div
          style={{
            fontSize: '0.8rem',
            color: '#666',
            padding: '0.5rem',
            backgroundColor: '#f9f9f9',
            borderRadius: '0.25rem',
            marginBottom: '0.5rem',
          }}
        >
          {move.effect.status && <div>Effect: {move.effect.status}</div>}
          {move.effect.statMod && (
            <div>
              Stat: {move.effect.statMod.stat} {move.effect.statMod.delta > 0 ? '+' : ''}{move.effect.statMod.delta}%
            </div>
          )}
        </div>
      )}

      {!canAfford && <div style={{ fontSize: '0.8rem', color: '#FF6B6B', fontWeight: 'bold' }}>Not enough NRG!</div>}
    </div>
  )
}
