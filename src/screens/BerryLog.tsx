import { useGameStore, useBerryLog } from '../store/gameStore'
import { Button, TypeBadge } from '../components'
import { BERRYVOLUTION_LIST } from '../data/berryvolutions'
import { TRAIT_DEFINITIONS } from '../data/config'
import { BerryvolutionId } from '../data/types'

const STONE_SPRITES: Record<string, string> = {
  'Water Stone':   '/sprites/stone-water.svg',
  'Thunder Stone': '/sprites/stone-thunder.svg',
  'Fire Stone':    '/sprites/stone-fire.svg',
  'Sun Shard':     '/sprites/stone-sun.svg',
  'Moon Shard':    '/sprites/stone-moon.svg',
  'Leaf Stone':    '/sprites/stone-leaf.svg',
  'Ice Stone':     '/sprites/stone-ice.svg',
  'Ribbon Shard':  '/sprites/stone-ribbon.svg',
}

export default function BerryLog() {
  const setScreen = useGameStore(state => state.setScreen)
  const berryLog = useBerryLog()

  const collected = berryLog.length
  const total = BERRYVOLUTION_LIST.length

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
          marginBottom: '1.25rem',
        }}
      >
        <Button variant="secondary" size="small" onClick={() => setScreen({ id: 'main-menu' })}>
          ← Back
        </Button>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: '#2d8b85' }}>
          Berry Log
        </h1>
      </div>

      {/* Progress Summary */}
      <div
        style={{
          backgroundColor: '#fff',
          border: '1px solid #e0e0e0',
          borderRadius: '0.5rem',
          padding: '0.75rem 1rem',
          marginBottom: '1.25rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.5rem',
          }}
        >
          <span style={{ fontWeight: 'bold', color: '#333' }}>
            {collected} / {total} Berryvolutions Collected
          </span>
          {collected === total && (
            <span style={{ color: '#FFC107', fontWeight: 'bold' }}>🏆 Complete!</span>
          )}
        </div>
        <div
          style={{
            height: '0.5rem',
            backgroundColor: '#e0e0e0',
            borderRadius: '9999px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${(collected / total) * 100}%`,
              backgroundColor: '#4ECDC4',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </div>

      {/* Entry Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: '0.75rem',
        }}
      >
        {BERRYVOLUTION_LIST.map(def => {
          const isCollected = berryLog.includes(def.id as BerryvolutionId)
          const traitDef = TRAIT_DEFINITIONS[def.trait]

          return (
            <div
              key={def.id}
              style={{
                backgroundColor: isCollected ? '#fff' : '#f5f5f5',
                border: isCollected ? '1px solid #c8eae8' : '1px solid #ddd',
                borderRadius: '0.5rem',
                padding: '1rem',
                opacity: isCollected ? 1 : 0.75,
              }}
            >
              {/* Name row */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.5rem',
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    color: isCollected ? '#2d8b85' : '#aaa',
                  }}
                >
                  {isCollected ? def.name : '???'}
                </h3>
                {isCollected ? (
                  <TypeBadge type={def.type} size="small" />
                ) : (
                  <span
                    style={{
                      fontSize: '0.75rem',
                      color: '#888',
                      padding: '0.2rem 0.5rem',
                      border: '1px solid #ccc',
                      borderRadius: '0.25rem',
                    }}
                  >
                    ???
                  </span>
                )}
              </div>

              {/* Stone hint — always shown */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.8rem',
                  color: isCollected ? '#555' : '#999',
                  marginBottom: isCollected ? '0.5rem' : 0,
                }}
              >
                {STONE_SPRITES[def.evolutionStone] && (
                  <img
                    src={STONE_SPRITES[def.evolutionStone]}
                    width={22}
                    height={22}
                    alt={def.evolutionStone}
                    style={{ imageRendering: 'pixelated', flexShrink: 0 }}
                  />
                )}
                <span>
                  {isCollected ? '✓ ' : ''}<strong>{def.evolutionStone}</strong>
                </span>
              </div>

              {/* Trait — collected only */}
              {isCollected && (
                <div
                  style={{
                    marginTop: '0.5rem',
                    padding: '0.5rem 0.625rem',
                    backgroundColor: '#f0f9f8',
                    borderRadius: '0.375rem',
                    fontSize: '0.8rem',
                  }}
                >
                  <div style={{ fontWeight: 'bold', color: '#2d8b85', marginBottom: '0.2rem' }}>
                    {traitDef.name}
                  </div>
                  <div style={{ color: '#555', lineHeight: 1.4 }}>{traitDef.description}</div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
