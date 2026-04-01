import { useState } from 'react'
import { useGameStore, useArenaStatus, useBerryLog, useParty } from '../store/gameStore'
import { Button, Card, ConfirmDialog } from '../components'
import { importSave, exportSave } from '../engine/save'
import { computeStats } from '../engine/leveling'
import { STARTING_RESOURCES } from '../data/config'

export default function MainMenu() {
  const setScreen = useGameStore(state => state.setScreen)
  const createNewGame = useGameStore(state => state.createNewGame)
  const saveGame = useGameStore(state => state.saveGame)
  const updateSaveState = useGameStore(state => state.updateSaveState)
  const saveState = useGameStore(state => state.saveState)
  const arena = useArenaStatus()
  const berryLog = useBerryLog()
  const party = useParty()

  const [showNewGameConfirm, setShowNewGameConfirm] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)

  const hasActiveGame = party.length > 0

  const tierColors: Record<string, string> = {
    Bronze: '#CD7F32',
    Silver: '#9E9E9E',
    Gold: '#FFC107',
    Crystal: '#4ECDC4',
    Apex: '#9B59B6',
  }

  const startNewGame = () => {
    createNewGame()
    const berryStats = computeStats('berry', 1)
    updateSaveState({
      party: [{
        instanceId: `berry-${Date.now()}`,
        defId: 'berry',
        level: 1,
        xp: 0,
        currentStats: berryStats,
        maxHp: berryStats.hp,
        unlockedMoveIds: [],
      }],
      inventory: {
        crystalOrbs: STARTING_RESOURCES.crystalOrbs,
        goldDust: STARTING_RESOURCES.goldDust,
        stamina: STARTING_RESOURCES.stamina,
        evolutionStones: {},
      },
    })
    saveGame()
    setScreen({ id: 'tutorial' })
  }

  const handleNewGame = () => {
    if (hasActiveGame) {
      setShowNewGameConfirm(true)
    } else {
      startNewGame()
    }
  }

  const handleConfirmNewGame = () => {
    setShowNewGameConfirm(false)
    startNewGame()
  }

  const handleImport = () => {
    setImportError(null)
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      try {
        const imported = await importSave(file)
        updateSaveState(imported)
        saveGame()
      } catch (err) {
        setImportError(err instanceof Error ? err.message : 'Failed to import save.')
      }
    }
    input.click()
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f0f9f8',
        padding: '2rem',
      }}
    >
      {/* Title Block */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1
          style={{
            fontSize: '2.75rem',
            fontWeight: 'bold',
            color: '#2d8b85',
            margin: '0 0 0.5rem 0',
            letterSpacing: '-0.02em',
          }}
        >
          Berry's Evolution
        </h1>
        <p style={{ color: '#666', fontSize: '1.125rem', margin: 0 }}>
          Collect all 8 evolutions. Conquer the Arena.
        </p>
      </div>

      {/* Main Content */}
      <div style={{ width: '100%', maxWidth: '560px' }}>
        {!hasActiveGame ? (
          /* ── No Active Game ── */
          <Card>
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <p style={{ color: '#555', marginBottom: '1.5rem', fontSize: '1rem', margin: '0 0 1.5rem 0' }}>
                Begin your journey with Berry, the unevolved companion.
              </p>
              <Button
                variant="primary"
                size="large"
                onClick={handleNewGame}
                style={{ width: '100%', marginBottom: '0.75rem' }}
              >
                New Game
              </Button>
              <Button
                variant="secondary"
                size="medium"
                onClick={handleImport}
                style={{ width: '100%' }}
              >
                Import Save
              </Button>
              {importError && (
                <p style={{ color: '#FF6B6B', fontSize: '0.875rem', marginTop: '0.75rem', marginBottom: 0 }}>
                  {importError}
                </p>
              )}
            </div>
          </Card>
        ) : (
          /* ── Active Game: Hub ── */
          <>
            {/* Progress Summary */}
            <div style={{ marginBottom: '1rem' }}>
              <Card>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.75rem',
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontWeight: 'bold',
                        color: tierColors[arena.tier] || '#4ECDC4',
                        fontSize: '1.125rem',
                      }}
                    >
                      ★ {arena.tier} Tier
                    </div>
                    <div style={{ color: '#666', fontSize: '0.875rem' }}>
                      {arena.points} Arena Points
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '1.125rem', color: '#333' }}>
                      {berryLog.length} / 8 Berryvolutions
                    </div>
                    <div style={{ color: '#666', fontSize: '0.875rem' }}>
                      {party.length} in party
                    </div>
                  </div>
                </div>
                {/* Collection Progress Bar */}
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
                      width: `${(berryLog.length / 8) * 100}%`,
                      backgroundColor: '#4ECDC4',
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
              </Card>
            </div>

            {/* Navigation Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.75rem',
                marginBottom: '0.75rem',
              }}
            >
              <NavCard
                label="Arena"
                icon="⚔️"
                description="Battle & Rankings"
                onClick={() => setScreen({ id: 'team-builder' })}
              />
              <NavCard
                label="Explore"
                icon="🗺️"
                description="Find Berries & Stones"
                onClick={() => setScreen({ id: 'zone-select' })}
              />
              <NavCard
                label="Party"
                icon="🫐"
                description={`${party.length} member${party.length !== 1 ? 's' : ''}`}
                onClick={() => setScreen({ id: 'party' })}
              />
              <NavCard
                label="Berry Log"
                icon="📖"
                description={`${berryLog.length}/8 collected`}
                onClick={() => setScreen({ id: 'berry-log' })}
              />
              <NavCard
                label="Ladder"
                icon="🏆"
                description="Arena Rankings"
                onClick={() => setScreen({ id: 'ladder' })}
              />
              <NavCard
                label="Shop"
                icon="🛒"
                description="Spend Gold Dust"
                onClick={() => setScreen({ id: 'shop' })}
              />
              <NavCard
                label="Settings"
                icon="⚙️"
                description="Save & Options"
                onClick={() => setScreen({ id: 'settings' })}
              />
            </div>

            {/* Footer Row */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button
                variant="secondary"
                size="small"
                onClick={() => exportSave(saveState)}
                style={{ flex: 1 }}
              >
                Export Save
              </Button>
              <Button
                variant="secondary"
                size="small"
                onClick={handleImport}
                style={{ flex: 1 }}
              >
                Import Save
              </Button>
              <Button
                variant="danger"
                size="small"
                onClick={() => setShowNewGameConfirm(true)}
                style={{ flex: 1 }}
              >
                New Game
              </Button>
            </div>

            {importError && (
              <p style={{ color: '#FF6B6B', fontSize: '0.875rem', marginTop: '0.5rem', textAlign: 'center' }}>
                {importError}
              </p>
            )}
          </>
        )}
      </div>

      {/* Victory Banner */}
      {saveState.gameWon && (
        <div
          style={{
            marginTop: '1.5rem',
            padding: '0.75rem 1.5rem',
            backgroundColor: '#FFC107',
            borderRadius: '0.5rem',
            fontWeight: 'bold',
            color: '#333',
            textAlign: 'center',
          }}
        >
          🏆 You collected all 8 Berryvolutions and conquered the Apex Arena!
        </div>
      )}

      {/* New Game Confirmation */}
      {showNewGameConfirm && (
        <ConfirmDialog
          title="Start New Game?"
          message="This will permanently delete your current save. All progress will be lost."
          confirmText="New Game"
          cancelText="Keep Playing"
          isDangerous={true}
          onConfirm={handleConfirmNewGame}
          onCancel={() => setShowNewGameConfirm(false)}
        />
      )}
    </div>
  )
}

// ── Internal NavCard ──────────────────────────────────────────────────────────

interface NavCardProps {
  label: string
  icon: string
  description: string
  onClick: () => void
}

function NavCard({ label, icon, description, onClick }: NavCardProps) {
  return (
    <Card onClick={onClick}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span style={{ fontSize: '1.5rem' }} aria-hidden="true">{icon}</span>
        <div>
          <div style={{ fontWeight: 'bold', fontSize: '1rem', color: '#333' }}>{label}</div>
          <div style={{ fontSize: '0.8rem', color: '#888' }}>{description}</div>
        </div>
      </div>
    </Card>
  )
}
