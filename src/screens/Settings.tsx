import { useRef, useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { Button, Card, ConfirmDialog } from '../components'

export default function Settings() {
  const setScreen = useGameStore(state => state.setScreen)
  const clearGame = useGameStore(state => state.clearGame)
  const saveGame = useGameStore(state => state.saveGame)
  const loadGame = useGameStore(state => state.loadGame)
  const saveState = useGameStore(state => state.saveState)

  const [muted, setMuted] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = () => {
    try {
      // Save current state
      saveGame()

      // Get the saved state from localStorage
      const saved = localStorage.getItem('popo_save')
      if (!saved) {
        setImportError('No save data to export')
        return
      }

      // Create blob and download
      const blob = new Blob([saved], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `popo-save-${Date.now()}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      setImportError(null)
    } catch (err) {
      setImportError('Failed to export save')
    }
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string
          const parsed = JSON.parse(content)

          // Validate that it has the expected structure
          if (!parsed.version || parsed.party === undefined || parsed.inventory === undefined) {
            setImportError('Invalid save file format')
            return
          }

          // Load into localStorage and update store
          localStorage.setItem('popo_save', JSON.stringify(parsed))
          loadGame()
          setImportError(null)
        } catch (err) {
          setImportError('Failed to parse save file')
        }
      }
      reader.readAsText(file)
    } catch (err) {
      setImportError('Failed to read file')
    }
  }

  const handleReset = () => {
    clearGame()
    setShowResetConfirm(false)
    setScreen({ id: 'main-menu' })
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
          marginBottom: '1.5rem',
        }}
      >
        <Button variant="secondary" size="small" onClick={() => setScreen({ id: 'main-menu' })}>
          ← Back
        </Button>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: '#2d8b85' }}>
          Settings
        </h1>
      </div>

      {/* Settings cards */}
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        {/* Audio toggle */}
        <Card style={{ marginBottom: '1rem' }}>
          <div
            style={{
              padding: '1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#333', marginBottom: '0.25rem' }}>
                Audio
              </div>
              <div style={{ fontSize: '0.875rem', color: '#666' }}>
                Toggle sound effects and music (placeholder)
              </div>
            </div>
            <Button
              variant={muted ? 'secondary' : 'primary'}
              size="small"
              onClick={() => setMuted(!muted)}
            >
              {muted ? '🔇 Muted' : '🔊 On'}
            </Button>
          </div>
        </Card>

        {/* Export save */}
        <Card style={{ marginBottom: '1rem' }}>
          <div
            style={{
              padding: '1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#333', marginBottom: '0.25rem' }}>
                Export Save
              </div>
              <div style={{ fontSize: '0.875rem', color: '#666' }}>
                Download your game progress as JSON
              </div>
            </div>
            <Button variant="primary" size="small" onClick={handleExport}>
              Download
            </Button>
          </div>
        </Card>

        {/* Import save */}
        <Card style={{ marginBottom: '1rem' }}>
          <div
            style={{
              padding: '1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#333', marginBottom: '0.25rem' }}>
                Import Save
              </div>
              <div style={{ fontSize: '0.875rem', color: '#666' }}>
                Load a previously exported save file
              </div>
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                style={{ display: 'none' }}
              />
              <Button
                variant="primary"
                size="small"
                onClick={() => fileInputRef.current?.click()}
              >
                Upload
              </Button>
            </div>
          </div>
        </Card>

        {/* Reset save */}
        <Card style={{ marginBottom: '1rem' }}>
          <div
            style={{
              padding: '1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#d32f2f', marginBottom: '0.25rem' }}>
                Reset Save
              </div>
              <div style={{ fontSize: '0.875rem', color: '#666' }}>
                Permanently delete all progress and start over
              </div>
            </div>
            <Button variant="secondary" size="small" onClick={() => setShowResetConfirm(true)}>
              Reset
            </Button>
          </div>
        </Card>

        {/* Error message */}
        {importError && (
          <div
            style={{
              backgroundColor: '#ffebee',
              border: '1px solid #ff6b6b',
              borderRadius: '0.5rem',
              padding: '0.75rem 1rem',
              color: '#d32f2f',
              fontSize: '0.875rem',
              textAlign: 'center',
              marginTop: '1rem',
            }}
          >
            {importError}
          </div>
        )}
      </div>

      {/* Reset confirmation dialog */}
      {showResetConfirm && (
        <ConfirmDialog
          title="Reset Save?"
          description="All progress will be permanently deleted. You will be returned to the main menu."
          onConfirm={handleReset}
          onCancel={() => setShowResetConfirm(false)}
          dangerous
        />
      )}
    </div>
  )
}
