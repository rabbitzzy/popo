import { useState } from 'react'
import { useGameStore, useParty, useArenaStatus } from '../../store/gameStore'
import { Button, Card, BerryvolutionCard } from '../../components'
import QuestGate from '../../components/QuestGate'
import { BattleState } from '../../data/types'
import { initializeBattle } from '../../engine/battleSetup'
import { QUEST_CONFIG } from '../../data/questConfig'

export default function TeamBuilder() {
  const setScreen = useGameStore(state => state.setScreen)
  const setBattleState = useGameStore(state => state.setBattleState)
  const party = useParty()
  const arena = useArenaStatus()

  const [selectedInstanceIds, setSelectedInstanceIds] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [questPending, setQuestPending] = useState(false)

  const isSelected = (instanceId: string) => selectedInstanceIds.includes(instanceId)

  const toggleSelection = (instanceId: string) => {
    if (isSelected(instanceId)) {
      setSelectedInstanceIds(selectedInstanceIds.filter(id => id !== instanceId))
      setError(null)
    } else {
      if (selectedInstanceIds.length >= 2) {
        setError('Maximum 2 team members allowed')
        return
      }
      setSelectedInstanceIds([...selectedInstanceIds, instanceId])
      setError(null)
    }
  }

  const doStartBattle = () => {
    const selectedParty = party.filter(m => selectedInstanceIds.includes(m.instanceId))
    try {
      const battleState: BattleState = initializeBattle(selectedParty, arena.tier)
      setBattleState(battleState)
      setScreen({ id: 'battle', battleState })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start battle')
    }
  }

  const handleStartBattle = () => {
    if (selectedInstanceIds.length === 0) {
      setError('Select at least 1 team member')
      return
    }
    if (Math.random() < QUEST_CONFIG.gateBattle) {
      setQuestPending(true)
    } else {
      doStartBattle()
    }
  }

  if (party.length === 0) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#f0f9f8',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Card>
          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#333', margin: '0 0 0.5rem 0' }}>
              No Party Members
            </h2>
            <p style={{ fontSize: '1rem', color: '#555', margin: '0 0 1.5rem 0' }}>
              You need at least one Berryvolution to battle in the Arena.
            </p>
            <Button
              variant="secondary"
              size="medium"
              onClick={() => setScreen({ id: 'main-menu' })}
              style={{ width: '100%' }}
            >
              Back to Hub
            </Button>
          </div>
        </Card>
      </div>
    )
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
          marginBottom: '1.25rem',
        }}
      >
        <Button variant="secondary" size="small" onClick={() => setScreen({ id: 'main-menu' })}>
          ← Back
        </Button>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: '#2d8b85' }}>
          Team Builder
        </h1>
      </div>

      {/* Arena info */}
      <div
        style={{
          backgroundColor: '#fff',
          border: '1px solid #e0e0e0',
          borderRadius: '0.5rem',
          padding: '0.75rem 1rem',
          marginBottom: '1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <span style={{ color: '#666', fontSize: '0.875rem' }}>Current Tier: </span>
          <strong style={{ color: '#2d8b85', fontSize: '1rem' }}>★ {arena.tier}</strong>
        </div>
        <div>
          <span style={{ color: '#666', fontSize: '0.875rem' }}>Arena Points: </span>
          <strong style={{ color: '#333', fontSize: '1rem' }}>{arena.points}</strong>
        </div>
      </div>

      {/* Instructions */}
      <div
        style={{
          backgroundColor: '#fff',
          border: '1px solid #e0e0e0',
          borderRadius: '0.5rem',
          padding: '0.75rem 1rem',
          marginBottom: '1rem',
          fontSize: '0.875rem',
          color: '#555',
        }}
      >
        Select 1–2 team members for battle. Click to toggle selection.
      </div>

      {/* Team members grid */}
      <div style={{ maxWidth: '800px', margin: '0 auto 1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#333', marginBottom: '0.75rem' }}>
          Your Party ({selectedInstanceIds.length} / 2 selected)
        </h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '0.75rem',
            marginBottom: '1rem',
          }}
        >
          {party.map(member => (
            <div
              key={member.instanceId}
              onClick={() => toggleSelection(member.instanceId)}
              style={{ cursor: 'pointer' }}
            >
              <BerryvolutionCard
                member={member}
                selected={isSelected(member.instanceId)}
                compact
              />
            </div>
          ))}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div
          style={{
            backgroundColor: '#ffebee',
            border: '1px solid #ff6b6b',
            borderRadius: '0.5rem',
            padding: '0.75rem 1rem',
            marginBottom: '1rem',
            color: '#d32f2f',
            fontSize: '0.875rem',
            textAlign: 'center',
          }}
        >
          {error}
        </div>
      )}

      {/* Battle button */}
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <Button
          variant="primary"
          size="large"
          onClick={handleStartBattle}
          disabled={selectedInstanceIds.length === 0}
          style={{ width: '100%' }}
        >
          Start Battle
        </Button>
      </div>

      {/* Quest gate overlay */}
      {questPending && (
        <QuestGate
          questContext="battle"
          actionLabel={`Before you enter the ${arena.tier} Arena…`}
          onPass={() => { setQuestPending(false); doStartBattle() }}
          onFail={() => setQuestPending(false)}
        />
      )}
    </div>
  )
}
