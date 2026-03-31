import { useGameStore, useParty, useInventory } from '../../store/gameStore'
import { Button, BerryvolutionCard } from '../../components'
import { EvolutionStone } from '../../data/types'

const STONE_LABELS: Record<EvolutionStone, string> = {
  'Water Stone': '💧',
  'Thunder Stone': '⚡',
  'Fire Stone': '🔥',
  'Sun Shard': '☀️',
  'Moon Shard': '🌙',
  'Leaf Stone': '🍃',
  'Ice Stone': '❄️',
  'Ribbon Shard': '🎀',
}

export default function PartyScreen() {
  const setScreen = useGameStore(state => state.setScreen)
  const party = useParty()
  const inventory = useInventory()

  const ownedStones = (Object.entries(inventory.evolutionStones) as [EvolutionStone, number][]).filter(
    ([, count]) => (count ?? 0) > 0
  )

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f0f9f8',
        padding: '1.5rem',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <Button variant="secondary" size="small" onClick={() => setScreen({ id: 'main-menu' })}>
          ← Back
        </Button>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: '#2d8b85' }}>
          Party
        </h1>
      </div>

      {/* Inventory Strip */}
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          marginBottom: '1.5rem',
          padding: '0.75rem 1rem',
          backgroundColor: '#fff',
          borderRadius: '0.5rem',
          border: '1px solid #e0e0e0',
          fontSize: '0.875rem',
          color: '#555',
        }}
      >
        <span>🔮 {inventory.crystalOrbs} Orbs</span>
        <span>✨ {inventory.goldDust} Gold Dust</span>
        <span>⚡ {inventory.stamina} Stamina</span>
        {ownedStones.map(([stone, count]) => (
          <span key={stone}>
            {STONE_LABELS[stone]} {stone} ×{count}
          </span>
        ))}
        {ownedStones.length === 0 && (
          <span style={{ color: '#aaa' }}>No evolution stones</span>
        )}
      </div>

      {/* Party Grid */}
      {party.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#888', padding: '2rem' }}>
          No party members.
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: '0.75rem',
          }}
        >
          {party.map(member => (
            <BerryvolutionCard
              key={member.instanceId}
              member={member}
              compact
              onClick={() => setScreen({ id: 'berryvolution-detail', instanceId: member.instanceId })}
            />
          ))}
        </div>
      )}
    </div>
  )
}
