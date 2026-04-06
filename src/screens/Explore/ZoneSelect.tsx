import { useState } from 'react'
import { useGameStore, useInventory } from '../../store/gameStore'
import { Button, Card, GameMap } from '../../components'
import QuestGate from '../../components/QuestGate'
import { ZONE_LIST } from '../../data/zones'
import { searchZone, spawnWildBerry } from '../../engine/exploration'
import { ZoneDef, EvolutionStone, LocationId, ZoneId, QuestContext } from '../../data/types'
import { getAdjacentZoneIds, HOME_LOCATION } from '../../data/mapGraph'
import { QUEST_CONFIG } from '../../data/questConfig'

// Map stone names to their sprite URLs
const STONE_SPRITES: Record<EvolutionStone, string> = {
  'Water Stone':    '/sprites/stone-water.svg',
  'Thunder Stone':  '/sprites/stone-thunder.svg',
  'Fire Stone':     '/sprites/stone-fire.svg',
  'Sun Shard':      '/sprites/stone-sun.svg',
  'Moon Shard':     '/sprites/stone-moon.svg',
  'Leaf Stone':     '/sprites/stone-leaf.svg',
  'Ice Stone':      '/sprites/stone-ice.svg',
  'Ribbon Shard':   '/sprites/stone-ribbon.svg',
}

type FindableItem = EvolutionStone | 'gold'

interface FindableResult {
  zone: ZoneDef
  result: string
  item?: FindableItem
}

export default function ZoneSelect() {
  const setScreen        = useGameStore(state => state.setScreen)
  const updateSaveState  = useGameStore(state => state.updateSaveState)
  const saveGame         = useGameStore(state => state.saveGame)
  const inventory        = useInventory()
  const saveState        = useGameStore(state => state.saveState)
  const currentLocation  = saveState.currentLocation
  const zoneLastExplored = saveState.zoneLastExploredAt ?? {}

  const [searching, setSearching]   = useState(false)
  const [lastResult, setLastResult] = useState<FindableResult | null>(null)

  // Quest gate: when set, an inline QuestGate overlay is shown
  const [pendingQuest, setPendingQuest] = useState<{
    context: QuestContext
    actionLabel: string
    onPass: () => void
  } | null>(null)

  /** Gate `action` behind a quest when `enabled`; otherwise run it immediately. */
  function withQuest(enabled: boolean, context: QuestContext, label: string, action: () => void) {
    if (enabled) {
      setPendingQuest({ context, actionLabel: label, onPass: action })
    } else {
      action()
    }
  }

  const reachableIds = getAdjacentZoneIds(currentLocation)

  // ── Cooldown helpers ────────────────────────────────────────────────────────

  /** Returns the timestamp (ms) when the zone's cooldown expires, or 0 if ready. */
  function cooldownExpiresAt(zone: ZoneDef): number {
    const last = zoneLastExplored[zone.id as ZoneId]
    if (!last) return 0
    return last + zone.exploreCooldownMs
  }

  /** Builds a Record<zoneId, expiryTimestamp> for zones still on cooldown. */
  function buildCooldownMap(): Record<string, number> {
    const now = Date.now()
    const map: Record<string, number> = {}
    for (const zone of ZONE_LIST) {
      const expires = cooldownExpiresAt(zone)
      if (expires > now) map[zone.id] = expires
    }
    return map
  }

  // ── Travel ──────────────────────────────────────────────────────────────────

  const doTravel = (locationId: string) => {
    if (locationId === HOME_LOCATION) {
      // Arriving home heals the whole party to full HP and NRG.
      const healedParty = saveState.party.map(m => ({
        ...m,
        currentHp:  m.maxHp,
        currentNrg: m.currentStats.nrg,
      }))
      updateSaveState({ currentLocation: locationId as LocationId, party: healedParty })
    } else {
      updateSaveState({ currentLocation: locationId as LocationId })
    }
    saveGame()
  }

  const handleTravel = (locationId: string) => {
    // Travelling home is never gated (it's a heal action, not an exploration risk)
    if (locationId === HOME_LOCATION) { doTravel(locationId); return }
    const dest = ZONE_LIST.find(z => z.id === locationId)
    withQuest(
      Math.random() < QUEST_CONFIG.gateTravel && dest !== undefined,
      'explore',
      `Before you travel to ${dest?.name ?? locationId}…`,
      () => doTravel(locationId),
    )
  }

  // ── Search ──────────────────────────────────────────────────────────────────

  const handleSearch = (zone: ZoneDef) => {
    if (inventory.stamina < 1) {
      alert('Not enough stamina! Win battles to restore it.')
      return
    }
    withQuest(
      Math.random() < QUEST_CONFIG.gateExplore,
      'explore',
      `Before you search ${zone.name}…`,
      () => doSearch(zone),
    )
  }

  const doSearch = (zone: ZoneDef) => {
    // Cooldown guard — GameMap also hides the button, but double-check here.
    const expires = cooldownExpiresAt(zone)
    if (expires > Date.now()) return

    setSearching(true)

    const searchResult = searchZone(zone)

    // Consume stamina + record exploration timestamp
    const newStamina = inventory.stamina - 1
    const newExplored: Partial<Record<ZoneId, number>> = {
      ...zoneLastExplored,
      [zone.id]: Date.now(),
    }
    updateSaveState({
      inventory: { ...inventory, stamina: newStamina },
      zoneLastExploredAt: newExplored,
    })
    saveGame()

    if (searchResult.type === 'encounter') {
      const wildBerry = spawnWildBerry(zone)
      setScreen({ id: 'encounter', zone, wildBerry })
    } else if (searchResult.type === 'stone') {
      const stoneCount = (inventory.evolutionStones[searchResult.stone] ?? 0) + 1
      const newStones  = { ...inventory.evolutionStones, [searchResult.stone]: stoneCount }
      updateSaveState({ inventory: { ...inventory, stamina: newStamina, evolutionStones: newStones } })
      saveGame()
      setLastResult({ zone, result: `Found ${searchResult.stone}!`, item: searchResult.stone })
    } else if (searchResult.type === 'gold') {
      const newGold = inventory.goldDust + searchResult.amount
      updateSaveState({ inventory: { ...inventory, stamina: newStamina, goldDust: newGold } })
      saveGame()
      setLastResult({ zone, result: `Found ${searchResult.amount} Gold Dust!`, item: 'gold' })
    } else {
      setLastResult({ zone, result: 'Found nothing.' })
    }

    setSearching(false)
  }

  // ── Result card ─────────────────────────────────────────────────────────────

  if (lastResult) {
    const itemImage = !lastResult.item
      ? null
      : lastResult.item === 'gold'
        ? '/sprites/coin.svg'
        : STONE_SPRITES[lastResult.item]

    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f0f9f8', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Card>
          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#333', margin: '0 0 0.5rem 0' }}>
              {lastResult.zone.name}
            </h2>
            {itemImage && (
              <div style={{ margin: '1rem 0' }}>
                <img src={itemImage} alt={lastResult.item} style={{ width: '64px', height: '64px' }} />
              </div>
            )}
            <p style={{ fontSize: '1.125rem', color: '#555', margin: '0 0 1rem 0' }}>
              {lastResult.result}
            </p>
            <Button variant="primary" size="medium" onClick={() => setLastResult(null)} style={{ width: '100%' }}>
              Back to Map
            </Button>
            <Button variant="secondary" size="medium" onClick={() => setScreen({ id: 'main-menu' })} style={{ width: '100%', marginTop: '0.5rem' }}>
              Back to Hub
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  // ── Main map view ───────────────────────────────────────────────────────────

  return (
    <div style={{ height: '100dvh', backgroundColor: '#f0f9f8', padding: '1rem', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', flexShrink: 0 }}>
        <Button variant="secondary" size="small" onClick={() => setScreen({ id: 'main-menu' })}>
          ← Back
        </Button>
        <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold', color: '#2d8b85' }}>
          Explore
        </h1>
      </div>

      {/* Stamina bar */}
      <div style={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '0.5rem', padding: '0.6rem 0.875rem', marginBottom: '0.75rem', fontSize: '0.8125rem', flexShrink: 0 }}>
        <span style={{ color: '#666' }}>Stamina: </span>
        <strong>{inventory.stamina}</strong>
        <span style={{ color: '#777' }}> / ∞</span>
        {searching && <span style={{ color: '#aaa', marginLeft: '0.5rem' }}>Searching…</span>}
      </div>

      {/* Game Map */}
      <div style={{ flex: 1, minHeight: 0 }}>
        <GameMap
          zones={ZONE_LIST}
          currentLocationId={currentLocation}
          reachableIds={reachableIds}
          cooldownUntil={buildCooldownMap()}
          onSearch={handleSearch}
          onTravel={handleTravel}
        />
      </div>

      {/* Quest gate overlay */}
      {pendingQuest && (
        <QuestGate
          questContext={pendingQuest.context}
          actionLabel={pendingQuest.actionLabel}
          onPass={() => { setPendingQuest(null); pendingQuest.onPass() }}
          onFail={() => setPendingQuest(null)}
        />
      )}
    </div>
  )
}
