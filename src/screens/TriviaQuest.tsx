/**
 * TriviaQuest — full-screen wrapper around QuestGate.
 *
 * Used when the quest is navigated to as a Screen (e.g. from the store via
 * setScreen({ id: 'trivia-quest', ... })).  For inline use inside another
 * screen, use the <QuestGate> component directly.
 */
import { useGameStore } from '../store/gameStore'
import { Screen, QuestContext } from '../data/types'
import QuestGate from '../components/QuestGate'

interface TriviaQuestProps {
  questContext: QuestContext
  onPass: Screen
  onFail: Screen
  actionLabel: string
}

export default function TriviaQuest({
  questContext,
  onPass,
  onFail,
  actionLabel,
}: TriviaQuestProps) {
  const setScreen = useGameStore(state => state.setScreen)

  return (
    <QuestGate
      questContext={questContext}
      actionLabel={actionLabel}
      onPass={() => setScreen(onPass)}
      onFail={() => setScreen(onFail)}
      showMainMenuEscape
      onMainMenu={() => setScreen({ id: 'main-menu' })}
    />
  )
}
