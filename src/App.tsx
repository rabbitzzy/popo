import { useEffect } from 'react'
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

function App() {
  const screen = useGameStore(state => state.screen)
  const initGame = useGameStore(state => state.initGame)

  useEffect(() => {
    initDebug()
    initGame()
  }, [initGame])

  switch (screen.id) {
    case 'main-menu':
      return <MainMenu />
    case 'tutorial':
      return <Tutorial />
    case 'party':
      return <PartyScreen />
    case 'berryvolution-detail':
      return <BerryvolutionDetail instanceId={screen.instanceId} />
    case 'berry-log':
      return <BerryLog />
    case 'zone-select':
      return <ZoneSelect />
    case 'encounter':
      return <EncounterScreen zone={screen.zone} wildBerry={screen.wildBerry} />
    case 'team-builder':
      return <TeamBuilder />
    case 'battle':
      return <BattleScreen />
    case 'post-battle':
      return <PostBattle result={screen.result} />
    case 'ladder':
      return <ArenaLadder />
    case 'shop':
      return <Shop />
    case 'settings':
      return <Settings />
    case 'victory':
      return <MainMenu />
    default:
      return <MainMenu />
  }
}

export default App
