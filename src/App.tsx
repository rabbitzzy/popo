import React, { useEffect } from 'react'
import { Analytics } from '@vercel/analytics/react'
import { useGameStore } from './store/gameStore'
import { initDebug } from './debug'
import MainMenu from './screens/MainMenu'
import Tutorial from './screens/Tutorial'
import PartyScreen from './screens/Party/PartyScreen'
import BerryvolutionDetail from './screens/Party/BerryvolutionDetail'
import BerryLog from './screens/BerryLog'
import ZoneSelect from './screens/Explore/ZoneSelect'
import EncounterScreen from './screens/Explore/EncounterScreen'
import TeamBuilder from './screens/Arena/TeamBuilder'
import BattleScreen from './screens/Arena/BattleScreen'
import PostBattle from './screens/Arena/PostBattle'
import ArenaLadder from './screens/Arena/ArenaLadder'
import Shop from './screens/Shop'
import Settings from './screens/Settings'
import TriviaQuest from './screens/TriviaQuest'

function App() {
  const screen = useGameStore(state => state.screen)
  const initGame = useGameStore(state => state.initGame)

  useEffect(() => {
    initDebug()
    initGame()
  }, [initGame])

  let content: React.ReactElement
  switch (screen.id) {
    case 'main-menu':
      content = <MainMenu />; break
    case 'tutorial':
      content = <Tutorial />; break
    case 'party':
      content = <PartyScreen />; break
    case 'berryvolution-detail':
      content = <BerryvolutionDetail instanceId={screen.instanceId} />; break
    case 'berry-log':
      content = <BerryLog />; break
    case 'zone-select':
      content = <ZoneSelect />; break
    case 'encounter':
      content = <EncounterScreen zone={screen.zone} wildBerry={screen.wildBerry} />; break
    case 'team-builder':
      content = <TeamBuilder />; break
    case 'battle':
      content = <BattleScreen />; break
    case 'post-battle':
      content = <PostBattle result={screen.result} />; break
    case 'ladder':
      content = <ArenaLadder />; break
    case 'shop':
      content = <Shop />; break
    case 'settings':
      content = <Settings />; break
    case 'trivia-quest':
      content = (
        <TriviaQuest
          questContext={screen.questContext}
          onPass={screen.onPass}
          onFail={screen.onFail}
          actionLabel={screen.actionLabel}
        />
      ); break
    case 'victory':
    default:
      content = <MainMenu />
  }
  return <>{content}<Analytics /></>
}

export default App
