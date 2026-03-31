import { useState } from 'react'
import { useGameStore, useParty } from '../../store/gameStore'
import { Button, Card, Sprite } from '../../components'
import { StatBar } from '../../components'
import { ZoneDef, PartyMember } from '../../data/types'

interface EncounterScreenProps {
  zone: ZoneDef
  wildBerry: PartyMember
}

export default function EncounterScreen({ zone, wildBerry }: EncounterScreenProps) {
  const setScreen = useGameStore(state => state.setScreen)
  const updateSaveState = useGameStore(state => state.updateSaveState)
  const saveGame = useGameStore(state => state.saveGame)
  const party = useParty()
  const saveState = useGameStore(state => state.saveState)

  const [captured, setCaptured] = useState(false)

  const handleCapture = () => {
    const newParty = [...party, wildBerry]
    updateSaveState({ party: newParty })
    saveGame()
    setCaptured(true)
  }

  const handleFlee = () => {
    setScreen({ id: 'zone-select' })
  }

  if (captured) {
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
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2d8b85', margin: '0 0 0.5rem 0' }}>
              🎉 Captured!
            </h2>
            <p style={{ fontSize: '1rem', color: '#555', margin: '0 0 1.5rem 0' }}>
              A wild Berry has joined your party!
            </p>
            <Button
              variant="primary"
              size="medium"
              onClick={() => setScreen({ id: 'zone-select' })}
              style={{ width: '100%', marginBottom: '0.5rem' }}
            >
              Continue Exploring
            </Button>
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
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: '#2d8b85' }}>
          Wild Encounter
        </h1>
        <span style={{ fontSize: '0.875rem', color: '#888', marginLeft: 'auto' }}>
          {zone.name}
        </span>
      </div>

      {/* Center content */}
      <div style={{ maxWidth: '480px', margin: '0 auto' }}>
        {/* Encounter message */}
        <div
          style={{
            backgroundColor: '#fff',
            border: '1px solid #e0e0e0',
            borderRadius: '0.5rem',
            padding: '1rem',
            marginBottom: '1rem',
            textAlign: 'center',
            fontSize: '1rem',
            color: '#555',
          }}
        >
          A wild Berry appeared!
        </div>

        {/* Wild Berry stats */}
        <Card>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ height: '80px', flexShrink: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Sprite
                spriteUrl={`/sprites/${wildBerry.defId}.svg`}
                alt="Wild Berry"
                size="lg"
              />
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ margin: '0 0 0.25rem 0', fontSize: '1.25rem', fontWeight: 'bold', color: '#2d8b85' }}>
                Berry
              </h2>
              <div style={{ fontSize: '0.875rem', color: '#666' }}>
                Lv. {wildBerry.level}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div style={{ marginBottom: '0.75rem' }}>
            <StatBar label="HP" current={wildBerry.currentStats.hp} max={wildBerry.maxHp} color="#FF6B6B" />
            <StatBar label="ATK" current={wildBerry.currentStats.atk} max={wildBerry.currentStats.atk} color="#FFE66D" showValues={false} />
            <StatBar label="DEF" current={wildBerry.currentStats.def} max={wildBerry.currentStats.def} color="#95E77D" showValues={false} />
            <StatBar label="SPD" current={wildBerry.currentStats.spd} max={wildBerry.currentStats.spd} color="#4ECDC4" showValues={false} />
            <StatBar label="NRG" current={wildBerry.currentStats.nrg} max={wildBerry.currentStats.nrg} color="#A0E7E5" showValues={false} />
          </div>

          {/* Info */}
          <div style={{ fontSize: '0.875rem', color: '#666' }}>
            <p style={{ margin: '0.5rem 0' }}>
              This Berry is unevolved and ready to be trained.
            </p>
            <p style={{ margin: '0 0 0.5rem 0' }}>
              Current party: <strong>{party.length}</strong> member{party.length !== 1 ? 's' : ''}
            </p>
          </div>
        </Card>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
          <Button
            variant="primary"
            size="large"
            onClick={handleCapture}
            style={{ flex: 1 }}
          >
            Capture
          </Button>
          <Button
            variant="secondary"
            size="large"
            onClick={handleFlee}
            style={{ flex: 1 }}
          >
            Flee
          </Button>
        </div>
      </div>
    </div>
  )
}
