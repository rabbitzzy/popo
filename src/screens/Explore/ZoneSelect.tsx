import { useState } from 'react'
import { useGameStore, useInventory } from '../../store/gameStore'
import { Button, Card, GameMap } from '../../components'
import { ZONE_LIST } from '../../data/zones'
import { searchZone, spawnWildBerry } from '../../engine/exploration'
import { ZoneDef } from '../../data/types'

export default function ZoneSelect() {
  const setScreen = useGameStore(state => state.setScreen)
  const updateSaveState = useGameStore(state => state.updateSaveState)
  const saveGame = useGameStore(state => state.saveGame)
  const inventory = useInventory()

  const [searching, setSearching] = useState(false)
  const [lastResult, setLastResult] = useState<{ zone: ZoneDef; result: string } | null>(null)

  const handleSearch = (zone: ZoneDef) => {
    if (inventory.stamina < 1) {
      alert('Not enough stamina! Win battles to restore it.')
      return
    }

    setSearching(true)

    // Perform search
    const searchResult = searchZone(zone)

    // Consume stamina
    const newStamina = inventory.stamina - 1
    updateSaveState({ inventory: { ...inventory, stamina: newStamina } })
    saveGame()

    // Handle result
    if (searchResult.type === 'encounter') {
      const wildBerry = spawnWildBerry(zone)
      setScreen({ id: 'encounter', zone, wildBerry })
    } else if (searchResult.type === 'stone') {
      const stoneCount = (inventory.evolutionStones[searchResult.stone] ?? 0) + 1
      const newStones = { ...inventory.evolutionStones, [searchResult.stone]: stoneCount }
      updateSaveState({ inventory: { ...inventory, stamina: newStamina, evolutionStones: newStones } })
      saveGame()
      setLastResult({ zone, result: `Found ${searchResult.stone}!` })
    } else if (searchResult.type === 'gold') {
      const newGold = inventory.goldDust + searchResult.amount
      updateSaveState({ inventory: { ...inventory, stamina: newStamina, goldDust: newGold } })
      saveGame()
      setLastResult({ zone, result: `Found ${searchResult.amount} Gold Dust!` })
    } else {
      setLastResult({ zone, result: 'Found nothing.' })
    }

    setSearching(false)
  }

  if (lastResult) {
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
              {lastResult.zone.name}
            </h2>
            <p style={{ fontSize: '1.125rem', color: '#555', margin: '0 0 1rem 0' }}>
              {lastResult.result}
            </p>
            <Button
              variant="primary"
              size="medium"
              onClick={() => setLastResult(null)}
              style={{ width: '100%' }}
            >
              Search Again
            </Button>
            <Button
              variant="secondary"
              size="medium"
              onClick={() => setScreen({ id: 'main-menu' })}
              style={{ width: '100%', marginTop: '0.5rem' }}
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
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '0.75rem',
          flexShrink: 0,
        }}
      >
        <Button variant="secondary" size="small" onClick={() => setScreen({ id: 'main-menu' })}>
          ← Back
        </Button>
        <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold', color: '#2d8b85' }}>
          Explore
        </h1>
      </div>

      {/* Stamina bar */}
      <div
        style={{
          backgroundColor: '#fff',
          border: '1px solid #e0e0e0',
          borderRadius: '0.5rem',
          padding: '0.6rem 0.875rem',
          marginBottom: '0.75rem',
          fontSize: '0.8125rem',
          flexShrink: 0,
        }}
      >
        <span style={{ color: '#666' }}>Stamina: </span>
        <strong>{inventory.stamina}</strong>
        <span style={{ color: '#777' }}> / ∞</span>
      </div>

      {/* Game Map - fills remaining space */}
      <div style={{ flex: 1, minHeight: 0 }}>
        <GameMap zones={ZONE_LIST} onZoneClick={handleSearch} />
      </div>
    </div>
  )
}
