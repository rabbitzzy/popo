import { useState, useEffect } from 'react'
import { useGameStore, useParty } from '../../store/gameStore'
import { Button, Card, StatBar } from '../../components'
import { BattleResult } from '../../data/types'
import { applyXp } from '../../engine/leveling'
import { BERRYVOLUTION_LIST } from '../../data/berryvolutions'
import { computeArenaTier } from '../../data/config'
import { berrySkinSprite } from '../../data/berryVariants'

interface PostBattleProps {
  result: BattleResult
}

export default function PostBattle({ result }: PostBattleProps) {
  const setScreen = useGameStore(state => state.setScreen)
  const updateSaveState = useGameStore(state => state.updateSaveState)
  const saveGame = useGameStore(state => state.saveGame)
  const party = useParty()
  const [applied, setApplied] = useState(false)

  // Apply rewards on mount (only once)
  useEffect(() => {
    if (applied) return

    const saveState = useGameStore.getState().saveState
    const updatedParty = party.map(member => {
      const xpEarned = result.xpEarned[member.instanceId] || 0
      if (xpEarned === 0) return member

      const { member: updated } = applyXp(member, xpEarned)
      return updated
    })

    const newPoints = saveState.arena.points + result.arenaPointsChange
    const uniqueBerryvolutionCount = new Set(
      saveState.party.filter(m => m.defId !== 'berry').map(m => m.defId)
    ).size
    const newTier = computeArenaTier(newPoints, uniqueBerryvolutionCount)

    updateSaveState({
      party: updatedParty,
      arena: {
        points: newPoints,
        tier: newTier,
      },
      inventory: {
        ...saveState.inventory,
        goldDust: saveState.inventory.goldDust + result.resourcesEarned.goldDust,
        stamina: saveState.inventory.stamina + result.resourcesEarned.stamina,
      },
    })

    saveGame()
    setApplied(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const isVictory = result.outcome === 'win'

  const getDefName = (defId: string) => {
    // Handle unevolved Berry
    if (defId === 'berry') return 'Berry'
    
    const def = BERRYVOLUTION_LIST.find(d => d.id === defId) || { id: defId, name: '?' }
    return def.name
  }

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
          textAlign: 'center',
          marginBottom: '1.5rem',
        }}
      >
        <h1
          style={{
            fontSize: '1.75rem',
            fontWeight: 'bold',
            color: isVictory ? '#2d8b85' : '#d32f2f',
            margin: '0 0 0.5rem 0',
          }}
        >
          {isVictory ? '🎉 Victory!' : '😔 Defeat'}
        </h1>
        <p style={{ fontSize: '0.875rem', color: '#666', margin: 0 }}>
          Battle results below
        </p>
      </div>

      {/* Rewards card */}
      <Card style={{ marginBottom: '1.5rem', maxWidth: '600px', margin: '0 auto 1.5rem' }}>
        <div style={{ padding: '1rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem', color: '#333' }}>
            Rewards
          </h2>

          {/* Arena Points */}
          <div
            style={{
              backgroundColor: '#e8f5f3',
              border: '1px solid #2d8b85',
              borderRadius: '0.5rem',
              padding: '0.75rem',
              marginBottom: '0.75rem',
            }}
          >
            <div style={{ fontSize: '0.875rem', color: '#666' }}>Arena Points</div>
            <div
              style={{
                fontSize: '1.25rem',
                fontWeight: 'bold',
                color: result.arenaPointsChange > 0 ? '#2d8b85' : '#d32f2f',
              }}
            >
              {result.arenaPointsChange > 0 ? '+' : ''}{result.arenaPointsChange}
            </div>
          </div>

          {/* Resources */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.75rem',
              marginBottom: '1rem',
            }}
          >
            <div
              style={{
                backgroundColor: '#fff8e1',
                border: '1px solid #fbc02d',
                borderRadius: '0.5rem',
                padding: '0.75rem',
              }}
            >
              <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '0.25rem' }}>Gold Dust</div>
              <div style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#f57f17' }}>
                +{result.resourcesEarned.goldDust}
              </div>
            </div>
            <div
              style={{
                backgroundColor: '#f3e5f5',
                border: '1px solid #9c27b0',
                borderRadius: '0.5rem',
                padding: '0.75rem',
              }}
            >
              <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '0.25rem' }}>Stamina</div>
              <div style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#9c27b0' }}>
                +{result.resourcesEarned.stamina}
              </div>
            </div>
          </div>

          {/* XP section */}
          {Object.keys(result.xpEarned).length > 0 && (
            <>
              <div style={{ fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.75rem', color: '#333' }}>
                Experience Gained
              </div>
              <div style={{ display: 'grid', gap: '0.5rem' }}>
                {party.map(member => {
                  const xp = result.xpEarned[member.instanceId] || 0
                  if (xp === 0) return null

                  return (
                    <div
                      key={member.instanceId}
                      style={{
                        backgroundColor: '#fff',
                        border: '1px solid #e0e0e0',
                        borderRadius: '0.5rem',
                        padding: '0.5rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.875rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img
                          src={berrySkinSprite(member.skinId)}
                          alt={getDefName(member.defId)}
                          style={{ width: '48px', height: '48px' }}
                        />
                        <div>
                          <div style={{ fontWeight: 'bold', color: '#333' }}>
                            {getDefName(member.defId)}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#888' }}>Lv {member.level}</div>
                        </div>
                      </div>
                      <div style={{ color: '#2d8b85', fontWeight: 'bold' }}>+{xp} XP</div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Continue button */}
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <Button
          variant="primary"
          size="large"
          onClick={() => setScreen({ id: 'main-menu' })}
          style={{ width: '100%' }}
        >
          Back to Hub
        </Button>
      </div>
    </div>
  )
}
