import { useState } from 'react'
import { useGameStore } from '../../store/gameStore'
import { Button, Card, StatBar, ConfirmDialog, Sprite } from '../../components'
import type { SpriteAnimState } from '../../components/Sprite'
import { BattleState, CombatantState } from '../../data/types'
import { resolveTurn } from '../../engine/battle'
import { getAIAction } from '../../engine/ai'
import { getUnlockedMoves } from '../../engine/leveling'
import { BERRYVOLUTION_LIST } from '../../data/berryvolutions'
import { berrySkinSprite, BerrySkinId } from '../../data/berryVariants'
import { XP_CONFIG, ARENA_REWARDS } from '../../data/config'
import styles from './BattleScreen.module.css'

export default function BattleScreen() {
  const setBattleState = useGameStore(state => state.setBattleState)
  const setScreen = useGameStore(state => state.setScreen)
  const updateSaveState = useGameStore(state => state.updateSaveState)
  const storeState = useGameStore(state => state)

  const initialBattleState = storeState.battleState
  const [battleState, setBattleStateLocal] = useState<BattleState | null>(initialBattleState)
  const [error, setError] = useState<string | null>(null)
  const [showExitConfirm, setShowExitConfirm] = useState(false)

  // Animation state
  type AnimPhase = 'idle' | 'first-lunge' | 'first-hit' | 'second-lunge' | 'second-hit'
  const [animPhase, setAnimPhase] = useState<AnimPhase>('idle')
  const [animOrder, setAnimOrder] = useState<'player-first' | 'enemy-first'>('player-first')
  const [animKey, setAnimKey] = useState(0) // force re-mount to replay CSS animations

  if (!battleState) {
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
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#333' }}>
              No Battle Active
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#555', margin: '0.5rem 0 1rem' }}>
              Start a new battle from Team Builder.
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

  const playerActive = battleState.playerTeam[battleState.activePlayerIndex]
  const aiActive = battleState.aiTeam[battleState.activeAiIndex]

  if (!playerActive || !aiActive) {
    return (
      <div style={{ padding: '1rem', textAlign: 'center', color: '#d32f2f' }}>
        Error: Invalid battle state
      </div>
    )
  }

  const handleSelectMove = (moveId: string) => {
    const unlockedMoves = getUnlockedMoves(playerActive.partyMember.defId, playerActive.partyMember.level)
    const move = unlockedMoves.find(m => m.id === moveId)
    if (!move) return

    if (playerActive.currentNrg < move.nrgCost) {
      setError('Insufficient NRG')
      return
    }

    executeAction({ type: 'move', value: moveId })
  }

  const handleSelectBasicAttack = () => {
    executeAction({ type: 'basic' })
  }

  const handleSelectSwitch = (switchToIndex: number) => {
    executeAction({ type: 'switch', value: String(switchToIndex) })
  }

  const executeAction = (action: { type: 'move' | 'basic' | 'switch'; value?: string }) => {
    if (animPhase !== 'idle') return // prevent input during animation

    let playerAction: import('../../data/types').BattleAction
    if (action.type === 'basic') {
      playerAction = { type: 'move', moveId: 'basic-attack' }
    } else if (action.type === 'move') {
      playerAction = { type: 'move', moveId: action.value! }
    } else {
      const idx = Number(action.value)
      playerAction = { type: 'switch', toInstanceId: battleState!.playerTeam[idx].partyMember.instanceId }
    }

    const currentBattle = battleState!
    const aiAction = getAIAction(currentBattle)
    const newBattleState = resolveTurn(currentBattle, playerAction, aiAction)

    // Switches have no attack animation — apply immediately
    if (playerAction.type === 'switch' || aiAction.type === 'switch') {
      setBattleStateLocal(newBattleState)
      setBattleState(newBattleState)
      setError(null)
      return
    }

    // Determine who attacks first by comparing effective speed
    const pActive = currentBattle.playerTeam[currentBattle.activePlayerIndex]
    const aActive = currentBattle.aiTeam[currentBattle.activeAiIndex]
    const pSpeed = pActive.partyMember.currentStats.spd * pActive.statModifiers.spd
    const aSpeed = aActive.partyMember.currentStats.spd * aActive.statModifiers.spd
    const order: 'player-first' | 'enemy-first' = pSpeed >= aSpeed ? 'player-first' : 'enemy-first'

    // Intermediate display state: only the first attacker's HP change is applied.
    // This lets the HP bar deduct immediately after that attack, before the second one.
    const intermediateState = JSON.parse(JSON.stringify(currentBattle)) as BattleState
    if (order === 'player-first') {
      intermediateState.aiTeam[currentBattle.activeAiIndex].currentHp =
        newBattleState.aiTeam[newBattleState.activeAiIndex].currentHp
    } else {
      intermediateState.playerTeam[currentBattle.activePlayerIndex].currentHp =
        newBattleState.playerTeam[newBattleState.activePlayerIndex].currentHp
    }

    setAnimOrder(order)
    setAnimKey(k => k + 1)
    setAnimPhase('first-lunge')

    setTimeout(() => {
      setAnimPhase('first-hit')
      setBattleStateLocal(intermediateState) // show first hit's HP change immediately
    }, 450)
    setTimeout(() => setAnimPhase('second-lunge'), 750)
    setTimeout(() => setAnimPhase('second-hit'), 1200)
    setTimeout(() => {
      setAnimPhase('idle')
      setBattleStateLocal(newBattleState)
      setBattleState(newBattleState)
      setError(null)
    }, 1500)
  }

  const alivePlayerTeammates = battleState.playerTeam
    .map((c, i) => ({ combatant: c, index: i }))
    .filter(({ combatant, index }) => index !== battleState.activePlayerIndex && combatant.currentHp > 0)

  const handleFaintReplacement = (newIndex: number) => {
    const updated = { ...battleState, activePlayerIndex: newIndex, phase: 'action-select' as const }
    setBattleStateLocal(updated)
    setBattleState(updated)
    setError(null)
  }

  const handleBattleEnd = () => {
    const isPlayerVictory = battleState.outcome === 'win'
    
    // Calculate XP based on average enemy level — stronger enemies yield more XP
    const avgEnemyLevel =
      battleState.aiTeam.reduce((sum, c) => sum + c.partyMember.level, 0) /
      Math.max(battleState.aiTeam.length, 1)
    const xpBase = Math.max(
      Math.floor(avgEnemyLevel * XP_CONFIG.xpPerEnemyLevel),
      XP_CONFIG.xpBaseMin
    )
    const xpPerMember = xpBase + (isPlayerVictory ? XP_CONFIG.winBonus : 0)

    // Distribute XP to all team members
    const xpEarned: Record<string, number> = {}
    battleState.playerTeam.forEach((combatant) => {
      xpEarned[combatant.partyMember.instanceId] = xpPerMember
    })

    const result = {
      outcome: isPlayerVictory ? ('win' as const) : ('loss' as const),
      xpEarned,
      arenaPointsChange: isPlayerVictory ? ARENA_REWARDS.winArenaPoints : ARENA_REWARDS.lossArenaPoints,
      resourcesEarned: {
        goldDust: isPlayerVictory ? ARENA_REWARDS.winGoldDust : ARENA_REWARDS.lossGoldDust,
        stamina: isPlayerVictory ? ARENA_REWARDS.winStamina : ARENA_REWARDS.lossStamina,
      },
    }
    setScreen({ id: 'post-battle', result })
  }

  const getDefName = (defId: string) => {
    // Handle unevolved Berry
    if (defId === 'berry') return 'Berry'
    
    const def = BERRYVOLUTION_LIST.find(d => d.id === defId) || { id: defId, name: '?' }
    return def.name
  }

  // ── Derive animation props ───────────────────────────────────────────────

  const isAnimating = animPhase !== 'idle'

  const playerLunging =
    (animPhase === 'first-lunge' && animOrder === 'player-first') ||
    (animPhase === 'second-lunge' && animOrder === 'enemy-first')

  const playerHit =
    (animPhase === 'first-hit' && animOrder === 'enemy-first') ||
    (animPhase === 'second-hit' && animOrder === 'player-first')

  const enemyLunging =
    (animPhase === 'first-lunge' && animOrder === 'enemy-first') ||
    (animPhase === 'second-lunge' && animOrder === 'player-first')

  const enemyHit =
    (animPhase === 'first-hit' && animOrder === 'player-first') ||
    (animPhase === 'second-hit' && animOrder === 'enemy-first')

  const playerAnimState: SpriteAnimState = playerHit ? 'attack' : 'idle'
  const enemyAnimState: SpriteAnimState = enemyHit ? 'attack' : 'idle'

  // ── Render Battle ────────────────────────────────────────────────────────

  if (battleState.phase === 'action-select') {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#f0f9f8',
          padding: '1rem',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
            fontSize: '0.875rem',
          }}
        >
          <div style={{ color: '#666' }}>
            Turn {battleState.turn} • {battleState.aiDifficulty}
          </div>
          <Button
            variant="secondary"
            size="small"
            onClick={() => setShowExitConfirm(true)}
          >
            Forfeit
          </Button>
        </div>

        {/* Combatant cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.75rem',
            marginBottom: '1rem',
          }}
        >
          {/* Player active */}
          <Card>
            <div style={{ padding: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
                <div
                  key={`player-${animKey}`}
                  className={playerLunging ? styles.playerLunge : undefined}
                >
                  <Sprite
                    spriteUrl={playerActive.partyMember.defId === 'berry'
                      ? berrySkinSprite(playerActive.partyMember.skinId as BerrySkinId)
                      : `/sprites/${playerActive.partyMember.defId}.svg`}
                    alt={getDefName(playerActive.partyMember.defId)}
                    size="lg"
                    animState={playerAnimState}
                  />
                </div>
              </div>
              <div style={{ fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                {getDefName(playerActive.partyMember.defId)}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '0.25rem' }}>
                Lv {playerActive.partyMember.level}
              </div>
              <StatBar
                current={playerActive.currentHp}
                max={playerActive.partyMember.maxHp}
                label="HP"
              />
              <StatBar
                current={playerActive.currentNrg}
                max={playerActive.partyMember.currentStats.nrg}
                label="NRG"
              />
              {playerActive.status && (
                <div style={{ fontSize: '0.75rem', color: '#d32f2f', marginTop: '0.25rem' }}>
                  {playerActive.status}
                </div>
              )}
            </div>
          </Card>

          {/* AI active */}
          <Card>
            <div style={{ padding: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
                <div
                  key={`enemy-${animKey}`}
                  className={enemyLunging ? styles.enemyLunge : undefined}
                >
                  <Sprite
                    spriteUrl={aiActive.partyMember.defId === 'berry'
                      ? berrySkinSprite(aiActive.partyMember.skinId as BerrySkinId)
                      : `/sprites/${aiActive.partyMember.defId}.svg`}
                    alt={getDefName(aiActive.partyMember.defId)}
                    size="lg"
                    flipped
                    animState={enemyAnimState}
                  />
                </div>
              </div>
              <div style={{ fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                {getDefName(aiActive.partyMember.defId)}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '0.25rem' }}>
                Lv {aiActive.partyMember.level}
              </div>
              <StatBar
                current={aiActive.currentHp}
                max={aiActive.partyMember.maxHp}
                label="HP"
              />
              <StatBar
                current={aiActive.currentNrg}
                max={aiActive.partyMember.currentStats.nrg}
                label="NRG"
              />
              {aiActive.status && (
                <div style={{ fontSize: '0.75rem', color: '#d32f2f', marginTop: '0.25rem' }}>
                  {aiActive.status}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Move selection */}
        <Card style={{ marginBottom: '1rem', opacity: isAnimating ? 0.5 : 1 }}>
          <div style={{ padding: '0.75rem' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              {isAnimating ? '...' : 'Choose Action'}
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.5rem',
                marginBottom: '0.5rem',
              }}
            >
              {getUnlockedMoves(playerActive.partyMember.defId, playerActive.partyMember.level).map(move => (
                <button
                  key={move.id}
                  onClick={() => handleSelectMove(move.id)}
                  disabled={isAnimating || playerActive.currentNrg < move.nrgCost}
                  style={{
                    padding: '0.5rem',
                    fontSize: '0.75rem',
                    borderRadius: '0.25rem',
                    border: '1px solid #e0e0e0',
                    backgroundColor: '#fff',
                    cursor: (isAnimating || playerActive.currentNrg < move.nrgCost) ? 'not-allowed' : 'pointer',
                    opacity: (isAnimating || playerActive.currentNrg < move.nrgCost) ? 0.5 : 1,
                  }}
                >
                  {move.name} ({move.nrgCost} NRG)
                </button>
              ))}
            </div>
            <button
              onClick={handleSelectBasicAttack}
              disabled={isAnimating}
              style={{
                width: '100%',
                padding: '0.5rem',
                fontSize: '0.75rem',
                borderRadius: '0.25rem',
                border: '1px solid #e0e0e0',
                backgroundColor: '#fff',
                cursor: isAnimating ? 'not-allowed' : 'pointer',
                opacity: isAnimating ? 0.5 : 1,
              }}
            >
              Basic Attack (0 NRG)
            </button>
          </div>
        </Card>

        {/* Switch buttons */}
        {alivePlayerTeammates.length > 0 && (
          <Card style={{ marginBottom: '1rem' }}>
            <div style={{ padding: '0.75rem' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                Switch
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.5rem',
                }}
              >
                {alivePlayerTeammates.map(({ combatant, index }) => (
                  <button
                    key={index}
                    onClick={() => handleSelectSwitch(index)}
                    disabled={isAnimating}
                    style={{
                      padding: '0.5rem',
                      fontSize: '0.75rem',
                      borderRadius: '0.25rem',
                      border: '1px solid #e0e0e0',
                      backgroundColor: '#fff',
                      cursor: isAnimating ? 'not-allowed' : 'pointer',
                      opacity: isAnimating ? 0.5 : 1,
                    }}
                  >
                    {getDefName(combatant.partyMember.defId)} Lv{combatant.partyMember.level}
                  </button>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Error message */}
        {error && (
          <div
            style={{
              backgroundColor: '#ffebee',
              border: '1px solid #ff6b6b',
              borderRadius: '0.25rem',
              padding: '0.5rem',
              marginBottom: '1rem',
              color: '#d32f2f',
              fontSize: '0.75rem',
              textAlign: 'center',
            }}
          >
            {error}
          </div>
        )}

        {/* Turn log */}
        <Card>
          <div style={{ padding: '0.75rem' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              Battle Log
            </div>
            <div
              style={{
                maxHeight: '150px',
                overflowY: 'auto',
                fontSize: '0.75rem',
                color: '#555',
                lineHeight: '1.4',
              }}
            >
              {battleState.log.slice(-10).map((msg, i) => (
                <div key={i}>{msg}</div>
              ))}
            </div>
          </div>
        </Card>

        {showExitConfirm && (
          <ConfirmDialog
            title="Forfeit Battle?"
            description="Are you sure? You will lose this match."
            dangerous
            onConfirm={() => {
              setBattleState(null)
              setScreen({ id: 'main-menu' })
            }}
            onCancel={() => setShowExitConfirm(false)}
          />
        )}
      </div>
    )
  }

  if (battleState.phase === 'post-faint') {
    const playerHasAlive = battleState.playerTeam.some(c => c.currentHp > 0)
    const aiHasAlive = battleState.aiTeam.some(c => c.currentHp > 0)

    if (!playerHasAlive) {
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
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#d32f2f' }}>
                You Lost
              </h2>
              <p style={{ fontSize: '0.875rem', color: '#555', margin: '0.5rem 0 1rem' }}>
                All your Berryvolutions have fainted.
              </p>
              <Button
                variant="primary"
                size="medium"
                onClick={handleBattleEnd}
                style={{ width: '100%' }}
              >
                Back to Main Menu
              </Button>
            </div>
          </Card>
        </div>
      )
    }

    const aliveForSwitch = battleState.playerTeam
      .map((c, i) => ({ combatant: c, index: i }))
      .filter(({ combatant, index }) => index !== battleState.activePlayerIndex && combatant.currentHp > 0)

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
          <div style={{ padding: '1rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#333', margin: '0 0 1rem 0' }}>
              Select Replacement
            </h2>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              {aliveForSwitch.map(({ combatant, index }) => (
                <Button
                  key={index}
                  variant="secondary"
                  size="medium"
                  onClick={() => handleFaintReplacement(index)}
                  style={{ width: '100%' }}
                >
                  {getDefName(combatant.partyMember.defId)} Lv{combatant.partyMember.level}
                </Button>
              ))}
            </div>
          </div>
        </Card>
      </div>
    )
  }

  if (battleState.phase === 'ended') {
    const isVictory = battleState.outcome === 'win'
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
            <h2
              style={{
                fontSize: '1.25rem',
                fontWeight: 'bold',
                color: isVictory ? '#2d8b85' : '#d32f2f',
              }}
            >
              {isVictory ? 'You Won!' : 'Battle Over'}
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#555', margin: '0.5rem 0 1rem' }}>
              {isVictory
                ? 'Great job! You gained 10 Arena Points.'
                : 'You lost this match.'}
            </p>
            <Button
              variant="primary"
              size="medium"
              onClick={handleBattleEnd}
              style={{ width: '100%' }}
            >
              Continue
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return <div style={{ padding: '1rem', color: '#d32f2f' }}>Unknown phase: {battleState.phase}</div>
}
