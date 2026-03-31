import { useGameStore, useArenaStatus } from '../../store/gameStore'
import { Button, Card } from '../../components'
import { ARENA_TIERS } from '../../data/config'

const TIER_ORDER = ['Bronze', 'Silver', 'Gold', 'Crystal', 'Apex'] as const

export default function ArenaLadder() {
  const setScreen = useGameStore(state => state.setScreen)
  const arena = useArenaStatus()
  const party = useGameStore(state => state.saveState.party)

  // Check if all 8 Berryvolutions are collected (for Apex requirement)
  const uniqueBerryvolutions = new Set(
    party.filter(m => m.defId !== 'berry').map(m => m.defId)
  )
  const hasAllBerryvolutions = uniqueBerryvolutions.size === 8

  const getCurrentTierIndex = () => {
    return TIER_ORDER.indexOf(arena.tier as typeof TIER_ORDER[number])
  }

  const getTierConfig = (tierName: string) => {
    return Object.values(ARENA_TIERS).find(t => t.tier === tierName)
  }

  const getPointsToNextTier = (currentTier: string): number | null => {
    const tierIndex = TIER_ORDER.indexOf(currentTier as typeof TIER_ORDER[number])
    if (tierIndex === 4) return null // Apex is highest

    const nextTier = TIER_ORDER[tierIndex + 1]
    const nextConfig = getTierConfig(nextTier)
    if (!nextConfig) return null

    return Math.max(0, nextConfig.pointsRequired - arena.points)
  }

  const isApexUnlocked = () => {
    const apexConfig = getTierConfig('Apex')
    if (!apexConfig) return false
    return arena.points >= apexConfig.pointsRequired && hasAllBerryvolutions
  }

  const currentTierIndex = getCurrentTierIndex()

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
          Arena Rankings
        </h1>
      </div>

      {/* Current status card */}
      <Card style={{ marginBottom: '1.5rem', maxWidth: '600px', margin: '0 auto 1.5rem' }}>
        <div style={{ padding: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.25rem' }}>
                Current Tier
              </div>
              <div
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: '#2d8b85',
                }}
              >
                ★ {arena.tier}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.25rem' }}>
                Arena Points
              </div>
              <div
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: '#333',
                }}
              >
                {arena.points}
              </div>
            </div>
          </div>

          {/* Next tier info */}
          {currentTierIndex < 4 && (
            <div
              style={{
                marginTop: '1rem',
                paddingTop: '1rem',
                borderTop: '1px solid #e0e0e0',
                fontSize: '0.875rem',
                color: '#555',
              }}
            >
              <div style={{ marginBottom: '0.25rem' }}>
                {getPointsToNextTier(arena.tier)} points to {TIER_ORDER[currentTierIndex + 1]}
              </div>
            </div>
          )}

          {/* Apex requirement note */}
          {currentTierIndex === 4 && (
            <div
              style={{
                marginTop: '1rem',
                paddingTop: '1rem',
                borderTop: '1px solid #e0e0e0',
                fontSize: '0.875rem',
                color: '#2d8b85',
                fontWeight: 'bold',
              }}
            >
              ✓ Apex tier unlocked
            </div>
          )}
        </div>
      </Card>

      {/* Tier progression */}
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#333', marginBottom: '1rem' }}>
          Tier Progression
        </h2>
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {TIER_ORDER.map((tierName, index) => {
            const config = getTierConfig(tierName)
            const isCurrentTier = arena.tier === tierName
            const isBelowCurrent = index < currentTierIndex
            const isApex = tierName === 'Apex'
            const apexLocked = isApex && !hasAllBerryvolutions

            return (
              <Card
                key={tierName}
                style={{
                  opacity: apexLocked ? 0.6 : 1,
                  cursor: 'default',
                }}
              >
                <div
                  style={{
                    padding: '1rem',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '1rem',
                    alignItems: 'center',
                  }}
                >
                  {/* Left side: Tier info */}
                  <div>
                    <div
                      style={{
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        color: isCurrentTier ? '#2d8b85' : '#333',
                        marginBottom: '0.25rem',
                      }}
                    >
                      {isCurrentTier && '● '}{tierName}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#666' }}>
                      {config?.pointsRequired || 0} points{isApex && apexLocked ? ' + all 8 Berryvolutions' : ''}
                    </div>
                  </div>

                  {/* Right side: Status */}
                  <div style={{ textAlign: 'right' }}>
                    {isCurrentTier && (
                      <div style={{ fontSize: '0.875rem', color: '#2d8b85', fontWeight: 'bold' }}>
                        Active
                      </div>
                    )}
                    {isBelowCurrent && (
                      <div style={{ fontSize: '0.875rem', color: '#4caf50', fontWeight: 'bold' }}>
                        ✓ Achieved
                      </div>
                    )}
                    {!isCurrentTier && !isBelowCurrent && (
                      <div style={{ fontSize: '0.875rem', color: '#999' }}>
                        {apexLocked ? '🔒 Locked' : 'Locked'}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Apex note */}
      {!hasAllBerryvolutions && (
        <div
          style={{
            maxWidth: '600px',
            margin: '1.5rem auto 0',
            backgroundColor: '#fff3e0',
            border: '1px solid #ff9800',
            borderRadius: '0.5rem',
            padding: '0.75rem 1rem',
            fontSize: '0.875rem',
            color: '#e65100',
          }}
        >
          <strong>Apex Requirement:</strong> Reach 2000 points AND collect all 8 Berryvolutions (currently {uniqueBerryvolutions.size}/8)
        </div>
      )}
    </div>
  )
}
