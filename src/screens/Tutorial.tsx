import { useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { Button, Card } from '../components'

interface TutorialStep {
  icon: string
  title: string
  body: string
}

const STEPS: TutorialStep[] = [
  {
    icon: '🐱',
    title: 'Meet Berry',
    body: "This is Berry — your unevolved companion. Berry can't evolve on its own, but with the right Evolution Stones it can transform into one of 8 powerful Berryvolutions.",
  },
  {
    icon: '🗺️',
    title: 'Explore Zones',
    body: 'Head to the Explore menu to search zones. Each search costs 1 Stamina. You might find Evolution Stones, Gold Dust, or even wild Berryvolutions to add to your party!',
  },
  {
    icon: '✨',
    title: 'Evolve Berry',
    body: 'Use Evolution Stones from the Party screen to evolve Berry. Each Berryvolution has a unique element type, stats, and special trait. Collect all 8!',
  },
  {
    icon: '⚔️',
    title: 'Battle the Arena',
    body: 'Build a team in the Team Builder and challenge the Arena. Win battles to earn Arena Points and climb from Bronze through Silver, Gold, Crystal, and Apex tiers.',
  },
  {
    icon: '🏆',
    title: 'The Goal',
    body: 'Collect all 8 Berryvolutions and conquer the Apex Arena to win! Check the Berry Log to track your collection. Good luck, trainer!',
  },
]

export default function Tutorial() {
  const [step, setStep] = useState(0)
  const updateSaveState = useGameStore(state => state.updateSaveState)
  const setScreen = useGameStore(state => state.setScreen)
  const saveGame = useGameStore(state => state.saveGame)

  const isLast = step === STEPS.length - 1
  const current = STEPS[step]

  const handleNext = () => {
    if (isLast) {
      completeTutorial()
    } else {
      setStep(s => s + 1)
    }
  }

  const completeTutorial = () => {
    updateSaveState({ tutorialComplete: true })
    saveGame()
    setScreen({ id: 'main-menu' })
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
      <div style={{ width: '100%', maxWidth: '480px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2d8b85', margin: 0 }}>
            How to Play
          </h2>
        </div>

        {/* Step Card */}
        <Card>
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }} aria-hidden="true">
              {current.icon}
            </div>
            <h3
              style={{
                fontSize: '1.25rem',
                fontWeight: 'bold',
                color: '#333',
                margin: '0 0 1rem 0',
              }}
            >
              {current.title}
            </h3>
            <p
              style={{
                color: '#555',
                fontSize: '1rem',
                lineHeight: '1.6',
                margin: '0 0 1.5rem 0',
              }}
            >
              {current.body}
            </p>

            {/* Progress dots */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '0.5rem',
                marginBottom: '1.5rem',
              }}
            >
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: '0.5rem',
                    height: '0.5rem',
                    borderRadius: '50%',
                    backgroundColor: i === step ? '#2d8b85' : '#d0d0d0',
                    transition: 'background-color 0.2s',
                  }}
                />
              ))}
            </div>

            <Button
              variant="primary"
              size="large"
              onClick={handleNext}
              style={{ width: '100%', marginBottom: '0.75rem' }}
            >
              {isLast ? "Let's Go!" : 'Next'}
            </Button>

            {!isLast && (
              <Button
                variant="secondary"
                size="small"
                onClick={completeTutorial}
                style={{ width: '100%' }}
              >
                Skip Tutorial
              </Button>
            )}
          </div>
        </Card>

        {/* Step counter */}
        <p
          style={{
            textAlign: 'center',
            color: '#888',
            fontSize: '0.875rem',
            marginTop: '1rem',
          }}
        >
          {step + 1} / {STEPS.length}
        </p>
      </div>
    </div>
  )
}
