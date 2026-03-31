import { useState } from 'react'
import { useGameStore, useParty, useInventory } from '../../store/gameStore'
import { Button, BerryvolutionCard, MoveCard, StatBar } from '../../components'
import { canEvolve, applyEvolution, getEvolutionForm } from '../../engine/evolution'
import { getUnlockedMoves, getNextUnlockingMove, xpToNextLevel } from '../../engine/leveling'
import { EvolutionStone, BerryvolutionId } from '../../data/types'
import { TRAIT_DEFINITIONS } from '../../data/config'
import { getBerryvolutionById } from '../../data/berryvolutions'

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

interface BerryvolutionDetailProps {
  instanceId: string
}

export default function BerryvolutionDetail({ instanceId }: BerryvolutionDetailProps) {
  const setScreen = useGameStore(state => state.setScreen)
  const updateSaveState = useGameStore(state => state.updateSaveState)
  const saveGame = useGameStore(state => state.saveGame)
  const party = useParty()
  const inventory = useInventory()
  const saveState = useGameStore(state => state.saveState)

  const [evolveError, setEvolveError] = useState<string | null>(null)

  const member = party.find(m => m.instanceId === instanceId)

  if (!member) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: '#888' }}>Member not found.</p>
        <Button variant="secondary" size="small" onClick={() => setScreen({ id: 'party' })}>
          ← Back to Party
        </Button>
      </div>
    )
  }

  const isBerry = member.defId === 'berry'
  const levelCap = isBerry ? 10 : 30
  const atLevelCap = member.level >= levelCap
  const xpNeeded = atLevelCap ? 0 : xpToNextLevel(member.level)

  // Moves
  const unlockedMoves = getUnlockedMoves(member.defId, member.level)
  const nextMove = getNextUnlockingMove(member.defId, member.level)

  // Trait (Berryvolutions only)
  const traitInfo = !isBerry
    ? (() => {
        const def = getBerryvolutionById(member.defId as BerryvolutionId)
        const traitDef = TRAIT_DEFINITIONS[def.trait]
        return { name: traitDef.name, description: traitDef.description }
      })()
    : null

  // Evolution eligibility (Berry only)
  const existingFormIds = party
    .filter(m => m.defId !== 'berry')
    .map(m => m.defId as BerryvolutionId)

  const eligibleStones: EvolutionStone[] = isBerry
    ? (Object.entries(inventory.evolutionStones) as [EvolutionStone, number][])
        .filter(([stone, count]) => canEvolve(member, stone, existingFormIds, count ?? 0))
        .map(([stone]) => stone)
    : []

  const handleEvolve = (stone: EvolutionStone) => {
    setEvolveError(null)
    try {
      const evolved = applyEvolution(member, stone)
      const newParty = party.map(m => (m.instanceId === instanceId ? evolved : m))

      const newStones = { ...inventory.evolutionStones }
      newStones[stone] = (newStones[stone] ?? 0) - 1

      const newBerryLog = saveState.berryLog.includes(evolved.defId as BerryvolutionId)
        ? saveState.berryLog
        : [...saveState.berryLog, evolved.defId as BerryvolutionId]

      const allCollected = newBerryLog.length === 8

      updateSaveState({
        party: newParty,
        inventory: { ...inventory, evolutionStones: newStones },
        berryLog: newBerryLog,
        ...(allCollected ? { gameWon: true } : {}),
      })
      saveGame()

      // Navigate to detail of the newly evolved member
      setScreen({ id: 'berryvolution-detail', instanceId })
    } catch {
      setEvolveError('Evolution failed. Please try again.')
    }
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
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <Button variant="secondary" size="small" onClick={() => setScreen({ id: 'party' })}>
          ← Party
        </Button>
        <h1
          style={{
            margin: 0,
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#2d8b85',
            textTransform: 'capitalize',
          }}
        >
          {member.defId === 'berry' ? 'Berry' : getBerryvolutionById(member.defId as BerryvolutionId).name}
        </h1>
      </div>

      <div style={{ maxWidth: '560px', margin: '0 auto' }}>
        {/* Full stat card */}
        <div style={{ marginBottom: '1.25rem' }}>
          <BerryvolutionCard member={member} />
        </div>

        {/* XP Progress */}
        {!atLevelCap && (
          <div
            style={{
              backgroundColor: '#fff',
              border: '1px solid #e0e0e0',
              borderRadius: '0.5rem',
              padding: '0.75rem 1rem',
              marginBottom: '1rem',
            }}
          >
            <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.375rem' }}>
              XP Progress — Lv. {member.level} → {member.level + 1}
            </div>
            <StatBar
              label="XP"
              current={member.xp}
              max={xpNeeded}
              color="#A29BFE"
            />
          </div>
        )}
        {atLevelCap && (
          <div
            style={{
              backgroundColor: '#fff',
              border: '1px solid #e0e0e0',
              borderRadius: '0.5rem',
              padding: '0.75rem 1rem',
              marginBottom: '1rem',
              textAlign: 'center',
              color: '#2d8b85',
              fontWeight: 'bold',
              fontSize: '0.875rem',
            }}
          >
            ★ Level Cap Reached ({levelCap})
          </div>
        )}

        {/* Trait (evolved only) */}
        {traitInfo && (
          <div
            style={{
              backgroundColor: '#fff',
              border: '1px solid #e0e0e0',
              borderRadius: '0.5rem',
              padding: '0.75rem 1rem',
              marginBottom: '1rem',
            }}
          >
            <div style={{ fontWeight: 'bold', fontSize: '0.875rem', color: '#333', marginBottom: '0.25rem' }}>
              Trait: {traitInfo.name}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#666' }}>{traitInfo.description}</div>
          </div>
        )}

        {/* Moves */}
        {!isBerry && (
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#333', marginBottom: '0.5rem' }}>
              Moves ({unlockedMoves.length} / 4)
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {unlockedMoves.map(move => (
                <MoveCard key={move.id} move={move} />
              ))}
            </div>
            {nextMove && (
              <div
                style={{
                  marginTop: '0.5rem',
                  fontSize: '0.8rem',
                  color: '#888',
                  padding: '0.5rem 0.75rem',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '0.375rem',
                }}
              >
                Next move unlocks at Lv. {nextMove.unlockLevel}: <strong>{nextMove.name}</strong>
              </div>
            )}
          </div>
        )}

        {/* Berry: no moves, show hint */}
        {isBerry && (
          <div
            style={{
              marginBottom: '1rem',
              padding: '0.75rem 1rem',
              backgroundColor: '#fff',
              border: '1px solid #e0e0e0',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              color: '#888',
            }}
          >
            Berry cannot use special moves. Evolve Berry to unlock a move pool.
          </div>
        )}

        {/* Evolution Section */}
        {isBerry && (
          <div
            style={{
              backgroundColor: '#fff',
              border: '1px solid #e0e0e0',
              borderRadius: '0.5rem',
              padding: '1rem',
              marginBottom: '1rem',
            }}
          >
            <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#333', marginBottom: '0.75rem' }}>
              Evolution
            </h3>
            {member.level < 10 && (
              <p style={{ color: '#888', fontSize: '0.875rem', margin: '0 0 0.5rem 0' }}>
                Berry must reach level 10 to evolve. (Currently Lv. {member.level})
              </p>
            )}
            {member.level >= 10 && eligibleStones.length === 0 && (
              <p style={{ color: '#888', fontSize: '0.875rem', margin: 0 }}>
                Berry is ready to evolve! Find Evolution Stones by exploring zones.
              </p>
            )}
            {eligibleStones.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {eligibleStones.map(stone => {
                  const targetId = getEvolutionForm(stone)
                  return (
                    <Button
                      key={stone}
                      variant="primary"
                      size="medium"
                      onClick={() => handleEvolve(stone)}
                      style={{ width: '100%' }}
                    >
                      {STONE_LABELS[stone]} Evolve with {stone}
                      {targetId && ` → ${targetId.charAt(0).toUpperCase() + targetId.slice(1)}`}
                    </Button>
                  )
                })}
              </div>
            )}
            {evolveError && (
              <p style={{ color: '#FF6B6B', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                {evolveError}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
